import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { Download, ChevronUp, Bell, Target, Layers } from 'lucide-react';

const Violations = () => {
    const [stats, setStats] = useState({});
    const [trends, setTrends] = useState([]);
    const [_loading, setLoading] = useState(true);

    const handleDownload = () => {
        if (!stats) return;
        
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Violation Type,Captured Events\n";
        
        Object.keys(stats).forEach(key => {
            if (key !== 'total' && key !== 'totalEvents' && key !== 'uniqueUsers') {
                csvContent += `${key},${stats[key]}\n`;
            }
        });
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `vantix_violations_report.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [statsRes, trendsRes] = await Promise.all([
                api.get('/violations/stats'),
                api.get('/analytics/trends')
            ]);
            if (statsRes.data.success) {
                setStats(statsRes.data.stats);
            }
            if (trendsRes.data.success) {
                setTrends(trendsRes.data.trends);
            }
        } catch (err) {
            console.error("Error fetching data", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Compute dynamic node map based on stats
    const breakdownKeys = Object.keys(stats).filter(k => k !== 'total' && k !== 'uniqueUsers');
    const nodes = breakdownKeys.map((key, i) => {
        const angle = (i / Math.max(breakdownKeys.length, 1)) * 2 * Math.PI - Math.PI / 2;
        const radius = 220 + (i % 2 === 0 ? 0 : 80); // stagger radii
        return {
            id: i,
            label: key,
            value: stats[key],
            x: Math.cos(angle) * radius,
            y: Math.sin(angle) * radius,
            size: 70 + Math.min(stats[key] * 2, 50)
        };
    });

    const criticalLeaks = (stats['Credit Card'] || 0) + (stats['AADHAAR_NUMBER'] || 0) + (stats['PAN_NUMBER'] || 0);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '800px', position: 'relative' }}>
            <style>{`
                .orion-content {
                    position: relative;
                    z-index: 1;
                    display: grid;
                    grid-template-columns: 320px 1fr 320px;
                    gap: 40px;
                    flex: 1;
                }

                .orion-col { display: flex; flex-direction: column; gap: 32px; }
                
                .orion-subtitle { font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 4px; }
                .orion-muted { font-size: 13px; color: var(--text-secondary); margin-bottom: 12px; }

                .orion-btn-group { display: flex; gap: 12px; margin-top: 12px; }
                .orion-btn {
                    padding: 8px 16px;
                    border-radius: 8px;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                }
                .orion-btn-primary {
                    background: #111827;
                    color: white;
                    border: 1px solid #111827;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                .orion-btn-outline {
                    background: #FFFFFF;
                    color: #111827;
                    border: 1px solid #E2E8F0;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
                }
                .orion-btn-outline:hover {
                    background: #F8FAFC;
                }

                .orion-big-number {
                    font-size: 54px;
                    font-weight: 700;
                    color: var(--text-primary);
                    margin: 8px 0;
                    letter-spacing: -2px;
                }

                /* Table Card */
                .orion-table-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 12px 0;
                    font-size: 14px;
                    border-bottom: 1px solid var(--bg-primary);
                }
                .orion-table-row:last-child { border-bottom: none; }
                .orion-dot { width: 8px; height: 8px; border-radius: 50%; background: #25e6d9; margin-right: 12px; }
                .orion-row-label { display: flex; align-items: center; flex: 1; color: var(--text-secondary); font-weight: 500; }
                .orion-row-val { font-weight: 600; color: var(--text-primary); width: 60px; text-align: right; }
                .orion-row-sub { color: var(--text-secondary); width: 50px; text-align: right; opacity: 0.6; }

                /* Center Mind Map */
                .orion-mindmap {
                    position: relative;
                    width: 100%;
                    height: 600px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-top: 40px;
                }
                .orion-node {
                    position: absolute;
                    border-radius: 50%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    z-index: 10;
                    box-shadow: 0 12px 32px rgba(138, 88, 252, 0.3);
                    background: radial-gradient(circle at 30% 30%, #a27bfc 0%, #753be8 100%);
                    transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
                .orion-node:hover { transform: scale(1.1); z-index: 20; }
                
                .orion-node-center {
                    width: 160px; height: 160px;
                    border-radius: 50%;
                    background: radial-gradient(circle at 30% 30%, #ff6b8b 0%, #ff4d6d 100%);
                    box-shadow: 0 12px 40px rgba(255, 77, 109, 0.4);
                    left: 50%; top: 50%;
                    transform: translate(-50%, -50%);
                    position: absolute;
                    z-index: 15;
                    border: 12px solid white;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    color: white;
                }
                .orion-node-center:hover { transform: translate(-50%, -50%) scale(1.05); }

                .orion-node-val { font-weight: 700; font-size: 18px; }
                .orion-node-label { font-size: 11px; opacity: 0.8; font-weight: 600; text-transform: uppercase; margin-top: 2px; }

                /* Chart Mini */
                .orion-chart-mini {
                    display: flex;
                    align-items: flex-end;
                    gap: 6px;
                    height: 50px;
                    margin-top: 16px;
                }
                .orion-bar-mini {
                    flex: 1;
                    background: var(--bg-primary);
                    border-radius: 4px;
                    position: relative;
                    overflow: hidden;
                }
                .orion-bar-mini-fill {
                    position: absolute;
                    bottom: 0; left: 0; right: 0;
                    background: var(--brand-blue);
                    border-radius: 4px;
                }
                .orion-trend {
                    display: inline-flex;
                    align-items: center;
                    color: var(--brand-blue);
                    font-size: 13px;
                    font-weight: 600;
                    margin-left: 8px;
                }


            `}</style>

            <div className="orion-content">
                {/* Left Panel */}
                <div className="orion-col">
                    <h1 style={{ marginBottom: 24 }}>General statistics</h1>

                    <div style={{ marginTop: 0 }}>
                        <div className="orion-muted" style={{marginBottom: 0}}>Critical Leaks Blocked</div>
                        <div className="orion-big-number">{criticalLeaks}</div>
                    </div>

                    <div className="card">
                        <div className="orion-subtitle" style={{marginBottom: 16}}>Quantity of data</div>
                        {breakdownKeys.map((key, i) => (
                            <div className="orion-table-row" key={key}>
                                <div className="orion-row-label">
                                    <div className="orion-dot" style={{ background: ['#25e6d9', '#8A58FC', '#ff4d6d', '#ffb020'][i % 4] }}></div>
                                    {key}
                                </div>
                                <div className="orion-row-val">{stats[key]}</div>
                                <div className="orion-row-sub">evt</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Center Mind Map */}
                <div className="orion-col" style={{ display: 'flex', justifyContent: 'center' }}>
                    <div className="orion-mindmap">
                        <svg style={{ position: 'absolute', top: '50%', left: '50%', overflow: 'visible', zIndex: 0 }}>
                            <defs>
                                <linearGradient id="gradLine" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#ff4d6d" />
                                    <stop offset="100%" stopColor="#8A58FC" />
                                </linearGradient>
                            </defs>
                            {nodes.map(n => (
                                <line 
                                    key={n.id}
                                    x1="0" y1="0"
                                    x2={n.x} y2={n.y}
                                    stroke="url(#gradLine)"
                                    strokeWidth="3"
                                />
                            ))}
                        </svg>

                        {/* Concentric rings behind center node */}
                        <div style={{ position: 'absolute', top: '50%', left: '50%', width: 300, height: 300, borderRadius: '50%', border: '4px dashed rgba(138,88,252,0.1)', transform: 'translate(-50%, -50%)', zIndex: 1 }}></div>

                        <div className="orion-node-center">
                            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: 'rgba(255,255,255,0.9)', marginTop: -8 }}>TOTAL</span>
                            <span style={{ fontSize: 38, fontWeight: 800, marginTop: 4 }}>{stats.total || 0}</span>
                            <span style={{ fontSize: 10, opacity: 0.8 }}>EVENTS</span>
                        </div>

                        {nodes.map(n => (
                            <div 
                                key={n.id} 
                                className="orion-node"
                                style={{
                                    width: n.size,
                                    height: n.size,
                                    left: `calc(50% + ${n.x}px)`,
                                    top: `calc(50% + ${n.y}px)`,
                                    transform: 'translate(-50%, -50%)'
                                }}
                            >
                                <span className="orion-node-val">{n.value}</span>
                                {n.size > 70 && <span className="orion-node-label">{n.label.substring(0, 8)}</span>}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Panel */}
                <div className="orion-col" style={{ alignItems: 'flex-end' }}>
                    <div style={{ textAlign: 'right', marginBottom: 40 }}>
                        <div className="orion-btn-group" style={{ justifyContent: 'flex-end' }}>
                            <button 
                                className="orion-btn orion-btn-outline" 
                                style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                                onClick={handleDownload}
                            >
                                <Download size={16} /> Download CSV Report
                            </button>
                        </div>
                    </div>

                    <div className="card" style={{ width: 280, marginBottom: 24 }}>
                        <div className="orion-subtitle">Violation Trends</div>
                        <div style={{ display: 'flex', alignItems: 'baseline', marginTop: 8 }}>
                            <div className="orion-big-number" style={{ margin: 0, fontSize: 32 }}>{stats.totalEvents || 0}</div>
                        </div>
                        <div className="orion-muted" style={{ fontSize: 11, marginTop: 4 }}>Total captured events</div>
                        
                        <div className="orion-chart-mini">
                            {trends.length > 0 ? trends.map((val, i) => {
                                const max = Math.max(...trends, 1);
                                const h = (val / max) * 100;
                                return (
                                    <div key={i} className="orion-bar-mini" style={{ margin: '0 2px' }}>
                                        <div className="orion-bar-mini-fill" style={{ height: `${h}%` }}></div>
                                    </div>
                                )
                            }) : <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>No trend data available</div>}
                        </div>
                    </div>

                    <div className="card" style={{ width: 280 }}>
                        <div className="orion-subtitle">Active Rules Triggered</div>
                        <div style={{ display: 'flex', alignItems: 'baseline', marginTop: 8 }}>
                            <div className="orion-big-number" style={{ margin: 0, fontSize: 32 }}>{breakdownKeys.length}</div>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
                            {breakdownKeys.slice(0,5).map((key, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div className="orion-dot" style={{ background: ['#2BAEE6', '#8A7BF3', '#76CDA1', '#FDE047'][i % 4], margin: 0 }}></div>
                                        <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{key}</span>
                                    </div>
                                    <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{stats[key]}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Violations;
