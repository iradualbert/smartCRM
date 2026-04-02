import axios from "axios";
import { useState, useEffect } from "react";
import DashboardCard from "./dashboard-components/DashboardCard";
import UpcomingAndRecent from "@/components/UpcomingAndRecent";
import MailDashoardPage from "./mails/MailDashboardPage";

const DashboardPage = () => {
  const [dashboardData, setDashboardData] = useState({
    sent_emails: 0,
    scheduled_emails: 0,
    failed_emails: 0,
    total_contacts: 0,
    newsletter_subs: 0,
    mail_templates: 0,
  });

  useEffect(() => {
    axios.get("/accounts/dashboard_data").then((res) => setDashboardData(res.data));
  }, []);

  return <MailDashoardPage />;

  return (
    <div className="bg-muted/30 p-3 md:p-6">
      <h1 className="mb-2 text-3xl font-bold tracking-tight">Dashboard</h1>

      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap gap-3">
          <DashboardCard
            borderBottomColor="success"
            cardTitle="Sent Emails"
            value={dashboardData.sent_emails}
          />
          <DashboardCard
            borderBottomColor="primary"
            cardTitle="Scheduled Emails"
            value={dashboardData.scheduled_emails}
          />
          <DashboardCard
            borderBottomColor="error"
            cardTitle="Failed To Send"
            value={dashboardData.failed_emails}
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <DashboardCard
            borderBottomColor="secondary"
            cardTitle="Contacts"
            value={dashboardData.total_contacts}
          />
          <DashboardCard
            borderBottomColor="success"
            cardTitle="Subscribers"
            value={dashboardData.newsletter_subs}
          />
          <DashboardCard
            borderBottomColor="muted"
            cardTitle="Email Templates"
            value={dashboardData.mail_templates}
          />
        </div>

        <UpcomingAndRecent />
      </div>
    </div>
  );
};

export default DashboardPage;