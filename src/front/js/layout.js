import React from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import ScrollToTop from "./component/scrollToTop";
import { BackendURL } from "./component/backendURL";

import { Navbar } from "./component/navbar";
import { Navbar2 } from "./component/navbar2";
import { Footer } from "./component/footer";
import { Sidebar } from "./component/sidebar";
import { Home } from "./pages/home";
import { Demo } from "./pages/demo";
import { Single } from "./pages/single";
import { Products } from "./pages/products";
import { Sellers } from "./pages/sellers";
import injectContext from "./store/appContext";
import { Compradores } from "./pages/Compradores";
import { LoginBuyer } from "./pages/loginbuyers";
import { SignupBuyer } from "./pages/signupbuyer";
import { Categorias } from "./pages/categoria";
import { Itemscarts } from "./pages/itemscarts";
import { Carts } from "./pages/carts";
import { Address } from "./pages/address";
import { SignupSeller } from "./pages/singupseller";
import { LoginSeller } from "./pages/loginseller";
import { CardProduct } from "./component/cardproduct";
import { ProductsBuyers } from "./pages/productsbuyers";
import { Cart } from "./pages/cart";
import { SellersProducts } from "./pages/sellersProducts";
import { Orders } from "./pages/ordersSeller";
import { UploadProductImage } from "./pages/productimagen";
import { SellerAddress } from "./pages/selleraddress";
import { ProductsSeller } from "./pages/productseller";
import { ProfileSeller } from "./pages/profileSeller";
import { BuyerProfile } from "./pages/buyerProfile";
import { Blog } from "./pages/blog";
import { Dashboard } from "./pages/dashboard";
import { DashboardProducts } from "./pages/dashboardProducts";
import { AddProduct } from "./pages/addproduct";
import { EditProduct } from "./pages/editproduct";
import { Categories } from "./pages/categories";
import { AddCategory } from "./pages/addcategory";
import { EditCategory } from "./pages/editcategory";
import { OrderList } from "./pages/orderlist";
import { OrderSingle } from "./pages/ordersingle";
import { DetailProduct } from "./pages/detailProduct";
import { BuyerAddress } from "./pages/buyeraddress";
import { OrdersPlaced } from "./pages/ordersplaced";






//create your first component
const Layout = () => {
    //the basename is used when your project is published in a subdirectory and not in the root of the domain
    // you can set the basename on the .env file located at the root of this project, E.g: BASENAME=/react-hello-webapp/
    
    const location = useLocation();

    const routesNavbar = ["/seller/signup", "/seller/login", "/buyer/login", "/buyer/signup"]
    const showNabar =  routesNavbar.some(route => location.pathname.startsWith(route))


    const routesSidebar = ["/dashboard", "/dashboard/products", "/add-product", "/edit-product", "/dashboard/categories", "/add-category",
        "/edit-category", "/dashboard/order-list", "/dashboard/order-single"]
    const showSidebar =  routesSidebar.some(route => location.pathname.startsWith(route))
    

    if(!process.env.BACKEND_URL || process.env.BACKEND_URL == "") return <BackendURL/>;

    return (
        <div className="h-100 w-100">
            <ScrollToTop>

                {showSidebar ? <Sidebar /> : showNabar ? (<Navbar2/>):(<Navbar/>)}
                <div className="h-100" style={{ marginLeft: showSidebar ? "448px" : "", marginRight: showSidebar ? "167px" : "", marginTop: showSidebar ? "100px" : ""}}>

                    <Routes>
                        <Route element={<Home />} path="/" />
                        <Route element={<Demo />} path="/demo" />
                        <Route element={<Single />} path="/single/:theid" />
                        <Route element={<Products/>} path="/products" />
                        <Route element={<Categorias/>} path="/categorias" />
                        <Route element={<Sellers/>} path="/sellers" />
                        <Route element={<Compradores/>} path="/compradores" />
                        <Route element={<LoginBuyer/>} path="/buyer/login" />
                        <Route element={<SignupBuyer/>} path="/buyer/signup" />
                        <Route element={<Itemscarts/>} path="/itemscarts" />
                        <Route element={<Carts/>} path="/carts" />
                        <Route element={<Address/>} path="/address" />
                        <Route element={<SignupSeller/>} path="/seller/signup" />
                        <Route element={<LoginSeller/>} path="/seller/login" />
                        <Route element={<SellersProducts />} path="/sellers/products" />                      
                        <Route element={<CardProduct/>} path="/cardproduct" />
                        <Route element={<ProductsBuyers/>} path="/productsbuyers" />
                        <Route element={<Cart/>} path="/cart" />
                        <Route element={<Orders/>} path="/orders" />
                        <Route element={<UploadProductImage/>} path="/product/image" />
                        <Route element={<BuyerAddress/>} path="/buyeraddress" />
                        <Route element={<SellerAddress/>} path="/selleraddress" />
                        <Route element={<ProductsSeller/>} path="/product/seller" />
                        <Route element={<ProfileSeller/>} path= "/profile/seller" />
                        <Route element={<BuyerProfile/>} path="/profile/buyer" />
                        <Route element={<Blog/>} path="/blog" />
                        <Route element={<Dashboard/>} path="/dashboard" />
                        <Route element={<DashboardProducts/>} path="/dashboard/products" />
                        <Route element={<AddProduct/>} path="/add-product" />
                        <Route element={<EditProduct/>} path="/edit-product/:productId" />
                        <Route element={<Categories/>} path="/dashboard/categories" />
                        <Route element={<AddCategory/>} path="/add-category" />
                        <Route element={<EditCategory/>} path="/edit-category/:categoryId" />
                        <Route element={<OrderList/>} path="/dashboard/order-list" />
                        <Route element={<OrderSingle/>} path="/dashboard/order-single/:cartId" />
                        <Route element={<OrderSingle/>} path="/dashboard/order-single" />
                        <Route element={<OrdersPlaced/>} path="/orders-placed" />
                        <Route element={<DetailProduct/>} path="/detail/:productId" />
                        <Route element={<h1>Not found!</h1>} />
                    </Routes>
                </div>
                
                {/* { <Footer />} */}

            </ScrollToTop>
        </div>
    );
};

export default injectContext(Layout);
