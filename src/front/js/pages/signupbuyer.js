import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export const SignupBuyer = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();

        
        if (!name || !email || !password || !phone) {
            setError("Please fill in all fields.");
            return;
        }

        const raw = {
            name: name,
            email: email,
            clave: password,
            telefono: phone,
            image:null,
        };

        const requestOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(raw),
        };

        fetch(process.env.BACKEND_URL + "/api/buyer/signup", requestOptions)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then((data) => {
              
                navigate("/buyer/login");
            })
            .catch((error) => {
                
                setError("Error during registration. Please try again.");
                console.error('Fetch error:', error);
            });
    };

    return (
        <div className="row mt-5 w-100 d-flex justify-content-center">
            <div className="col-4 align-content-center justify-content-center d-flex">
                <div style={{width: "550px", marginTop: "50px"}} className="card-black body-signup">
                    <form onSubmit={handleSubmit}>
                        <div>
                            <h2 className="text-center mb-5">Sign up</h2>
                            <div className="row mb-4">
                                <div className="col-6">
                                    <label htmlFor = "name">Full Name</label>
                                    <input 
                                        type = "text" 
                                        className="form-control" id = "name" 
                                        value={name} 
                                        onChange ={(e)=>setName(e.target.value)} 
                                        placeholder="Enter your full name"
                                        required
                                    >
                                    </input>
                                </div>
                                <div className="col-6">
                                    <label htmlFor = "email">Email</label>
                                    <input 
                                        type = "email" 
                                        className="form-control" id = "email" 
                                        value={email} 
                                        onChange ={(e)=>setEmail(e.target.value)} 
                                        placeholder="Enter email"
                                        required
                                    >
                                    </input>
                                </div>
                            </div>
                            <div className="mb-4">
                                <label htmlFor = "password">Password</label>
                                <input 
                                    type = "password" 
                                    className="form-control" id = "password" 
                                    value={password} 
                                    onChange ={(e)=>setPassword(e.target.value)}
                                    placeholder="Enter password"
                                    required
                                >
                                </input>
                            </div>
                            <div className="mb-4">
                                <label htmlFor = "phone">Phone number</label>
                                <input 
                                    type = "text" 
                                    className="form-control" id = "phone" 
                                    value={phone} 
                                    onChange ={(e)=>setPhone(e.target.value)}
                                    placeholder="Enter phone number"
                                    required
                                >
                                </input>
                            </div>
                            <p className="text-danger"></p>
                            <div className="text-center mb-3">
                                <button type="submit" className="purple-button w-100">Sign Up</button>
                            </div>
                            <p>Already have account? <Link className="text-purple" to="/buyer/login">Log in buyer</Link></p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
