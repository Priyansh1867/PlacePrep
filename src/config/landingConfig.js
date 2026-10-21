/**
 * Central Configuration for Remii-Inspired Landing Page
 * Edit all brand copy, colors, links, and pricing from this single file.
 */

export const landingConfig = {
  // Brand Configuration
  brand: {
    name: 'PLACEPREP AI',
    shortName: 'PlacePrep',
    tagline: 'The AI manager you deserve',
    footerTagline: 'Breathe easy. PlacePrep AI got it.',
    accentColor: '#6366F1', // Indigo / Electric Violet Accent (Replace with your custom hex e.g. #8B5CF6 or #06B6D4)
    accentGlow: 'rgba(99, 102, 241, 0.25)',
    logoPath: '/favicon.ico',
    ctaLink: '#pricing',
    statusText: 'All systems operational',
  },

  // Navigation Links
  navLinks: [
    { label: 'AI Agent', href: '#ai-agent' },
    { label: 'Features', href: '#features' },
    { label: 'Pipeline', href: '#pipeline' },
    { label: 'Security', href: '#security' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'FAQs', href: '#faqs' },
  ],

  // Hero Section Stats
  heroStats: [
    { label: 'Tasks Executed', endVal: 100, suffix: 'K+', display: '100K+' },
    { label: 'Connected Apps', endVal: 1000, suffix: '+', display: '1000+' },
    { label: 'Hours Saved', endVal: 5000, suffix: '+', display: '5000+' },
  ],

  // Feature Bento Grid (4 Cards)
  featureGrid: {
    heading: 'Connects to all your favorite tools.',
    subheading: 'Secure autonomous execution across 1,000+ work platforms and APIs without manual context switching.',
    cards: [
      {
        id: 'telegram',
        label: 'TELEGRAM CHAT',
        title: 'Message directly via Telegram',
        description: 'Send voice messages or quick text prompts on the go. Your AI manager processes instructions and executes in seconds.',
        stats: [
          { label: 'Access', value: '24/7 instant' },
          { label: 'Response', value: '<1s latency' }
        ],
        icon: 'MessageSquareCode',
        gradient: 'from-sky-500/20 to-blue-600/10'
      },
      {
        id: 'todo',
        label: 'SMART TODO',
        title: 'The best todo list you can have',
        description: 'Self-organizing priorities that parse upcoming interview rounds, drive deadlines, and critical milestones automatically.',
        stats: [
          { label: 'Prioritization', value: '100% automated' },
          { label: 'Deadlines', value: '0 missed' }
        ],
        icon: 'CheckSquare',
        gradient: 'from-emerald-500/20 to-teal-600/10'
      },
      {
        id: 'voice',
        label: 'VOICE TO ACTION',
        title: 'Turn voice notes into actions',
        description: 'Speak your thought stream. Background transformers distill action items, schedule sessions, and generate code templates.',
        stats: [
          { label: 'Workflow', value: '100% hands-free' },
          { label: 'Transcription', value: 'Real-time sync' }
        ],
        icon: 'Mic',
        gradient: 'from-purple-500/20 to-pink-600/10'
      },
      {
        id: 'executor',
        label: 'EXECUTOR',
        title: 'Workflow automation',
        description: 'Autonomous tool orchestration across GitHub, Slack, databases, and recruitment pipelines without fragile webhook scripts.',
        stats: [
          { label: 'Executions', value: '20K+ completed' },
          { label: 'Reliability', value: '99.9% uptime' }
        ],
        icon: 'Cpu',
        gradient: 'from-amber-500/20 to-orange-600/10'
      }
    ]
  },

  // 6-Step Automation Pipeline
  pipeline: {
    label: 'AUTOMATION PIPELINE',
    heading: "AI that executes tasks, doesn't just chat.",
    subheading: 'From raw natural language prompts to isolated sandbox execution and audit reporting.',
    steps: [
      {
        step: 'STEP 01',
        title: 'Intent & Entity Parsing',
        description: 'Deconstructs natural voice or text queries into deterministic multi-intent entity graphs with strict parameter extraction.'
      },
      {
        step: 'STEP 02',
        title: 'Sequential Subtask Planning',
        description: 'Builds an acyclic dependency graph organizing subroutines, branch conditions, and fallback paths before firing APIs.'
      },
      {
        step: 'STEP 03',
        title: 'OAuth Tool Selection',
        description: 'Dynamically selects authorized endpoints across GitHub, Slack, and cloud databases with minimal least-privilege tokens.'
      },
      {
        step: 'STEP 04',
        title: 'Sandboxed Cloud Execution',
        description: 'Dispatches compute to ephemeral, isolated cloud microVMs with strictly restricted network ingress and memory boundaries.'
      },
      {
        step: 'STEP 05',
        title: 'Self-Evaluating Error Recovery',
        description: 'Inspects execution exit codes and stack traces in real time, retrying with patched payloads before failing gracefully.'
      },
      {
        step: 'STEP 06',
        title: 'Synthesis & Summary Reporting',
        description: 'Generates clean markdown artifacts, execution receipts, and instant notification digests back to your chat channel.'
      }
    ]
  },

  // Logo Marquee Rows (App Integrations)
  marqueeRows: [
    ['GitHub', 'Slack', 'Linear', 'Notion', 'Figma', 'Stripe', 'Supabase', 'Airtable', 'Jira', 'Discord'],
    ['Google Docs', 'Google Sheets', 'Gmail', 'Calendar', 'HubSpot', 'Trello', 'Asana', 'Telegram', 'WhatsApp', 'Reddit']
  ],

  // Security & Privacy
  security: {
    label: 'SECURITY & PRIVACY',
    heading: 'Private by default, Secure by design.',
    subheading: 'Enterprise-grade isolation protocols protecting your personal API secrets and proprietary workspace context.',
    stats: [
      { label: 'Sandboxes', value: '100% Isolated' },
      { label: 'Encryption', value: 'AES-256 GCM' }
    ],
    auditCode: 'AUDIT_LOG // MEM_ISOLATION: OK // ZERO_RETENTION_VERIFIED'
  },

  // Pricing Plans
  pricing: {
    heading: 'Relax, [Brand] got it.',
    subheading: 'Transparent, predictable pricing. Upgrade, downgrade, or cancel anytime.',
    plans: [
      {
        id: 'mini',
        name: 'Mini',
        price: '$9',
        billing: 'per month',
        tagline: 'For individuals exploring autonomous agentic workflows.',
        popular: false,
        buttonText: 'Get Started',
        features: [
          '500 Autonomous task executions/mo',
          'Connect up to 5 external apps',
          'Telegram voice & text integration',
          'Standard sandbox execution speed',
          'Community Discord support'
        ]
      },
      {
        id: 'pro',
        name: 'Pro',
        price: '$19',
        billing: 'per month',
        tagline: 'For power users and developers managing complex tool stacks.',
        popular: true,
        buttonText: 'Start Free Trial',
        features: [
          'Unlimited autonomous task executions',
          'Connect up to 25 external apps',
          'Instant Telegram & WhatsApp bot triggers',
          'High-priority sandboxed microVMs',
          'Custom self-evaluating error recovery',
          'Dedicated priority API routes'
        ]
      },
      {
        id: 'max',
        name: 'Max',
        price: '$49',
        billing: 'per month',
        tagline: 'For teams requiring custom integrations and strict SLA uptime.',
        popular: false,
        buttonText: 'Deploy Enterprise',
        features: [
          'Everything in Pro + Dedicated tenancy',
          'Unlimited app connections & custom webhooks',
          'Custom fine-tuned agent instructions',
          'AES-256 customer-managed encryption keys',
          'Audit trail export & SOC2 compliance logs',
          '24/7 Dedicated human engineer support'
        ]
      }
    ]
  },

  // Final CTA
  ctaSection: {
    heading: 'Start free.',
    subheading: 'Deploy your autonomous AI manager in under 60 seconds. No credit card required.',
    buttonText: 'START FREE NOW'
  },

  // FAQs
  faqs: [
    {
      q: 'How does PlacePrep AI execute tasks across external apps?',
      a: 'It uses sandboxed OAuth connectors and headless API orchestrators. When you give an instruction via text or voice, it plans the workflow, runs it in an isolated ephemeral VM, and summarizes the outcome.'
    },
    {
      q: 'Is my data used to train foundation models?',
      a: 'Never. We enforce a strict zero-retention policy. All customer tokens, memory contexts, and chat prompts are ephemeral and protected by AES-256 encryption at rest and TLS 1.3 in transit.'
    },
    {
      q: 'Can I connect my own custom APIs or private webhooks?',
      a: 'Yes. On the Pro and Max tiers, you can add custom OpenAPI specifications or internal endpoints for full proprietary workflow automation.'
    }
  ],

  // Footer Links
  footerColumns: [
    {
      title: 'Product',
      links: [
        { label: 'Autonomous Agent', href: '#ai-agent' },
        { label: 'Feature Bento', href: '#features' },
        { label: 'Automation Pipeline', href: '#pipeline' },
        { label: 'Security Vault', href: '#security' },
        { label: 'Pricing Plans', href: '#pricing' }
      ]
    },
    {
      title: 'Connect',
      links: [
        { label: 'Telegram Bot', href: '#' },
        { label: 'WhatsApp Agent', href: '#' },
        { label: 'Slack Integration', href: '#' },
        { label: 'GitHub App', href: '#' },
        { label: 'Chrome Extension', href: '#' }
      ]
    },
    {
      title: 'Company',
      links: [
        { label: 'About Us', href: '#' },
        { label: 'Documentation', href: '#' },
        { label: 'Changelog', href: '#' },
        { label: 'Engineering Blog', href: '#' },
        { label: 'Careers', href: '#' }
      ]
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', href: '#' },
        { label: 'Terms of Service', href: '#' },
        { label: 'Security Whitepaper', href: '#' },
        { label: 'DPA & GDPR', href: '#' }
      ]
    }
  ]
};
