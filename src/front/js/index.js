//import react into the bundle
import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";

//include your index.scss file into the bundle
import "../styles/index.css";

//import your own components
import Layout from "./layout";
const basename = process.env.BASENAME || "";


//render your react application
ReactDOM.render(
    <BrowserRouter basename = {basename}>
        <Layout />
    </BrowserRouter>,
    document.querySelector("#app")
);