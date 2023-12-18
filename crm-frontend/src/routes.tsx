import { useSelector } from "react-redux";
import { Outlet, Navigate  } from "react-router-dom";
import SideBar from "./components/SideBar";
import { useQuery } from "./lib/hooks";
import Navbar from "@/components/Navbar";


export const AuthRoute = () => {
    const { isAuthenticated } = useSelector((state) => state.user);
    const next = useQuery().get('next');

    if (isAuthenticated) {
        const redirectUrl = next || "/"
        return <Navigate to={redirectUrl} />
    };
    return <Outlet />
};

export const PrivateRoute = () => {
    const { isAuthenticated } = useSelector(state => state.user);
    const next = window.location.pathname + window.location.search;
    const redirectUrl = `/login?next=${next}`;
    
    if (isAuthenticated) {
        return (
            <div className="ml-16 mt-10 p-10">
                <Navbar />
                <SideBar />
                <Outlet />
            </div>
        )
    }
    return <Navigate to={redirectUrl} />;
};