import { useState, useEffect } from "react";
import axios from "axios";
import { List, ListItem, ListItemText, Typography, Button, Divider, Alert, Snackbar } from "@mui/material";
import ContactView from "../../components/ContactView";
import ScheduleMeetingButton from "@/components/ScheduleMeetingButton";
import { ContactType } from "@/components/forms/ContactForm";
import ContactsImporter from "@/components/ContactsImporter";


const ContactsManagerPage = () => {

    const [contacts, setContacts] = useState(null);
    const [contactCategories, setContactCategories] = useState(null);
    const [toast, setToast] = useState({
        isOpen: false,
        message: "",
        severity: "",
    })

    useEffect(() => {
        axios.get('/contacts/')
            .then(res => setContacts(res.data))
        axios.get("/contact-categories/")
            .then(res => setContactCategories(res.data))
    }, [])

    const showToast = (message: string, severity: "error" | "info" | "success") => {
        setToast({
            isOpen: true,
            message,
            severity
        })
    }

    const handleToastClose = () => {
        setToast({
            isOpen: false,
            message: "",
            severity: "info"
        })
    }

    const handleOnContactCreated = (contact: ContactType) => {
        setContacts((prev) => {
            const results = [contact, ...prev.results];
            return {
                ...prev,
                results
            }
        })
        showToast("New Contact Created", "success")
    }

    const handleOnContactUpdated = (updatedContact: ContactType) => {
        setContacts((prev) => {
            const results = prev.results.map(currentContact => (
                currentContact.id === updatedContact.id) ? updatedContact : currentContact
            )
            return {
                ...prev,
                results,
            }
        })
        showToast("Contact Updated", "info")
    }

    const handleOnContactDeleted = (id: string | number) => {
        setContacts((prev) => {
            const results = prev.results.filter((contact: ContactType) => contact.id !== id)
            return {
                ...prev,
                results,
            }
        })
        showToast("Contact Deleted", "error")
    }

    const send_email = () => { }

    const send_multiple_emails = () => { }

    return (
        <div className="flex flex-col gap-2 bg-slate-50 p-3 md:p-6">
            <Typography component="h1" variant="h5">My Contacts</Typography>
            <div className="flex gap-5">
                <ContactView onCreate={handleOnContactCreated} type="create">Add New Contact</ContactView>
                <ContactsImporter />
            </div>
            <List sx={{ width: '100%', maxWidth: 600, bgcolor: 'background.paper' }}>
                {contacts?.results?.map(contact => {
                    return (
                        <div key={contact.id}>
                            <ListItem alignItems="flex-start" >
                                <ListItemText
                                    primary={`${contact.first_name} ${contact.last_name}`}
                                    secondary={(
                                        <div className="flex flex-col">
                                            <Typography
                                                sx={{ display: 'inline' }}
                                                component="span"
                                                variant="body2"
                                                color="text.primary"
                                            >
                                                {contact.company}
                                            </Typography>
                                            <Typography
                                                sx={{ display: 'inline' }}
                                                component="span"
                                                variant="body2"
                                                color="text.primary"
                                            >
                                                {contact.email}
                                            </Typography>
                                        </div>
                                    )}
                                />
                                <div className="flex gap-4">
                                    <ContactView
                                        onUpdate={handleOnContactUpdated}
                                        onDelete={handleOnContactDeleted}
                                        type="update"
                                        contact={contact}
                                    />
                                    <Button size="small">Email</Button>
                                    <Button size="small">View Mail Sent</Button>
                                    <ScheduleMeetingButton contact={contact} />
                                </div>
                            </ListItem>
                            <Divider component="li" />
                        </div>
                    )
                })}

            </List>
            <Snackbar anchorOrigin={{ vertical:"bottom", horizontal: "center" }} open={toast.isOpen} autoHideDuration={6000} onClose={handleToastClose}>
                <Alert onClose={handleToastClose} severity={toast.severity as "info"} sx={{ width: '100%' }}>
                    {toast.message}
                </Alert>
            </Snackbar>
        </div>
    )
}

export default ContactsManagerPage;