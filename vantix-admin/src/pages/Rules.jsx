import React, { useEffect, useState } from "react";
import api from "../utils/api";

const NUMBER_TYPE_LABELS = {
  phone:          "Phone / Contact No.",
  account_number: "Bank Account",
  ifsc:           "IFSC Code",
  aadhaar:        "Aadhaar",
  pan:            "PAN",
  employee_id:    "Employee ID",
  other:          "Other",
};

const EMPTY_APIKEY = { label: "", value: "" };
const EMPTY_NUMBER = { label: "", type: "phone", value: "" };

const Rules = () => {
  const [rules, setRules] = useState({
    domains: [], keywords: [], customPatterns: [], apiKeys: [], sensitiveNumbers: [], monitoredApps: [],
  });
  const [newDomain,  setNewDomain]  = useState("");
  const [newKeyword, setNewKeyword] = useState("");
  const [newApiKey,  setNewApiKey]  = useState(EMPTY_APIKEY);
  const [newNumber,  setNewNumber]  = useState(EMPTY_NUMBER);
  const [newApp,     setNewApp]     = useState("");
  const [busy, setBusy] = useState(false);

  const fetchRules = async () => {
    try {
      const res = await api.get("/rules");
      setRules({
        domains:          res.data.companyRules?.domains          || [],
        keywords:         res.data.companyRules?.keywords         || [],
        customPatterns:   res.data.companyRules?.customPatterns   || [],
        apiKeys:          res.data.companyRules?.apiKeys          || [],
        sensitiveNumbers: res.data.companyRules?.sensitiveNumbers || [],
        monitoredApps:    res.data.companyRules?.monitoredApps    || [],
      });
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchRules(); }, []);

  const wrap = (fn) => async (...args) => {
    try {
      setBusy(true);
      await fn(...args);
      await fetchRules();
    } catch (err) {
      console.error(err);
    } finally {
      setBusy(false);
    }
  };

  const handleAddDomain  = wrap(async (e) => { e.preventDefault(); await api.post("/rules/domain",  { domain:  newDomain  }); setNewDomain("");  });
  const handleAddKeyword = wrap(async (e) => { e.preventDefault(); await api.post("/rules/keyword", { keyword: newKeyword }); setNewKeyword(""); });
  const handleAddApiKey  = wrap(async (e) => { e.preventDefault(); await api.post("/rules/apikey",  newApiKey); setNewApiKey(EMPTY_APIKEY); });
  const handleAddNumber  = wrap(async (e) => { e.preventDefault(); await api.post("/rules/number",  newNumber); setNewNumber(EMPTY_NUMBER); });

  const handleRemoveDomain  = wrap((domain)  => api.delete("/rules/domain",        { data: { domain  } }));
  const handleRemoveKeyword = wrap((keyword) => api.delete("/rules/keyword",       { data: { keyword } }));
  const handleRemoveApiKey  = wrap((id)      => api.delete(`/rules/apikey/${id}`));
  const handleRemoveNumber  = wrap((id)      => api.delete(`/rules/number/${id}`));

  const handleAddApp = wrap(async (e) => {
    e.preventDefault();
    if (!newApp.trim()) return;
    const updated = [...(rules.monitoredApps || []), newApp.trim()];
    await api.put("/rules", { monitoredApps: updated });
    setNewApp("");
  });

  const handleRemoveApp = wrap(async (appToRemove) => {
    const updated = (rules.monitoredApps || []).filter(a => a !== appToRemove);
    await api.put("/rules", { monitoredApps: updated });
  });

  const totalRules = rules.domains.length + rules.keywords.length + rules.apiKeys.length + rules.sensitiveNumbers.length + rules.monitoredApps.length;
  const autoDetectedCount = rules.apiKeys.filter(k => k.auto_detected).length;

  /* ── shared row style used by all 4 forms ── */
  const formRow = {
    display: "flex",
    gap: 12,
    alignItems: "flex-end",
    flexWrap: "wrap",
  };
  const fieldGrow  = { display: "flex", flexDirection: "column", gap: 6, flex: "1 1 150px" };
  const fieldFixed = { display: "flex", flexDirection: "column", gap: 6, flex: "1 1 130px" };
  const btnWrap    = { flex: "0 0 100px" };
  const btnFull    = { width: "100%", height: 42, borderRadius: 8 };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* ── Top Stats ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 4 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em' }}>Detection Engine</h2>
          <p style={{ margin: "4px 0 0", fontSize: 11, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: 1.2, fontWeight: 600 }}>
            Policy Configuration & Security Rules
          </p>
        </div>
        <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
          <div style={{ textAlign: "right" }}>
            <div className="value gradient-teal" style={{ fontSize: 28, fontWeight: 800 }}>{totalRules}</div>
            <div style={{ fontSize: 10, color: "var(--muted-2)", textTransform: "uppercase", letterSpacing: 1, fontWeight: 700 }}>Total Rules</div>
          </div>
          <div style={{ width: 1, height: 32, backgroundColor: "var(--border-color)" }}></div>
          <div style={{ textAlign: "right" }}>
            <div className="value gradient-blue" style={{ fontSize: 28, fontWeight: 800 }}>{autoDetectedCount}</div>
            <div style={{ fontSize: 10, color: "var(--muted-2)", textTransform: "uppercase", letterSpacing: 1, fontWeight: 700 }}>Auto-Detected</div>
          </div>
        </div>
      </div>

      <div className="grid grid--2">
        {/* ── Protected Domains ── */}
        <section className="card">
          <div className="card__head" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p className="card__title">Protected Domains</p>
            <span className="badge badge--employee">{rules.domains.length} active</span>
          </div>
          <div className="card__body">
            <form onSubmit={handleAddDomain}>
              <div style={formRow}>
                <div style={fieldGrow}>
                  <div className="label">Domain Pattern</div>
                  <input className="input" type="text" value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                    placeholder="@company.com" required style={{ borderRadius: 8 }} />
                </div>
                <div style={btnWrap}>
                  <button className="btn btn--primary" type="submit"
                    disabled={busy} style={btnFull}>
                    Add
                  </button>
                </div>
              </div>
            </form>

            <div style={{ marginTop: 16 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Domain</th>
                    <th style={{ width: 80, textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rules.domains.map((d, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 500 }}>{d}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button className="btn btn--danger" type="button"
                          onClick={() => handleRemoveDomain(d)} disabled={busy} style={{ height: 28, padding: '0 10px', fontSize: 11, borderRadius: 6 }}>
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                  {rules.domains.length === 0 && (
                    <tr><td colSpan={2} style={{ color: "var(--empty-state-text)", textAlign: 'center', padding: '24px 0' }}>No domains configured</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── Secret Keywords ── */}
        <section className="card">
          <div className="card__head" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p className="card__title">Secret Keywords</p>
            <span className="badge badge--employee">{rules.keywords.length} active</span>
          </div>
          <div className="card__body">
            <form onSubmit={handleAddKeyword}>
              <div style={formRow}>
                <div style={fieldGrow}>
                  <div className="label">Keyword</div>
                  <input className="input" type="text" value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    placeholder="Project Falcon" required style={{ borderRadius: 8 }} />
                </div>
                <div style={btnWrap}>
                  <button className="btn btn--primary" type="submit"
                    disabled={busy} style={btnFull}>
                    Add
                  </button>
                </div>
              </div>
            </form>

            <div style={{ marginTop: 16 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Keyword</th>
                    <th style={{ width: 80, textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rules.keywords.map((k, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 500 }}>{k}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button className="btn btn--danger" type="button"
                          onClick={() => handleRemoveKeyword(k)} disabled={busy} style={{ height: 28, padding: '0 10px', fontSize: 11, borderRadius: 6 }}>
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                  {rules.keywords.length === 0 && (
                    <tr><td colSpan={2} style={{ color: "var(--empty-state-text)", textAlign: 'center', padding: '24px 0' }}>No keywords configured</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── Desktop Watchlist ── */}
        <section className="card" style={{ gridColumn: "1 / -1" }}>
          <div className="card__head" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p className="card__title">Desktop Agent Watchlist</p>
              <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--text-secondary)" }}>
                Specify desktop applications (e.g. ChatGPT, Slack) for the agent to monitor keystrokes on.
              </p>
            </div>
            <span className="badge badge--admin">{(rules.monitoredApps || []).length} apps</span>
          </div>
          <div className="card__body">
            <form onSubmit={handleAddApp}>
              <div style={formRow}>
                <div style={fieldGrow}>
                  <div className="label">Application Name (Window Title)</div>
                  <input className="input" type="text" value={newApp}
                    onChange={(e) => setNewApp(e.target.value)}
                    placeholder="ChatGPT" required style={{ borderRadius: 8 }} />
                </div>
                <div style={btnWrap}>
                  <button className="btn btn--primary" type="submit"
                    disabled={busy} style={{ ...btnFull, width: 120 }}>
                    Add App
                  </button>
                </div>
              </div>
            </form>

            <div style={{ marginTop: 18 }}>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {(rules.monitoredApps || []).map((app, i) => (
                  <div key={i} className="badge" style={{
                    padding: "6px 14px",
                    borderRadius: 12,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    background: "var(--panel)",
                    borderColor: "var(--border-color)",
                    fontSize: 13,
                    color: "var(--text-primary)",
                    fontWeight: 500,
                  }}>
                    <span>{app}</span>
                    <button type="button" onClick={() => handleRemoveApp(app)} disabled={busy}
                      style={{ background: "transparent", border: "none", color: "var(--danger)", cursor: "pointer", padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      title={`Remove ${app}`}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                  </div>
                ))}
                {(!rules.monitoredApps || rules.monitoredApps.length === 0) && (
                  <span style={{ color: "var(--empty-state-text)", fontSize: 13 }}>No desktop apps monitored</span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── API Keys ── */}
        <section className="card" style={{ gridColumn: "1 / -1" }}>
          <div className="card__head" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p className="card__title">Protected API Keys</p>
              <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--text-secondary)" }}>
                Encrypted AES-256-GCM · only hint chars shown
              </p>
            </div>
            <span className="badge badge--employee">{rules.apiKeys.length} rules</span>
          </div>
          <div className="card__body">
            <form onSubmit={handleAddApiKey}>
              <div style={formRow}>
                <div style={fieldFixed}>
                  <div className="label">Label</div>
                  <input className="input" type="text" value={newApiKey.label}
                    onChange={(e) => setNewApiKey((s) => ({ ...s, label: e.target.value }))}
                    placeholder="Stripe Live Key" required style={{ borderRadius: 8 }} />
                </div>
                <div style={fieldGrow}>
                  <div className="label">Key Value</div>
                  <input className="input" type="password" value={newApiKey.value}
                    onChange={(e) => setNewApiKey((s) => ({ ...s, value: e.target.value }))}
                    placeholder="sk_live_••••••••" required style={{ borderRadius: 8 }} />
                </div>
                <div style={btnWrap}>
                  <button className="btn btn--primary" type="submit"
                    disabled={busy} style={{ ...btnFull, width: 120 }}>
                    Add Key
                  </button>
                </div>
              </div>
            </form>

            <div style={{ marginTop: 16 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Label</th>
                    <th>Hint</th>
                    <th>Source</th>
                    <th style={{ width: 80, textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rules.apiKeys.map((k) => (
                    <tr key={k._id}>
                      <td style={{ fontWeight: 600 }}>{k.label}</td>
                      <td style={{ fontFamily: "var(--mono)", letterSpacing: 2, color: "var(--muted-text)", fontSize: 12 }}>
                        ••••{k.hint}
                      </td>
                      <td>
                        {k.auto_detected ? (
                          <span className="badge badge--admin" style={{ fontSize: 10 }}>Auto-detected</span>
                        ) : (
                          <span style={{ color: "var(--empty-state-text)", fontSize: 12, fontWeight: 500 }}>Manual</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button className="btn btn--danger" type="button"
                          onClick={() => handleRemoveApiKey(k._id)} disabled={busy} style={{ height: 28, padding: '0 10px', fontSize: 11, borderRadius: 6 }}>
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                  {rules.apiKeys.length === 0 && (
                    <tr><td colSpan={4} style={{ color: "var(--empty-state-text)", textAlign: 'center', padding: '24px 0' }}>No API keys configured</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── Sensitive Numbers ── */}
        <section className="card" style={{ gridColumn: "1 / -1" }}>
          <div className="card__head" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p className="card__title">Sensitive Identifiers</p>
              <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--text-secondary)" }}>
                Monitors for Aadhaar, PAN, and Bank details
              </p>
            </div>
            <span className="badge badge--employee">{rules.sensitiveNumbers.length} rules</span>
          </div>
          <div className="card__body">
            <form onSubmit={handleAddNumber}>
              <div style={formRow}>
                <div style={fieldFixed}>
                  <div className="label">Label</div>
                  <input className="input" type="text" value={newNumber.label}
                    onChange={(e) => setNewNumber((s) => ({ ...s, label: e.target.value }))}
                    placeholder="Support Hotline" required style={{ borderRadius: 8 }} />
                </div>
                <div style={{ ...fieldFixed, flex: "0 1 160px" }}>
                  <div className="label">Type</div>
                  <select className="input" value={newNumber.type}
                    onChange={(e) => setNewNumber((s) => ({ ...s, type: e.target.value }))} style={{ borderRadius: 8, cursor: 'pointer' }}>
                    {Object.entries(NUMBER_TYPE_LABELS).map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </div>
                <div style={fieldFixed}>
                  <div className="label">Value</div>
                  <input className="input" type="password" value={newNumber.value}
                    onChange={(e) => setNewNumber((s) => ({ ...s, value: e.target.value }))}
                    placeholder="+91 98765 43210" required style={{ borderRadius: 8 }} />
                </div>
                <div style={btnWrap}>
                  <button className="btn btn--primary" type="submit"
                    disabled={busy} style={btnFull}>
                    Add
                  </button>
                </div>
              </div>
            </form>

            <div style={{ marginTop: 16 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Label</th>
                    <th>Type</th>
                    <th>Hint</th>
                    <th style={{ width: 80, textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rules.sensitiveNumbers.map((n) => (
                    <tr key={n._id}>
                      <td style={{ fontWeight: 600 }}>{n.label}</td>
                      <td><span className="badge" style={{ fontSize: 11, background: 'rgba(255,255,255,0.03)' }}>{NUMBER_TYPE_LABELS[n.type] ?? n.type}</span></td>
                      <td style={{ fontFamily: "var(--mono)", letterSpacing: 2, color: "var(--muted-text)", fontSize: 12 }}>
                        ••••{n.hint}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button className="btn btn--danger" type="button"
                          onClick={() => handleRemoveNumber(n._id)} disabled={busy} style={{ height: 28, padding: '0 10px', fontSize: 11, borderRadius: 6 }}>
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                  {rules.sensitiveNumbers.length === 0 && (
                    <tr><td colSpan={4} style={{ color: "var(--empty-state-text)", textAlign: 'center', padding: '24px 0' }}>No identifiers configured</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default Rules;