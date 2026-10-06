// Real content, not filler — this is what actually backs the FAQ section
// on the home page and the full /faq page.
export const FAQ: { q: string; a: string }[] = [
  {
    q: 'Is this connected to a real electricity provider?',
    a: 'No. Every bill, meter reading and account here is seeded mock data. Nothing is billed for real, and no real payment is ever taken.',
  },
  {
    q: 'How do I get staff access?',
    a: 'Open Profile settings and use "Work here?" to request a role. An admin reviews the request under Dashboard → Access requests and can approve or reject it — approving switches your role immediately.',
  },
  {
    q: 'How is a bill amount calculated?',
    a: 'From two meter readings a period apart, split into day/night/peak zones where the meter supports it, each zone priced at the tariff in effect at the end of the period.',
  },
  {
    q: 'What happens once this is connected to Supabase?',
    a: 'The mock data and the local-storage login are replaced by real Postgres tables and Supabase Auth. The role logic, bill filtering and approval flow stay exactly as they are now.',
  },
  {
    q: 'Why does my new account have no bills?',
    a: 'A freshly registered account isn\u2019t linked to an abonent record yet. In the real system that link happens when the utility opens a contract for you; here it\u2019s simply not simulated for new signups.',
  },
];
