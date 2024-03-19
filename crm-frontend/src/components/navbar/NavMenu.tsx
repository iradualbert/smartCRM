import { Link } from "react-router-dom"
import {
    Menubar,
    MenubarContent,
    MenubarItem,
    MenubarMenu,
    MenubarSeparator,
    MenubarTrigger,
  } from "@/components/ui/menubar"
  import { logoutUser, logoutUserAll } from "@/redux/actions/userActions"
import { useDispatch } from "react-redux"

  type ProfileMenubarProps = {
    user: any,
  }
  
  const ProfileMenubar = ({ user }: ProfileMenubarProps) =>  {
    const dispatch = useDispatch();

    const handleLogout = () => {
        dispatch(logoutUser() as any)
    }

    const handleLogoutAll = () => [
        dispatch(logoutUserAll() as any)
    ]

    return (
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>{user.credentials.first_name.split(" ")[0]}</MenubarTrigger>
          <MenubarContent>
            <MenubarItem inset>
                <Link to="/settings/integration">Email Configuration</Link>
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem inset>
                <Link to="/settings/profile"> Edit Profile</Link>
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem inset>
                <Link to="/settings/password-reset">Change Password</Link>
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem inset onClick={handleLogout}>Logout</MenubarItem>
            <MenubarSeparator />
            <MenubarItem inset onClick={handleLogoutAll}>Logout All</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    )
  }
  

  export default ProfileMenubar