import React, { useState } from "react";
import axios from "axios";

const API = "http://localhost:5000/api/workflows";

const initialForm = {
  requestId: "REQ-1001",
  applicantName: "Aryan",
  age: 25,
  income: 50000,
  creditScore: 750,
  documentsComplete: true,
  idempotencyKey: "req-123"
};

const card = {
  background: "#fff",
  padding: 20,
  borderRadius: 16,
  boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
  marginBottom: 20
};

export default function App() {
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState(null);
  const [requestData, setRequestData] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : ["age", "income", "creditScore"].includes(name)
          ? Number(value)
          : value
    }));
  };

  const submitWorkflow = async () => {
    try {
      setLoading(true);
      const { idempotencyKey, ...payload } = form;
      const res = await axios.post(`${API}/applicationApproval/submit`, payload, {
        headers: { "idempotency-key": idempotencyKey }
      });
      setResult(res.data);
      setRequestData(res.data.data);
      setAuditLogs([]);
    } catch (error) {
      alert(error?.response?.data?.message || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  const fetchRequest = async () => {
    if (!requestData?._id) return;
    const res = await axios.get(`${API}/request/${requestData._id}`);
    setRequestData(res.data);
  };

  const fetchAudit = async () => {
    if (!requestData?._id) return;
    const res = await axios.get(`${API}/request/${requestData._id}/audit`);
    setAuditLogs(res.data);
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>
      <h1 style={{ marginBottom: 8 }}>Configurable Workflow Decision Platform</h1>
      <p style={{ color: "#555", marginTop: 0 }}>
        Minimal frontend for submitting and reviewing workflow decisions
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 20 }}>
        <div style={card}>
          <h2>Submit Request</h2>
          {["requestId", "applicantName", "age", "income", "creditScore", "idempotencyKey"].map((field) => (
            <div key={field} style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>{field}</label>
              <input
                name={field}
                value={form[field]}
                onChange={handleChange}
                style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ccc" }}
              />
            </div>
          ))}
          <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <input
              type="checkbox"
              name="documentsComplete"
              checked={form.documentsComplete}
              onChange={handleChange}
            />
            Documents Complete
          </label>
          <button onClick={submitWorkflow} style={btn}>{loading ? "Submitting..." : "Submit Workflow"}</button>
        </div>

        <div>
          <div style={card}>
            <h2>Working Routes</h2>
            <ul style={{ lineHeight: 1.8 }}>
              <li><b>POST</b> /api/workflows/applicationApproval/submit</li>
              <li><b>GET</b> /api/workflows/request/:id</li>
              <li><b>GET</b> /api/workflows/request/:id/audit</li>
            </ul>
          </div>

          {result && (
            <div style={card}>
              <h2>Decision Result</h2>
              <p><b>Message:</b> {result.message}</p>
              <p><b>Status:</b> {result.data?.status}</p>
              <p><b>Decision:</b> {result.data?.decision || "N/A"}</p>
              <p><b>Retry Count:</b> {result.data?.retryCount}</p>
              <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                <button onClick={fetchRequest} style={btnSecondary}>Fetch Request Details</button>
                <button onClick={fetchAudit} style={btnSecondary}>Fetch Audit Logs</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {requestData?.explanation?.length > 0 && (
        <div style={card}>
          <h2>Rule Trace</h2>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Rule", "Field", "Actual", "Expected", "Passed", "Reason"].map((h) => (
                  <th key={h} style={th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {requestData.explanation.map((item) => (
                <tr key={item.ruleId}>
                  <td style={td}>{item.ruleId}</td>
                  <td style={td}>{item.field}</td>
                  <td style={td}>{String(item.actualValue)}</td>
                  <td style={td}>{String(item.expectedValue)}</td>
                  <td style={td}>{item.passed ? "Yes" : "No"}</td>
                  <td style={td}>{item.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {requestData?.history?.length > 0 && (
        <div style={card}>
          <h2>Request History</h2>
          <ul>
            {requestData.history.map((h, idx) => (
              <li key={idx}>
                <b>{h.state}</b> — {h.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {auditLogs.length > 0 && (
        <div style={card}>
          <h2>Audit Logs</h2>
          <ul>
            {auditLogs.map((log) => (
              <li key={log._id} style={{ marginBottom: 10 }}>
                <b>{log.action}</b> — {new Date(log.createdAt).toLocaleString()}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

const btn = {
  background: "#111",
  color: "#fff",
  border: "none",
  padding: "12px 16px",
  borderRadius: 10,
  cursor: "pointer"
};

const btnSecondary = {
  background: "#e9eefb",
  color: "#111",
  border: "1px solid #c8d4ff",
  padding: "10px 14px",
  borderRadius: 10,
  cursor: "pointer"
};

const th = { textAlign: "left", padding: 10, borderBottom: "1px solid #ddd" };
const td = { padding: 10, borderBottom: "1px solid #eee" };