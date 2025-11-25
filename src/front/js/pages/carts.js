import React, {useState, useEffect, useContext} from "react";
import { Context } from "../store/appContext";


export const Carts = () => {
    const {store, actions} = useContext(Context)

    const [carts, setCarts] = useState([])
    const [state, setState] = useState("")
    const [totalPrice, setTotalPrice] = useState(0)
    const [buyerId, setbuyerId] = useState(0)
    const [editCartId, setEditCartId] = useState(0)
    const [activeTab, setActiveTab] = useState("list-tab")

    const getCarts = ()=>{
        fetch( process.env.BACKEND_URL + "/api/carts",{ method: "GET"})
        .then((response) => response.json())
        .then((data) => {
            setCarts(data)
        })
    }

    useEffect(() => {
        getCarts();
    }, []);

    const cleanFilds = () =>{
        setState("");
        setTotalPrice(0);
        setbuyerId(0);
    }

    const handleSubmitCreate = (e)=>{
        e.preventDefault()

        const raw = JSON.stringify({
            "comprador_id": parseInt(buyerId),
            "state": state,
            "total_price": parseInt(totalPrice),
        });
        
        const requestOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: raw,
            redirect: "follow"
        };
        
        fetch(process.env.BACKEND_URL + "/api/carts", requestOptions)
        .then((response) => response.text())
        .then((result) => {
            getCarts()
            setActiveTab("list-tab");
            cleanFilds()
        })
        .catch((error) => console.error(error))
    }

    const deleteCart = (cart_id) => {
        fetch(process.env.BACKEND_URL + `/api/carts/${cart_id}`, {method: "DELETE"})
        .then(response => {
            if (response.ok) {
                getCarts();
            } else {
                console.error("Error deleting cart:", response.statusText);
            }
        })
        .catch((error) => console.error("Network error:", error));
    }

    const getToEdit = (cart_id) => {
        fetch(process.env.BACKEND_URL + `/api/carts/${cart_id}`,{ method: "GET"})
        .then((response) => response.json())
        .then((data) => {
            setActiveTab("edit-tab");
            setState(data.state);
            setTotalPrice(data.total_price);
            setEditCartId(cart_id);
        })
    }

    const handleSubmitEdit = (e)=>{
        e.preventDefault()

        const raw = JSON.stringify({
            "state": state,
            "total_price": parseInt(totalPrice),
        });
        
        const requestOptions = {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: raw,
            redirect: "follow"
        };
        
        fetch(process.env.BACKEND_URL + `/api/carts/${editCartId}`, requestOptions)
        .then((response) => response.text())
        .then((result) => {
            getCarts()
            setActiveTab("list-tab");
            cleanFilds()
        })
        .catch((error) => console.error(error))
    }
    const viewMore = (cart_id)=>{
        fetch(process.env.BACKEND_URL + `/api/carts/${cart_id}`,{ method: "GET"})
        .then((response) => response.json())
        .then((data) => {
            setActiveTab("view-more-tab");
            setState(data.state);
            setTotalPrice(data.total_price);
            setbuyerId(data.comprador_id);
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
                                cleanFilds()}}
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
                                    <th>buyer id</th>
                                    <th>Total price</th>
                                    <th>state</th>
                                </tr>
                            </thead>
                            <tbody>
                                {carts.length > 0 ?
                                    (carts.map((cart, index) =>(
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td className="text-center">
                                                <i className="fas fa-edit me-3"
                                                style={{cursor:"pointer"}}
                                                onClick={()=> getToEdit(cart.id)}>
                                                </i>
                                                <i className="fas fa-trash me-3"
                                                style={{cursor:"pointer"}}
                                                onClick={()=> deleteCart(cart.id)}>
                                                </i>
                                                <i style={{cursor:"pointer"}}
                                                className="fas fa-eye"
                                                onClick={() => viewMore(cart.id)}
                                                ></i>
                                            </td>
                                            <td>{cart.comprador_id}</td>
                                            <td>{cart.total_price}$</td>
                                            <td>{cart.state}</td>
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
                                <label htmlFor="buyerId" className="form-label">Buyer id</label>
                                <input type="text" value={buyerId} onChange={(e) => setbuyerId(e.target.value)} className="form-control" id="buyerId"/>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="state" className="form-label">State</label>
                                <input type="text" value={state} onChange={(e) => setState(e.target.value)} className="form-control" id="state"/>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="totalPrice" className="form-label">Total price</label>
                                <input type="text" value={totalPrice} onChange={(e) => setTotalPrice(e.target.value)} className="form-control" id="totalPrice"/>
                            </div>
                            <button type="submit" className="btn btn-primary">Save</button>
                        </form>
                    </div>

                    <div className={`tab-pane fade ${activeTab === "edit-tab" ? "show active" : ""}`} id="edit-tab-pane" role="tabpanel" aria-labelledby="edit-tab" tabIndex="0">
                        <form className="mt-4 ms-5" onSubmit={handleSubmitEdit}>
                            <div className="mb-3">
                                <label htmlFor="state" className="form-label">Description</label>
                                <input type="text" value={state} onChange={(e) => setState(e.target.value)} className="form-control" id="state"/>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="totalPrice" className="form-label">Price</label>
                                <input type="text" value={totalPrice} onChange={(e) => setTotalPrice(e.target.value)} className="form-control" id="totalPrice"/>
                            </div>
                            <button type="submit" className="btn btn-primary">Save</button>
                        </form>
                    </div>

                    <div className={`tab-pane fade ${activeTab === "view-more-tab" ? "show active" : ""}`} id="view-more-tab-pane" role="tabpanel" aria-labelledby="view-more-tab" tabIndex="0">
                    <table className="table table-bordered">
                            <thead>
                                <tr>
                                    <th>Buyer Id</th>
                                    <th>State</th>
                                    <th>Total Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>{buyerId}</td>
                                    <td>{state}</td>
                                    <td>{totalPrice}$</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    )

}