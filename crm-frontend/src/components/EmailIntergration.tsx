import axios from "axios";
import { Button, Chip, CircularProgress, FormControl, FormLabel, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import EmailAppPassword from "./forms/EmailAppPassword";
import GmailLogo from "@/assets/gmail-logo.svg";
import { Input } from "./ui";
import { FaExternalLinkAlt } from "react-icons/fa";
import PageTitle from "./PageTitle";


const SCOPES = 'https://www.googleapis.com/auth/gmail.send';
const backend_google_auth_url = "http://localhost:8000/api/accounts/get_google_api_authorization_url"


const EmailIntergration = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [emailProvider, setEmailProvider] = useState();
    const [isDisconnecting, setIsDisconnecting] = useState(false);
    const [host, setHost] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({})

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
           <PageTitle title="Mail Settings" /> 
            <Typography variant="h5">Connect Your Email To smartCRM</Typography>
            <div className="max-w-md">
                <Typography variant="body2" marginY={4} textAlign={"center"}>
                    You can connect your Email to Beinpark without revealing your real password.
                    By connecting your Email, you authorize Our Beinpark to send emails on your behalf via SMTP Connection.
                </Typography>
                <Typography variant="body2" marginY={4} textAlign={"center"}>
                    If you're using Gmail, you can connect your account directly without providing
                </Typography>
            </div>
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
            <Typography variant="h5" marginBottom={4}>Connect With App Passwords</Typography>

            <form className="flex flex-col gap-3">

                <FormControl fullWidth>
                    <FormLabel component="p">SMTP Host *</FormLabel>
                    <TextField
                        className="input"
                        value={email}
                        size="small"
                        variant="outlined"
                        onChange={e => setHost(e.target.value)}
                        error={errors?.host}
                        helperText={errors?.host}
                    />
                </FormControl>
                <FormControl fullWidth>
                    <FormLabel component="p">SMTP Port*</FormLabel>
                    <TextField
                        className="input"
                        value={email}
                        type="number"
                        size="small"
                        variant="outlined"
                        onChange={e => setHost(e.target.value)}
                        error={errors?.host}
                        helperText={errors?.host}
                    />
                </FormControl>
                <FormControl fullWidth>
                    <FormLabel component="p">Email *</FormLabel>
                    <TextField
                        className="input"
                        value={email}
                        size="small"
                        variant="outlined"
                        name="email"
                        onChange={e => setEmail(e.target.value)}
                        error={errors?.email}
                        helperText={errors?.email}
                    />
                </FormControl>
                <FormControl fullWidth>
                    <FormLabel component="p">App Password *</FormLabel>
                    <TextField
                        className="input"
                        value={email}
                        size="small"
                        variant="outlined"
                        name="email"
                        onChange={e => setEmail(e.target.value)}
                        error={errors?.email}
                        helperText={errors?.email}
                    />
                </FormControl>
                <FormControl fullWidth>
                    <FormLabel component="p">Default Name *</FormLabel>
                    <TextField
                        className="input"
                        value={email}
                        size="small"
                        variant="outlined"
                        name="email"
                        onChange={e => setEmail(e.target.value)}
                        error={errors?.email}
                        helperText={errors?.email}
                    />
                </FormControl>
                <Button>Save</Button>
                <Button>Test (Mail to self)</Button>
            </form>
        </div>
    )
}

export default EmailIntergration;