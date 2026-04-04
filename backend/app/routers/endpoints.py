from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Flock, Production, Inventory, Sale, Income, Expense, CalendarEvent, Vaccination, Hatchery, Staff
import app.schemas as schemas
from app.routers.auth import get_current_user

router = APIRouter()

# Dependency to check admin access
def require_admin(current_user: User = Depends(get_current_user)):
    if current_user.role != "Admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

def init_inventory(db: Session):
    inv = db.query(Inventory).first()
    if not inv:
        inv = Inventory(totalSellable=0, totalDamaged=0, large=0, medium=0, small=0)
        db.add(inv)
        db.commit()
    return inv

# --- FLOCKS ---
@router.get("/flocks", response_model=list[schemas.FlockResponse])
def get_flocks(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return db.query(Flock).all()

@router.post("/flocks", response_model=schemas.FlockResponse)
def create_flock(flock: schemas.FlockCreate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    new_record = Flock(**flock.dict())
    db.add(new_record)
    db.commit()
    db.refresh(new_record)
    return new_record

# --- PRODUCTION ---
@router.get("/production", response_model=list[schemas.ProductionResponse])
def get_production(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return db.query(Production).all()

@router.post("/production", response_model=schemas.ProductionResponse)
def create_production(prod: schemas.ProductionCreate, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    total_good = (prod.large or 0) + (prod.medium or 0) + (prod.small or 0)
    prod.totalGoodEggs = total_good
    prod.eggsCollected = total_good
    prod.damagedEggs = (prod.cracked or 0) + (prod.reject or 0)

    new_record = Production(**prod.dict())
    db.add(new_record)
    
    inv = init_inventory(db)
    inv.totalSellable += prod.totalGoodEggs
    inv.totalDamaged += prod.damagedEggs
    inv.large += (prod.large or 0)
    inv.medium += (prod.medium or 0)
    inv.small += (prod.small or 0)

    db.commit()
    db.refresh(new_record)
    return new_record

# --- INVENTORY ---
@router.get("/inventory/summary", response_model=schemas.InventoryResponse)
def get_inventory(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return init_inventory(db)

# --- SALES ---
@router.get("/sales", response_model=list[schemas.SaleResponse])
def get_sales(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return db.query(Sale).all()

@router.post("/sales", response_model=schemas.SaleResponse)
def create_sale(sale: schemas.SaleCreate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    if sale.customer and not sale.customer_name:
        sale.customer_name = sale.customer
    elif sale.customer_name and not sale.customer:
        sale.customer = sale.customer_name

    # 1. Deduct Inventory (Business Logic)
    inv = init_inventory(db)
    if inv.totalSellable < sale.traysSold:
        raise HTTPException(status_code=400, detail="Insufficient inventory trays")
    inv.totalSellable -= sale.traysSold

    # 2. Record Sale
    new_sale = Sale(**sale.dict())
    db.add(new_sale)
    db.flush() # Commit sale temporarily to grab ID
    
    # 3. Create linked Income if Paid
    if new_sale.status == "Paid":
        inc = Income(
            source=new_sale.customer_name or new_sale.customer,
            referenceType="Sales Invoice",
            referenceId=new_sale.id,
            amount=new_sale.total,
            date=new_sale.date,
            category="Egg Sales",
            notes="Auto-generated from Invoice"
        )
        db.add(inc)

    db.commit()
    db.refresh(new_sale)
    return new_sale

# --- FINANCE (INCOME / EXPENSES) ---
@router.get("/income", response_model=list[schemas.IncomeResponse])
def get_income(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return db.query(Income).all()

@router.post("/income", response_model=schemas.IncomeResponse)
def create_income(inc: schemas.IncomeCreate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    new_record = Income(**inc.dict())
    db.add(new_record)
    db.commit()
    db.refresh(new_record)
    return new_record

@router.get("/expenses", response_model=list[schemas.ExpenseResponse])
def get_expenses(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return db.query(Expense).all()

@router.post("/expenses", response_model=schemas.ExpenseResponse)
def create_expense(exp: schemas.ExpenseCreate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    new_record = Expense(**exp.dict())
    db.add(new_record)
    db.commit()
    db.refresh(new_record)
    return new_record

# --- CALENDAR ---
@router.get("/calendar", response_model=list[schemas.CalendarEventResponse])
def get_calendar(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return db.query(CalendarEvent).all()

@router.post("/calendar", response_model=schemas.CalendarEventResponse)
def create_calendar(event: schemas.CalendarEventCreate, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    new_record = CalendarEvent(**event.dict())
    db.add(new_record)
    db.commit()
    db.refresh(new_record)
    return new_record

@router.put("/calendar/{event_id}", response_model=schemas.CalendarEventResponse)
def update_calendar(event_id: int, event: schemas.CalendarEventCreate, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    existing_event = db.query(CalendarEvent).filter(CalendarEvent.id == event_id).first()
    if not existing_event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    for key, value in event.dict().items():
        setattr(existing_event, key, value)
        
    db.commit()
    db.refresh(existing_event)
    return existing_event

# --- VACCINATION ---
@router.get("/vaccinations", response_model=list[schemas.VaccinationResponse])
def get_vaccinations(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return db.query(Vaccination).all()

@router.post("/vaccinations", response_model=schemas.VaccinationResponse)
def create_vaccination(vac: schemas.VaccinationCreate, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    new_record = Vaccination(**vac.dict())
    db.add(new_record)
    
    # Auto-gen calendar event for booster
    if vac.nextDueDate:
        db.add(CalendarEvent(
            title=f"{vac.vaccineName} Booster (Flock {vac.batchId})",
            date=vac.nextDueDate,
            type="vaccination"
        ))
        
    db.commit()
    db.refresh(new_record)
    return new_record

# --- HATCHERY ---
@router.get("/hatchery", response_model=list[schemas.HatcheryResponse])
def get_hatchery(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return db.query(Hatchery).all()

@router.post("/hatchery", response_model=schemas.HatcheryResponse)
def create_hatchery(hatch: schemas.HatcheryCreate, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    new_record = Hatchery(**hatch.dict())
    db.add(new_record)
    db.commit()
    db.refresh(new_record)
    return new_record

# --- STAFF ---
@router.get("/staff", response_model=list[schemas.StaffResponse])
def get_staff(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return db.query(Staff).all()

@router.post("/staff", response_model=schemas.StaffResponse)
def create_staff(staff: schemas.StaffCreate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    new_record = Staff(**staff.dict())
    db.add(new_record)
    
    # Also create a login user account 
    if staff.email:
        existing_user = db.query(User).filter(User.email == staff.email).first()
        if not existing_user:
            from app.core.security import get_password_hash
            new_user = User(
                email=staff.email,
                name=staff.name,
                role=staff.role,
                hashed_password=get_password_hash("defaultpass123")
            )
            db.add(new_user)
            
    db.commit()
    db.refresh(new_record)
    return new_record

# --- FEED MANAGEMENT ---
from app.models import FeedConsumption
@router.get("/feed", response_model=list[schemas.FeedConsumptionResponse])
def get_feed_consumption(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return db.query(FeedConsumption).all()

@router.post("/feed", response_model=schemas.FeedConsumptionResponse)
def create_feed_consumption(feed: schemas.FeedConsumptionCreate, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    new_record = FeedConsumption(**feed.dict())
    db.add(new_record)
    db.commit()
    db.refresh(new_record)
    return new_record

@router.get("/forecast/feed/{flock_id}")
def forecast_feed(flock_id: str, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    from app.forecast import generate_feed_forecast
    return generate_feed_forecast(flock_id, db)
