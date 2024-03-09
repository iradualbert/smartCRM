import "./mailstyle.css";
import { useApiListView, useDashboardData } from "@/lib/hooks";
import { useEffect, useRef, useState } from "react";
import MailForm from "@/components/forms/MailForm";
import DashboardCard from "../dashboard-components/DashboardCard";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import PageTitle from "@/components/PageTitle";
import MailHistoryTable from "./MailHistoryTable";


const MailDashoardPage = () => {

    const dashboard = useDashboardData();
    const [selectedMail, setSelectedMail] = useState(null);
    const mailFormRef = useRef();


    return (
        <div>
            <PageTitle title="Emails - Dashboard" />
            <h1 className="text-3xl font-bold">Email Dashboard</h1>
            <div className="flex gap-4 mt-6 mb-5 md:mb-10">
                <DashboardCard
                    cardTitle="Sent"
                    value={dashboard.data.sent_emails}
                    borderBottomColor="success.main"
                />
                <DashboardCard
                    cardTitle="Scheduled"
                    value={dashboard.data.scheduled_emails}
                    borderBottomColor="primary.main"
                />
                <DashboardCard
                    cardTitle="Failed"
                    value={dashboard.data.failed_emails}
                    borderBottomColor="warning.main"
                />
            </div>
            <div className="flex gap-3 mb-7">
                <Link to="/emails/new?type=single">
                    <Button size="lg" variant="outline">Send & Schedule Email</Button>
                </Link>
                <Link to="/emails/new?type=multiple">
                    <Button size="lg" variant="outline">Send Multiple Emails</Button>
                </Link>
            </div>

            <div className="flex gap-4 flex-wrap">
                <MailHistoryTable />
                {selectedMail && (
                    <div className="flex flex-col gap-2 p-3" ref={mailFormRef}>
                        <div className="flex">
                            Status: Sent Today at 7:32 AM
                            <Button variant="outline" >Close</Button>
                        </div>
                        <div>
                            <MailForm isReadOnly data={selectedMail} showAttachments />
                        </div>

                    </div>

                )}
            </div>

        </div>
    )
}

export default MailDashoardPage;