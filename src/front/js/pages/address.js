import React, { useState, useEffect, useContext } from "react";
import { Context } from "../store/appContext";

export const Address = () => {
    const { store, actions } = useContext(Context);

    const [addresses, setAddresses] = useState([]);
    const [address, setAddress] = useState("");
    const [lat, setLat] = useState("");
    const [lon, setLon] = useState("");
    const [activeTab, setActiveTab] = useState("home-tab");
    const [editAddressId, setEditAddressId] = useState(null);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [sellers,setSellers] = useState([])
    const [buyers,setBuyers] = useState([])
    const [buyerId, setBuyerId] = useState(0)
    const [sellerId, setSellerId] = useState(0)

    const getInfo = () => {
        fetch(process.env.BACKEND_URL + "/api/addresses", { method: "GET" })
            .then((response) => response.json())
            .then((data) => setAddresses(data))
            .catch((error) => console.error("Error fetching addresses:", error));

        fetch(process.env.BACKEND_URL + "/api/compradores", { method: "GET" })
            .then((response) => response.json())
            .then((data) => setBuyers(data))
            
            .catch((error) => console.error("Error fetching addresses:", error));

        fetch(process.env.BACKEND_URL + "/api/sellers", { method: "GET" })
            .then((response) => response.json())
            .then((data) => setSellers(data))
            .catch((error) => console.error("Error fetching addresses:", error));

    };

    useEffect(() => {
        getInfo();
    }, []);

    const handleSubmitCreate = (e) => {
        e.preventDefault();
        const newAddress = JSON.stringify({
            "address": address,
            "lat": parseFloat(lat),
            "lon": parseFloat(lon),
            ...(buyerId ? { comprador_id: buyerId } : { seller_id: sellerId })
        });

        fetch(process.env.BACKEND_URL + "/api/address", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: newAddress,
        })
            .then((response) => {
                if (response.ok) {
                    getInfo();
                    resetForm();
                } else {
                    console.error("Error adding address:", response.statusText);
                }
            })
            .catch((error) => console.error("Network error:", error));
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    const getToEditAddress = async (address_id) => {
        try {
            const response = await fetch(`${process.env.BACKEND_URL}/api/address/${address_id}`, { method: "GET" });

            if (!response.ok) throw new Error("Error fetching address details");

            const data = await response.json();
            setActiveTab("edit-tab"); 
            setAddress(data.address);
            setLat(data.lat);
            setLon(data.lon);
            setEditAddressId(address_id);
        } catch (error) {
            console.error("Error fetching address to edit:", error);
        }
    };

    const showAddressDetails = (address) => {
        setSelectedAddress(address);
        setActiveTab("details-tab");
    };

    const handleSubmitEditAddress = async (e) => {
        e.preventDefault();
        const updatedAddress = { address: address, lat: lat, lon: lon };

        try {
            const response = await fetch(`${process.env.BACKEND_URL}/api/address/${editAddressId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedAddress),
            });

            if (!response.ok) throw new Error("Error updating address");

            getInfo();
            resetForm();
        } catch (error) {
            console.error("Error updating address:", error);
        }
    };

    const deleteAddress = (address_id) => {
        if (window.confirm("Are you sure you want to delete this address?")) {
            fetch(`${process.env.BACKEND_URL}/api/address/${address_id}`, { method: "DELETE" })
                .then(response => {
                    if (response.ok) {
                        getInfo(); 
                        alert("Address successfully deleted.");
                    } else {
                        throw new Error(`Error: ${response.statusText}`);
                    }
                })
                .catch(error => console.error("Network error:", error));
        }
    };

    const resetForm = () => {
        setActiveTab("home-tab");
        setAddress("");
        setLat("");
        setLon("");
        setEditAddressId(null);
        setSelectedAddress(null); 
        setBuyerId(0)
        setSellerId(0)
    };

    return (
        <div className="container mt-5">
            <ul className="nav nav-tabs" id="myTab" role="tablist">
                <li className="nav-item" role="presentation">
                    <button
                        className={`nav-link ${activeTab === "home-tab" ? "active" : ""}`}
                        onClick={() => handleTabChange("home-tab")}
                    >
                        Show
                    </button>
                </li>
                <li className="nav-item" role="presentation">
                    <button
                        className={`nav-link ${activeTab === "profile-tab" ? "active" : ""}`}
                        onClick={() => handleTabChange("profile-tab")}
                    >
                        Create
                    </button>
                </li>
                <li className="nav-item" role="presentation">
                    <button
                        className={`nav-link ${activeTab === "edit-tab" ? "active" : ""}`}
                        onClick={() => handleTabChange("edit-tab")}
                    >
                        Edit
                    </button>
                </li>
                <li className="nav-item" role="presentation">
                    <button
                        className={`nav-link ${activeTab === "details-tab" ? "active" : ""}`}
                        onClick={() => handleTabChange("details-tab")}
                    >
                        Details
                    </button>
                </li>
            </ul>

            <div className="tab-content">
                <div className={`tab-pane fade ${activeTab === "home-tab" ? "show active" : ""}`}>
                    <h3>Address List</h3>
                    <ul>
                        {addresses.map((address) => (
                            <li key={address.id}>
                                <p>{address.comprador ? "buyer:": "seller:"} {address.seller ? address.seller : address.comprador} Address: {address.address}, Lat: {address.lat}, Lon: {address.lon}</p>
                                <button onClick={() => getToEditAddress(address.id)} className="btn btn-warning btn-sm mx-2">Edit</button>
                                <button onClick={() => deleteAddress(address.id)} className="btn btn-danger btn-sm">Delete</button>
                                <button onClick={() => showAddressDetails(address)} className="btn btn-info btn-sm mx-2">Show Details</button>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className={`tab-pane fade ${activeTab === "profile-tab" ? "show active" : ""}`}>
                    <h3>Create Address</h3>
                    <form onSubmit={handleSubmitCreate}>
                        <div className="mb-3">
                            <label className="form-label">Address</label>
                            <input type="text" className="form-control" value={address} onChange={(e) => setAddress(e.target.value)} required />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Latitude</label>
                            <input type="number" className="form-control" value={lat} onChange={(e) => setLat(e.target.value)} required />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Longitude</label>
                            <input type="number" className="form-control" value={lon} onChange={(e) => setLon(e.target.value)} required />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="buyer" className="form-label">buyers</label>
                            <select value={buyerId} onChange={(e) => setBuyerId(e.target.value)} className="form-select" id="buyer">
                                <option value="0">Select a buyer</option>
                                {buyers.map((buyer) => (
                                    <option  key={buyer.id} value={buyer.id}>{buyer.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-3">
                            <label htmlFor="seller" className="form-label">sellers</label>
                            <select value={sellerId} onChange={(e) => setSellerId(e.target.value)} className="form-select" id="seller">
                                <option className="``" value="0">Select a seller</option>
                                {sellers.map((seller) => (
                                    <option key={seller.id} value={seller.id}>{seller.name}</option>
                                ))}
                            </select>
                        </div>
                        <button type="submit" className="btn btn-primary">Create</button>
                    </form>
                </div>
                <div className={`tab-pane fade ${activeTab === "edit-tab" ? "show active" : ""}`}>
                    <h3>Edit Address</h3>
                    <form onSubmit={handleSubmitEditAddress}>
                        <div className="mb-3">
                            <label className="form-label">Address</label>
                            <input type="text" className="form-control" value={address} onChange={(e) => setAddress(e.target.value)} required />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Latitude</label>
                            <input type="number" className="form-control" value={lat} onChange={(e) => setLat(e.target.value)} required />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Longitude</label>
                            <input type="number" className="form-control" value={lon} onChange={(e) => setLon(e.target.value)} required />
                        </div>
                        <button type="submit" className="btn btn-primary">Update</button>
                        <button type="button" onClick={resetForm} className="btn btn-secondary mx-2">Cancel</button>
                    </form>
                </div>
                <div className={`tab-pane fade ${activeTab === "details-tab" ? "show active" : ""}`}>
                    <h3>Address Details</h3>
                    {selectedAddress ? (
                        <div>
                            <p><strong>Address:</strong> {selectedAddress.address}</p>
                            <p><strong>Latitude:</strong> {selectedAddress.lat}</p>
                            <p><strong>Longitude:</strong> {selectedAddress.lon}</p>
                            <button onClick={() => setSelectedAddress(null)} className="btn btn-secondary">Back</button>
                        </div>
                    ) : (
                        <p>No address selected.</p>
                    )}
                </div>
            </div>
        </div>
    );
};