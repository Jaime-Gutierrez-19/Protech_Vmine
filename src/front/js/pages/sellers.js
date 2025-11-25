import React, { useState, useEffect } from "react";

export const Sellers = () => {
    const [sellers, setSellers] = useState([]);
    const [activeTab, setActiveTab] = useState("list-tab");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [bankAccount, setBankAccount] = useState("");
    const [selectedSellerId, setSelectedSellerId] = useState(null);

    const getSellers = () => {
        fetch(process.env.BACKEND_URL + "/api/sellers", { method: "GET" })
            .then((response) => response.json())
            .then((data) => setSellers(data))
            .catch((error) => console.log("Error fetching sellers: ", error));
    };

    useEffect(() => {
        getSellers();
    }, []);

    const createSeller = () => {
        fetch(`${process.env.BACKEND_URL}/api/seller/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, phone, bank_account: bankAccount, password }),
        })
            .then((response) => response.json())
            .then(() => {
                resetForm();
                getSellers();
            })
            .catch((error) => console.error("Error al crear el vendedor: ", error));
    };

    const updateSeller = () => {
        fetch(`${process.env.BACKEND_URL}/api/seller/${selectedSellerId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, phone,bank_account: bankAccount, password }),
        })
            .then((response) => response.json())
            .then(() => {
                resetForm();
                getSellers();
            })
            .catch((error) => console.error("Error al actualizar el vendedor: ", error));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (selectedSellerId) {
            updateSeller();
        } else {
            createSeller();
        }
    };

    const handleDelete = (id) => {
        fetch(`${process.env.BACKEND_URL}/api/seller/${id}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
        })
            .then(() => setSellers((prev) => prev.filter((seller) => seller.id !== id)))
            .catch((error) => console.log("Error eliminando vendedor: ", error));
    };

    const resetForm = () => {
        setEmail("");
        setPhone("");
        setBankAccount("");
        setPassword("");
        setSelectedSellerId(null);
        setActiveTab("create-tab");
    };

    const viewSellerDetails = (seller) => {
        setEmail(seller.email);
        setPhone(seller.phone);
        setBankAccount(seller.bank_account);
        setPassword(seller.password);
        setSelectedSellerId(seller.id);
        setActiveTab("create-tab");
    };

    return (
        <div className="container">
            <ul className="nav nav-tabs" id="myTab" role="tablist">
                <li className="nav-item" role="presentation">
                    <button
                        className={`nav-link ${activeTab === "list-tab" ? "active" : ""}`}
                        id="list-tab"
                        data-bs-toggle="tab"
                        type="button"
                        role="tab"
                        aria-controls="list-tab-pane"
                        aria-selected={activeTab === "list-tab"}
                        onClick={() => setActiveTab("list-tab")}
                    >
                        Lista
                    </button>
                </li>
                <li className="nav-item" role="presentation">
                    <button
                        className={`nav-link ${activeTab === "create-tab" ? "active" : ""}`}
                        id="create-tab"
                        data-bs-toggle="tab"
                        type="button"
                        role="tab"
                        aria-controls="create-tab-pane"
                        aria-selected={activeTab === "create-tab"}
                        onClick={resetForm}
                    >
                        Crear
                    </button>
                </li>
            </ul>

            <div className="tab-content" id="myTabContent">
                <div
                    className={`tab-pane fade ${activeTab === "list-tab" ? "show active" : ""}`}
                    id="list-tab-pane"
                    role="tabpanel"
                    aria-labelledby="list-tab"
                >
                    <h1>Lista de Vendedores</h1>
                    <ul className="list-group">
                        {sellers.length > 0 ? (
                            sellers.map((seller) => (
                                <li key={seller.id} className="list-group-item d-flex justify-content-between align-items-center">
                                    <div>
                                        <strong>Email:</strong> {seller.email} <br />
                                        <strong>Teléfono:</strong> {seller.phone} <br />
                                    </div>
                                    <div>
                                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(seller.id)}>
                                            Eliminar
                                        </button>
                                        <button className="btn btn-primary btn-sm" onClick={() => viewSellerDetails(seller)}>
                                            Editar/Detalle
                                        </button>
                                    </div>
                                </li>
                            ))
                        ) : (
                            <li className="list-group-item">No hay vendedores disponibles</li>
                        )}
                    </ul>
                </div>

                <div
                    className={`tab-pane fade ${activeTab === "create-tab" ? "show active" : ""}`}
                    id="create-tab-pane"
                    role="tabpanel"
                    aria-labelledby="create-tab"
                >
                    <h1>{selectedSellerId ? "Modificar Vendedor" : "Crear Nuevo Vendedor"}</h1>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label htmlFor="email" className="form-label">Email</label>
                            <input
                                type="email"
                                className="form-control"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="phone" className="form-label">Teléfono</label>
                            <input
                                type="text"
                                className="form-control"
                                id="phone"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="bank_account" className="form-label">Cuenta Bancaria</label>
                            <input
                                type="text"
                                className="form-control"
                                id="bank_account"
                                value={bankAccount}
                                onChange={(e) => setBankAccount(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="password" className="form-label">Contraseña</label>
                            <input
                                type="password"
                                className="form-control"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <button type="submit" className="btn btn-primary">
                            {selectedSellerId ? "Actualizar Vendedor" : "Crear Vendedor"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
