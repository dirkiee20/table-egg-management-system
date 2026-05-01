# AGENTS.md

## Role
You are the developer agent for the Table Egg Management System.

Your main task is to improve the existing system UI so it becomes:

- Fully responsive on mobile phones
- Professional and modern-looking
- Smooth in transitions and interactions
- Ready for future APK conversion using Capacitor
- Usable on desktop, tablet, and mobile

## Main Goal
Make the current web system feel like a mobile-friendly app while keeping it working well on desktop.

Do not remove existing features unless required. Improve the layout, spacing, responsiveness, and user experience.

## Design Direction
Use a clean, professional dashboard style.

The system should have:

- Modern cards
- Proper spacing
- Responsive tables
- Mobile-friendly forms
- Smooth page transitions
- Clear buttons and actions
- Professional colors
- Consistent typography
- App-like mobile experience

## Mobile Responsiveness Rules

### Layout
- On desktop, keep sidebar/dashboard layout if already existing.
- On mobile, avoid horizontal overflow.
- Sidebar should collapse or become mobile-friendly.
- Content should use full width on small screens.
- Cards should stack vertically on mobile.
- Tables should become scrollable or card-style on mobile.

### Forms
- Forms must fit small screens.
- Inputs should be full-width on mobile.
- Buttons should be easy to tap.
- Avoid tiny text and cramped spacing.

### Tables
- Tables must not break the mobile layout.
- Use horizontal scroll only if needed.
- Prefer card-style layout on very small screens if possible.
- Action buttons should wrap properly.

### Navigation
- Navigation should be easy to access on mobile.
- Add smooth open/close transition if using mobile sidebar/drawer.
- Make active menu items clear.

## Capacitor APK Readiness

Prepare the frontend so it can later be converted into APK using Capacitor.

Follow these rules:

- Avoid fixed desktop-only widths.
- Avoid layout that depends only on hover.
- Make all buttons touch-friendly.
- Use relative units and responsive classes.
- Make the app usable in portrait phone view.
- Avoid unnecessary browser-specific behavior.
- Keep routes clean and compatible with single-page app behavior.
- Make sure there are no horizontal scroll issues on mobile.

Do not install Capacitor yet unless specifically asked.

## UI/UX Improvements

Improve the interface by applying:

- Smooth transitions on buttons, cards, sidebar, modals, and page changes
- Hover effects for desktop
- Active states for navigation
- Better spacing between sections
- Professional form layout
- Better table readability
- Rounded cards and subtle shadows
- Consistent button colors
- Proper empty states
- Proper loading states if applicable

## Technical Rules

Before editing:
1. Inspect the current project structure.
2. Identify the frontend framework being used.
3. Check existing CSS/Tailwind/Bootstrap setup.
4. Reuse existing components when possible.
5. Avoid unnecessary refactoring.

When editing:
1. Keep existing functionality working.
2. Do not break backend API calls.
3. Do not remove existing routes.
4. Do not rename files unless necessary.
5. Make changes gradually and test after each major update.

## Expected Result

After completing the task:

- The system looks professional on desktop.
- The system works properly on mobile phones.
- Dashboard, forms, tables, and navigation are responsive.
- The design feels smooth and modern.
- The system is ready for future Capacitor APK conversion. 