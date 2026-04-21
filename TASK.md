# TASKS.md – Table Egg Management System Updates

## 1. Dashboard (Admin & Staff)
- Change label:
  - "Pieces Ready" → "Trays"

- Remove:
  - Hatchery Records (Admin & Staff dashboard)

---

## 2. Flock Management (Admin & Staff)

### Add New Flock
- If Breed = "Other":
  - Show input field: "Enter Breed"

### Table Updates
- Add column: Mortality (next to Status)

### Logic
- If mortality is entered:
  - Automatically reduce number_of_hens

### Editing
- Make editable:
  - Mortality
  - Number of Hens

### Fix
- Actions button (Edit/Delete) must work

---

## 3. Daily Production (Admin & Staff)

### Egg Size Categories
- Jumbo
- Extra-Large
- Large
- Medium
- Small
- Peewee

### Conversion
- 1 tray = 30 eggs

### Output Changes
- Replace results with:
  - Total Eggs
  - Total Trays

### Add Section
- ODD Stock (Bunkig)
  - Example:
    - 1 tray = 35 eggs → 5 bunkig
  - Place ABOVE "Cracked"
  - Count is per egg

---

## 4. Egg Inventory (Admin & Staff)

### Stock Display
- Change:
  - Total Sellable Stock → display in TRAYS (not pieces)

### Add Breakdown
- Show per size:
  - P, S, M, L, ExL, J
  - Example:
    P: 10, S: 20, M: 30, L: 20, ExL: 30, J: 30

---

## 5. Egg Inventory Table

- Add column:
  - Staff Incharge (after Date)

- Logic:
  - Auto-fill based on staff who made the sale

---

## 6. Staff Dashboard

- Remove:
  - Hatchery Records

- Add:
  - Sales Privileges

- Behavior:
  - When staff performs sale:
    - Save their name in Egg Inventory → Staff Incharge

---

## 7. Sales Transaction (Admin & Staff)

### Table Updates
- Add column:
  - Balance (between Total and Payment Status)

### Logic
- Payment Status based on balance:
  - 0 → PAID (green)
  - full unpaid → UNPAID (red)
  - partial → PARTIAL (orange)

### Fix
- Actions button must allow:
  - Edit
  - Update payment status

---

## 8. Pricing Area (Admin Only)

### Location
- Finance category (left panel)

### Features
- Admin can:
  - Set price per tray
  - Set price per egg size

### Example
- Large tray price: ₱255–₱270

### Logic
- Set default price
- Used automatically in sales

---

## 9. Point of Sale (Admin & Staff)

### Auto Pricing
- If user selects:
  - Egg size (e.g., Large)
  - Number of trays

→ Automatically compute total

### Example
- 10 trays × ₱255 = ₱2550

### Discount Support
- Allow manual edit:
  - Example:
    - 10% discount → ₱2259

### Dynamic Updates
- Price updates automatically when:
  - Tray count changes
  - Egg size changes

---

## FINAL CHECKLIST
- [ ] All labels updated to trays
- [ ] Mortality logic working
- [ ] Actions buttons fixed
- [ ] Egg conversion working (30 eggs/tray)
- [ ] ODD stock (bunkig) added
- [ ] Inventory shows trays + size breakdown
- [ ] Staff Incharge column working
- [ ] Sales balance logic working
- [ ] Pricing system implemented
- [ ] POS auto-calculation working