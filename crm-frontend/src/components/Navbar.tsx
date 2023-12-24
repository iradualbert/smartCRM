import { Button } from "@/components/ui/button";
import { logoutUser } from "@/redux/actions/userActions";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom"

const Navbar = () => {
    const dispatch = useDispatch();

    const { first_name } = useSelector(state => state.user.credentials)

    const handleLogout = () => {
        dispatch(logoutUser() as any)
    }
    return (
        <div className="fixed top-0 pl-20 pr-10 right-0 w-full h-14 border-b shadow-sm bg-white flex items-center z-10">
            <div className="md:max-w-screen-2xl mx-auto flex items-center w-full justify-between">
                <h1>SmartCRM</h1>
                <div className="flex gap-2">
                    <Button variant="link" asChild>
                        <Link to="/settings">{first_name}</Link>
                    </Button>
                    <Button onClick={handleLogout} variant="outline" size="sm">
                        Log Out
                    </Button>
                </div>

            </div>
        </div>
    )
}

export default Navbar