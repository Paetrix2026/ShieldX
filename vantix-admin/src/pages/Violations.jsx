import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import { Shield, ExternalLink, Search, Calendar, ChevronLeft, ChevronRight, Eye } from 'lucide-react';

const Violations = () => {
    const [violations, setViolations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filterType, setFilterType] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [stats, setStats] = useState({});

    const fetchViolations = async () => {
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
    };

    useEffect(() => {
        fetchViolations();
    }, [page, filterType, searchTerm]);

    const getSeverity = (type) => {
        const critical = ['Credit Card', 'API Key', 'Aadhaar Number', 'PAN Number'];
        if (critical.includes(type)) return 'Critical';
        return 'High';
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.08 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    const rowVariants = {
        hidden: { opacity: 0, x: -10 },
        visible: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 10, transition: { duration: 0.15 } }
    };

    const inputStyle = {
        padding: "8px 14px",
        fontSize: 13,
        background: "var(--bg-secondary)",
        border: "1px solid var(--border-color)",
        borderRadius: 12,
        color: "var(--text-primary)",
        outline: "none",
        minWidth: 200,
        transition: "border-color 0.2s"
    };

    return (
        <motion.div 
            className="grid" 
            style={{ gap: 20 }}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.header variants={itemVariants} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600, letterSpacing: 0.3 }}>Violation Audit Log</h1>
                    <p style={{ margin: "4px 0 0", color: "var(--text-secondary)", fontSize: 14 }}>Detailed history of all blocked data leakage attempts.</p>
                </div>
                <div>
                    <button onClick={fetchViolations} className="btn btn--primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Shield size={16} />
                        Refresh
                    </button>
                </div>
            </motion.header>

            {/* Quick Stats */}
            <motion.div variants={itemVariants} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
                <div className="card">
                    <div className="card__head"><p className="card__title">Total Blocked</p></div>
                    <div className="card__body metric">
                        <div className="value" style={{ color: "var(--brand)" }}>{stats.total || 0}</div>
                        <div className="hint">All time</div>
                    </div>
                </div>
                <div className="card">
                    <div className="card__head"><p className="card__title">Critical Leaks</p></div>
                    <div className="card__body metric">
                        <div className="value" style={{ color: "var(--danger)" }}>{stats['Credit Card'] || 0}</div>
                        <div className="hint">Payment info</div>
                    </div>
                </div>
                <div className="card">
                    <div className="card__head"><p className="card__title">Unique Users</p></div>
                    <div className="card__body metric">
                        <div className="value" style={{ color: "var(--brand-2)" }}>{stats.uniqueUsers || 0}</div>
                        <div className="hint">Active offenders</div>
                    </div>
                </div>
                <div className="card">
                    <div className="card__head"><p className="card__title">Top Platform</p></div>
                    <div className="card__body metric">
                        <div className="value" style={{ color: "var(--ok)", fontSize: 32 }}>ChatGPT</div>
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
                        </select>
                        <button className="btn" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Calendar size={16} />
                            <span>Last 30 Days</span>
                        </button>
                    </div>
                </div>
                
                <div style={{ overflowX: "auto" }}>
                    <table className="table" style={{ minWidth: 800 }}>
                        <thead>
                            <tr>
                                <th>Timestamp</th>
                                <th>Employee</th>
                                <th>Platform / URL</th>
                                <th>Violation Types</th>
                                <th>Severity</th>
                                <th style={{ textAlign: 'right' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence mode="popLayout">
                                {loading && violations.length === 0 ? (
                                    <motion.tr key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                        <td colSpan={6} style={{ textAlign: "center", padding: "40px 0", color: "var(--empty-state-text)" }}>
                                            Loading violations...
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
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                        <ExternalLink size={14} style={{ color: "var(--brand)", flexShrink: 0 }} />
                                                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "rgba(124,243,255,.92)" }} title={v.url}>
                                                            {v.url}
                                                        </span>
                                                    </div>
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
                <div style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-color)" }}>
                    <p style={{ margin: 0, fontSize: 13, color: "var(--text-secondary)" }}>
                        Showing <strong style={{ color: "var(--text-primary)" }}>{violations.length > 0 ? (page - 1) * 15 + 1 : 0}</strong> to <strong style={{ color: "var(--text-primary)" }}>{Math.min(page * 15, stats.total || 0)}</strong> of <strong style={{ color: "var(--text-primary)" }}>{stats.total || 0}</strong> results
                    </p>
                    <div style={{ display: "flex", gap: 8 }}>
                        <button 
                            onClick={() => setPage(p => Math.max(1, p - 1))} 
                            disabled={page === 1}
                            className="btn"
                            style={{ padding: "8px", height: "auto", opacity: page === 1 ? 0.5 : 1, cursor: page === 1 ? 'not-allowed' : 'pointer' }}
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button 
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                            disabled={page === totalPages || totalPages === 0}
                            className="btn"
                            style={{ padding: "8px", height: "auto", opacity: (page === totalPages || totalPages === 0) ? 0.5 : 1, cursor: (page === totalPages || totalPages === 0) ? 'not-allowed' : 'pointer' }}
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
