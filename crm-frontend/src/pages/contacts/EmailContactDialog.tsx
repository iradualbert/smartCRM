import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import MailForm from "../mails/MailForm"
import { useState } from "react"

type EmailContactDialogProps = {
    children: React.ReactNode, 
    contact: object
} 

const EmailContactDialog = ({ children, contact }: EmailContactDialogProps) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className={"max-w-3xl overflow-y-scroll max-h-screen"}>
                <DialogHeader>
                    <DialogTitle className="py-4">
                        {`Schedule & Send Email to ${contact.first_name} <${contact.email}>`} 
                        </DialogTitle>
                    <DialogDescription className="py-6" asChild>
                        <MailForm 
                            mailContent={{ to: contact.email }}
                            onAfterSend={() => setIsDialogOpen(false)}
                        />
                    </DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )
}

export default EmailContactDialog