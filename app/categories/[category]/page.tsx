import Link from "next/link";
import { notFound } from "next/navigation";
import { activeCalculators, categories } from "../../../lib/registry";

const slug = (category: string) =>
  category.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export function generateStaticParams() {
  return categories.map((category) => ({ category: slug(category) }));
}

export default function CategoryPage({ params }: { params: { category: string } }) {
  const category = categories.find((item) => slug(item) === params.category);
  if (!category) return notFound();
  const tools = activeCalculators.filter((calculator) => calculator.category === category);
  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <Link href="/calculators" className="text-sm text-pink-700">All calculators</Link>
      <h1 className="mt-5 text-4xl font-bold">{category} calculators</h1>
      <p className="mt-3 max-w-2xl text-slate-600">
        Private, educational tools for {category.toLowerCase()}. Your entries stay in your browser.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((calculator) => (
          <Link className="card hover:border-pink-300" href={`/calculators/${calculator.slug}`} key={calculator.id}>
            <h2 className="font-semibold">{calculator.title}</h2>
            <p className="mt-2 text-sm text-slate-600">{calculator.description}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
