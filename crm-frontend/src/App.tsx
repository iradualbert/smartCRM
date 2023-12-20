import { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import store from "./redux/store";
import { checkAuthToken } from "./redux/actions/userActions";
import EmailManagerPage from './pages/EmailManagerPage';
import BookingCalendar from "./pages/BookingCalendar";
import axios from 'axios';
import UpcomingAndRecent from "./components/UpcomingAndRecent";
import ContactsManagerPage from "./pages/ContactsPage";
import SocialManagerPage from "./pages/SocialManagerPage";
import NewsletterManagerPage from "./pages/NewsletterManagerPage";
import MailTemplatesPage from "./pages/MailTemplatesPage";
import SettingsPage from "./pages/SettingsPage";
import SendMultipleEmails from "./pages/SendMultipleEmails";
import EmailIntergration from "./components/EmailIntergration";
import { AuthRoute, PrivateRoute } from "./routes";
import { Provider } from "react-redux";
import LoginPage from "./pages/auth/LoginPage";
import Dashboard from "@/pages/DashboardPage";

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
              <Route path="" element={<PrivateRoute />}>
                <Route path="" element={<Dashboard />} />
                <Route path="/mail-manager" element={<EmailManagerPage />} />
                <Route path="/mail-manager/templates" element={<MailTemplatesPage />} />
                <Route path="/mail-manager/send-multiple" element={<SendMultipleEmails />} />
                <Route path="/social-manager" element={<SocialManagerPage />} />
                <Route path="/schedule-manager" element={<BookingCalendar />} />
                <Route path="/contacts-manager" element={<ContactsManagerPage />} />
                <Route path="/newsletter-manager" element={<NewsletterManagerPage />} />
                <Route path="/settings/intergration" element={<EmailIntergration />} />
              </Route>
              <Route path="" element={<AuthRoute />}>
                <Route path="/login" element={<LoginPage />} />
              </Route>
            </Routes>
        </Router>
      </div>
    </Provider>

  )
}

export default App
