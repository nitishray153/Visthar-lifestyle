from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from fastapi import FastAPI, APIRouter, HTTPException, Request
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import uuid
import bcrypt
import jwt as pyjwt
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel, Field
from typing import List, Optional
import secrets

# ─── Config ──────────────────────────────────────────────
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALGORITHM = "HS256"

app = FastAPI(title="Visthar API")
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ─── Pydantic Models ─────────────────────────────────────

class UserRegister(BaseModel):
    name: str
    email: str
    password: str
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class AddressModel(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    phone: str
    street: str
    city: str
    state: str
    pincode: str
    is_default: bool = False

class CartItemAdd(BaseModel):
    product_id: str
    quantity: int = 1

class CartItemUpdate(BaseModel):
    quantity: int

class OrderCreate(BaseModel):
    address_id: str
    payment_method: str = "cod"

class PreBookingCreate(BaseModel):
    product_id: str
    email: str
    name: str
    phone: Optional[str] = None

class OEMInquiry(BaseModel):
    company_name: str
    contact_name: str
    email: str
    phone: str
    product_interest: str
    quantity: int
    message: Optional[str] = None

class NewsletterSubscribe(BaseModel):
    email: str

class ReviewCreate(BaseModel):
    product_id: str
    rating: int
    comment: str

class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    original_price: Optional[float] = None
    category: str
    image: str
    images: List[str] = []
    features: List[str] = []
    specs: dict = {}
    stock: int = 100
    is_featured: bool = False
    is_coming_soon: bool = False
    badge: Optional[str] = None

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    original_price: Optional[float] = None
    category: Optional[str] = None
    image: Optional[str] = None
    images: Optional[List[str]] = None
    features: Optional[List[str]] = None
    specs: Optional[dict] = None
    stock: Optional[int] = None
    is_featured: Optional[bool] = None
    is_coming_soon: Optional[bool] = None
    badge: Optional[str] = None

# ─── Auth Helpers ─────────────────────────────────────────

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))

def create_access_token(user_id: str, email: str, role: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
        "type": "access"
    }
    return pyjwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(request: Request) -> dict:
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = auth_header[7:]
    try:
        payload = pyjwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        user.pop("password_hash", None)
        return user
    except pyjwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except pyjwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_admin_user(request: Request) -> dict:
    user = await get_current_user(request)
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

# ─── Auth Endpoints ───────────────────────────────────────

@api_router.post("/auth/register")
async def register(data: UserRegister):
    email = data.email.lower().strip()
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = {
        "id": str(uuid.uuid4()),
        "name": data.name,
        "email": email,
        "password_hash": hash_password(data.password),
        "phone": data.phone,
        "role": "customer",
        "addresses": [],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user)
    token = create_access_token(user["id"], user["email"], user["role"])
    user_response = {k: v for k, v in user.items() if k not in ("password_hash", "_id")}
    return {"token": token, "user": user_response}

@api_router.post("/auth/login")
async def login(data: UserLogin):
    email = data.email.lower().strip()
    user = await db.users.find_one({"email": email}, {"_id": 0})
    if not user or not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(user["id"], user["email"], user["role"])
    user_response = {k: v for k, v in user.items() if k != "password_hash"}
    return {"token": token, "user": user_response}

@api_router.get("/auth/me")
async def get_me(request: Request):
    user = await get_current_user(request)
    return {"user": user}

@api_router.put("/auth/profile")
async def update_profile(request: Request):
    user = await get_current_user(request)
    body = await request.json()
    update_fields = {}
    for field in ["name", "phone"]:
        if field in body:
            update_fields[field] = body[field]
    if update_fields:
        await db.users.update_one({"id": user["id"]}, {"$set": update_fields})
    updated = await db.users.find_one({"id": user["id"]}, {"_id": 0, "password_hash": 0})
    return {"user": updated}

@api_router.post("/auth/addresses")
async def add_address(address: AddressModel, request: Request):
    user = await get_current_user(request)
    addr = address.model_dump()
    if addr["is_default"]:
        await db.users.update_one(
            {"id": user["id"]},
            {"$set": {"addresses.$[].is_default": False}}
        )
    await db.users.update_one({"id": user["id"]}, {"$push": {"addresses": addr}})
    updated = await db.users.find_one({"id": user["id"]}, {"_id": 0, "password_hash": 0})
    return {"user": updated}

@api_router.delete("/auth/addresses/{address_id}")
async def delete_address(address_id: str, request: Request):
    user = await get_current_user(request)
    await db.users.update_one(
        {"id": user["id"]},
        {"$pull": {"addresses": {"id": address_id}}}
    )
    updated = await db.users.find_one({"id": user["id"]}, {"_id": 0, "password_hash": 0})
    return {"user": updated}

# ─── Product Endpoints ────────────────────────────────────

@api_router.get("/products")
async def get_products(
    category: Optional[str] = None,
    featured: Optional[bool] = None,
    coming_soon: Optional[bool] = None,
    search: Optional[str] = None,
    sort: Optional[str] = "newest",
    limit: int = 50,
    skip: int = 0
):
    query = {}
    if category:
        query["category"] = category
    if featured is not None:
        query["is_featured"] = featured
    if coming_soon is not None:
        query["is_coming_soon"] = coming_soon
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]
    sort_map = {
        "newest": ("created_at", -1),
        "price_low": ("price", 1),
        "price_high": ("price", -1),
        "name": ("name", 1),
        "rating": ("rating", -1)
    }
    sort_key, sort_dir = sort_map.get(sort, ("created_at", -1))
    products = await db.products.find(query, {"_id": 0}).sort(sort_key, sort_dir).skip(skip).limit(limit).to_list(limit)
    total = await db.products.count_documents(query)
    return {"products": products, "total": total}

@api_router.get("/products/{product_id}")
async def get_product(product_id: str):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    reviews = await db.reviews.find({"product_id": product_id}, {"_id": 0}).sort("created_at", -1).to_list(20)
    return {"product": product, "reviews": reviews}

@api_router.post("/products")
async def create_product(product: ProductCreate, request: Request):
    await get_admin_user(request)
    doc = product.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    doc["rating"] = 0
    doc["review_count"] = 0
    await db.products.insert_one(doc)
    doc.pop("_id", None)
    return {"product": doc}

@api_router.put("/products/{product_id}")
async def update_product(product_id: str, product: ProductUpdate, request: Request):
    await get_admin_user(request)
    update_data = {k: v for k, v in product.model_dump().items() if v is not None}
    if update_data:
        await db.products.update_one({"id": product_id}, {"$set": update_data})
    updated = await db.products.find_one({"id": product_id}, {"_id": 0})
    return {"product": updated}

@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str, request: Request):
    await get_admin_user(request)
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted"}

# ─── Cart Endpoints ───────────────────────────────────────

def _get_user_id_from_request(request: Request, user=None):
    if user:
        return user["id"]
    session_id = request.headers.get("X-Session-ID", "")
    if session_id:
        return f"guest_{session_id}"
    return None

@api_router.get("/cart")
async def get_cart(request: Request):
    try:
        user = await get_current_user(request)
        user_id = user["id"]
    except Exception:
        session_id = request.headers.get("X-Session-ID")
        if not session_id:
            return {"items": [], "total": 0}
        user_id = f"guest_{session_id}"
    cart = await db.carts.find_one({"user_id": user_id}, {"_id": 0})
    if not cart:
        return {"items": [], "total": 0}
    enriched_items = []
    total = 0
    for item in cart.get("items", []):
        product = await db.products.find_one({"id": item["product_id"]}, {"_id": 0})
        if product:
            enriched = {**item, "product": product}
            enriched_items.append(enriched)
            total += product["price"] * item["quantity"]
    return {"items": enriched_items, "total": total}

@api_router.post("/cart/add")
async def add_to_cart(item: CartItemAdd, request: Request):
    try:
        user = await get_current_user(request)
        user_id = user["id"]
    except Exception:
        session_id = request.headers.get("X-Session-ID")
        if not session_id:
            raise HTTPException(status_code=400, detail="Session ID required for guest cart")
        user_id = f"guest_{session_id}"
    product = await db.products.find_one({"id": item.product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if product.get("is_coming_soon"):
        raise HTTPException(status_code=400, detail="This product is not available for purchase yet")
    cart = await db.carts.find_one({"user_id": user_id})
    if not cart:
        await db.carts.insert_one({
            "user_id": user_id,
            "items": [{"product_id": item.product_id, "quantity": item.quantity}],
            "updated_at": datetime.now(timezone.utc).isoformat()
        })
    else:
        existing_item = next((i for i in cart["items"] if i["product_id"] == item.product_id), None)
        if existing_item:
            await db.carts.update_one(
                {"user_id": user_id, "items.product_id": item.product_id},
                {"$inc": {"items.$.quantity": item.quantity}, "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}}
            )
        else:
            await db.carts.update_one(
                {"user_id": user_id},
                {"$push": {"items": {"product_id": item.product_id, "quantity": item.quantity}},
                 "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}}
            )
    return {"message": "Added to cart"}

@api_router.put("/cart/update/{product_id}")
async def update_cart_item(product_id: str, data: CartItemUpdate, request: Request):
    try:
        user = await get_current_user(request)
        user_id = user["id"]
    except Exception:
        session_id = request.headers.get("X-Session-ID")
        if not session_id:
            raise HTTPException(status_code=400, detail="Session ID required")
        user_id = f"guest_{session_id}"
    if data.quantity <= 0:
        await db.carts.update_one({"user_id": user_id}, {"$pull": {"items": {"product_id": product_id}}})
    else:
        await db.carts.update_one(
            {"user_id": user_id, "items.product_id": product_id},
            {"$set": {"items.$.quantity": data.quantity, "updated_at": datetime.now(timezone.utc).isoformat()}}
        )
    return {"message": "Cart updated"}

@api_router.delete("/cart/remove/{product_id}")
async def remove_from_cart(product_id: str, request: Request):
    try:
        user = await get_current_user(request)
        user_id = user["id"]
    except Exception:
        session_id = request.headers.get("X-Session-ID")
        if not session_id:
            raise HTTPException(status_code=400, detail="Session ID required")
        user_id = f"guest_{session_id}"
    await db.carts.update_one({"user_id": user_id}, {"$pull": {"items": {"product_id": product_id}}})
    return {"message": "Item removed"}

@api_router.delete("/cart/clear")
async def clear_cart(request: Request):
    try:
        user = await get_current_user(request)
        user_id = user["id"]
    except Exception:
        session_id = request.headers.get("X-Session-ID")
        if not session_id:
            return {"message": "Cart cleared"}
        user_id = f"guest_{session_id}"
    await db.carts.delete_one({"user_id": user_id})
    return {"message": "Cart cleared"}

# ─── Order Endpoints ──────────────────────────────────────

@api_router.post("/orders")
async def create_order(data: OrderCreate, request: Request):
    user = await get_current_user(request)
    cart = await db.carts.find_one({"user_id": user["id"]})
    if not cart or not cart.get("items"):
        raise HTTPException(status_code=400, detail="Cart is empty")
    user_doc = await db.users.find_one({"id": user["id"]}, {"_id": 0})
    address = next((a for a in user_doc.get("addresses", []) if a["id"] == data.address_id), None)
    if not address:
        raise HTTPException(status_code=400, detail="Address not found")
    items = []
    total = 0
    for cart_item in cart["items"]:
        product = await db.products.find_one({"id": cart_item["product_id"]}, {"_id": 0})
        if product:
            items.append({
                "product_id": product["id"],
                "name": product["name"],
                "price": product["price"],
                "image": product["image"],
                "quantity": cart_item["quantity"],
                "subtotal": product["price"] * cart_item["quantity"]
            })
            total += product["price"] * cart_item["quantity"]
    tracking_id = f"VSTR{secrets.token_hex(4).upper()}"
    order = {
        "id": str(uuid.uuid4()),
        "order_number": f"VIS-{secrets.token_hex(3).upper()}",
        "user_id": user["id"],
        "user_email": user_doc["email"],
        "user_name": user_doc["name"],
        "items": items,
        "total": total,
        "address": address,
        "payment_method": data.payment_method,
        "payment_status": "paid" if data.payment_method != "cod" else "pending",
        "status": "placed",
        "tracking_id": tracking_id,
        "tracking_history": [
            {"status": "placed", "timestamp": datetime.now(timezone.utc).isoformat(), "message": "Order placed successfully"}
        ],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    await db.orders.insert_one(order)
    await db.carts.delete_one({"user_id": user["id"]})
    order.pop("_id", None)
    return {"order": order}

@api_router.get("/orders")
async def get_orders(request: Request):
    user = await get_current_user(request)
    orders = await db.orders.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return {"orders": orders}

@api_router.get("/orders/{order_id}")
async def get_order(order_id: str, request: Request):
    user = await get_current_user(request)
    order = await db.orders.find_one({"id": order_id, "user_id": user["id"]}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"order": order}

@api_router.get("/orders/track/{tracking_id}")
async def track_order(tracking_id: str):
    order = await db.orders.find_one({"tracking_id": tracking_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return {
        "tracking_id": order["tracking_id"],
        "status": order["status"],
        "tracking_history": order["tracking_history"],
        "order_number": order["order_number"]
    }

# ─── Pre-booking Endpoints ───────────────────────────────

@api_router.post("/prebooking")
async def create_prebooking(data: PreBookingCreate):
    existing = await db.prebookings.find_one({"email": data.email.lower(), "product_id": data.product_id})
    if existing:
        raise HTTPException(status_code=400, detail="Already pre-booked")
    product = await db.products.find_one({"id": data.product_id}, {"_id": 0})
    booking = {
        "id": str(uuid.uuid4()),
        "product_id": data.product_id,
        "product_name": product["name"] if product else "Unknown",
        "email": data.email.lower(),
        "name": data.name,
        "phone": data.phone,
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.prebookings.insert_one(booking)
    booking.pop("_id", None)
    return {"booking": booking, "message": "Pre-booking confirmed!"}

@api_router.get("/prebooking")
async def get_prebookings(request: Request):
    await get_admin_user(request)
    bookings = await db.prebookings.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return {"prebookings": bookings}

# ─── OEM Endpoints ────────────────────────────────────────

@api_router.post("/oem/inquiry")
async def create_oem_inquiry(data: OEMInquiry):
    inquiry = data.model_dump()
    inquiry["id"] = str(uuid.uuid4())
    inquiry["status"] = "new"
    inquiry["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.oem_inquiries.insert_one(inquiry)
    inquiry.pop("_id", None)
    return {"inquiry": inquiry, "message": "Inquiry submitted successfully!"}

@api_router.get("/oem/inquiries")
async def get_oem_inquiries(request: Request):
    await get_admin_user(request)
    inquiries = await db.oem_inquiries.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return {"inquiries": inquiries}

# ─── Newsletter Endpoint ─────────────────────────────────

@api_router.post("/newsletter/subscribe")
async def newsletter_subscribe(data: NewsletterSubscribe):
    email = data.email.lower().strip()
    existing = await db.newsletter.find_one({"email": email})
    if existing:
        return {"message": "Already subscribed!"}
    await db.newsletter.insert_one({
        "id": str(uuid.uuid4()),
        "email": email,
        "subscribed_at": datetime.now(timezone.utc).isoformat()
    })
    return {"message": "Subscribed successfully!"}

# ─── Review Endpoints ─────────────────────────────────────

@api_router.post("/reviews")
async def create_review(data: ReviewCreate, request: Request):
    user = await get_current_user(request)
    review = {
        "id": str(uuid.uuid4()),
        "product_id": data.product_id,
        "user_id": user["id"],
        "user_name": user["name"],
        "rating": min(5, max(1, data.rating)),
        "comment": data.comment,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.reviews.insert_one(review)
    pipeline = [
        {"$match": {"product_id": data.product_id}},
        {"$group": {"_id": None, "avg_rating": {"$avg": "$rating"}, "count": {"$sum": 1}}}
    ]
    result = await db.reviews.aggregate(pipeline).to_list(1)
    if result:
        await db.products.update_one(
            {"id": data.product_id},
            {"$set": {"rating": round(result[0]["avg_rating"], 1), "review_count": result[0]["count"]}}
        )
    review.pop("_id", None)
    return {"review": review}

@api_router.get("/reviews/{product_id}")
async def get_reviews(product_id: str):
    reviews = await db.reviews.find({"product_id": product_id}, {"_id": 0}).sort("created_at", -1).to_list(50)
    return {"reviews": reviews}

# ─── Admin Endpoints ──────────────────────────────────────

@api_router.get("/admin/dashboard")
async def admin_dashboard(request: Request):
    await get_admin_user(request)
    total_users = await db.users.count_documents({})
    total_products = await db.products.count_documents({"is_coming_soon": False})
    total_orders = await db.orders.count_documents({})
    total_prebookings = await db.prebookings.count_documents({})
    total_oem = await db.oem_inquiries.count_documents({})
    recent_orders = await db.orders.find({}, {"_id": 0}).sort("created_at", -1).limit(10).to_list(10)
    pipeline = [{"$group": {"_id": None, "total_revenue": {"$sum": "$total"}}}]
    revenue_result = await db.orders.aggregate(pipeline).to_list(1)
    total_revenue = revenue_result[0]["total_revenue"] if revenue_result else 0
    return {
        "stats": {
            "total_users": total_users,
            "total_products": total_products,
            "total_orders": total_orders,
            "total_prebookings": total_prebookings,
            "total_oem_inquiries": total_oem,
            "total_revenue": total_revenue
        },
        "recent_orders": recent_orders
    }

@api_router.get("/admin/orders")
async def admin_orders(request: Request, status: Optional[str] = None):
    await get_admin_user(request)
    query = {}
    if status:
        query["status"] = status
    orders = await db.orders.find(query, {"_id": 0}).sort("created_at", -1).to_list(500)
    return {"orders": orders}

@api_router.put("/admin/orders/{order_id}/status")
async def update_order_status(order_id: str, request: Request):
    await get_admin_user(request)
    body = await request.json()
    new_status = body.get("status")
    valid_statuses = ["placed", "confirmed", "packed", "shipped", "out_for_delivery", "delivered", "cancelled"]
    if new_status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status")
    status_messages = {
        "confirmed": "Order has been confirmed",
        "packed": "Order has been packed",
        "shipped": "Order has been shipped",
        "out_for_delivery": "Order is out for delivery",
        "delivered": "Order has been delivered",
        "cancelled": "Order has been cancelled"
    }
    tracking_entry = {
        "status": new_status,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "message": status_messages.get(new_status, f"Status updated to {new_status}")
    }
    await db.orders.update_one(
        {"id": order_id},
        {"$set": {"status": new_status, "updated_at": datetime.now(timezone.utc).isoformat()},
         "$push": {"tracking_history": tracking_entry}}
    )
    updated = await db.orders.find_one({"id": order_id}, {"_id": 0})
    return {"order": updated}

@api_router.get("/admin/users")
async def admin_users(request: Request):
    await get_admin_user(request)
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).sort("created_at", -1).to_list(500)
    return {"users": users}

@api_router.get("/admin/products")
async def admin_products(request: Request):
    await get_admin_user(request)
    products = await db.products.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return {"products": products}

@api_router.get("/categories")
async def get_categories():
    categories = await db.products.distinct("category")
    return {"categories": [c for c in categories if c != "Coming Soon"]}

@api_router.get("/")
async def root():
    return {"message": "Visthar API v1.0"}

# ─── Seed Data ────────────────────────────────────────────

async def seed_admin():
    admin_email = os.environ.get('ADMIN_EMAIL', 'admin@visthar.com')
    admin_password = os.environ.get('ADMIN_PASSWORD', 'VistharAdmin2024!')
    existing = await db.users.find_one({"email": admin_email})
    if not existing:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "name": "Admin",
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "phone": None,
            "role": "admin",
            "addresses": [],
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        logger.info(f"Admin user created: {admin_email}")
    elif not verify_password(admin_password, existing.get("password_hash", "")):
        await db.users.update_one(
            {"email": admin_email},
            {"$set": {"password_hash": hash_password(admin_password)}}
        )

async def seed_products():
    count = await db.products.count_documents({})
    if count > 0:
        return
    products = [
        {
            "id": str(uuid.uuid4()), "name": "Visthar TurboCharge 65W GaN",
            "description": "Ultra-compact 65W GaN charger with intelligent power distribution. Charges your devices at lightning speed with eco-friendly materials.",
            "price": 1999, "original_price": 2999, "category": "Chargers",
            "image": "https://images.unsplash.com/photo-1583142485083-291557266e6a?w=600",
            "images": ["https://images.unsplash.com/photo-1583142485083-291557266e6a?w=600"],
            "features": ["65W GaN Technology", "USB-C PD 3.0", "Compact Design", "Universal Compatibility", "Eco-Friendly Materials"],
            "specs": {"wattage": "65W", "ports": "1x USB-C", "weight": "120g"},
            "stock": 150, "is_featured": True, "is_coming_soon": False, "badge": "Best Seller",
            "rating": 4.7, "review_count": 128, "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()), "name": "Visthar EcoCharge 20W PD",
            "description": "Plastic-free 20W PD charger from V Green Project. Fast charging meets sustainability.",
            "price": 799, "original_price": 1299, "category": "Chargers",
            "image": "https://images.unsplash.com/photo-1584281198331-48b578631ee0?w=600",
            "images": ["https://images.unsplash.com/photo-1584281198331-48b578631ee0?w=600"],
            "features": ["20W PD Fast Charge", "100% Plastic-Free", "V Green Certified", "BIS Certified"],
            "specs": {"wattage": "20W", "ports": "1x USB-C", "weight": "45g"},
            "stock": 200, "is_featured": True, "is_coming_soon": False, "badge": "Eco",
            "rating": 4.5, "review_count": 89, "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()), "name": "Visthar PowerHub 100W 4-Port",
            "description": "Power your entire desk with 100W total output across 4 ports. Smart power allocation for optimal charging.",
            "price": 3499, "original_price": 4999, "category": "Chargers",
            "image": "https://images.unsplash.com/photo-1564622495631-60124bfb408b?w=600",
            "images": ["https://images.unsplash.com/photo-1564622495631-60124bfb408b?w=600"],
            "features": ["100W Total Output", "4 Ports", "Smart Power Allocation", "Surge Protection"],
            "specs": {"wattage": "100W", "ports": "3x USB-C + 1x USB-A", "weight": "280g"},
            "stock": 75, "is_featured": False, "is_coming_soon": False, "badge": None,
            "rating": 4.8, "review_count": 56, "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()), "name": "Visthar FlexLink USB-C Cable 1.5m",
            "description": "Premium braided USB-C to USB-C cable with 100W PD support. Built to last with reinforced connectors.",
            "price": 499, "original_price": 799, "category": "Cables",
            "image": "https://images.unsplash.com/photo-1660945671777-6389d37d6ab4?w=600",
            "images": ["https://images.unsplash.com/photo-1660945671777-6389d37d6ab4?w=600"],
            "features": ["100W PD Support", "480Mbps Data", "Braided Nylon", "10000+ Bend Cycles"],
            "specs": {"length": "1.5m", "type": "USB-C to USB-C", "max_power": "100W"},
            "stock": 300, "is_featured": True, "is_coming_soon": False, "badge": None,
            "rating": 4.6, "review_count": 203, "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()), "name": "Visthar ArmorLink Braided Cable 2m",
            "description": "Military-grade braided USB-C cable with Kevlar core. 240W PD support for maximum versatility.",
            "price": 799, "original_price": 1199, "category": "Cables",
            "image": "https://images.unsplash.com/photo-1603899122911-27c0cb85824a?w=600",
            "images": ["https://images.unsplash.com/photo-1603899122911-27c0cb85824a?w=600"],
            "features": ["240W PD Support", "Kevlar Core", "USB 3.2 Gen2", "Lifetime Warranty"],
            "specs": {"length": "2m", "type": "USB-C to USB-C", "data_speed": "10Gbps"},
            "stock": 120, "is_featured": False, "is_coming_soon": False, "badge": "Premium",
            "rating": 4.9, "review_count": 67, "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()), "name": "Visthar EcoLink Lightning Cable",
            "description": "MFi-certified Lightning cable made with recycled materials. V Green Project certified.",
            "price": 699, "original_price": 999, "category": "Cables",
            "image": "https://images.pexels.com/photos/18641665/pexels-photo-18641665.png?w=600",
            "images": ["https://images.pexels.com/photos/18641665/pexels-photo-18641665.png?w=600"],
            "features": ["MFi Certified", "Recycled Materials", "20W PD Support", "V Green Certified"],
            "specs": {"length": "1m", "type": "USB-C to Lightning", "max_power": "20W"},
            "stock": 250, "is_featured": False, "is_coming_soon": False, "badge": "Eco",
            "rating": 4.4, "review_count": 145, "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()), "name": "Visthar SonicPro ANC Headphones",
            "description": "Premium active noise cancelling headphones with 40mm drivers and 60-hour battery life. Hi-Res Audio certified.",
            "price": 4999, "original_price": 7999, "category": "Headphones",
            "image": "https://images.unsplash.com/photo-1628911771730-881503b8e9c9?w=600",
            "images": ["https://images.unsplash.com/photo-1628911771730-881503b8e9c9?w=600"],
            "features": ["Active Noise Cancellation", "40mm Custom Drivers", "60hr Battery", "Hi-Res Audio", "Multipoint Connection"],
            "specs": {"driver": "40mm", "battery": "60 hours", "anc": "Hybrid", "bluetooth": "5.3"},
            "stock": 50, "is_featured": True, "is_coming_soon": False, "badge": "New",
            "rating": 4.8, "review_count": 42, "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()), "name": "Visthar BassPulse Wireless",
            "description": "Deep bass wireless headphones with ultra-comfortable memory foam pads. 45-hour battery life.",
            "price": 2999, "original_price": 3999, "category": "Headphones",
            "image": "https://images.unsplash.com/photo-1628911771730-881503b8e9c9?w=600",
            "images": ["https://images.unsplash.com/photo-1628911771730-881503b8e9c9?w=600"],
            "features": ["Deep Bass Engine", "45hr Battery", "Memory Foam Pads", "Foldable Design"],
            "specs": {"driver": "40mm", "battery": "45 hours", "bluetooth": "5.2"},
            "stock": 80, "is_featured": False, "is_coming_soon": False, "badge": None,
            "rating": 4.5, "review_count": 78, "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()), "name": "Visthar BoomBox Portable Speaker",
            "description": "360-degree spatial audio speaker with IP67 waterproofing. 24-hour battery and RGB lighting.",
            "price": 3499, "original_price": 4999, "category": "Speakers",
            "image": "https://images.unsplash.com/photo-1589256469067-ea99122bbdc4?w=600",
            "images": ["https://images.unsplash.com/photo-1589256469067-ea99122bbdc4?w=600"],
            "features": ["360-degree Audio", "IP67 Waterproof", "24hr Battery", "RGB Lighting", "Party Connect"],
            "specs": {"output": "30W", "battery": "24 hours", "waterproof": "IP67", "bluetooth": "5.3"},
            "stock": 60, "is_featured": True, "is_coming_soon": False, "badge": "Popular",
            "rating": 4.7, "review_count": 95, "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()), "name": "Visthar MiniBlast Compact Speaker",
            "description": "Ultra-portable speaker that fits in your pocket. Surprisingly powerful 10W output with rich bass.",
            "price": 1499, "original_price": 1999, "category": "Speakers",
            "image": "https://images.unsplash.com/photo-1612022630455-ad6e37084907?w=600",
            "images": ["https://images.unsplash.com/photo-1612022630455-ad6e37084907?w=600"],
            "features": ["Ultra-Portable", "10W Output", "IPX5 Water Resistant", "12hr Battery"],
            "specs": {"output": "10W", "battery": "12 hours", "waterproof": "IPX5", "bluetooth": "5.3"},
            "stock": 150, "is_featured": False, "is_coming_soon": False, "badge": None,
            "rating": 4.3, "review_count": 167, "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()), "name": "Visthar AirPods Pro TWS",
            "description": "True wireless earbuds with hybrid ANC and crystal-clear calls. 32-hour total battery with case.",
            "price": 2499, "original_price": 3499, "category": "Earbuds",
            "image": "https://images.unsplash.com/photo-1677346414290-d337cbc682a6?w=600",
            "images": ["https://images.unsplash.com/photo-1677346414290-d337cbc682a6?w=600"],
            "features": ["Hybrid ANC", "Crystal Clear Calls", "32hr Total Battery", "IPX5", "Touch Controls"],
            "specs": {"driver": "12mm", "battery": "8hr + 24hr case", "anc": "Hybrid", "bluetooth": "5.3"},
            "stock": 100, "is_featured": True, "is_coming_soon": False, "badge": "Best Seller",
            "rating": 4.6, "review_count": 312, "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()), "name": "Visthar EcoBuds TWS",
            "description": "World's first 100% plastic-free TWS earbuds. Premium sound with zero environmental impact.",
            "price": 1999, "original_price": 2999, "category": "Earbuds",
            "image": "https://images.unsplash.com/photo-1677346414290-d337cbc682a6?w=600",
            "images": ["https://images.unsplash.com/photo-1677346414290-d337cbc682a6?w=600"],
            "features": ["100% Plastic-Free", "10mm Bio Drivers", "28hr Battery", "V Green Certified"],
            "specs": {"driver": "10mm Bio", "battery": "7hr + 21hr case", "bluetooth": "5.2"},
            "stock": 70, "is_featured": True, "is_coming_soon": False, "badge": "Eco",
            "rating": 4.4, "review_count": 87, "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "coming-soon-ai-buds", "name": "Visthar AI SmartBuds Pro",
            "description": "Revolutionary AI-powered earbuds with real-time language translation, health monitoring, and adaptive sound.",
            "price": 5999, "original_price": 7999, "category": "Coming Soon",
            "image": "https://static.prod-images.emergentagent.com/jobs/004ef417-6cdd-417a-8441-04bb16074be9/images/98f223321cf2917aefcd789a36aebd0c9d830ccb9a3c4a972d538d4a53df9fea.png",
            "images": [],
            "features": ["AI-Powered Sound", "Real-time Translation", "Health Monitoring", "Adaptive ANC", "40hr Battery"],
            "specs": {"driver": "14mm Custom", "ai_chip": "Visthar V1", "battery": "12hr + 28hr case"},
            "stock": 0, "is_featured": True, "is_coming_soon": True, "badge": "Coming Soon",
            "rating": 0, "review_count": 0, "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "coming-soon-ai-glasses", "name": "Visthar AI Vision Smart Glasses",
            "description": "AI-powered smart glasses for accessibility. Real-time object recognition, navigation assistance for visually impaired users.",
            "price": 14999, "original_price": 19999, "category": "Coming Soon",
            "image": "https://static.prod-images.emergentagent.com/jobs/004ef417-6cdd-417a-8441-04bb16074be9/images/8ed348b667ca9993e00bbaeb1f51b1130b8a6a7e1b764ead89f26b9ea1b564e3.png",
            "images": [],
            "features": ["AI Object Recognition", "Navigation Assist", "Scene Description", "8hr Battery", "Lightweight Frame"],
            "specs": {"camera": "12MP Wide", "ai_chip": "Visthar V2", "battery": "8 hours", "weight": "45g"},
            "stock": 0, "is_featured": True, "is_coming_soon": True, "badge": "Coming Soon",
            "rating": 0, "review_count": 0, "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    await db.products.insert_many(products)
    logger.info(f"Seeded {len(products)} products")

async def seed_reviews():
    count = await db.reviews.count_documents({})
    if count > 0:
        return
    products = await db.products.find({"is_coming_soon": False}, {"_id": 0}).to_list(20)
    names = ["Rahul S.", "Priya M.", "Amit K.", "Sneha R.", "Vikram P."]
    comments = [
        "Absolutely premium quality! The build and performance exceeded my expectations.",
        "Great product for the price. Fast charging and solid build quality.",
        "Love the eco-friendly approach. Finally a tech brand that cares about the planet.",
        "Excellent sound quality and comfortable fit. Battery life is impressive.",
        "The best purchase I have made this year. Highly recommend!"
    ]
    reviews = []
    for product in products:
        for i in range(3):
            reviews.append({
                "id": str(uuid.uuid4()),
                "product_id": product["id"],
                "user_id": str(uuid.uuid4()),
                "user_name": names[i],
                "rating": 5 if i % 2 == 0 else 4,
                "comment": comments[i],
                "created_at": datetime.now(timezone.utc).isoformat()
            })
    if reviews:
        await db.reviews.insert_many(reviews)
        logger.info(f"Seeded {len(reviews)} reviews")

@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.users.create_index("id", unique=True)
    await db.products.create_index("id", unique=True)
    await db.products.create_index("category")
    await db.carts.create_index("user_id", unique=True)
    await db.orders.create_index("user_id")
    await db.orders.create_index("tracking_id")
    await db.reviews.create_index("product_id")
    await db.newsletter.create_index("email", unique=True)
    await seed_admin()
    await seed_products()
    await seed_reviews()
    creds_path = Path("/app/memory/test_credentials.md")
    creds_path.parent.mkdir(parents=True, exist_ok=True)
    admin_email = os.environ.get('ADMIN_EMAIL', 'admin@visthar.com')
    admin_password = os.environ.get('ADMIN_PASSWORD', 'VistharAdmin2024!')
    creds_path.write_text(f"# Test Credentials\n\n## Admin\n- Email: {admin_email}\n- Password: {admin_password}\n- Role: admin\n\n## Auth Endpoints\n- POST /api/auth/register\n- POST /api/auth/login\n- GET /api/auth/me\n- PUT /api/auth/profile\n- POST /api/auth/addresses\n")
    logger.info("Visthar API started successfully")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
