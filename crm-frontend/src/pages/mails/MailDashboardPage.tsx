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
            <h1 className=" text-4xl font-bold">Email Dashboard</h1>

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

            <div className="flex gap-5 mt-10">
                <Link to="/emails/new?type=single">
                    <Button size="lg" variant="secondary">Send & Schedule Email</Button>
                </Link>
                <Link to="/emails/new?type=multiple">
                    <Button size="lg" variant="outline">+ New Bulk Emails</Button>
                </Link>
            </div>
            
            <div className="flex gap-4 flex-wrap">
                <MailHistoryTable />
            </div>

        </div>
    )
}

export default MailDashoardPage;