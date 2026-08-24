import React, { useEffect, useMemo, useState, useRef } from "react";
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

function StatCard({ title, value, hint, icon, theme, loading, hintColor, sparklineData }) {
  return (
    <section className={`card card--pastel-${theme}`} style={{ display: 'flex', flexDirection: 'column', padding: '24px', borderRadius: '24px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div className={`icon--${theme}`}>
          {icon}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <div style={{ fontSize: '32px', fontWeight: '800', color: '#111827', letterSpacing: '-0.5px', lineHeight: 1 }}>
            {loading ? "—" : value}
          </div>
          <div style={{ fontSize: '12px', fontWeight: '600', color: hintColor, padding: '2px 8px', borderRadius: '12px', background: 'rgba(255,255,255,0.6)', marginTop: '8px' }}>
            {hint}
          </div>
        </div>
      </div>
      
      {sparklineData && (
        <div style={{ margin: '8px -24px -24px -24px', opacity: 0.6 }}>
          <Sparkline points={sparklineData} />
        </div>
      )}
      
      {!sparklineData && (
        <div style={{ marginTop: 'auto' }}>
          <div style={{ fontSize: '15px', fontWeight: '500', color: '#111827' }}>{title}</div>
        </div>
      )}
      
      {sparklineData && (
        <div style={{ position: 'absolute', bottom: '24px', left: '24px' }}>
          <div style={{ fontSize: '15px', fontWeight: '500', color: '#111827' }}>{title}</div>
        </div>
      )}
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

  const [_extensionStatus, setExtensionStatus] = useState("checking");
  useEffect(() => {
    const checkExt = () => {
      const EXTENSION_ID = "fhohiejeobmkadffkmblpnnakcfkhadh";
      if (window.chrome && window.chrome.runtime && window.chrome.runtime.sendMessage) {
        window.chrome.runtime.sendMessage(EXTENSION_ID, { type: "PING" }, (_res) => {
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
    } catch (_e) {
      return url;
    }
  };

  const activeCount = teamActivity.filter(e => e.status === "active").length;

  const inputStyle = {
    padding: "8px 12px",
    fontSize: 12,
    background: "#F8FAFC",
    border: "1px solid #E2E8F0",
    borderRadius: 8,
    color: "#111827",
    outline: "none",
    transition: "border-color 0.2s ease",
  };

  // Custom Dropdown to bypass OS-level styling issues
  const CustomSelect = ({ value, onChange, options, defaultLabel }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
      const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    return (
      <div ref={ref} style={{ position: "relative", minWidth: 130 }}>
        <div 
          onClick={() => setOpen(!open)}
          style={{ ...inputStyle, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}
        >
          <span>{value || defaultLabel}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: 8, transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0)" }}><path d="M6 9l6 6 6-6"></path></svg>
        </div>
        {open && (
          <div style={{ position: "absolute", top: "100%", left: 0, right: 0, marginTop: 4, background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 8, boxShadow: "0 10px 25px rgba(0,0,0,0.05)", zIndex: 50, padding: 4, maxHeight: 200, overflowY: "auto" }}>
            <div 
              onClick={() => { onChange(""); setOpen(false); }} 
              style={{ padding: "8px 12px", cursor: "pointer", fontSize: 12, borderRadius: 4, color: "#111827", background: value === "" ? "#F3F4F6" : "transparent" }}
              onMouseEnter={(e) => e.target.style.background = "#F9FAFB"}
              onMouseLeave={(e) => e.target.style.background = value === "" ? "#F3F4F6" : "transparent"}
            >
              {defaultLabel}
            </div>
            {options.map(opt => (
              <div 
                key={opt} 
                onClick={() => { onChange(opt); setOpen(false); }} 
                style={{ padding: "8px 12px", cursor: "pointer", fontSize: 12, borderRadius: 4, color: "#111827", background: value === opt ? "#F3F4F6" : "transparent" }}
                onMouseEnter={(e) => e.target.style.background = "#F9FAFB"}
                onMouseLeave={(e) => e.target.style.background = value === opt ? "#F3F4F6" : "transparent"}
              >
                {opt}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      <div>
        <h1 style={{ fontSize: "36px", fontWeight: "600", color: "var(--text-primary)", letterSpacing: "-1px", marginBottom: "8px" }}>Overview statistics</h1>
        <p className="text-muted">Real-time system load and data leak prevention metrics.</p>
      </div>
      <div className="grid" style={{ gap: 24 }}>
      {/* ── Row 1: Stat Cards ── */}
      <div className="grid grid--3">
        <StatCard
          title="Leaks Prevented"
          value={totalLeaks}
          hint="+12.4% ↗"
          hintColor="#16A34A"
          theme="blue"
          icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>}
          loading={loading}
          sparklineData={spark}
        />

        <StatCard
          title="Recent Incidents"
          value={recentViolations.length}
          hint="-4.2% ↘"
          hintColor="#DC2626"
          theme="purple"
          icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>}
          loading={loading}
          sparklineData={spark.slice().reverse()}
        />

        <StatCard
          title="Employee Status"
          value={`${activeCount} / ${teamActivity.length}`}
          hint={activeCount > 0 ? `${activeCount} Active ↗` : "0 Active"}
          hintColor={activeCount > 0 ? "#16A34A" : "#6B7280"}
          theme="green"
          icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>}
          loading={loading}
          sparklineData={spark.map(s => s * 0.8)}
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
                {topUsers.map((user, idx) => {
                  const maxViolations = Math.max(...topUsers.map(u => u.violationCount), 1);
                  const barWidth = `${(user.violationCount / maxViolations) * 100}%`;
                  const isCritical = user.violationCount > 5;
                  
                  return (
                    <tr key={idx} className="table-row-hover">
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: isCritical ? '#FF4D6D' : '#8A7BF3', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>
                            {user.email.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: '#111827' }}>{user.email}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{isCritical ? 'High Risk' : 'Standard'}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ width: '120px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
                          <span className="badge" style={{
                            borderColor: isCritical ? 'rgba(255,77,109,.3)' : 'rgba(255,176,32,.3)',
                            background: isCritical ? 'rgba(255,77,109,.08)' : 'rgba(255,176,32,.08)',
                            color: isCritical ? '#FF4D6D' : '#FFB020',
                            fontFamily: 'var(--mono)',
                            fontSize: 12,
                          }}>
                            {user.violationCount} alerts
                          </span>
                          <div style={{ width: '100%', height: '4px', background: '#E5E7EB', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: barWidth, background: isCritical ? '#FF4D6D' : '#FFB020', borderRadius: '2px' }} />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
              <CustomSelect 
                value={filterType} 
                onChange={setFilterType} 
                options={violationTypes} 
                defaultLabel="All types" 
              />
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
                  <tr key={idx} className="table-row-hover">
                    <td style={{ width: '140px' }}>
                      <div style={{ fontSize: 13, color: '#111827', fontWeight: 500 }}>{new Date(v.timestamp).toLocaleDateString()}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{new Date(v.timestamp).toLocaleTimeString()}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ padding: '6px', borderRadius: '8px', background: '#F3F4F6', color: '#6B7280' }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                        </div>
                        <a 
                          href={v.url === "presidio-scan" ? "#" : v.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ color: "#2BAEE6", textDecoration: "none", fontWeight: 600, transition: "color 0.2s" }}
                          onClick={(e) => v.url === "presidio-scan" && e.preventDefault()}
                        >
                          {formatUrl(v.url)}
                        </a>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        {(v.matches || []).map((m, i) => (
                          <span key={i} className="badge badge--employee" style={{ fontSize: 11, padding: '4px 10px', fontWeight: 600, background: 'rgba(138, 88, 252, 0.08)', color: '#8A7BF3', borderColor: 'rgba(138, 88, 252, 0.2)' }}>
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
                  <tr key={idx} className="table-row-hover">
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#F3F4F6', color: '#6B7280', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>
                          {emp.email.substring(0, 2).toUpperCase()}
                        </div>
                        <div style={{ fontWeight: 600, color: '#111827' }}>{emp.email}</div>
                      </div>
                    </td>
                    <td>
                      <span className="badge" style={{ ...statusStyle, fontSize: 11, padding: '4px 10px', fontWeight: 600 }}>
                        {emp.status === "active" && <div className="pulse-dot" style={{ width: 6, height: 6, background: '#2EE59D', boxShadow: '0 0 6px #2EE59D', marginRight: '6px' }} />}
                        {statusText}
                      </span>
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--text-secondary)', textAlign: 'right' }}>
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
    </div>
  );
};

export default Dashboard;
