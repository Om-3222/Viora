import { BrowserRouter, Routes, Route } from "react-router-dom";

import ScrollToTop from "@/components/common/ScrollToTop";
import MainLayout from "@/layouts/MainLayout";
import AuthLayout from "@/layouts/AuthLayout";
import ProtectedRoute from "./ProtectedRoute";

import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import Call from "@/pages/Call";
import Meeting from "@/pages/Meeting";
import History from "@/pages/History";
import NotFound from "@/pages/NotFound";
import DashboardLayout from "@/layouts/DashboardLayout";
import Profile from "@/pages/Profile";

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <ScrollToTop />
            <Routes>
                <Route element={<MainLayout />}>
                    <Route path="/" element={<Home />} />
                </Route>

                <Route element={<AuthLayout />}>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                </Route>

                <Route element={<ProtectedRoute />}>
                    <Route element={<DashboardLayout />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/call" element={<Call />} />
                        <Route path="/meeting/:meetingCode" element={<Meeting />} />
                        <Route path="/history" element={<History />} />
                        <Route path="/profile" element={<Profile />} />
                    </Route>
                </Route>

                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    );
}