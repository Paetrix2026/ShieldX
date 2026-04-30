import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { Shield, ExternalLink, Search, Filter, Calendar, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Violations = () => {
    const [violations, setViolations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filterType, setFilterType] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [stats, setStats] = useState({});
    const [topPlatform, setTopPlatform] = useState('N/A');

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

            // Calculate top platform from recent violations or generic stats if available
            if (res.data.violations && res.data.violations.length > 0) {
                const platforms = res.data.violations.map(v => {
                    if (v.url.includes('chatgpt.com')) return 'ChatGPT';
                    if (v.url.includes('gemini.google.com')) return 'Gemini';
                    if (v.url.includes('claude.ai')) return 'Claude';
                    return 'Other';
                });
                const counts = platforms.reduce((acc, p) => ({ ...acc, [p]: (acc[p] || 0) + 1 }), {});
                const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
                if (sorted.length > 0) {
                    setTopPlatform(sorted[0][0]);
                }
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

    const formatUrl = (url) => {
        if (!url || url === "presidio-scan") return "System Scan";
        try {
            const u = new URL(url);
            return u.hostname + (u.pathname.length > 1 ? u.pathname : "");
        } catch (e) {
            return url;
        }
    };

    const getSeverity = (type) => {
        const critical = ['Credit Card', 'API Key', 'Aadhaar Number', 'PAN Number', 'AADHAAR_NUMBER', 'PAN_NUMBER'];
        if (critical.includes(type)) return 'Critical';
        return 'High';
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    const rowVariants = {
        hidden: { opacity: 0, x: -10 },
        visible: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 10 }
    };

    const inputStyle = {
        height: "44px",
        padding: "0 16px",
        borderRadius: "22px",
        border: "1px solid var(--border-color)",
        background: "var(--bg-primary)",
        color: "var(--text-primary)",
        fontSize: "14px",
        outline: "none",
        transition: "all 0.2s ease"
    };

    return (
        <motion.div 
            initial="hidden" 
            animate="visible" 
            variants={containerVariants}
            style={{ display: "flex", flexDirection: "column", gap: "24px", fontFamily: "'Inter', sans-serif" }}
        >
            
            {/* Header */}
            <motion.header variants={itemVariants} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
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
                    >
                        <Shield size={20} />
                    </button>
                </div>
            </motion.header>

            {/* Quick Stats */}
            <motion.div variants={itemVariants} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
                <div className="card">
                    <div className="card__head"><p className="card__title">Total Blocked</p></div>
                    <div className="card__body metric">
                        <div className="value" style={{ 
                            background: "linear-gradient(90deg, #00FFC2, #00E5FF)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent"
                        }}>{stats.total || 0}</div>
                        <div className="hint">All time</div>
                    </div>
                </div>
                <div className="card">
                    <div className="card__head"><p className="card__title">Critical Leaks</p></div>
                    <div className="card__body metric">
                        <div className="value" style={{ 
                            background: "linear-gradient(90deg, #FF4D6D, #FF758F)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent"
                        }}>
                            {(stats['Credit Card'] || 0) + (stats['AADHAAR_NUMBER'] || 0) + (stats['PAN_NUMBER'] || 0)}
                        </div>
                        <div className="hint">PII & Financial</div>
                    </div>
                </div>
                <div className="card">
                    <div className="card__head"><p className="card__title">Unique Users</p></div>
                    <div className="card__body metric">
                        <div className="value" style={{ 
                            background: "linear-gradient(90deg, #38BDF8, #818CF8)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent"
                        }}>{stats.uniqueUsers || 0}</div>
                        <div className="hint">Active offenders</div>
                    </div>
                </div>
                <div className="card">
                    <div className="card__head"><p className="card__title">Top Platform</p></div>
                    <div className="card__body metric">
                        <div className="value" style={{ 
                            background: "linear-gradient(90deg, #2EE59D, #00FFC2)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            fontSize: 32 
                        }}>{topPlatform}</div>
                        <div className="hint">Most targeted</div>
                    </div>
                </div>
            </motion.div>

            {/* Filters & Table */}
            <motion.section variants={itemVariants} className="card">
                <div className="card__head" style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: 16 }}>
                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
                            <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} size={16} />
                            <input 
                                type="text" 
                                placeholder="Search by user email or URL..." 
                                style={{ ...inputStyle, paddingLeft: 38, width: '100%' }}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <select 
                            style={inputStyle}
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                        >
                            <option value="">All Violation Types</option>
                            <option value="Credit Card">Credit Card</option>
                            <option value="API Key">API Key</option>
                            <option value="Email">Email</option>
                            <option value="Phone">Phone</option>
                            <option value="Keyword">Keyword</option>
                            <option value="AADHAAR_NUMBER">Aadhaar</option>
                            <option value="PAN_NUMBER">PAN</option>
                        </select>
                        <button className="btn" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Calendar size={16} />
                            <span>Last 30 Days</span>
                        </button>
                    </div>
                </div>

                <div style={{ overflowX: "auto" }}>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Timestamp</th>
                                <th>Employee</th>
                                <th>Platform / URL</th>
                                <th>Violation Type</th>
                                <th>Severity</th>
                                <th style={{ textAlign: 'right' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence mode="popLayout">
                                {loading && violations.length === 0 ? (
                                    <motion.tr key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                        <td colSpan={6} style={{ textAlign: "center", padding: "60px 0", color: "var(--empty-state-text)" }}>
                                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                                                <div style={{ width: "24px", height: "24px", border: "3px solid var(--border-color)", borderTopColor: "#00E5FF", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
                                                <span style={{ fontSize: "14px" }}>Refreshing secure logs...</span>
                                                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ) : violations.length === 0 ? (
                                    <motion.tr key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                        <td colSpan={6} style={{ textAlign: "center", padding: "60px 0", color: "var(--empty-state-text)" }}>
                                            <Shield size={32} style={{ opacity: 0.5, margin: "0 auto 12px" }} />
                                            No violations found matching your criteria.
                                        </td>
                                    </motion.tr>
                                ) : (
                                    violations.map((v) => {
                                        const severity = getSeverity(v.matches?.[0]?.type);
                                        const isCritical = severity === 'Critical';
                                        
                                        return (
                                            <motion.tr 
                                                key={v._id} 
                                                variants={rowVariants}
                                                initial="hidden"
                                                animate="visible"
                                                exit="exit"
                                                layout
                                            >
                                                <td style={{ color: "var(--text-secondary)", fontSize: 12 }}>
                                                    {new Date(v.timestamp).toLocaleString()}
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                        <span style={{ fontWeight: 500, color: "var(--text-primary)" }}>{v.email || 'Anonymous'}</span>
                                                        <span style={{ fontSize: 10, color: "var(--text-secondary)" }}>ID: {v.userId || 'N/A'}</span>
                                                    </div>
                                                </td>
                                                <td style={{ maxWidth: 220 }}>
                                                    <a 
                                                        href={v.url === "presidio-scan" ? "#" : v.url} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}
                                                        onClick={(e) => v.url === "presidio-scan" && e.preventDefault()}
                                                    >
                                                        <ExternalLink size={14} style={{ color: "#00E5FF", flexShrink: 0 }} />
                                                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "rgba(124,243,255,.92)" }} title={v.url}>
                                                            {formatUrl(v.url)}
                                                        </span>
                                                    </a>
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                                        {(v.matches || []).map((m, idx) => (
                                                            <span key={idx} className="badge badge--employee" style={{ fontSize: 10, padding: "2px 8px" }}>
                                                                {m.type}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="badge" style={{ 
                                                        fontSize: 10, 
                                                        padding: "2px 8px",
                                                        borderColor: isCritical ? "rgba(255,77,109,.35)" : "rgba(255,176,32,.35)",
                                                        background: isCritical ? "rgba(255,77,109,.10)" : "rgba(255,176,32,.10)",
                                                        color: isCritical ? "var(--danger)" : "var(--warn)"
                                                    }}>
                                                        {severity}
                                                    </span>
                                                </td>
                                                <td style={{ textAlign: 'right' }}>
                                                    <button className="btn btn--ghost" style={{ padding: "6px 10px", height: "auto" }}>
                                                        <Eye size={16} />
                                                    </button>
                                                </td>
                                            </motion.tr>
                                        );
                                    })
                                )}
                            </AnimatePresence>
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
                            className="btn"
                            style={{ height: 32, padding: "0 8px", opacity: page === 1 ? 0.4 : 1 }}
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button 
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                            disabled={page === totalPages}
                            className="btn"
                            style={{ height: 32, padding: "0 8px", opacity: page === totalPages ? 0.4 : 1 }}
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </motion.section>
        </motion.div>
    );
};

export default Violations;
