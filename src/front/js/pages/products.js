import React, { useState, useEffect, useContext } from "react";
import { Context } from "../store/appContext";

export const Products = () => {
    const { store, actions } = useContext(Context);

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [sellers, setSellers] = useState([]);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState(0);
    const [stock, setStock] = useState(0);
    const [image, setImage] = useState("");
    const [activeTab, setActiveTab] = useState("list-tab");
    const [categoryId, setCategoryId] = useState(0);
    const [sellerId, setSellerId] = useState(0);
    const [editProduct_Id, setEditProduct_Id] = useState(0);
    
    const getProducts = () => {
        fetch(`${process.env.BACKEND_URL}/api/products`, { method: "GET" })
            .then((response) => response.json())
            .then((data) => {
                setProducts(data);
            });
    };

    //checar viewmore
    const getCategories = () => {
        fetch(`${process.env.BACKEND_URL}/api/categorias`)
            .then((response) => response.json())
            .then((data) => {
                setCategories(data);
            });
    };

    const getSellers = () => {
        fetch(`${process.env.BACKEND_URL}/api/sellers`)
            .then((response) => response.json())
            .then((data) => {
                setSellers(data);
            });
    };

    useEffect(() => {
        getProducts();
        getCategories();
        getSellers();
    }, []);




    const cleanFields = () => {
        setName("");
        setDescription("");
        setPrice(0);
        setStock(0);
        setImage("");
        setSellerId(0);
        setCategoryId(0);
    };

    const handleSubmitCreate = (e) => {
        e.preventDefault();
        const raw = JSON.stringify({
            name,
            description,
            price: parseInt(price),
            stock: parseInt(stock),
            image,
            category_id: categoryId,
            seller_id: sellerId,
        });
        fetch(`${process.env.BACKEND_URL}/api/products`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: raw,
        })
            .then(() => {
                getProducts();
                setActiveTab("list-tab");
                cleanFields();
            })
            .catch((error) => console.error(error));
    };

    const deleteProduct = (product_id) => {
        fetch(`${process.env.BACKEND_URL}/api/products/${product_id}`, { method: "DELETE" })
            .then((response) => {
                if (response.ok) {
                    getProducts();
                } else {
                    console.error("Error deleting product:", response.statusText);
                }
            })
            .catch((error) => console.error("Network error:", error));
    };

    const getToEdit = (product_id) => {
        fetch(`${process.env.BACKEND_URL}/api/products/${product_id}`, { method: "GET" })
            .then((response) => response.json())
            .then((data) => {
                setActiveTab("edit-tab");
                setName(data.name);
                setDescription(data.description);
                setPrice(data.price);
                setStock(data.stock);
                setImage(data.image);
                setEditProduct_Id(product_id);
                setCategoryId(data.category.id);
                setSellerId(data.seller.id);
            });
    };

    const handleSubmitEdit = (e) => {
        e.preventDefault();
        const raw = JSON.stringify({
            name,
            description,
            price: parseInt(price),
            stock: parseInt(stock),
            image,
            category_id: categoryId,
            seller_id: sellerId,
        });
        fetch(`${process.env.BACKEND_URL}/api/products/${editProduct_Id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: raw,
        })
            .then(() => {
                getProducts();
                setActiveTab("list-tab");
                cleanFields();
            })
            .catch((error) => console.error(error));
    };

    const viewMore = (product_id) => {
        fetch(`${process.env.BACKEND_URL}/api/products/${product_id}`, { method: "GET" })
            .then((response) => response.json())
            .then((data) => {
                setActiveTab("view-more-tab");
                setName(data.name);
                setDescription(data.description);
                setPrice(data.price);
                setStock(data.stock);
                setImage(data.image);
                setCategoryId(data.category.id);
                setSellerId(data.seller.id);
            });
    };

    
    return (
        <div className="container mt-5">
            <ul className="nav nav-tabs" id="myTab" role="tablist">
                <li className="nav-item" role="presentation">
                    <button
                        className={`nav-link ${activeTab === "list-tab" ? "active" : ""}`}
                        id="list-tab"
                        data-bs-toggle="tab"
                        data-bs-target="#list-tab-pane"
                        type="button"
                        role="tab"
                        aria-controls="list-tab-pane"
                        aria-selected={activeTab === "list-tab"}
                        onClick={() => setActiveTab("list-tab")}
                    >
                        List
                    </button>
                </li>
                <li className="nav-item" role="presentation">
                    <button
                        className={`nav-link ${activeTab === "create-tab" ? "active" : ""}`}
                        id="create-tab"
                        data-bs-toggle="tab"
                        data-bs-target="#create-tab-pane"
                        type="button"
                        role="tab"
                        aria-controls="create-tab-pane"
                        aria-selected={activeTab === "create-tab"}
                        onClick={() => {
                            setActiveTab("create-tab");
                            cleanFields();
                        }}
                    >
                        Create
                    </button>
                </li>
                <li className="nav-item" role="presentation">
                    <button
                        className={`nav-link ${activeTab === "edit-tab" ? "active" : "d-none"}`}
                        id="edit-tab"
                        data-bs-toggle="tab"
                        data-bs-target="#edit-tab-pane"
                        type="button"
                        role="tab"
                        aria-selected={activeTab === "edit-tab"}
                    >
                        Edit
                    </button>
                </li>
                <li className="nav-item" role="presentation">
                    <button
                        className={`nav-link ${activeTab === "view-more-tab" ? "active" : "d-none"}`}
                        id="view-more-tab"
                        data-bs-toggle="tab"
                        data-bs-target="#view-more-tab-pane"
                        type="button"
                        role="tab"
                        aria-selected={activeTab === "view-more-tab"}
                    >
                        View More
                    </button>
                </li>
            </ul>

            <div className="tab-content" id="myTabContent">
                <div className={`tab-pane fade ${activeTab === "list-tab" ? "show active" : ""}`} id="list-tab-pane" role="tabpanel" aria-labelledby="list-tab" tabIndex="0">
                    <table className="table table-bordered">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Actions</th>
                                <th>Name</th>
                                <th>Description</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Image</th>
                                <th>Category</th>
                                <th>Seller</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.length > 0 ? (
                                products.map((product, index) => (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td className="text-center">
                                            <i className="fa-solid fa-newspaper me-3" type="button"  data-bs-toggle="modal" data-bs-target="#exampleModal"></i>
                                            <i className="fas fa-edit me-3" style={{ cursor: "pointer" }} onClick={() => getToEdit(product.id)}></i>
                                            <i className="fas fa-trash me-3" style={{ cursor: "pointer" }} onClick={() => deleteProduct(product.id)}></i>
                                            <i className="fas fa-eye" style={{ cursor: "pointer" }} onClick={() => viewMore(product.id)}></i>
                                        </td>
                                        <td>{product.name}</td>
                                        <td>{product.description}</td>
                                        <td>{product.price}$</td>
                                        <td>{product.stock}</td>
                                        <td>{product.image}</td>
                                        <td>{product.category ? product.category.name : 'N/A'}</td>
                                        <td>{product.seller.name}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8">There are no items in the table.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className={`tab-pane fade ${activeTab === "create-tab" ? "show active" : ""}`} id="create-tab-pane" role="tabpanel" aria-labelledby="create-tab" tabIndex="0">
                    <form className="mt-4 ms-5" onSubmit={handleSubmitCreate}>
                        <div className="mb-3">
                            <label htmlFor="name" className="form-label">Name</label>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="form-control" id="name" />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="description" className="form-label">Description</label>
                            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="form-control" id="description" />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="price" className="form-label">Price</label>
                            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="form-control" id="price" />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="stock" className="form-label">Stock</label>
                            <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} className="form-control" id="stock" />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="image" className="form-label">Image URL</label>
                            <input type="text" value={image} onChange={(e) => setImage(e.target.value)} className="form-control" id="image" />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="category" className="form-label">Category</label>
                            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="form-select" id="category">
                                <option value="0">Select a category</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>{category.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-3">
                            <label htmlFor="seller" className="form-label">Seller</label>
                            <select value={sellerId} onChange={(e) => setSellerId(e.target.value)} className="form-select" id="seller">
                                <option value="0">Choose the seller</option>
                                {sellers.map((seller) => (
                                    <option key={seller.id} value={seller.id}>{seller.name}</option>
                                ))}
                            </select>
                        </div>
                        <button type="submit" className="btn btn-primary">Create Product</button>
                    </form>
                </div>

                <div className={`tab-pane fade ${activeTab === "edit-tab" ? "show active" : ""}`} id="edit-tab-pane" role="tabpanel" aria-labelledby="edit-tab" tabIndex="0">
                    <form className="mt-4 ms-5" onSubmit={handleSubmitEdit}>
                        <div className="mb-3">
                            <label htmlFor="name" className="form-label">Name</label>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="form-control" id="name" />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="description" className="form-label">Description</label>
                            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="form-control" id="description" />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="price" className="form-label">Price</label>
                            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="form-control" id="price" />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="stock" className="form-label">Stock</label>
                            <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} className="form-control" id="stock" />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="image" className="form-label">Image URL</label>
                            <input type="text" value={image} onChange={(e) => setImage(e.target.value)} className="form-control" id="image" />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="category" className="form-label">Category</label>
                            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="form-select" id="category">
                                <option value="0">Select a category</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>{category.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-3">
                            <label htmlFor="seller" className="form-label">Seller</label>
                            <select value={sellerId} onChange={(e) => setSellerId(e.target.value)} className="form-select" id="seller">
                                <option value="0">Choose the seller</option>
                                {sellers.map((seller) => (
                                    <option key={seller.id} value={seller.id}>{seller.name}</option>
                                ))}
                            </select>
                        </div>
                        <button type="submit" className="btn btn-primary">Edit Product</button>
                    </form>
                </div>
                <div className={`tab-pane fade ${activeTab === "view-more-tab" ? "show active" : ""}`} id="view-more-tab-pane" role="tabpanel" aria-labelledby="view-more-tab" tabIndex="0">
                <form className="mt-4 ms-5" onSubmit={handleSubmitEdit}>
                        <div className="mb-3">
                            <label htmlFor="name" className="form-label">Name</label>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="form-control" id="name" />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="description" className="form-label">Description</label>
                            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="form-control" id="description" />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="price" className="form-label">Price</label>
                            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="form-control" id="price" />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="stock" className="form-label">Stock</label>
                            <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} className="form-control" id="stock" />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="image" className="form-label">Image URL</label>
                            <input type="text" value={image} onChange={(e) => setImage(e.target.value)} className="form-control" id="image" />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="category" className="form-label">Category</label>
                            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="form-select" id="category">
                                <option value="0">Select a category</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>{category.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-3">
                            <label htmlFor="seller" className="form-label">Seller</label>
                            <select value={sellerId} onChange={(e) => setSellerId(e.target.value)} className="form-select" id="seller">
                                <option value="0">Choose the seller</option>
                                {sellers.map((seller) => (
                                    <option key={seller.id} value={seller.id}>{seller.name}</option>
                                ))}
                            </select>
                        </div>
                        <button type="submit" className="btn btn-primary">Edit Product</button>
                    </form>
                </div>
            </div>  
        </div>
        
    );
};
