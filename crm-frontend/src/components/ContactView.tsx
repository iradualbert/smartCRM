import React, { useState } from "react";
import axios from "axios";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import ModalTitle from "./ui/ModalTitle";
import ContactForm, {
  ContactFormProps,
  ContactType,
} from "./forms/ContactForm";

interface ContactViewProps extends ContactFormProps {
  children?: React.ReactNode;
  onCreate?: (contact: ContactType) => void;
  onUpdate?: (contact: ContactType) => void;
  onDelete?: (id: number | string) => void;
}

const ContactView = ({
  children,
  onUpdate,
  onCreate,
  onDelete,
  contact: initialContact,
  isReadOnly,
  ...formProps
}: ContactViewProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [contact, setContact] = useState<ContactType>(
    initialContact || ({} as ContactType)
  );
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<any>(null);

  const isCreate = formProps.type === "create";

  const toggleShowDialog = () => {
    setErrors(null);
    if (!isCreate) setContact(initialContact);
    setIsDialogOpen((prev) => !prev);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setContact((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleCreate = () => {
    setErrors(null);
    setIsSaving(true);

    axios
      .post("/contacts/", contact)
      .then((res) => {
        if (onCreate) onCreate(res.data as ContactType);
        setContact({} as ContactType);
        setIsDialogOpen(false);
      })
      .catch((err) => {
        setErrors(err.response?.data);
      })
      .finally(() => {
        setIsSaving(false);
      });
  };

  const handleUpdate = () => {
    setErrors(null);
    setIsSaving(true);

    axios
      .put(`/contacts/${contact.id}/`, contact)
      .then((res) => {
        if (onUpdate) onUpdate(res.data as ContactType);
        setContact(res.data as ContactType);
        setIsDialogOpen(false);
      })
      .catch((err) => {
        setErrors(err.response?.data);
      })
      .finally(() => {
        setIsSaving(false);
      });
  };

  const handleDelete = () => {
    setIsSaving(true);

    axios
      .delete(`/contacts/${contact.id}/`)
      .then(() => {
        if (onDelete) onDelete(contact.id as string);
        setIsDialogOpen(false);
      })
      .finally(() => setIsSaving(false));
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" onClick={toggleShowDialog}>
          {children ? children : "Update"}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[600px]">
        <ModalTitle onClose={toggleShowDialog}>
          {isCreate ? "Create a Contact" : "Update Contact"}
        </ModalTitle>

        <div className="max-h-[70vh] overflow-y-auto py-2">
          <ContactForm
            errors={errors}
            onFieldChange={handleChange}
            isReadOnly={isReadOnly || isSaving}
            contact={contact}
            {...formProps}
          />
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
          <div className="mr-auto">
            {!isReadOnly && !isCreate && (
              <Button
                variant="destructive"
                disabled={isSaving}
                onClick={handleDelete}
              >
                Delete
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={isSaving}
              onClick={() => setIsDialogOpen(false)}
            >
              Cancel
            </Button>

            <Button
              onClick={isCreate ? handleCreate : handleUpdate}
              disabled={isSaving || isReadOnly}
            >
              {isCreate ? "Create" : "Save"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ContactView;