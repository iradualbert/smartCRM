import axios from "axios";
import { Button } from "@mui/material";
import AddGmailAppPassword from "./forms/AddGmailAppPassword";
import { useEffect } from "react";

const SCOPES = 'https://www.googleapis.com/auth/gmail.send';


const EmailIntergration = () => {

    useEffect(() =>  {}, []);

    const handleGmailClick = async () => {

        window.location.href = 
        "http://localhost:8000/api/accounts/get_google_api_authorization_url?scopes="+SCOPES
        
        // const { data: { authorization_url } } = await axios.post("/accounts/get_google_api_authorization_url", {
        //     scopes: SCOPES
        // })
        // window.location = authorization_url;

        

    }



    return (
        <div>
            <h1>Connect Your Email Address</h1>
            <h5>Choose Your Email Provider</h5>
            <div className="flex gap-10">
               <Button onClick={handleGmailClick}>Connect To Gmail</Button>
            </div>
            <AddGmailAppPassword />
        </div>
    )
}

export default EmailIntergration;