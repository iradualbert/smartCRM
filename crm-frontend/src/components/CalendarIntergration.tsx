import { useState, useEffect } from "react";
import { Button } from "@mui/material";
// const SCOPES =
//     "https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar";

const SCOPES = "https://www.googleapis.com/auth/calendar.readonly"

const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';

const CLIENT_ID = "917346278754-ush9di1hdqsdl7gfhmsmaq103liikc45.apps.googleusercontent.com";
const API_KEY = "AIzaSyBt8sNX2gfqcTPRGcIbLzAbaOHfki90meI";

const LoginWithGoogleButton = () => {
    const [tokenClient, setTokenClient] = useState(null);
    const [isGisInited, setIsGisInited] = useState(false);
    const [isGapiInited, setIsGapiInited] = useState(false);

    useEffect(() => {
        const script = document.createElement("script");
        script.async = true;
        script.defer = true;
        script.src = "https://accounts.google.com/gsi/client";
        document.body.appendChild(script);
        script.addEventListener("load", onGsiLoaded);
        const script1 = document.createElement("script");
        script1.async = true;
        script1.defer = true;
        script1.src = "https://apis.google.com/js/api.js";
        document.body.appendChild(script1);
        script1.addEventListener("load", onGapiLoaded);

    }, [])

    const onGsiLoaded = () => {
        const _tokenClient = window.google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: SCOPES,
            callback: '', // defined later
          });

          setTokenClient(_tokenClient);
          setIsGisInited(true);
    }

    const onGapiLoaded = () => {
        window?.gapi.load('client', async () => {
            await window.gapi.client.init({
                apiKey: API_KEY,
                discoveryDocs: [DISCOVERY_DOC],
            })
        })
        setIsGapiInited(true)
    }
    
    const handleConnectToGoogleCalendarClick = () => {
        if(window.gapi.client.getToken() == null){
            tokenClient.requestAccessToken({ prompt: "consent"});
        } else {
            tokenClient.requestAccessToken({ prompt: ''});
        }
    }


    return (
        <Button onClick={handleConnectToGoogleCalendarClick}>
           Google Calendar
        </Button>
    )
}

const CalendarIntergration = () => {
    
    return (
        <div className="flex">
            <LoginWithGoogleButton />
            <Button>Connect To Outlook Calendar</Button>
        </div>
    )
}

export default CalendarIntergration