import { useState, useEffect } from "react";
import axios from "axios";
import { List, ListItem, ListItemText, Typography, Button, Divider, Alert, Snackbar } from "@mui/material";
import ContactView from "../../components/ContactView";
import ScheduleMeetingButton from "@/components/ScheduleMeetingButton";
import { ContactType } from "@/components/forms/ContactForm";
import ContactsImporter from "@/pages/contacts/ImportContacts";
import ContactCategories from "@/components/contacts/ContactCategories";
import { useSearchParams } from "react-router-dom";
import { Button as ShdButton } from "@/components/ui/button";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { parseTime } from "@/lib/utils";
import ImportContacts from "@/pages/contacts/ImportContacts";



const ContactsManagerPage = () => {

    const [contacts, setContacts] = useState(null);
    const [contactCategories, setContactCategories] = useState(null);
    const [searchParams, setSearchParams] = useSearchParams();
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

    const { category } = searchParams

    return (
        <div className="flex flex-col gap-2 bg-slate-50 p-3 md:p-6">
            <Typography component="h1" variant="h5">My Contacts</Typography>
            <div className="flex gap-8">
                <div className="w-40 flex flex-col gap-6">
                    <div className="flex items-center justify-between p-2 text-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 group">
                        <ShdButton variant="link" className="ms-3" onClick={() => setSearchParams({})}>All</ShdButton>
                    </div>
                    {contactCategories?.results.map(_category => (
                        <div key={_category.id} className="flex items-center justify-between p-2 text-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 group">
                            <ShdButton variant="link" className="ms-3" onClick={() => setSearchParams({ category: _category.id })}>
                                {_category.name}
                            </ShdButton>
                            <span>{_category.total_contacts}</span>
                        </div>
                    ))}
                    <ShdButton>+ New Category</ShdButton>
                </div>
                <div className="flex flex-col gap-6">
                    <h1 className="text-4xl">All Contacts</h1>
                    <div className="flex gap-3">
                        <ContactView onCreate={handleOnContactCreated} type="create">
                            + New Contact
                        </ContactView>
                        <ImportContacts>
                            <ShdButton variant="outline">Import Contacts</ShdButton>
                        </ImportContacts>
                        <ShdButton >{"Send Email ->"}</ShdButton>
                    </div>
                    <Table>
                        <TableHeader>
                            <TableHead>Full Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Company</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Categories</TableHead>
                            <TableHead>Created At</TableHead>
                        </TableHeader>
                        <TableBody>
                            {contacts?.results.map(contact => (
                                <TableRow key={contact.id}>
                                    <TableCell>{contact.first_name} {contact.last_name}</TableCell>
                                    <TableCell>{contact.email}</TableCell>
                                    <TableCell>{contact.company}</TableCell>
                                    <TableCell>{contact.phone_number}</TableCell>
                                    <TableCell>subscriber</TableCell>
                                    <TableCell>{parseTime(contact.created_at)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
            <Snackbar anchorOrigin={{ vertical: "bottom", horizontal: "center" }} open={toast.isOpen} autoHideDuration={6000} onClose={handleToastClose}>
                <Alert onClose={handleToastClose} severity={toast.severity as "info"} sx={{ width: '100%' }}>
                    {toast.message}
                </Alert>
            </Snackbar>
        </div>
    )
}

export default ContactsManagerPage;