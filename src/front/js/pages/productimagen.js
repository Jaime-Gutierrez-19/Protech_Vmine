import React, { useState, useEffect, useContext } from "react";
import { Context } from "../store/appContext";

export const UploadProductImage = () => {
    const { store, actions } = useContext(Context);

    const [selectedFile, setSelectedFile] = useState(null);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    
    const handleSubmit = (event) => {
        event.preventDefault();
        const token = localStorage.getItem("jwt-token");

        if (!selectedFile) {
            alert("Please select a file before submitting.");
            return;
        }

        const formData = new FormData();
        formData.append("file", selectedFile); 

        fetch(`${process.env.BACKEND_URL}/api/upload`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to upload image");
            }
            return response.json();
        })
        .then(data => {
            alert("Image uploaded successfully!");
        })
        .catch(error => {
            console.error("Error uploading image:", error);
            alert("Error uploading image");
        });
    };

    return (
        <>
        <div className="container">
        <div>
            <h3>Upload Product Image</h3>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="fileInput" className="form-label">Select an image:</label>
                    <input
                        type="file"
                        id="fileInput"
                        className="form-control"
                        onChange={handleFileChange}
                        accept="image/*" 
                    />
                </div>
                <button type="submit" className="btn btn-primary">Upload</button>
            </form>
        </div>

        </div>
        
        </>
    );
};
