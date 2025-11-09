'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Home() {
  const [items, setItems] = useState<any[]>([]);
  const [q, setQ] = useState('');
  const [platform, setPlatform] = useState('all');

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('items')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(300);
      setItems(data || []);
    })();
  }, []);

  const filtered = useMemo(() => {
    return items.filter(item => {
      if (platform !== 'all' && item.platform !== platform) return false;
      const hay = `${item.title ?? ''} ${item.tags ?? ''} ${item.notes ?? ''} ${item.url}`.toLowerCase();
      return hay.includes(q.toLowerCase());
    });
  }, [items, q, platform]);

  return (
    <main style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, fontWeight: 600 }}>Your Saved Reels</h1>

      <div style={{ margin: '16px 0', display: 'flex', gap: 8 }}>
        <input
          placeholder="Search…"
          value={q}
          onChange={e => setQ(e.target.value)}
          style={{ flex: 1, padding: 8, border: '1px solid #ccc', borderRadius: 6 }}
        />
        <select value={platform} onChange={e => setPlatform(e.target.value)} style={{ padding: 8 }}>
          <option value="all">All</option>
          <option value="instagram">Instagram</option>
          <option value="tiktok">TikTok</option>
          <option value="youtube">YouTube</option>
          <option value="other">Other</option>
        </select>
      </div>

      <ul style={{ padding: 0, listStyle: 'none', display: 'grid', gap: 12 }}>
        {filtered.map(item => (
          <li key={item.id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12 }}>
            <div style={{ fontSize: 12, opacity: 0.7 }}>
              {item.platform} {item.collection ? `· ${item.collection}` : ''} {item.priority ? `· P${item.priority}` : ''}
            </div>
            <a href={item.url} target="_blank" style={{ color: '#2563eb', textDecoration: 'underline' }}>
              {item.title || item.url}
            </a>
            {item.tags && <div style={{ marginTop: 4, fontSize: 14 }}>Tags: {item.tags}</div>}
            {item.notes && <div style={{ marginTop: 4, fontSize: 14 }}>{item.notes}</div>}
            <div style={{ marginTop: 6, fontSize: 12, opacity: 0.6 }}>
              {new Date(item.created_at).toLocaleString()}
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
