# AGENTS.md – Table Egg Management System

## Overview
This document defines how the AI developer (Cursor AI) should implement requested updates in the system.  
Focus ONLY on modifying existing features. Do NOT refactor unrelated code.

## General Rules
1. Do NOT break existing working features.
2. Follow current project structure (frontend + backend).
3. Use consistent naming conventions already in the project.
4. Ensure UI is clean, responsive, and minimal.
5. All computations must be automatic (no manual calculations required by user).
6. All editable fields must persist in the database.
7. Fix broken buttons (especially Actions buttons).

---

## System Logic Standards

### Egg Conversion
- 1 tray = 30 eggs
- Always compute:
  - Total Eggs = trays * 30
  - Total Trays = eggs / 30

### Egg Sizes
- Jumbo: ≥70g
- Extra-Large: 65–69g
- Large: 60–64g
- Medium: 55–59g
- Small: 45–54g
- Peewee: <45g

---

## Dynamic Behavior Rules

### Mortality Logic
- Mortality reduces number of hens automatically:
  new_hens = current_hens - mortality
- Both fields must remain editable

### Pricing Logic
- Prices are set by admin
- Auto-compute:
  total = trays × price_per_tray
- Allow override for discounts

### Payment Status Logic
- If balance = 0 → PAID (green)
- If balance = total → UNPAID (red)
- If 0 < balance < total → PARTIAL (orange)

---

## Role Permissions

### Admin
- Full access
- Manage pricing
- View staff activity

### Staff
- Can perform sales
- Cannot manage pricing
- Their name must be recorded in transactions

---

## UI Rules
- Replace all “pieces” with “trays” where applicable
- Ensure tables are clean and editable inline where needed
- Ensure all buttons (Edit/Delete/Save) are functional
- Maintain consistent layout across admin & staff views

---

## Important Notes
- Do NOT create unnecessary new modules
- Extend existing components whenever possible
- Validate all user inputs