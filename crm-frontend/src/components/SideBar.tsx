import { Link } from "react-router-dom";
import { TfiEmail } from "react-icons/tfi";
import { IoShareSocialSharp } from "react-icons/io5";
import { BsNewspaper, BsFillCalendarDateFill } from "react-icons/bs";
import { SiChatbot } from "react-icons/si";
import { IoIosContacts, IoMdSettings } from "react-icons/io";
import { FaHome } from "react-icons/fa";
import { SiAutomattic } from "react-icons/si";


const SideBar = () => {
    return (
        <div className="fixed top-0 left-0 h-screen w-16 m-0 flex flex-col shadow-lg text-white bg-black z-20">
            <SideBarIcon icon={<FaHome size={30} />} text="Home" to="/" />
            <SideBarIcon icon={<TfiEmail size={30} />} text="Emails" to="/emails" />
            <SideBarIcon icon={<IoShareSocialSharp size={30} />} text="Social Manager" to="/social-manager" />
            <SideBarIcon icon={<IoIosContacts size={30} />} text="Contacts: Send Emails, Schedule Meetings" to="/contacts-manager" />
            <SideBarIcon icon={<BsNewspaper size={30} />} text="Newsletter" to="/newsletter-manager"/>
            <SideBarIcon icon={<BsFillCalendarDateFill size={30} />} text="Calendar" to="/schedule-manager"/>
            <SideBarIcon icon={<SiChatbot size={30} />} text="ChatBot" to=""/>
            <SideBarIcon icon={<SiAutomattic size={30} /> } text="Automation" to="/automation"/>
            <SideBarIcon icon={<IoMdSettings size={30} />} text="Settings" to="/settings/integration" />
        </div>
    )

}

const SideBarIcon = ({ icon, text, to }: { icon: React.ReactNode, text: string, to: string}) => {
    return (
        <div className="sidebar-icon group">
            <Link to={to}>
                {icon}
                <span className="sidebar-tooltip group-hover:scale-100">
                    {text}
                </span>
            </Link>
        </div>
    )
}

export default SideBar;