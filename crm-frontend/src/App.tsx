import { useEffect } from "react";
import axios from 'axios';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import store from "./redux/store";
import { checkAuthToken } from "./redux/actions/userActions";
import BookingCalendar from "./pages/booking/BookingPage";
import ContactsManagerPage from "./pages/contacts/ContactsPage";
import MailTemplatesPage from "./pages/mails/MailTemplatesPage";
import NewMailPage from "./pages/mails/NewMailPage";
// import EmailsListPage from "./pages/mails/EmailsListPage";
import { AuthRoute, AuthenticatedRoute, MainRoute, PrivateRoute, RootRoute } from "./routes";
import { Provider } from "react-redux";
import { TooltipProvider } from "@/components/ui/tooltip";
import LoginPage from "./pages/auth/LoginPage";
import Dashboard from "./pages/DashboardPage";
import MailDashoardPage from "./pages/mails/MailDashboardPage";

import LandingPage from "./pages/landing-sales/LandingPage";
import SignupPage from "./pages/auth/SignupPage";
import SubscribePage from "./pages/external_pages/SubscribePage";
import ForgotPassword from "./pages/auth/ForgotPassword";
import SelectOrganizationPage from "./pages/auth/SelectOrganizationPage";
import PasswordResetPage from "./pages/auth/PasswordResetPage";
import ProfilePage from "./pages/profile/ProfilePage";
import EmailIntegrationPage from "./pages/profile/EmailIntegrationPage";
import { PrivacyPage, RefundPolicyPage, TermsPage } from "./pages/static_content";
import Footer from "./components/Footer";
import NotFound from "./components/404";
import CreateCompanyPage from "./pages/organizations/CreateOrganizationPage";
import CompanyDetailPage from "./pages/organizations/OrganizationDetailPage";
import CompanySettingsPage from "./pages/organizations/OrganizationSettingsPage";
import CreateQuotationPage from "./pages/sales/quotations/CreateQuotationPage";
import UpdateQuotationPage from "./pages/sales/quotations/UpdateQuotationPage";
import QuotationDetailPage from "./pages/sales/quotations/QuotationDetailPage";
import QuotationListPage from "./pages/sales/quotations/QuotationListPage";
import ContactUsPage from "./pages/landing/ContactUsPage";
import SalesWorkflowLifecycle from "./pages/sales/LifeCycle";
import InvoiceListPage from "./pages/sales/invoices/InvoiceListPage";
import InvoiceDetailPage from "./pages/sales/invoices/InvoiceDetailPage";
import UpdateInvoicePage from "./pages/sales/invoices/UpdateInvoicePage";
import CreateInvoicePage from "./pages/sales/invoices/CreateInvoicePage";

import CreateProformaPage from "./pages/sales/proforma/CreateProformaPage";
import ProformaDetailPage from "./pages/sales/proforma/ProformaDetailPage";
import UpdateProformaPage from "./pages/sales/proforma/UpdateProformaPage";
import CreateReceiptPage from "./pages/sales/receipts/CreateReceiptPage";
import ReceiptDetailPage from "./pages/sales/receipts/ReceiptDetailPage";
import ReceiptListPage from "./pages/sales/receipts/ReceiptListPage";
import UpdateReceiptPage from "./pages/sales/receipts/UpdateReceiptPage";
import CreateDeliveryNotePage from "./pages/sales/delivery-notes/CreateDeliveryNotePage";
import DeliveryNoteDetailPage from "./pages/sales/delivery-notes/DeliveryNoteDetailPage";
import UpdateDeliveryNotePage from "./pages/sales/delivery-notes/UpdateDeliveryNotePage";
import DeliveryNoteListPage from "./pages/sales/delivery-notes/DeliveryNotePageList";
import ReceiptEmailPage from "./pages/sales/receipts/ReceiptEmailPage";
import DeliveryNoteEmailPage from "./pages/sales/delivery-notes/DeliveryNoteEmailPage";
import ProformaListPage from "./pages/sales/proforma/ProformaListPage";
import UpdateTemplatePage from "./pages/sales/templates/UpdateTemplatePage";
import TemplateDetailPage from "./pages/sales/templates/TemplateDetailPage";
import CreateTemplatePage from "./pages/sales/templates/CreateTemplatePage";
import TemplateListPage from "./pages/sales/templates/TemplateListPage";
import QuotationEmailPage from "./pages/sales/quotations/QuotationEmailPage";
import InvoiceEmailPage from "./pages/sales/invoices/InvoiceEmailPage";
import ProformaEmailPage from "./pages/sales/proforma/ProformaEmailPage";
import OrganizationListPage from "@/pages/organizations/OrganizationListPage";
import ProductDetailPage from "./pages/crm/products/ProductDetailPage";
import ProductListPage from "./pages/crm/products/ProductListPage";
import CustomerListPage from "./pages/crm/customers/CustomerListPage";
import CustomerDetailPage from "./pages/crm/customers/CustomerDetailPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import SalesDashboardPage from "./pages/sales/sales-dashboard/SalesDashboardPages";

import EmailSendingConfigPage from "./pages/organizations/email-config/EmailSendingConfigPage";
import BillingCallbackPage from "./pages/billing/BillingCallbackPage";
import BillingPage from "./pages/billing/BillingPage";
import OrganizationDetailPage from "./pages/organizations/OrganizationDetailPage";
import EmailsListPage from "./pages/emails/EmailsListPage";

const dev = "http://127.0.0.1:8000/api";
const prod = location.origin + "/api";


axios.defaults.baseURL = location.hostname === "localhost" ? dev : prod



function App() {
  useEffect(() => {
    store.dispatch(checkAuthToken())
  }, [])

  return (
    <Provider store={store}>
      <TooltipProvider delayDuration={200}>
      <div className="flex flex-col">
        <Router>
          <Routes>
            <Route path="/" element={<RootRoute />} />
            <Route path="" element={<MainRoute />}>
              <Route path="/landing" element={<LandingPage />} />
              <Route path="/contact-us" element={<ContactUsPage />} />
              <Route path="/subs/:linkId" element={<SubscribePage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/privacy-policy" element={<PrivacyPage />} />
              <Route path="/refund-policy" element={<RefundPolicyPage />} />
              <Route path="/sales-workflow" element={<SalesWorkflowLifecycle />} />

              <Route path="*" element={<NotFound />} />
            </Route>
            <Route path="" element={<PrivateRoute />}>

              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/sales-dashboard" element={<SalesDashboardPage />} />
           
              <Route path="/mail-dashboard" element={<Dashboard />} />
              {/* <Route path="/emails" element={<MailDashoardPage />} /> */}
              <Route path="/emails/templates" element={<MailTemplatesPage />} />
              <Route path="/emails/new" element={<NewMailPage />} />

              <Route path="/schedule-manager" element={<BookingCalendar />} />
              <Route path="/contacts-manager" element={<ContactsManagerPage />} />
              <Route path="/settings/integration" element={<EmailIntegrationPage />} />
              <Route path="/settings/profile" element={<ProfilePage />} />
              <Route path="/settings/password-reset" element={<PasswordResetPage />} />

             

              <Route path="/settings/organizations" element={<OrganizationListPage />} />
              <Route path="/settings/organizations/new" element={<CreateCompanyPage />} />
              <Route path="/settings/organizations/:id" element={<CompanyDetailPage />} />
              <Route path="/settings/organizations/:id/settings" element={<CompanySettingsPage />} />

              <Route path="/quotations" element={<QuotationListPage />} />
              <Route path="/quotations/new" element={<CreateQuotationPage />} />
              <Route path="/quotations/:id" element={<QuotationDetailPage />} />
              <Route path="/quotations/:id/edit" element={<UpdateQuotationPage />} />
              <Route path="/quotations/:id/email" element={<QuotationEmailPage />} />


              <Route path="/proformas" element={<ProformaListPage />} />
              <Route path="/proformas/new" element={<CreateProformaPage />} />
              <Route path="/proformas/:id" element={<ProformaDetailPage />} />
              <Route path="/proformas/:id/edit" element={<UpdateProformaPage />} />
              <Route path="/proformas/:id/email" element={<ProformaEmailPage />} />







              <Route path="/invoices" element={<InvoiceListPage />} />
              <Route path="/invoices/new" element={<CreateInvoicePage />} />
              <Route path="/invoices/:id/edit" element={<UpdateInvoicePage />} />
              <Route path="/invoices/:id" element={<InvoiceDetailPage />} />
              <Route path="/invoices/:id/email" element={<InvoiceEmailPage />} />


              <Route path="/receipts" element={<ReceiptListPage />} />
              <Route path="/receipts/new" element={<CreateReceiptPage />} />
              <Route path="/receipts/:id" element={<ReceiptDetailPage />} />
              <Route path="/receipts/:id/edit" element={<UpdateReceiptPage />} />
              <Route path="/receipts/:id/email" element={<ReceiptEmailPage />} />

              <Route path="/delivery-notes" element={<DeliveryNoteListPage />} />
              <Route path="/delivery-notes/new" element={<CreateDeliveryNotePage />} />
              <Route path="/delivery-notes/:id" element={<DeliveryNoteDetailPage />} />
              <Route path="/delivery-notes/:id/edit" element={<UpdateDeliveryNotePage />} />
              <Route path="/delivery-notes/:id/email" element={<DeliveryNoteEmailPage />} />

              <Route path="/templates" element={<TemplateListPage />} />
              <Route path="/templates/new" element={<CreateTemplatePage />} />
              <Route path="/templates/:id" element={<TemplateDetailPage />} />
              <Route path="/templates/:id/edit" element={<UpdateTemplatePage />} />

              <Route path="/products" element={<ProductListPage />} /> 
              <Route path="/products/:id" element={<ProductDetailPage />} />

              <Route path="/customers" element={<CustomerListPage />} />
              <Route path="/customers/:id" element={<CustomerDetailPage />} />

              
              <Route path="/emails" element={<EmailsListPage />} />

              <Route path="/settings" element={<OrganizationDetailPage />} />
              <Route path="/settings/email" element={<EmailSendingConfigPage />} />
              <Route path="/settings/billing" element={<BillingPage />} />
              <Route path="/settings/billing/callback" element={<BillingCallbackPage />} />



            </Route>
            <Route path="" element={<AuthRoute />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/accounts/forgot-password" element={<ForgotPassword />} />
              <Route path="/accounts/password-reset/:uid/:token" element={<PasswordResetPage />} />
            </Route>
            <Route path="" element={<AuthenticatedRoute />}>
              <Route path="/select-organization" element={<SelectOrganizationPage />} />
            </Route>
          </Routes>
          <Footer />
        </Router>
      </div>
      </TooltipProvider>
    </Provider>

  )
}

export default App
