import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import SideBar from './components/SideBar';
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

const dev = "http://127.0.0.1:8000/api";
axios.defaults.baseURL = dev;

function App() {
  return (
    <div className="flex flex-col">
      <Router>
        <SideBar />
        <div className="m-16 p-10">
          <Routes>
            <Route path="/mail-manager" element={<EmailManagerPage />} />
            <Route path="/mail-manager/templates" element={<MailTemplatesPage />} />
            <Route path="/mail-manager/send-multiple" element={<SendMultipleEmails />} />
            <Route path="/social-manager" element={<SocialManagerPage />} />
            <Route path="/schedule-manager" element={<BookingCalendar />} />
            <Route path="/contacts-manager" element={<ContactsManagerPage />} />
            <Route path="/newsletter-manager" element={<NewsletterManagerPage />} />
            <Route path="/settings/intergration" element={<EmailIntergration />} />
           </Routes>
        </div>
      </Router>
    </div>
  )
}

export default App
