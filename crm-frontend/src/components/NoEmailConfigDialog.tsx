import { useEffect, useState } from "react"
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"


const NoEmailConfigDialog = () => {
    const [isOpen, setIsOpen] = useState(false);
    const email_provider = useSelector((state: any) => state.user.credentials.config.email_provider);

    useEffect(() => {
        if(email_provider) return;
        setTimeout(() => {
            setIsOpen(true)
        }, 2000)
    }, [email_provider])

    if (email_provider) return <></>

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="py-4">Email Configuration</DialogTitle>
                    <DialogDescription className="py-4">
                       No email configuration set for this account. For emails to be sent, please configure your email settings.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-4">
                    <Button variant="outline" onClick={() => setIsOpen(false)}>Close</Button>
                    <Link to="/settings/integration">
                        <Button type="button">Email Settings</Button>
                    </Link>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default NoEmailConfigDialog