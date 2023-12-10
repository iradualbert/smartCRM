import MailTemplateForm from "@/components/forms/MailTemplateForm";
import { Typography, Button, TextField } from "@mui/material";
import { useState } from "react";
import RecipientsTable from "@/components/RecipientTable";
import ImportTemplate from "@/components/ImportTemplate";
import ContactsImporter from "@/components/ContactsImporter";


const SendMultipleEmails = () => {
  const [recepients, setRecepients] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [template, setTemplate] = useState({
    id: undefined,
    templateName: "",
    subject: "",
    mailBody: "",
    parameters: []
  })
  const [willSaveTemplate, setWillSaveTemplate] = useState(false);
  const [scheduledTime, setScheduledTime] = useState("");
  const [isMultiple, setIsMultiple] = useState("");
  const [importedFiles, setImportedFiles] = useState([]);

  const handleSelect = (template: object) => {
    const newTemplate = {
      id: template.id,
      templateName: template.name,
      subject: template.subject,
      mailBody: template.body,
      parameters: template.parameters
    }
    setSelectedTemplate(newTemplate)
    setTemplate(newTemplate)
  }

  const handleChange = template => {
    setTemplate(template)
  }

  return (
    <div className="flex flex-col gap-4">
      <Typography variant="h3" marginBottom={4}>Send & Schedule Email</Typography>
      <div className="flex gap-10">
        <Button variant="outlined">Send</Button>
        <Button variant="outlined">Send Later</Button>
      </div>
      <Typography variant="h5">Mail Content</Typography>
      <ImportTemplate onSelect={handleSelect} />
      <MailTemplateForm
        isCreate={false}
        selectedTemplate={selectedTemplate}
        onChange={handleChange}
      />
      <div>
        <TextField placeholder="recipients" />
        <ContactsImporter />
        <Button>Contacts</Button>
      </div>
      <RecipientsTable parameters={template.parameters} />
    </div>
  )
}

export default SendMultipleEmails