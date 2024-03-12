import { Button } from "@/components/ui/button";
import { logoutUser } from "@/redux/actions/userActions";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom"

type NavbarProps = {
    isAppRoute?: false | true
}

const Navbar = ({ isAppRoute = true }: NavbarProps) => {
    const dispatch = useDispatch();

    const user = useSelector((state: any) => state.user)

    const handleLogout = () => {
        dispatch(logoutUser() as any)
    }
    return (
        <div className="fixed top-0 pl-20 pr-10 right-0 w-full h-14 border-b shadow-sm bg-white flex items-center z-10 py-4">
            <div className="md:max-w-screen-2xl mx-auto flex items-center w-full justify-between">
                <h1>BeinPARK</h1>
                <div className="flex gap-2">
                    {user.isAuthenticated ? (
                        <>
                            {isAppRoute ? (
                                <Button size="sm" asChild>
                                    <Link to="/settings/profile">{user.credentials.first_name}</Link>
                                </Button>
                            ) : (
                                <Button size="sm" asChild>
                                    <Link to="/dashboard">Dashboard</Link>
                                </Button>
                            )}
                            <Button onClick={handleLogout} variant="outline" size="sm">
                                Log Out
                            </Button>
                        </>
                    ) : (
                        <>
                            <Link to="/login">
                                <Button variant="secondary" size="sm">Log In</Button>
                            </Link>
                            <Link to="/signup">
                                <Button size="sm">Sign Up</Button>
                            </Link>
                        </>
                    )}

                </div>

            </div>
        </div>
    )
}

export default Navbar