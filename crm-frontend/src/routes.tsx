import { useSelector } from "react-redux";
import { Outlet, Navigate } from "react-router-dom";
import SideBar from "./components/SideBar";
import { useQuery, useToasts } from "./lib/hooks";
import Navbar from "@/components/Navbar";
import { Snackbar, Alert, Stack } from "@mui/material";


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
    const { user: { isAuthenticated }, ui: { toasts } } = useSelector(state => state);
    const { clearToast } = useToasts();
    const next = window.location.pathname + window.location.search;
    const redirectUrl = `/login?next=${next}`;

    const handleToastClose = (toastId) => {
        clearToast(toastId);
    }

    if (isAuthenticated) {
        return (
            <div className="mt-10 py-10 pl-24 pr-10">
                <Navbar />
                <SideBar />
                <Outlet />
                <Stack spacing={2} sx={{ maxWidth: 600 }}>
                    {toasts.map(toast => (
                        <Snackbar anchorOrigin={{ vertical: "top", horizontal: "right" }} open={true} autoHideDuration={6000} onClose={() => handleToastClose(toast.id)}>
                            <Alert onClose={() => handleToastClose(toast.id)} severity={toast.severity} sx={{ width: '100%' }}>
                                {toast.message}
                            </Alert>
                        </Snackbar>
                    ))}
                </Stack>


            </div>
        )
    }
    return <Navigate to={redirectUrl} />;
};