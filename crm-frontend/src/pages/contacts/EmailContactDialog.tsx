import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import MailForm from "../mails/MailForm"

type EmailContactDialogProps = {
    children: React.ReactNode, 
    contact: object
} 

const EmailContactDialog = ({ children, contact }: EmailContactDialogProps) => {
    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className={"lg:max-w-screen-lg overflow-y-scroll max-h-screen"}>
                <DialogHeader>
                    <DialogTitle className="py-4">
                        {`Schedule & Send Email to ${contact.first_name} <${contact.email}>`} 
                        </DialogTitle>
                    <DialogDescription className="py-6" asChild>
                        <MailForm />
                    </DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )
}

export default EmailContactDialog