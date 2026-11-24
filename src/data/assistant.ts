import { company, type PanelId } from './content';

export interface Action { label: string; panel?: PanelId; href?: string }
export interface Reply { text: string; actions?: Action[]; step?: string }

const open = (label: string, panel: PanelId): Action => ({ label, panel });
const demo: Action = { label: 'Book a demo', href: company.demoUrl };

// Built-in answers: work with no backend. Each topic is matched on keywords.
// Questions that need specifics (pricing, integrations, security) are routed to a demo
// rather than answered with claims that have not been approved.
const topics: { keys: string[]; reply: Reply }[] = [
  {
    keys: ['flow', 'request', 'handle', 'handles', 'process', 'how does it work', 'how it works', 'walk', 'steps'],
    reply: {
      text: 'A sourcing request moves through four connected stages: discover suppliers, source through a shared workflow, manage the vendor relationship, then use procurement insight to improve the next decision. Watch the flow on the left as each stage lights up.',
      actions: [open('How it works', 'how'), demo],
      step: 'all',
    },
  },
  {
    keys: ['discover', 'discovery', 'find', 'search', 'supplier', 'suppliers', 'shortlist', 'compare'],
    reply: {
      text: 'Supplier discovery helps your team find and compare potential suppliers in one place, then shortlist with the reasoning kept on record.',
      actions: [open('Supplier discovery', 'discovery')],
      step: 'discover',
    },
  },
  {
    keys: ['workflow', 'workflows', 'approval', 'approvals', 'rfq', 'rfp', 'tender', 'sourcing'],
    reply: {
      text: 'Sourcing workflows give every request a clear path, with structured requests and visible ownership in place of long email chains.',
      actions: [open('Sourcing workflows', 'workflows')],
      step: 'source',
    },
  },
  {
    keys: ['vendor', 'vendors', 'manage', 'management', 'relationship', 'records', 'contract', 'contracts'],
    reply: {
      text: 'Vendor management keeps contacts, documents and history for each supplier together, so relationships stay organised after selection.',
      actions: [open('Vendor management', 'vendors')],
      step: 'manage',
    },
  },
  {
    keys: ['intelligence', 'insight', 'insights', 'analytics', 'report', 'reports', 'data', 'spend', 'dashboard'],
    reply: {
      text: 'Procurement intelligence brings sourcing and supplier information into one view, so you can see where time and spend are going and plan the next round.',
      actions: [open('Procurement intelligence', 'intelligence')],
      step: 'improve',
    },
  },
  {
    keys: ['who', 'for', 'industries', 'industry', 'team', 'teams', 'company size', 'suitable', 'fit'],
    reply: {
      text: 'Procurism is built for procurement and sourcing teams, operations leaders and finance teams in organisations where sourcing decisions carry real weight.',
      actions: [open('Who it’s for', 'who'), demo],
    },
  },
  {
    keys: ['price', 'pricing', 'cost', 'costs', 'how much', 'licence', 'license', 'subscription', 'plan', 'plans'],
    reply: {
      text: 'Pricing depends on your team and requirements, so we confirm it during a demo once we understand your sourcing process.',
      actions: [demo],
    },
  },
  {
    keys: ['integrate', 'integration', 'integrations', 'erp', 'api', 'sap', 'oracle', 'connect', 'import'],
    reply: {
      text: 'The best way to answer integration questions is with your systems in mind. Book a demo and our team will talk it through with you.',
      actions: [demo],
    },
  },
  {
    keys: ['security', 'secure', 'gdpr', 'compliance', 'privacy', 'data protection', 'hosting', 'iso'],
    reply: {
      text: 'We cover security and data handling in detail during a demo, so you get accurate answers for your organisation’s requirements.',
      actions: [demo],
    },
  },
  {
    keys: ['demo', 'trial', 'try', 'see it', 'walkthrough', 'book', 'meeting', 'call'],
    reply: { text: 'You can book a walkthrough with our team. We will show you the platform and how it fits your process.', actions: [demo, open('Contact details', 'demo')] },
  },
  {
    keys: ['contact', 'email', 'talk', 'speak', 'human', 'someone', 'sales'],
    reply: { text: `Email us at ${company.email}, or book a demo and we will be in touch.`, actions: [demo, open('Contact', 'demo')] },
  },
  {
    keys: ['built', 'build', 'white raven', 'company', 'behind', 'made', 'about', 'who made'],
    reply: { text: 'Procurism is a proprietary product from White Raven Tech, the technology partner behind software engineering, automation and delivery for growing organisations.', actions: [open('About Procurism', 'about')] },
  },
];

const YES = /^(yes|yeah|yep|sure|ok|okay|please|go on|show me|y)\b/i;
const NO = /^(no|nope|not now|later|n)\b/i;
const HELLO = /^(hi|hello|hey|good (morning|afternoon|evening))\b/i;

export const greeting: Reply = {
  text: 'Welcome to Procurism. I can answer questions about the platform. Would you like to see how a sourcing request moves through Procurism?',
  actions: [{ label: 'Yes, show me' }],
};

export const suggestions = [
  'Show me how a sourcing request flows',
  'How does supplier discovery work?',
  'Who is Procurism for?',
  'Can I book a demo?',
];

export function localReply(input: string, lastAssistant?: string): Reply {
  const q = input.trim().toLowerCase();
  const askedFlow = lastAssistant?.includes('sourcing request moves through Procurism?');
  if ((askedFlow && YES.test(q)) || q === 'yes, show me') return topics[0].reply;
  if (askedFlow && NO.test(q)) return { text: 'No problem. What would you like to know about Procurism?' };
  if (HELLO.test(q) && q.split(' ').length < 4) return { text: 'Hello. What would you like to know about Procurism?', actions: [open('How it works', 'how'), demo] };

  let best: Reply | null = null;
  let bestScore = 0;
  for (const t of topics) {
    const score = t.keys.reduce((n, k) => n + (new RegExp(`\\b${k}\\b`).test(q) ? k.length : 0), 0);
    if (score > bestScore) { bestScore = score; best = t.reply; }
  }
  return best ?? {
    text: 'That is a good question for our team. Book a demo or send us a message and we will give you a considered answer.',
    actions: [demo, open('Contact', 'demo')],
  };
}

// Full AI: if the hosting has an API key configured, answers come from the live model.
// Otherwise this returns null and the built-in answers are used instead.
export async function aiReply(history: { role: 'user' | 'assistant'; content: string }[]): Promise<string | null> {
  try {
    const res = await fetch('/.netlify/functions/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: history.slice(-10) }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data.reply === 'string' && data.reply.trim() ? data.reply.trim() : null;
  } catch {
    return null;
  }
}
