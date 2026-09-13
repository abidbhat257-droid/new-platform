import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { bySlug, calculators } from "../../../lib/registry";
import CalculatorForm from "../../../components/CalculatorForm";
import Link from "next/link";
export function generateStaticParams() {
  return calculators.map((c) => ({ slug: c.slug }));
}
export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const c = bySlug(params.slug);
  return c
    ? {
        title: c.title,
        description: c.description,
        keywords: c.keywords,
        openGraph: {
          title: `${c.title} | HerCalc`,
          description: c.description,
          type: "article",
        },
      }
    : { title: "Calculator" };
}
export default function Detail({ params }: { params: { slug: string } }) {
  const c = bySlug(params.slug);
  if (!c) return notFound();
  const related = c.related
    .map((id) => calculators.find((x) => x.id === id))
    .filter(Boolean);
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: c.title,
    description: c.description,
    applicationCategory: "HealthApplication",
    operatingSystem: "Web",
    url: `https://hercalc.example/calculators/${c.slug}`,
  };
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <div className="mb-8">
        <Link href="/calculators" className="text-sm text-pink-700">
          ← All calculators
        </Link>
        <div className="mt-5 text-sm font-semibold uppercase tracking-wide text-pink-600">
          {c.category}
        </div>
        <h1 className="mt-2 text-4xl font-bold">{c.title}</h1>
        <p className="mt-3 max-w-2xl text-lg text-slate-600">{c.description}</p>
      </div>
      <CalculatorForm slug={params.slug} />
      <article className="prose prose-slate mt-12 max-w-none">
        <h2>How this works</h2>
        <p>{c.methodology}</p>
        <h2>Common questions</h2>
        {c.faq.map((f) => (
          <div key={f.q}>
            <h3>{f.q}</h3>
            <p>{f.a}</p>
          </div>
        ))}
        <p className="rounded-xl bg-pink-50 p-4 text-sm">
          <strong>Important:</strong> This tool is for education only and cannot
          diagnose, treat, or replace professional medical care. Seek urgent
          care for severe symptoms or emergencies.
        </p>
      </article>
      <section className="mt-12">
        <h2 className="text-2xl font-bold">You may also like</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {related.map(
            (r) =>
              r && (
                <Link
                  key={r.id}
                  href={`/calculators/${r.slug}`}
                  className="card hover:border-pink-300"
                >
                  <h3 className="font-semibold">{r.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{r.description}</p>
                </Link>
              ),
          )}
        </div>
      </section>
    </div>
  );
}
