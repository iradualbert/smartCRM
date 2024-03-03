import React, { useState } from "react";
import { Dialog, DialogContent, DialogActions, Button } from "@mui/material";
import ModalTitle from "./ui/ModalTitle";
import ContactForm, { ContactFormProps, ContactType } from "./forms/ContactForm";
import axios from "axios";
import { Button as ShdButton } from "@/components/ui/button";

interface ContactViewProps extends ContactFormProps {
    children?: React.ReactNode;
    onCreate?: (contact: ContactType) => void;
    onUpdate?: (contact: ContactType) => void;
    onDelete?: (id: number | string ) => void;
}

const ContactView = ({ children, onUpdate, onCreate, onDelete, contact: _contact, isReadOnly, ...formProps }: ContactViewProps) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [contact, setContact] = useState<ContactType>(_contact || {} as ContactType);
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState(null);

    const isCreate = formProps.type === "create";

    const toggleShowDialog = () => {
        setErrors(null);
        if(!isCreate) setContact(_contact);
        setIsDialogOpen(prev => !prev)
    }

    const handleChange = (e: any) => {
        setContact(prev => ({
            ...prev,
            [e.target.name]: e.target.value,

        }))
    }

    const handleCreate = () => {
        setErrors(null);
        setIsSaving(true);
        axios.post("/contacts/", contact)
            .then((res) => {
                if(onCreate) onCreate(res.data as ContactType);
                setContact({} as ContactType);
                setIsDialogOpen(false);
            })
            .catch(err => {
                setErrors(err.response?.data)
            })
            .finally(() => {
                setIsSaving(false);
            })
    }

    const handleUpdate = () => {
        setErrors(null);
        setIsSaving(true);
        axios.put(`/contacts/${contact.id}/`, contact)
            .then((res) => {
                if(onUpdate) onUpdate(res.data as ContactType);
                setContact(res.data as ContactType);
                setIsDialogOpen(false);
            })
            .catch(err => {
                setErrors(err.response?.data)
            })
            .finally(() => {
                setIsSaving(false);
            })
    }

    const handleDelete = () => {
        setIsSaving(true);
        axios.delete(`/contacts/${contact.id}/`)
        .then(() => {
            if(onDelete) onDelete(contact.id as string)
        })
        .finally(() => setIsSaving(false))
    }


    return (
        <>
            {<ShdButton variant="secondary" onClick={toggleShowDialog}>{children ? children : "Update"}</ShdButton>}
            {isDialogOpen && (
                <Dialog
                    open={isDialogOpen}
                    onClose={toggleShowDialog}
                    fullWidth
                >
                    <ModalTitle onClose={toggleShowDialog}>{isCreate? "Create a Contact" : "Update Contact"}</ModalTitle>
                    <DialogContent dividers>
                        <ContactForm errors={errors} onFieldChange={handleChange} isReadOnly={isReadOnly || isSaving} contact={contact} {...formProps} />
                    </DialogContent>
                    <DialogActions>
                        {!isReadOnly && !isCreate && (
                            <Button
                                size="small"
                                style={{ marginRight: "auto" }}
                                variant="contained"
                                color="error"
                                disabled={isSaving}
                                onClick={handleDelete}
                            >
                                Delete
                            </Button>
                        )}

                        <Button
                            size="small"
                            disabled={isSaving}
                            variant="outlined"
                            color="warning"
                            onClick={() => setIsDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            size="small"
                            variant="contained"
                            onClick={isCreate ? handleCreate: handleUpdate}
                            disabled={isSaving || isReadOnly}
                        >
                            {isCreate ? "Create" : "Save"}
                        </Button>
                    </DialogActions>
                </Dialog>
            )}
        </>
    )
}

export default ContactView;