from flask_sqlalchemy import SQLAlchemy
from datetime import date

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(80), unique=False, nullable=False)
    is_active = db.Column(db.Boolean(), unique=False, nullable=False)

    def __repr__(self):
        return f'<User {self.email}>'

    def serialize(self):
        return {
            "id": self.id,
            "email": self.email,
        }
    
class Products(db.Model):
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), unique=False, nullable=False)
    description = db.Column(db.String(1000), unique=False, nullable=False)
    price = db.Column(db.Integer, unique=False, nullable=False)
    stock = db.Column(db.Integer, unique=False, nullable=False)
    image = db.Column(db.String(500), unique=False, nullable=False)
  
    category_id= db.Column(db.Integer, db.ForeignKey("categoria.id"), unique=False, nullable=False)
    categoria = db.relationship("Categoria", back_populates="products")
    items_cart = db.relationship('ItemCart', back_populates='product')

    seller_id= db.Column(db.Integer, db.ForeignKey("seller.id"), unique=False, nullable=False)
    seller = db.relationship("Seller", back_populates="products")
 

    def __repr__(self): 
        return f'<Products {self.name}>'

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "price": self.price,
            "stock": self.stock,
            "image": self.image,
            "category_id": self.category_id ,
            "category": self.categoria.serialize() if self.categoria else None, 
            "seller_id": self.seller_id,
            "seller": self.seller.serialize() if self.seller else None
        }
    
class Categoria(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), unique=False, nullable=False)
    products = db.relationship("Products", back_populates="categoria", lazy="dynamic")
    
    
    def __repr__(self):
        return f'<Categoria {self.name}>'
    
    def serialize(self):
        return {
            "id": self.id,
            "name": self.name
        }

class Seller(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), unique=False, nullable=False)
    email = db.Column(db.String(120), nullable=False)
    password = db.Column(db.String(80), unique=False, nullable=False)
    phone = db.Column(db.String(80), unique=False, nullable=False)
    bank_account = db.Column(db.String(120), unique=False, nullable=True)
    is_active = db.Column(db.Boolean(), unique=False, nullable=False)
    image = db.Column(db.String(255), unique=False, nullable=True)


    address = db.relationship('Address', back_populates='seller', uselist=True)

    products = db.relationship("Products", back_populates="seller") 
    
    def __repr__(self):
        return f'<Seller {self.email}>'

    def serialize(self):
        return {
            "id": self.id,
            "email": self.email,
            "name": self.name,
            "phone" : self.phone,
            "image": self.image,
            "bank_account": self.bank_account,
        }
    
class Comprador(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), unique=False, nullable=False)
    email = db.Column(db.String(120), unique=False, nullable=False)
    clave = db.Column(db.String(80), unique=False, nullable=False)
    telefono = db.Column(db.String(80), unique=False, nullable=False)
    image = db.Column(db.String(500), unique=False, nullable=True)

    carts = db.relationship("Cart", back_populates="comprador", lazy="dynamic")
    addresses = db.relationship('Address', back_populates='comprador', lazy="dynamic")

    def __repr__(self):
        return f'<Comprador {self.name}>'

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "image": self.image,
            "telefono": self.telefono,
            "address": [address.serialize() for address in self.addresses]
        }

class ItemCart(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Integer, unique=False, nullable=False)

    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    product = db.relationship("Products", back_populates="items_cart")

    cart_id = db.Column(db.Integer, db.ForeignKey('cart.id'), nullable=False)
    carts = db.relationship("Cart", back_populates="items_cart")

    def __repr__(self):
        return f'<ItemCart {self.amount}>'

    def serialize(self):
        return {
            "id": self.id,
            "amount": self.amount,
            "cart_id": self.cart_id,
            "product_id": self.product_id,
            "product": self.product.serialize()
        }

class Cart(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    state = db.Column(db.String(20), default="open", nullable=False)
    created_at = db.Column(db.Date, default=date.today, unique=False, nullable=False)
    total_price = db.Column(db.Integer, unique=False, nullable=False)

    items_cart = db.relationship("ItemCart", back_populates="carts", lazy="dynamic")

    comprador_id = db.Column(db.Integer, db.ForeignKey('comprador.id'), nullable=False)
    comprador = db.relationship("Comprador", back_populates="carts")

    def __repr__(self):
        return f'<Cart {self.id}>'

    def serialize(self):
        return {
            "id": self.id,
            "state": self.state,
            "created_at": self.created_at.strftime('%Y-%m-%d'),
            "total_price": self.total_price,
            "comprador": self.comprador.serialize(),
            "items": [item.serialize() for item in self.items_cart]
        }
    
class Address(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), unique=False, nullable=False)
    description = db.Column(db.String(200), unique=False, nullable=False)
    address = db.Column(db.String(120), unique=False, nullable=False)
    lat = db.Column(db.Float, unique=False, nullable=False) 
    lon = db.Column(db.Float, unique=False, nullable=False)  

    comprador_id = db.Column(db.Integer, db.ForeignKey('comprador.id'), nullable=True)
    comprador = db.relationship('Comprador', back_populates='addresses')

    seller_id = db.Column(db.Integer, db.ForeignKey('seller.id'), unique=True, nullable=True)
    seller = db.relationship('Seller', back_populates='address', uselist=False)

    def __repr__(self):
        return f'<Address {self.address}>'

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "address": self.address,
            "lat": self.lat,
            "lon": self.lon,
            "seller_id": self.seller_id if self.seller_id else None,
            "comprador_id": self.comprador_id if self.comprador_id else None,
            "seller": self.seller.name if self.seller else None,
            "comprador": self.comprador.name if self.comprador else None
        }
    
class Article(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(300), unique=False, nullable=False)
    image = db.Column(db.String(500), unique=False, nullable=True)
    content = db.Column(db.String(1500), unique=False, nullable=False)
    created_at = db.Column(db.Date, default=date.today, unique=False, nullable=False)

    def __repr__(self):
        return f'<Article {self.id}>'

    def serialize(self):
        return {
            "id": self.id,
            "title": self.title,
            "created_at": self.created_at.strftime('%Y-%m-%d'),
            "image": self.image,
            "content": self.content,
        }