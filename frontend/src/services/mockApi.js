/**
 * mockApi.js
 * 
 * Comprehensive Mock Service Layer establishing CRUD operations,
 * delay simulation, and relational ties for the Layer Egg Management System.
 */

// ==========================================
// 1. SHARED UTILITIES & HELPERS
// ==========================================

const delay = (ms = 400) => new Promise(resolve => setTimeout(resolve, ms));
const generateId = (prefix) => `${prefix}-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;
const timestamp = () => new Date().toISOString();

/**
 * Universal Mock Database Table Class
 * Reduces CRUD repetition across modules and enforces standard object shapes.
 */
class MockDbTable {
  constructor(initialData = [], prefix = 'REC') {
    this.table = initialData.map(record => ({
      ...record,
      createdAt: record.createdAt || timestamp(),
      updatedAt: record.updatedAt || timestamp(),
    }));
    this.prefix = prefix;
  }

  async getAll() {
    await delay();
    return [...this.table].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  async getById(id) {
    await delay();
    const record = this.table.find(r => r.id === id);
    if (!record) throw new Error(`[404] Record ${id} not found.`);
    return { ...record };
  }

  async create(data) {
    await delay();
    const newRecord = {
      id: generateId(this.prefix),
      ...data,
      createdAt: timestamp(),
      updatedAt: timestamp(),
    };
    this.table.push(newRecord);
    return { ...newRecord };
  }

  async update(id, data) {
    await delay();
    const idx = this.table.findIndex(r => r.id === id);
    if (idx === -1) throw new Error(`[404] Update failed. Record ${id} not found.`);
    
    this.table[idx] = { 
      ...this.table[idx], 
      ...data, 
      updatedAt: timestamp() 
    };
    return { ...this.table[idx] };
  }

  async delete(id) {
    await delay();
    const idx = this.table.findIndex(r => r.id === id);
    if (idx !== -1) {
      this.table.splice(idx, 1);
    }
    return { success: true, deletedId: id };
  }
}

// ==========================================
// 2. INITIAL MOCK DATA (WITH RELATIONSHIPS)
// ==========================================

const initStaff = [
  { id: 'STF-001', name: 'System Admin', role: 'Admin', contactNumber: '+1 555-0100', email: 'admin@farm.local', address: 'HQ', status: 'Active', hireDate: '2023-01-15' },
  { id: 'STF-002', name: 'John Doe', role: 'Staff', contactNumber: '+1 555-0101', email: 'john@farm.local', address: 'Field 1', status: 'Active', hireDate: '2025-06-01' }
];

const initCalendar = [
  { id: 'EVT-001', title: 'ND+IB Vaccine Booster', description: 'Water administration for House B', date: '2026-04-03', time: '08:00', location: 'House B', type: 'vaccination', relatedStaffId: 'STF-002' },
  { id: 'EVT-002', title: 'Incubator Alpha Checkout', description: 'Day 18 transfer prep', date: '2026-04-03', time: '10:00', location: 'Hatchery', type: 'hatchery', relatedStaffId: 'STF-001' }
];

const initVaccinations = [
  { id: 'VAC-001', batchId: 'F-02', vaccineName: 'Newcastle Disease (ND)', dateAdministered: '2025-10-15', nextDueDate: '2026-04-15', administeredBy: 'STF-002', notes: 'Given via drinking water' }
];

const initHatchery = [
  { id: 'HAT-001', batchCode: 'HB-Alpha', eggCount: 5000, fertileEggCount: 4850, hatchedCount: null, failedCount: null, hatchDate: '2026-04-05', notes: 'Currently incubating' }
];

const initSales = [
  { id: 'INV-802', customer: 'Local Supermarket', quantity: 25, unit: 'Trays', total: 112.50, status: 'Paid', date: '2026-04-01' }
];

const initIncome = [
  { id: 'INC-001', source: 'Egg Sales', referenceType: 'SALE', referenceId: 'INV-802', amount: 112.50, date: '2026-04-01', category: 'Sales', notes: 'Automated sale entry' },
  { id: 'INC-002', source: 'Manure Pickup', referenceType: 'OTHER', referenceId: null, amount: 200.00, date: '2026-04-01', category: 'Byproduct', notes: 'Monthly organic fertilizer sale' }
];

const initExpenses = [
  { id: 'EXP-001', title: 'Layer Mash 18%', category: 'Feed Purchases', amount: 3200.00, date: '2026-04-01', vendor: 'AgriCorp', notes: '100 bags', approvedBy: 'STF-001' }
];

// Single Instance Egg Inventory Config (Not using standard generic table due to unique state)
let eggInventoryState = { totalSellable: 245, grades: { jumbo: 15, large: 120, medium: 85, small: 25 }, rejects: 12 };

// Initialize Tables
const db = {
  staff: new MockDbTable(initStaff, 'STF'),
  calendar: new MockDbTable(initCalendar, 'EVT'),
  vaccination: new MockDbTable(initVaccinations, 'VAC'),
  hatchery: new MockDbTable(initHatchery, 'HAT'),
  sales: new MockDbTable(initSales, 'INV'),
  income: new MockDbTable(initIncome, 'INC'),
  expense: new MockDbTable(initExpenses, 'EXP'),
  flocks: new MockDbTable([], 'FLK'), 
};

// ==========================================
// 3. EXPORTED API SURFACE
// ==========================================

export const api = {
  // --- Auth Service ---
  auth: {
    login: async (credentials) => {
      await delay(600);
      if (credentials.email === 'admin@farm.com' && credentials.password === 'admin123') {
        const user = { id: 'STF-001', name: 'System Admin', role: 'Admin', email: 'admin@farm.com' };
        localStorage.setItem('farm_user', JSON.stringify(user));
        return user;
      }
      if (credentials.email === 'staff@farm.com' && credentials.password === 'staff123') {
        const user = { id: 'STF-002', name: 'John Doe', role: 'Staff', email: 'staff@farm.com' };
        localStorage.setItem('farm_user', JSON.stringify(user));
        return user;
      }
      throw new Error('Invalid email or password');
    },
    logout: async () => {
      await delay(200);
      localStorage.removeItem('farm_user');
    },
    getCurrentUser: async () => {
      await delay(100);
      const userStr = localStorage.getItem('farm_user');
      return userStr ? JSON.parse(userStr) : null;
    }
  },

  // --- Egg Inventory Custom Methods ---
  eggInventory: {
    getSummary: async () => {
      await delay();
      return { ...eggInventoryState };
    }
  },

  // --- Calendar Events ---
  calendar: {
    getAll: () => db.calendar.getAll(),
    getById: (id) => db.calendar.getById(id),
    create: (data) => db.calendar.create(data),
    update: (id, data) => db.calendar.update(id, data),
    delete: (id) => db.calendar.delete(id),
  },

  // --- Vaccination Records ---
  vaccinations: {
    getAll: () => db.vaccination.getAll(),
    getById: (id) => db.vaccination.getById(id),
    create: (data) => db.vaccination.create(data),
    update: (id, data) => db.vaccination.update(id, data),
    delete: (id) => db.vaccination.delete(id),
  },

  // --- Hatchery Records ---
  hatchery: {
    getAll: () => db.hatchery.getAll(),
    getById: (id) => db.hatchery.getById(id),
    create: (data) => db.hatchery.create(data),
    update: (id, data) => db.hatchery.update(id, data),
    delete: (id) => db.hatchery.delete(id),
  },

  // --- Income Management ---
  income: {
    getAll: () => db.income.getAll(),
    getById: (id) => db.income.getById(id),
    create: (data) => db.income.create(data),
    update: (id, data) => db.income.update(id, data),
    delete: (id) => db.income.delete(id),
  },

  // --- Expense Management ---
  expenses: {
    getAll: () => db.expense.getAll(),
    getById: (id) => db.expense.getById(id),
    create: (data) => db.expense.create(data),
    update: (id, data) => db.expense.update(id, data),
    delete: (id) => db.expense.delete(id),
  },

  // --- Staff Management ---
  staff: {
    getAll: () => db.staff.getAll(),
    getById: (id) => db.staff.getById(id),
    create: (data) => db.staff.create(data),
    update: (id, data) => db.staff.update(id, data),
    delete: (id) => db.staff.delete(id),
  },

  // --- Sales & Complex Relationships Workflows ---
  sales: {
    getAll: () => db.sales.getAll(),
    getById: (id) => db.sales.getById(id),
    
    // Custom Create to simulate Business Logic
    create: async (data) => {
      // 1. Create the sale
      const newSale = await db.sales.create(data);
      
      // 2. Reduce Inventory
      eggInventoryState.totalSellable -= (data.quantity || 0);

      // 3. Automatically generate an Income record
      if (data.status === 'Paid') {
        await db.income.create({
          source: 'Egg Sales',
          referenceType: 'SALE',
          referenceId: newSale.id,
          amount: data.total,
          date: data.date,
          category: 'Sales',
          notes: `Auto-generated from Invoice ${newSale.id}`
        });
      }

      return newSale;
    },
    
    update: (id, data) => db.sales.update(id, data),
    delete: (id) => db.sales.delete(id),
  }
};
