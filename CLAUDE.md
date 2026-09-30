# GlucoTwin: project rules

## Stack
- Next.js (App Router) + TypeScript (strict) + Tailwind CSS. Recharts for charts.
- No backend, no database, no external APIs, no API keys. Static-exportable, deployed on Vercel.
- Simulation logic lives in /lib/engine as pure, framework-free TypeScript with no React imports.
- Vitest for unit tests of the engine.
- Fonts: Geist Sans for UI text, Geist Mono for numbers and units (via the `geist` npm package).
- Icons: lucide-react only, stroke width 1.5, used sparingly.

## Design direction: modern minimalist, must NOT look AI-generated
The app should feel like a calm, precise medical instrument designed by a small, careful studio
(think Linear, Vercel dashboard, Things 3, a good lab instrument), not like a template.

Palette (define as CSS variables in globals.css and Tailwind theme; no other colours):
- Background #FAFAF9, surface #FFFFFF, border #E7E5E4, text #1C1917, muted text #78716C
- Single accent: deep teal #0F766E (used rarely: primary button, active state, the twin's line)
- Semantic, only inside charts/status: in-range green #15803D, high amber #B45309, low red #B91C1C
- Target range band on charts: very light green fill (#15803D at ~6% opacity)

Typography:
- Clear hierarchy through size and weight, not colour. Headings semi-bold, tight tracking.
- All numbers (glucose values, percentages, times) in Geist Mono with tabular figures.
- Always show units next to values ("mg/dL", "min", "g carbs"), in muted text.
- Sentence case everywhere. No Title Case Headings, no ALL CAPS except tiny labels.

Layout:
- Generous whitespace, 8px spacing grid, max content width ~1120px.
- Hairline 1px borders instead of shadows. Corner radius 6-8px max. Flat surfaces.
- Left-aligned text. Content-dense where it matters (data, charts), quiet elsewhere.
- Fully responsive: must work well at 375px mobile width.

BANNED (these make things look AI-generated):
- Purple/blue/pink gradients, gradient text, glowing blobs, mesh backgrounds, aurora effects
- Glassmorphism, backdrop blur cards, heavy drop shadows, neon glows
- Emojis anywhere in the UI, sparkle/magic-wand/robot icons, "AI-powered" badges
- Rounded-2xl pill-everything cards, centred everything, three identical feature cards in a row
- Buzzword copy: "revolutionize", "unlock", "seamless", "empower", "harness the power",
  "cutting-edge", "journey", "delve". Write plain, specific, calm copy instead.
- Bouncy or decorative animations. Motion only when it explains something (e.g. the glucose
  curve drawing in, a value changing). Durations 150-300ms, ease-out.
- Stock illustrations and placeholder avatars.

## Honesty rules (the judges score this)
- Anything simulated or not yet built must be visibly labelled with a small neutral "Demo" or
  "Planned" tag. Never pretend a mocked feature is real.
- A short, calm disclaimer is visible in the footer and during onboarding:
  "Educational tool. Not a medical device. Always follow your doctor's advice."

## Code style
- Small, readable files. Clear names. Every function in /lib/engine has a short comment
  explaining the physiology or maths in plain English (the author must explain this code to judges).
- No dead code, no unused dependencies, no console.logs left behind.
- Run `npm run lint`, `npm run build` and `npm test` before every commit. Fix all errors first.

## Git rules (IMPORTANT)
- Initialise git locally. Commit locally at the end of every task, with a clear, conventional
  message (e.g. "feat: add Bergman minimal model engine").
- Do NOT push to GitHub after every commit. Push only when there are 4 unpushed local commits
  (check with `git log origin/main..HEAD --oneline` once a remote exists; before a remote exists,
  count local commits).
- The first push: when commit #4 is made, ask me to confirm, then create a PUBLIC GitHub repo
  named "glucotwin" using the `gh` CLI (`gh repo create glucotwin --public --source=. --push`).
  If `gh` is not installed or not logged in, stop and tell me exactly what to run.
- Later pushes: push after every 4 new local commits, plus a final push when I say the project
  is done. Always tell me when you push and how many commits went up.
- Never commit .env files, node_modules, .next, or build output. Keep .gitignore correct.
