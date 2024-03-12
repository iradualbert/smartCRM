import { Link } from "react-router-dom";
import { Button } from "./ui/button";

const NotFound = () => {
    return (
        <div className="flex flex-col justify-center items-center min-h-screen gap-4 m-6">
            <div className="error-message flex flex-col items-center gap-4">
                <h1 className="text-4xl font-bold text-gray-800">404 | Not Found</h1>
                <p className="text-lg text-gray-600 text-center">
                    The page you're looking for might have been removed, or the URL might be incorrect.
                </p>
            </div>

            <div className="flex justify-center mt-8 gap-4">
                <Link to="/">
                    <Button size="lg">
                        Go Home
                    </Button>
                </Link>
                <Link to="/dashboard">
                    <Button variant="outline" size="lg">
                        Go to Dashboard
                    </Button>
                </Link>
            </div>
        </div>
    );
};

export default NotFound;
