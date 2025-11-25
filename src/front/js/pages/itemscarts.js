import React, {useState, useEffect, useContext} from "react";
import { Context } from "../store/appContext";


export const Itemscarts = () => {
    const {store, actions} = useContext(Context)

    const [itemsCarts, setItemsCarts] = useState([])
    const [amount, setAmount] = useState(0)
    const [product_id, setProduct_id] = useState(0)
    const [cart_id, setCart_id] = useState(0)
    const [activeTab, setActiveTab] = useState("list-tab")
    const [editItemCart_id, setEditItemCarts_id] = useState(0)

    const getItemsCarts = ()=>{
        fetch( process.env.BACKEND_URL + "/api/itemscarts",{ method: "GET"})
        .then((response) => response.json())
        .then((data) => {
            setItemsCarts(data)
        })
    }

    useEffect(() => {
        getItemsCarts();
    }, []);

    const handleSubmitCreate = (e)=>{
        e.preventDefault()

        const raw = JSON.stringify({
            "amount": parseInt(amount),
            "product_id": parseInt(product_id),
            "cart_id": parseInt(cart_id)
        });
        
        const requestOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: raw,
            redirect: "follow"
        };
        
        fetch(process.env.BACKEND_URL + "/api/itemscarts", requestOptions)
        .then((response) => response.json())
        .then((result) => {
            getItemsCarts()
            setActiveTab("list-tab");
            setAmount(0)
        })
        .catch((error) => console.error(error))
    }

    const deleteItemCart = (itemcart_id) => {
        fetch(process.env.BACKEND_URL + `/api/itemscarts/${itemcart_id}`, {method: "DELETE"})
        .then(response => {
            if (response.ok) {
                getItemsCarts();
            } else {
                console.error("Error deleting itemcart:", response.statusText);
            }
        })
        .catch((error) => console.error("Network error:", error));
    }

    const getToEdit = (itemcart_id) => {
        fetch(process.env.BACKEND_URL + `/api/itemscarts/${itemcart_id}`,{ method: "GET"})
        .then((response) => response.json())
        .then((data) => {
            setActiveTab("edit-tab");
            setAmount(data.amount);
            setCart_id(data.cart_id)
            setProduct_id(data.product_id)
            setEditItemCarts_id(itemcart_id);
        })
    }

    const handleSubmitEdit = (e)=>{
        e.preventDefault()

        const raw = JSON.stringify({
            "amount": parseInt(amount),
            "product_id": parseInt(product_id),
            "cart_id": parseInt(cart_id)
        });
        
        const requestOptions = {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: raw,
            redirect: "follow"
        };
        
        fetch(process.env.BACKEND_URL + `/api/itemscarts/${editItemCart_id}`, requestOptions)
        .then((response) => response.text())
        .then((result) => {
            getItemsCarts()
            setActiveTab("list-tab");
            setAmount(0)
            setCart_id(0)
            setProduct_id(0)
        })
        .catch((error) => console.error(error))
    }
    const viewMore = (itemcart_id)=>{
        fetch(process.env.BACKEND_URL + `/api/itemscarts/${itemcart_id}`,{ method: "GET"})
        .then((response) => response.json())
        .then((data) => {
            setActiveTab("view-more-tab");
            setAmount(data.amount);
            setCart_id(data.cart_id)
            setProduct_id(data.product_id)
        })
    }
    return(
        <>
            <div className="container mt-5">
                <ul className="nav nav-tabs" id="myTab" role="tablist">
                    <li className="nav-item" role="presentation">
                        <button
                            className={`nav-link ${activeTab === "list-tab" ? "active" : ""}`}
                            id="list-tab"
                            data-bs-toggle="tab"
                            data-bs-target="#list-tab-pane"
                            type="button" role="tab"
                            aria-controls="list-tab-pane"
                            aria-selected={activeTab === "list-tab"}
                            onClick={() => setActiveTab("list-tab")}
                        >List</button>
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
                            onClick={() => {setActiveTab("create-tab")
                                setAmount(0)}}
                        >Create</button>
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
                        >Edit</button>
                    </li>
                    <li className="nav-item" role="presentation">
                        <button
                            className={`nav-link ${activeTab === "view-more-tab" ? "active" : "d-none"}`}
                            id="edit-tab"
                            data-bs-toggle="tab"
                            data-bs-target="#view-more-tab-pane"
                            type="button"
                            role="tab"
                            aria-selected={activeTab === "view-more-tab"}
                        >View More</button>
                    </li>
                </ul>

                <div className="tab-content" id="myTabContent">
                    <div className={`tab-pane fade ${activeTab === "list-tab" ? "show active" : ""}`} id="list-tab-pane" role="tabpanel" aria-labelledby="list-tab" tabIndex="0">
                        <table className="table table-bordered">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <td></td>
                                    <th>product id</th>
                                    <th>cart id</th>
                                    <th>amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {itemsCarts.length > 0 ?
                                    (itemsCarts.map((itemCart, index) =>(
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td className="text-center">
                                                <i className="fas fa-edit me-3"
                                                style={{cursor:"pointer"}}
                                                onClick={()=> getToEdit(itemCart.id)}>
                                                </i>
                                                <i className="fas fa-trash me-3"
                                                style={{cursor:"pointer"}}
                                                onClick={()=> deleteItemCart(itemCart.id)}>
                                                </i>
                                                <i style={{cursor:"pointer"}}
                                                className="fas fa-eye"
                                                onClick={() => viewMore(itemCart.id)}
                                                ></i>
                                            </td>
                                            <td>{itemCart.product_id}</td>
                                            <td>{itemCart.cart_id}</td>
                                            <td>{itemCart.amount}</td>
                                        </tr>
                                    ))
                                    ):(<tr><td>There are no items in the table.</td></tr>)
                                }
                            </tbody>
                        </table>
                    </div>
                    <div className={`tab-pane fade ${activeTab === "create-tab" ? "show active" : ""}`} id="create-tab-pane" role="tabpanel" aria-labelledby="create-tab" tabIndex="0">
                        <form className="mt-4 ms-5" onSubmit={handleSubmitCreate}>
                            <div className="mb-3">
                                <label htmlFor="product_id" className="form-label">product id</label>
                                <input type="number" value={product_id} onChange={(e) => setProduct_id(e.target.value)} className="form-control" id="product_id"/>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="cart_id" className="form-label">cart id</label>
                                <input type="number" value={cart_id} onChange={(e) => setCart_id(e.target.value)} className="form-control" id="cart_id"/>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="amount" className="form-label">Amount</label>
                                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="form-control" id="amount"/>
                            </div>
                            <button type="submit" className="btn btn-primary">Save</button>
                        </form>
                    </div>
                    <div className={`tab-pane fade ${activeTab === "edit-tab" ? "show active" : ""}`} id="edit-tab-pane" role="tabpanel" aria-labelledby="edit-tab" tabIndex="0">
                        <form className="mt-4 ms-5" onSubmit={handleSubmitEdit}>
                            <div className="mb-3">
                                <label htmlFor="amount" className="form-label">amount</label>
                                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="form-control" id="amount"/>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="product_id" className="form-label">product id</label>
                                <input type="number" value={product_id} onChange={(e) => setProduct_id(e.target.value)} className="form-control" id="product_id"/>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="cart_id" className="form-label">cart id</label>
                                <input type="number" value={cart_id} onChange={(e) => setCart_id(e.target.value)} className="form-control" id="cart_id"/>
                            </div>
                            <button type="submit" className="btn btn-primary">Save</button>
                        </form>
                    </div>

                    <div className={`tab-pane fade ${activeTab === "view-more-tab" ? "show active" : ""}`} id="view-more-tab-pane" role="tabpanel" aria-labelledby="view-more-tab" tabIndex="0">
                    <table className="table table-bordered">
                            <thead>
                                <tr>
                                    <th>Amount</th>
                                    <th>Produc id</th>
                                    <th>Cart id</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>{amount}</td>
                                    <td>{product_id}</td>
                                    <td>{cart_id}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    )

}