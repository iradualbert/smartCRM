import { useEffect } from "react";
import axios from 'axios';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import store from "./redux/store";
import { checkAuthToken } from "./redux/actions/userActions";
import BookingCalendar from "./pages/booking/BookingPage";
import ContactsManagerPage from "./pages/contacts/ContactsPage";
import SocialManagerPage from "./pages/social-media/SocialManagerPage";
import NewsletterManagerPage from "./pages/newsletter/NewsletterManagerPage";
import MailTemplatesPage from "./pages/mails/MailTemplatesPage";
import NewMailPage from "./pages/mails/NewMailPage";
import EmailIntergration from "./components/EmailIntergration";
import { AuthRoute, PrivateRoute } from "./routes";
import { Provider } from "react-redux";
import LoginPage from "./pages/auth/LoginPage";
import Dashboard from "@/pages/DashboardPage";
import MailDashoardPage from "@/pages/mails/MailDashboardPage";
import AutomationPage from "./pages/automation/AutomationPage";
import LandingPage from "./pages/landing/LandingPage";
import SignupPage from "./pages/auth/SignupPage";
import SubscribePage from "./pages/external_pages/SubscribePage";

const dev = "http://127.0.0.1:8000/api";
axios.defaults.baseURL = dev;

function App() {
  useEffect(() => {
    store.dispatch(checkAuthToken())
  }, [])

  return (
    <Provider store={store}>
      <div className="flex flex-col">
        <Router>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/subs/:linkId" element={<SubscribePage />} />
              <Route path="" element={<PrivateRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/emails" element={<MailDashoardPage />} />
                <Route path="/emails/templates" element={<MailTemplatesPage />} />
                <Route path="/emails/new" element={<NewMailPage />} />
                <Route path="/social-manager" element={<SocialManagerPage />} />
                <Route path="/schedule-manager" element={<BookingCalendar />} />
                <Route path="/contacts-manager" element={<ContactsManagerPage />} />
                <Route path="/newsletter-manager" element={<NewsletterManagerPage />} />
                <Route path="/automation" element={<AutomationPage />} />
                <Route path="/settings/intergration" element={<EmailIntergration />} />
              </Route>
              <Route path="" element={<AuthRoute />}>
                <Route path="/login" element={<LoginPage />} />
              </Route>
              <Route path="" element={<AuthRoute />}>
                <Route path="/signup" element={<SignupPage />} />
              </Route>
            </Routes>
        </Router>
      </div>
    </Provider>

  )
}

export default App
