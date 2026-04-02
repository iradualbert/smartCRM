import MailTemplateForm from "@/components/forms/MailTemplateForm";

const MailTemplatesPage = () => {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">
        Create New Template
      </h1>

      <MailTemplateForm />
    </div>
  );
};

export default MailTemplatesPage;