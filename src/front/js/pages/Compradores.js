import React, { useState, useEffect, useContext } from "react";
import { Context } from "../store/appContext";

export const Compradores = () => {
    const { store, actions } = useContext(Context);

    const [compradores, setCompradores] = useState([]);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [clave, setClave] = useState("");
    const [telefono, setTelefono] = useState("");
    const [activeTab, setActiveTab] = useState("home-tab");
    const [editComprador_Id, setEditComprador_Id] = useState(null); // Estado para el ID del comprador a editar
    const [selectedComprador, setSelectedComprador] = useState(null); // Estado para el comprador seleccionado

    const getCompradores = () => {
        fetch(process.env.BACKEND_URL + "/api/compradores/", { method: "GET" })
            .then((response) => response.json())
            .then((data) => setCompradores(data))
            .catch((error) => console.error("Error fetching compradores:", error));
    };

    useEffect(() => {
        getCompradores();
    }, []);

    const handleSubmitCreate = (e) => {
        e.preventDefault();
        const raw = JSON.stringify({ name, email, clave, telefono });

        fetch(process.env.BACKEND_URL + "/api/compradores", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: raw,
        })
            .then((response) => {
                if (response.ok) {
                    getCompradores();
                    resetForm();
                } else {
                    console.error("Error adding comprador:", response.statusText);
                }
            })
            .catch((error) => console.error("Network error:", error));
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    const getToEditComprador = async (comprador_id) => {
        try {
            const response = await fetch(`${process.env.BACKEND_URL}/api/compradores/${comprador_id}`, { method: "GET" });

            if (!response.ok) throw new Error("Error fetching comprador details");

            const data = await response.json();
            setActiveTab("edit-tab"); // Cambia a la pestaña de edición
            setName(data.name);
            setEmail(data.email);
            setClave(data.clave);
            setTelefono(data.telefono);
            setEditComprador_Id(comprador_id); // Establece el ID del comprador a editar
        } catch (error) {
            console.error("Error fetching comprador to edit:", error);
        }
    };

    const showCompradorDetails = (comprador) => {
        setSelectedComprador(comprador);
        setActiveTab("details-tab"); // Cambia a la pestaña de detalles
    };

    const handleSubmitEditComprador = async (e) => {
        e.preventDefault();
        const updatedComprador = { name, email, clave, telefono };

        try {
            const response = await fetch(`${process.env.BACKEND_URL}/api/compradores/${editComprador_Id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedComprador),
            });

            if (!response.ok) throw new Error("Error updating comprador");

            await getCompradores();
            resetForm();
        } catch (error) {
            console.error("Error updating comprador:", error);
        }
    };

    const deleteCompradores = (comprador_id) => {
        if (window.confirm("¿Estás seguro de que deseas eliminar este comprador?")) {
            fetch(`${process.env.BACKEND_URL}/api/compradores/${comprador_id}`, { method: "DELETE" })
                .then(response => {
                    if (response.ok) {
                        getCompradores(); // Recarga la lista de compradores
                        alert("Comprador eliminado exitosamente.");
                    } else {
                        throw new Error(`Error: ${response.statusText}`);
                    }
                })
                .catch(error => console.error("Network error:", error));
        }
    };

    const resetForm = () => {
        setActiveTab("home-tab");
        setName("");
        setEmail("");
        setClave("");
        setTelefono("");
        setEditComprador_Id(null); // Resetear el ID del comprador a editar
        setSelectedComprador(null); // Resetear el comprador seleccionado
    };

    return (
        <div className="container mt-5">
            <ul className="nav nav-tabs" id="myTab" role="tablist">
                <li className="nav-item" role="presentation">
                    <button
                        className={`nav-link ${activeTab === "home-tab" ? "active" : ""}`}
                        id="home-tab"
                        onClick={() => handleTabChange("home-tab")}
                        type="button"
                        role="tab"
                        aria-controls="home-tab-pane"
                        aria-selected={activeTab === "home-tab"}
                    >
                        Mostrar
                    </button>
                </li>
                <li className="nav-item" role="presentation">
                    <button
                        className={`nav-link ${activeTab === "profile-tab" ? "active" : ""}`}
                        id="profile-tab"
                        onClick={() => handleTabChange("profile-tab")}
                        type="button"
                        role="tab"
                        aria-controls="profile-tab-pane"
                        aria-selected={activeTab === "profile-tab"}
                    >
                        Crear
                    </button>
                </li>
                <li className="nav-item" role="presentation">
                    <button
                        className={`nav-link ${activeTab === "details-tab" ? "active" : ""}`}
                        id="details-tab"
                        onClick={() => handleTabChange("details-tab")}
                        type="button"
                        role="tab"
                        aria-controls="details-tab-pane"
                        aria-selected={activeTab === "details-tab"}
                    >
                        Detalles
                    </button>
                </li>
            </ul>

            <div className="tab-content" id="myTabContent">
                <div className={`tab-pane fade ${activeTab === "home-tab" ? "show active" : ""}`} id="home-tab-pane" role="tabpanel" aria-labelledby="home-tab" tabIndex="0">
                    <h3>Lista de Compradores</h3>
                    <ul>
                        {compradores.map((comprador) => (
                            <li key={comprador.id}>
                                {comprador.name} - {comprador.email}
                                <button onClick={() => getToEditComprador(comprador.id)} className="btn btn-warning btn-sm mx-2">Editar</button>
                                <button onClick={() => deleteCompradores(comprador.id)} className="btn btn-danger btn-sm">Eliminar</button>
                                <button onClick={() => showCompradorDetails(comprador)} className="btn btn-info btn-sm mx-2">Mostrar Detalles</button>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className={`tab-pane fade ${activeTab === "profile-tab" ? "show active" : ""}`} id="profile-tab-pane" role="tabpanel" aria-labelledby="profile-tab" tabIndex="0">
                    <h3>Crear Comprador</h3>
                    <form onSubmit={handleSubmitCreate}>
                        <div className="mb-3">
                            <label htmlFor="name" className="form-label">Nombre</label>
                            <input type="text" className="form-control" id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ingresa tu nombre" required />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="email" className="form-label">Email</label>
                            <input type="email" className="form-control" id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Ingresa tu email" required />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="clave" className="form-label">Clave</label>
                            <input type="password" className="form-control" id="clave" value={clave} onChange={(e) => setClave(e.target.value)} placeholder="Ingresa tu clave" required />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="telefono" className="form-label">Teléfono</label>
                            <input type="text" className="form-control" id="telefono" value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="Ingresa tu teléfono" required />
                        </div>
                        <button type="submit" className="btn btn-primary">Crear</button>
                    </form>
                </div>
                <div className={`tab-pane fade ${activeTab === "details-tab" ? "show active" : ""}`} id="details-tab-pane" role="tabpanel" aria-labelledby="details-tab" tabIndex="0">
                    <h3>Detalles del Comprador</h3>
                    {selectedComprador ? (
                        <div>
                            <p><strong>Nombre:</strong> {selectedComprador.name}</p>
                            <p><strong>Email:</strong> {selectedComprador.email}</p>
                            <p><strong>Clave:</strong> {selectedComprador.clave}</p>
                            <p><strong>Teléfono:</strong> {selectedComprador.telefono}</p>
                            <button onClick={() => setSelectedComprador(null)} className="btn btn-secondary">Volver</button>
                        </div>
                    ) : (
                        <p>No se ha seleccionado ningún comprador.</p>
                    )}
                </div>
                <div className={`tab-pane fade ${activeTab === "edit-tab" ? "show active" : ""}`} id="edit-tab-pane" role="tabpanel" aria-labelledby="edit-tab" tabIndex="0">
                    <h3>Editar Comprador</h3>
                    <form onSubmit={handleSubmitEditComprador}>
                        <div className="mb-3">
                            <label htmlFor="edit-name" className="form-label">Nombre</label>
                            <input type="text" className="form-control" id="edit-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ingresa el nuevo nombre" required />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="edit-email" className="form-label">Email</label>
                            <input type="email" className="form-control" id="edit-email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Ingresa el nuevo email" required />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="edit-clave" className="form-label">Clave</label>
                            <input type="password" className="form-control" id="edit-clave" value={clave} onChange={(e) => setClave(e.target.value)} placeholder="Ingresa la nueva clave" required />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="edit-telefono" className="form-label">Teléfono</label>
                            <input type="text" className="form-control" id="edit-telefono" value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="Ingresa el nuevo teléfono" required />
                        </div>
                        <button type="submit" className="btn btn-success">Guardar Cambios</button>
                    </form>
                </div>
            </div>
        </div>
    );
};
