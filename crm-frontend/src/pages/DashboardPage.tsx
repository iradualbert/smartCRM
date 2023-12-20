import axios from "axios";
import { useState, useEffect } from "react";
import DashboardCard from "./dashboard-components/DashboardCard"
import { Typography } from "@mui/material";

const DashboardPage = () => {
    const [dashboardData, setDashboardData] = useState({});

    useEffect(() => {
        axios.get("/accounts/dashboard_data")
            .then(res => setDashboardData(res.data))
    }, [])

    return (
        <div className="bg-gray-50 p-3 md:p-6">
            <Typography variant="h4" marginBottom={2}>Dashboard</Typography>
            <div className="flex flex-col gap-5">
                <div className="flex gap-3 flex-wrap">
                    <DashboardCard borderBottomColor="success.main" cardTitle="Sent Emails" value={dashboardData.sent_emails} />
                    <DashboardCard borderBottomColor="primary.main" cardTitle="Scheduled Emails" value={dashboardData.scheduled_emails} />
                    <DashboardCard borderBottomColor="error.main" cardTitle="Failed To Send" value={dashboardData.failed_emails} />
                </div>
                <div className="flex gap-3 flex-wrap">
                    <DashboardCard borderBottomColor="secondary.main" cardTitle="Contacts" value={dashboardData.total_contacts} />
                    <DashboardCard borderBottomColor="success.main" cardTitle="Subscribers" value={dashboardData.newsletter_subs} />
                    <DashboardCard borderBottomColor="grey.500" cardTitle="Email Templates" value={dashboardData.mail_templates} />
                </div>

            </div>
        </div>

    )
}

export default DashboardPage