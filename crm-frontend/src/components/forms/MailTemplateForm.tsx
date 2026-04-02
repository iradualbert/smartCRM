import { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { extractParameters, saveMailTemplate } from "@/lib/utils";
import { TemplateParameter } from "@/lib/types";

export type TemplateType = {
  id?: string | number;
  subject: string;
  cc: string;
  bcc: string;
  mailBody: string;
  body?: string;
  name: string;
  parameters: TemplateParameter[];
  templateName?: string;
};

const MailTemplateForm = ({ isCreate = true, selectedTemplate, onChange }: { isCreate?: boolean; selectedTemplate?: TemplateType ; onChange?: (template: TemplateType) => void }) => {
  const [templateName, setTemplateName] = useState("");
  const [subject, setSubject] = useState("");
  const [mailBody, setMailBody] = useState("");
  const [parameters, setParameters] = useState<TemplateParameter[]>([]);

  useEffect(() => {
    getParameters();
  }, [subject, mailBody]);

  useEffect(() => {
    if (selectedTemplate) {
      setParameters(selectedTemplate.parameters);
      setTemplateName(selectedTemplate.templateName as string);
      setSubject(selectedTemplate.subject);
      setMailBody(selectedTemplate.mailBody);
    }
  }, [selectedTemplate]);

  const getParameters = () => {
    const extracted = extractParameters(subject + mailBody);

    const added = extracted.filter(
      (paramName) => !parameters.some((p) => p.name === paramName)
    );

    const newParams = parameters.filter((param) =>
      extracted.some((paramName) => param.name === paramName)
    );

    added.forEach((paramName) => {
      newParams.push({
        name: paramName,
        defaultValue: "",
      });
    });

    setParameters(newParams);

    if (typeof onChange === "function") {
      onChange({
          templateName,
          subject,
          mailBody,
          parameters: newParams,
          cc: "",
          bcc: "",
          name: ""
      });
    }
  };

  const handleSubmit = () => {
    getParameters();

    saveMailTemplate({
      data: {
        subject,
        body: mailBody,
        parameters,
        name: templateName,
      },
      onError: (err: any) => console.error(err),
    });
  };

  const updateParameterDefaultValue = (index: number, newValue: string) => {
    setParameters((currentParams) => {
      const updated = [...currentParams];
      updated[index].defaultValue = newValue;
      return updated;
    });
  };

  return (
    <div className="max-w-[800px] space-y-6">
      {isCreate && (
        <input
          value={templateName}
          onChange={(e) => setTemplateName(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          placeholder="Template Name"
        />
      )}

      <div className="flex flex-col gap-6 md:flex-row">
        {/* Left side */}
        <form className="flex flex-1 flex-col gap-4">
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Mail Subject"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />

          <div className="rounded-md border border-input">
            <ReactQuill
              theme="snow"
              value={mailBody}
              onChange={(value) => setMailBody(value)}
              placeholder="Mail Body"
            />
          </div>
        </form>

        {/* Right side */}
        <div className="w-full md:w-[250px] space-y-3">
          <h3 className="text-lg font-semibold">Parameters</h3>

          {parameters.map((param, idx) => (
            <div className="flex flex-col gap-1" key={param.name}>
              <label className="text-sm font-medium">{param.name}</label>
              <input
                className="rounded-md border border-input bg-background px-2 py-1 text-sm"
                value={param.defaultValue}
                placeholder="Default Value"
                onChange={(e) =>
                  updateParameterDefaultValue(idx, e.target.value)
                }
              />
            </div>
          ))}
        </div>
      </div>

      {isCreate && (
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={getParameters}
            className="rounded-md border border-input px-4 py-2 text-sm hover:bg-muted"
          >
            Preview
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:opacity-90"
          >
            Save
          </button>
        </div>
      )}
    </div>
  );
};

export default MailTemplateForm;