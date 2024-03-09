import { useSearchParams } from "react-router-dom";
import 'react-quill/dist/quill.snow.css';
import MailForm from "./MailForm";
import BulkMailForm from "./BulkMailForm";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NewMailPage = () => {

    const [searchParams, _] = useSearchParams();
    const isBulk = searchParams.get('type') === "multiple";
    
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
            </div>
            
            {isBulk ? <BulkMailForm /> : <MailForm />}
        </section>
    )
}


export default NewMailPage;