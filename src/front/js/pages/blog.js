import React, { useState, useEffect, useContext } from "react";
import { Context } from "../store/appContext";

export const Blog = () => {
	const { store, actions } = useContext(Context);
	const [articles, setArticles] = useState([]);

	const getArticles = () => {
		fetch(process.env.BACKEND_URL + "/api/articles")
			.then((response) => {
				if (!response.ok) {
					throw new Error("Error fetching articles: " + response.statusText);
				}
				return response.json();
			})
			.then((data) => {
				setArticles(data); 
			})
			.catch((error) => {
				console.error("Error fetching articles:", error);
			});
	};

    const deleteArticle = (id) => {
        fetch(process.env.BACKEND_URL + `/api/articles/${id}`, {method: "DELETE"})
        .then((response) => {
            if (!response.ok) {
                throw new Error("Error al eliminar el artículo: " + response.statusText);
            }
            getArticles()
        })
        .catch((error) => {
            console.error("Error:", error);
        });
    };

	useEffect(() => {
		getArticles();
	}, []);

	if (articles.length === 0) {
		return (
			<div className="container mt-5 d-flex justify-content-center">
				<h2>No hay artículos disponibles</h2>
			</div>
		);
	}

	return (
        <div className="container mt-5 d-flex flex-column justify-content-center align-items-center">
            <h1 className="text-center text-white mb-5">Articles</h1>
            <div style={{ width: "70%", display: "flex", flexDirection: "column", alignItems: "center" }}>
                {articles.map((article) => (
                    <div key={article.id} className="card-black body-card shadow mb-5 w-100" style={{padding: "40px"}}>
                        <div className="d-flex">
                            <div><h2 className="text-center">{article.title}</h2></div>
                        </div>
                        <div style={{ width: "100%", height: "500px", display: "flex", justifyContent: "center" }}>
                            <img
                                src={article.image ? article.image : "https://via.placeholder.com/300"}
                                style={{ width: "100%", height: "100%", objectFit: "contain" }}
                                alt={article.title}
                            />
                        </div>
                        <div style={{ textAlign: "center" }}>
                            <p>{article.content}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};