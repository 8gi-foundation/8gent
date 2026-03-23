"use client";

import { useState, useCallback } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

interface TherapistReportProps {
  tenantId: Id<"tenants">;
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function defaultStartDate(): string {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return formatDate(d);
}

export default function TherapistReport({ tenantId }: TherapistReportProps) {
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(() => formatDate(new Date()));
  const [active, setActive] = useState(false);

  const startMs = new Date(startDate).getTime();
  const endMs = new Date(endDate).setHours(23, 59, 59, 999);

  const report = useQuery(
    api.dataManagement.generateTherapistReport,
    active ? { tenantId, startDate: startMs, endDate: endMs } : "skip"
  );

  const generateCsv = useCallback(() => {
    if (!report || !report.dailyBreakdown.length) return;

    const header = "Date,Sentences,Unique Words,Avg Length";
    const rows = report.dailyBreakdown.map((d) => {
      // Count unique words for this day from topWords isn't per-day,
      // so we use the daily count and avg length which are per-day
      return `${d.date},${d.count},,${d.avgLength}`;
    });

    // Add a summary row
    rows.push("");
    rows.push(`Total,${report.totalSentences},${report.uniqueWords},${report.avgSentenceLength}`);

    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `therapist-report-${startDate}-to-${endDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [report, startDate, endDate]);

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: 24 }}>
      <h2
        style={{
          fontFamily: "'Fraunces', serif",
          fontSize: 28,
          fontWeight: 700,
          color: "#2D2017",
          marginBottom: 8,
        }}
      >
        Therapist Report
      </h2>
      <p style={{ color: "#6B5B4F", fontSize: 14, marginBottom: 24 }}>
        Communication progress data for sharing with your SLT.
      </p>

      {/* Date range picker */}
      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "end",
          flexWrap: "wrap",
          marginBottom: 24,
        }}
      >
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#6B5B4F" }}>
            From
          </span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={S.input}
          />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#6B5B4F" }}>
            To
          </span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={S.input}
          />
        </label>
        <button
          onClick={() => setActive(true)}
          style={{
            ...S.btn,
            background: "#E8610A",
            color: "#fff",
          }}
        >
          Generate Report
        </button>
      </div>

      {/* Loading state */}
      {active && report === undefined && (
        <p style={{ color: "#6B5B4F" }}>Loading report...</p>
      )}

      {/* Report display */}
      {report && (
        <>
          {report.totalSentences === 0 ? (
            <div style={S.card}>
              <p style={{ color: "#6B5B4F", textAlign: "center" }}>
                No communication data found for this period.
              </p>
            </div>
          ) : (
            <>
              {/* Summary cards */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                  gap: 12,
                  marginBottom: 24,
                }}
              >
                <StatCard label="Total Sentences" value={report.totalSentences} />
                <StatCard label="Unique Words" value={report.uniqueWords} />
                <StatCard label="Avg Length" value={`${report.avgSentenceLength} words`} />
                <StatCard
                  label="Vocab Growth"
                  value={`${report.vocabularyGrowth >= 0 ? "+" : ""}${report.vocabularyGrowth}`}
                />
              </div>

              {/* Top words */}
              {report.topWords.length > 0 && (
                <div style={{ ...S.card, marginBottom: 16 }}>
                  <h3 style={S.h3}>Top Words</h3>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {report.topWords.slice(0, 12).map((tw) => (
                      <span
                        key={tw.word}
                        style={{
                          background: "#FFF3E8",
                          border: "1px solid #E8610A33",
                          borderRadius: 16,
                          padding: "4px 12px",
                          fontSize: 13,
                          color: "#2D2017",
                        }}
                      >
                        {tw.word}{" "}
                        <span style={{ color: "#E8610A", fontWeight: 600 }}>
                          {tw.count}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Daily breakdown */}
              {report.dailyBreakdown.length > 0 && (
                <div style={{ ...S.card, marginBottom: 16 }}>
                  <h3 style={S.h3}>Daily Breakdown</h3>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                    <thead>
                      <tr style={{ borderBottom: "2px solid #E8E0D8" }}>
                        <th style={S.th}>Date</th>
                        <th style={S.th}>Sentences</th>
                        <th style={S.th}>Avg Length</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.dailyBreakdown.map((d) => (
                        <tr key={d.date} style={{ borderBottom: "1px solid #F0E8E0" }}>
                          <td style={S.td}>{d.date}</td>
                          <td style={S.td}>{d.count}</td>
                          <td style={S.td}>{d.avgLength}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Export CSV */}
              <button onClick={generateCsv} style={{ ...S.btn, background: "#2D2017", color: "#fff" }}>
                Export CSV
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={S.card}>
      <div style={{ fontSize: 13, color: "#6B5B4F", marginBottom: 4 }}>{label}</div>
      <div
        style={{
          fontFamily: "'Fraunces', serif",
          fontSize: 24,
          fontWeight: 700,
          color: "#E8610A",
        }}
      >
        {value}
      </div>
    </div>
  );
}

const S = {
  card: { background: "#FFFBF7", border: "1px solid #E8E0D8", borderRadius: 12, padding: 16 } as React.CSSProperties,
  input: { padding: "8px 12px", borderRadius: 8, border: "1px solid #E8E0D8", fontSize: 14, background: "#FFFBF7", color: "#2D2017" } as React.CSSProperties,
  btn: { padding: "10px 20px", borderRadius: 8, border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer" } as React.CSSProperties,
  h3: { fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 600, color: "#2D2017", marginBottom: 12, marginTop: 0 } as React.CSSProperties,
  th: { textAlign: "left" as const, padding: "8px 4px", color: "#6B5B4F", fontWeight: 600 },
  td: { padding: "8px 4px", color: "#2D2017" },
};
