/**
 * Realistic Mock Google Sheets data for 4 products.
 * Used for end-to-end verification, local preview, and fallback when credentials are not configured.
 */

export const MOCK_HEADERS = [
  'Week',
  'Day',
  'Date',
  'Platform',
  'Content Pillar',
  'Post Hook / Title',
  'Content Intent',
  'Target Audience',
  'Content Type',
  'Detailed Caption',
  'Visual Direction',
  'Hashtags',
  'CTA',
  'Primary KPI',
  'Secondary KPI',
  'AI Image Generation Prompt',
  'Document Name',
];

export const MOCK_PRODUCTS_DATA: Record<string, unknown[][]> = {
  'Product A': [
    MOCK_HEADERS,
    [
      'Week 36',
      'Thursday',
      '03 Sep 2026',
      'LinkedIn',
      'Thought Leadership',
      'Why 87% of AI Agent implementations stall in Q3 (and how to fix it)',
      'Educate & Provoke Discussion',
      'VP of Engineering, Enterprise Product Leaders, CTOs',
      'Carousel / Slide Deck',
      `Most enterprise AI initiatives fail not at the model layer, but at the orchestration boundary.

Over the past 6 months, we audited 45 engineering teams attempting autonomous workflow orchestration. Here is the bottleneck nobody talks about:

1. State serialization latency across distributed tool calls
2. Context window degradation under asynchronous callbacks
3. Silent fallback failures without human-in-the-loop triggers

Swipe through for the 3-layer architecture our enterprise partners used to achieve 99.4% execution reliability.

Drop "BLUEPRINT" below and I'll send the full technical RFC to your inbox.`,
      'A sleek, high-contrast dark theme carousel cover with glowing cyan and indigo vector wireframes. Minimalist typography, clean architectural flow diagram showing agentic loop with human checkpoint.',
      '#EnterpriseAI #AgenticWorkflows #TechLeadership #SoftwareEngineering #Automation',
      'Comment "BLUEPRINT" to receive the system architecture RFC',
      'Comments & Saves',
      'CTR / Inbound Inquiries',
      'Cinematic 3D render of an illuminated neural network interface on a dark glass desk, glowing teal and violet data nodes, high tech corporate control room in soft focus background, photorealistic 8k, Octane render style, clean volumetric lighting',
      'DOC-2026-WK36-NOVA-01',
    ],
    [
      'Week 36',
      'Thursday',
      '03 Sep 2026',
      'Twitter / X',
      'Product Feature',
      'Zero-latency context sync is finally live on NovaAI.',
      'Feature Announcement & Excitement',
      'AI Engineers, Indie Hackers, Founders',
      'Short-form Tweet + Demo Graphic',
      `Shipping today: Zero-latency context synchronization across all 4 agent nodes.

⚡ 12ms average state propagation
🔒 End-to-end encrypted payload cache
🔄 Automatic rollback on assertion failures

Available now on version 2.4. Benchmark results in thread 👇`,
      'Split-screen comparison graphic: Left shows traditional 340ms lag with jittery red graph, Right shows NovaAI 12ms flat line with emerald glow. Ultra-crisp modern UI card style.',
      '#DevTools #BuildInPublic #AIWorkflow #WebDev',
      'Try the interactive benchmark at nova.ai/speed',
      'Retweets / Reposts',
      'Documentation Clicks',
      'Modern dark-mode dashboard interface mockup floating in zero gravity, vibrant neon emerald telemetry lines showing instantaneous data transfer, glassmorphic UI panels, crisp typography, 4k ultra-detailed product visualization',
      'DOC-2026-WK36-NOVA-02',
    ],
  ],

  'Product B': [
    MOCK_HEADERS,
    [
      'Week 36',
      'Thursday',
      '03 Sep 2026',
      'Instagram',
      'Social Proof & Case Study',
      'How a 12-person fintech scaled cross-border payouts to 48 countries without a banking partner.',
      'Build Trust & Drive Conversion',
      'Fintech Founders, Global CFOs, Operations Directors',
      'Single Image + Deep Dive Caption',
      `Cross-border treasury management used to take 3 banking relationships and 4 business days per wire.

When PaySphere crossed $10M ARR, traditional rails were costing them 3.2% in FX spread and 24 hours of manual ledger reconciliation every Friday.

Here is how switching to ZenithPay automated their entire payout infrastructure:
→ Direct multi-currency virtual IBANs in 48 jurisdictions
→ Real-time FX lock with zero spread markup
→ 2-click payout API integrated directly into their ERP

"We cut our foreign exchange fees by $140,000 in Q2 alone." — Alex M., Head of Finance.

Link in bio to calculate how much your company is losing on FX spreads today.`,
      'Editorial portrait of a modern finance director in a sunlit loft office holding a tablet displaying ZenithPay live exchange rate analytics. Minimal, Forbes-style aesthetic with subtle emerald brand accents.',
      '#FintechInnovation #GlobalTreasury #CrossBorderPayments #ScaleUpFinance #CFOInsights',
      'Click the link in bio to book a live demo',
      'Saves & Shares',
      'Website Link Taps',
      'Editorial magazine style photograph of a sleek executive workspace with minimalist brass desk accessories, warm ambient daylight streaming through loft windows, crisp high-end laptop open displaying a clean fintech interface, 35mm film aesthetic, shallow depth of field',
      'DOC-2026-WK36-ZENITH-01',
    ],
  ],

  'Product C': [
    MOCK_HEADERS,
    [
      'Week 36',
      'Thursday',
      '03 Sep 2026',
      'LinkedIn',
      'Health Tech / Science Breakdown',
      'The circadian rhythm mistake that steals 90 minutes of deep sleep.',
      'Educate & Authority Building',
      'High Performers, Biohackers, Health Conscious Tech Workers',
      'Text Post with Infographic',
      `Most people track their sleep duration. Almost nobody tracks their core temperature trough.

Your body requires a 1.2°C drop in core temperature to initiate Stage 3 slow-wave sleep.

If you eat a heavy carbohydrate meal within 3 hours of bed, your metabolic thermogenesis keeps your core temperature elevated through the first sleep cycle. The result?

❌ 40% reduction in Human Growth Hormone release
❌ Delayed REM onset by an average of 72 minutes
❌ Elevated resting heart rate throughout the night

AuraHealth's continuous biometric sensor tracks your actual thermoregulatory curve so you can time your nutrition for restorative sleep.

What is your evening wind-down routine? Share below.`,
      'Infographic visualization comparing a normal thermoregulatory temperature curve vs a delayed curve after late eating. Clean medical-grade aesthetic, soothing deep navy and warm coral accents.',
      '#SleepScience #Longevity #Biohacking #WearableTech #PerformanceOptimization',
      'Check your nightly thermoregulatory curve in the AuraHealth app',
      'Engagement & Comments',
      'App Store Installs',
      'Hyper-realistic macro photo of a sleek titanium wearable biometric ring resting on smooth dark volcanic stone, subtle interior sensors glowing with soft biological green luminescence, ultra-clean commercial product photography, minimalist studio backdrop',
      'DOC-2026-WK36-AURA-01',
    ],
  ],

  'Product D': [
    MOCK_HEADERS,
    [
      'Week 36',
      'Thursday',
      '03 Sep 2026',
      'YouTube Shorts / Reels',
      'Creator Tips & Audio Engineering',
      'The 3-second trick that makes your vocals cut through ANY mix.',
      'Viral Engagement & Community Building',
      'Music Producers, Podcasters, Content Creators',
      'Short-Form Video Script',
      `[HOOK - 0:00 to 0:03]
Stop boosting 5kHz to make your vocals louder. You're just piercing your listener's eardrums.

[BODY - 0:04 to 0:30]
Here's what top mixing engineers actually do in PulseStudio:
Instead of EQing your vocal, invert the dynamic sidechain into your mid-range synth buss at 3.2kHz with a narrow Q.
Whenever the vocal speaks, it carved a 1.5dB pocket in the instruments automatically.
Your vocals sit right on top with zero harshness.

[OUTRO & CTA - 0:31 to 0:45]
PulseStudio AI automatically maps this dynamic pocket in one click.
Hit follow for more studio mixing secrets!`,
      'Fast-paced video script. Screen recording of a DAW waveform with spectral analyzer glowing neon magenta and cyan, accompanied by split face cam of the audio engineer with studio headphones.',
      '#AudioEngineering #MusicProduction #MixingTips #HomeStudio #PulseStudio',
      'Save this reel and download the free vocal pocket preset',
      'Video Completion Rate (VCR)',
      'Profile Visits',
      'Close-up studio photography of a vintage analog audio mixing console illuminated by neon purple and turquoise LED backlights, VU meters with warm golden needles bouncing, blurred audio studio monitors in background, moody atmospheric haze, 8k sharp focus',
      'DOC-2026-WK36-PULSE-01',
    ],
  ],
};
