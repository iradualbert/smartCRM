import { useState, useEffect } from "react";
import ContactView from "../../components/ContactView";
import { ContactType } from "@/components/forms/ContactForm";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { parseTime } from "@/lib/utils";
import ImportContacts from "@/pages/contacts/ImportContacts";
import { getCategories, getContacts } from "@/redux/actions/contactActions";
import { useSelector } from "react-redux";
import EmailContactDialog from "./EmailContactDialog";
import CategoryFormDialog from "./CategoryFormDialog";
import { Badge } from "@/components/ui/badge";

// 🔥 shadcn toast
import { useToast } from "@/components/ui/use-toast";

const ContactsManagerPage = () => {
  const [_contacts, setContacts] = useState<any>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const { categories: contactCategories, all_contacts } = useSelector(
    (state: any) => state.contacts
  );

  const { toast } = useToast();

  useEffect(() => {
    getContacts();
    getCategories();
  }, []);

  const showToast = (message: string, variant: "default" | "destructive") => {
    toast({
      title: message,
      variant,
    });
  };

  const handleOnContactCreated = (contact: ContactType) => {
    setContacts((prev) => ({
      ...prev,
      results: [contact, ...(prev?.results || [])],
    }));

    showToast("New Contact Created", "default");
  };

  const handleOnContactUpdated = (updatedContact: ContactType) => {
    setContacts((prev) => ({
      ...prev,
      results: prev.results.map((c: ContactType) =>
        c.id === updatedContact.id ? updatedContact : c
      ),
    }));

    showToast("Contact Updated", "default");
  };

  const handleOnContactDeleted = (id: string | number) => {
    setContacts((prev) => ({
      ...prev,
      results: prev.results.filter((c: ContactType) => c.id !== id),
    }));

    showToast("Contact Deleted", "destructive");
  };

  const categoryId = searchParams.get("categoryId");

  const category = categoryId
    ? contactCategories?.find((cat) => cat.id === parseInt(categoryId))
    : null;

  return (
    <div className="flex flex-col gap-4 bg-muted/30 p-3 md:p-6">
      <h1 className="text-2xl font-semibold">My Contacts</h1>

      <div className="flex gap-8">
        {/* Sidebar */}
        <div className="w-48 flex flex-col gap-4">
          <Button
            variant="ghost"
            onClick={() => setSearchParams({})}
            className="justify-start"
          >
            All
          </Button>

          {contactCategories?.map((cat) => (
            <div key={cat.id} className="flex justify-between items-center">
              <Button
                variant="ghost"
                className="justify-start"
                onClick={() =>
                  setSearchParams({ categoryId: String(cat.id) })
                }
              >
                {cat.name}
              </Button>
              <span className="text-sm text-muted-foreground">
                {cat.total_contacts}
              </span>
            </div>
          ))}

          <CategoryFormDialog>
            <Button className="w-full">+ New Category</Button>
          </CategoryFormDialog>
        </div>

        {/* Main */}
        <div className="flex flex-col gap-6 flex-1">
          {category ? (
            <>
              <h2 className="text-3xl font-bold">{category.name}</h2>

              <div className="flex flex-wrap gap-3">
                <ContactView
                                  onCreate={handleOnContactCreated}
                                  type="create" contact={{
                                      id: undefined,
                                      first_name: "",
                                      last_name: "",
                                      email: "",
                                      company: "",
                                      phone_number: "",
                                      address: ""
                                  }}                >
                  + New Contact
                </ContactView>

                <ImportContacts>
                  <Button variant="outline">Import Contacts</Button>
                </ImportContacts>

                <Button>Send Email →</Button>

                <CategoryFormDialog category={category}>
                  <Button variant="secondary">Update</Button>
                </CategoryFormDialog>

                <Button variant="destructive">Delete Category</Button>
              </div>
            </>
          ) : (
            <h2 className="text-3xl font-bold">All Contacts</h2>
          )}

          {/* Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contact</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Categories</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {all_contacts?.results?.map((contact: any) => (
                <TableRow key={contact.id}>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">
                        {contact.first_name} {contact.last_name}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {contact.email}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>{contact.company}</TableCell>
                  <TableCell>{contact.phone_number}</TableCell>

                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      {contact.categories.map((cat: any) => (
                        <Badge key={cat.id} variant="outline">
                          {cat.name}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>

                  <TableCell>
                    {parseTime(contact.created_at)}
                  </TableCell>

                  <TableCell>
                    <EmailContactDialog contact={contact}>
                      <Button size="sm" variant="secondary">
                        Send Email
                      </Button>
                    </EmailContactDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default ContactsManagerPage;