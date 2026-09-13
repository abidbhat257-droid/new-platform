"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { calculators } from "../../lib/registry";
export default function Calculators() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const cats = [
    "All",
    ...Array.from(new Set(calculators.map((c) => c.category))),
  ];
  const shown = useMemo(
    () =>
      calculators.filter(
        (c) =>
          (cat === "All" || c.category === cat) &&
          `${c.title} ${c.description} ${c.keywords.join(" ")}`
            .toLowerCase()
            .includes(q.toLowerCase()),
      ),
    [q, cat],
  );
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-4xl font-bold">All calculators</h1>
      <p className="mt-3 max-w-2xl text-slate-600">
        Explore {calculators.length} free tools. No account, no tracking, no
        saved health data.
      </p>
      <div className="mt-8 grid gap-3 md:grid-cols-[1fr_280px]">
        <input
          className="input"
          placeholder="Search calculators…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className="input"
          value={cat}
          onChange={(e) => setCat(e.target.value)}
        >
          {cats.map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
      </div>
      <p className="mt-6 text-sm text-slate-500">{shown.length} results</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((c) => (
          <Link
            className="card hover:border-pink-300"
            href={`/calculators/${c.slug}`}
            key={c.id}
          >
            <div className="text-xs font-semibold uppercase text-pink-600">
              {c.category}
            </div>
            <h2 className="mt-2 font-semibold">{c.title}</h2>
            <p className="mt-2 text-sm text-slate-600">{c.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
