import type { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, context: { params: Promise<{ name: string }> }) {
  try {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
    const backend = apiBase.replace(/\/+$/, '');
    const { name } = await context.params;
    const safe = name;
    const url = `${backend}/media/vocabulary_images/${encodeURIComponent(safe)}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) {
      return new Response('Not found', { status: res.status });
    }
    const contentType = res.headers.get('content-type') || 'application/octet-stream';
    const body = await res.arrayBuffer();
    return new Response(body, {
      headers: {
        'content-type': contentType,
        'cache-control': 'public, max-age=3600',
      },
    });
  } catch {
    return new Response('Error', { status: 500 });
  }
}
