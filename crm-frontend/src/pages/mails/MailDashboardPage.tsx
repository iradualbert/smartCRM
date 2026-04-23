import "./mailstyle.css";
import { useDashboardData } from "@/lib/hooks";
import DashboardCard from "../dashboard-components/DashboardCard";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import PageTitle from "@/components/PageTitle";
import MailHistoryTable from "./MailHistoryTable";
import NoEmailConfigDialog from "@/components/NoEmailConfigDialog";


const MailDashoardPage = () => {

    const { data, isLoading, error } = useDashboardData();

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

            {error ? (
                <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                    {error}
                </div>
            ) : isLoading ? (
                <div className="mt-6 flex items-center gap-2 text-sm text-slate-500">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
                    Loading dashboard...
                </div>
            ) : (
                <div className="flex flex-wrap gap-4 mb-6 mt-7 md:mb-10">
                    <DashboardCard
                        cardTitle="SENT"
                        value={data.sent_emails}
                        borderBottomColor="success.main"
                    />
                    <DashboardCard
                        cardTitle="SCHEDULED"
                        value={data.scheduled_emails}
                        borderBottomColor="primary.main"
                    />
                    <DashboardCard
                        cardTitle="FAILED"
                        value={data.failed_emails}
                        borderBottomColor="warning.main"
                    />
                    <DashboardCard
                        cardTitle="DAILY LIMIT"
                        value={`${data.max_emails_per_day - data.emails_sent_today}`}
                        borderBottomColor="secondary.main"
                    />
                </div>
            )}

            <div className="flex gap-4 flex-wrap">
                <MailHistoryTable />
            </div>

        </div>
    )
}

export default MailDashoardPage;