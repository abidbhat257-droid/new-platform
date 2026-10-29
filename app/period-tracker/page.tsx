"use client";
import { useEffect, useMemo, useState } from "react";

const key = "hercalc-period-history";
const average = (values: number[]) => values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
export default function PeriodTracker() {
  const [history, setHistory] = useState<string[]>([]);
  useEffect(() => {
    try { setHistory(JSON.parse(localStorage.getItem(key) || "[]")); } catch { setHistory([]); }
  }, []);
  const [date, setDate] = useState("");
  const lengths = history.slice(1).map((value, index) =>
    Math.round((Date.parse(value) - Date.parse(history[index])) / 86400000));
  const avg = average(lengths);
  const variation = lengths.length ? Math.max(...lengths) - Math.min(...lengths) : 0;
  const prediction = history.length && avg ? new Date(Date.parse(history[history.length - 1]) + avg * 86400000).toISOString().slice(0, 10) : "";
  function add() {
    if (!date || history.includes(date)) return;
    const next = [...history, date].sort();
    setHistory(next);
    localStorage.setItem(key, JSON.stringify(next));
    setDate("");
  }
  function clear() { setHistory([]); localStorage.removeItem(key); }
  const summary = useMemo(() => history.length ? `${history.length} period starts recorded` : "No history stored", [history]);
  return <main className="mx-auto max-w-3xl px-4 py-12">
    <h1 className="text-4xl font-bold">Private period tracker</h1>
    <p className="mt-3 text-slate-600">Dates stay in this browser only. We do not send or profile your health history.</p>
    <div className="card mt-8 space-y-4">
      <label className="block text-sm font-medium">Period start date
        <input className="input mt-1" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </label>
      <div className="flex gap-2"><button className="btn" onClick={add}>Add date</button><button className="btn-secondary" onClick={clear}>Clear history</button></div>
    </div>
    <section className="card mt-6" aria-live="polite">
      <p className="text-sm text-slate-500">{summary}</p>
      <dl className="mt-4 grid gap-4 sm:grid-cols-3">
        <div><dt className="text-sm text-slate-500">Average cycle</dt><dd className="text-xl font-bold">{avg ? `${avg.toFixed(1)} days` : "Add 2+"}</dd></div>
        <div><dt className="text-sm text-slate-500">Variation</dt><dd className="text-xl font-bold">{lengths.length ? `${variation} days` : "Add 2+"}</dd></div>
        <div><dt className="text-sm text-slate-500">Next estimate</dt><dd className="text-xl font-bold">{prediction || "Add 2+"}</dd></div>
      </dl>
      <p className="mt-4 text-xs text-slate-500">Predictions are estimates, not contraception or medical advice. Irregular cycles or concerning symptoms merit clinical advice.</p>
    </section>
  </main>;
}
