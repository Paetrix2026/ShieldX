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

            // Calculate top platform from recent violations
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
        visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
    };

    const itemVariants = {
        hidden: { y: 16, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { duration: 0.4, ease: 'easeOut' } }
    };

    const rowVariants = {
        hidden: { opacity: 0, x: -8 },
        visible: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 8 }
    };

    return (
        <motion.div 
            initial="hidden" 
            animate="visible" 
            variants={containerVariants}
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
        >
            
            {/* Quick Stats */}
            <motion.div variants={itemVariants} className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
                <div className="card">
                    <div className="card__head"><p className="card__title">Total Blocked</p></div>
                    <div className="card__body metric">
                        <div>
                            <div className="value gradient-teal">{stats.total || 0}</div>
                            <div className="hint">All time</div>
                        </div>
                        <Shield size={28} style={{ color: 'var(--brand)', opacity: 0.2 }} />
                    </div>
                </div>
                <div className="card">
                    <div className="card__head"><p className="card__title">Critical Leaks</p></div>
                    <div className="card__body metric">
                        <div>
                            <div className="value gradient-red">
                                {(stats['Credit Card'] || 0) + (stats['AADHAAR_NUMBER'] || 0) + (stats['PAN_NUMBER'] || 0)}
                            </div>
                            <div className="hint">PII & Financial</div>
                        </div>
                    </div>
                </div>
                <div className="card">
                    <div className="card__head"><p className="card__title">Unique Users</p></div>
                    <div className="card__body metric">
                        <div>
                            <div className="value gradient-blue">{stats.uniqueUsers || 0}</div>
                            <div className="hint">Active offenders</div>
                        </div>
                    </div>
                </div>
                <div className="card">
                    <div className="card__head"><p className="card__title">Top Platform</p></div>
                    <div className="card__body metric">
                        <div>
                            <div className="value gradient-green" style={{ fontSize: 28 }}>{topPlatform}</div>
                            <div className="hint">Most targeted</div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Filters & Table */}
            <motion.section variants={itemVariants} className="card">
                <div className="card__head" style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: 16 }}>
                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
                            <Search style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} size={16} />
                            <input 
                                type="text" 
                                placeholder="Search by user email or URL..." 
                                className="input"
                                style={{ paddingLeft: 40, width: '100%', borderRadius: 999 }}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <select 
                            className="input"
                            style={{ borderRadius: 999, minWidth: 160 }}
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
                        <button className="btn" style={{ borderRadius: 999 }}>
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
                                                <div style={{ width: "24px", height: "24px", border: "2px solid var(--border-color)", borderTopColor: "#25E6D9", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
                                                <span style={{ fontSize: "13px" }}>Refreshing secure logs...</span>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ) : violations.length === 0 ? (
                                    <motion.tr key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                        <td colSpan={6} style={{ textAlign: "center", padding: "60px 0", color: "var(--empty-state-text)" }}>
                                            <Shield size={32} style={{ opacity: 0.3, margin: "0 auto 12px" }} />
                                            <br/>No violations found matching your criteria.
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
                                                <td style={{ color: "var(--text-secondary)", fontSize: 12, fontFamily: 'var(--mono)' }}>
                                                    {new Date(v.timestamp).toLocaleString()}
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                        <span style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: 13 }}>{v.email || 'Anonymous'}</span>
                                                        <span style={{ fontSize: 10, color: "var(--text-secondary)", fontFamily: 'var(--mono)' }}>ID: {v.userId || 'N/A'}</span>
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
                                                        <ExternalLink size={14} style={{ color: "#7CF3FF", flexShrink: 0 }} />
                                                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#7CF3FF", fontWeight: 500 }} title={v.url}>
                                                            {formatUrl(v.url)}
                                                        </span>
                                                    </a>
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
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
                                                        padding: "3px 10px",
                                                        borderColor: isCritical ? "rgba(255,77,109,.25)" : "rgba(255,176,32,.25)",
                                                        background: isCritical ? "rgba(255,77,109,.06)" : "rgba(255,176,32,.06)",
                                                        color: isCritical ? "#FF4D6D" : "#FFB020",
                                                        fontWeight: 700,
                                                    }}>
                                                        {severity}
                                                    </span>
                                                </td>
                                                <td style={{ textAlign: 'right' }}>
                                                    <button className="btn btn--ghost" style={{ padding: "6px 10px", height: "auto", borderRadius: 8 }}>
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
                    padding: "14px 20px", 
                    background: "var(--panel)", 
                    borderTop: "1px solid var(--border-color)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderRadius: "0 0 12px 12px",
                }}>
                    <p style={{ margin: 0, fontSize: "13px", color: "var(--text-secondary)" }}>
                        Showing <span style={{ fontWeight: "600", color: "var(--text-primary)" }}>{violations.length > 0 ? (page - 1) * 15 + 1 : 0}</span> to <span style={{ fontWeight: "600", color: "var(--text-primary)" }}>{Math.min(page * 15, violations.length)}</span> of <span style={{ fontWeight: "600", color: "var(--brand)" }}>{stats.total || 0}</span> results
                    </p>
                    <div style={{ display: "flex", gap: "6px" }}>
                        <button 
                            onClick={() => setPage(p => Math.max(1, p - 1))} 
                            disabled={page === 1}
                            className="btn"
                            style={{ height: 32, padding: "0 10px", opacity: page === 1 ? 0.3 : 1, borderRadius: 8 }}
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <span style={{ 
                            display: 'flex', alignItems: 'center', padding: '0 12px', 
                            fontSize: 13, fontWeight: 600, color: 'var(--text-primary)',
                            fontFamily: 'var(--mono)',
                        }}>
                            {page} / {totalPages}
                        </span>
                        <button 
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                            disabled={page === totalPages}
                            className="btn"
                            style={{ height: 32, padding: "0 10px", opacity: page === totalPages ? 0.3 : 1, borderRadius: 8 }}
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
