# Layer Egg Management System - Database Design

As per the revised scope, here is the complete database design for the **Layer Egg Management System**. This schema focuses on egg production, grading, egg inventory tracking, and sales, removing all broiler/meat production workflows.

## 1. Core Entities

1. **Users** - Farm staff and administrators.
2. **Flocks (Batches)** - Tracks laying hen groups from placement to depletion/culling.
3. **Egg Grades** - Classifications of eggs (e.g., Large, Medium, Small, Jumbo, Cracked, Reject).
4. **Daily Flock Records** - Captures daily feed consumption, water, and mortality per flock.
5. **Daily Egg Production** - Logs the quantity of eggs collected and graded per flock daily.
6. **Egg Inventory Ledger** - Tracks incoming eggs (from production) and outgoing eggs (from sales/shrinkage).
7. **Feed Types & Ledger** - Catalog of layer feeds (e.g., Pullet Grower, Layer Mash) and stock tracking.
8. **General Inventory & Ledger** - Supplies (packaging trays, vaccines, medicines).
9. **Customers** - Buyers of eggs (wholesalers, retailers, individuals).
10. **Sales & Sale Items** - Egg sales transactions and line items indicating grades sold.
11. **Expenses** - Farm-level and flock-level costs.
12. **AI Forecast Results** - Predicts future feed requirements based on current laying stage/age and historical data.

---

## 2. Table Structures & Fields

### 2.1 `users`
| Field | Type | Attributes | Description |
|-------|------|------------|-------------|
| `id` | INT | PK | Unique user ID |
| `name` | VARCHAR(100) | NOT NULL | User's full name |
| `email` | VARCHAR(150) | UNIQUE | Login email |
| `password_hash` | VARCHAR(255) | NOT NULL | Hashed password |
| `role` | ENUM | 'admin', 'staff' | Access level |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Record creation date |

### 2.2 `flocks` (Replaces `batches`)
| Field | Type | Attributes | Description |
|-------|------|------------|-------------|
| `id` | INT | PK | Unique flock ID |
| `flock_number` | VARCHAR(50) | UNIQUE | Human-readable identifier |
| `breed` | VARCHAR(100) | | e.g., Lohmann Brown, ISA Brown |
| `initial_count` | INT | NOT NULL | Number of birds placed |
| `current_count` | INT | NOT NULL | Tracks alive birds dynamically |
| `placement_date` | DATE | NOT NULL | Date birds arrived |
| `age_at_placement_wks`| INT | DEFAULT 16 | Age in weeks when placed in laying house |
| `expected_cull_date`| DATE | | Estimated date to sell as spent hens |
| `status` | ENUM | 'active', 'depleted' | Current state |
| `placement_cost` | DECIMAL(10,2)| | Cost of pullets/chicks |
| `created_by` | INT | FK -> users.id | |

### 2.3 `egg_grades`
| Field | Type | Attributes | Description |
|-------|------|------------|-------------|
| `id` | INT | PK | Unique grade ID |
| `name` | VARCHAR(50) | NOT NULL | 'Large', 'Medium', 'Small', 'Reject', 'Cracked' |
| `is_sellable` | BOOLEAN | DEFAULT TRUE| False for 'Reject' |
| `weight_range_g`| VARCHAR(50) | | e.g., "55g - 65g" |

### 2.4 `daily_flock_records`
| Field | Type | Attributes | Description |
|-------|------|------------|-------------|
| `id` | INT | PK | Unique record ID |
| `flock_id` | INT | FK -> flocks.id | Associated flock |
| `record_date` | DATE | NOT NULL | Date of the record |
| `feed_consumed_kg`| DECIMAL(8,2) | NOT NULL | Feed used today |
| `feed_type_id` | INT | FK -> feed_types.id| e.g., Layer Phase 1 |
| `water_consumed_l`| DECIMAL(8,2) | | Water intake |
| `mortality_count` | INT | DEFAULT 0 | Dead birds found today |
| `cull_count` | INT | DEFAULT 0 | Birds removed proactively |
| `temperature_c` | DECIMAL(5,2) | | Env temperature |
| `recorded_by` | INT | FK -> users.id | |
*(Unique Index on `flock_id` + `record_date`)*

### 2.5 `daily_egg_production`
Logs multiple rows per day per flock based on how eggs were graded.
| Field | Type | Attributes | Description |
|-------|------|------------|-------------|
| `id` | INT | PK | Unique ID |
| `flock_id` | INT | FK -> flocks.id | Associated flock |
| `record_date` | DATE | NOT NULL | Collection Date |
| `grade_id` | INT | FK -> egg_grades.id| Grade collected |
| `quantity_pieces` | INT | NOT NULL | Amount of eggs (in pieces) |
| `recorded_by` | INT | FK -> users.id | |
*(Unique Index on `flock_id` + `record_date` + `grade_id`)*

### 2.6 `egg_inventory_ledger`
Tracks exact stock of eggs ready for sale.
| Field | Type | Attributes | Description |
|-------|------|------------|-------------|
| `id` | INT | PK | Ledger ID |
| `grade_id` | INT | FK -> egg_grades.id| Which eggs are moving |
| `transaction_type`| ENUM | | 'in' (production), 'out' (sale/loss) |
| `quantity_pieces` | INT | NOT NULL | Number of eggs |
| `date` | DATE | NOT NULL | Transaction date |
| `reference_type` | VARCHAR(50) | | e.g., 'production', 'sale', 'adjustment' |
| `reference_id` | INT | | ID of the source record |

### 2.7 `feed_types` & `feed_stock_ledger`
| Field | Type | Attributes | Description |
|-------|------|------------|-------------|
| `id` | INT | PK | Feed ID |
| `name` | VARCHAR(100) | NOT NULL | e.g. "Layer Mash 18%" |

| Field | Type | Attributes | Description |
|-------|------|------------|-------------|
| `id` | INT | PK | Ledger ID |
| `feed_type_id` | INT | FK -> feed_types.id| |
| `transaction_type`| ENUM | | 'in' (purchase), 'out' (fed) |
| `quantity_kg` | DECIMAL(10,2)| NOT NULL | Amount |
| `cost_total` | DECIMAL(10,2)| | Cost (if purchase) |
| `date` | DATE | NOT NULL | Date |

### 2.8 `sales` & `sale_items`
Egg sales are tracked with line items to support mixed orders (e.g., 5 trays of Large, 2 trays of Medium).
| Field | Type | Attributes | Description |
|-------|------|------------|-------------|
| `id` | INT | PK | Sale ID |
| `customer_name` | VARCHAR(100) | | Buyer's name |
| `sale_date` | DATE | NOT NULL | Date of transaction |
| `total_revenue` | DECIMAL(12,2)| NOT NULL | Gross revenue |
| `payment_status` | ENUM | | 'paid', 'unpaid' |

**sale_items:**
| Field | Type | Attributes | Description |
|-------|------|------------|-------------|
| `id` | INT | PK | Line item ID |
| `sale_id` | INT | FK -> sales.id | Parent sale |
| `grade_id` | INT | FK -> egg_grades.id| Grade of eggs sold |
| `quantity_pieces` | INT | NOT NULL | e.g. 150 (5 trays * 30) |
| `price_per_piece` | DECIMAL(8,2) | NOT NULL | Unit price |

### 2.9 `expenses`
| Field | Type | Attributes | Description |
|-------|------|------------|-------------|
| `id` | INT | PK | Expense ID |
| `category` | ENUM | | 'labor', 'utilities', 'packaging', 'medical' |
| `amount` | DECIMAL(10,2)| NOT NULL | Cost |
| `date` | DATE | NOT NULL | Date occurred |

### 2.10 `ai_forecast_results`
| Field | Type | Attributes | Description |
|-------|------|------------|-------------|
| `id` | INT | PK | Forecast ID |
| `flock_id` | INT | FK -> flocks.id | Target flock |
| `target_date` | DATE | NOT NULL | Predicted future date |
| `predicted_feed_kg`| DECIMAL(8,2) | NOT NULL | AI recommended feed |
| `actual_feed_kg` | DECIMAL(8,2) | NULL | To track AI accuracy |
| `laying_rate_pct` | DECIMAL(5,2) | | Snapshot of current hen-day production % |
| `created_at` | TIMESTAMP | DEFAULT NOW()| |

---

## 3. Relationships & Business Logic

* **Laying Rate (Hen-Day Production %):** Dynamically calculated as: `(Total sellable eggs collected today / current_count) * 100`.
* **Automated Egg Inventory:** When `daily_egg_production` records are saved, the system automatically inserts `'in'` records to `egg_inventory_ledger`.
* **Automated Deductions:** 
  1. Entering mortality drops `flocks.current_count`.
  2. Submitting daily feed usage creates an `'out'` entry in `feed_stock_ledger`.
  3. Recording `sale_items` creates `'out'` entries in the `egg_inventory_ledger`.

---

Waiting on your confirmation of this revised schema or if I should immediately update `backend_api_plan.md` next!
