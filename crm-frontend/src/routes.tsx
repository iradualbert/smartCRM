import { useSelector } from "react-redux";
import { Outlet, Navigate } from "react-router-dom";
import SideBar from "./components/SideBar";
import { useQuery } from "./lib/hooks";
import Navbar from "@/components/Navbar";
import { Toaster } from "@/components/ui/toaster"


export const AuthRoute = () => {
    const { isAuthenticated } = useSelector((state) => state.user);
    const next = useQuery().get('next');

    if (isAuthenticated) {
        const redirectUrl = next || "/dashboard"
        return <Navigate to={redirectUrl} />
    };
    return (
        <div className="pb-10" style={{ minHeight: "90vh" }}><Outlet /></div>
    )
};

export const PrivateRoute = () => {
    const { user: { isAuthenticated } } = useSelector(state => state);
    const next = window.location.pathname + window.location.search;
    const redirectUrl = `/login?next=${next}`;


    if (isAuthenticated) {
        return (
            <div className="mt-10 py-10 pl-24 pr-10" style={{ minHeight: "90vh" }}>
                <Navbar />
                <SideBar />
                <Outlet />
                <Toaster />
            </div>
        )
    }
    return <Navigate to={redirectUrl} />;
};