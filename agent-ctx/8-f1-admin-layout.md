# Task ID: 8-f1 - admin-layout

## Files Created
- `/src/components/admin/AdminGuard.tsx` - Auth guard component
- `/src/components/admin/AdminSidebar.tsx` - Professional admin sidebar with RBAC
- `/src/components/admin/AdminHeader.tsx` - Sticky header with breadcrumbs & user dropdown
- `/src/app/(admin)/admin/layout.tsx` - Admin layout wrapper
- `/src/app/(admin)/admin/dashboard/page.tsx` - Dashboard placeholder page

## Architecture
- All admin pages under `(admin)/admin/*` are wrapped by `AdminGuard` which checks NextAuth session
- `AdminSidebar` is a fixed 260px dark sidebar on desktop, Sheet overlay on mobile
- Navigation items are filtered by RBAC using `getVisibleMenuItems(role)` from `@/lib/rbac`
- `AdminHeader` provides breadcrumbs, notification bell placeholder, and user dropdown with sign-out
- Layout offsets content with `md:pl-[260px]` for the fixed sidebar

## Design
- Sidebar: `bg-brand-dark` with `text-white`, warm amber accent badges and active indicators
- Header: White with border-bottom, sticky top
- Content: `bg-muted/30` background
- All text in Slovak language
