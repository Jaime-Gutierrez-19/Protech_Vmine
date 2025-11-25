"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, Products, Seller , Comprador,Categoria, ItemCart, Cart, Address, Article
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity, create_access_token
from sqlalchemy import desc, asc, func
import cloudinary 
import cloudinary.uploader
from cloudinary.utils import cloudinary_url
from cloudinary import api
import os
from datetime import datetime


api = Blueprint('api', __name__)    

CORS(api)


UPLOAD_FOLDER = 'path/to/upload/folder'  
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():

    response_body = {
        "message": "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
    }

    return jsonify(response_body), 200

@api.route('/top-categories', methods=['GET'])
def get_top_categories():
    
    results = db.session.query(
        Categoria.name,
        func.sum(ItemCart.amount).label('total_sold')
    ).join(Products, Products.category_id == Categoria.id) \
     .join(ItemCart, ItemCart.product_id == Products.id) \
     .group_by(Categoria.id) \
     .order_by(func.sum(ItemCart.amount).desc()) \
     .all()
    
    top_categories = [{"category": name, "total_sold": total_sold} for name, total_sold in results]

    return jsonify(top_categories), 200

#---------products-----------
@api.route('/products', methods=['GET'])
def get_products():
    try:
        products = Products.query.all()
        if not products:
            return jsonify({"message": "No products available"}), 404
        return jsonify(list(map(lambda product: product.serialize(), products))), 200
    except Exception as e:
        return jsonify({"error": "An error occurred while fetching products"}), 500

@api.route('/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    product = Products.query.get(product_id)
    if product is None:
        return jsonify({"message": "Product not found"}), 404
    return jsonify(product.serialize()), 200

@api.route('/products', methods=['POST'])
@jwt_required()
def add_product():
    new_product_data = request.get_json()
    seller_id = get_jwt_identity()

    print (seller_id)
    if not new_product_data:
        return jsonify({"error": "No data provided for the new product."}), 400

    required_fields = ["name", "description", "price", "stock", "image", "category_id"]
    if not all(field in new_product_data for field in required_fields):
        return jsonify({"error": "Required fields are missing: " + ', '.join(required_fields)}), 400

    category = Categoria.query.get(new_product_data["category_id"])
    if not category:
        return jsonify({"error": "Category not found"}), 404

    if not isinstance(new_product_data["price"], (int, float)) or new_product_data["price"] < 0:
        return jsonify({"error": "The price must be a non-negative integer."}), 400
    
    if not isinstance(new_product_data["stock"], int) or new_product_data["stock"] < 0:
        return jsonify({"error": "The stock must be a non-negative integer."}), 400

    new_product = Products(
        name=new_product_data["name"],
        description=new_product_data["description"],
        price=new_product_data["price"],
        stock=new_product_data["stock"],
        image=new_product_data["image"],
        category_id=new_product_data["category_id"],
        seller_id = seller_id
    )

    db.session.add(new_product)
    db.session.commit()
    return jsonify({"message": "Product successfully added"}), 201

@api.route('/products/<int:product_id>', methods=['PUT'])
@jwt_required()
def update_product(product_id):
    product = Products.query.get(product_id)
    if product is None:
        return jsonify({"error": "Product not found."}), 404

    data = request.get_json()
    if not data:
        return jsonify({"error": "No data has been provided for updating."}), 400

    if 'category_id' in data:
        category = Categoria.query.get(data['category_id'])
        if not category:
            return jsonify({"error": "Category not found"}), 404
        product.category_id = data['category_id']

    if 'stock' in data:
        if not isinstance(data["stock"], int) or data["stock"] < 0:
            return jsonify({"message": "The stock must be a non-negative integer."}), 400
        product.stock = data['stock']

    if 'price' in data:
        if not isinstance(data["price"], (int, float)) or data["price"] < 0:
            return jsonify({"message": "The price must be a non-negative integer."}), 400
        product.price = data['price']

    if 'name' in data:
        product.name = data['name']
    if 'description' in data:
        product.description = data['description']
    if 'image' in data:
        product.image = data['image']

    db.session.commit()
    return jsonify({"message": "Product successfully edited"}), 200

@api.route('/products/<int:product_id>', methods=['DELETE'])
def remove_product(product_id):
    product = Products.query.get(product_id)
    if not product:
        return jsonify({"message": "Product not found"}), 404

    db.session.delete(product)
    db.session.commit()
    return jsonify({"message": "Product successfully removed"}), 200

@api.route('/seller/top-products', methods=['GET'])
@jwt_required()
def get_top_seller_products():
    seller_id = get_jwt_identity()

    products = Products.query.filter_by(seller_id=seller_id).all()

    product_sales = {}

    for product in products:
        items_sold = ItemCart.query.filter_by(product_id=product.id).all()

        total_sold = sum(item.amount for item in items_sold)

        product_sales[product] = total_sold

    top_products = sorted(product_sales.items(), key=lambda x: x[1], reverse=True)[:4]

    top_products_data = [
        {
            "product_name": product.name,
            "total_sold": total_sold
        }
        for product, total_sold in top_products
    ]

    return jsonify(top_products_data), 200

@api.route('/categorias', methods=['GET'])
def get_categorias():

    categorias = Categoria.query.all()

    result = []
    for categoria in categorias:
        product_count = Products.query.filter_by(category_id=categoria.id).count()
        result.append({
            "id": categoria.id,
            "name": categoria.name,
            "product_count": product_count
        })

    return jsonify(result), 200


@api.route('/categorias/<int:categoria_id>', methods=['GET'])
def get_categoria(categoria_id):
    categoria = Categoria.query.get(categoria_id)  
    if not categoria:
        return jsonify({"message": "Categoría no encontrada"}), 404
    return jsonify(categoria.serialize()), 200

@api.route('/categorias', methods=['POST'])
def add_categoria():
    new_categoria_data = request.get_json()
    if not new_categoria_data:
        return jsonify({"error": "No se han proporcionado datos"}), 400

    if "name" not in new_categoria_data:
        return jsonify({"error": "No se ha encontrado el campo name"}), 400

    new_categoria = Categoria(name=new_categoria_data["name"])
    db.session.add(new_categoria)
    db.session.commit()
    
    return jsonify({"message": "Categoría añadida exitosamente"}), 201

@api.route('/categorias/<int:categoria_id>', methods=['PUT'])
def update_categoria(categoria_id):
    categoria = Categoria.query.get(categoria_id)
    if categoria is None:
        return jsonify({"error": "Categoría no encontrada"}), 404

    data = request.get_json()
    if not data:
        return jsonify({"error": "No se han proporcionado datos para actualizar"}), 400

    if 'name' in data:
        categoria.name = data['name']

    db.session.commit()
    return jsonify({"message": "Categoría actualizada exitosamente"}), 200

@api.route('/categorias/<int:categoria_id>', methods=['DELETE'])
def remove_categoria(categoria_id):
    categoria = Categoria.query.get(categoria_id)
    if categoria is None:
        return jsonify({"error": "Categoría no encontrada"}), 404

    db.session.delete(categoria)
    db.session.commit()
    return jsonify({"message": "Categoría eliminada exitosamente"}), 200

#----------------------------------Endpoints de Comprador-------------------------------------------

@api.route('/compradores', methods=['GET'])
def get_compradores():
    compradores = Comprador.query.all()  
    return jsonify([comprador.serialize() for comprador in compradores]), 200  

@api.route('/compradores/<int:comprador_id>', methods=['GET'])
def get_comprador(comprador_id):
    comprador = Comprador.query.get(comprador_id)
    if not comprador:
        return jsonify({"message": "Comprador no encontrado"}), 404  
    return jsonify(comprador.serialize()), 200  

@api.route('/compradores', methods=['POST'])
def add_comprador():
    new_comprador_data = request.get_json() 

    if not new_comprador_data: 
        return jsonify({"error": "No data provided"}), 400  

    required_fields = ["name", "email", "clave", "telefono"]
    if not all(field in new_comprador_data for field in required_fields):
        return jsonify({"error": "Required fields are missing: " + ', '.join(required_fields)}), 400 

    existing_comprador = Comprador.query.filter_by(email=new_comprador_data["email"]).first()
    if existing_comprador:
        return jsonify({"error": "Email is already in use"}), 400 

    new_comprador = Comprador(
        name=new_comprador_data["name"],
        email=new_comprador_data["email"],
        clave=new_comprador_data["clave"],
        image=new_comprador_data["image"],
        telefono=new_comprador_data["telefono"]
    )

    db.session.add(new_comprador)
    db.session.commit()

    return jsonify({"message": "Comprador successfully added"}), 201  

@api.route('/compradores/<int:comprador_id>', methods=['PUT'])
def update_comprador(comprador_id):
    comprador = Comprador.query.get(comprador_id)  

    if comprador is None:
        return jsonify({"error": "Comprador no encontrado"}), 404 

    data = request.get_json()

    if not data: 
        return jsonify({"error": "No data has been provided for updating"}), 400

    if 'name' in data:
        comprador.name = data['name']
    if 'email' in data:
        comprador.email = data['email']
    if 'clave' in data:
        comprador.clave = data['clave']
    if 'telefono' in data:
        comprador.telefono = data['telefono']

    db.session.commit() 

    return jsonify({"message": "Comprador successfully updated"}), 200  

@api.route('/compradores/<int:comprador_id>', methods=['DELETE'])
def remove_comprador(comprador_id):
    comprador = Comprador.query.get(comprador_id) 

    if comprador is None:
        return {"error": "Comprador no encontrado"}, 404 

    db.session.delete(comprador) 
    db.session.commit()  

    return {"message": "Comprador eliminado exitosamente"}, 200  

#-------------------seller----------------------------------------
@api.route('/sellers', methods=['GET'])
def get_sellers():
    sellers = Seller.query.all()
    
    sellers = list(map(lambda seller: seller.serialize(), sellers))
    
    return jsonify(sellers), 200

@api.route('/seller/<int:seller_id>', methods=['GET'])
def get_seller(seller_id):
    seller = Seller.query.get(seller_id)
    if not seller:
        return jsonify({"msg": "Vendedor no encontrado"}), 404
    return jsonify(seller.serialize()), 200

@api.route('/seller/signup', methods=['POST'])
def signup():
    body = request.get_json()

    if not body or not body.get("email") or not body.get("password"):
        return jsonify({"msg": "Email y contraseña son requeridos"}), 400

    seller = Seller.query.filter_by(email=body["email"]).first()

    if seller is not None:
        return jsonify({"msg": "El usuario ya existe"}), 409

    new_seller = Seller(
        email=body["email"],
        password =body["password"],
        phone=body["phone"],
        bank_account=body["bank_account"],
        is_active=True)
     

    db.session.add(new_seller)
    db.session.commit()

    
    return jsonify({"msg": "Usuario creado exitosamente"}), 200


@api.route('/seller/<int:seller_id>', methods=['DELETE'])
def delete_seller(seller_id):
    seller = Seller.query.get(seller_id)
    
    if not seller :
        return jsonify({"msg": "No autorizado o vendedor no encontrado"}), 403

    db.session.delete(seller)
    db.session.commit()
    return jsonify({"msg": "Vendedor eliminado"}), 200

@api.route('/seller/<int:seller_id>', methods=['PUT'])
def update_seller(seller_id):

    seller = Seller.query.get(seller_id)

    if seller is None:
        return jsonify({"error": "vendedor no existe."}), 404

   
    data = request.get_json()

    if not data:
        return jsonify({"error": "No data has been provided for updating."}), 400

   
    if 'email' in data:
        seller.email = data['email']
    if 'password' in data:
        seller.password = data['password']
    if 'phone' in data:
        seller.phone = data['phone']
    if 'bank_account' in data:
        seller.bank_account = data['bank_account']

    db.session.commit()
    
    return jsonify({"msg":"vendedor actualizado"}), 200

@api.route('/orders/recent', methods=['GET'])
@jwt_required()
def get_recent_orders():
    seller_id = get_jwt_identity()  # Obtener el ID del vendedor a través del JWT

    # Obtener las últimas 6 órdenes del vendedor, ordenadas por fecha de creación (más recientes primero)
    recent_orders = Cart.query.join(ItemCart).join(Products).filter(
        Products.seller_id == seller_id  # Filtra los productos por el vendedor
    ).order_by(Cart.created_at.desc()).limit(6).all()

    # Serializar las órdenes
    recent_orders_data = [
        {
            'order_id': cart.id,
            'created_at': cart.created_at.strftime('%Y-%m-%d'),  # Formatear la fecha como texto
            'items': [
                {
                    'product_name': item.product.name,
                    'amount': item.amount,
                    'price': item.product.price,
                    'stock': item.product.stock
                }
                for item in cart.items_cart if item.product.seller_id == seller_id 
            ]
        }
        for cart in recent_orders
    ]

    return jsonify(recent_orders_data), 200

#-------------itemcart-------------------------


@api.route('/itemscarts', methods=['GET'])
def get_itemscarts():
    carts = ItemCart.query.all()
    
    carts = list(map(lambda cart: cart.serialize(), carts))
    
    return jsonify(carts), 200

@api.route('/itemscarts/<int:itemcart_id>', methods=['GET'])
def get_itemcart(itemcart_id):
    item_cart = ItemCart.query.get(itemcart_id)
    if item_cart is None:
        return jsonify({"message": "Product not found"}), 404
    
    return jsonify(item_cart.serialize()), 200

@api.route('/itemscarts', methods=['POST'])
@jwt_required()
def add_itemcart():
    new_item_cart = request.get_json()

    comprador_id = get_jwt_identity()

    if not comprador_id:
        return jsonify({"error": "buyer not found"}), 401
        

    cart = Cart.query.filter_by(comprador_id=comprador_id, state='open').first()

    if not cart:
        cart = Cart(comprador_id=comprador_id, total_price=0, state='open')
        db.session.add(cart)
        db.session.commit()

    if not new_item_cart:
        return jsonify({"error": "No data provided for the new item cart."}), 400

    if "amount" not in new_item_cart:
        return jsonify({"error": "You have to enter an amount"}), 400

    if not isinstance(new_item_cart["amount"], int) or new_item_cart["amount"] < 1:
        return jsonify({"error": "The amount must be a positive integer."}), 400

    product = Products.query.get(new_item_cart["product_id"])
    if not product:
        return jsonify({"error": "The product with the given ID does not exist."}), 404

    existing_item = ItemCart.query.filter_by(cart_id=cart.id).first()

    if existing_item:
        existing_product = Products.query.get(existing_item.product_id)
        if existing_product.seller_id != product.seller_id:
            return jsonify({
                "error": "You can only add products from the same seller to the cart."
            }), 400

    item_exist = ItemCart.query.filter_by(cart_id=cart.id, product_id=product.id).first()

    if item_exist:
        item_exist.amount += new_item_cart["amount"]
        cart.total_price += product.price * new_item_cart["amount"]
    else:
        new_item = ItemCart(
            amount=new_item_cart["amount"],
            product_id=new_item_cart["product_id"],
            cart_id=cart.id
        )
        cart.total_price += product.price * new_item_cart["amount"]
        db.session.add(new_item)

    db.session.commit()

    return jsonify({"message": "Product successfully added to cart", "cart_total": cart.total_price}), 201


@api.route('/itemscarts/<int:itemcart_id>', methods=['DELETE'])
def remove_itemcart(itemcart_id):

    itemcart = ItemCart.query.get(itemcart_id)

    if not itemcart:
        return jsonify({"message":"itemcart no found"}), 404

    db.session.delete(itemcart)
    db.session.commit()
    
    return jsonify({"message": "itemcart successfully removed"}), 200

@api.route('/itemscarts/<int:itemcart_id>', methods=['PUT'])
def update_itemcart(itemcart_id):

    itemcart = ItemCart.query.get(itemcart_id)

    if itemcart is None:
        return jsonify({"error": "itemcart no found."}), 404

    data = request.get_json()

    if not data:
        return jsonify({"error": "No data has been provided for updating."}), 400

    if not isinstance(data["amount"], int) or data["amount"] < 1:
        return jsonify({"message":"The amount must be a non-negative integer."}), 400

    itemcart.amount = data["amount"]
    itemcart.product_id = data["product_id"]
    itemcart.cart_id = data["cart_id"]

    db.session.commit()
    
    return jsonify({"message":"itemcart successfully edited"}), 200

#------------------cart----------------------------------------
@api.route('/cart/<int:cart_id>/generate', methods=['PUT'])
@jwt_required()
def generate_cart(cart_id):

    cart = Cart.query.get(cart_id)

    if cart is None:
        return jsonify({"error": "Cart not found"}), 404

    if cart.state != 'open':
        return jsonify({"error": "The cart is not in an open state"}), 400

    itemscart = ItemCart.query.filter_by(cart_id=cart.id).all()

    if not itemscart or len(itemscart) == 0:
        return jsonify({"error": "The cart is empty"}), 400

    cart.state = 'generated'
    db.session.commit()

    return jsonify({"message": "Cart successfully generated"}), 200

@api.route('/carts/itemscart', methods=['GET'])
@jwt_required()
def get_carts_items():
    buyer_id = get_jwt_identity()

    carts = Cart.query.filter(Cart.comprador_id == buyer_id, Cart.state.in_(['generated', 'sent', 'finalized'])).order_by(Cart.id.desc()).all()
    
    if not carts:
        return jsonify({"message": "No carts found for the buyer."}), 404

    carts_data = []

    for cart in carts:
        cart_items = cart.items_cart.all()

        items = []

        for item in cart_items:
            item_data = {
                "item_id": item.id,
                "amount": item.amount,
                "product": item.product.serialize()
            }
            items.append(item_data)

        formatted_date = cart.created_at.strftime('%Y-%m-%d')
        
        cart_data = {
            "cart_id": cart.id,
            "state": cart.state,
            "created_at": formatted_date,
            "total_price": cart.total_price,
            "items": items
        }
        carts_data.append(cart_data)

    return jsonify(carts_data), 200

@api.route('/buyer/cart/products/<int:item_id>', methods=['PUT'])
@jwt_required()
def update_item_quantity(item_id):
    body = request.get_json()

    if "amount" not in body:
        return jsonify({"msg": "Amount is required"}), 400
    
    new_amount = body["amount"]

    if new_amount <= 0:
        new_amount = 1

    item_cart = ItemCart.query.get(item_id)

    
    if not item_cart:
        return jsonify({"msg": "Item not found"}), 404
    
    cart = Cart.query.filter_by(id=item_cart.cart_id).first()


    item_cart.amount = new_amount

    if "total_price" in body and body["total_price"] is not None:
        cart.total_price = body["total_price"]

    db.session.commit()

    return jsonify({"msg": "Quantity updated successfully", "item": item_cart.serialize()}), 200

@api.route('/carts', methods=['GET'])
def get_carts():
    carts = Cart.query.all()
    carts = list(map(lambda cart: cart.serialize(), carts))
    return jsonify(carts), 200

@api.route('/carts/<int:cart_id>', methods=['GET'])
def get_cart(cart_id):
    cart = Cart.query.get(cart_id)
    if cart is None:
        return jsonify({"message": "Cart not found"}), 404
    return jsonify(cart.serialize()), 200

@api.route("/carts", methods=["POST"])
def create_cart():
    data = request.get_json()
    comprador_id = data.get('comprador_id')
    state = data.get('state')
    
    if Comprador.query.get(comprador_id) is None:
        return jsonify({"message": "Comprador not found"}), 404

    valid_states = {"open", "generated", "sent", "completed", "cancel"}
    if state not in valid_states:
        return jsonify({"error": f"Invalid state. Allowed values are: {', '.join(valid_states)}"}), 400

    total_price = data.get('total_price', 0)
    if not comprador_id or not state:
        return jsonify({"error": "Missing comprador_id or state"}), 400

    new_cart = Cart(
        comprador_id=comprador_id,
        state=state,
        total_price=total_price
    )

    db.session.add(new_cart)
    db.session.commit()

    return jsonify(new_cart.serialize()), 201

@api.route('/carts/<int:cart_id>', methods=['DELETE'])
def remove_cart(cart_id):
    cart = Cart.query.get(cart_id)
    if not cart:
        return jsonify({"message": "Cart not found"}), 404

    db.session.delete(cart)
    db.session.commit()
    return jsonify({"message": "Cart successfully removed"}), 200

@api.route("/carts/<int:cart_id>", methods=["PUT"])
def update_cart(cart_id):
    cart = Cart.query.get(cart_id)
    if cart is None:
        return jsonify({"error": "Cart not found"}), 404

    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided for update"}), 400

    valid_states = {"open", "generated", "sent", "completed"}
    if 'state' in data:
        new_state = data['state']
        if new_state not in valid_states:
            return jsonify({"error": f"Invalid state. Allowed values are: {', '.join(valid_states)}"}), 400
        cart.state = new_state

    if 'total_price' in data:
        new_total_price = data['total_price']
        if not isinstance(new_total_price, int) or new_total_price < 0:
            return jsonify({"error": "Total price must be a positive integer"}), 400
        cart.total_price = new_total_price

    db.session.commit()
    return jsonify(cart.serialize()), 200

@api.route("/buyer/cart/products", methods=["GET"])
@jwt_required()
def get_buyer_cart_products():
    try:
        buyer_id = get_jwt_identity()

        cart = Cart.query.filter_by(comprador_id=buyer_id, state='open').first()
        if not cart:
            cart = Cart(comprador_id=buyer_id, total_price=0, state='open')
            db.session.add(cart)
            db.session.commit()

        items = [
            {
                "item_id": item.id,
                "amount": item.amount,
                "product": item.product.serialize(),
            }
            for item in cart.items_cart.order_by(ItemCart.id.asc()) 
        ]

        response = {
            "cart_id": cart.id,
            "total_price": cart.total_price,
            "state": cart.state,
            "items": items,
        }

        return jsonify(response), 200

    except Exception as e:
        return jsonify({"error": "An error occurred while fetching the cart", "details": str(e)}), 500

@api.route("/buyer/cart/products/<int:item_id>", methods=["DELETE"])
@jwt_required()
def RemoveBuyerCartProducts(item_id):
    buyer_id = get_jwt_identity()

    cart = Cart.query.filter_by(comprador_id=buyer_id, state = "open").first()

    if not cart:
        return jsonify({"error": "No cart found for this buyer."}), 404

    cart_item = ItemCart.query.filter_by(cart_id=cart.id, id=item_id).first()

    if not cart_item:
        return jsonify({"error": "No item found in the cart."}), 404
    
    cart.total_price -= cart_item.product.price * cart_item.amount

    db.session.delete(cart_item)
    db.session.commit()

    return jsonify({"message": "Product removed from cart"}), 200

#------------------LOGINBUYERS---------------

@api.route("/buyer/signup", methods = ['POST'])
def signupBuyer():
    new_comprador_data = request.get_json() 

    if not new_comprador_data: 
        return jsonify({"error": "No data provided"}), 400  
  
    required_fields = ["name", "email", "clave", "telefono"]
    if not all(field in new_comprador_data for field in required_fields):
        return jsonify({"error": "Required fields are missing: " + ', '.join(required_fields)}), 400  

    existing_comprador = Comprador.query.filter_by(email=new_comprador_data["email"]).first()
    if existing_comprador:
        return jsonify({"error": "Email is already in use"}), 400

    new_comprador = Comprador(
        name=new_comprador_data["name"],
        email=new_comprador_data["email"],
        clave=new_comprador_data["clave"],
        telefono=new_comprador_data["telefono"],
        image=new_comprador_data.get("imagen") 
    )

    db.session.add(new_comprador)
    db.session.commit()

    return jsonify({"message": "Comprador successfully added"}), 201


@api.route("/buyer/login", methods=["POST"])
def loginbuyer():
    email = request.json.get("email")
    clave = request.json.get("clave")
    comprador = Comprador.query.filter_by(email = email, clave = clave).first()

    if comprador is None or clave != comprador.clave:
        return jsonify({"msg": "Bad email or password"}), 401

    access_token = create_access_token(identity= comprador.id)

    return jsonify(access_token=access_token), 200

#--------------direccion-----------------------------
@api.route('/address', methods=['POST'])
def create_address():
    data = request.get_json()

    required_fields = ['address', 'lat', 'lon']
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"'{field}' is required"}), 400

    if data.get('comprador_id') and data.get('seller_id'):
        return jsonify({"error": "Address cannot belong to both a buyer and a seller."}), 400

    new_address = Address(
        address=data['address'],
        lat=data['lat'],
        lon=data['lon'],
        comprador_id=data.get('comprador_id'), 
        seller_id=data.get('seller_id')         
    )
    
    db.session.add(new_address)
    db.session.commit()

    return jsonify(new_address.serialize()), 201

@api.route('/addresses', methods=['GET'])
def get_addresses():
    addresses = Address.query.all()

    return jsonify([address.serialize() for address in addresses]), 200

@api.route('/address/<int:id>', methods=['GET'])
def get_address(id):
    address = Address.query.get_or_404(id)
    return jsonify(address.serialize()), 200

@api.route('/address/<int:id>', methods=['PUT'])
def update_address(id):
    data = request.get_json()
    address = Address.query.get_or_404(id)

    address.address = data.get('address', address.address)
    address.lat = float(data.get('lat'))
    address.lon = float(data.get('lon'))
    
    db.session.commit()

    return jsonify(address.serialize()), 200

@api.route('/address/<int:id>', methods=['DELETE'])
def delete_address(id):
    address = Address.query.get_or_404(id)
    db.session.delete(address)
    db.session.commit()

    return jsonify({"message": "Address deleted successfully"}), 200

#---------------------Address------------------------------------------------------------------

# Ruta para obtener todos los artículos
@api.route('/articles', methods=['GET'])
def get_articles():
    articles = Article.query.order_by(Article.id.desc()).all()
    return jsonify([article.serialize() for article in articles]), 200


# Ruta para obtener un artículo por su ID
@api.route('/articles/<int:id>', methods=['GET'])
def get_article(id):
    article = Article.query.get_or_404(id)
    return jsonify(article.serialize()), 200

# Ruta para crear un nuevo artículo
@api.route('/articles', methods=['POST'])
def create_article():
    data = request.get_json()
    title = data.get('title')
    image = data.get('image')
    content = data.get('content')

    if not title or not content:
        return jsonify({"error": "Title and content are required"}), 400

    new_article = Article(
        title=title,
        image=image,
        content=content 
    )
    db.session.add(new_article)
    db.session.commit()

    return jsonify(new_article.serialize()), 201

# Ruta para actualizar un artículo por su ID
@api.route('/articles/<int:id>', methods=['PUT'])
def update_article(id):
    article = Article.query.get_or_404(id)
    data = request.get_json()

    article.title = data.get('title', article.title)
    article.image = data.get('image', article.image)
    article.content = data.get('content', article.content)

    db.session.commit()

    return jsonify(article.serialize()), 200

# Ruta para eliminar un artículo por su ID
@api.route('/articles/<int:id>', methods=['DELETE'])
def delete_article(id):
    article = Article.query.get_or_404(id)

    db.session.delete(article)
    db.session.commit()

    return jsonify({"message": "Article deleted"}), 200

#------------LOGIN SELLERS  ----------------------------------

@api.route('/seller/login', methods=['POST'])
def login():

    email = request.json.get("email", None)
    password = request.json.get("password", None)

    if not email or not password:
        return jsonify({"msg": "Email y contraseña son requeridos"}), 400

    seller = Seller.query.filter_by(email=email, password=password).first()

    if seller is None or password != seller.password:
        return jsonify({"msg": "Email o contraseña incorrectos"}), 401


    access_token = create_access_token(identity=seller.id)
    
    return jsonify(access_token=access_token), 200

@api.route('/seller/reg', methods=['POST'])
def signupSeller():
    new_seller_data = request.get_json()

    if not new_seller_data or not new_seller_data.get("email") or not new_seller_data.get("password") or not new_seller_data.get("phone") or not new_seller_data.get("bank_account"):
        return jsonify({"msg": "Email, contraseña, teléfono y cuenta bancaria son requeridos"}), 400
    
    seller = Seller.query.filter_by(email=new_seller_data["email"]).first()

    if seller is not None:
        return jsonify({"msg": "El usuario ya existe"}), 409

    new_seller = Seller(
        email=new_seller_data["email"],
        name=new_seller_data["name"],
        phone=new_seller_data["phone"],
        bank_account=new_seller_data["bank_account"],
        password=new_seller_data["password"],
        image="https://res.cloudinary.com/dqs1ls601/image/upload/v1731730210/xa8acblb9cpriguyblcv.png",
        is_active=True)
    

    db.session.add(new_seller)
    db.session.commit()

    access_token = create_access_token(identity=new_seller.id)
    
    return jsonify({"msg": "Usuario creado exitosamente", "access_token": access_token}), 200

#---------------------google api--------------------------
@api.route('/address/seller', methods=['POST'])
@jwt_required()
def add_address_seller():
    seller_id = get_jwt_identity()

    address_seller = Address.query.filter_by(seller_id=seller_id).first()
    data = request.get_json()

    name = data.get("name")
    description = data.get("description")
    address = data.get("address")
    lat = data.get("lat")
    
    lon = data.get("lon")

    if lat is None or lon is None or address is None or name is None or description is None:
        return jsonify({"error": "Address, Latitude and Longitude are required"}), 400
    
    if not isinstance(lat, float) or not isinstance(lon, float):
        return jsonify({"error": "Latitude and Longitude must be a float numbers"}), 400

    if not address_seller:
        new_address_seller = Address(address=address, name = name, description = description, lat= float(lat), lon=float(lon), seller_id=seller_id)
        db.session.add(new_address_seller)
    else:
        address_seller.name = name
        address_seller.description = description
        address_seller.address = address
        address_seller.lat = float(lat)
        address_seller.lon = float(lon)

    db.session.commit()

    return jsonify({"message": "Address updated successfully"}), 200

@api.route('/address/seller', methods=['GET'])
@jwt_required()
def get_address_seller():
    seller_id = get_jwt_identity()
    
    seller_address = Address.query.filter_by(seller_id=seller_id).first()

    if not seller_address:
        return jsonify({"error": "No address assigned to this seller"}), 404

    return jsonify(seller_address.serialize()), 200

@api.route('/address/buyer', methods=['POST'])
@jwt_required()
def add_address_buyer():
    buyer_id = get_jwt_identity()

    address_buyer = Address.query.filter_by(comprador_id=buyer_id).first()

    data = request.get_json()
    name = data.get("name")
    description = data.get("description")
    address = data.get("address")
    lat = data.get("lat")
    lon = data.get("lon")

    if lat is None or lon is None or address is None or name is None or description is None:
        return jsonify({"error": "Address, Latitude, Longitude, name and description are required"}), 400
    
    if not isinstance(lat, float) or not isinstance(lon, float):
        return jsonify({"error": "Latitude and Longitude must be numbers"}), 400

    
    if not address_buyer:
        new_address_buyer = Address(address=address, name = name, description = description, lat= float(lat), lon=float(lon), comprador_id=buyer_id)
        db.session.add(new_address_buyer)
    else:
        address_buyer.name = name
        address_buyer.description = description
        address_buyer.address = address
        address_buyer.lat = float(lat)
        address_buyer.lon = float(lon)

    db.session.commit()

    return jsonify({"message": "address added successfully"}), 200

@api.route('/address/buyer', methods=['GET'])
@jwt_required()
def get_address_buyer():
    buyer_id = get_jwt_identity()
    
    get_buyer_address = Address.query.filter_by(comprador_id=buyer_id).first()

    if not get_buyer_address:
        return jsonify({"error": "No address assigned to this buyer"}), 404


    return jsonify(get_buyer_address.serialize()), 200

@api.route('/address/buyer/<int:address_id>', methods=['DELETE'])
@jwt_required()
def delete_address_buyer(address_id):

    address = Address.query.get_or_404(address_id)
    db.session.delete(address)
    db.session.commit()

    return jsonify({"message": "Address deleted successfully"}), 200

#--------Orders------------------------------------------------------
@api.route('/carts/seller', methods=['GET']) 
@jwt_required()
def get_orders_by_seller():
    try:
        seller_id = get_jwt_identity()  
        carts = Cart.query.all()  

        filtered_carts = []
        for cart in carts:
            
            filtered_items = [
                item for item in cart.items_cart if item.product.seller_id == seller_id
            ]

            if filtered_items:
                cart_data = cart.serialize()
              
                cart_data["items_cart"] = [item.serialize() for item in filtered_items]
                filtered_carts.append(cart_data)

        return jsonify(filtered_carts), 200  

    except Exception as e:
        return jsonify({"error": str(e)}), 500  

@api.route('/seller/orders', methods=['GET'])
@jwt_required()
def get_seller_orders():
    seller_id = get_jwt_identity()  # Obtener el ID del vendedor desde el token JWT

    # Obtener todos los carritos en estado 'generated' que contienen productos del vendedor autenticado
    orders = Cart.query.join(ItemCart).join(Products).filter(
        Cart.state == 'generated',
        Products.seller_id == seller_id
    ).order_by(Cart.created_at.desc()).all()

    if not orders:
        return jsonify({"error": "No orders found for this seller."}), 404

    # Serializar y devolver los pedidos del vendedor
    serialized_orders = [
        {
            "cart_id": order.id,
            "state": order.state,
            "created_at": order.created_at.strftime('%Y-%m-%d'),
            "total_price": order.total_price,
            "comprador": order.comprador.serialize(),
            "items": [
                {
                    "item_id": item.id,
                    "amount": item.amount,
                    "product": item.product.serialize()
                } for item in order.items_cart if item.product.seller_id == seller_id
            ]
        } for order in orders
    ]

    return jsonify(serialized_orders), 200

@api.route('/seller/last-order', methods=['GET'])
@jwt_required()
def get_last_order():
    seller_id = get_jwt_identity() 

    order = Cart.query.join(ItemCart).join(Products).filter(
        Cart.state == 'generated',
        Products.seller_id == seller_id
    ).order_by(Cart.id.asc()).first()

    if not order:
        return jsonify({"error": "No orders found."}), 404

    serialized_order = {
        "id": order.id,
        "state": order.state,
        "created_at": order.created_at.strftime('%Y-%m-%d'),
        "total_price": order.total_price,
        "comprador": order.comprador.serialize(),
        "items": [
            {
                "item_id": item.id,
                "amount": item.amount,
                "product": item.product.serialize()
            } for item in order.items_cart if item.product.seller_id == seller_id
        ]
    }

    return jsonify(serialized_order), 200

@api.route('/orders/count', methods=['GET'])
@jwt_required()
def get_orders_count():
    seller_id = get_jwt_identity() 
    current_year = datetime.now().year  
    current_month = datetime.now().month 

    carts = Cart.query.join(ItemCart).join(Products).filter(
        Products.seller_id == seller_id, 
        db.extract('year', Cart.created_at) == current_year,  
        db.extract('month', Cart.created_at) == current_month  
    ).all()

    orders_count = len(carts)

    return jsonify({
        'year': current_year,
        'month': current_month,
        'orders_count': orders_count
    }), 200

@api.route('/customers/count', methods=['GET'])
@jwt_required()
def get_customers_count():
    seller_id = get_jwt_identity()  
    current_year = datetime.now().year
    current_month = datetime.now().month 

    carts = Cart.query.join(ItemCart).join(Products).filter(
        Products.seller_id == seller_id, 
        db.extract('year', Cart.created_at) == current_year,  
        db.extract('month', Cart.created_at) == current_month  
    ).all()

    customers = set(cart.comprador_id for cart in carts)

    customers_count = len(customers)

    return jsonify({
        'year': current_year,
        'month': current_month,
        'customers_count': customers_count
    }), 200

@api.route('/sales/revenue', methods=['GET'])
@jwt_required()
def get_monthly_revenue_by_seller():
    seller_id = get_jwt_identity()

    revenue_by_month = {}

    carts = Cart.query.all()

    for cart in carts:
       
        for item in cart.items_cart:
            if item.product.seller_id == seller_id:
                # 
                total_item_revenue = item.amount * item.product.price

                year = cart.created_at.year
                month = cart.created_at.month

                key = (year, month)

                if key not in revenue_by_month:
                    revenue_by_month[key] = 0

                revenue_by_month[key] += total_item_revenue

    revenue_data = [
        {
            'year': year,
            'month': month,
            'total_revenue': total_revenue
        }
        for (year, month), total_revenue in revenue_by_month.items()
    ]

    return jsonify(revenue_data), 200
    
@api.route('/api/carts/<int:cart_id>', methods=["PUT"])
@jwt_required()  
def change_status(cart_id):
    new_status = request.json.get("state")
    valid_transitions = {
        "generated": "sent",
        "sent": "completed"
    }

    if new_status not in valid_transitions.values():
        return jsonify({"error": "Invalid status"}), 400

    cart = Cart.query.get(cart_id)
    if cart is None:
        return jsonify({"error": "Cart not found"}), 404

    if valid_transitions.get(cart.state) == new_status:
        cart.state = new_status
    elif cart.state == new_status:
        return jsonify({"message": "Order is already in this status"}), 400
    else:
        return jsonify({"error": "Invalid status transition"}), 400

    db.session.commit()
    return jsonify({"message": "Order status updated successfully", "cart": cart.serialize()}), 200

#-------------------Imagen productos---------------------

# Configuration       
cloudinary.config( 
    cloud_name = "dqs1ls601", 
    api_key = "993698731427398", 
    api_secret = "<gIUoJkVUxeDu5tIkkJb9PbD7m7M>", # Click 'View API Keys' above to copy your API secret
    secure=True
)

@api.route('/products/seller', methods=['GET'])
@jwt_required()
def get_products_by_seller():
    try:
        seller_id = get_jwt_identity()

        if not seller_id:
            return jsonify({"error": "Seller ID not found in token"}), 401

        products = Products.query.filter_by(seller_id=seller_id).all()

        if not products:
            return jsonify({"message": "No products found for this seller"}), 404

        serialized_products = [product.serialize() for product in products]

        return jsonify(serialized_products), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api.route('/api/products/<int:product_id>/update-image', methods=['POST'])
def update_product_image(product_id):
    data = request.get_json()
    image_url = data.get('image_url')

    if not image_url:
        return jsonify({"error": "No image URL provided"}), 400

    product = Products.query.get(product_id)
    if not product:
        return jsonify({"error": "Product not found"}), 404

    
    try:
        upload_result = cloudinary.uploader.upload(
            image_url,
            folder="protech_products",
            public_id=f"product_{product_id}"
        )
        product.image = upload_result["secure_url"]
        db.session.commit()
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    return jsonify({"message": "Product image updated successfully", "product": product.serialize()}), 200

@api.route('/products/<int:product_id>/image', methods=['PUT'])
@jwt_required()
def change_product_image(product_id):
    try:
        seller_id = get_jwt_identity()
        product = Products.query.filter_by(id=product_id, seller_id=seller_id).first()

        if not product:
            return jsonify({"error": "Product not found or you don't have permission to update it"}), 404

        if 'image' not in request.files:
            return jsonify({"error": "No image part in the request"}), 400

        file = request.files['image']
        if file.filename == '':
            return jsonify({"error": "No selected file"}), 400

        if file and allowed_file(file.filename):
            filename = f"{product_id}_{file.filename}"
            file_path = os.path.join(UPLOAD_FOLDER, filename)
            file.save(file_path)

            product.image = file_path
            db .session.commit()

            return jsonify({"message": "Product image updated successfully", "product": product.serialize()}), 200

        else:
            return jsonify({"error": "Invalid file type"}), 400

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api.route('/products/image/<int:product_id>', methods=['PUT'])
def modify_product_image(product_id):
    product = Products.query.get(product_id)
    data = request.get_json()

    if 'image' in data:
        product.image = data['image']

    db.session.commit()
    return jsonify({"message": "Product successfully edited"}), 200


#--------------ProfileSeller----------
 # Configuración de Cloudinary
 # Configuration       
cloudinary.config( 
    cloud_name = "dqs1ls601", 
    api_key = "993698731427398", 
    api_secret = "<gIUoJkVUxeDu5tIkkJb9PbD7m7M>", # Click 'View API Keys' above to copy your API secret
    secure=True
)



@api.route('/seller/profile', methods=['GET'])
@jwt_required()
def get_seller_profile():
    seller_id = get_jwt_identity()  
    seller = Seller.query.get(seller_id)
    if not seller:
        return jsonify({"message": "Seller not found"}), 404  
    return jsonify(seller.serialize()), 200


@api.route('/seller/profile/upload-image', methods=['POST'])
@jwt_required()
def upload_profile_seller_image():
    seller_id = get_jwt_identity()
    seller = Seller.query.get(seller_id)
    if not seller:
        return jsonify({"message": "Seller not found"}), 404

    if 'image' not in request.files:
        return jsonify({"message": "No image file found"}), 400

    image_file = request.files['image']
    try:
        upload_result = cloudinary.uploader.upload(image_file, folder="seller_profile_images")
        image_url = upload_result["secure_url"]

        seller.image = image_url
        db.session.commit()

        return jsonify({"message": "Image uploaded successfully", "image": image_url}), 200
    except Exception as e:
        return jsonify({"message": "Error uploading image", "error": str(e)}), 500

@api.route('/seller/profile/image', methods=['PUT'])
@jwt_required()
def modify_profile_seller_image():
    seller_id = get_jwt_identity()
    seller = Seller.query.get(seller_id)

    if not seller:
        return jsonify({"error": "Seller not found"}), 404

    data = request.get_json()

    if 'image' in data:
        seller.image = data['image']
        db.session.commit()
        return jsonify({"message": "Profile image updated successfully", "image": seller.image}), 200

    return jsonify({"error": "No image URL provided"}), 400

@api.route('/seller/profile/edit', methods=['PUT'])
@jwt_required()
def edit_seller_profile():
    seller_id = get_jwt_identity()
    seller = Seller.query.get(seller_id)
    if not seller:
        return jsonify({"message": "Seller not found"}), 404

    data = request.get_json()

    if 'name' in data:
        seller.name = data['name']
    if 'email' in data:
        seller.email = data['email']
    if 'phone' in data:
        seller.phone = data['phone']
    if 'bank_account' in data:
        seller.bank_account = data['bank_account']

    db.session.commit()

    return jsonify({"message": "Profile updated successfully", "seller": seller.serialize()}), 200
##-----------------perfil comprador-----

@api.route('/buyer/profile', methods=['GET'])
@jwt_required()
def get_buyer_profile():
    comprador_id = get_jwt_identity()  
    comprador = Comprador.query.get(comprador_id)
    if not comprador:
        return jsonify({"message": "Comprador no encontrado"}), 404  
    
    return jsonify(comprador.serialize()), 200


@api.route('/buyer/profile/upload-image', methods=['POST'])
@jwt_required()
def upload_profile_image():
    comprador_id = get_jwt_identity()
    comprador = Comprador.query.get(comprador_id)
    if not comprador:
        return jsonify({"message": "Comprador no encontrado"}), 404

    if 'image' not in request.files:
        return jsonify({"message": "No se encontró el archivo de imagen"}), 400

    image_file = request.files['image']
    try:

        upload_result = cloudinary.uploader.upload(image_file, folder="buyer_profile_images")
        image_url = upload_result["secure_url"]

        comprador.image = image_url
        db.session.commit()

        return jsonify({"message": "Imagen subida exitosamente", "image": image_url}), 200
    except Exception as e:
        return jsonify({"message": "Error al subir la imagen", "error": str(e)}), 500

@api.route('/buyer/profile/image', methods=['PUT'])
@jwt_required()
def modify_profile_image():
    comprador_id = get_jwt_identity()
    comprador = Comprador.query.get(comprador_id)

    if not comprador:
        return jsonify({"error": "Comprador no encontrado"}), 404

    data = request.get_json()

    if 'image' in data:
        comprador.image = data['image']
        db.session.commit()
        return jsonify({"message": "Imagen de perfil actualizada exitosamente", "image": comprador.image}), 200

    return jsonify({"error": "No se proporcionó la URL de la imagen"}), 400


@api.route('/buyer/profile/edit', methods=['PUT'])
@jwt_required()
def edit_buyer_profile():
    comprador_id = get_jwt_identity()
    comprador = Comprador.query.get(comprador_id)
    if not comprador:
        return jsonify({"message": "Seller not found"}), 404

    data = request.get_json()

    if 'name' in data:
        comprador.name = data['name']
    if 'email' in data:
        comprador.email = data['email']
    if 'phone' in data:
        comprador.phone = data['phone']
   

    db.session.commit()

    return jsonify({"message": "Profile updated successfully", "seller": comprador.serialize()}), 200