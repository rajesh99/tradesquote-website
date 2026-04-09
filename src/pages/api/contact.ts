import type { APIContext } from 'astro';

export const prerender = false;

const isDev = import.meta.env.DEV;

export async function POST({ request, locals }: APIContext) {
  const env = (locals as App.Locals).runtime?.env;

  // ── Parse body ────────────────────────────────────────────────────────────
  let body: FormData;
  try {
    body = await request.formData();
  } catch {
    return Response.json(
      { success: false, error: 'Invalid request body.' },
      { status: 400 }
    );
  }

  const name           = (body.get('name')                  as string | null)?.trim() ?? '';
  const email          = (body.get('email')                 as string | null)?.trim() ?? '';
  const phone          = (body.get('phone')                 as string | null)?.trim() || null;
  const message        = (body.get('message')               as string | null)?.trim() ?? '';
  const turnstileToken = (body.get('cf-turnstile-response') as string | null) ?? '';

  // ── Validate required fields ──────────────────────────────────────────────
  if (!name) {
    return Response.json({ success: false, error: 'Name is required.' }, { status: 400 });
  }

  if (!email) {
    return Response.json({ success: false, error: 'Email is required.' }, { status: 400 });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return Response.json(
      { success: false, error: 'Please enter a valid email address.' },
      { status: 400 }
    );
  }

  if (name.length > 100) {
    return Response.json({ success: false, error: 'Name is too long.' }, { status: 400 });
  }

  if (email.length > 254) {
    return Response.json({ success: false, error: 'Email is too long.' }, { status: 400 });
  }

  if (!message) {
    return Response.json({ success: false, error: 'Message is required.' }, { status: 400 });
  }

  if (message.length > 5000) {
    return Response.json(
      { success: false, error: 'Message must be under 5,000 characters.' },
      { status: 400 }
    );
  }

  // ── Turnstile verification ────────────────────────────────────────────────
  // In local dev without wrangler bindings, skip Turnstile so the form works.
  const secretKey = env?.TURNSTILE_SECRET_KEY;
  const skipTurnstile = isDev && !secretKey;

  if (!skipTurnstile) {
    if (!turnstileToken) {
      return Response.json(
        { success: false, error: 'Please complete the security check.' },
        { status: 400 }
      );
    }

    const ip = request.headers.get('CF-Connecting-IP') ?? '';
    let tsVerified = false;

    try {
      const tsRes = await fetch(
        'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            secret:   secretKey,
            response: turnstileToken,
            remoteip: ip,
          }),
        }
      );
      const tsData = await tsRes.json() as { success: boolean; 'error-codes'?: string[] };
      tsVerified = tsData.success === true;
    } catch (err) {
      console.error('[contact] Turnstile verify fetch failed:', err);
      return Response.json(
        { success: false, error: 'Security check could not be completed. Please try again.' },
        { status: 503 }
      );
    }

    if (!tsVerified) {
      return Response.json(
        { success: false, error: 'Security check failed. Please refresh and try again.' },
        { status: 400 }
      );
    }
  } else if (isDev) {
    console.log('[contact] Dev mode — Turnstile check skipped (no TURNSTILE_SECRET_KEY in env).');
  }

  // ── Database ──────────────────────────────────────────────────────────────
  // In local dev without wrangler/D1 bindings, log and return success so the
  // UI flow can be tested end-to-end without a real database.
  if (!env?.DB) {
    if (isDev) {
      console.log('[contact] Dev mode — no D1 binding. Simulating successful submission:', {
        name, email, phone, message,
      });
      return Response.json({ success: true }, { status: 200 });
    }
    return Response.json(
      { success: false, error: 'Database not configured.' },
      { status: 500 }
    );
  }

  // ── Insert into D1 ────────────────────────────────────────────────────────
  const ip = request.headers.get('CF-Connecting-IP') ?? '';
  try {
    await env.DB
      .prepare(
        `INSERT INTO contacts (name, email, phone, message, ip_address)
         VALUES (?, ?, ?, ?, ?)`
      )
      .bind(name, email, phone, message, ip || null)
      .run();
  } catch (err) {
    console.error('[contact] D1 insert error:', err);
    return Response.json(
      { success: false, error: 'Failed to save your message. Please try again.' },
      { status: 500 }
    );
  }

  return Response.json({ success: true }, { status: 200 });
}