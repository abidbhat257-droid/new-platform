import Link from "next/link";
import { calculators } from "../lib/registry";
export default function Home() {
  const featured = calculators.slice(0, 8);
  return (
    <>
      <section className="bg-gradient-to-br from-pink-50 via-white to-rose-100">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <p className="mb-4 font-semibold uppercase tracking-widest text-pink-600">
            Private · practical · evidence-informed
          </p>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">
            Answers for every stage of{" "}
            <span className="text-pink-600">her health.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-slate-600">
            Simple, transparent calculators for cycles, fertility, pregnancy,
            fitness, nutrition, menopause and everyday wellbeing.
          </p>
          <Link className="btn mt-8 inline-block" href="/calculators">
            Explore all calculators
          </Link>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold">Popular tools</h2>
            <p className="mt-1 text-slate-600">
              Start with a question, leave with a clearer next step.
            </p>
          </div>
          <Link
            href="/calculators"
            className="text-sm font-semibold text-pink-700"
          >
            View all →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((c) => (
            <Link
              key={c.id}
              href={`/calculators/${c.slug}`}
              className="card transition hover:-translate-y-0.5 hover:border-pink-300"
            >
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-pink-600">
                {c.category}
              </div>
              <h3 className="font-semibold">{c.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{c.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
