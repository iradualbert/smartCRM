import { useSelector } from "react-redux";


// return default company
// return all companies 

export const useOrganizations= () => {
    
    const { user: { organizations } } = useSelector((state: any) => state);
    
    return {
        organizations,
        defaultOrganization: organizations[0] || null
    }

}