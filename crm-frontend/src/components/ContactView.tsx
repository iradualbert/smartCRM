import { useState } from "react";
import { Dialog, DialogContent, DialogActions, Button, TextField } from "@mui/material";
import ModalTitle from "./ui/ModalTitle";


const ContactView = ({ contact, children, isAddContact }) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [readOnly, setReadOnly] = useState(!isAddContact);

    const toggleShowDialog = () => {
        setIsDialogOpen(prev => !prev)
    }

    const handleSubmit = event => {
        event.preventDefault();

    }

    return (
        <>
            <Button onClick={toggleShowDialog}>{children ? children : "View"}</Button>
            {isDialogOpen && (
                <Dialog
                    open={isDialogOpen}
                    onClose={toggleShowDialog}
                    
                >
                     <ModalTitle onClose={toggleShowDialog}>Contact Details</ModalTitle>
                     <DialogContent dividers>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-3" style={{ padding: "14px 0px" }}>
                            <TextField 
                                fullWidth 
                                value={contact.first_name}
                                size="small"
                                placeholder="First Name"
                                InputProps={{
                                    readOnly
                                }}
                                variant="standard"
                            />
                            <TextField 
                                fullWidth 
                                value={contact.last_name}
                                size="small"
                                placeholder="Last Name"
                                InputProps={{
                                    readOnly
                                }}
                                variant="standard"
                            />
                            <TextField 
                                fullWidth 
                                value={contact.email}
                                size="small"
                                placeholder="Email"
                                InputProps={{
                                    readOnly
                                }}
                                variant="standard"
                            />
                            <TextField 
                                fullWidth 
                                value={contact.company}
                                size="small"
                                placeholder="Company"
                                InputProps={{
                                    readOnly
                                }}
                                variant="standard"
                            />
                            <TextField 
                                fullWidth 
                                value={contact.phone_number}
                                size="small"
                                placeholder="Phone Number"
                                InputProps={{
                                    readOnly
                                }}
                                variant="standard"
                            />
                            <TextField 
                                fullWidth 
                                value={contact.address}
                                multiline
                                minRows={2}
                                placeholder="Address"
                                InputProps={{
                                    readOnly
                                }}
                                variant="standard"
                            />
                            <Button variant="outlined">Edit</Button>
                            <Button variant="contained" color="warning">Delete</Button>
                        </form>
                    </DialogContent>
                    <DialogActions>
                        <Button>Edit</Button>
                        <Button>Send Email</Button>
                        <Button>Meet</Button>
                    </DialogActions>
                </Dialog>
            )}
        </>
    )
}

export default ContactView;