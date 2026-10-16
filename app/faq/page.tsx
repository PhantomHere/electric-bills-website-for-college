'use client';

import { FAQ } from '@/lib/faq-data';
import { FaqAccordion } from '@/components/FaqAccordion';
import { PageHeader } from '@/components/PageHeader';

export default function FaqPage() {
  return (
    <main>
      <PageHeader title="Frequently asked questions" subtitle="How accounts, readings and billing work — and what's demo data" />
      <div className="mx-auto max-w-3xl px-6 py-12 sm:px-8">
        <FaqAccordion items={FAQ} />
      </div>
    </main>
  );
}
