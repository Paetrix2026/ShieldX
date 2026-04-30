import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { Shield, AlertCircle, ExternalLink, Search, Filter, Calendar, ChevronLeft, ChevronRight, Eye } from 'lucide-react';

const Violations = () => {
    const [violations, setViolations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filterType, setFilterType] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [stats, setStats] = useState({});

    const fetchViolations = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page,
                limit: 15,
                type: filterType,
                search: searchTerm
            });
            const res = await api.get(`/violations?${params.toString()}`);
            if (res.data.success) {
                setViolations(res.data.violations);
                setTotalPages(res.data.pages || 1);
            }
            
            const statsRes = await api.get('/violations/stats');
            if (statsRes.data.success) {
                setStats(statsRes.data.stats);
            }
        } catch (err) {
            console.error("Error fetching violations", err);
        } finally {
            setLoading(false);
        }
    }, [page, filterType, searchTerm]);

    useEffect(() => {
        fetchViolations();
    }, [fetchViolations]);

    const getSeverity = (type) => {
        const critical = ['Credit Card', 'API Key', 'Aadhaar Number', 'PAN Number'];
        if (critical.includes(type)) return 'Critical';
        return 'High';
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px", fontFamily: "'Inter', sans-serif" }}>
            
            {/* Header */}
            <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <h1 style={{ fontSize: "28px", fontWeight: "700", color: "var(--text-primary)", margin: "0 0 4px 0", letterSpacing: "-0.5px" }}>
                        Violation Audit Log
                    </h1>
                    <p style={{ color: "var(--text-secondary)", margin: 0, fontSize: "14px" }}>
                        Detailed history of all blocked data leakage attempts across the ecosystem.
                    </p>
                </div>
                <div style={{ display: "flex", gap: "12px" }}>
                    <button 
                        onClick={fetchViolations} 
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "10px",
                            background: "var(--bg-secondary)",
                            border: "1px solid var(--border-color)",
                            borderRadius: "12px",
                            cursor: "pointer",
                            color: "#00E5FF",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                            transition: "all 0.2s ease"
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.borderColor = "#00E5FF"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.borderColor = "var(--border-color)"; }}
                    >
                        <Shield size={20} />
                    </button>
                </div>
            </header>

            {/* Quick Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
                
                {/* Total Blocked */}
                <div style={{
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "16px",
                    padding: "20px",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    position: "relative",
                    overflow: "hidden"
                }}>
                    <div style={{ position: "absolute", top: "-50px", right: "-50px", width: "100px", height: "100px", background: "rgba(0, 229, 255, 0.1)", filter: "blur(30px)", borderRadius: "50%" }}></div>
                    <p style={{ margin: 0, fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", fontWeight: "600", color: "var(--text-secondary)" }}>Total Blocked</p>
                    <p style={{ 
                        margin: 0, 
                        fontSize: "36px", 
                        fontWeight: "800", 
                        background: "linear-gradient(90deg, #00FFC2, #00E5FF)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        letterSpacing: "-1px"
                    }}>{stats.total || 0}</p>
                </div>

                {/* Critical Leaks */}
                <div style={{
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "16px",
                    padding: "20px",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    position: "relative",
                    overflow: "hidden"
                }}>
                    <div style={{ position: "absolute", top: "-50px", right: "-50px", width: "100px", height: "100px", background: "rgba(255, 77, 109, 0.1)", filter: "blur(30px)", borderRadius: "50%" }}></div>
                    <p style={{ margin: 0, fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", fontWeight: "600", color: "var(--text-secondary)" }}>Critical Leaks</p>
                    <p style={{ 
                        margin: 0, 
                        fontSize: "36px", 
                        fontWeight: "800", 
                        background: "linear-gradient(90deg, #FF4D6D, #FF758F)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        letterSpacing: "-1px"
                    }}>{stats['Credit Card'] || 0}</p>
                </div>

                {/* Unique Users */}
                <div style={{
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "16px",
                    padding: "20px",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    position: "relative",
                    overflow: "hidden"
                }}>
                    <div style={{ position: "absolute", top: "-50px", right: "-50px", width: "100px", height: "100px", background: "rgba(56, 189, 248, 0.1)", filter: "blur(30px)", borderRadius: "50%" }}></div>
                    <p style={{ margin: 0, fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", fontWeight: "600", color: "var(--text-secondary)" }}>Unique Users</p>
                    <p style={{ 
                        margin: 0, 
                        fontSize: "36px", 
                        fontWeight: "800", 
                        background: "linear-gradient(90deg, #38BDF8, #818CF8)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        letterSpacing: "-1px"
                    }}>{stats.uniqueUsers || 0}</p>
                </div>

                {/* Top Platform */}
                <div style={{
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "16px",
                    padding: "20px",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    position: "relative",
                    overflow: "hidden"
                }}>
                    <div style={{ position: "absolute", top: "-50px", right: "-50px", width: "100px", height: "100px", background: "rgba(46, 229, 157, 0.1)", filter: "blur(30px)", borderRadius: "50%" }}></div>
                    <p style={{ margin: 0, fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", fontWeight: "600", color: "var(--text-secondary)" }}>Top Platform</p>
                    <p style={{ 
                        margin: 0, 
                        fontSize: "28px", 
                        fontWeight: "800", 
                        background: "linear-gradient(90deg, #2EE59D, #00FFC2)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        letterSpacing: "-0.5px",
                        lineHeight: "42px"
                    }}>ChatGPT</p>
                </div>
            </div>

            {/* Filters */}
            <div style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-color)",
                borderRadius: "16px",
                padding: "16px",
                display: "flex",
                flexWrap: "wrap",
                gap: "16px",
                alignItems: "center"
            }}>
                {/* Search */}
                <div style={{ flex: "1 1 250px", position: "relative" }}>
                    <Search size={16} color="var(--text-secondary)" style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)" }} />
                    <input 
                        type="text" 
                        placeholder="Search by user email or URL..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: "100%",
                            height: "44px",
                            padding: "0 16px 0 44px",
                            borderRadius: "22px",
                            border: "1px solid var(--border-color)",
                            background: "var(--bg-primary)",
                            color: "var(--text-primary)",
                            fontSize: "14px",
                            outline: "none",
                            boxSizing: "border-box",
                            transition: "all 0.2s ease"
                        }}
                        onFocus={(e) => { e.target.style.borderColor = "#00E5FF"; e.target.style.boxShadow = "0 0 0 3px rgba(0,229,255,0.1)"; }}
                        onBlur={(e) => { e.target.style.borderColor = "var(--border-color)"; e.target.style.boxShadow = "none"; }}
                    />
                </div>

                {/* Dropdown */}
                <div style={{ position: "relative" }}>
                    <select 
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        style={{
                            height: "44px",
                            padding: "0 40px 0 20px",
                            borderRadius: "22px",
                            border: "1px solid var(--border-color)",
                            background: "var(--bg-primary)",
                            color: "var(--text-primary)",
                            fontSize: "14px",
                            outline: "none",
                            appearance: "none",
                            cursor: "pointer",
                            transition: "all 0.2s ease"
                        }}
                        onFocus={(e) => { e.target.style.borderColor = "#00E5FF"; e.target.style.boxShadow = "0 0 0 3px rgba(0,229,255,0.1)"; }}
                        onBlur={(e) => { e.target.style.borderColor = "var(--border-color)"; e.target.style.boxShadow = "none"; }}
                    >
                        <option value="">All Types</option>
                        <option value="Credit Card">Credit Card</option>
                        <option value="API Key">API Key</option>
                        <option value="Email">Email</option>
                        <option value="Phone">Phone</option>
                        <option value="Keyword">Keyword</option>
                    </select>
                    <Filter size={14} color="var(--text-secondary)" style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                </div>

                {/* Date Filter */}
                <button style={{
                    height: "44px",
                    padding: "0 20px",
                    borderRadius: "22px",
                    border: "1px solid var(--border-color)",
                    background: "var(--bg-primary)",
                    color: "var(--text-primary)",
                    fontSize: "14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    cursor: "pointer",
                    transition: "all 0.2s ease"
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#00E5FF"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border-color)"; }}>
                    <Calendar size={16} color="var(--text-secondary)" />
                    <span>Last 30 Days</span>
                </button>
            </div>

            {/* Table Card */}
            <div style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-color)",
                borderRadius: "16px",
                overflow: "hidden",
                boxShadow: "0 12px 32px rgba(0,0,0,0.06)"
            }}>
                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                        <thead style={{ background: "var(--panel)", borderBottom: "1px solid var(--border-color)" }}>
                            <tr>
                                <th style={{ padding: "16px 24px", fontSize: "11px", fontWeight: "600", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "1px" }}>Timestamp</th>
                                <th style={{ padding: "16px 24px", fontSize: "11px", fontWeight: "600", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "1px" }}>Employee</th>
                                <th style={{ padding: "16px 24px", fontSize: "11px", fontWeight: "600", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "1px" }}>Platform / URL</th>
                                <th style={{ padding: "16px 24px", fontSize: "11px", fontWeight: "600", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "1px" }}>Violation Type</th>
                                <th style={{ padding: "16px 24px", fontSize: "11px", fontWeight: "600", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "1px" }}>Severity</th>
                                <th style={{ padding: "16px 24px", fontSize: "11px", fontWeight: "600", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "1px" }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && (
                                <tr>
                                    <td colSpan={6} style={{ padding: "60px", textAlign: "center", color: "var(--text-secondary)" }}>
                                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                                            <div style={{ width: "24px", height: "24px", border: "3px solid var(--border-color)", borderTopColor: "#00E5FF", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
                                            <span style={{ fontSize: "14px" }}>Refreshing secure logs...</span>
                                            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                                        </div>
                                    </td>
                                </tr>
                            )}
                            {!loading && violations.length === 0 && (
                                <tr>
                                    <td colSpan={6} style={{ padding: "60px", textAlign: "center", color: "var(--text-secondary)", fontSize: "14px" }}>
                                        No violations found matching your criteria.
                                    </td>
                                </tr>
                            )}
                            {!loading && violations.map((v, index) => (
                                <tr key={v._id} style={{ 
                                    borderBottom: index !== violations.length - 1 ? "1px solid var(--border-color)" : "none",
                                    transition: "background 0.2s ease"
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = "var(--panel)"}
                                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                                >
                                    <td style={{ padding: "16px 24px", fontSize: "13px", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
                                        {new Date(v.timestamp).toLocaleString()}
                                    </td>
                                    <td style={{ padding: "16px 24px" }}>
                                        <div style={{ display: "flex", flexDirection: "column" }}>
                                            <span style={{ fontSize: "14px", fontWeight: "500", color: "var(--text-primary)" }}>{v.email || 'Anonymous'}</span>
                                            <span style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "2px" }}>ID: {v.userId || 'N/A'}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: "16px 24px", maxWidth: "250px" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                            <ExternalLink size={14} color="#00E5FF" style={{ flexShrink: 0 }} />
                                            <span style={{ fontSize: "13px", color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={v.url}>
                                                {v.url}
                                            </span>
                                        </div>
                                    </td>
                                    <td style={{ padding: "16px 24px" }}>
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                            {(v.matches || []).map((m, idx) => (
                                                <span key={idx} style={{ 
                                                    padding: "4px 10px", 
                                                    background: "rgba(37, 230, 217, 0.1)", 
                                                    color: "#25E6D9", 
                                                    border: "1px solid rgba(37, 230, 217, 0.2)",
                                                    borderRadius: "6px",
                                                    fontSize: "10px",
                                                    fontWeight: "700",
                                                    textTransform: "uppercase",
                                                    letterSpacing: "0.5px"
                                                }}>
                                                    {m.type}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td style={{ padding: "16px 24px" }}>
                                        <span style={{ 
                                            display: "inline-block",
                                            padding: "4px 12px",
                                            borderRadius: "999px",
                                            fontSize: "10px",
                                            fontWeight: "800",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.5px",
                                            ...(getSeverity(v.matches?.[0]?.type) === 'Critical' ? {
                                                background: "rgba(255, 77, 109, 0.1)",
                                                color: "#FF4D6D",
                                                border: "1px solid rgba(255, 77, 109, 0.2)",
                                                boxShadow: "0 0 10px rgba(255, 77, 109, 0.1)"
                                            } : {
                                                background: "rgba(255, 176, 32, 0.1)",
                                                color: "#FFB020",
                                                border: "1px solid rgba(255, 176, 32, 0.2)",
                                                boxShadow: "0 0 10px rgba(255, 176, 32, 0.1)"
                                            })
                                        }}>
                                            {getSeverity(v.matches?.[0]?.type)}
                                        </span>
                                    </td>
                                    <td style={{ padding: "16px 24px" }}>
                                        <button style={{ 
                                            background: "var(--bg-primary)", 
                                            border: "1px solid var(--border-color)", 
                                            padding: "8px", 
                                            borderRadius: "8px", 
                                            cursor: "pointer",
                                            color: "var(--text-secondary)",
                                            transition: "all 0.2s ease",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center"
                                        }}
                                        onMouseEnter={(e) => { e.currentTarget.style.color = "#00E5FF"; e.currentTarget.style.borderColor = "#00E5FF"; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.borderColor = "var(--border-color)"; }}
                                        >
                                            <Eye size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div style={{ 
                    padding: "16px 24px", 
                    background: "var(--panel)", 
                    borderTop: "1px solid var(--border-color)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                }}>
                    <p style={{ margin: 0, fontSize: "13px", color: "var(--text-secondary)" }}>
                        Showing <span style={{ fontWeight: "600", color: "var(--text-primary)" }}>{violations.length > 0 ? (page - 1) * 15 + 1 : 0}</span> to <span style={{ fontWeight: "600", color: "var(--text-primary)" }}>{Math.min(page * 15, violations.length)}</span> of <span style={{ fontWeight: "600", color: "var(--text-primary)" }}>{stats.total || 0}</span> results
                    </p>
                    <div style={{ display: "flex", gap: "8px" }}>
                        <button 
                            onClick={() => setPage(p => Math.max(1, p - 1))} 
                            disabled={page === 1}
                            style={{
                                padding: "8px",
                                borderRadius: "8px",
                                background: "var(--bg-primary)",
                                border: "1px solid var(--border-color)",
                                color: "var(--text-primary)",
                                cursor: page === 1 ? "not-allowed" : "pointer",
                                opacity: page === 1 ? 0.4 : 1,
                                transition: "all 0.2s"
                            }}
                            onMouseEnter={(e) => { if(page !== 1) e.currentTarget.style.borderColor = "#00E5FF"; }}
                            onMouseLeave={(e) => { if(page !== 1) e.currentTarget.style.borderColor = "var(--border-color)"; }}
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button 
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                            disabled={page === totalPages}
                            style={{
                                padding: "8px",
                                borderRadius: "8px",
                                background: "var(--bg-primary)",
                                border: "1px solid var(--border-color)",
                                color: "var(--text-primary)",
                                cursor: page === totalPages ? "not-allowed" : "pointer",
                                opacity: page === totalPages ? 0.4 : 1,
                                transition: "all 0.2s"
                            }}
                            onMouseEnter={(e) => { if(page !== totalPages) e.currentTarget.style.borderColor = "#00E5FF"; }}
                            onMouseLeave={(e) => { if(page !== totalPages) e.currentTarget.style.borderColor = "var(--border-color)"; }}
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Violations;
