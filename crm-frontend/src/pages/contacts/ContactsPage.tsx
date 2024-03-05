import { useState, useEffect } from "react";
import { Typography, Alert, Snackbar } from "@mui/material";
import ContactView from "../../components/ContactView";
import { ContactType } from "@/components/forms/ContactForm";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
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
import { getCategories, getContacts } from "@/redux/actions/contactActions";
import { useSelector } from "react-redux";
import EmailContactDialog from "./EmailContactDialog";
import CategoryFormDialog from "./CategoryFormDialog";



const ContactsManagerPage = () => {

    const [_contacts, setContacts] = useState(null);
    const [searchParams, setSearchParams] = useSearchParams();
    const { categories: contactCategories, all_contacts } = useSelector(state => state.contacts);
    const [toast, setToast] = useState({
        isOpen: false,
        message: "",
        severity: "",
    })

    useEffect(() => {
        getContacts();
        getCategories();
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
                        <Button variant="link" className="ms-3" onClick={() => setSearchParams({})}>All</Button>
                    </div>
                    {contactCategories?.map(_category => (
                        <div key={_category.id} className="flex items-center justify-between p-2 text-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 group">
                            <Button variant="link" className="ms-3" onClick={() => setSearchParams({ category: _category.id })}>
                                {_category.name}
                            </Button>
                            <span>{_category.total_contacts}</span>
                        </div>
                    ))}
                    <CategoryFormDialog>
                        <Button>+ New Category</Button>
                    </CategoryFormDialog>

                </div>
                <div className="flex flex-col gap-6">
                    <h1 className="text-4xl">All Contacts</h1>
                    <div className="flex gap-3">
                        <ContactView onCreate={handleOnContactCreated} type="create">
                            + New Contact
                        </ContactView>
                        <ImportContacts>
                            <Button variant="outline">Import Contacts</Button>
                        </ImportContacts>
                        <Button >{"Send Email ->"}</Button>
                        <Button variant="link">Update</Button>
                        <Button variant="destructive">{"Delete Category"}</Button>
                    </div>
                    <Table>
                        <TableHeader>
                            <TableHead>Full Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Company</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Categories</TableHead>
                            <TableHead>Created At</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableHeader>
                        <TableBody>
                            {all_contacts.results.map(contact => (
                                <TableRow key={contact.id}>
                                    <TableCell>{contact.first_name} {contact.last_name}</TableCell>
                                    <TableCell>{contact.email}</TableCell>
                                    <TableCell>{contact.company}</TableCell>
                                    <TableCell>{contact.phone_number}</TableCell>
                                    <TableCell>subscriber</TableCell>
                                    <TableCell>{parseTime(contact.created_at)}</TableCell>
                                    <TableCell>
                                        <EmailContactDialog contact={contact}>
                                            <Button variant="secondary">Send Email</Button>
                                        </EmailContactDialog>
                                    </TableCell>
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