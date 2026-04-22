from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Flock, Production, Inventory, Sale, Income, Expense, CalendarEvent, Vaccination, Hatchery, Staff
import app.schemas as schemas
from app.routers.auth import get_current_user
from app.core.security import get_password_hash

router = APIRouter()

# Dependency to check admin access
def require_admin(current_user: User = Depends(get_current_user)):
    if current_user.role != "Admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

def get_inventory_actor_label(current_user: User) -> str:
    if current_user.role == "Admin":
        return "admin"
    return (current_user.name or "").strip() or "Unknown"

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

@router.put("/flocks/{flock_id}", response_model=schemas.FlockResponse)
def update_flock(flock_id: int, flock: schemas.FlockCreate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    existing = db.query(Flock).filter(Flock.id == flock_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Flock not found")
    
    # Logic: Automatically reduce number_of_hens if mortality is updated
    if flock.mortality and existing.mortality is not None:
        diff = flock.mortality - existing.mortality
        if diff > 0:
            flock.quantity -= diff
            if flock.quantity < 0:
                flock.quantity = 0

    for key, value in flock.dict().items():
        setattr(existing, key, value)
    db.commit()
    db.refresh(existing)
    return existing

@router.delete("/flocks/{flock_id}")
def delete_flock(flock_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    existing = db.query(Flock).filter(Flock.id == flock_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Flock not found")
    db.delete(existing)
    db.commit()
    return {"message": "Flock deleted"}

# --- PRODUCTION ---
@router.get("/production", response_model=list[schemas.ProductionResponse])
def get_production(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return db.query(Production).all()

@router.post("/production", response_model=schemas.ProductionResponse)
def create_production(prod: schemas.ProductionCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    total_good = (
        (prod.jumbo or 0) +
        (prod.extralarge or 0) +
        (prod.large or 0) +
        (prod.medium or 0) +
        (prod.small or 0) +
        (prod.peewee or 0) +
        (prod.bunkig or 0)
    )
    prod.totalGoodEggs = total_good
    prod.eggsCollected = total_good
    prod.damagedEggs = (prod.cracked or 0) + (prod.reject or 0)
    prod.staff_incharge = get_inventory_actor_label(current_user)

    new_record = Production(**prod.dict())
    db.add(new_record)
    
    inv = init_inventory(db)
    inv.totalSellable += prod.totalGoodEggs
    inv.totalDamaged += prod.damagedEggs
    inv.large += (prod.large or 0)
    inv.medium += (prod.medium or 0)
    inv.small += (prod.small or 0)
    inv.jumbo += (prod.jumbo or 0)
    inv.extralarge += (prod.extralarge or 0)
    inv.peewee += (prod.peewee or 0)

    db.commit()
    db.refresh(new_record)
    return new_record

# --- INVENTORY ---
@router.get("/inventory/summary", response_model=schemas.InventoryResponse)
def get_inventory(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return init_inventory(db)

# --- SALES ---
@router.get("/sales", response_model=list[schemas.SaleResponse])
def get_sales(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    query = db.query(Sale)
    if current_user.role != "Admin":
        query = query.filter(Sale.staff_incharge == get_inventory_actor_label(current_user))
    return query.all()

@router.post("/sales", response_model=schemas.SaleResponse)
def create_sale(sale: schemas.SaleCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
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
    new_sale.staff_incharge = get_inventory_actor_label(current_user)
    db.add(new_sale)
    db.flush() # Commit sale temporarily to grab ID
    
    # 3. Create linked Income if Paid
    if new_sale.status == "Paid":
        inc = Income(
            source=new_sale.customer_name or new_sale.customer,
            referenceType="Sales Invoice",
            referenceId=new_sale.id,
            amount=new_sale.total - new_sale.balance,
            date=new_sale.date,
            category="Egg Sales",
            notes="Auto-generated from Invoice"
        )
        db.add(inc)

    db.commit()
    db.refresh(new_sale)
    return new_sale

@router.put("/sales/{sale_id}", response_model=schemas.SaleResponse)
def update_sale(sale_id: int, sale: schemas.SaleCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    existing_sale = db.query(Sale).filter(Sale.id == sale_id).first()
    if not existing_sale:
        raise HTTPException(status_code=404, detail="Sale not found")

    if current_user.role != "Admin" and existing_sale.staff_incharge != get_inventory_actor_label(current_user):
        raise HTTPException(status_code=403, detail="You can only update your own transactions")
        
    for key, value in sale.dict().items():
        setattr(existing_sale, key, value)
    if not existing_sale.staff_incharge:
        existing_sale.staff_incharge = get_inventory_actor_label(current_user)
        
    db.commit()
    db.refresh(existing_sale)
    return existing_sale

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
    staff_dict = staff.dict()
    password = staff_dict.pop("password", None) or "defaultpass123"
    new_record = Staff(**staff_dict)
    db.add(new_record)
    
    # Also create a login user account 
    if staff.email:
        existing_user = db.query(User).filter(User.email == staff.email).first()
        if not existing_user:
            password_hash = get_password_hash(password)
            new_user = User(
                email=staff.email,
                name=staff.name,
                role=staff.role,
                hashed_password=password_hash,
                original_password_hash=password_hash
            )
            db.add(new_user)
            
    db.commit()
    db.refresh(new_record)
    return new_record

@router.put("/staff/{staff_id}", response_model=schemas.StaffResponse)
def update_staff(staff_id: int, staff_data: schemas.StaffCreate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    staff = db.query(Staff).filter(Staff.id == staff_id).first()
    if not staff:
        raise HTTPException(status_code=404, detail="Staff not found")
    
    old_email = staff.email
    
    staff_dict = staff_data.dict(exclude_unset=True)
    password = staff_dict.pop("password", None)
    
    for key, value in staff_dict.items():
        setattr(staff, key, value)
        
    # Sync matching user if they had an email
    if old_email:
        user = db.query(User).filter(User.email == old_email).first()
        if user:
            user.email = staff.email
            user.name = staff.name
            user.role = staff.role
            if password:
                if not user.original_password_hash:
                    user.original_password_hash = user.hashed_password
                user.hashed_password = get_password_hash(password)
            
    db.commit()
    db.refresh(staff)
    return staff

@router.post("/staff/{staff_id}/reset-password", response_model=schemas.MessageResponse)
def reset_staff_password(staff_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    staff = db.query(Staff).filter(Staff.id == staff_id).first()
    if not staff:
        raise HTTPException(status_code=404, detail="Staff not found")

    if not staff.email:
        raise HTTPException(status_code=400, detail="Staff account has no login email to reset")

    user = db.query(User).filter(User.email == staff.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Linked login account not found")

    if not user.original_password_hash:
        user.original_password_hash = user.hashed_password

    user.hashed_password = user.original_password_hash
    db.commit()
    return {"message": f"{staff.name}'s password was reset to the original password"}

@router.delete("/staff/{staff_id}")
def delete_staff(staff_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    staff = db.query(Staff).filter(Staff.id == staff_id).first()
    if not staff:
        raise HTTPException(status_code=404, detail="Staff not found")
        
    db.delete(staff)
    
    # Alternatively you might just deactivate the user instead of deleting, but to fulfill "delete", let's drop them or at least drop staff record.
    if staff.email:
        user = db.query(User).filter(User.email == staff.email).first()
        if user:
            db.delete(user)
            
    db.commit()
    return {"message": "Staff deleted successfully"}

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
