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

class MessageResponse(BaseModel):
    message: str

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

# Flock
class FlockBase(BaseModel):
    batchId: str
    house: str
    breed: str
    ageWeeks: int
    quantity: int
    mortality: Optional[int] = 0
    status: str

class FlockCreate(FlockBase): pass
class FlockResponse(FlockBase):
    id: int
    class Config: from_attributes = True

# Production
class ProductionBase(BaseModel):
    date: str
    flockId: str
    staff_incharge: Optional[str] = None
    eggsCollected: Optional[int] = 0
    large: Optional[int] = 0
    medium: Optional[int] = 0
    small: Optional[int] = 0
    jumbo: Optional[int] = 0
    extralarge: Optional[int] = 0
    peewee: Optional[int] = 0
    cracked: Optional[int] = 0
    reject: Optional[int] = 0
    bunkig: Optional[int] = 0
    totalGoodEggs: Optional[int] = 0
    damagedEggs: Optional[int] = 0
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
    large: int = 0
    medium: int = 0
    small: int = 0
    jumbo: int = 0
    extralarge: int = 0
    peewee: int = 0
    class Config: from_attributes = True

# Sales
class SaleBase(BaseModel):
    customer: Optional[str] = None
    customer_name: Optional[str] = None
    contact_no: Optional[str] = None
    address: Optional[str] = None
    date: str
    traysSold: int
    pricePerTray: float
    total: float
    balance: float = 0.0
    status: str
    staff_incharge: Optional[str] = None

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
    time: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = "Pending"

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

class StaffCreate(StaffBase): 
    password: Optional[str] = None
class StaffResponse(StaffBase):
    id: int
    status: str
    class Config: from_attributes = True

# Feed Consumption
class FeedConsumptionBase(BaseModel):
    date: str
    flockId: str
    feedConsumedKgs: float

class FeedConsumptionCreate(FeedConsumptionBase): pass
class FeedConsumptionResponse(FeedConsumptionBase):
    id: int
    createdAt: datetime
    class Config: from_attributes = True
