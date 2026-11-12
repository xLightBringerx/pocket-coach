# PocketCoach

**Book local personal trainers, and get an AI coach in your pocket.**

PocketCoach is a full-stack, AI-powered service booking platform for fitness. Clients browse local personal trainers, book sessions in real open time slots, and get a personalized weekly workout and nutrition plan written by AI from their own fitness profile. Trainers manage their client bookings in the same app.

- **Live site:** https://pocket-coach-plum.vercel.app
- **API health check:** https://pocketcoach-api.onrender.com/api/health

> The API runs on Render's free plan, which sleeps after about 15 minutes without visits. The first request after a break can take 30 to 60 seconds while it wakes up.

---

## Demo accounts

| Role | Email | Password |
| --- | --- | --- |
| Client | `client@test.com` | `password123` |
| Trainer | `jordan@pocketcoach.test` | `password123` |
| Trainer | `maya@pocketcoach.test` | `password123` |
| Trainer | `marcus@pocketcoach.test` | `password123` |
| Trainer | `priya@pocketcoach.test` | `password123` |

You can also register a new client account to try onboarding and the AI plan from the start.

---

## Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, Vite, React Router, Axios, custom CSS (responsive, dark theme) |
| Backend | Node.js, Express 5, Mongoose 9, JSON Web Tokens, bcryptjs |
| Database | MongoDB Atlas |
| AI | Anthropic Claude API (`@anthropic-ai/sdk`) |
| Hosting | Vercel (frontend), Render (backend), MongoDB Atlas (database) |

The app follows a **3-tier architecture**: the React presentation layer only talks to the Express API over REST, and only the API talks to MongoDB and the AI service. API keys never reach the browser.

---

## Key features

### Clients

- Register and log in (with a show/hide password button)
- Onboarding profile: age, height and weight in **ft/in and lbs or cm and kg**, training experience, goal, training days per week and diet preference
- Browse trainers and services, filtered by goal and category
- Book a session from **real open time slots** worked out from the trainer's weekly hours (double booking is blocked)
- View, reschedule or cancel bookings (changes close 24 hours before a session)
- **AI weekly plan** with workouts, nutrition targets, tips, sample meals and a demo video link for every exercise
- **Daily log:** tick off each day's planned exercises and log meals with calories, protein, carbs and fat against the plan's targets
- **AI weekly check-in** that reviews the logged week and adjusts the next plan
- Profile photo, plus a dashboard showing upcoming sessions

### Trainers

- See all client bookings with the client's name and photo
- Confirm, decline, complete or cancel bookings
- Public profile with photo, bio, specialties, weekly hours and services
- API endpoints to manage their own profile and services (create, edit, hide)

### Security and quality

- Passwords hashed with bcrypt, never returned by the API
- JWT authentication, with **role-based access checked on the server** (client, trainer, admin)
- Input validation on both the browser and the server, plus a central error handler with clear messages and status codes
- Secrets kept in environment variables, never committed

---

## AI-powered feature: the weekly plan

Clients get a personalized 7-day workout and nutrition plan, built by Anthropic's Claude from their onboarding profile.

**How it works**

1. The client fills in their profile. Heights and weights are always stored in cm and kg, whichever units they typed.
2. The server sends Claude the profile plus a fixed **library of 35 exercises**, with rules: general guidance only, exactly the requested number of training days, beginner-friendly for new lifters, realistic calories (never below 1,200), and the client's diet preference respected.
3. Claude answers by filling in a structured `save_weekly_plan` tool (a JSON schema), so the result is always structured data, not loose text.
4. The server **validates the AI output before saving**: exactly 7 days, only exercises from the library, and sets, rest times and calories clamped to safe ranges.
5. The plan is saved in MongoDB and shown on the **My plan** page, with a "Watch demo" link to real exercise videos for every exercise.

### The weekly check-in

During the week the client logs completed exercises and meals on the **Log** page. When they run a check-in:

1. The server works out the real numbers itself: workout days and exercises done vs. planned, days with meals logged, and average calories, protein, carbs and fat.
2. Claude gets the profile, the plan and those numbers, and answers through a `save_check_in` tool with a short summary and 1 to 5 concrete adjustments (for example, fewer training days if workouts were missed, or more protein if it ran low).
3. The check-in is saved on the plan and shown with the stats.
4. The next time a plan is generated, those adjustments are added to the prompt, and the new plan lists them under **Adjusted from your last check-in**. This closes the loop: plan, log, check in, better plan.

**Safeguards**

- The API key stays on the server
- A 60-second cooldown on generating plans and running check-ins limits cost and abuse
- Friendly error messages if the AI service is unavailable
- A "general fitness guidance, not medical advice" notice on onboarding and the plan
- No AI-generated images or video anywhere in the app

---

## Project structure

```
pocket-coach/
  client/                  React frontend (Vite)
    src/
      api/                 Axios client and API calls
      components/          Navbar, Layout, cards, Avatar, SlotPicker, PasswordInput...
      context/             Auth context (logged-in user)
      hooks/               useAuth, useApiData
      pages/               Home, Login, Register, Trainers, Services, Book, Bookings,
                           Onboarding, Plan, Log, Account, Dashboard...
      routes/              ProtectedRoute (login and role checks)
      utils/               Formatting and image helpers
    vercel.json            Lets React Router handle page refreshes on Vercel
  server/                  Express API
    src/
      config/              MongoDB connection
      controllers/         Request and response handling
      data/                Exercise library for the AI
      middleware/          Auth, roles, error handling
      models/              User, TrainerProfile, Category, Service, Booking, Plan, Log
      routes/              REST endpoints
      seed/                Sample data script
      services/            Business logic (bookings, AI plan, trainers...)
      utils/               Errors, time, units, constants
    *.http                 REST Client API tests
```

---

## Getting started (local)

**You'll need:** Node.js 18 or newer, a MongoDB Atlas cluster (the free tier works), and an Anthropic API key.

### 1. Clone

```bash
git clone https://github.com/xLightBringerx/pocket-coach.git
cd pocket-coach
```

### 2. Run the backend

```bash
cd server
npm install
```

Create `server/.env` (see `server/.env.example`):

| Variable | Example | Purpose |
| --- | --- | --- |
| `PORT` | `4000` | API port |
| `MONGO_URI` | `mongodb+srv://USER:PASS@cluster0.xxxxx.mongodb.net/pocketcoach` | Atlas connection string |
| `CLIENT_URL` | `http://localhost:5173` | Allowed website address(es), comma-separated |
| `JWT_SECRET` | any long random string | Signs login tokens |
| `JWT_EXPIRES_IN` | `7d` | Login token lifetime |
| `ANTHROPIC_API_KEY` | `sk-ant-...` | Claude API key |
| `ANTHROPIC_MODEL` | `claude-opus-5-5` | Claude model used for plans |
| `TZ` | `America/Denver` | Optional: time zone for booking times |

Load sample data (5 categories, 4 trainers with services, and an admin), then start the API:

```bash
npm run seed
npm run dev
```

Check http://localhost:4000/api/health. It should show `{"status":"ok"}`.

### 3. Run the frontend

In a second terminal:

```bash
cd client
npm install
```

Create `client/.env`:

```
VITE_API_URL=http://localhost:4000/api
```

Then:

```bash
npm run dev
```

Open http://localhost:5173.

---

## API overview

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | Public | Create a client or trainer account |
| POST | `/api/auth/login` | Public | Log in and get a token |
| GET | `/api/auth/me` | Logged in | Current user |
| GET | `/api/categories` | Public | Service categories |
| GET | `/api/trainers?goal=` | Public | Approved trainers |
| GET | `/api/trainers/:id` | Public | Trainer profile and services |
| GET/PUT | `/api/trainers/me/profile` | Trainer | Read or update own profile |
| GET | `/api/services?category=&goal=` | Public | Services |
| GET | `/api/services/:id` | Public | Service details |
| GET/POST/PUT/DELETE | `/api/services/mine`, `/api/services/:id` | Trainer | Manage own services |
| GET | `/api/bookings/slots?serviceId=&date=` | Public | Open start times |
| POST | `/api/bookings` | Client | Book a session |
| GET | `/api/bookings/mine` | Logged in | My bookings |
| PATCH | `/api/bookings/:id/cancel` | Client or trainer | Cancel |
| PATCH | `/api/bookings/:id/reschedule` | Client | Move to a new time |
| PATCH | `/api/bookings/:id/status` | Trainer | Confirm, decline or complete |
| PUT | `/api/users/me/profile` | Client | Save the onboarding profile |
| PUT/DELETE | `/api/users/me/photo` | Logged in | Upload or remove a profile photo |
| POST | `/api/plans/generate` | Client | Generate the AI weekly plan |
| GET | `/api/plans/current` | Client | Latest plan |
| POST | `/api/plans/check-in` | Client | Run the AI weekly check-in |
| GET | `/api/logs?weekStart=` | Client | A week's workout and meal logs |
| POST | `/api/logs/workout`, `/api/logs/meal` | Client | Log an exercise or a meal |
| DELETE | `/api/logs/:id` | Client | Remove a log entry |

---

## Testing

- **API tests:** `server/requests.http` (auth), `server/trainers.http` (trainers and services), `server/bookings.http` (bookings), `server/plans.http` (profile and AI plan) and `server/logs.http` (logging and the check-in), run with the VS Code **REST Client** extension. Each request lists the status code it should return, covering success cases, validation errors (400), auth (401), permissions (403), double booking (409) and rate limiting (429).
- **End-to-end:** the main flows were tested by hand on both localhost and the live deployment: register, onboarding, AI plan, logging, weekly check-in, browse, book, trainer confirm, reschedule, cancel, profile photos, and the phone layout.

---

## Deployment

| Part | Platform | Settings |
| --- | --- | --- |
| API | Render (Web Service) | Root directory `server`, build `npm install`, start `npm start`, environment variables as listed above |
| Website | Vercel | Root directory `client`, Vite preset, `VITE_API_URL=https://pocketcoach-api.onrender.com/api` |
| Database | MongoDB Atlas | Network Access allows `0.0.0.0/0`, so Render can connect |

On Render, `CLIENT_URL` lists both the local and live website addresses, separated by a comma. Every push to `main` redeploys both sites automatically.

---

## How AI was used during development

I used **Claude (Anthropic)** as a development assistant throughout this project, as the course allows. I reviewed all code given as I went along and made adjustments, final decisions, and tested everything.

- **Planning:** turning the brief into an app outline, user stories, wireframes and the architecture and database design.
- **Building:** Claude wrote a step-by-step build guide with code for each step. I created the files, ran the code, tested each step and committed my work in small, separate commits.
- **Debugging:** working through real problems, such as files created in the wrong folders, a missing dependency in `package.json`, the Claude model rejecting a forced `tool_choice` (fixed by switching to `auto` plus a prompt instruction), a Mongoose deprecation warning, and MongoDB Atlas network access during deployment.
- **Design:** applying my own color scheme and gradients to the whole site.
- **My decisions:** a booking platform for local trainers with an AI coach; no AI-generated images or video (demo links to real videos instead); support for both imperial and metric units; and which features to cut to meet the deadline.

---

## Future work

1. AI trainer matching based on the client's goal
2. A progress avatar that changes with how consistently the client follows the plan
3. Trainer dashboard pages for editing services and weekly hours (the API already supports this)
4. Admin dashboard to approve trainers and manage categories
5. Cloud image storage (Cloudinary or S3), email reminders and a custom domain
6. Automated tests

---

## Disclaimer

PocketCoach gives general fitness and nutrition guidance, not medical advice. Users should check with a doctor before starting a new program if they have a health condition.

---

Capstone project by **Aaron North**.