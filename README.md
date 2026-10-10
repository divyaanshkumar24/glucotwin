# GlucoTwin

GlucoTwin builds a personal "digital twin" of a Type 2 diabetes patient's glucose-insulin system, using the Bergman minimal model from diabetes research. You enter your age, weight, activity and latest HbA1c, then try meals, walks and metformin on a simulated day and watch your glucose respond. You can calibrate the twin to real glucometer readings, and it explains what it sees in plain language. It is a browser-only app: no backend, no accounts, no API keys, and everything you enter stays in your browser's localStorage.

**Live demo:** [glucotwin.vercel.app](https://glucotwin.vercel.app)

**Screenshots**

- _Placeholder: simulator with the sample patient and the "Typical day" preset_
- _Placeholder: compare mode, rice against roti at dinner_
- _Placeholder: calibration, the twin before and after fitting glucometer readings_

> Educational tool. Not a medical device. Always follow your doctor's advice.

## The problem

Living with Type 2 diabetes means making dozens of small food and activity choices a day, and seeing the result only after the fact, on a finger-prick or a lab report. It is hard to tell which choice mattered: the second katori of rice, the sweet chai, or skipping the evening walk. Most tools show what already happened. Few let you try a choice first, and fewer still work with the foods people in India actually eat.

## The solution

GlucoTwin gives you a model you can experiment on. Change one thing about a day, such as swapping rice for rotis or adding a 15-minute walk, and the glucose curve updates immediately, with the peak, time in range and hours above 180 mg/dL worked out for you. Calibrating against a few real readings moves the twin closer to your own body. Nothing is uploaded and nothing needs an account.

## Features

| Feature | Status |
| --- | --- |
| Glucose-insulin engine (Bergman minimal model, RK4 solver) | Real |
| Personalisation from age, weight, activity, HbA1c and metformin | Real |
| Day simulator: meals, walks and metformin, live curve and metrics | Real |
| 32 common Indian foods with carbohydrate and glycaemic index (approximate) | Real |
| Compare mode: two scenarios on one chart, with a table and a one-line summary | Real |
| Calibration from 3 to 8 glucometer readings | Real |
| Rule-based insights, with benefits measured by re-running the simulation | Real |
| Safety notice when the simulated day goes below 70 or above 300 mg/dL | Real |
| Onboarding and a sample patient for demos | Real |
| Coach chat | Planned (the page shows a static, clearly labelled preview) |
| Hindi and regional languages | Planned |
| CGM and glucometer sync | Planned |
| Doctor report | Planned |
| Clinical validation | Planned |

The sample patient (Ramesh) and the sample glucometer readings are made up, and the app labels them "Demo".

## How the engine works

The engine lives in [`lib/engine`](lib/engine) as plain TypeScript with no React, so it can be read and tested on its own.

**The model.** Three equations track glucose `G`, insulin action `X` and insulin `I`, minute by minute over a day:

```
dG/dt = -(p1 + X) * G + p1 * Gb + Ra(t) / Vg
dX/dt = -p2 * X + p3 * (I - Ib)
dI/dt = -n * (I - Ib) + gamma * max(G - h, 0)
```

Glucose drifts back to its resting level `Gb` and is pulled down by insulin's action `X`, while food (`Ra`, the rate glucose from a meal enters the blood) pushes it up. `X` builds when insulin is above its resting level `Ib`. The pancreas releases insulin when glucose is above a threshold `h`, and insulin is cleared at rate `n`. The equations are stepped forward one minute at a time with a fourth-order Runge-Kutta solver ([`model.ts`](lib/engine/model.ts)).

**Personalisation** ([`personalize.ts`](lib/engine/personalize.ts)). HbA1c becomes an estimated average glucose with the ADA formula, `eAG = 28.7 x HbA1c - 46.7`. Fasting glucose is set to 85 % of that. Insulin sensitivity falls with higher HbA1c, low activity and age. Beta-cell response falls with higher HbA1c. Weight sets the glucose volume `Vg` (1.7 dL per kg). Every constant sits in one commented `DEFAULTS` object.

**Meals, walks and metformin** ([`meals.ts`](lib/engine/meals.ts), [`modifiers.ts`](lib/engine/modifiers.ts)). A meal releases glucose along a gamma-shaped curve that peaks after about 35 minutes for high-GI foods and 70 minutes for low-GI foods. A walk raises insulin sensitivity by up to 1.6 times for the walk and 90 minutes after, and adds direct muscle uptake. Metformin lowers liver glucose output by up to 12 %, ramping in over 2 hours and lasting around 10.

**Calibration** ([`calibrate.ts`](lib/engine/calibrate.ts)). Given 3 to 8 readings, it searches over two multipliers, insulin sensitivity and beta-cell response, to minimise the root-mean-square error between the twin and the readings. A coarse 15 x 15 grid finds the neighbourhood and two finer grids zoom in. It takes well under a second. Glucose readings alone cannot fully separate the two parameters, so a small penalty keeps beta-cell response near its starting estimate and the fit mainly adjusts insulin sensitivity.

**Insights** ([`insights.ts`](lib/engine/insights.ts)). Fourteen fixed rules look for patterns: the meal behind the biggest spike, a long high after dinner, a fast-digesting breakfast, sweet drinks, a late heavy dinner, no walking, metformin timing, low glucose, and a good day worth saying so. Suggestions such as "swap 1 katori of rice for 2 rotis" come with a number from actually re-running the simulation with that change. There is no AI service involved.

## Architecture

```
  Browser only. No server, no database, no network calls.

  +-------------------------------+
  |  UI  (Next.js App Router)     |   app/, components/
  |  onboarding, simulator,       |
  |  compare, calibrate, about    |
  +---------------+---------------+
                  |  plain function calls
                  v
  +-------------------------------+
  |  Engine  (pure TypeScript)    |   lib/engine/
  |  model, personalize, meals,   |   no React, fully unit tested
  |  calibrate, compare, insights |
  +---------------+---------------+
                  ^
                  |  reads foods
  +---------------+---------------+
  |  Data  lib/data/foods.ts      |
  +-------------------------------+

  UI  <--->  localStorage          twin, current day, compare scenarios
```

## Tech stack

- Next.js 16 (App Router, static export), React 19, TypeScript in strict mode
- Tailwind CSS 4, Recharts, lucide-react, Geist Sans and Geist Mono
- Vitest for unit tests
- Deployed as a static site on Vercel

## Run locally

You need Node.js 20 or newer.

```bash
npm install
npm run dev
```

Open http://localhost:3000. Other scripts:

```bash
npm test            # 53 unit tests for the engine, insights, forms and food data
npm run lint        # ESLint
npm run build       # production build (static export to out/)
npm run export:pdf  # writes GlucoTwin_Code.pdf, a printable copy of all the source
```

Saved data lives under the keys `glucotwin.twin.v1`, `glucotwin.day.v1` and `glucotwin.compare.v1` in your browser's localStorage. Clear them to start over.

## Deployment

The app is deployed on Vercel at [glucotwin.vercel.app](https://glucotwin.vercel.app). It is a static export, so it needs no server settings: import the GitHub repository at [vercel.com/new](https://vercel.com/new) and accept the defaults (framework: Next.js), or run `npx vercel` from the project folder.

## Limitations and honest scope

- **Not clinically validated.** The twin has not been tested against measured glucose from patients.
- **Simplified physiology.** One pool of glucose and one of insulin. No glucagon, no fat or protein effects, no stress, illness, sleep, alcohol or hormones.
- **Approximate food data.** Glycaemic index and carbohydrate values are reference figures and vary with recipe and portion.
- **Chosen constants.** Several starting constants were set by us to give plausible curves, not fitted to patient data. For example, the beta-cell gain is higher than the textbook value because this version leaves out a time-dependent secretion term.
- **Calibration is modest.** With a few readings from one day it mainly adjusts insulin sensitivity. For the sample patient it brings the typical error from about 6.4 to 2.5 mg/dL.
- **Insights are fixed rules.** They are not medical advice, and their numbers describe the model, not you.
- **Never for dosing.** Do not use any number from this app to decide a dose or change treatment.

## Disclaimer

Educational tool. Not a medical device. Always follow your doctor's advice.

## References

- Bergman RN, Ider YZ, Bowden CR, Cobelli C. Quantitative estimation of insulin sensitivity. *American Journal of Physiology* 236(6): E667-E677, 1979.
- Bergman RN, Phillips LS, Cobelli C. Physiologic evaluation of factors controlling glucose tolerance in man. *Journal of Clinical Investigation* 68(6): 1456-1467, 1981.
- Nathan DM, Kuenen J, Borg R, Zheng H, Schoenfeld D, Heine RJ. Translating the A1C assay into estimated average glucose values. *Diabetes Care* 31(8): 1473-1478, 2008.
- Atkinson FS, Foster-Powell K, Brand-Miller JC. International tables of glycemic index and glycemic load values: 2008. *Diabetes Care* 31(12): 2281-2283, 2008.
- Atkinson FS, Brand-Miller JC, Foster-Powell K, Buyken AE, Goletzko J. International tables of glycaemic index and glycaemic load values 2021. *American Journal of Clinical Nutrition* 114(5): 1625-1632, 2021.
- Longvah T, Ananthan R, Bhaskarachary K, Venkaiah K. *Indian Food Composition Tables 2017*. National Institute of Nutrition, Hyderabad.

Built for UnivaBio 2026.
