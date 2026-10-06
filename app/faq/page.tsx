import { FAQ } from '@/lib/faq-data';
import { PageHeader } from '@/components/PageHeader';

export default function FaqPage() {
  return (
    <main>
      <PageHeader
        title="Frequently asked questions"
        subtitle="How this demo account and billing works, and what's real versus mocked"
      />
      <div className="mx-auto max-w-6xl px-8 py-16">
        <dl className="max-w-2xl divide-y divide-[#f0f0f0] rounded-2xl border border-[#e8e8e8]">
          {FAQ.map((item) => (
            <div key={item.q} className="px-6 py-6">
              <dt className="font-semibold">{item.q}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-[#666]">{item.a}</dd>
            </div>
          ))}
        </dl>
      </div>
    </main>
  );
}
