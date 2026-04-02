from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    email: str
    name: str
    role: str

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# Flock
class FlockBase(BaseModel):
    batchId: str
    house: str
    breed: str
    ageWeeks: int
    quantity: int
    status: str

class FlockCreate(FlockBase): pass
class FlockResponse(FlockBase):
    id: int
    class Config: from_attributes = True

# Production
class ProductionBase(BaseModel):
    date: str
    flockId: str
    eggsCollected: int
    damagedEggs: int
    mortality: int
    notes: Optional[str] = None

class ProductionCreate(ProductionBase): pass
class ProductionResponse(ProductionBase):
    id: int
    class Config: from_attributes = True

# Inventory
class InventoryResponse(BaseModel):
    id: int
    totalSellable: int
    totalDamaged: int
    class Config: from_attributes = True

# Sales
class SaleBase(BaseModel):
    customer: str
    date: str
    traysSold: int
    pricePerTray: float
    total: float
    status: str

class SaleCreate(SaleBase): pass
class SaleResponse(SaleBase):
    id: int
    class Config: from_attributes = True

# Income
class IncomeBase(BaseModel):
    source: str
    referenceType: Optional[str] = None
    referenceId: Optional[int] = None
    amount: float
    date: str
    category: str
    notes: Optional[str] = None

class IncomeCreate(IncomeBase): pass
class IncomeResponse(IncomeBase):
    id: int
    class Config: from_attributes = True

# Expense
class ExpenseBase(BaseModel):
    title: str
    category: str
    amount: float
    date: str
    vendor: Optional[str] = None
    notes: Optional[str] = None

class ExpenseCreate(ExpenseBase): pass
class ExpenseResponse(ExpenseBase):
    id: int
    class Config: from_attributes = True

# Calendar
class CalendarEventBase(BaseModel):
    title: str
    date: str
    type: str

class CalendarEventCreate(CalendarEventBase): pass
class CalendarEventResponse(CalendarEventBase):
    id: int
    class Config: from_attributes = True

# Vaccination
class VaccinationBase(BaseModel):
    batchId: str
    vaccineName: str
    dateAdministered: str
    nextDueDate: Optional[str] = None
    administeredBy: Optional[str] = None
    notes: Optional[str] = None

class VaccinationCreate(VaccinationBase): pass
class VaccinationResponse(VaccinationBase):
    id: int
    class Config: from_attributes = True

# Hatchery
class HatcheryBase(BaseModel):
    batchCode: str
    eggCount: int
    fertileEggCount: Optional[int] = None
    hatchedCount: Optional[int] = None
    hatchDate: str
    notes: Optional[str] = None

class HatcheryCreate(HatcheryBase): pass
class HatcheryResponse(HatcheryBase):
    id: int
    class Config: from_attributes = True

# Staff
class StaffBase(BaseModel):
    name: str
    role: str
    contactNumber: str
    email: Optional[str] = None
    status: Optional[str] = "Active"

class StaffCreate(StaffBase): pass
class StaffResponse(StaffBase):
    id: int
    class Config: from_attributes = True
