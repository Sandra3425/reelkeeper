import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // server-only secret key
);

export async function POST(req: NextRequest) {
  try {
    // verify this is your shortcut and not a random internet request
    const auth = req.headers.get('x-reelkeeper-secret');
    if (auth !== process.env.INGEST_SECRET) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const f = body.fields ?? body;

    if (!f?.url) return NextResponse.json({ error: 'url required' }, { status: 400 });

    const platform =
      /instagram\.com/.test(f.url) ? 'instagram' :
      /tiktok\.com/.test(f.url)    ? 'tiktok' :
      /youtu(\.be|be\.com)/.test(f.url) ? 'youtube' :
      'other';

    const { error } = await supabase.from('items').insert({
      url: f.url,
      platform,
      title: f.title ?? null,
      collection: f.collection ?? null,
      tags: f.tags ?? null,
      priority: Number(f.priority) || 2,
      status: f.status ?? 'to_watch',
      notes: f.notes ?? null
    });

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (err:any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
