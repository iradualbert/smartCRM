import { useState, useEffect } from "react";
import axios from "axios";
import { List, ListItem, ListItemText, Typography, Button, Divider } from "@mui/material";
import ContactView from "../components/ContactView";
import ScheduleMeetingButton from "@/components/ScheduleMeetingButton";


const ContactsManagerPage = () => {

    const [contacts, setContacts] = useState([]);

    useEffect(() => {
        axios.get('/contacts/')
            .then(res => setContacts(res.data))
            .catch(err => console.error("Err fetching contacts", err))
    }, [])

    return (
        <>
            <Typography component="h1" variant="h2">My Contacts</Typography>
            <ContactView contact={{}} isAddContact={true}>Add New Contact</ContactView>
            <List sx={{ width: '100%', maxWidth: 500, bgcolor: 'background.paper' }}>
                {contacts.map(contact => {
                    return (
                        <div key={contact.id}>
                            <ListItem alignItems="flext-start" >
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
                                    <ContactView contact={contact} />
                                    <Button size="small">Email</Button>
                                    <ScheduleMeetingButton contact={contact}/>
                                </div>
                            </ListItem>
                            <Divider component="li" />
                        </div>
                    )
                })}

            </List>

        </>
    )
}

export default ContactsManagerPage;