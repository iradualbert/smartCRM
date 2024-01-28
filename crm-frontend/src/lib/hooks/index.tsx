import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { SHOW_TOAST, CLEAR_TOAST } from "@/redux/types";
import { IToast } from "./types";


export * from "./useAPI";

export const useDashboardData = () => {
    const [dashboardData, setDashboardData] = useState({
        sent_emails: 0,
        scheduled_emails:0,
        failed_emails: 0,
        total_contacts: 0,
        newsletter_subs: 0,
        mail_templates: 0,
    });
    useEffect(() => {
        axios.get("/accounts/dashboard_data")
            .then(res => setDashboardData(res.data))
    }, [])
    return { data: dashboardData }
}


export const useToasts = () => {
    const dispatch = useDispatch();
    const showToast = (toast: IToast) => {
        if(!toast.id){
            toast.id = (new Date()).getTime()
        }
        dispatch({
            type: SHOW_TOAST,
            payload: toast,
        })
    }

    const clearToast = (toastId) => {
        dispatch({
            type: CLEAR_TOAST,
            payload: toastId
        })
    }

    return { showToast, clearToast}
}



export const useEmailSignature = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [signature, setSignature] = useState<string>("");
    const [error, setError] = useState<null | object>(null);

    const load = () => {
        setIsLoading(true);
        axios.get("accounts/mail_signature")
        .then(res => {
            setSignature(res.data.mail_signature);
            setError(null);
        })
        .catch(err => setError(err))
        .finally(() => setIsLoading(false))
    }

    const update = (value: string) => {
        setIsLoading(true);
        axios.put("/accounts/mail_signature", { mail_signature: value })
        .then(res => {
            setSignature(res.data.mail_signature);
            setError(null);
        })
        .catch(err => setError(err))
        .finally(() => setIsLoading(false))
    }

    useEffect(() => {
        load();
    }, [load])


    return {
        isLoading,
        signature,
        error,
        update
    }
}




export const useQuery = () => {
    return new URLSearchParams(useLocation().search);
}