import MailTemplateForm from "@/components/forms/MailTemplateForm";
import { Typography } from "@mui/material";

const MailTemplatesPage = () => {
  return (
    <div className="flex flex-col">
        <Typography variant="h3" marginBottom={5}>Create New Template</Typography>
        <MailTemplateForm />
    </div>
  )
}

export default MailTemplatesPage