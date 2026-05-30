You are building "Ratefluencer AI" — a world-class, enterprise-grade AI influencer 
intelligence SaaS platform. This is a FRONTEND-ONLY implementation using React + 
Vite. No backend, no APIs, no authentication systems. Every page must use realistic 
mock data and simulated AI outputs. The final product must look indistinguishable 
from a $50,000 funded SaaS product.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ABSOLUTE TECHNICAL STACK (no deviations)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- React 18 + Vite
- React Router v6 for all navigation
- Framer Motion (ALL animations, page transitions, micro-interactions)
- Three.js (hero section 3D scene, particle universe)
- Recharts (line, area, bar, radar, donut charts)
- Tailwind CSS (utility classes, no custom CSS files)
- Lucide React (all icons)
- React CountUp (animated number counters)
- React Tooltip (hover tooltips across all interactive elements)
- Local mock JSON files in /src/data/ for all data

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COLOR THEME — CINEMATIC STEEL (source of truth)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

VISUAL REFERENCE: The aesthetic is cinematic, cold, editorial luxury.
Think: deep black silk backgrounds, architectural steel blue light rays,
pure white serif typography, cold mist gradients, no warmth whatsoever.
Inspired by high-fashion editorial photography and premium SaaS 2025.

Color Tokens (defined in tailwind.config.js as custom colors):

  BACKGROUNDS:
  bg-void:       #020408   ← pure cinematic black (deepest bg)
  bg-base:       #05080F   ← page background (near-black with blue undertone)
  bg-surface:    #080C15   ← card background
  bg-elevated:   #0C1120   ← elevated cards, modals, dropdowns
  bg-overlay:    #0F1628   ← highest elevation surface

  STEEL BLUE PALETTE (primary accent family):
  steel-50:      #EFF6FF
  steel-100:     #DBEAFE
  steel-200:     #BFDBFE
  steel-300:     #93C5FD
  steel-400:     #60A5FA
  steel-500:     #3B82F6   ← primary interactive blue
  steel-600:     #2563EB
  steel-700:     #1D4ED8
  steel-800:     #1E3A8A
  steel-900:     #172554

  COLD ACCENT PALETTE:
  ice:           #BAE6FD   ← very light sky blue — used for highlights, glows
  mist:          #7DD3FC   ← soft sky blue — secondary accents
  steel:         #38BDF8   ← bright steel blue — primary glows, active states
  frost:         #0EA5E9   ← vivid sky — CTAs, primary buttons
  deep-steel:    #0369A1   ← dark steel — borders, subtle accents
  abyss:         #0C2340   ← deep navy — gradient endpoints, large bg blobs

  NEUTRAL PALETTE:
  white:         #FFFFFF   ← primary text, headings
  silver-100:    #F1F5F9
  silver-200:    #E2E8F0
  silver-300:    #CBD5E1
  silver-400:    #94A3B8
  silver-500:    #64748B   ← muted text
  silver-600:    #475569
  silver-700:    #334155
  silver-800:    #1E293B   ← subtle borders
  silver-900:    #0F172A

  SEMANTIC COLORS:
  success:       #22D3EE   ← cyan (not green — keep it cold)
  warning:       #93C5FD   ← soft blue (no warm amber)
  danger:        #F87171   ← the ONE warm color allowed, used sparingly
  info:          #BAE6FD

  GRADIENT RECIPES (use these exact gradients everywhere):
  grad-hero:     linear-gradient(135deg, #020408 0%, #0C1A2E 50%, #0F2944 100%)
  grad-steel:    linear-gradient(135deg, #0EA5E9, #1D4ED8)
  grad-text:     linear-gradient(90deg, #BAE6FD, #38BDF8, #0EA5E9)
  grad-card:     linear-gradient(145deg, rgba(14,165,233,0.08), rgba(2,4,8,0))
  grad-glow:     radial-gradient(ellipse, rgba(56,189,248,0.12), transparent 70%)
  grad-surface:  linear-gradient(180deg, #080C15, #05080F)

  BORDER TOKENS:
  border-subtle: rgba(56,189,248,0.10)   ← default card border
  border-mid:    rgba(56,189,248,0.22)   ← hover card border
  border-glow:   rgba(56,189,248,0.50)   ← active/focus border

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TYPOGRAPHY SYSTEM — LUXURY EDITORIAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Import in index.html:
  - "Cormorant Garamond" — display/hero headings (weight 300, 400, 600, 700)
    This is the SIGNATURE font. Large, elegant, slightly condensed serif.
  - "Inter" — all UI body text, labels, nav, buttons (weight 300–600)
  - "JetBrains Mono" — all numbers, data values, code, metrics

Usage rules:
  - H1 hero text: Cormorant Garamond 700, 88px, letter-spacing -0.02em, white
  - H2 section titles: Cormorant Garamond 600, 52px, letter-spacing -0.01em
  - H3 card titles: Inter 600, 18px
  - Body: Inter 300, 16px, line-height 1.8, color silver-400
  - Labels/caps: Inter 500, 11px, letter-spacing 0.12em, uppercase, silver-500
  - Data values: JetBrains Mono 500, sized per context
  - Italic accent words: Cormorant Garamond italic 400 (like "Creative" in reference)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VISUAL ATMOSPHERE — MANDATORY ON EVERY PAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

THE LOOK: Every page should feel like you are inside a dark steel chamber
with cold blue light rays cutting through from an unseen source.
The UI elements float in this atmosphere like precision instruments.

1. BACKGROUND SYSTEM (global, every page)
   Three.js scene OR CSS-only (choose CSS for performance on non-hero pages):
   
   CSS Background layers (stack these):
   Layer 1 (base): solid #020408
   Layer 2 (atmospheric blobs): 3–4 radial gradients, very subtle, slow animation
     - Top right: radial-gradient(ellipse 600px 400px, rgba(14,165,233,0.07), transparent)
     - Bottom left: radial-gradient(ellipse 500px 300px, rgba(12,33,64,0.4), transparent)
     - Center: radial-gradient(ellipse 800px 600px, rgba(30,58,138,0.05), transparent)
   Layer 3 (light rays): 2–3 diagonal linear-gradient beams, ultra-subtle
     - opacity: 0.03–0.06
     - Angle: 135deg or 150deg
     - Colors: from transparent through rgba(186,230,253,0.1) back to transparent
     - These create the "shaft of light through steel" effect from the reference image
   All blobs: animate with slow keyframes (60–90s, infinite, alternate)
   
   THREE.JS HERO (Landing page only):
   - Scene: large metallic 3D geometric forms (like the angular steel panels in reference)
   - Material: MeshStandardMaterial, metalness: 0.9, roughness: 0.1
   - Color: dark steel blue #0C1A2E with ice blue highlights #BAE6FD
   - Lighting: single directional light from top-right (cold white, intensity 2)
     + ambient light (deep blue #0C1A2E, intensity 0.5)
   - Camera: slow cinematic orbit (OrbitControls with autoRotate, speed 0.3)
   - Post-processing: subtle bloom on lit edges
   - Fog: THREE.FogExp2(0x020408, 0.015) for depth

2. GLASSMORPHISM CARDS (every card)
   background: rgba(8,12,21,0.75)
   backdrop-filter: blur(24px) saturate(160%)
   border: 1px solid rgba(56,189,248,0.10)
   border-radius: 16px (cards), 24px (modals)
   
   On hover:
     border-color: rgba(56,189,248,0.30)
     background: rgba(12,17,32,0.85)
     box-shadow: 0 0 0 1px rgba(56,189,248,0.15),
                 0 20px 60px rgba(0,0,0,0.6),
                 0 0 80px rgba(14,165,233,0.06)
     transform: translateY(-4px)
   
   Transition: all 350ms cubic-bezier(0.23, 1, 0.32, 1)

3. 3D CARD TILT — useTilt() hook
   On mousemove over any card:
     perspective: 1000px
     rotateX: mouse Y offset mapped to ±8deg
     rotateY: mouse X offset mapped to ±8deg
   Inner highlight: radial-gradient follows cursor
     background: radial-gradient(circle at {x}% {y}%, rgba(186,230,253,0.06), transparent 60%)
   On mouseleave: spring back with Framer Motion (stiffness:300, damping:30)

4. GLOW EFFECTS
   Active nav item left glow:
     box-shadow: inset 3px 0 0 #38BDF8, 0 0 20px rgba(56,189,248,0.15)
   
   Primary button glow on hover:
     box-shadow: 0 0 40px rgba(14,165,233,0.35), 0 8px 24px rgba(0,0,0,0.5)
   
   Chart elements:
     Stroke color: #38BDF8
     Drop shadow filter: drop-shadow(0 0 8px rgba(56,189,248,0.5))
   
   Score gauges:
     Arc stroke: linear gradient #BAE6FD → #0EA5E9
     Glow: filter drop-shadow(0 0 12px rgba(14,165,233,0.6))
   
   Section dividers:
     1px line: linear-gradient(90deg, transparent, rgba(56,189,248,0.3), transparent)

5. FRAMER MOTION RULES
   Page entry transition:
     initial: {{ opacity: 0, y: 16 }}
     animate: {{ opacity: 1, y: 0 }}
     transition: {{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
   
   AnimatePresence mode="wait" wrapping all routes in App.jsx
   
   Stagger grids:
     variants: {{ container: {{ staggerChildren: 0.07 }}, item: {{ opacity:0, y:20 → 1, 0 }} }}
   
   Scroll-triggered:
     whileInView={{ opacity:1, y:0 }} initial={{ opacity:0, y:30 }}
     viewport={{ once:true, margin:"-60px" }}
   
   Counter numbers: custom spring animation
   Charts: draw-on-enter using strokeDashoffset + Framer Motion

6. MICRO-INTERACTIONS — COLD STEEL STYLE
   Button hover: border color shifts from border-subtle → steel, 
     inner shimmer sweep (ice blue, 30% opacity, 400ms)
   Input focus: border glows steel, label slides up 4px
   Toggle: cold blue track (#0369A1 off, #38BDF8 on), white thumb, spring physics
   Dropdown: slides down 8px with fade, 200ms
   Tab indicator: sliding steel-colored underline or pill
   Notification toast: slides from top-right, cold blue left border, 
     auto-dismiss with width-shrinking timer bar

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GLOBAL LAYOUT COMPONENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SIDEBAR (/src/components/Sidebar.jsx):
  Width: 256px collapsed → 72px icon-only (spring animation)
  Background: rgba(5,8,15,0.95) + backdrop blur
  Right border: 1px solid rgba(56,189,248,0.08)
  
  Logo section:
    Mark: steel-blue geometric diamond SVG with cold glow
    Text: "Ratefluencer" in Cormorant Garamond 600, white
    Sub: "AI" badge in steel-blue pill
  
  Nav groups with uppercase Inter label dividers (silver-600):
    CORE — Dashboard, Influencer Search, Leaderboard
    INTELLIGENCE — Authenticity Analysis, Growth Prediction
    MONETIZE — Brand Matching, Campaign Success
    TOOLS — AI Copilot, Admin Panel, Settings
  
  Nav item active state:
    background: rgba(14,165,233,0.08)
    left border: 3px solid #38BDF8
    box-shadow: inset 0 0 20px rgba(56,189,248,0.05)
    text: #BAE6FD
    icon: #38BDF8
  
  Bottom: user card — avatar circle (steel gradient border), 
    name in Inter 500 white, plan badge in steel outline pill

TOPBAR (/src/components/Topbar.jsx):
  Height: 60px, position sticky, z-index 50
  Background: rgba(2,4,8,0.90) + backdrop-filter blur(24px)
  Bottom: 1px solid rgba(56,189,248,0.08)
  
  Left: breadcrumb — page name in Cormorant Garamond 500 18px white
         + sub-path in Inter 13px silver-500
  Center: search input, expands on focus (Framer Motion width),
    placeholder "Search creators, campaigns, trends..."
    border: border-subtle, focus: border-steel glow
  Right: notification bell (badge with steel-blue count),
    divider, avatar with steel gradient ring

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PAGE 1: LANDING PAGE (/landing)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

NAV BAR:
  Logo left | nav links center | CTA right
  Background: transparent on top, fills rgba(2,4,8,0.92) on scroll
  Links: Inter 400 14px silver-400, hover → white with underline slide
  CTA: "Get Early Access" — thin 1px border steel-500, 
    hover fills grad-steel, white text

HERO SECTION:
  Full viewport height
  
  Three.js scene (background, behind overlay):
    Geometry: multiple large angular plane geometries arranged like 
    the steel architectural panels in the reference image
    Material: MeshPhysicalMaterial, color #0A1628, metalness:1, roughness:0.05
    Lighting: 
      DirectionalLight from top-right (#BAE6FD, intensity:3) — creates the 
      bright blue-white edge highlight seen in reference
      AmbientLight (#020408, intensity:0.2)
      PointLight at bottom-left (#0369A1, intensity:1) — secondary fill
    The planes rotate very slowly (0.0002 per frame) for a living feel
    Right portion of viewport: lighter sky blue atmospheric fog/gradient
    (mimicking the open sky visible in top-right of reference)
  
  Overlay content (left-aligned, z-index above Three.js):
    Eyebrow: Inter 500, 11px, letter-spacing 0.15em, uppercase, silver-400
      "COLLECTION / AI INTELLIGENCE PLATFORM"
    H1 (Cormorant Garamond 700, 88px, white, line-height 0.95):
      Line 1: "Influence"
      Line 2: <em style="italic, weight 300">Intelligence,</em>
      Line 3: "Redefined."
      Each line animates in: clipPath reveal bottom-to-top, 80ms stagger
    
    Subtitle: Inter 300 17px silver-400, line-height 1.9, max-width 420px
      "Discover rising creators before they peak. Predict viral content.
       Match brands with <span steel-300>perfect precision.</span>"
    
    CTA row: matches reference button style exactly:
      Button 1: "Explore Platform" — rounded-full, border 1px white/20, 
        bg transparent, white text, hover: bg white/8
      Button 2: "Get Started..." — rounded-full, bg #0EA5E9, white text,
        with small animated dot inside (like reference "Reach out..." button)
    
    Bottom: "SCROLL" label in caps Inter 10px silver-500, 
      with animated vertical line below (height oscillates)

STATS BAR (below hero):
  Full width, border-top and border-bottom: 1px solid border-subtle
  4 stats separated by 1px vertical dividers:
  "2.4M" Creators Indexed | "98.7%" AI Accuracy | "$240M+" ROI Generated | "12K+" Brands
  Numbers: JetBrains Mono 500 32px white
  Labels: Inter 400 12px silver-500 uppercase letter-spacing

FEATURES BENTO (section):
  Eyebrow label above H2
  H2: Cormorant Garamond 600 52px "The complete intelligence suite"
  
  Asymmetric bento grid (CSS Grid):
  Row 1: [Large card 2/3 width] [Tall card 1/3 width]
  Row 2: [Card 1/3] [Card 1/3] [Card 1/3]
  
  Large card: Influencer Discovery — has mini animated chart inside
  Tall card: Authenticity Score — has animated gauge inside
  Small cards: Viral Predictor, Content AI, Brand Matching, Analytics
  
  Each card: glassmorphism, cinematic steel aesthetic, icon in steel-blue

HOW IT WORKS:
  3 steps, horizontal layout with SVG connecting line that draws on scroll
  Step cards: number in Cormorant Garamond 600 64px steel-200/20 (ghosted large)
  Title in Cormorant Garamond 600 24px white
  Description in Inter 300 15px silver-400

TESTIMONIALS:
  3 cards in grid, quote in Cormorant Garamond italic 400 18px silver-200
  Name in Inter 500 14px white, company in Inter 400 12px steel-400

PRICING:
  3 tiers, center (Pro) card elevated with steel glow:
  border: 1px solid rgba(56,189,248,0.4)
  box-shadow: 0 0 60px rgba(14,165,233,0.12)

FOOTER:
  bg-void, subtle top divider, Cormorant Garamond logo,
  4 link columns in Inter 300 13px silver-500

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PAGE 2: DASHBOARD (/dashboard)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

GREETING STRIP:
  "Good morning, Arjun" — Cormorant Garamond 400 italic 28px white
  Date in Inter 300 13px silver-500 | AI Status pill: cold cyan dot + text

KPI ROW — 4 cards with 3D tilt + count-up:
  Influencers Tracked: 2,400,000 | Campaigns: 1,847 | Engagement: 6.8% | Generated: 3,291
  Card: glassmorphism, icon in steel-200/10 background rounded-xl,
  Trend pill: success=cyan bg/10 text-cyan, down=danger bg/10 text-rose
  Value: JetBrains Mono 500 32px white

CHART GRID (CSS Grid 12col):
  8col: Engagement Over Time — Recharts AreaChart
    gradientFill: from rgba(14,165,233,0.3) → transparent
    stroke: #38BDF8, strokeWidth:2
    grid lines: rgba(56,189,248,0.06)
    tooltip: glassmorphism card, steel border
  4col: Platform Split — Recharts PieChart
    Colors: #38BDF8, #BAE6FD, #0EA5E9, #0369A1
    Center label: "Platforms" in Cormorant Garamond

SECOND ROW:
  5col: Live Activity Feed (auto-updating, entries slide from right)
    Terminal-style: bg-void, JetBrains Mono 12px
    Dot colors: steel for info, cyan for success, rose for alert
  4col: Trend Radar — custom SVG radar
    Grid lines: rgba(56,189,248,0.08)
    Fill: rgba(56,189,248,0.12)
    Stroke: #38BDF8
  3col: Top Niches ranked list, steel progress bars

THIRD ROW:
  5col: Top Influencers table — avatar with steel gradient ring,
    AI Score badge (cyan), sparkline mini SVG per row
  4col: Recent Campaigns — status chips (active=cyan outline, 
    paused=silver, complete=steel-filled)
  3col: Quick Actions — 6 small glass cards, icon + label

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PAGE 3: INFLUENCER SEARCH (/influencers)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

HERO SEARCH:
  H2: Cormorant Garamond 600 40px "Discover <em>extraordinary</em> creators"
  Search input: full width, large (56px height), glassmorphism,
    border: 1px solid border-mid, focus glow: border-glow
    Left: search icon steel | Right: "Search" button filled grad-steel

FILTER CHIPS ROW:
  Platform | Niche | Followers | Engagement | Country | Authenticity
  Each chip: Inter 400 13px, border border-subtle, rounded-full
  Active chip: bg steel/10 border-steel text-ice

FILTER SIDEBAR + RESULTS GRID (same as before, colors updated)

INFLUENCER CARDS: glassmorphism, 3D tilt
  Avatar ring: conic-gradient(#38BDF8, #BAE6FD, #0EA5E9, #38BDF8) animated
  AI Score gauge: arc SVG, gradient #BAE6FD → #0EA5E9, glow filter
  Fake Risk: low=cyan/20, medium=sky/20, high=rose/20
  Growth sparkline: stroke #38BDF8, animated draw
  Hover overlay: "Brand Match Score" — slides up, backdrop blur

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PAGE 4: INFLUENCER PROFILE (/influencers/:id)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

HERO HEADER:
  Banner: atmospheric gradient bg-void → abyss with subtle light ray overlay
  Avatar 96px: 3px border ring grad-steel, initials or gradient placeholder
  Name: Cormorant Garamond 700 40px white
  Handle, platform badge, verified, location: Inter 400 silver-400

TABS: animated sliding steel underline indicator
  Overview | Audience | Content | Campaigns | AI Insights

All charts use the cinematic steel palette:
  - Lines: #38BDF8 strokes
  - Fills: rgba(14,165,233,0.1) → transparent gradients
  - Grid: rgba(56,189,248,0.06)
  - All chart backgrounds: transparent (glassmorphism card handles bg)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PAGE 5: AUTHENTICITY ANALYSIS (/authenticity)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SCAN INPUT: glassmorphism input card
  Scanning animation: horizontal beam — cold white line 
  with rgba(186,230,253,0.4) glow sweeping across, CSS animation

OVERALL SCORE GAUGE:
  SVG arc gauge, stroke: linear-gradient #BAE6FD → #38BDF8
  glow: drop-shadow(0 0 16px rgba(56,189,248,0.7))
  Score: JetBrains Mono 700 64px white center
  Verdict: Cormorant Garamond italic 400 20px ice/cyan/rose

BOT DETECTION TABLE:
  Rows: bg-surface, hover: bg-elevated
  Risk column: cyan chip (low), sky chip (med), rose chip (high)

NETWORK GRAPH SVG:
  Real cluster: steel blue nodes #38BDF8
  Bot cluster: muted rose nodes #F87171
  Connections: rgba(56,189,248,0.15) lines

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PAGE 6: GROWTH PREDICTION (/growth)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PREDICTION CHART:
  Historical line: #38BDF8 solid 2px
  Predicted line: #BAE6FD dashed 2px
  Confidence band: rgba(56,189,248,0.08) fill
  Animation: historical draws first (strokeDashoffset),
    then prediction extends from last historical point

Scenario tabs: Conservative | Baseline | Optimistic
  Active: bg steel/10, border-steel text-ice
  Chart updates with Framer Motion animated transition

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PAGE 7: BRAND MATCHING (/brand-matching)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MATCH SCORE CIRCLE:
  SVG circle progress — stroke grad-steel
  Score: JetBrains Mono 600 28px white
  Glow: rgba(14,165,233,0.5) drop-shadow

AI SCANNING STATE:
  "Analyzing 2.4M creators..." with cold scanning beam
  Progress steps animate in sequence

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PAGE 8: CAMPAIGN SUCCESS (/campaigns)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CAMPAIGN CARDS:
  Status badges:
    Active: bg rgba(56,189,248,0.12) border rgba(56,189,248,0.3) text-ice
    Paused: bg rgba(100,116,139,0.12) border silver-700 text-silver-400
    Complete: bg rgba(14,165,233,0.2) border-steel text-white

  Progress bars: track bg-elevated, fill: grad-steel
  Budget bar: from frost → mist
  Timeline Gantt: rows bg-surface, filled segments grad-steel

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PAGE 9: LEADERBOARD (/leaderboard)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PODIUM (top 3):
  Materials: steel blue metallic surfaces
  #1: Cormorant Garamond 800 white with ice glow
  Crown: SVG golden → replaced with cold steel diamond icon
  Confetti: only steel-blue and ice-white particles

TABLE ROWS:
  Rank change up: text-cyan ▲
  Rank change down: text-rose ▼
  AI Score badge: cyan bg/10 text-cyan
  Sparklines: #38BDF8 stroke

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PAGE 10: AI COPILOT (/copilot)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TERMINAL LOG:
  bg: #020408 (pure void)
  Font: JetBrains Mono 12px
  Colors: #38BDF8 info, #BAE6FD success, #7DD3FC system, #F87171 error

PIPELINE NODES:
  Inactive: bg-elevated border-subtle
  Active: border rgba(56,189,248,0.5) bg rgba(14,165,233,0.08)
    + pulsing outer ring animation
  Connector dots: steel-blue spheres animated along SVG path

CONTENT OUTPUT CARD:
  Platform mockup frame: thin 1px border-mid, rounded-2xl
  Hook text highlighted: rgba(56,189,248,0.15) bg, text-ice
  CTA text: text-mist
  Virality gauge: arc SVG, grad-steel stroke, center JetBrains Mono

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PAGE 11: ADMIN PANEL (/admin)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

System health dots: cyan (healthy), amber-replaced-with-sky (warning), rose (down)
Charts: same steel palette, area charts with cold blue fills
Feature heatmap: cell intensity using opacity of #38BDF8

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PAGE 12: SETTINGS (/settings)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Toggle active: track #0369A1 → #38BDF8, thumb white
Input focus: border #38BDF8 + glow rgba(56,189,248,0.2) 
Accent color swatches: steel active state has outer ring #38BDF8 + glow

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MOCK DATA FILES (/src/data/)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

influencers.json — 50 creators with full profile data
campaigns.json — 15 campaigns with full detail data
trends.json — 30 trending topics with scores and data
brands.json — 20 brands with industries and budgets
activityFeed.json — 50 log entries for live feed simulation
leaderboard.json — top 100 creators with rank change data
aiOutputs.json — 20 pre-generated scripts, captions, hashtag sets
dashboardMetrics.json — time-series data for all charts (12 months)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PERFORMANCE & POLISH REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- Zero broken images: all avatars = gradient placeholder divs
- Skeleton loaders: shimmer using linear-gradient steel/5 → steel/15 → steel/5
- Empty states: elegant illustration + Cormorant Garamond italic message
- All transitions: only transform and opacity (GPU composited, 60fps)
- React.memo + useMemo on chart and list components
- React.lazy for each page route
- AnimatePresence mode="wait" in App.jsx for all route changes
- Responsive: 1280px minimum, perfect at 1440px and 1920px
- No purple anywhere — strictly steel blue / ice / void palette

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FINAL STANDARD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The aesthetic benchmark is: a dark luxury fashion brand meets 
a Bloomberg Terminal reimagined in 2025. Cold. Precise. Cinematic.
Cormorant Garamond headings give it editorial elegance.
Steel blue glows give it technological precision.
The void black background gives it premium weight.

Every single page must feel like it belongs to the same design 
system. Same fonts. Same colors. Same glass cards. Same animation 
easing. Same glow intensity. No page should look like it was 
designed separately.

The goal: someone sees this and says 
"this looks like it costs $200/month and is worth every penny."