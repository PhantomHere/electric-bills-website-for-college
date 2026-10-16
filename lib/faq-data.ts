// Real content backing the FAQ preview on the home page and the /faq page.
export const FAQ: { q: string; a: string }[] = [
  {
    q: 'Is this connected to a real electricity provider?',
    a: 'No. The bills, meters and readings are seeded demo data, and nothing here is billed for real. Payments you make are recorded against the bill so you can see how balances change, but no card details are collected and no money moves.',
  },
  {
    q: 'How do I see my own bills after signing up?',
    a: 'A new account isn’t attached to a contract yet. Open Profile settings → Link your contract and enter your account number and contract number. For the demo, try account 100001 with contract C-2024-001.',
  },
  {
    q: 'How do I submit a meter reading?',
    a: 'Go to Meters & readings, pick your meter and enter the current values. The reading can’t be lower than the previous one. A controller reviews it, and only verified readings are used when a bill is generated.',
  },
  {
    q: 'How is a bill calculated?',
    a: 'From two verified readings at the start and end of the period. Each zone (day, night, peak — or a single rate for one-zone meters) is the difference between them, multiplied by the tariff in effect at the end of the period. Expand any bill to see the line-by-line breakdown.',
  },
  {
    q: 'What does each bill status mean?',
    a: 'Awaiting payment: issued and not yet due. Partially paid: some, but not all, has been paid. Overdue: past the due date with nothing paid. Paid: fully settled. The status is always computed from the payments, never typed in by hand.',
  },
  {
    q: 'How do I get staff access?',
    a: 'Open Profile settings and use “Work here?” to request a role. An admin reviews it under Staff → Access requests; approving it switches your role immediately. Controllers review readings, operators generate bills and record payments, admins manage access, viewers can look but not change anything.',
  },
  {
    q: 'What happens when this is connected to Supabase?',
    a: 'The browser storage is replaced by real Postgres tables and Supabase Auth. The rules — billing, status, validation, roles — stay exactly the same; they are already written the way the database functions work.',
  },
];
