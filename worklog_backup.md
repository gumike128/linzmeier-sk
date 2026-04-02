# LINZMEIER.SK Project Worklog

---
## Task ID: 1 - project-setup
### Work Task
Initialize the Next.js 15 project with TypeScript, Tailwind CSS 4, and shadcn/ui. Set up LINZMEIER brand color tokens and base design system.

### Work Summary
- Initialized Next.js 15 project with App Router and TypeScript
- Configured Tailwind CSS 4 with shadcn/ui (New York style)
- Set up LINZMEIER brand color system:
  - `brand` / `brand-light` / `brand-dark` / `brand-foreground` (blue tones)
  - `warm` / `warm-light` / `warm-dark` (amber tones for CTAs)
  - `eco` / `eco-light` (green tones for sustainability)
- Added custom CSS utilities: grid-pattern, section-divider, animated-underline, custom-scrollbar
- Configured next-themes for dark mode support
- Set up metadata with Slovak SEO keywords for insulation panels and facade systems
- Installed all shadcn/ui components including Sheet, NavigationMenu, DropdownMenu, Collapsible, Badge, etc.

---
## Task ID: 2 - header-component
### Work Task
Build the Header/Navigation component for LINZMEIER.SK corporate B2B website.

### Work Summary
- Created `/src/components/linzmeier/Header.tsx` as a full-featured responsive header
- **Sticky header** with scroll detection using `useRef` + `useEffect` pattern (lint-compliant): applies `bg-background/80 backdrop-blur-lg border-b border-border/50 shadow-sm` on scroll
- **Logo**: "LINZMEIER" in `text-brand-dark` bold + warm amber "SK" Badge
- **Desktop navigation** (lg+): Horizontal nav items using `DropdownMenu` for dropdown sections
  - Produkty dropdown: Izolačné panely, Fasádne systémy, Priečelové dosky, Príslušenstvo (with Lucide icons)
  - Riešenia dropdown: Rodinné domy, Bytové domy, Priemysel (with Lucide icons)
  - Simple links: Referencie, Technická podpora, O spoločnosti
- **Mobile navigation** (<lg): Hamburger button opens a `Sheet` from left side
  - Uses `Collapsible` for expandable dropdown sections with animated chevron
  - CTA button at bottom of mobile menu
- **CTA Button**: "Kontaktujte nás" with `bg-warm text-white hover:bg-warm-dark`, Phone icon
- Updated `page.tsx` to render the Header with placeholder hero content
- Lint passes with zero errors
- Dev server compiles and serves the page successfully (GET / 200)

---
## Task ID: 11 - footer-component
### Work Task
Build the Footer component for LINZMEIER.SK corporate B2B website with 4-column responsive layout, brand section, product/company links, contact details, and legal bottom bar.

### Work Summary
- Created `/src/components/linzmeier/Footer.tsx` as a server component (no 'use client')
- **4-column responsive grid**: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` with vertical `border-white/10` dividers between columns on desktop
- **Column 1 – Brand**: "LINZMEIER" bold text + warm amber "SK" Badge (matching Header), short Slovak description, social media icon row (LinkedIn, Facebook, YouTube) with hover effects
- **Column 2 – Produkty**: 4 navigation links (Izolačné panely, Fasádne systémy, Priečelové dosky, Príslušenstvo) matching Header dropdown items
- **Column 3 – Spoločnosť**: 5 navigation links (O spoločnosti, Referencie, Technická podpora, Kariéra, Kontakt)
- **Column 4 – Kontakt**: Company name, address (MapPin icon), email (Mail icon), phone (Phone icon) with `hover:text-warm` transitions
- **Bottom bar**: Separator, copyright text on left, legal links (Ochrana osobných údajov | Obchodné podmienky | Cookies) on right with vertical separators
- **Design**: Dark `bg-brand-dark` background, `text-white/80` base, `text-white/60` for links, `text-warm` hover accent
- Updated `page.tsx` to include Footer and added `flex flex-col` to main for proper `mt-auto` sticky-to-bottom behavior
- Lint passes with zero errors
- Dev server compiles successfully (GET / 200)

---
## Task ID: 9 - TechSupport section
### Work Task
Build the Technical Support section for LINZMEIER.SK B2B corporate website, including a downloads grid and FAQ accordion.

### Work Summary
- Created `/src/components/linzmeier/TechSupport.tsx` with two main parts:
  - **Downloads Grid**: 3 responsive cards (Technické listy PDF, BIM/CAD podklady, Montážne návody) each with icon, title, description, document count badge, and CTA button with Download/ArrowRight icons
  - **FAQ Accordion**: 8 FAQ items using shadcn Accordion with numbered step badges (01–08) on the left, custom hover/active states transitioning to amber theme
- **Design patterns**: Consistent with existing components — grid-pattern overlay, amber divider, framer-motion fade-in with staggered animations (`whileInView`, `viewport: once`), hover scale + shadow effects on cards
- **Card hover**: `hover:scale-[1.03] hover:shadow-lg` with CTA buttons that transition border/text to amber on hover
- **Accordion styling**: `pl-12` content offset aligned with numbered badges, `border-neutral-200` item separators, amber color on open state
- Updated `page.tsx` to render `<TechSupport />` after References
- ESLint passes with zero errors
- Dev server compiles and serves successfully (GET / 200)

---
## Task ID: 12-13 - sticky-cta-and-contact-api
### Work Task
Build the Sticky CTA bar component and the Contact API route for LINZMEIER.SK. Update Prisma schema with Lead model.

### Work Summary

#### PART A: Sticky CTA Bar (`/src/components/linzmeier/StickyCta.tsx`)
- Fixed to bottom of viewport with `z-50`
- Appears after scrolling past 600px (matches hero height threshold)
- **Desktop layout** (sm+): horizontal bar with phone number on left + CTA button on right
  - Phone icon in warm amber circle + "Zavolajte nám: +421 2 XXX XXX XX" (number hidden on mobile, text shown on md+)
  - "Nezáväzná konzultácia" button with warm amber styling and hover shadow/scale effects
  - Close button (X) with white/10 background
- **Mobile layout** (<sm): stacked vertically — phone button on top, CTA + dismiss button on bottom row
- Close button dismisses for the session via `useState`
- Smooth slide-up animation using framer-motion `AnimatePresence` with spring transition
- Background: `bg-brand-dark` with white text, elevated shadow
- CTA click: smooth scrolls to `#kontakt` section

#### PART B: Contact API Route (`/src/app/api/contact/route.ts`)
- POST endpoint accepting JSON with Zod validation
- Validates: `customerType` (enum: architekt/firma/investor), `name` (2-100 chars), `email`, optional `phone` (max 30), optional `projectType` (max 200), `message` (10-5000 chars)
- On success: saves to Prisma `Lead` model, returns 201 with lead ID and Slovak success message
- On validation error: returns 400 with flattened field errors
- On server error: returns 500 with generic Slovak error message
- Error messages in Slovak language

#### PART C: Prisma Schema Update
- Added `Lead` model to `prisma/schema.prisma` with fields: id, customerType, name, email, phone (optional), projectType (optional), message, status (default "new"), createdAt, updatedAt
- Ran `npm run db:push` — database synced successfully

#### Integration
- Added `<StickyCta />` to `page.tsx` after Footer
- ESLint passes with zero errors
- Dev server compiles successfully (GET / 200)

---
## Task ID: 10 - About and Partners sections
### Work Task
Build the About section and Partners/Trust section for LINZMEIER.SK corporate B2B website.

### Work Summary
- Created `/src/components/linzmeier/About.tsx` with two exported components: `About` and `Partners`

#### PART A: About Section (`About`)
- **Section title**: "O spoločnosti LINZMEIER" with subtitle about 40+ years of German quality
- **Two-column layout** (desktop `lg:grid-cols-2`):
  - Left: 3 paragraphs of company description text in Slovak covering company founding, German manufacturing quality, and Slovak market entry with BIM support
  - Right: Manufacturing facility image (`/images/about-manufacturing.png`) with rounded corners, shadow, and caption "Náš výrobný závod v Nemecku"
- **Key milestones row** (4 cards, `grid-cols-2 sm:grid-cols-4`):
  - 1980 – Založenie spoločnosti
  - 1995 – Expandia na strednú Európu
  - 2010 – Uvedenie Thermowand systému
  - 2020 – Vstup na slovenský trh
- Subtle grid overlay pattern, framer-motion staggered animations (slide from left for content, slide from right for image)

#### PART B: Partners/Trust Section (`Partners`)
- **Section title**: "Dôverujú nám" with "Partneri" accent label
- **Partner logo cards grid** (6 partners, `grid-cols-2 lg:grid-cols-3`):
  - STAVO Slovakia, HB Reavis, PORR, STRABAG, IMPRO, Eurovia SK
  - Cards with company names in muted text, hover effects transitioning to full color
- **Trust badges row** (4 badges, `grid-cols-2 sm:grid-cols-4`):
  - ISO 9001 Certifikovaný (Award icon), STN EN 13501-1 (Shield icon), CE Značka (FileCheck icon), Member of DAF (Users icon)
  - Each badge in a card with warm amber icon and muted text label
- Background: `bg-muted/30` for visual contrast from About section

#### Design Patterns
- Consistent with existing components: `section-divider`, framer-motion `whileInView`/`viewport: once`, staggered container/item variants, Card with `border-border/40` and hover shadow transitions
- Amber (`warm`) accent color for milestone years and trust badge icons
- White background for About, muted background for Partners

#### Integration
- Updated `page.tsx` to render `<About />` and `<Partners />` between References and TechSupport
- ESLint passes with zero errors
- Dev server compiles and serves successfully (GET / 200)

---
## Task ID: 8 - lead-generation-form
### Work Task
Build the Lead Generation / Contact form section for LINZMEIER.SK — a dark-themed two-column section with compelling content on the left and a full-featured lead capture form on the right.

### Work Summary
- Created `/src/components/linzmeier/LeadForm.tsx` as a client component with `'use client'` directive
- **Dark section background**: `bg-brand-dark` with decorative gradient orbs (`bg-warm/10` and `bg-brand-light/10` with `blur-3xl`) for depth
- **Two-column layout**: Left column for content, right column for form; stacks vertically on mobile (`grid gap-10 lg:grid-cols-2 lg:gap-16`)
- **Section header**: Title "Požiadajte o cenovú ponuku" in white, subtitle in `text-white/70`, amber warm divider bar — all animated with framer-motion `whileInView`
- **Left column content**:
  - Compelling heading "Naši odborníci sú vám k dispozícii" with descriptive paragraph
  - 3 contact info cards (Phone, Email, Location) with icons in warm amber circles, hover effects (`hover:border-warm/30 hover:bg-white/10`), clickable links for phone and email
  - "Odpovieme do 24 hodín" badge with eco green theming and Clock icon
- **Right column form** using shadcn/ui components (Input, Textarea, Select, RadioGroup, Button, Label):
  - **Customer type selector**: RadioGroup styled as selectable cards with icons (Building2, HardHat, TrendingUp), `border-warm bg-warm/15` active state, CheckCircle indicator on selected card
  - **Form fields**: Name (required), Email (required with validation), Phone (optional), Project Type (Select: Novostavba/Rekonštrukcia/Priemysel), Message textarea (required)
  - **File upload**: Dashed border area with Upload icon, accepts `.pdf,.dwg,.jpg,.png`; shows file name/size when selected with remove button
  - **Styling**: All inputs use `bg-white/10 border-white/20 text-white placeholder:text-white/40` with warm focus ring states
  - **Submit button**: `bg-warm hover:bg-warm-dark text-white`, "Odoslať žiadosť" with Send icon; loading state shows animated SVG spinner + "Odsiela sa..."
  - **GDPR note**: Subtle `text-white/40` text below submit
- **Form state management**: React `useState` for all fields, file, customer type, errors, and submitting state
- **Validation**: Client-side validation for required fields (name, email, message, customerType, projectType) with email regex check; displays red error text per field
- **Submit behavior**: Simulated 1.5s API delay, then shows success toast via `sonner`; resets all form fields after successful submission; no actual API call (API built separately in Task 12-13)
- **Toast notifications**: Uses `toast` from `sonner` — error toast on validation failure, success toast on submission
- **Updated `layout.tsx`**: Switched Toaster import from `@/components/ui/toaster` to `@/components/ui/sonner` for sonner toast support
- **Updated `page.tsx`**: Added `<LeadForm />` between TechSupport and Footer sections
- ESLint passes with zero errors
- Dev server compiles and serves successfully (GET / 200)

---
## Task ID: 15 - Final Assembly
### Work Task
Assemble all section components in page.tsx in correct order, add section IDs for CTA scroll navigation, verify complete website.

### Work Summary
- Assembled all 12 components in `/src/app/page.tsx` in order: Header → Hero → Products → Solutions → WhyLinzmeier → References → About → Partners → TechSupport → LeadForm → Footer → StickyCta
- Added `id="kontakt"` to LeadForm section for hero CTA scroll target
- Added `id="podklady"` to TechSupport section for hero secondary CTA
- All section IDs: #kontakt, #podklady, #produkty, #solutions, #o-spolocnosti, #partneri, #referencie
- Generated 8 AI images: hero-facade, product-panels, product-facade, product-boards, solution-house, solution-apartments, solution-industrial, about-manufacturing
- Final ESLint: zero errors
- Dev server: all routes compiling with 200 responses

---
## Task ID: 1-f1 - backend-foundation
### Work Task
Build Prisma schema, TypeScript type definitions, RBAC system, AI wrapper service, and email service stub for the LINZMEIER.SK CMS + CRM + AI admin system.

### Work Summary

#### 1. Prisma Schema (`prisma/schema.prisma`)
- Replaced entire schema with 11 models covering Auth/RBAC, CRM, CMS, AI Logging, and Settings
- **Auth & RBAC**: `User` model with role (ADMIN/SALES/MARKETING/TECHNICIAN/PARTNER), passwordHash, avatarUrl, lastLoginAt, isActive
- **CRM**: `Lead` (extended with company, projectArea, budget, source, priority, score, ipAddress, userAgent, readAt, assignedTo relation), `Note`, `Activity`
- **CMS**: `Product` (slug, category, specs, benefits, gallery, suitableFor), `BlogPost` (slug, content, excerpt, meta fields), `Reference` (type, location, system, tags), `Document` (category, fileType, fileUrl, isPublic)
- **AI Logging**: `AIInteraction` (type, input, output, model, tokensUsed, durationMs, metadata)
- **Settings**: `Setting` (key-value store with type field)
- Removed old `Post` model; extended `Lead` model with new fields (company, projectArea, budget, source, priority, score, etc.)
- Fixed Prisma relation validation by adding explicit `@relation("AssignedTo")` on `User.assignedLeads` and reverse `author`/`user` fields on Note, Activity, AIInteraction models
- Ran `prisma db push` — database synced successfully, Prisma Client generated

#### 2. Type Definitions (`src/types/index.ts`)
- Created comprehensive TypeScript types: `UserRole`, `LeadStatus`, `ContentStatus`, `LeadPriority`, `ProductCategory`, `DocumentCategory`
- Defined `Permission` union type with 23 granular permissions across leads, pipeline, products, blog, references, documents, AI, dashboard, and settings
- Created `DashboardStats`, `LeadWithUser`, `ActivityWithUser` interfaces for dashboard API responses

#### 3. RBAC System (`src/lib/rbac.ts`)
- Implemented 5-role permission matrix: ADMIN (23 permissions), SALES (9), MARKETING (15), TECHNICIAN (6), PARTNER (2)
- Role-based menu visibility: ADMIN sees all sections, PARTNER only sees documents
- `hasPermission(role, permission)` function for API/route guard checks
- `getVisibleMenuItems(role)` function for sidebar navigation
- Lead status flow machine (`LEAD_STATUS_FLOW`): NEW → CONTACTED → QUALIFIED → PROPOSAL → NEGOTIATION → WON/LOST
- Slovak status labels (`LEAD_STATUS_LABELS`) and Tailwind badge colors (`LEAD_STATUS_COLORS`)

#### 4. AI Wrapper (`src/lib/ai.ts`)
- Singleton ZAI client with lazy initialization
- `chatbotQuery()`: Slovak chatbot with LINZMEIER product context injection from database, logs interactions to AIInteraction model
- `suggestReply()`: AI-powered lead reply suggestions based on lead data and notes
- `generateContent()`: Content generation for blog, product descriptions, SEO meta data, and FAQ — all in Slovak

#### 5. Email Service (`src/lib/email.ts`)
- Phase 1 stub with console logging (no external SMTP integration)
- `sendEmail()` payload interface with to/subject/html
- `getLeadConfirmationTemplate()`: Slovak confirmation email for lead submitters
- `getNewLeadNotificationTemplate()`: Internal notification template for new leads
- Ready for Phase 2 integration with Resend/SendGrid

- ESLint: zero errors
- Dev server: GET / 200

---
## Task ID: 2-f1 - auth-system
### Work Task
Build NextAuth authentication system for LINZMEIER.SK admin — including auth config, API route, middleware helpers, RBAC-aware types, admin login page, and session provider setup.

### Work Summary

#### 1. Auth Configuration (`src/lib/auth.ts`)
- Configured NextAuth v4 with `CredentialsProvider` for email/password authentication
- Implemented simple hash/verify password functions (MVP, salt-based JS hash) — exportable for user seeding
- JWT session strategy with 8-hour max age
- JWT callback: stores `id` and `role` in the token on sign-in
- Session callback: propagates `id` and `role` from token to session user
- `pages.signIn` points to `/admin` for unauthorized redirects
- `NEXTAUTH_SECRET` fallback to dev secret

#### 2. NextAuth API Route (`src/app/api/auth/[...nextauth]/route.ts`)
- Catch-all route handler exporting `GET` and `POST` from `NextAuth(authOptions)`
- Standard NextAuth v4 pattern for App Router

#### 3. API Auth Middleware (`src/lib/api-auth.ts`)
- `getAuthUser()`: extracts authenticated user from server session (id, email, name, role)
- `unauthorized()`: returns 401 JSON response (Slovak message)
- `forbidden()`: returns 403 JSON response (Slovak message)
- `requireAuth(permission)`: higher-order async function that checks auth + RBAC permission; returns user object on success, or 401/403 response on failure

#### 4. NextAuth Type Augmentation (`src/types/next-auth.d.ts`)
- Extends `next-auth` Session and User with `id`, `email`, `name`, `role: UserRole`
- Extends `next-auth/jwt` JWT with `id` and `role: UserRole`
- Removed duplicate module declarations from `auth.ts` to keep types in single location

#### 5. Admin Route Group Setup
- `(admin)/providers.tsx`: Client component wrapping children in `SessionProvider` from `next-auth/react`
- `(admin)/layout.tsx`: Admin route group layout wrapping all admin pages in `Providers`
- `(admin)/login/layout.tsx`: Login-specific layout also wrapping in `Providers`

#### 6. Admin Login Page (`src/app/(admin)/login/page.tsx`)
- Professional login form with LINZMEIER branding (brand-dark text + warm ADMIN badge)
- Email input with Mail icon, password input with Lock icon
- Uses `signIn('credentials', { redirect: false })` from `next-auth/react`
- Success: redirects to `/admin/dashboard`; Error: shows Slovak toast via `sonner`
- Loading state with spinner on submit button
- shadcn/ui Card, Input, Label, Button components

#### 7. Environment Configuration
- Added `NEXTAUTH_SECRET` and `NEXTAUTH_URL` to `.env`

#### 8. Prisma Schema
- Confirmed User model already has auth fields (passwordHash, role, isActive, lastLoginAt) from Task 1-f1
- Fixed `@relation("AssignedTo")` on User.assignedLeads to resolve Prisma validation error
- `npm run db:push` confirmed schema is in sync

- ESLint: zero errors
- Dev server: GET / 200, .env reload detected

---
## Task ID: 7-f1 - ai-api-routes-and-settings
### Work Task
Build AI API routes (public chatbot, suggest reply, generate content) and Settings API (GET/PUT) for the LINZMEIER.SK admin system.

### Work Summary

#### 1. Public Chatbot API (`/src/app/api/chat/route.ts`)
- POST endpoint — no authentication required
- Validates `message` with Zod: non-empty string, max 1000 characters
- Calls `chatbotQuery(message)` from `@/lib/ai` which injects product context from DB
- Returns `{ response: string }` on success
- Returns 400 for validation errors, 500 for server errors (Slovak messages)

#### 2. AI Suggest Reply API (`/src/app/api/admin/ai/suggest/route.ts`)
- POST endpoint — requires `ai:suggest` permission (ADMIN, SALES)
- Validates `leadId` with Zod
- Fetches lead with its latest 10 notes from DB (notes ordered by createdAt desc)
- Returns 404 if lead not found
- Calls `suggestReply(leadData)` with lead name, customerType, projectType, message, and note contents
- Returns `{ suggestion: string }`

#### 3. AI Generate Content API (`/src/app/api/admin/ai/generate/route.ts`)
- POST endpoint — requires `ai:generate` permission (ADMIN, MARKETING)
- Validates body with Zod: `type` (enum: blog/product/seo/faq), `topic` (1-500 chars), `tone` (optional, max 100 chars)
- Calls `generateContent(type, topic, tone)` from `@/lib/ai`
- Logs AI interaction to DB via `db.aIInteraction.create()` with type `generate_{type}`, topic as input, generated content as output, authenticated user's ID, duration in ms, and metadata JSON with type+tone
- Returns `{ content: string }`

#### 4. Settings API (`/src/app/api/admin/settings/route.ts`)
- **GET**: Requires `settings:view` permission — returns all settings as `{ settings: { key, value, type }[] }` ordered by key ascending
- **PUT**: Requires `settings:users` permission — validates array of `{ key, value }` objects, upserts each setting using `db.setting.upsert()` (creates if key doesn't exist, updates if it does). Returns `{ success: true }`
- Both endpoints use `requireAuth()` from `@/lib/api-auth` for auth + RBAC guard

#### Design Patterns
- Consistent error handling: Zod validation errors return 400 with flattened field errors, server errors return 500 with Slovak messages
- All admin routes use `requireAuth(permission)()` pattern returning user or 401/403
- Slovak error messages throughout
- `console.error` with route-prefixed tags for debugging

- ESLint: zero errors
- Dev server: compiling successfully

---
## Task ID: 5-f1 - crm-api-routes
### Work Task
Build CRM API routes for LINZMEIER.SK admin system: Leads CRUD with filtering/pagination, Notes management, Activities, and Dashboard statistics.

### Work Summary

#### 1. Leads List & Create API (`/src/app/api/admin/leads/route.ts`)
- **GET**: List leads with filtering, pagination, and search
  - Query params: `status`, `customerType`, `search`, `page`, `limit`, `sortBy`, `sortOrder`
  - Requires `leads:view` permission
  - Validates sort fields against allowlist (createdAt, updatedAt, name, email, status, priority, customerType)
  - Returns `{ leads, total, page, totalPages }` with assignedTo user included
  - Search matches name, email, and company fields
- **POST**: Create a new lead
  - Zod schema validates: customerType (enum), name (2-100), email, phone?, company?, projectType?, message (10-5000), priority?, source?, assignedToId?
  - Requires `leads:create` permission
  - Creates lead in DB with optional assignment
  - Creates Activity log entry (type: `lead_created`)
  - Sends confirmation email to lead (non-blocking, Slovak template)
  - Sends internal notification email (non-blocking)
  - Returns 201 with created lead including assignedTo relation

#### 2. Single Lead API (`/src/app/api/admin/leads/[id]/route.ts`)
- **GET**: Get single lead with notes and activities
  - Requires `leads:view` permission
  - Returns lead with `assignedTo`, `notes` (with author, ordered by createdAt desc), and `activities` (with user, ordered by createdAt desc)
  - Returns 404 if lead not found
- **PUT**: Update lead fields
  - Zod schema validates: status (LeadStatus enum), priority (LeadPriority enum), assignedToId (nullable), customerType, name, email, phone, company, projectType, message
  - Requires `leads:edit` permission
  - Conditionally spreads only provided fields into update data
  - If status changes: creates Activity log with old→new status description
  - If assignment changes: creates Activity log with assignee name
  - Returns updated lead with assignedTo relation
- **DELETE**: Archive lead (soft delete)
  - Requires `leads:delete` permission
  - Sets lead status to `LOST` (archive)
  - Creates Activity log (type: `lead_archived`) with original status noted
  - Returns `{ success: true, lead }`

#### 3. Lead Notes API (`/src/app/api/admin/leads/[id]/notes/route.ts`)
- **POST**: Add note to lead
  - Zod schema validates: content (1-5000 chars)
  - Requires `leads:edit` permission
  - Returns 404 if lead not found
  - Creates Note in DB with authorId from authenticated user
  - Creates Activity log (type: `note_added`) referencing the lead
  - Returns 201 with created note including author relation

#### 4. Dashboard Stats API (`/src/app/api/admin/dashboard/stats/route.ts`)
- **GET**: Dashboard statistics
  - Requires `dashboard:view` permission
  - Returns: `{ newLeadsToday, totalLeads, wonLeads, conversionRate, leadsByStatus, recentLeads, recentActivities }`
  - `newLeadsToday`: count of leads created since midnight
  - `totalLeads`: count excluding LOST status
  - `wonLeads`: count of WON leads
  - `conversionRate`: (WON / total non-lost) × 100, rounded percentage
  - `leadsByStatus`: computed count per status from all leads
  - `recentLeads`: last 5 leads with assignedTo relation
  - `recentActivities`: last 10 activities with user name and lead name
  - All queries run in parallel via `Promise.all` for performance

#### Design Patterns
- All routes use `getAuthUser()` + `hasPermission()` for auth + RBAC checks
- Zod `safeParse` for input validation with Slovak error messages
- `try/catch` wrapping all handlers with 500 Slovak error responses
- `console.error` with route-prefixed tags for debugging
- Non-blocking email sends with `.catch()` to avoid affecting main flow
- Next.js 15 App Router dynamic `params` via `Promise<{ id: string }>`
- ESLint: zero errors
- Dev server: compiling successfully

---
## Task ID: 6-f1 - cms-api-routes
### Work Task
Build CMS API routes for LINZMEIER.SK admin system — Products, Blog, References, and Documents CRUD operations with auth, RBAC, Zod validation, and Slovak error messages.

### Work Summary

#### 1. Products List & Create (`/src/app/api/admin/products/route.ts`)
- **GET**: List products with filtering and pagination
  - Query params: `category`, `status`, `search` (name/shortDesc), `page`, `limit`
  - Requires `products:view` permission
  - Returns `{ products, total, page, totalPages }` ordered by sortOrder
- **POST**: Create product
  - Zod schema validates: name (required), slug (optional, auto-generated), shortDesc?, description?, category (required), specs?, benefits?, metaTitle?, metaDescription?, status (DRAFT/PUBLISHED/ARCHIVED, default DRAFT), sortOrder?, imageUrl?, galleryImages?, suitableFor?
  - Requires `products:edit` permission
  - Auto-generates slug from name if not provided: `name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')`
  - Checks for duplicate slug — returns 409 on conflict
  - Returns 201 with created product

#### 2. Product Detail (`/src/app/api/admin/products/[id]/route.ts`)
- **GET**: Single product — requires `products:view`
- **PUT**: Update product — requires `products:edit`
  - Auto-updates slug when name changes (unless explicit slug provided)
  - Checks slug uniqueness (excluding self)
  - Conditionally spreads only provided fields
- **DELETE**: Delete product — requires `products:edit`
- All return 404 if product not found

#### 3. Blog List & Create (`/src/app/api/admin/blog/route.ts`)
- **GET**: List blog posts with filtering and pagination
  - Query params: `status`, `search` (title/excerpt), `page`, `limit`
  - Requires `blog:view` permission
  - Returns `{ posts, total, page, totalPages }` ordered by createdAt desc
- **POST**: Create blog post
  - Zod schema validates: title (required), slug (optional, auto-generated), content?, excerpt?, coverImage?, metaTitle?, metaDescription?, metaKeywords?, status (DRAFT/PUBLISHED/ARCHIVED, default DRAFT), publishedAt?
  - Requires `blog:edit` permission
  - Auto-generates slug from title (supports Slovak diacritics in slug)
  - Auto-sets `publishedAt = now()` when status is PUBLISHED and no publishedAt provided
  - Checks for duplicate slug — returns 409 on conflict

#### 4. Blog Detail (`/src/app/api/admin/blog/[id]/route.ts`)
- **GET**: Single blog post — requires `blog:view`
- **PUT**: Update blog post — requires `blog:edit`
  - Auto-updates slug when title changes
  - Handles publishedAt logic: explicit override or auto-set on first publish
  - Checks slug uniqueness (excluding self)
- **DELETE**: Delete blog post — requires `blog:edit`

#### 5. References List & Create (`/src/app/api/admin/references/route.ts`)
- **GET**: List references with filtering and pagination
  - Query params: `status`, `type`, `search` (title/location), `page`, `limit`
  - Requires `references:view` permission
  - Returns `{ references, total, page, totalPages }` ordered by sortOrder
- **POST**: Create reference
  - Zod schema validates: title (required), description?, type (required), location (required), system?, coverImage?, tags?, status (default DRAFT), sortOrder?
  - Requires `references:edit` permission

#### 6. Reference Detail (`/src/app/api/admin/references/[id]/route.ts`)
- **GET**: Single reference — requires `references:view`
- **PUT**: Update reference — requires `references:edit`
- **DELETE**: Delete reference — requires `references:edit`

#### 7. Documents List, Create & Delete (`/src/app/api/admin/documents/route.ts`)
- **GET**: List documents with filtering and pagination
  - Query params: `category`, `isPublic`, `page`, `limit`
  - Requires `documents:view` permission
  - Returns `{ documents, total, page, totalPages }` ordered by sortOrder
- **POST**: Create document
  - Zod schema validates: title (required), description?, category (required), fileType (required), fileSize?, fileUrl (required), sortOrder? (default 0), isPublic? (default true)
  - Requires `documents:upload` permission
- **DELETE**: Delete document by query param `id`
  - Requires `documents:edit` permission
  - Returns 400 if `id` query param missing

#### Design Patterns
- All routes use `getAuthUser()` + `hasPermission()` from `@/lib/api-auth` and `@/lib/rbac`
- Zod `safeParse` with Slovak error messages on all POST/PUT endpoints
- Consistent response structure: 201 for creates, 409 for conflicts, 404 for not found, 400 for validation, 500 for server errors
- Next.js 15 App Router dynamic `params` via `Promise<{ id: string }>` pattern
- ESLint: zero errors
- Dev server: compiling successfully

---
## Task ID: 8-f1 - admin-layout
### Work Task
Build Admin Layout with Sidebar, Header, Auth Guard, and dashboard placeholder page for LINZMEIER.SK admin panel.

### Work Summary

#### 1. AdminGuard (`/src/components/admin/AdminGuard.tsx`)
- Client component using `useSession` from `next-auth/react`
- Redirects unauthenticated users to `/admin/login` via `useRouter`
- Shows centered loading spinner with "Načítavanie…" text on session loading state
- Returns `null` if no session (before redirect kicks in)
- Wraps children in fragment when authenticated

#### 2. AdminSidebar (`/src/components/admin/AdminSidebar.tsx`)
- **Dark sidebar** with `bg-brand-dark` background, `text-white` text, `border-white/10` separators
- **Logo area**: Shield icon + "LINZMEIER" bold text + warm amber "ADMIN" Badge
- **Navigation items**: 9 menu items across 5 sections (Hlavné, CRM, CMS, AI, Systém)
  - Dashboard (LayoutDashboard) → /admin/dashboard
  - CRM – Leady (Users) → /admin/crm/leads
  - CRM – Pipeline (Kanban) → /admin/crm/pipeline
  - Produkty (Package) → /admin/cms/products
  - Blog (FileText) → /admin/cms/blog
  - Referencie (Building2) → /admin/cms/references
  - Dokumenty (FolderOpen) → /admin/cms/documents
  - AI Nástroje (Bot) → /admin/ai/chatbot
  - Nastavenia (Settings) → /admin/settings
- **RBAC filtering**: Uses `getVisibleMenuItems(role)` to show role-appropriate sections only
- **Section grouping**: Menu items grouped by section headers with uppercase tracking-wider labels
- **Active state**: Current path highlighted with `bg-white/15 text-white` + warm amber dot indicator
- **Hover state**: Smooth `bg-white/10 hover:text-white` transitions
- **Desktop**: Fixed 260px sidebar on left side, `hidden md:flex`
- **Mobile**: Sheet overlay (shadcn Sheet from left, 272px width) triggered by hamburger button
- **User footer**: Avatar with initials, user name, role label (Slovak), sign-out button with Tooltip
- **ScrollArea**: Custom scrollbar for nav overflow

#### 3. AdminHeader (`/src/components/admin/AdminHeader.tsx`)
- **Sticky top bar**: `sticky top-0 z-20`, white background with bottom border
- **Mobile**: Page title displayed (breadcrumb hidden), spacer for sidebar hamburger
- **Desktop**: Full breadcrumb navigation using shadcn Breadcrumb components
- **Breadcrumb mapping**: `PAGE_TITLES` record maps all admin routes to breadcrumb segments; supports prefix matching for dynamic routes (e.g., /admin/crm/leads/123)
- **Notification bell**: Ghost button with warm amber dot indicator (placeholder for future notifications)
- **User dropdown**: Avatar with initials + name (hidden on mobile), chevron icon
  - DropdownMenu with user name/email label, Settings link, Profile link, Sign Out action (destructive styling)
- **Responsive**: `px-4 md:px-6` padding, name hidden below `lg`

#### 4. Admin Layout (`/src/app/(admin)/admin/layout.tsx`)
- Wraps all `/admin/*` pages in `AdminGuard` → Sidebar + Header + Content area
- Content area offset with `md:pl-[260px]` to accommodate fixed sidebar
- Main content: `p-4 md:p-6 bg-muted/30 overflow-auto`
- Inherits `SessionProvider` from parent `(admin)/layout.tsx`

#### 5. Dashboard Placeholder (`/src/app/(admin)/admin/dashboard/page.tsx`)
- Server component with welcome message "Vitajte v administračnom paneli LINZMEIER.SK"
- 4 stat cards in responsive grid (Nové leady, Aktívne projekty, Konverzia, AI interakcie) with colored backgrounds
- 2-column layout: "Najnovšie aktivity" feed (5 items) + "Rýchle akcie" quick action buttons
- Brand-consistent design with warm amber accent dots and hover states

- ESLint: zero errors
- Dev server: GET / 200, all admin routes compiling

---
## Task ID: 9-f1, 10-f1 - admin-dashboard-and-crm-pages
### Work Task
Build Admin Dashboard page with real data fetching, Leads list page with filters/search/pagination, Lead detail page with timeline/notes/AI suggest, and shared StatusBadge component for the LINZMEIER.SK admin system.

### Work Summary

#### 1. Dashboard Stats API Enhancement (`/src/app/api/admin/dashboard/stats/route.ts`)
- Added `aiInteractions` count to the parallel `Promise.all` query batch (queries `db.aIInteraction.count()`)
- Response now includes `aiInteractions` field matching `DashboardStats` type definition

#### 2. StatusBadge Component (`/src/components/admin/StatusBadge.tsx`)
- Reusable badge component using `LEAD_STATUS_LABELS` and `LEAD_STATUS_COLORS` from `@/lib/rbac`
- Falls back to gray badge for unknown statuses

#### 3. Dashboard Page (`/src/app/(admin)/admin/dashboard/page.tsx`)
- **Replaced** placeholder server component with `'use client'` data-driven page using TanStack Query
- **4 stat cards** in responsive grid (`sm:grid-cols-2 lg:grid-cols-4`):
  - Nové leady dnes (UserPlus, blue theme)
  - Celkom leadov (Users, brand-dark theme)
  - Konverzný pomer (TrendingUp, green theme, % suffix)
  - AI interakcie (Bot, purple theme)
- **Two-column layout** (`lg:grid-cols-7`):
  - Left (col-span-4): Recent leads table with columns: Name, Email, Typ, Stav (StatusBadge), Dátum. Rows clickable → lead detail
  - Right (col-span-3): Activity feed with timeline design (vertical line, activity-type icons with colors, description, user name, time ago)
- **Skeleton loading** states for all sections while data loads
- Auto-refetch every 30 seconds via `refetchInterval`

#### 4. Leads List Page (`/src/app/(admin)/admin/crm/leads/page.tsx`)
- **Top bar**: Title with lead count, "Nový lead" button (opens Dialog)
- **Filter pills**: 8 status filters (Všetky, Nové, Kontaktovaný, Kvalifikovaný, Ponuka, Rokovanie, Získaný, Stratený) with active state styling (`bg-brand-dark text-white`)
- **Search input**: Search by name, email, company with Search icon
- **Table columns**: Name (with avatar initial), Email, Typ (customer type badge), Stav (StatusBadge), Priorita (colored badge), Priradený (assigned user name), Dátum (formatted Slovak date)
- **Row click** → navigates to `/admin/crm/leads/[id]`
- **Empty state**: Icon + message for no results or no leads in filter
- **Pagination**: Bottom bar with page info + Predošlá/Ďalšia buttons
- **Create Lead Dialog**: Form with name, email, phone, company, customer type (Select), project type (Select), message (Textarea). Posts to `/api/admin/leads`, invalidates query on success
- Query params: `?status=NEW&search=john&page=2`
- TanStack Query with `queryKey: ['leads', status, search, page]`

#### 5. Lead Detail Page (`/src/app/(admin)/admin/crm/leads/[id]/page.tsx`)
- **Header**: Back button, lead name + email, status badge (Select dropdown for status transitions using `LEAD_STATUS_FLOW`), priority badge, customer type badge, "AI navrhni odpoveď" button
- **AI Suggest Reply flow**:
  1. Click button → loading state (Loader2 spinner)
  2. POST to `/api/admin/ai/suggest` with `{ leadId }`
  3. Display suggestion in violet-themed card with Sparkles icon
  4. "Použiť ako poznámku" button copies suggestion to note textarea
- **Two-column layout** (`lg:grid-cols-5`):
  - Left (col-span-3): Contact info card (Name, Email, Phone, Company with icons) + Project info card (Project Type, Source, Message in bordered area, Created/Updated dates, Assigned user display)
  - Right (col-span-2): Activity timeline with vertical line, activity-type colored icons, description, user name, time ago
- **Notes section** at bottom: List of notes with author + timestamp, "Pridať poznámku" textarea + submit button
- **Status change**: Updates via PUT `/api/admin/leads/[id]`, invalidates lead + leads + dashboard queries, shows toast notification
- **Note creation**: POST `/api/admin/leads/[id]/notes`, invalidates lead query
- **Skeleton loading** state for detail page

#### 6. Settings Page Fix
- Fixed React compiler lint error in `/src/app/(admin)/admin/settings/page.tsx` (refs during render → state-based initialization pattern)

#### Design Patterns
- All components use shadcn/ui: Card, Table, Badge, Button, Input, Textarea, Select, Dialog, Skeleton, Separator
- Brand-consistent color scheme: `brand-dark`, `warm` accents, `border-border/40` card borders
- Responsive design: hidden columns on smaller screens via `hidden sm:table-cell`, `hidden md:table-cell`, etc.
- Slovak language throughout UI labels
- TanStack Query for all data fetching with proper queryKey invalidation
- `formatTimeAgo()` and `formatDateTime()` utility functions for Slovak date formatting

- ESLint: zero errors
- Dev server: compiling successfully (GET / 200)

---
## Task ID: 11-f1, 12-f1, 13-f1 - cms-admin-pages
### Work Task
Build CMS admin pages for LINZMEIER.SK admin system — Products list + editor, Blog list + editor, References list + editor, Documents list + inline creator. All pages with TanStack Query, react-hook-form + zod validation, sonner toasts, and shadcn/ui components.

### Work Summary

#### 0. QueryClient Provider Setup
- Updated `/src/app/(admin)/providers.tsx` to include `QueryClientProvider` from `@tanstack/react-query`
- Configured with `staleTime: 30_000` and `refetchOnWindowFocus: false`
- QueryClient created via `useState` for stable instance across renders

#### 1. Products List Page (`/src/app/(admin)/admin/cms/products/page.tsx`)
- **Header**: "Produkty" title + "Nový produkt" button (warm amber, navigates to `/admin/cms/products/new`)
- **Filters**: Category select (panels/facades/boards/accessories), Status select (DRAFT/PUBLISHED/ARCHIVED), Search input with 300ms debounce
- **Product grid**: Responsive `sm:grid-cols-2 lg:grid-cols-3` of clickable cards
  - Each card: name (line-clamp-2), status badge (amber/green/gray), shortDesc (line-clamp-2), category badge with color, sortOrder
  - Click → navigates to `/admin/cms/products/[id]`
- **Status badges**: DRAFT = amber, PUBLISHED = green, ARCHIVED = gray
- **Category badges**: panels = blue, facades = purple, boards = orange, accessories = pink
- **Skeleton loading**, empty state, error state
- **Pagination** with Predošlá/Ďalšía buttons
- TanStack Query with `queryKey: ['products', category, status, search, page]`

#### 2. Product Editor Page (`/src/app/(admin)/admin/cms/products/[id]/page.tsx`)
- Supports both `new` (empty form, POST) and real ID (fetch + fill, PUT)
- **Form fields** (react-hook-form + zod):
  - Name (text input, required)
  - Category (select: panels/facades/boards/accessories)
  - Short description (textarea, max 200 with counter)
  - Description (textarea, rows=6)
  - Status (select: DRAFT/PUBLISHED/ARCHIVED)
  - Sort order (number input)
  - Suitable for (3 checkboxes: RD, Bytové domy, Priemysel) — stored as JSON array
  - Image URL (text input)
  - Meta title (text, max 70 with counter)
  - Meta description (textarea, max 160 with counter)
- **Two-column layout**: Left = basic info card, Right = suitability card + image card + SEO card
- **Header actions**: "Uložiť" (save) + "Publikovať" (save + set status to PUBLISHED)
- `suitableFor` parsed from JSON on load, serialized to JSON on save
- Back button to products list
- TanStack Query `useQuery` for fetching, `useMutation` for save/publish
- Toast notifications via sonner

#### 3. Blog List Page (`/src/app/(admin)/admin/cms/blog/page.tsx`)
- **Header**: "Blog" title + "Nový článok" button
- **Filters**: Status select, Search input with debounce
- **List layout**: Vertical card list (not grid) — each card shows:
  - Cover image thumbnail (20×14, hidden on mobile)
  - Title + status badge
  - Excerpt (line-clamp-2)
  - PublishedAt date (Calendar icon, Slovak locale via date-fns) + CreatedAt date
- Skeleton loading, empty state, error state
- Pagination

#### 4. Blog Editor Page (`/src/app/(admin)/admin/cms/blog/[id]/page.tsx`)
- Supports `new` and real ID
- **Layout**: 3-column grid — 2 cols for content, 1 col sidebar
- **Content column**: Title, Slug (auto-generated hint), Excerpt (max 500 with counter), Content (textarea, min-h-[300px])
- **Sidebar**: Status select, Cover image URL (with preview), SEO Meta card (metaTitle, metaDescription, metaKeywords)
- **AI Generate button**: "AI vygeneruj obsah" with Sparkles icon
  - Opens Dialog with topic textarea + tone select (profesionálny, odborný, prístupný, marketingový)
  - POSTs to `/api/admin/ai/generate` with type `blog`
  - Generated content inserted into form content field
  - Loading state with spinner
- Save/Publish buttons in header

#### 5. References List Page (`/src/app/(admin)/admin/cms/references/page.tsx`)
- **Header**: "Referencie" title + "Nová referencia" button
- **Filters**: Type select (rodinny_dom/bytovy_dom/priemysel), Status select, Search input
- **Grid**: `sm:grid-cols-2 lg:grid-cols-3` cards
  - Title + status badge, Location (MapPin icon) + system, Type badge (blue/purple/orange) + tags
- Type badges: rodinny_dom = blue, bytovy_dom = purple, priemysel = orange
- Skeleton loading, empty state, pagination

#### 6. Reference Editor Page (`/src/app/(admin)/admin/cms/references/[id]/page.tsx`)
- Supports `new` and real ID
- **Form fields**: Title, Type (select), Location, System, Description (textarea)
- **Settings card**: Status, Sort order, Tags (comma-separated)
- **Image card**: Cover image URL with preview
- **Delete**: AlertDialog confirmation → DELETE API → redirect to list
- Save/Publish buttons

#### 7. Documents List Page (`/src/app/(admin)/admin/cms/documents/page.tsx`)
- **Header**: "Dokumenty" title + "Nový dokument" button
- **Inline create form**: Expands within the page (Card with warm border accent)
  - Two-column grid: Title, Category (select), File type, File URL
  - Description input
  - isPublic toggle (Switch component in bordered card)
  - Cancel + Create buttons
  - Form validation with react-hook-form + zod
  - Auto-closes on successful creation
- **Filters**: Category select (technical_sheet/bim_cad/manual/certificate), Search input
- **List layout**: Vertical card list with:
  - File icon (muted background)
  - Title + category badge (blue/purple/orange/green) + file type badge (colored per extension) + file size
  - Description (truncated)
  - Public/private indicator (Eye/EyeOff icon)
  - Delete button (Trash2 icon → AlertDialog confirmation)
- Category badges: technical_sheet = blue, bim_cad = purple, manual = orange, certificate = green
- File type badges: pdf = red, dwg = blue, dxf = cyan, rvt = indigo, doc/docx = blue, xls/xlsx = green, zip = gray
- `formatFileSize()` utility function (B/KB/MB)
- Pagination

#### Design Patterns
- All pages use shadcn/ui Card, Badge, Button, Input, Select, Textarea, Dialog, AlertDialog
- Consistent status badge colors across all entity types
- Responsive grid/list layouts with mobile-first approach
- TanStack Query for all data fetching with proper `queryKey` arrays
- `useMutation` for all create/update/delete operations with `invalidateQueries` on success
- sonner `toast` for success/error notifications
- Slovak language throughout all UI labels and messages
- ESLint: zero errors
- Dev server: compiling successfully (GET / 200)

---
## Task ID: 14-f1 - ai-tools-and-settings-pages
### Work Task
Build AI Tools page and Settings page for admin panel, including supporting API routes.

### Work Summary

#### 1. Admin Users API (`/src/app/api/admin/users/route.ts`)
- **GET**: List all users — requires `settings:users` permission (ADMIN only)
  - Returns users with id, email, name, role, isActive, lastLoginAt, createdAt ordered by createdAt ascending
- **POST**: Create new user — requires `settings:users` permission
  - Zod schema validates: name (2-100 chars), email (valid email), password (6-100 chars), role (enum)
  - Checks for duplicate email — returns 409 on conflict
  - Hashes password with `hashPassword()` from `@/lib/auth`
  - Creates user in DB with isActive: true
  - Returns 201 with created user (excluding passwordHash)

#### 2. AI Statistics API (`/src/app/api/admin/ai/stats/route.ts`)
- **GET**: AI interaction statistics — requires `ai:generate` permission
  - Returns: `{ total, byType, avgDurationMs, recentInteractions }`
  - `total`: count of all AIInteraction records
  - `byType`: groupBy on type field with counts, sorted by count descending
  - `avgDurationMs`: average duration from aggregate query
  - `recentInteractions`: last 20 interactions with user name, type, input, durationMs, createdAt
  - All queries run in parallel via `Promise.all`

#### 3. AI Tools Page (`/src/app/(admin)/admin/ai/page.tsx`)
- **Three tabs** using shadcn Tabs component:
  - **Chatbot tab**: Test chat interface for public chatbot
    - Chat-style layout with scrollable message area (480px height) and input bar at bottom
    - Messages sent to `/api/chat` POST endpoint
    - User messages aligned right with brand-blue background, AI messages aligned left with muted background
    - Bot/User avatar icons in colored circles
    - Loading state with spinner and "AI píše..." text
    - Enter to send, Shift+Enter for new line
    - Error handling with toast notifications
    - Welcome message pre-populated
  - **Generátor obsahu tab**: Content generation with two-column layout
    - Left card: Type select (Blog článok / Popis produktu / SEO meta / FAQ with icons), Topic input, Tone select (Profesionálny / Technický / Marketingový), "Generovať" button
    - Right card: Editable textarea showing generated content, "Skopírovať" copy button
    - Calls `/api/admin/ai/generate` POST endpoint
    - Loading skeleton while generating
    - Invalidates ai-stats query on successful generation
  - **AI Štatistiky tab**: Dashboard-style statistics
    - 4 summary cards: Total interactions, Chatbot count, Generated count, Average duration
    - By-type breakdown with progress bars and percentage badges
    - Recent interactions feed (last 20) with type badges, duration, user name, and timestamp
    - Auto-refetch every 30 seconds

#### 4. Settings Page (`/src/app/(admin)/admin/settings/page.tsx`)
- **Section 1: Používatelia** (ADMIN role only)
  - Users table with columns: Name, Email, Role (colored badges), Status (active/inactive badge), Last Login (hidden on mobile)
  - "Nový používateľ" button opens Dialog with create form
  - Dialog form: Name, Email, Password inputs, Role select (5 roles with Slovak labels)
  - Posts to `/api/admin/users`, invalidates query on success, resets form
- **Section 2: Systémové nastavenia**
  - Chatbot system prompt (Textarea with monospace font)
  - Company email (Input type email)
  - "Uložiť nastavenia" button enabled only when changes detected
  - Uses "draft pattern" for form state: derives current values from server query data, tracks local overrides separately, avoids lint errors from setState-during-render
  - Puts to `/api/admin/settings` with key-value pairs
  - Resets draft on successful save, invalidates settings query

#### 5. Navigation Updates
- Updated `AdminSidebar.tsx`: Changed AI Nástroje href from `/admin/ai/chatbot` to `/admin/ai`
- Updated `AdminHeader.tsx`: Updated breadcrumb mapping from `/admin/ai/chatbot` (Chatbot) to `/admin/ai` (Nástroje)

#### Design Patterns
- All components use shadcn/ui: Card, Tabs, Table, Dialog, Badge, ScrollArea, Button, Input, Textarea, Select
- TanStack Query for data fetching with proper queryKey invalidation
- Brand-consistent colors: `brand` for primary actions, `warm` for accents, `border-border/40` card borders
- Slovak language throughout all UI labels
- Responsive design with hidden columns on mobile
- Lint-compliant: zero ESLint errors
- Dev server: compiling successfully (GET / 200)

---
## Task ID: 15-f1, 16-f1, 17-f1 - chatbot-seed-contact-admin
### Work Task
Build public chatbot widget, seed database, update contact form with enhanced Lead fields, add admin link to footer, and verify.

### Work Summary

#### 1. ChatbotWidget Component (`/src/components/linzmeier/ChatbotWidget.tsx`)
- Floating chat button in bottom-right corner (positioned above StickyCta at `bottom-24`)
- Opens a 380px × 500px chat panel with framer-motion animations (scale + opacity + y translation)
- **Header**: Dark brand background with Bot icon + "LINZMEIER AI Asistent" title + close button
- **Messages area**: Scrollable with auto-scroll to latest message
  - AI messages: left-aligned, `bg-muted` with `rounded-bl-sm`
  - User messages: right-aligned, `bg-warm text-white` with `rounded-br-sm`
- **Loading state**: Animated Loader2 spinner in AI message bubble
- **Welcome message**: Slovak greeting displayed when chat opens for the first time
- **Input area**: Text input + Send button, form-based submission, disabled during loading
- **Error handling**: Falls back to Slovak error message on fetch failure
- Uses existing `/api/chat` route (already built in Task 7-f1)

#### 2. Integration into page.tsx
- Added `<ChatbotWidget />` after `<StickyCta />` in main page component
- Both widgets visible: StickyCta at bottom, ChatbotWidget floating above it

#### 3. Contact Form Enhancement (`/src/app/api/contact/route.ts`)
- Added `company` field: optional string, max 200 chars, validated with Zod
- Added `priority` field: optional enum (low/normal/high/urgent), validated with Zod
- Both fields passed to Prisma Lead `create()` with defaults (company → null, priority → 'normal')
- Backward compatible: existing form submissions without these fields continue to work

#### 4. Seed API Route (`/src/app/api/seed/route.ts`)
- POST endpoint to seed database with sample data
- **Users seeded**: Admin (admin@linzmeier.sk/admin123), Sales (obchod@linzmeier.sk/sales123), Marketing (marketing@linzmeier.sk/marketing123)
- **Products seeded**: 5 products (Thermowand 100, Thermowand 150, Fasádny systém LFS-100, Priečelová doska WoodEffect, Príslušenstvo)
- **References seeded**: 3 references (Rodinný dom Bratislava, Bytový dom Košice, Priemyselná hala Žilina)
- **Leads seeded**: 3 leads with different statuses (NEW, CONTACTED, QUALIFIED) and sources (web_form, partner)
- **Settings seeded**: chatbot_system_prompt, company_name, company_email, company_phone
- Uses `hashPassword()` from `@/lib/auth` for compatible password hashing
- Idempotent: uses `upsert` for users/products/references/settings, checks email uniqueness for leads
- GET endpoint returns seed info and credentials for reference

#### 5. Admin Link in Footer (`/src/components/linzmeier/Footer.tsx`)
- Added "Administrácia" link to Spoločnosť column, pointing to `/admin/login`
- Styled subtly with `text-white/30` (vs `text-white/60` for other links) to be unobtrusive
- Hover transitions to `text-white/50` instead of warm color

#### Verification
- ESLint: zero errors
- Dev server: GET / 200, all routes compiling successfully
- Database seeded successfully via POST to /api/seed

---
## Task ID: 3-f2 - csv-export-and-dashboard-charts
### Work Task
Build CSV export API for leads, enhance dashboard stats API with chart data, and add export button to Leads page.

### Work Summary

#### PART A: CSV Export API (`/src/app/api/admin/leads/export/route.ts`)
- **GET** endpoint for exporting all leads as CSV file download
- Requires `leads:export` permission (ADMIN, MARKETING)
- Query params: `status`, `customerType`, `search` — same filters as leads list API
- Response: CSV with BOM (`\uFEFF`) for Excel UTF-8 compatibility, semicolon delimiter
- 11 Slovak column headers: Meno, Email, Telefon, Firma, Typ zakaznika, Typ projektu, Stav, Priorita, Zdroj, Sprava, Datum vytvorenia
- Content-Disposition header with date-stamped filename: `linzmeier-leady-YYYY-MM-DD.csv`
- Message field properly escaped (double quotes doubled)
- Error handling: 401/403 for auth, 500 for server errors with Slovak messages

#### PART B: Enhanced Dashboard Stats API (`/src/app/api/admin/dashboard/stats/route.ts`)
- Added `recentLeadsForChart` query: fetches leads from last 6 months with `createdAt`, `customerType`, `source`, `status`, `projectType` fields
- All chart queries run in parallel with existing stats via `Promise.all`
- New response fields:
  - `wonLeads`: count of WON leads (was already queried but not returned)
  - `leadsByMonth`: `Record<string, number>` — leads grouped by `"YYYY-MM"` for line chart (last 6 months)
  - `leadsByCustomerType`: `Record<string, number>` — leads grouped by customerType for pie chart
  - `leadsBySource`: `Record<string, number>` — leads grouped by source for bar chart
  - `topProducts`: `Record<string, number>` — leads grouped by projectType for product interest chart
  - `weeklyLeads`: `Record<string, number>` — leads grouped by date for last 7 days bar chart (missing days filled with 0)
- Updated `DashboardStats` interface in `src/types/index.ts` to include all new fields

#### PART C: Export CSV Button on Leads Page
- Added "Export CSV" button (outline variant) next to "Nový lead" button in header
- Uses `<a>` tag with `href` pointing to `/api/admin/leads/export` with current `status` and `search` query params
- `download` attribute for native browser download behavior
- Download icon from lucide-react
- Both buttons wrapped in flex container for proper horizontal alignment

#### Design Patterns
- Consistent with existing API patterns: `getAuthUser()` + `hasPermission()` for auth
- `try/catch` with Slovak error messages and `[ROUTE TAG]` prefixed console.error
- CSV uses semicolons and BOM for proper Slovak character display in Excel

- ESLint: 0 errors (2 pre-existing warnings unchanged)
- Dev server: compiling successfully

---
## Task ID: 7-f2 - dashboard-charts
### Work Task
Build enhanced Dashboard with Recharts graphs — 4 chart sections (Lead Trend line chart, Customer Type pie/donut chart, Status bar chart, Weekly Activity bar chart) between existing stat cards and bottom sections.

### Work Summary

#### 1. Type Definitions Update (`src/types/index.ts`)
- Added 4 new fields to `DashboardStats` interface:
  - `leadsByMonth: Record<string, number>` — leads per month (last 6 months)
  - `leadsByCustomerType: Record<string, number>` — leads by type (Architekt/Firma/Investor/Iné)
  - `leadsBySource: Record<string, number>` — leads by source (Web formulár/Manuálne/Partner/etc.)
  - `weeklyLeads: Record<string, number>` — leads per day (last 7 days)

#### 2. Dashboard Stats API Enhancement (`/src/app/api/admin/dashboard/stats/route.ts`)
- Added two new parallel queries to `Promise.all` batch:
  - `leadsLast6Months`: fetches leads created in last 6 months with `createdAt`, `customerType`, `source`
  - `leadsLast7Days`: fetches leads created in last 7 days with `createdAt`
- Computes `leadsByMonth` using Slovak month names (január–december) + year as keys, iterating last 6 months
- Computes `leadsByCustomerType` with Slovak type labels (Architekt, Firma, Investor, Iné) mapping from raw values
- Computes `leadsBySource` with Slovak source labels (Web formulár, Manuálne, Partner, Odporúčanie, Sociálne siete, Iné)
- Computes `weeklyLeads` with Slovak day names (Po, Ut, St, Št, Pi, So, Ne) for last 7 days
- All existing fields preserved; 9 queries run in parallel via `Promise.all`

#### 3. Dashboard Page Rewrite (`/src/app/(admin)/admin/dashboard/page.tsx`)
- **Imports**: Added Recharts components (`LineChart`, `Line`, `XAxis`, `YAxis`, `CartesianGrid`, `Tooltip`, `ResponsiveContainer`, `PieChart`, `Pie`, `Cell`, `BarChart`, `Bar`)
- **Color constants**:
  - `STATUS_COLORS_MAP`: Maps lead statuses to hex colors (NEW=blue, CONTACTED=amber, QUALIFIED=purple, PROPOSAL=indigo, NEGOTIATION=orange, WON=green, LOST=red)
  - `TYPE_COLORS`: ['#1e293b', '#d97706', '#059669', '#94a3b8'] (brand-dark, warm, eco, gray)
  - `WEEKLY_BAR_COLOR`: '#1e293b' (brand-dark)
  - `STATUS_LABELS`: Slovak status name mapping
- **Custom components**:
  - `ChartTooltip`: Styled tooltip with rounded border showing label + value with Slovak unit ("leadov")
  - `PieLabel`: Renders "Architekt (40%)" format for pie chart segments
  - `ChartSkeleton`: Skeleton placeholder for chart loading state
- **Layout structure** (4 rows):
  - **Row 1**: 4 stat cards (preserved exactly from previous version)
  - **Row 2**: `grid-cols-1 md:grid-cols-2 gap-6` — Lead Trend line chart + Customer Type donut chart
  - **Row 3**: `grid-cols-1 md:grid-cols-2 gap-6` — Status bar chart + Weekly Activity bar chart
  - **Row 4**: `lg:grid-cols-7` — Recent leads table (col-span-4) + Activity feed (col-span-3)
- **Chart details**:
  - Lead Trend: `LineChart` with warm amber (#d97706) stroke, data points with white border, custom tooltip
  - Customer Type: `PieChart` donut (innerRadius=60, outerRadius=100) with 3px padding, custom labels with percentage
  - Status: `BarChart` with colored bars per status (LOST filtered out), rounded top corners, vertical grid hidden
  - Weekly Activity: `BarChart` with brand-dark bars, day order fixed to Po→Ne, rounded top corners
- **Chart containers**: 300px height, white Card backgrounds with `border-border/40` borders
- **Empty states**: "Žiadne dáta" message centered in chart area when no data
- **Skeleton loading**: Enhanced `DashboardSkeleton` with 4 chart skeleton placeholders

- ESLint: zero errors on all modified files
- Dev server: compiling successfully (GET / 200)

---
## Task ID: 4-f2 - cms-blog-categories-tags-ai-enhance
### Work Task
Enhance Blog editor with categories/tags, add category filter to blog list page, improve AI content generation in blog and product editors.

### Work Summary

#### PART A: Blog Categories & Tags

**1. Blog API Updates** (`/src/app/api/admin/blog/route.ts`, `/src/app/api/admin/blog/[id]/route.ts`)
- Added `category` and `tags` fields to both create and update Zod schemas
- GET endpoint now supports `?category=Fasada` filter param alongside existing status/search filters
- POST and PUT endpoints persist `category` (String?) and `tags` (String? JSON) to database
- Added `BLOG_CATEGORIES` constant array: Fasada, Zateplenie, Produkty, Montaz, Energetika, Normy a certifikacie, Spolocnost

**2. Blog Editor Page** (`/src/app/(admin)/admin/cms/blog/[id]/page.tsx`)
- **Category select field**: Dropdown with all 7 predefined categories + "Bez kategorie" option, placed after slug field
- **Tags input**: Text input where user types a tag and presses Enter or comma to add
  - Tags displayed as removable Badge components with X button
  - Stored as JSON array in tags field (e.g. ["zateplenie", "novostavba"])
  - Max 20 tags, duplicate prevention, lowercase normalization
  - `parseTags()` / `serializeTags()` helper functions for JSON parsing
- Updated form schema to include `category` and `tags` fields
- Tags synced to form value via `useEffect` for proper dirty detection
- Save mutation payload now includes `category` and `tags`

**3. Blog List Page** (`/src/app/(admin)/admin/cms/blog/page.tsx`)
- Added category filter pill buttons row below search/status filters
- "Vsetky kategorie" + 7 category buttons with active state styling (`bg-brand-dark text-white`)
- Category filter state passed to queryKey and API as `?category=` param
- Blog post cards now display category Badge (outline variant) alongside status badge
- Updated `BlogPost` interface to include `category` and `tags` fields

#### PART B: Enhanced Blog AI Generation

**AI Dialog** (completely redesigned in blog editor):
- **AI vygeneruj button**: Warm amber styled (`text-amber-700 border-amber-300 hover:bg-amber-50`) with Sparkles icon
- **Dialog has 2 states**:
  1. **Configuration state**: Type select (Cely clanok / Iba perex / SEO meta), Topic textarea (pre-filled from blog title), Tone select (Profesionalny / Technicky / Marketingovy)
  2. **Result state**: Editable textarea with generated content, "Generovat znova" and "Pouzit" buttons
- **Type-specific behavior**:
  - `full`: Sends `type: 'blog'` to API, inserts into `content` field
  - `excerpt`: Sends `type: 'blog'` to API, inserts into `excerpt` field (truncated to 500 chars)
  - `seo`: Sends `type: 'seo'` to API, parses structured response for meta fields
- Result is previewable and editable before applying
- Amber-themed buttons (`bg-amber-500 hover:bg-amber-600 text-white`)

#### PART C: Product Editor AI Button

**Product Editor** (`/src/app/(admin)/admin/cms/products/[id]/page.tsx`)
- **"AI popis" button**: Ghost button with Sparkles icon next to "Podrobny popis" label
  - Styled: `text-amber-700 hover:text-amber-800 hover:bg-amber-50 h-7 px-2 text-xs`
- **Dialog** with topic (pre-filled from product name) + tone select (Profesionalny / Technicky / Marketingovy)
- Same 2-state pattern as blog AI dialog (config then result preview)
- Generates via `/api/admin/ai/generate` with `type: 'product'`
- "Pouzit" inserts into description textarea

#### Design
- Tags: Small secondary Badge components with X button (`rounded-full p-0.5 hover:bg-black/10`)
- AI buttons: Sparkles icon, warm amber color theme throughout
- AI dialogs: Clean shadcn Dialog with form fields, amber accent Generate/Apply buttons
- Consistent Slovak language labels

- ESLint: 0 new errors (2 expected warnings for react-hook-form watch() incompatible-library, 1 pre-existing parsing error in leads page)
- Dev server: compiling successfully

---
## Task ID: 2-f2 - pipeline-kanban
### Work Task
Build Pipeline Kanban board for LINZMEIER.SK CRM with API endpoint and drag-and-drop Kanban page.

### Work Summary

#### 1. Pipeline API (`/src/app/api/admin/pipeline/route.ts`)
- GET endpoint returning all leads grouped by 7 status columns (NEW, CONTACTED, QUALIFIED, PROPOSAL, NEGOTIATION, WON, LOST)
- Requires `pipeline:view` permission (ADMIN, SALES roles)
- Fetches leads ordered by `updatedAt` desc with `assignedTo` user relation included
- Returns `{ columns: Record<status, Lead[]> }` format
- Auth/RBAC guard with Slovak error messages (401/403/500)

#### 2. Pipeline Kanban Page (`/src/app/(admin)/admin/crm/pipeline/page.tsx`)
- 7 horizontal scrollable columns (280px min-width each): NOVY, KONTAKTOVANY, KVALIFIKOVANY, PONUKA, ROKOVANIE, ZISKANY, STRATENY
- Per-column accent colors on top border and dot indicator (blue/amber/purple/indigo/orange/green/red)
- @dnd-kit/core drag-and-drop: PointerSensor (8px activation), useDraggable on cards, useDroppable on columns, closestCorners collision detection
- Lead cards: border-l-4 priority color, GripVertical drag handle, name+company, customer type+project type badges, assigned user avatar with initials, relative Slovak time
- Optimistic UI updates via `queryClient.setQueryData`, validates against `LEAD_STATUS_FLOW`, reverts on API failure with error toast
- Click card name to navigate to `/admin/crm/leads/[id]` (disabled during drag)
- Drag overlay: rotated card with shadow-xl showing lead summary
- Column highlight on drag-over (scale, border, background tint)
- Loading skeleton matching real layout, empty column states with dashed circle
- TanStack Query with 30s auto-refetch, responsive horizontal scroll with custom-scrollbar
- ESLint: zero errors, Dev server: `/admin/crm/pipeline` 200, `/api/admin/pipeline` 401 (expected)
