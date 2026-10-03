# Saad Mehmood — portfolio

Your portfolio site (home, projects, case studies, contact form, AI chat assistant) plus your private finance app at `/saadi/`.

```
saad-portfolio/
├── data.js                 ← ALL site content: profile, skills, experience, every project and case study
├── build.js                turns data.js into the pages in /site (Netlify runs it on every deploy)
├── assets/                 styles, scripts, favicon, your photo (saad.webp)
├── netlify/functions/
│   ├── chat.mjs            the chat assistant (adapted from your AI-CUSTOMER-SUPPORT-CHATBOT repo)
│   └── chat-knowledge.mjs  generated from data.js — don't edit by hand
├── finance/                Projects Record (served at /saadi/, never linked from the site)
│   ├── public/             the app
│   └── supabase/           schema.sql + seed_my_data.sql (private, git-ignored)
├── netlify.toml            build settings, redirects, security headers
└── site/                   the generated website (rebuilt on every deploy)
```

## Deploy to Netlify (replacing oqvera.netlify.app)

The chat assistant is a serverless function, and **Netlify Drop (drag-and-drop) does not deploy functions**. Deploy from Git instead:

1. Push this folder to a GitHub repo. A private repo is fine. `.gitignore` already keeps `finance/supabase/seed_my_data.sql` out of Git.
2. In Netlify, open the **oqvera** site → **Site configuration → Build & deploy → Link repository**, and pick the repo. The build command (`node build.js`), publish folder (`site`) and functions folder come from `netlify.toml`, so leave those fields empty.
3. **Site configuration → Environment variables → Add variable**: `GROQ_API_KEY` = your Groq key (console.groq.com → API Keys). Optional: `GROQ_MODEL` (default `llama-3.3-70b-versatile`).
4. Trigger a deploy. Then open the site, click **Ask my AI assistant** and ask "Tell me about DeepTruth".

Without the key the site still works fully: the chat answers from a small built-in knowledge base and points people to the contact form.

Or use the CLI: `npm i -g netlify-cli`, then run `netlify link` and `netlify deploy --build --prod`.

## Contact form

The form posts to your existing Make webhook, with the same fields as the OQVERA form (`name, email, company, phone, service, timeline, message, status, source, submitted_at`), so your scenario that emails mehmoodsaad042@gmail.com keeps working. `source` is now `Portfolio website`, and `service` values are `hire, agents, automation, rag, vision, web, demo, other`. Update any filter in Make that matched the old service names. "Request a demo" buttons pre-select `demo` and fill in the project name.

## Changing content

Edit `data.js` and redeploy. You never touch HTML.
- New project: add an object to `projects`. Give it `caseStudy: true` plus `problem`, `approach`, `flow`, `features` and `numbers` to get a full case study page, or just `oneLiner`, `stack` and `links` for a card. Use `featured: true` to show it on the home page.
- Buttons appear automatically from `links`: `github`, `demo` (a live URL), or `contact: true` (Request a demo).
- The chat assistant's knowledge rebuilds from the same file.

To preview locally: `node build.js`, then `npx serve site`.

## Finance app at /saadi/

See `finance/README.md` for Supabase setup. Since the app now lives at `/saadi/`, in Supabase go to **Authentication → URL Configuration** and add `https://oqvera.netlify.app/saadi/` under **Redirect URLs** (used by "Email me a sign-in link").
The page is never linked from the site and isn't listed in the sitemap. It also tells search engines not to index it (via a header and a meta tag), and your data is protected by your Supabase login and row-level security, not by the URL being hard to guess.
