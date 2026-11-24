// All Procurism site copy lives here, so wording can be edited without touching layout.
// Product claims are limited to those in the approved White Raven Tech materials;
// review any new claims with the team before publishing.

export const company = {
  product: 'Procurism',
  tagline: 'Smarter Sourcing. Stronger Supply Chains.',
  maker: 'White Raven Tech',
  makerUrl: 'https://whiteraventech.com/',
  email: 'info@whiteraventech.com',
  demoUrl: 'https://whiteraventech.com/schedule-consultation/',
  linkedin: 'https://linkedin.com/company/white-raven-technology',
};

export type PanelId =
  | 'discovery' | 'workflows' | 'vendors' | 'intelligence'
  | 'how' | 'who' | 'about' | 'demo';

export interface PanelItem { title: string; text: string; href?: string }

export interface Panel {
  id: PanelId;
  label: string;
  teaser: string;
  code: string;     // short container code shown on the card
  tone: 'teal' | 'bronze' | 'mint' | 'char' | 'cream';
  title: string;
  intro: string;
  items: PanelItem[];
  cta?: { label: string; href: string };
}

const demo = { label: 'Book a demo', href: company.demoUrl };

export const panels: Panel[] = [
  {
    id: 'discovery',
    label: 'Supplier Discovery',
    teaser: 'Find the right suppliers sooner.',
    code: 'PRC 01',
    tone: 'teal',
    title: 'Supplier discovery.',
    intro: 'Start every sourcing decision from a wider, better-organised view of the suppliers available to you.',
    items: [
      { title: 'Search and compare', text: 'Review potential suppliers side by side instead of across scattered emails and spreadsheets.' },
      { title: 'One shared view', text: 'Keep supplier information in one place your team can work from together.' },
      { title: 'Shortlist with confidence', text: 'Move from a long list to a shortlist with the context behind each choice kept on record.' },
    ],
    cta: demo,
  },
  {
    id: 'workflows',
    label: 'Sourcing Workflows',
    teaser: 'Requests that move, not stall.',
    code: 'PRC 02',
    tone: 'bronze',
    title: 'Sourcing workflows.',
    intro: 'Give every sourcing request a clear path, from first need to final decision.',
    items: [
      { title: 'Structured requests', text: 'Capture what is needed, by when and why, in a consistent format.' },
      { title: 'Clear ownership', text: 'Everyone can see who holds each step and what happens next.' },
      { title: 'Fewer lost threads', text: 'Replace long email chains with a single, traceable process.' },
    ],
    cta: demo,
  },
  {
    id: 'vendors',
    label: 'Vendor Management',
    teaser: 'Every supplier relationship, in order.',
    code: 'PRC 03',
    tone: 'mint',
    title: 'Vendor management.',
    intro: 'Keep supplier relationships organised once they are in place, not just while they are being won.',
    items: [
      { title: 'Supplier records', text: 'Contacts, documents and history for each vendor, kept together.' },
      { title: 'Ongoing oversight', text: 'Stay on top of the suppliers you rely on as your needs change.' },
      { title: 'Team continuity', text: 'Knowledge stays with the business when people change roles.' },
    ],
    cta: demo,
  },
  {
    id: 'intelligence',
    label: 'Procurement Intelligence',
    teaser: 'Decisions backed by your own data.',
    code: 'PRC 04',
    tone: 'char',
    title: 'Procurement intelligence.',
    intro: 'Turn the information gathered through sourcing into a clearer picture of how your procurement is performing.',
    items: [
      { title: 'See the whole picture', text: 'Bring sourcing and supplier information together in one view.' },
      { title: 'Spot patterns', text: 'Understand where time, effort and spend are going.' },
      { title: 'Plan ahead', text: 'Use what you learn to make the next sourcing round stronger.' },
    ],
    cta: demo,
  },
  {
    id: 'how',
    label: 'How It Works',
    teaser: 'Discover. Source. Manage. Improve.',
    code: 'PRC 05',
    tone: 'cream',
    title: 'One connected flow.',
    intro: 'Procurism brings the stages of sourcing into one platform, so each step hands over cleanly to the next.',
    items: [
      { title: 'Discover', text: 'Identify and compare suppliers that fit the need.' },
      { title: 'Source', text: 'Run the request through a clear, shared workflow.' },
      { title: 'Manage', text: 'Keep vendor relationships organised after selection.' },
      { title: 'Improve', text: 'Use procurement insight to strengthen the next decision.' },
    ],
    cta: demo,
  },
  {
    id: 'who',
    label: 'Who It’s For',
    teaser: 'Built for teams who buy at scale.',
    code: 'PRC 06',
    tone: 'teal',
    title: 'Built for the people who keep supply moving.',
    intro: 'Procurism is designed for organisations where sourcing decisions carry real operational weight.',
    items: [
      { title: 'Procurement and sourcing teams', text: 'A single place to run sourcing from request to decision.' },
      { title: 'Operations leaders', text: 'Visibility of the suppliers the business depends on.' },
      { title: 'Finance and leadership', text: 'A clearer view of how sourcing decisions are made.' },
    ],
    cta: demo,
  },
  {
    id: 'about',
    label: 'About',
    teaser: 'Built by White Raven Tech.',
    code: 'PRC 07',
    tone: 'bronze',
    title: 'Built by White Raven Tech.',
    intro: 'Procurism is a proprietary product from White Raven Tech, the technology partner behind software engineering, automation and delivery for growing organisations.',
    items: [
      { title: 'Build › Modernize › Scale', text: 'The same delivery approach White Raven Tech brings to its client work.' },
      { title: 'Visit White Raven Tech', text: 'Learn more about the team behind Procurism.', href: company.makerUrl },
    ],
  },
  {
    id: 'demo',
    label: 'Book a Demo',
    teaser: 'See Procurism in action.',
    code: 'PRC 08',
    tone: 'mint',
    title: 'See Procurism in action.',
    intro: 'Book a walkthrough with our team. We will show you the platform and talk through how it fits your sourcing process.',
    items: [
      { title: 'Email', text: company.email, href: `mailto:${company.email}?subject=Procurism%20demo` },
      { title: 'LinkedIn', text: 'White Raven Tech', href: company.linkedin },
    ],
    cta: demo,
  },
];

export const panelById = (id: PanelId) => panels.find(p => p.id === id)!;

// Steps shown in the "sourcing flow" rail beside the assistant.
export const flow: { key: string; label: string; panel: PanelId }[] = [
  { key: 'discover', label: 'Discover', panel: 'discovery' },
  { key: 'source', label: 'Source', panel: 'workflows' },
  { key: 'manage', label: 'Manage', panel: 'vendors' },
  { key: 'improve', label: 'Improve', panel: 'intelligence' },
];
