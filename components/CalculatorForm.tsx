"use client";
import { useState } from "react";
import { bySlug } from "../lib/registry";
import type { Result } from "../lib/types";
import { validateFields } from "../lib/validation";
export default function CalculatorForm({ slug }: { slug: string }) {
  const c = bySlug(slug);
  const [values, setValues] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Result[]>([]);
  const [error, setError] = useState("");
  if (!c) return null;
  const calculator = c;
  function submit(e: React.FormEvent) {
    e.preventDefault();
    const validationError = validateFields(calculator.fields, values);
    if (validationError) {
      setError(validationError);
      setResults([]);
      return;
    }
    setError("");
    try {
      setResults(calculator.calculate(values));
    } catch {
      setError(
        "We could not calculate that. Check your entries and try again.",
      );
    }
  }
  return (
    <div className="grid gap-6 md:grid-cols-[1fr_1fr]">
      <form onSubmit={submit} className="card space-y-4">
        {c.fields.map((f) => (
          <label
            key={f.name}
            className="block text-sm font-medium text-slate-700"
          >
            {f.label}
            {f.required && " *"}
            <div className="mt-1 flex items-center gap-2">
              {f.type === "select" ? (
                <select
                  className="input"
                  id={f.name}
                  name={f.name}
                  required={f.required}
                  value={values[f.name] || ""}
                  onChange={(e) =>
                    setValues({ ...values, [f.name]: e.target.value })
                  }
                >
                  <option value="">Choose...</option>
                  {f.options?.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  className="input"
                  id={f.name}
                  name={f.name}
                  required={f.required}
                  type={f.type}
                  min={f.min}
                  max={f.max}
                  step={f.step}
                  value={values[f.name] || ""}
                  onChange={(e) =>
                    setValues({ ...values, [f.name]: e.target.value })
                  }
                />
              )}{" "}
              {f.unit && (
                <span className="text-xs text-slate-500">{f.unit}</span>
              )}
            </div>
          </label>
        ))}
        {error && (
          <p
            role="alert"
            className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </p>
        )}
        <button className="btn w-full" type="submit">
          Calculate
        </button>
        <p className="text-xs text-slate-500">
          Your entries stay in this browser and are never saved.
        </p>
      </form>
      <section aria-live="polite" className="card min-h-48">
        {results.length ? (
          <>
            <h2 className="mb-4 text-lg font-semibold">Your results</h2>
            <div className="space-y-4">
              {results.map((r) => (
                <div
                  key={r.label}
                  className="border-b border-slate-100 pb-3 last:border-0"
                >
                  <div className="text-sm text-slate-500">{r.label}</div>
                  <div className="text-2xl font-bold text-pink-700">
                    {r.value}
                  </div>
                  {r.detail && (
                    <div className="mt-1 text-sm text-slate-600">
                      {r.detail}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex h-full min-h-40 items-center justify-center text-center text-slate-500">
            Enter your details to see an estimate.
          </div>
        )}
      </section>
    </div>
  );
}
