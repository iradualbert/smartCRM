import { useState, useEffect } from "react";
import TextField from "@mui/material/TextField";
import { Typography, Button } from "@mui/material";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { extractParameters, saveMailTemplate } from "@/lib/utils"
import { TemplateParameter } from "@/lib/types";


export type TemplateType = {
    id?: string | number,
    subject: string,
    cc: string,
    bcc: string,
    mailBody: string,
    body?: string,
    name: string,
    parameters: TemplateParameter[],
}



const MailTemplateForm = ({ isCreate = true, selectedTemplate, onChange }) => {
    const [templateName, setTemplateName] = useState("");
    const [subject, setSubject] = useState("");
    const [mailBody, setMailBody] = useState("");
    const [parameters, setParameters] = useState<TemplateParameter[]>([])

    useEffect(() => {
        getParameters();
    }, [subject, mailBody])

    useEffect(() => {
        if (selectedTemplate) {
            setParameters(selectedTemplate.parameters)
            setTemplateName(selectedTemplate.templateName)
            setSubject(selectedTemplate.subject)
            setMailBody(selectedTemplate.mailBody)
        }
    }, [selectedTemplate])

    const getParameters = () => {
        const extracted = extractParameters(subject + mailBody);
        const added = extracted.filter(paramName => !parameters.some(p => p.name === paramName));
        const newParams = parameters.filter(param => extracted.some(paramName => param.name === paramName));
        added.forEach((paramName) => {
            newParams.push({
                name: paramName,
                defaultValue: ""
            })
        })
        setParameters(newParams);
        if (typeof onChange === "function") {
            onChange({
                templateName,
                subject,
                mailBody,
                parameters: newParams
            })
        };
    }

    const handleSubmit = () => {
        getParameters();
        saveMailTemplate({
            data: {
                subject,
                body: mailBody,
                parameters,
                name: templateName
            },
            onError: err => console.error(err)
        })
    }

    const updateParameterDefaultValue = (index, newValue) => {
        console.log(newValue)
        setParameters(currentParams => {
            const _currentParams = [...currentParams]
            _currentParams[index].defaultValue = newValue;
            return _currentParams
        })
    }

    return (
        <div style={{ maxWidth: 800 }}>
            {isCreate &&
                <input value={templateName} onChange={e => setTemplateName(e.target.value)} className="input w-full" placeholder="Template Name" />
            }
            <div className="flex justify-between gap-4">
                <form className="flex flex-1 flex-col gap-4">
                    <TextField
                        fullWidth
                        value={subject}
                        onChange={e => setSubject(e.target.value)}
                        placeholder="Mail Subject" />

                    <ReactQuill
                        placeholder="Mail Body"
                        className="mb-12"
                        onChange={value => setMailBody(value)}
                        value={mailBody}
                    />
                </form>
                <div className="flex flex-col">
                    <Typography variant="h6">Parameters</Typography>
                    {parameters.map((param, idx) => {
                        return (
                            <div className="flex" key={param.name}>
                                <label className="label">{param.name}</label>
                                <input
                                    className="input"
                                    value={param.defaultValue}
                                    placeholder="Default Value"
                                    onChange={e => updateParameterDefaultValue(idx, e.target.value)}
                                />
                            </div>
                        )
                    })}
                </div>
            </div>
            {isCreate &&
                <div className="flex mt-14 gap-4">
                    <Button variant="outlined" onClick={getParameters}>Preview</Button>
                    <Button variant="contained" onClick={handleSubmit}>Save</Button>
                </div>
            }


        </div>
    )

};

export default MailTemplateForm;