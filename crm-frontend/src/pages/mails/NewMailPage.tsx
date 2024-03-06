import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import ImportTemplate from "@/components/ImportTemplate";
import 'react-quill/dist/quill.snow.css';
import { TemplateType } from "../../components/forms/MailTemplateForm";
import { TemplateParameter } from "@/lib/types";
import MailForm from "./MailForm";
import BulkMailForm from "./BulkMailForm";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getUpdatedParams } from "@/lib/utils";

const NewMailPage = () => {
    const [searchParams, _] = useSearchParams();
    const [subject, setSubject] = useState("");
    const [CC, setCC] = useState("");
    const [mailBody, setMailBody] = useState("");
    const [templateParameters, setTemplateParameters] = useState<TemplateParameter[]>([]);
    
    const isBulk = searchParams.get('type') === "multiple";


    const handleOnTemplateSelect = (template: TemplateType) => {
        setSubject(template.subject)
        setMailBody(template.body as string)
        setTemplateParameters(template.parameters)
    }

    return (
        <section className="bg-primary-50 bg-dotted-pattern bg-center bg-cover py-2  md:py-3">
            <h1 className="text-4xl font-bold mb-10">Send & Schedule Emails</h1>
            <div className="flex gap-6">
                <Link to="/emails/new?type=single">
                    <Button variant={isBulk ? "outline": "default"}>Single Email</Button>
                </Link>
                <Link to="/emails/new?type=multiple">
                    <Button variant={ isBulk ? "default" : "outline"}>{"Bulk Emails (multiple)"}</Button>
                </Link>
                <ImportTemplate onSelect={handleOnTemplateSelect} />
            </div>
            
            {isBulk ? <BulkMailForm /> : <MailForm />}
        </section>
    )
}


export default NewMailPage;