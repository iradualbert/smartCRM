import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";



const useRetrieve = () => {

}

const useRetrieveList = () => {

}



const CLIENT_ID = "";
const API_KEY = "";


export const useGoogleApi = ({
    SCOPES,
    onResponse,
    onCancel,
}) => {
    const [isGsiInited, setIsGsiInited] = useState(false);
    const tokenClient = useRef();

    useEffect(() => {
        const script = document.createElement("script");
        script.async = true;
        script.defer = true;
        script.src = "https://accounts.google.com/gsi/client";
        document.body.appendChild(script);
        script.addEventListener("load", onGsiLoaded)

    }, [])

    
    const onGsiLoaded = () => {
        tokenClient.current = window.google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: SCOPES,
            callback: onResponse, // defined later
          });
          setIsGsiInited(true);
    }

    const onGapiLoaded = () => {
        // window?.gapi.load('client', async () => {
        //     await window.gapi.client.init({
        //         apiKey: API_KEY,
        //         discoveryDocs: [DISCOVERY_DOC],
        //     })
        // })
        // setIsGapiInited(true)
    }

    const openLoginPopup = () => {
        if(window.gapi.client.getToken() == null){
            tokenClient.current.requestAccessToken({ prompt: "consent"});
        } else {
            tokenClient.current.requestAccessToken({ prompt: ''});
        }
    }

    const sendResponseToServer = (response, { onSuccess, onError}) => {
        axios.post('/accounts/google', response)
    };


    return {
        isGsiInited,
        tokenClient,
        openLoginPopup,
        sendResponseToServer
    }
}

export const useQuery = () => {
    return new URLSearchParams(useLocation().search);
}