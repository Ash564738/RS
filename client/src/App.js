import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./core/Landing";
import Signup from "./user/Signup";
import Signin from "./user/Signin";
import "./styles.css";
import AdminRoute from "./auth/helper/AdminRoute";
import PrivateRoute from "./auth/helper/PrivateRoute";
import UserDashboard from "./user/UserDashboard";
import AdminDashboard from "./user/AdminDashboard";

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/signin" element={<Signin />} />
                <Route path="/user/dashboard" element={<PrivateRoute />}>
                    <Route path="" element={<UserDashboard />} />
                </Route>
                <Route path="/admin/dashboard" element={<AdminRoute />}>
                    <Route path="" element={<AdminDashboard />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
};

export default App;