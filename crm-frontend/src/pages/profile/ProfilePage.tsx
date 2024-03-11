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
        <div className="flex flex-col gap-10 py-6 items-center">
            <div className="flex flex-col gap-10 max-w-lg">
                <h1 className="text-3xl font-bold">User Information</h1>
                <PageTitle title="Personal Information" />
                <UserEmail currentEmail={userData.email} first_name={userData.first_name} />
            </div>
        </div>
    )
}


export default ProfilePage