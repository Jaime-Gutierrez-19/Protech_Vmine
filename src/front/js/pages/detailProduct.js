import React, { useEffect, useContext, useState, useRef } from "react";
import { Context } from "../store/appContext";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import "../../styles/detailProduct.css";
import { CardProduct } from "../component/cardproduct";
import { Cart3, CurrencyDollar } from "react-bootstrap-icons";

export const DetailProduct = () => {
    const { store, actions } = useContext(Context);
    const { productId } = useParams();
    const [product, setProduct] = useState();
    const [products, setProducts] = useState([]);
    const [activeTab, setActiveTab] = useState("details");
    const [amount, setAmount] = useState(1);
    const navigate = useNavigate();

    const handleTabClick = (tabName) => {
        setActiveTab(tabName);
    };


    useEffect(() => {
        getProduct()
    }, [productId]);

    useEffect(() => {
        getProductsRelated()
    }, [product]);

    const getProduct = () => {

        fetch(`${process.env.BACKEND_URL}/api/products/${productId}`, {
            method: "GET",
        })
        .then((response) => {
            if (!response.ok) {
                throw new Error("Error fetching product: " + response.statusText);
            }
            return response.json();
        })
        .then((data) => {            
            setProduct(data)
        })
        .catch((error) => {
            console.error("Error fetching cart items:", error);
        });
    };

    const getProductsRelated = () => {
        if (!product || !product.category) {
            console.warn("Product or product category is not defined yet.");
            return;
        }
        fetch(process.env.BACKEND_URL + "/api/products", { method: "GET" })
            .then((response) => response.json())
            .then((data) => {
                const relatedProducts = data.filter(
                    (item) => item?.category?.name === product.category.name && item.id !== product.id
                );
                setProducts(relatedProducts);
            })
    };


    return (
        <div className="container white-text">
            <div className="ProductDetail container">
                {product ? (
                    <div className="row">
                        <div className="col-md-6">
                            <div>
                                <img 
                                    src={product.image || "https://res.cloudinary.com/dqs1ls601/image/upload/v1731200142/qjox25ajspnkngowrjpk.jpg"} 
                                    className="card-img-top" 
                                    alt={product.name} 
                                />
                            </div>
                        </div>
                        <div className="ps-lg-5 col-md-6 product-info">
                            <a>{product.category.name}</a>
                            <h1>{product.name}</h1>
                            <h2 className="align-middle">${(product.price).toFixed(2)}</h2>
                            
                            <hr />

                            <div className="input-group">
                                <button style={{borderTopLeftRadius: "5px", borderBottomLeftRadius: "5px", margin: "0px"}}
                                    className="button-input"
                                    onClick={() =>
                                        setAmount(amount - 1)
                                    }
                                    disabled={amount === 1}
                                    >
                                        -
                                </button>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e)=> setAmount(e.target.value)}
                                    className="input-amount text-center"
                                    min="1"
                                    />
                                <button style={{borderEndEndRadius: "5px", borderTopRightRadius: "5px"}}
                                    className="button-input"
                                    onClick={() =>
                                        setAmount(amount + 1)
                                    }
                                    >
                                        +
                                </button>
                            </div>
                            <button
                                className="add-cart"
                                onClick={()=>{actions?.addToCart(productId,amount)}}
                                >
                                    <Cart3 className="cart"/> Add to Cart
                            </button>
                            <hr />
                                <span><strong>Availability:</strong> In Stock</span>
                        </div>
                    </div>
                ) : (
                    <p>Loading...</p>
                )}
            </div>

            <div className="ProductDetail">
                <ul className="nav nav-underline">
                    <li className="nav-item">
                        <button
                            className={`nav-link ${activeTab === "details" ? "active" : ""}`}
                            onClick={() => handleTabClick("details")}
                        >
                            Product details
                        </button>
                    </li>
                    <li className="nav-item">
                        <button
                            className={`nav-link ${activeTab === "information" ? "active" : ""}`}
                            onClick={() => handleTabClick("information")}
                        >
                            Information
                        </button>
                    </li>
                    <li className="nav-item">
                        <button
                            className={`nav-link ${activeTab === "seller" ? "active" : ""}`}
                            onClick={() => handleTabClick("seller")}
                        >
                            Seller Information
                        </button>
                    </li>
                </ul>

                <div className="tab-content product-details">
                    {activeTab === "details" && (
                        <div>
                            <h3>Product Details</h3>
                            {product ? (
                                <div style={{ display: "flex", alignItems: "center" }}>

                                    <div style={{ flex: 2 }}>
                                        <p>Category: {product.category.name}</p>
                                        <p>Name: {product.name}</p>
                                        <p>Price: ${product.price.toFixed(2)}</p>                                    
                                    </div>
                                </div>
                            ) : (
                                <></>
                            )}
                        </div>
                    )}
                    {activeTab === "information" && (
                        <div>
                            <h3>Additional Information</h3>
                            <p>{product.description}</p>
                        </div>
                    )}
                    {activeTab === "seller" && (
                        <div>
                            <h3>Seller Information</h3>
                            {product ? (
                                <div style={{ display: "flex", alignItems: "center" }}>
                                    <div style={{ flex: 2 }}>
                                        <p>Name: {product.seller.name}</p>
                                        <p>Email: {product.seller.email}</p>
                                    </div>
                                </div>
                            ) : (
                                <></>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <h3 style={{marginTop: "100px", marginBottom: "20px"}}>Related items</h3>
            <div className="g-4 row row-cols-lg-4 row-cols-xl-5 row-cols-md-3 row-cols-2 pb-5">
                {products.length > 0 ? (products.slice(0,5).map((product)=> (
                    <div key={product.id} className="col">
                        <CardProduct
                            image= {product.image}
                            category={product.category.name}
                            title={product.name}
                            price={product.price.toFixed(2)}
                            link={`/detail/${product.id}`}
                            onAddToCart={()=>actions.addToCart(product.id)}
                        />
                    </div>
                ))):(<></>)}
            </div>
        </div>
    );
};
