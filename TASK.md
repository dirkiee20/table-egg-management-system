# TASKS

## 1. Design System Upgrade
Refine the entire application UI to make it visually attractive, polished, and professional.

### Required implementation
- Upgrade the system into a cohesive, modern admin dashboard experience.
- Standardize:
  - spacing
  - typography
  - button styles
  - form styles
  - table styles
  - cards
  - modals
  - badges
  - alerts
  - dropdowns
  - navigation
- Introduce or refine reusable design tokens and shared UI styles.
- Improve consistency across all existing pages and modules.

## 2. Light Mode and Dark Mode
Make the entire system fully usable in both **light mode** and **dark mode**.

### Required implementation
- Add or refine global theming support for:
  - backgrounds
  - cards
  - text
  - borders
  - tables
  - modals
  - forms
  - dropdowns
  - charts
  - sidebars
  - top navigation
  - status colors
- Add a theme toggle if one does not already exist.
- Persist user theme preference if supported by the stack.
- Ensure no page has broken colors, unreadable text, or poor contrast in either mode.
- Ensure chart colors, axis labels, legends, and tooltips are readable in both themes.

## 3. Professional Visual Styling
Make the system feel like a professional farm operations platform.

### Required implementation
- Improve visual hierarchy on dashboards and data-heavy screens.
- Use better card layouts and section grouping.
- Improve page headers, filter bars, stats cards, and summaries.
- Refine tables for better readability:
  - row hover states
  - improved spacing
  - better header styling
  - clean borders
  - zebra or subtle separation if appropriate
- Refine forms for better usability:
  - grouped inputs
  - consistent labels
  - validation message styling
  - clearer submit actions
- Improve empty states, loading states, and no-data states.
- Improve success, warning, and error feedback presentation.

## 4. Animation and Micro-Interactions
Add subtle, professional animations and effects throughout the system.

### Rules
- Effects must be smooth, modern, and not distracting.
- Do not use flashy, exaggerated, or game-like animation.
- Motion must feel premium and functional.

### Required implementation
- Add subtle hover and press effects for buttons.
- Add hover emphasis for cards and table rows.
- Add smooth transitions for color, shadow, opacity, and transform where appropriate.
- Add refined modal open/close animation.
- Add dropdown or popover transition.
- Add page or section entrance transitions where appropriate.
- Add polished toast/notification animation if the system supports notifications.
- Add sidebar collapse/expand transition if there is a sidebar.
- Respect reduced-motion preferences if supported by the stack.

## 5. Dashboard Visual Enhancement
Improve the dashboard presentation for both themes.

### Required implementation
- Redesign summary/stat cards to be more attractive and readable.
- Improve chart containers, labels, spacing, and hierarchy.
- Add subtle visual emphasis to key metrics without clutter.
- Ensure charts and widgets look polished in dark mode and light mode.
- Improve responsiveness for tablet and mobile layouts.

## 6. Calendar UI Enhancement
Refine the calendar page visually.

### Required implementation
- Improve event cards, modals, input layout, and action buttons.
- Ensure edit-event UI matches the upgraded design language.
- Make calendar states readable in both dark and light themes.
- Add subtle transitions for event editing interactions where appropriate.

## 7. Data Modules Visual Enhancement
Apply a professional UI refresh to these modules:
- Daily Production
- Egg Production Records
- Egg Inventory
- Sales
- Sales and Expense Monitoring
- Staff Management
- Expense Management
- Feed Management
- Reports

### Required implementation
- Improve page layouts and card structures.
- Refine filters, tables, charts, forms, and summary sections.
- Ensure visual consistency across all modules.
- Ensure responsive behavior across desktop and mobile.
- Ensure all interactive elements have hover, focus, and disabled states.

## 8. Sales and Expense Monitoring Chart Polish
Refine the chart presentation for the monitoring module.

### Required implementation
- Keep the line chart implementation.
- Improve line chart styling, legend, tooltip, axis readability, and container design.
- Ensure chart presentation is attractive and readable in both themes.
- Add smooth chart-related transitions if supported by the charting stack.

## 9. Feed Management UI and Forecasting Presentation
Improve the Feed Management page and forecasting result presentation.

### Required implementation
- Design the page to look premium and easy to understand.
- Add clean sections for:
  - feed summary
  - forecasting results
  - objectives
  - related metrics
- Present forecast output in a visually strong way using cards, trend sections, tables, or charts as appropriate.
- Ensure forecasting UI is theme-aware and consistent with the rest of the system.

## 10. Accessibility and Usability
Ensure the visual redesign remains usable and accessible.

### Required implementation
- Maintain readable contrast in both light and dark mode.
- Ensure keyboard focus states are visible.
- Ensure interactive elements have clear state changes.
- Avoid animation that hides essential information.
- Maintain legibility for tables, charts, labels, and forms.

## 11. Cross-Cutting Execution Requirements
Apply these checks to all updated modules.

### Frontend
- Update components, pages, layouts, styles, and shared UI building blocks.
- Centralize repeated style logic where possible.
- Remove inconsistent legacy styling where necessary.

### Theming
- Ensure all pages and components inherit theme behavior correctly.
- Fix any hardcoded colors that break dark mode or light mode.

### Motion
- Ensure motion is subtle, consistent, and performant.
- Avoid layout shifts caused by effects.

### Responsiveness
- Ensure pages work cleanly across desktop, tablet, and mobile widths.

### Output Rule
Implement these tasks directly in code.

Do not output plans.
Do not output proposals.
Do not output generic design commentary.
Do not stop at mock styling.
Complete actual implementation only.
