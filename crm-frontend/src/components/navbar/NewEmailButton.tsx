import { Link } from "react-router-dom";
import { Button } from "../ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { CiMail } from "react-icons/ci";
import { FaMailBulk } from "react-icons/fa";

const NewEmailButton = () => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="default">Schedule Email</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">

                <Link to="/emails/new">
                    <DropdownMenuItem>
                        <CiMail className="mr-2 h-4 w-4" />
                        <span>Single</span>
                    </DropdownMenuItem>
                </Link>
                <Link to="/emails/new?type=multiple">
                    <DropdownMenuItem>
                        <FaMailBulk className="mr-2 h-4 w-4" />
                        <span>In Bulk</span>
                    </DropdownMenuItem>
                </Link>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default NewEmailButton