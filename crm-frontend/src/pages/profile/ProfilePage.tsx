import PageTitle from "@/components/PageTitle";
import UserEmail from "./UserEmail";
import { useSelector } from "react-redux";

// current plan 

// billing information

// password reset 

// email change 

const ProfilePage = () => {
    const { credentials: userData } = useSelector((state: any) => state.user)


    return (
        <div className="max-w-md">
            <PageTitle title="Personal Information"/>
            <UserEmail currentEmail={userData.email} first_name={userData.first_name}/>
        </div>
    )
}

export default ProfilePage