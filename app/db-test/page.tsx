'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function DbTest() {
  const [out, setOut] = useState('loading...');

  useEffect(() => {
    supabase
      .from('tariffs')
      .select('*')
      .then(({ data, error }) => setOut(JSON.stringify({ data, error }, null, 2)));
  }, []);

  return <pre className="p-8 text-sm">{out}</pre>;
}