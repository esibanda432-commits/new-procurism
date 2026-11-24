// Live AI answers for the website assistant.
// Activated by adding ANTHROPIC_API_KEY in Netlify: Site configuration → Environment variables.
// Without the key, the website falls back to its built-in answers automatically.

const SYSTEM = `You are the website assistant for Procurism, procurement software by White Raven Tech.
Tagline: Smarter Sourcing. Stronger Supply Chains.
Capabilities (the only ones you may describe): supplier discovery, sourcing workflows, vendor management, procurement intelligence.
How it works: Discover suppliers, Source through a shared workflow, Manage vendor relationships, Improve with procurement insight.
Built for procurement and sourcing teams, operations leaders, and finance and leadership.
Maker: White Raven Tech (https://whiteraventech.com). Contact: info@whiteraventech.com. Demos: https://whiteraventech.com/schedule-consultation/

Rules: Reply in two to four concise, professional sentences in British English.
Describe only the capabilities listed above, in general terms. Never invent features, integrations, AI capabilities, customers, results, statistics, pricing, security certifications or timelines.
For pricing, integrations, security, data handling or anything not listed, say the team covers it in a demo and suggest booking one.
Do not describe screenshots or confidential details. If a question is unrelated to Procurism, answer briefly and steer back.`;

export default async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return new Response(JSON.stringify({ error: 'not_configured' }), { status: 503 });

  let messages;
  try {
    ({ messages } = await req.json());
  } catch {
    return new Response('Bad request', { status: 400 });
  }
  if (!Array.isArray(messages) || messages.length === 0) return new Response('Bad request', { status: 400 });

  const clean = messages
    .filter(m => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .map(m => ({ role: m.role, content: m.content.slice(0, 1500) }))
    .slice(-10);
  while (clean.length && clean[0].role !== 'user') clean.shift();

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || 'claude-haiku-5-5',
      max_tokens: 300,
      system: SYSTEM,
      messages: clean,
    }),
  });

  if (!res.ok) return new Response(JSON.stringify({ error: 'upstream' }), { status: 502 });
  const data = await res.json();
  const reply = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n');
  return new Response(JSON.stringify({ reply }), { headers: { 'content-type': 'application/json' } });
};
