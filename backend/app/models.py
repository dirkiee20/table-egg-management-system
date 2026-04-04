from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime
from app.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    name = Column(String)
    role = Column(String)

class Flock(Base):
    __tablename__ = "flocks"
    id = Column(Integer, primary_key=True, index=True)
    batchId = Column(String)
    house = Column(String)
    breed = Column(String)
    ageWeeks = Column(Integer)
    quantity = Column(Integer)
    status = Column(String)

class Production(Base):
    __tablename__ = "production"
    id = Column(Integer, primary_key=True, index=True)
    date = Column(String)
    flockId = Column(String)
    eggsCollected = Column(Integer) # Legacy or total
    large = Column(Integer, default=0)
    medium = Column(Integer, default=0)
    small = Column(Integer, default=0)
    cracked = Column(Integer, default=0)
    reject = Column(Integer, default=0)
    totalGoodEggs = Column(Integer, default=0)
    damagedEggs = Column(Integer) # Legacy
    mortality = Column(Integer)
    notes = Column(String, nullable=True)
    createdAt = Column(DateTime, default=datetime.utcnow)

class Inventory(Base):
    __tablename__ = "inventory"
    id = Column(Integer, primary_key=True, index=True)
    totalSellable = Column(Integer, default=0)
    totalDamaged = Column(Integer, default=0)
    large = Column(Integer, default=0)
    medium = Column(Integer, default=0)
    small = Column(Integer, default=0)

class Sale(Base):
    __tablename__ = "sales"
    id = Column(Integer, primary_key=True, index=True)
    customer = Column(String) # Legacy
    customer_name = Column(String, nullable=True)
    contact_no = Column(String, nullable=True)
    address = Column(String, nullable=True)
    date = Column(String)
    traysSold = Column(Integer)
    pricePerTray = Column(Float)
    total = Column(Float)
    status = Column(String)
    createdAt = Column(DateTime, default=datetime.utcnow)

class Income(Base):
    __tablename__ = "income"
    id = Column(Integer, primary_key=True, index=True)
    source = Column(String)
    referenceType = Column(String, nullable=True)
    referenceId = Column(Integer, nullable=True)
    amount = Column(Float)
    date = Column(String)
    category = Column(String)
    notes = Column(String, nullable=True)

class Expense(Base):
    __tablename__ = "expenses"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    category = Column(String)
    amount = Column(Float)
    date = Column(String)
    vendor = Column(String, nullable=True)
    notes = Column(String, nullable=True)

class CalendarEvent(Base):
    __tablename__ = "calendar"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    date = Column(String)
    type = Column(String)
    time = Column(String, nullable=True)
    description = Column(String, nullable=True)
    status = Column(String, nullable=True, default="Pending")

class Vaccination(Base):
    __tablename__ = "vaccinations"
    id = Column(Integer, primary_key=True, index=True)
    batchId = Column(String)
    vaccineName = Column(String)
    dateAdministered = Column(String)
    nextDueDate = Column(String, nullable=True)
    administeredBy = Column(String, nullable=True)
    notes = Column(String, nullable=True)

class Hatchery(Base):
    __tablename__ = "hatchery"
    id = Column(Integer, primary_key=True, index=True)
    batchCode = Column(String)
    eggCount = Column(Integer)
    fertileEggCount = Column(Integer, nullable=True)
    hatchedCount = Column(Integer, nullable=True)
    hatchDate = Column(String)
    notes = Column(String, nullable=True)

class Staff(Base):
    __tablename__ = "staff"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    role = Column(String)
    contactNumber = Column(String)
    email = Column(String, nullable=True)
    status = Column(String, default="Active")

class FeedConsumption(Base):
    __tablename__ = "feed_consumption"
    id = Column(Integer, primary_key=True, index=True)
    date = Column(String)
    flockId = Column(String)
    feedConsumedKgs = Column(Float)
    createdAt = Column(DateTime, default=datetime.utcnow)
