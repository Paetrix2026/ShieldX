import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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

  const areaD = useMemo(() => {
    if (!d) return "";
    return `${d} L 140 44 L 0 44 Z`;
  }, [d]);

  return (
    <svg width="140" height="44" viewBox="0 0 140 44" aria-hidden="true" style={{ flexShrink: 0 }}>
      <defs>
        <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(34,211,238,0.2)" />
          <stop offset="100%" stopColor="rgba(34,211,238,0)" />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#sparkGrad)" />
      <path d={d} stroke="var(--brand)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} stroke="rgba(34,211,238,0.15)" strokeWidth="6" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function StatCard({ title, value, hint, sparkline, badge, badgeStyle, loading, delay = 0 }) {
  return (
    <section className="card" style={{ animationDelay: `${delay}ms` }}>
      <div className="card__head">
        <p className="card__title">{title}</p>
      </div>
      <div className="card__body metric">
        <div>
          <div className="value" style={{ fontFamily: "var(--mono)", letterSpacing: "-2px" }}>{loading ? "—" : value}</div>
          <div className="hint" style={{ textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.5px" }}>{hint}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
          {sparkline}
          {badge && (
            <div className="badge" style={badgeStyle}>{badge}</div>
          )}
        </div>
      </div>
    </section>
  );
}

const Dashboard = () => {
  const [totalLeaks, setTotalLeaks] = useState(0);
  const [topUsers, setTopUsers] = useState([]);
  const [recentViolations, setRecentViolations] = useState([]);
  const [teamActivity, setTeamActivity] = useState([]);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  // Violation filters
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");
  const [filterType, setFilterType] = useState("");
  const [violationTypes, setViolationTypes] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem("vantixAdminToken");
    if (!token) {
      navigate("/login");
      return;
    }

    // Sync with extension if present
    const syncExtension = () => {
      const EXTENSION_ID = "fhohiejeobmkadffkmblpnnakcfkhadh";
      if (window.chrome && window.chrome.runtime && window.chrome.runtime.sendMessage) {
        window.chrome.runtime.sendMessage(EXTENSION_ID, { 
          type: "SYNC_AUTH", 
          token, 
        }, () => {
          if (window.chrome.runtime.lastError) {
            // Silent fail if extension not installed/ready
          }
        });
      }
    };
    syncExtension();
  }, [navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const leaksRes = await api.get('/analytics/total-leaks');
        if (leaksRes.data.success) setTotalLeaks(leaksRes.data.count);

        const usersRes = await api.get('/analytics/top-users');
        if (usersRes.data.success) setTopUsers(usersRes.data.topUsers);

        // Build violation query params
        const params = new URLSearchParams();
        params.set("limit", "10");
        if (filterFrom) params.set("from", filterFrom);
        if (filterTo) params.set("to", filterTo);
        if (filterType) params.set("type", filterType);

        const recentRes = await api.get(`/violations?${params.toString()}`);
        if (recentRes.data.success) setRecentViolations(recentRes.data.violations);

        const teamRes = await api.get('/activity/team');
        if (teamRes.data.success) setTeamActivity(teamRes.data.team);

        const trendsRes = await api.get('/analytics/trends');
        if (trendsRes.data.success) setTrends(trendsRes.data.trends);

        // Fetch violation stats for filter dropdown
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
    if (trends && trends.length > 0) return trends;
    const pts = [];
    for (let i = 0; i < 14; i++) {
      const n = Math.sin((i + 1) * 0.5) * 10 + 50;
      pts.push(Math.round(n));
    }
    return pts;
  }, [trends]);

  const [extensionStatus, setExtensionStatus] = useState("checking");
  useEffect(() => {
    const checkExt = () => {
      const EXTENSION_ID = "fhohiejeobmkadffkmblpnnakcfkhadh";
      if (window.chrome && window.chrome.runtime && window.chrome.runtime.sendMessage) {
        window.chrome.runtime.sendMessage(EXTENSION_ID, { type: "PING" }, (res) => {
          if (window.chrome.runtime.lastError) setExtensionStatus("missing");
          else setExtensionStatus("connected");
        });
      } else {
        setExtensionStatus("unsupported");
      }
    };
    checkExt();
  }, []);

  const clearFilters = () => {
    setFilterFrom("");
    setFilterTo("");
    setFilterType("");
  };

  const hasFilters = filterFrom || filterTo || filterType;

  const formatUrl = (url) => {
    if (!url || url === "presidio-scan") return "System Scan";
    try {
      const u = new URL(url);
      return u.hostname + (u.pathname.length > 1 ? u.pathname : "");
    } catch (e) {
      return url;
    }
  };

  const activeCount = teamActivity.filter(e => e.status === "active").length;

  const inputStyle = {
    padding: "8px 12px",
    fontSize: 12,
    background: "var(--input-inline-bg)",
    border: "1px solid var(--input-inline-border)",
    borderRadius: 8,
    color: "var(--input-inline-color)",
    outline: "none",
    transition: "border-color 0.2s ease",
  };

  return (
    <div className="grid" style={{ gap: 16 }}>
      {/* ── Row 1: Stat Cards ── */}
      <div className="grid grid--3">
        <StatCard
          title="Leaks Prevented"
          value={totalLeaks}
          hint="Policy enforcement across all monitored endpoints"
          sparkline={<Sparkline points={spark} />}
          loading={loading}
          delay={0}
        />

        <StatCard
          title="Recent Incidents"
          value={recentViolations.length}
          hint="Latest events from the violations stream"
          badge={
            <div style={{ display: "flex", gap: 6 }}>
              <span className="badge badge--active" style={{ fontSize: 10 }}>
                <div className="pulse-dot" style={{ width: 6, height: 6 }} /> Live
              </span>
              <span className="badge" style={{ 
                fontSize: 10,
                borderColor: extensionStatus === "connected" ? "rgba(37,230,217,.25)" : "rgba(255,77,109,.25)",
                background: extensionStatus === "connected" ? "rgba(37,230,217,.06)" : "rgba(255,77,109,.06)",
                color: extensionStatus === "connected" ? "#25E6D9" : "#FF4D6D"
              }}>
                Ext: {extensionStatus}
              </span>
            </div>
          }
          loading={loading}
          delay={60}
        />

        <StatCard
          title="Employee Status"
          value={`${activeCount} / ${teamActivity.length}`}
          hint="Active employees currently monitored"
          badge={
            activeCount > 0 && (
              <div style={{
                width: '100%',
                height: 6,
                borderRadius: 3,
                background: 'var(--panel-2)',
                overflow: 'hidden',
                minWidth: 100,
              }}>
                <div style={{
                  width: `${teamActivity.length ? (activeCount / teamActivity.length * 100) : 0}%`,
                  height: '100%',
                  borderRadius: 3,
                  background: 'linear-gradient(90deg, #25E6D9, #2EE59D)',
                  transition: 'width 0.5s ease',
                }} />
              </div>
            )
          }
          loading={loading}
          delay={120}
        />
      </div>

      {/* ── Row 2: Tables ── */}
      <div className="grid grid--2">
        {/* Top Offenders */}
        <section className="card" style={{ animationDelay: '180ms' }}>
          <div className="card__head">
            <p className="card__title">Top Offenders</p>
          </div>
          <div className="card__body">
            <table className="table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th style={{ textAlign: 'right' }}>Violations</th>
                </tr>
              </thead>
              <tbody>
                {topUsers.map((user, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 500 }}>{user.email}</td>
                    <td style={{ textAlign: 'right' }}>
                      <span className="badge" style={{
                        borderColor: user.violationCount > 5 ? 'rgba(255,77,109,.3)' : 'rgba(255,176,32,.3)',
                        background: user.violationCount > 5 ? 'rgba(255,77,109,.08)' : 'rgba(255,176,32,.08)',
                        color: user.violationCount > 5 ? '#FF4D6D' : '#FFB020',
                        fontFamily: 'var(--mono)',
                        fontSize: 12,
                      }}>
                        {user.violationCount}
                      </span>
                    </td>
                  </tr>
                ))}
                {topUsers.length === 0 && (
                  <tr>
                    <td colSpan={2} style={{ textAlign: "center", padding: "48px 0", color: "var(--empty-state-text)" }}>
                      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4, marginBottom: 10 }}><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
                      <br/>
                      <span style={{ fontSize: 13 }}>No user data available</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Recent Violations */}
        <section className="card" style={{ animationDelay: '240ms' }}>
          <div className="card__head">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
              <p className="card__title">Recent Violations</p>
              {hasFilters && (
                <button
                  className="btn btn--danger"
                  style={{ fontSize: 11, padding: "4px 12px", height: 28 }}
                  onClick={clearFilters}
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
          <div className="card__body">
            {/* Filter bar */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14, alignItems: "center" }}>
              <input type="date" value={filterFrom} onChange={(e) => setFilterFrom(e.target.value)} style={inputStyle} title="From date" />
              <span style={{ color: "var(--empty-state-text)", fontSize: 12 }}>to</span>
              <input type="date" value={filterTo} onChange={(e) => setFilterTo(e.target.value)} style={inputStyle} title="To date" />
              <select value={filterType} onChange={(e) => setFilterType(e.target.value)} style={{ ...inputStyle, cursor: "pointer", minWidth: 130 }}>
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
                    <td style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--mono)' }}>
                      {new Date(v.timestamp).toLocaleString()}
                    </td>
                    <td>
                      <a 
                        href={v.url === "presidio-scan" ? "#" : v.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ color: "#7CF3FF", textDecoration: "none", fontWeight: 500, transition: "color 0.2s" }}
                        onClick={(e) => v.url === "presidio-scan" && e.preventDefault()}
                      >
                        {formatUrl(v.url)}
                      </a>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {(v.matches || []).map((m, i) => (
                          <span key={i} className="badge badge--employee" style={{ fontSize: 10, padding: '2px 8px' }}>
                            {m.type}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
                {recentViolations.length === 0 && (
                  <tr>
                    <td colSpan={3} style={{ textAlign: "center", padding: "48px 0", color: "var(--empty-state-text)" }}>
                      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4, marginBottom: 10 }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                      <br/>
                      <span style={{ fontSize: 13 }}>{hasFilters ? "No violations match these filters." : "All clear. No violations detected."}</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* ── Row 3: Employee Extension Status ── */}
      <section className="card" style={{ animationDelay: '300ms' }}>
        <div className="card__head">
          <p className="card__title">Employee Extension Status</p>
        </div>
        <div className="card__body">
          <table className="table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Status</th>
                <th>Last Seen</th>
              </tr>
            </thead>
            <tbody>
              {teamActivity.map((emp, idx) => {
                let statusText = "Not Installed";
                let statusStyle = { borderColor: "rgba(255,77,109,.25)", background: "rgba(255,77,109,.06)", color: "#FF4D6D" };

                if (emp.status === "active") {
                  statusText = "Active";
                  statusStyle = { borderColor: "rgba(46,229,157,.25)", background: "rgba(46,229,157,.06)", color: "#2EE59D" };
                } else if (emp.status === "inactive") {
                  statusText = "Inactive";
                  statusStyle = { borderColor: "rgba(255,176,32,.25)", background: "rgba(255,176,32,.06)", color: "#FFB020" };
                }

                return (
                  <tr key={idx}>
                    <td style={{ fontWeight: 500 }}>{emp.email}</td>
                    <td>
                      <span className="badge" style={{ ...statusStyle, fontSize: 11 }}>
                        {emp.status === "active" && <div className="pulse-dot" style={{ width: 6, height: 6, background: '#2EE59D', boxShadow: '0 0 6px #2EE59D' }} />}
                        {statusText}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--mono)' }}>
                      {emp.lastActive ? new Date(emp.lastActive).toLocaleString() : "Never"}
                    </td>
                  </tr>
                );
              })}
              {teamActivity.length === 0 && (
                <tr>
                  <td colSpan={3} style={{ textAlign: "center", padding: "48px 0", color: "var(--empty-state-text)" }}>
                    <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4, marginBottom: 10 }}>
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                    <br/>
                    <span style={{ fontSize: 13 }}>Add employees to monitor coverage.</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
