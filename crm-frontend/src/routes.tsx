import { useSelector } from "react-redux";
import { Outlet, Navigate } from "react-router-dom";
import SideBar from "./components/sidebar/SideBar";
import { useQuery } from "./lib/hooks";
import Navbar from "@/components/navbar/Navbar";
import { Toaster } from "@/components/ui/toaster";
import LoadingPage from "./components/LoadingPage";
import LandingPage from "./pages/landing-sales/LandingPage";


export const MainRoute = () => {
    return (
        <>
           <Navbar isAppRoute={false}/>
           <Outlet />
        </>
    )
}

export const RootRoute = () => {
    const { isAuthenticated, isLoading } = useSelector((state: any) => state.user);

    if (isLoading) return <LoadingPage />
    if (isAuthenticated) return <Navigate to="/dashboard" replace />
    return <LandingPage />
}


export const AuthenticatedRoute = () => {
    const { user: { isAuthenticated, isLoading } } = useSelector((state: any) => state);
    const next = window.location.pathname + window.location.search;

    if (isLoading) return <LoadingPage />
    if (!isAuthenticated) return <Navigate to={`/login?next=${next}`} />;
    return (
        <div style={{ minHeight: "100vh" }}>
            <Outlet />
            <Toaster />
        </div>
    )
}

export const AuthRoute = () => {
    const { isAuthenticated, isLoading } = useSelector((state: any) => state.user);
    const next = useQuery().get('next');

    if(isLoading) return <LoadingPage />

    if (isAuthenticated) {
        const redirectUrl = next || "/dashboard"
        return <Navigate to={redirectUrl} />
    };
    return (
        <div className="pb-10" style={{ minHeight: "90vh" }}><Outlet /></div>
    )
};

export const PrivateRoute = () => {
    const { user: { isAuthenticated, isLoading } } = useSelector((state: any) => state);
    const next = window.location.pathname + window.location.search;
    const redirectUrl = `/login?next=${next}`;

    if(isLoading) return <LoadingPage />

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