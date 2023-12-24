import {useApiListView } from "@/lib/hooks";

const MailDashoardPage = () => {

    const api = useApiListView("/mail-service");

    return (
        <h1>Mail Dashoard</h1>
    )
}

export default MailDashoardPage;