---
## Task ID: 3-f3 - automation-engine
### Work Task
Build Automation Engine: auto-assign leads + status notifications + settings UI for LINZMEIER.SK admin system.

### Work Summary

#### 1. Automation Library (`/src/lib/automations.ts`)
- Created `runAutomations(eventType, context)` async function that fetches active automations, evaluates conditions, and executes action types (assign round-robin, email log, notify log)
- Created `autoAssignLead(leadId)` that assigns lead to SALES user with fewest active leads
- All activity entries logged with `userId: system`

#### 2. Automation API Routes
- GET/POST `/api/admin/automations/route.ts`: List and create automations with Zod validation, duplicate name check, RBAC guards
- PUT/DELETE `/api/admin/automations/[id]/route.ts`: Update and delete automations
- POST `/api/admin/automations/seed/route.ts`: Seed 2 default automations (auto-assign on lead_created, notify on NEW->CONTACTED)

#### 3. Automations Settings Page (`/src/app/(admin)/admin/settings/automations/page.tsx`)
- Client component with TanStack Query, automation cards with toggle/edit/delete, create/edit dialog with dynamic conditions and actions, seed button, empty state, skeleton loading

#### 4. Integration into Lead Routes
- Lead creation: calls `runAutomations(lead_created)` after creation (non-blocking)
- Lead update: calls `runAutomations(status_change)` on status change (non-blocking)

- ESLint: zero errors, Dev server: compiling successfully

