import axios from "axios";
import { Button, Chip, CircularProgress, Tooltip, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import GmailLogo from "@/assets/gmail-logo.svg";

const SCOPES = 'https://www.googleapis.com/auth/gmail.send';
const backend_google_auth_url = "http://localhost:8000/api/accounts/get_google_api_authorization_url"


const EmailIntergration = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [emailProvider, setEmailProvider] = useState();
    const [isDisconnecting, setIsDisconnecting] = useState(false);

    useEffect(() => {
        axios.get('/accounts/email_provider')
            .then(res => {
                setEmailProvider(res.data.email_provider);
                setIsLoading(false);
            })
    }, []);

    const handleGmailClick = async () => {
        const redirect_url = new URL(backend_google_auth_url);
        redirect_url.searchParams.append('scopes', SCOPES);
        redirect_url.searchParams.append('token', localStorage.getItem('token') as string);
        window.location.href = redirect_url.href;
    }

    const handleDisconnectEmail = () => {
        setIsDisconnecting(true);
        axios.delete('/accounts/email_provider')
            .then(res => {
                setEmailProvider(res.data.email_provider);
                setIsDisconnecting(false);
            })
    }


    return (
        <div className="flex flex-col items-center py-6">
            <Typography variant="h5">Connect Your Email To smartCRM</Typography>
            <div className="flex gap-10 py-5 items-center">
                {isLoading ? <CircularProgress /> : emailProvider === "gmail" ? (
                    <>
                        <img src={GmailLogo} style={{ width: 100, height: "auto" }} alt="GMAIL LOG" />
                        <Typography>Google / Gmail</Typography>
                        <Chip label="Connected" color="success" variant="filled" />
                        <Button
                            variant="outlined"
                            color="warning"
                            disabled={isDisconnecting}
                            size="small"
                            onClick={handleDisconnectEmail}
                        >
                            {isDisconnecting && <CircularProgress />}
                            Disconnect
                        </Button>
                    </>
                ) :
                    (
                        <>
                            <img src={GmailLogo} style={{ width: 100, height: "auto" }} alt="GMAIL LOG" />
                            <Typography>Google / Gmail</Typography>
                            <Button variant="outlined" size="small" onClick={handleGmailClick}>
                                Connect
                            </Button>
                        </>
                    )}

            </div>
            <div className="max-w-md">
                <Typography variant="body2" marginY={4} textAlign={"center"}>
                    You can connect your Email to smartCRM without revealing your real password.
                    By connecting your Email, you authorize Our app to send emails on your behalf via SMTP Connection.
                </Typography>
            </div>

            {/* <AddGmailAppPassword /> */}
        </div>
    )
}

export default EmailIntergration;