import { useEffect } from "react";
import axios from 'axios';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import store from "./redux/store";
import { checkAuthToken } from "./redux/actions/userActions";
import BookingCalendar from "./pages/booking/BookingPage";
import ContactsManagerPage from "./pages/contacts/ContactsPage";
import MailTemplatesPage from "./pages/mails/MailTemplatesPage";
import NewMailPage from "./pages/mails/NewMailPage";
import { AuthRoute, MainRoute, PrivateRoute } from "./routes";
import { Provider } from "react-redux";
import LoginPage from "./pages/auth/LoginPage";
import Dashboard from "./pages/DashboardPage";
import MailDashoardPage from "./pages/mails/MailDashboardPage";

import LandingPage from "./pages/landing/LandingPage";
import SignupPage from "./pages/auth/SignupPage";
import SubscribePage from "./pages/external_pages/SubscribePage";
import ForgotPassword from "./pages/auth/ForgotPassword";
import PasswordResetPage from "./pages/auth/PasswordResetPage";
import ProfilePage from "./pages/profile/ProfilePage";
import EmailIntegrationPage from "./pages/profile/EmailIntegrationPage";
import { PrivacyPage, RefundPolicyPage, TermsPage } from "./pages/static_content";
import Footer from "./components/Footer";
import NotFound from "./components/404";
import CreateCompanyPage from "./pages/sales/companies/CreateCompanyPage";
import CompanyListPage from "@/pages/sales/companies/CompanyListPage";
import CompanyDetailPage from "./pages/sales/companies/CompanyDetailPage";
import CompanySettingsPage from "./pages/sales/companies/CompanySettingsPage";
import CreateQuotationPage from "./pages/sales/quotations/CreateQuotationPage";
import UpdateQuotationPage from "./pages/sales/quotations/UpdateQuotationPage";
import QuotationDetailPage from "./pages/sales/quotations/QuotationDetailPage";
import SalesDashboardPage from "./pages/sales/SalesDashboardPage";
import QuotationListPage from "./pages/sales/quotations/QuotationListPage";

const dev = "http://127.0.0.1:8000/api";
const prod = location.origin + "/api";


axios.defaults.baseURL =location.hostname === "localhost" ? dev : prod



function App() {
  useEffect(() => {
    store.dispatch(checkAuthToken())
  }, [])

  return (
    <Provider store={store}>
      <div className="flex flex-col">
        <Router>
          <Routes>
            <Route path="" element={<MainRoute />}>
              <Route path="/landing" element={<LandingPage />} />
              <Route path="/subs/:linkId" element={<SubscribePage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/privacy-policy" element={<PrivacyPage />} />
              <Route path="/refund-policy" element={<RefundPolicyPage />} />
              <Route path="*" element={<NotFound />} />
            </Route>
            <Route path="" element={<PrivateRoute />}>
              <Route path="" element={<SalesDashboardPage />} />
              <Route path="/mail-dashboard" element={<Dashboard />} />
              <Route path="/emails" element={<MailDashoardPage />} />
              <Route path="/emails/templates" element={<MailTemplatesPage />} />
              <Route path="/emails/new" element={<NewMailPage />} />
             
              <Route path="/schedule-manager" element={<BookingCalendar />} />
              <Route path="/contacts-manager" element={<ContactsManagerPage />} />
              <Route path="/settings/integration" element={<EmailIntegrationPage />} />
              <Route path="/settings/profile" element={<ProfilePage />} />
              <Route path="/settings/password-reset" element={<PasswordResetPage />} />

              <Route path="/sales" element={<SalesDashboardPage />} />

              <Route path="/companies" element={<CompanyListPage />} />
              <Route path="/companies/new" element={<CreateCompanyPage />} />
              <Route path="/companies/:id" element={<CompanyDetailPage />} />
              <Route path="/companies/:id/settings" element={<CompanySettingsPage />} />

              <Route path="/quotations" element={<QuotationListPage />} />
              <Route path="/quotations/new" element={<CreateQuotationPage />} />
              <Route path="/quotations/:id" element={<QuotationDetailPage />} />
              <Route path="/quotations/:id/edit" element={<UpdateQuotationPage />} />

            </Route>
            <Route path="" element={<AuthRoute />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/accounts/forgot-password" element={<ForgotPassword />} />
              <Route path="/accounts/password-reset/:uid/:token" element={<PasswordResetPage />} />
            </Route>
          </Routes>
          <Footer />
        </Router>
      </div>
    </Provider>

  )
}

export default App
