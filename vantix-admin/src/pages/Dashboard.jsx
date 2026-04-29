import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import api from "../utils/api";

function Sparkline({ points = [] }) {
  const d = useMemo(() => {
    if (!points.length) return "";
    const max = Math.max(...points);
    const min = Math.min(...points);
    const range = Math.max(1, max - min);
    const w = 140;
    const h = 44;
    return points
      .map((p, i) => {
        const x = (i / (points.length - 1 || 1)) * w;
        const y = h - ((p - min) / range) * h;
        return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(" ");
  }, [points]);

  return (
    <svg width="140" height="44" viewBox="0 0 140 44">
      <path d={d} stroke="rgba(37,230,217,.95)" strokeWidth="2.2" fill="none" />
      <path d={d} stroke="rgba(124,243,255,.35)" strokeWidth="6" fill="none" />
    </svg>
  );
}

const Dashboard = () => {
  const [totalLeaks, setTotalLeaks] = useState(0);
  const [topUsers, setTopUsers] = useState([]);
  const [recentViolations, setRecentViolations] = useState([]);
  const [teamActivity, setTeamActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");
  const [filterType, setFilterType] = useState("");
  const [violationTypes, setViolationTypes] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/login");
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const leaksRes = await api.get('/analytics/total-leaks');
        if (leaksRes.data.success) setTotalLeaks(leaksRes.data.count);

        const usersRes = await api.get('/analytics/top-users');
        if (usersRes.data.success) setTopUsers(usersRes.data.topUsers);

        const params = new URLSearchParams();
        params.set("limit", "10");
        if (filterFrom) params.set("from", filterFrom);
        if (filterTo) params.set("to", filterTo);
        if (filterType) params.set("type", filterType);

        const recentRes = await api.get(`/violations?${params.toString()}`);
        if (recentRes.data.success) setRecentViolations(recentRes.data.violations);

        const teamRes = await api.get('/activity/team');
        if (teamRes.data.success) setTeamActivity(teamRes.data.team);

        const statsRes = await api.get('/violations/stats');
        if (statsRes.data.success) {
          const types = Object.keys(statsRes.data.stats).filter(k => k !== "total" && k !== "totalEvents");
          setViolationTypes(types);
        }
      } catch (err) {
        console.error("Dashboard error", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [filterFrom, filterTo, filterType]);

  const spark = useMemo(() => {
    const seed = (totalLeaks || 7) + (topUsers?.length || 0) * 11 + (recentViolations?.length || 0) * 3;
    const pts = [];
    for (let i = 0; i < 14; i++) {
      const n = Math.sin((i + 1) * 0.85 + seed) * 0.5 + 0.5;
      pts.push(Math.round(20 + n * 80));
    }
    return pts;
  }, [totalLeaks, topUsers, recentViolations]);

  const clearFilters = () => {
    setFilterFrom("");
    setFilterTo("");
    setFilterType("");
  };

  const hasFilters = filterFrom || filterTo || filterType;

  const inputStyle = {
    padding: "6px 10px",
    fontSize: 12,
    background: "var(--input-inline-bg)",
    border: "1px solid var(--input-inline-border)",
    borderRadius: 6,
    color: "var(--input-inline-color)",
    outline: "none",
  };

  return (
    <div className="grid" style={{ gap: 14 }}>
      <div className="grid grid--3">
        <section className="card">
          <div className="card__head">
            <p className="card__title">Leaks prevented</p>
          </div>
          <div className="card__body metric">
            <div>
              <div className="value">{loading ? "—" : totalLeaks}</div>
              <div className="hint">Policy enforcement across all monitored endpoints</div>
            </div>
            <Sparkline points={spark} />
          </div>
        </section>

        <section className="card">
          <div className="card__head">
            <p className="card__title">Recent incidents</p>
          </div>
          <div className="card__body">
            <div className="metric" style={{ alignItems: "center", marginTop: 4 }}>
              <div>
                <div className="value">{loading ? "—" : recentViolations.length}</div>
                <div className="hint">Latest events from the violations stream</div>
              </div>
              <div className="badge badge--active">Live</div>
            </div>
          </div>
        </section>

        <section className="card">
          <div className="card__head">
            <p className="card__title">Employee Status</p>
          </div>
          <div className="card__body">
            <div className="metric" style={{ alignItems: "center", marginTop: 4 }}>
              <div>
                <div className="value">{loading ? "—" : `${teamActivity.filter(e => e.status === "active").length} / ${teamActivity.length}`}</div>
                <div className="hint">Active employees currently monitored</div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="grid grid--2">
        <section className="card">
          <div className="card__head">
            <p className="card__title">Top offenders</p>
          </div>
          <div className="card__body">
            <table className="table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Violations</th>
                </tr>
              </thead>
              <tbody>
                {topUsers.map((user, idx) => (
                  <tr key={idx}>
                    <td>{user.email}</td>
                    <td>{user.violationCount}</td>
                  </tr>
                ))}
                {topUsers.length === 0 && (
                  <tr>
                    <td colSpan={2} style={{ textAlign: "center", padding: "40px 0", color: "var(--empty-state-text)" }}>
                      No user data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="card">
          <div className="card__head">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
              <p className="card__title">Recent violations</p>
              {hasFilters && (
                <button className="btn" onClick={clearFilters}>
                  Clear filters
                </button>
              )}
            </div>
          </div>
          <div className="card__body">
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12, alignItems: "center" }}>
              <input type="date" value={filterFrom} onChange={(e) => setFilterFrom(e.target.value)} style={inputStyle} />
              <span>to</span>
              <input type="date" value={filterTo} onChange={(e) => setFilterTo(e.target.value)} style={inputStyle} />
              <select value={filterType} onChange={(e) => setFilterType(e.target.value)} style={inputStyle}>
                <option value="">All types</option>
                {violationTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>URL</th>
                  <th>Types</th>
                </tr>
              </thead>
              <tbody>
                {recentViolations.map((v, idx) => (
                  <tr key={idx}>
                    <td>{new Date(v.timestamp).toLocaleString()}</td>
                    <td>{v.url}</td>
                    <td>{(v.matches || []).map((m) => m.type).join(", ")}</td>
                  </tr>
                ))}
                {recentViolations.length === 0 && (
                  <tr>
                    <td colSpan={3} style={{ textAlign: "center", padding: "40px 0" }}>
                      No violations found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;