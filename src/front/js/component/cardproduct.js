import React from "react";
import { PlusLg } from "react-bootstrap-icons";
import { Link } from "react-router-dom";
export const CardProduct = ({ 
    image, 
    category, 
    title, 
    price, 
    link, 
    onAddToCart 
}) => (
    <div className="card-product">
        <Link to={link}>
            <img 
                src={image}
                alt={title} 
                className="image-fluid"
            />
        </Link>
        <div className="body-card">
            <small>{category}</small>
            <Link to={link} ><h6>{title}</h6></Link>

            <div className="d-flex justify-content-between">
                <div className="d-flex align-items-center">
                    <span>${price}</span>
                </div>
                <div>
                    <button className="purple-button" onClick={onAddToCart}>
                        <PlusLg style={{fontSize: "14.5px", marginRight: "4px"}}
                    /> 
                        Add
                    </button>
                </div>
            </div>
        </div>
    </div>
)