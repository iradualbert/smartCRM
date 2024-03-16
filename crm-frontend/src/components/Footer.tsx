import { Link } from "react-router-dom";
import { Button } from "./ui/button";

const Footer = () => {
    return (
        <footer className="flex flex-col items-center gap-4 py-6 mt-4 border-t-2">

            <div className="flex items-center flex-wrap">
                <Link to="/">
                    <Button variant="link" size="lg">Beinpark</Button>
                </Link>
                <span> | </span>
                <Link to="/terms">
                    <Button variant="link" size="lg">Terms and Conditions</Button>
                </Link>
                <span> | </span>
                <Link to="/privacy-policy">
                    <Button variant="link" size="lg">Privacy Policy</Button>
                </Link>
                <span> | </span>
                <Link to="/refund-policy">
                    <Button variant="link" size="lg">Refund Policy</Button>
                </Link>
            </div>
            <p>Copyright © {new Date().getFullYear()} BeinPark LLC. All rights reserved.</p>


        </footer>
    )
}

export default Footer;