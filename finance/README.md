# Projects Record (Supabase)

Freelance projects, monthly salary, account balances (Payoneer, JazzCash, SadaPay, bank, cash), a debit/credit ledger and an audit log. Sign in from any device and see the same data, updated live. It is served at **/saadi/** on your portfolio site.

```
finance/
├── public/                  the app (copied to /saadi/ by the portfolio build)
│   ├── index.html           the whole app: HTML, CSS, JavaScript
│   └── config.js            your Supabase URL + anon key
└── supabase/
    ├── schema.sql           table, security rules, live sync, views (run once; safe to re-run)
    └── seed_my_data.sql     YOUR DATA: 20 projects, 33 transactions, settings (run once, never deploy)
```

## What changed in this version (audited and tested)

- **Ledger tab.** A per-account statement with Money in (Dr), Money out (Cr) and a running balance, plus opening and closing balances. A proof line checks opening + in − out = closing to the cent. An Earnings and expenses statement lists what you earned against everything paid out or deducted, and a What you hold total sums all accounts at today's rate.
- **Reconciliation checks.** These flag money marked paid on projects that never appears in an account: client payments missing from Payoneer, projects with no "Received via", and worker pay or Allah's share marked paid but not recorded as money out. One-click buttons pre-fill the missing transaction.
- **Exact to the cent.** Every amount is rounded at the line (half away from zero), totals add up whole cents, and the dollar and rupee columns each add up exactly: revenue − fees − worker pay − share = net. The Excel export uses matching `ROUND()` formulas.
- **In-progress transfers.** Money leaves the sending account straight away but only reaches the receiving account once you mark the transfer Completed. Until then it shows as "on the way".
- **Smaller fixes.** A fee-type money out is no longer counted twice. "All time" now includes salary and transactions outside the project dates. Money without its own rate is converted at the rate of its time instead of today's.
- **Reliable audit log.** Every change is awaited and retried. If the connection drops, the note is kept in the browser and written on the next sign-in, with a banner until then. Deleted items keep a full copy and can be restored from the change log.

If you already ran an older `schema.sql`, run the new one once more. It adds a `deleted_copy` column to the `pr_audit_log` view and changes nothing else.

## Setup (about 10 minutes)

### 1. Create the Supabase project
1. Go to supabase.com → **New project**. Pick a region close to you and save the database password somewhere safe.
2. Wait for it to finish setting up.

### 2. Create the table and security rules
1. **SQL Editor → New query**.
2. Paste all of `supabase/schema.sql` → **Run**. It should finish with "Success. No rows returned".

### 3. Create your login
1. **Authentication → Users → Add user → Create new user**.
2. Enter your email and a strong password, tick **Auto Confirm User**, and create it.
3. **Turn off public sign-ups** so nobody else can make an account. In **Authentication**, find the sign-up setting (under *Sign In / Providers* or *Settings*, depending on your dashboard version) and switch off **Allow new users to sign up**. Your own user keeps working.

### 4. Load your data
1. Open `supabase/seed_my_data.sql` and change `you@example.com` on line 14 to the email from step 3.
2. Paste it into a new SQL query → **Run**. You should see "Done: your starting data is in place".

### 5. Connect the app
1. In Supabase, open **Connect** (top bar) or **Project Settings → API Keys**.
2. Copy the **Project URL** and the **anon / publishable** key into `public/config.js`.
   - The anon key is designed to be public. Your data is protected by your login and the row-level security rules, not by hiding this key.
   - **Never** use the `service_role` / secret key anywhere in this app.

### 6. Try it locally
Open a terminal in the `public` folder and run `npx serve .` (or `python -m http.server`), then go to the address it prints and sign in.
Opening `index.html` by double-clicking also works, except the "email me a link" option.

### 7. Deploy
The portfolio build copies `public/` to `/saadi/` automatically; see the main README. After deploying, in Supabase go to **Authentication → URL Configuration** and add `https://oqvera.netlify.app/saadi/` under **Redirect URLs** (the "email me a sign-in link" button needs it).

## How it works

- **One table, `pr_docs`.** Each project, transaction, salary, audit entry and the settings is a row: `collection` says what it is, `data` (JSON) holds the fields. Adding new fields to the app later needs no database change.
- **Views for browsing:** `pr_projects`, `pr_transactions`, `pr_salaries` and `pr_audit_log` show the same data as normal columns in the Table Editor, so you can filter, sort or write SQL against it.
- **Security:** row-level security means each signed-in user can only read and write their own rows. Signed-out visitors get nothing.
- **Tamper-proof audit log:** the database refuses to change or delete audit entries from the app. Every edit, delete and "mark paid" is recorded with the time.
- **Live sync:** changes made on your phone appear on your laptop within a second or two, without reloading.
- **Not configured yet?** If `config.js` still has the placeholders, the app runs in "this browser only" mode so you can try it out.

## Everyday use

- **Today's dollar rate:** Settings → *Today's dollar rate*. Every rate field has a "Use today's rate" button.
- **Estimated transfers:** 13 older Payoneer → JazzCash transfers have no receipt, so their rupee amounts are estimates (marked *Estimated*). Edit each one with the real figures from JazzCash and set "Amounts confirmed?" to yes.
- **SadaPay transfer:** the Rs 100,000 JazzCash → SadaPay transfer is dated 2 Oct 2026 as a placeholder. Change it to the real date.
- **Backup:** *Download workbook* (Records or Settings tab) exports everything to Excel. Supabase's free plan also keeps daily backups for a short time; check your plan for details.

## Changing the code

Everything is in `public/index.html`:
- the Supabase layer is the block starting `/* ---------- Supabase connection ---------- */`;
- the money maths is in `calc()` (projects), `salCalc()` (salary), `flows()` / `txnRecv()` / `balances()` (accounts);
- the Ledger tab is `acctStatement()`, `plData()` and `reconChecks()`.
