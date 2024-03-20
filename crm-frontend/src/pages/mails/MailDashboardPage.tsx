import "./mailstyle.css";
import { useDashboardData } from "@/lib/hooks";
import DashboardCard from "../dashboard-components/DashboardCard";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import PageTitle from "@/components/PageTitle";
import MailHistoryTable from "./MailHistoryTable";
import NoEmailConfigDialog from "@/components/NoEmailConfigDialog";


const MailDashoardPage = () => {

    const dashboard = useDashboardData();


    return (
        <div>
            <PageTitle title="Emails - Dashboard" />
            <NoEmailConfigDialog />
            <h1 className=" text-3xl font-bold">Dashboard</h1>
            <div className="flex gap-5 mt-10">
                <Link to="/emails/new?type=single">
                    <Button size="lg">Send & Schedule Email</Button>
                </Link>
                <Link to="/emails/new?type=multiple">
                    <Button size="lg" variant="outline">+ New Bulk Emails</Button>
                </Link>
            </div>
            <div className="flex flex-wrap gap-4 mb-6 mt-7 md:mb-10">
                <DashboardCard
                    cardTitle="SENT"
                    value={dashboard.data.sent_emails}
                    borderBottomColor="success.main"
                />
                <DashboardCard
                    cardTitle="SCHEDULED"
                    value={dashboard.data.scheduled_emails}
                    borderBottomColor="primary.main"
                />
                <DashboardCard
                    cardTitle="FAILED"
                    value={dashboard.data.failed_emails}
                    borderBottomColor="warning.main"
                />
                <DashboardCard
                    cardTitle="DAILY LIMIT"
                    value={`${dashboard.data.max_emails_per_day - dashboard.data.emails_sent_today}`}
                    borderBottomColor="secondary.main"
                />
            </div>    
            <div className="flex gap-4 flex-wrap">
                <MailHistoryTable />
            </div>

        </div>
    )
}

export default MailDashoardPage;