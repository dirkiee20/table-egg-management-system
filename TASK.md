# TASKS.md

## Main Task
Make the Table Egg Management System fully responsive for mobile view and improve the design so it looks professional, smooth, and ready for future APK conversion using Capacitor.

## Task 1: Inspect the Current Frontend

Check the current frontend structure.

Identify:

- Framework used
- Styling method used
- Main layout files
- Sidebar or navigation component
- Dashboard page
- Table pages
- Form pages
- Modal components if any

Do not start major changes until the structure is understood.

## Task 2: Fix Global Mobile Responsiveness

Update the global layout so the system works well on phone screens.

Requirements:

- No horizontal overflow on mobile
- Body should fit screen width
- Main content should resize properly
- Pages should have proper padding on mobile
- Text should remain readable
- Buttons should be tap-friendly
- Inputs should not overflow

Add or update global CSS if needed.

## Task 3: Improve Main Layout

Make the main layout responsive.

Desktop:

- Keep sidebar layout if already existing
- Main content should have clean spacing
- Dashboard should look professional

Mobile:

- Sidebar should collapse, hide, or become a drawer
- Add a mobile menu button if needed
- Content should use full width
- Navigation should be easy to use
- Sidebar transition should be smooth

Acceptance:

- Mobile users can navigate the whole system easily.
- No page is hidden or broken on small screens.

## Task 4: Improve Dashboard Design

Make the dashboard responsive and professional.

Requirements:

- Dashboard cards should stack properly on mobile
- Cards should have consistent spacing
- Cards should have clean shadows and rounded corners
- Important numbers should be readable
- Dashboard should not look cramped
- Use smooth hover and transition effects

Acceptance:

- Dashboard looks good on desktop and mobile.
- Cards resize correctly on small screens.

## Task 5: Improve Tables for Mobile

Update all table pages to work properly on mobile.

Pages may include:

- Flock Management
- Daily Production
- Inventory
- Sales
- Expenses
- Reports
- Users
- Any other existing table page

Requirements:

- Tables must not break the screen
- Add horizontal scroll wrapper if needed
- Table text should remain readable
- Action buttons should wrap or stack properly
- On very small screens, use card-style layout if possible
- Keep all existing actions working

Acceptance:

- Tables are usable on phone screens.
- Edit, delete, view, and action buttons are still easy to tap.

## Task 6: Improve Forms and Inputs

Make all forms mobile-friendly.

Requirements:

- Inputs should be full-width on mobile
- Labels should be clear
- Spacing should be consistent
- Submit buttons should be easy to tap
- Form sections should stack vertically on mobile
- Validation messages should display properly
- Modals should fit on mobile screens

Acceptance:

- Users can add and edit records on mobile without layout issues.

## Task 7: Add Smooth Transitions

Add smooth transitions to improve user experience.

Apply transitions to:

- Sidebar open/close
- Buttons
- Cards
- Modals
- Page sections
- Dropdowns
- Form focus states

Use subtle transitions only. Avoid excessive animations.

Recommended transition:

- 150ms to 300ms
- ease-in-out
- opacity, transform, background, shadow

Acceptance:

- UI feels smooth and professional.
- Animations do not feel distracting.

## Task 8: Improve Professional Design

Improve the visual style of the system.

Requirements:

- Consistent colors
- Consistent spacing
- Consistent button styles
- Clean card design
- Professional typography
- Better page headers
- Better section spacing
- Better empty states if applicable
- Better loading states if applicable

Acceptance:

- The system should look like a real production-ready business app.

## Task 9: Prepare for Future Capacitor APK Conversion

Make frontend decisions that will help later when converting to APK.

Requirements:

- Use responsive app-like layout
- Avoid desktop-only interactions
- Avoid fixed large widths
- Avoid hover-only actions
- Make buttons touch-friendly
- Make navigation mobile-friendly
- Keep SPA routing clean
- Avoid unnecessary browser-dependent features

Do not install or configure Capacitor yet unless requested.

Acceptance:

- The app can later be converted to APK with fewer UI problems.

## Task 10: Test Responsiveness

Test the system in browser responsive mode.

Test screen sizes:

- 360px width
- 390px width
- 414px width
- 768px width
- Desktop width

Check:

- Dashboard
- Sidebar/navigation
- All table pages
- All forms
- All modals
- Buttons
- Login page if existing
- Reports page if existing

Acceptance:

- No horizontal overflow
- No broken buttons
- No unreadable text
- No unusable forms
- No broken navigation

## Final Output Required

After completing the edits, report:

1. Files changed
2. What was improved
3. Mobile responsiveness changes made
4. Design improvements made
5. Any remaining issues or suggestions

## Important Reminder

Do not break existing features.

Focus only on:

- Mobile responsiveness
- Professional design
- Smooth transitions
- Future Capacitor APK readiness