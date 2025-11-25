import React, { useState, useEffect, useContext } from "react";
import { Context } from "../store/appContext";

export const Categorias = () => {
    const { store, actions } = useContext(Context);

    const [categorias, setCategorias] = useState([]);
    const [name, setName] = useState("");
    const [activeTab, setActiveTab] = useState("home-tab");
    const [editCategoria_Id, setEditCategoria_Id] = useState(null);
    const [selectedCategoria, setSelectedCategoria] = useState(null);

    const getCategorias = () => {
        fetch(`${process.env.BACKEND_URL}/api/categorias`)
            .then((response) => response.json())
            .then((data) => setCategorias(data))
            .catch((error) => console.error("Error fetching categorias:", error));
    };

    useEffect(() => {
        getCategorias();
    }, []);

    const handleSubmitCreate = (e) => {
        e.preventDefault();
        const raw = JSON.stringify({ name });

        fetch(`${process.env.BACKEND_URL}/api/categorias`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: raw,
        })
        .then((response) => {
            if (response.ok) {
                getCategorias();
                resetForm();
            } else {
                console.error("Error adding categoria:", response.statusText);
            }
        })
        .catch((error) => console.error("Network error:", error));
    };

    const getToEditCategoria = async (categoria_id) => {
        try {
            const response = await fetch(`${process.env.BACKEND_URL}/api/categorias/${categoria_id}`);
            if (!response.ok) throw new Error("Error fetching categoria details");

            const data = await response.json();
            setActiveTab("edit-tab");
            setName(data.name);
            setEditCategoria_Id(categoria_id);
        } catch (error) {
            console.error("Error fetching categoria to edit:", error);
        }
    };

    const showCategoriaDetails = (categoria) => {
        setSelectedCategoria(categoria);
        setActiveTab("details-tab");
    };

    const handleSubmitEditCategoria = async (e) => {
        e.preventDefault();
        const updatedCategoria = { name };

        try {
            const response = await fetch(`${process.env.BACKEND_URL}/api/categorias/${editCategoria_Id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedCategoria),
            });

            if (!response.ok) throw new Error("Error updating categoria");

            await getCategorias();
            resetForm();
        } catch (error) {
            console.error("Error updating categoria:", error);
        }
    };

    const deleteCategorias = (categoria_id) => {
        if (window.confirm("¿Estás seguro de que deseas eliminar esta categoría?")) {
            fetch(`${process.env.BACKEND_URL}/api/categorias/${categoria_id}`, { method: "DELETE" })
                .then(response => {
                    if (response.ok) {
                        getCategorias();
                        alert("Categoría eliminada exitosamente.");
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
        setEditCategoria_Id(null);
        setSelectedCategoria(null);
    };

    return (
        <div className="container mt-5">
            <ul className="nav nav-tabs" id="myTab" role="tablist">
                <li className="nav-item" role="presentation">
                    <button
                        className={`nav-link ${activeTab === "home-tab" ? "active" : ""}`}
                        id="home-tab"
                        onClick={() => setActiveTab("home-tab")}
                        type="button"
                    >
                        Mostrar
                    </button>
                </li>
                <li className="nav-item" role="presentation">
                    <button
                        className={`nav-link ${activeTab === "profile-tab" ? "active" : ""}`}
                        id="profile-tab"
                        onClick={() => setActiveTab("profile-tab")}
                        type="button"
                    >
                        Crear
                    </button>
                </li>
                <li className="nav-item" role="presentation">
                    <button
                        className={`nav-link ${activeTab === "details-tab" ? "active" : ""}`}
                        id="details-tab"
                        onClick={() => setActiveTab("details-tab")}
                        type="button"
                    >
                        Detalles
                    </button>
                </li>
            </ul>

            <div className="tab-content" id="myTabContent">
                <div className={`tab-pane fade ${activeTab === "home-tab" ? "show active" : ""}`} id="home-tab-pane" role="tabpanel">
                    <h3>Lista de Categorías</h3>
                    <ul>
                        {categorias.map((categoria) => (
                            <li key={categoria.id}>
                                {categoria.name}
                                <button onClick={() => getToEditCategoria(categoria.id)} className="btn btn-warning btn-sm mx-2">Editar</button>
                                <button onClick={() => deleteCategorias(categoria.id)} className="btn btn-danger btn-sm">Eliminar</button>
                                <button onClick={() => showCategoriaDetails(categoria)} className="btn btn-info btn-sm mx-2">Mostrar Detalles</button>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className={`tab-pane fade ${activeTab === "profile-tab" ? "show active" : ""}`} id="profile-tab-pane" role="tabpanel">
                    <h3>Crear Categoría</h3>
                    <form onSubmit={handleSubmitCreate}>
                        <div className="mb-3">
                            <label htmlFor="name" className="form-label">Nombre</label>
                            <input type="text" className="form-control" id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ingresa el nombre" required />
                        </div>
                        <button type="submit" className="btn btn-primary">Crear</button>
                    </form>
                </div>
                <div className={`tab-pane fade ${activeTab === "details-tab" ? "show active" : ""}`} id="details-tab-pane" role="tabpanel">
                    <h3>Detalles de la Categoría</h3>
                    {selectedCategoria ? (
                        <div>
                            <p><strong>Nombre:</strong> {selectedCategoria.name}</p>
                            <button onClick={() => setSelectedCategoria(null)} className="btn btn-secondary">Volver</button>
                        </div>
                    ) : (
                        <p>No se ha seleccionado ninguna categoría.</p>
                    )}
                </div>
                <div className={`tab-pane fade ${activeTab === "edit-tab" ? "show active" : ""}`} id="edit-tab-pane" role="tabpanel">
                    <h3>Editar Categoría</h3>
                    <form onSubmit={handleSubmitEditCategoria}>
                        <div className="mb-3">
                            <label htmlFor="edit-name" className="form-label">Nombre</label>
                            <input type="text" className="form-control" id="edit-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ingresa el nuevo nombre" required />
                        </div>
                        <button type="submit" className="btn btn-success">Guardar Cambios</button>
                    </form>
                </div>
            </div>
        </div>
    );
};
