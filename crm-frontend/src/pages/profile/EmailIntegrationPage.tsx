import { useEffect, useState } from "react";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageTitle from "@/components/PageTitle";
import GmailLogo from "@/assets/gmail-logo.svg";
import { Input } from "@/components/ui";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useDispatch, useSelector } from "react-redux";
import { useToast } from "@/components/ui/use-toast";
import { SET_EMAIL_PROVIDER } from "@/redux/types";
const SCOPES = 'https://www.googleapis.com/auth/gmail.send';


const EmailIntegrationPage = () => {
    const [currentConfig, setCurrentConfig] = useState<any>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isDisconnecting, setIsDisconnecting] = useState(false);
    const user = useSelector((state: any) => state.user.credentials)
    const [formData, setFormData] = useState({
        host: "",
        port: "",
        email: user.email,
        default_name: user.first_name,
        password: "",

    });
    const [errors, setErrors] = useState<any>(null);
    const { toast } = useToast();
    const dispatch = useDispatch();


    const isDisabled = isLoading || isDisconnecting || isSaving

    const backend_google_auth_url = location.hostname === "localhost"
        ? "http://localhost:8000/api/accounts/get_google_api_authorization_url"
        : "https://www.beinpark.com/api/accounts/get_google_api_authorization_url"



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
                setCurrentConfig(res.data);
                setFormData(res.data)
                toast({ title: "Disconnected" })
                dispatch({
                    type: SET_EMAIL_PROVIDER,
                    payload: null,
                })
            })
            .finally(() => {
                setIsDisconnecting(false);
            })
    }

    const getCurrentConfig = () => {
        setIsLoading(true)
        axios.get('/accounts/email_provider')
            .then(res => {
                setCurrentConfig(res.data)
                setFormData(res.data)
            })
            .finally(() => setIsLoading(false))
    }

    const handleSave = (e: any) => {
        e.preventDefault();
        setIsSaving(true);
        axios.post('/accounts/email_provider', formData)
            .then((res) => {
                setCurrentConfig(res.data);
                toast({ title: "Updated successfully" });
                dispatch({
                    type: SET_EMAIL_PROVIDER,
                    payload: "smtp",
                })
            })
            .catch((err: any) => setErrors(err.response?.data))
            .finally(() => {
                setIsSaving(false)
            })
    }

    useEffect(() => {
        getCurrentConfig();
    }, [])

    const setHost = (e: any) => {
        setFormData(prev => ({ ...prev, "host": e.target.value }))
    }
    const setPort = (e: any) => {
        setFormData(prev => ({ ...prev, "port": e.target.value }))
    }
    const setEmail = (e: any) => {
        setFormData(prev => ({ ...prev, "email": e.target.value }))
    }
    const setDefaultName = (e: any) => {
        setFormData(prev => ({ ...prev, "default_name": e.target.value }))
    }
    const setPassword = (e: any) => {
        setFormData(prev => ({ ...prev, "password": e.target.value }))
    }

    return (
        <div className="flex flex-col gap-10 py-6 items-center">
            <PageTitle title="Mail Integration Settings" />
            <div className="flex flex-col gap-10 max-w-lg">
                <h1 className="text-4xl font-bold">Email Integration</h1>
                <p className="max-w-md">
                    You can connect your Email to Beinpark without revealing your real password.
                    By connecting your Email, you authorize Our Beinpark to send emails on your behalf via SMTP Connection.
                </p>
                {
                    isLoading &&
                    <div className="flex items-center justify-center py-6">
                        <Loader2 />
                    </div>
                }

                {currentConfig.email_provider === "gmail" && (
                    <div className="flex justify-between items-center flex-wrap gap-6 px-4 py-2 rounded-lg bg-gray-100 shadow-sm">
                        <div className="flex gap-2 items-center">
                            <img src={GmailLogo} style={{ width: 100, height: "auto" }} alt="GMAIL LOG" />
                            <h3>GMAIL</h3>
                            <span className="rounded-md border p-1 bg-green-800 text-white">Connected</span>
                        </div>

                        <Button
                            variant="destructive"
                            color="warning"
                            disabled={isDisconnecting}
                            size="sm"
                            onClick={handleDisconnectEmail}
                        >
                            {isDisconnecting && <Loader2 />}
                            Disconnect
                        </Button>

                    </div>
                )}

                {currentConfig.email_provider === "smtp" && (

                    <div className="flex justify-between items-center flex-wrap gap-6 px-4 py-2 rounded-lg bg-gray-100 shadow-sm">
                        <div className="flex flex-col gap-2">
                            <h3>App Password</h3>
                            <span className="text-gray-500">{currentConfig.email}</span>
                        </div>
                        {/* <span className="rounded-md border p-1 bg-green-800 text-white">Connected</span> */}

                        <Button
                            variant="destructive"
                            disabled={isDisconnecting}
                            size="sm"
                            onClick={handleDisconnectEmail}
                        >
                            {isDisconnecting && <Loader2 />}
                            Remove
                        </Button>
                    </div>

                )}
                {/* {currentConfig.email_provider !== "gmail" && (
                    <div className="flex justify-between items-center flex-wrap gap-3">
                        <img src={GmailLogo} style={{ width: 100, height: "auto" }} alt="GMAIL LOG" />
                        <h3>Google / Gmail</h3>
                        <Button size="lg" onClick={handleGmailClick}>
                            Connect
                        </Button>
                    </div>
                )}

                <h2 className="text-3xl font-bold">Connect with App Password</h2> */}

                <form onSubmit={handleSave} className="flex flex-col gap-3">

                    <div className='flex flex-col gap-2'>
                        <Label>Hostname</Label>
                        <Input
                            required
                            disabled={isDisabled}
                            value={formData.host}
                            placeholder="smtp.gmail.com"
                            onChange={setHost}
                            className={cn({
                                'focus-visible:ring-red-500':
                                    errors?.host,
                            })}
                        />
                        {errors?.host && (
                            <p className='text-sm text-red-500'>
                                {errors.host}
                            </p>
                        )}
                    </div>
                    {/* <div className='flex flex-col gap-2'>
                        <Label>Port</Label>
                        <Input
                            required
                            type="number"
                            disabled={isDisabled}
                            value={formData.port}
                            placeholder="587"
                            onChange={setPort}
                            className={cn({
                                'focus-visible:ring-red-500':
                                    errors?.port,
                            })}
                        />
                        {errors?.port && (
                            <p className='text-sm text-red-500'>
                                {errors.port}
                            </p>
                        )}
                    </div> */}
                    <div className='flex flex-col gap-2'>
                        <Label>Email</Label>
                        <Input
                            required
                            type="email"
                            disabled={isDisabled}
                            value={formData.email}
                            onChange={setEmail}
                            className={cn({
                                'focus-visible:ring-red-500':
                                    errors?.email,
                            })}
                        />
                        {errors?.email && (
                            <p className='text-sm text-red-500'>
                                {errors.email}
                            </p>
                        )}
                    </div>
                    <div className='flex flex-col gap-2'>
                        <Label>App Password</Label>
                        <Input
                            required
                            placeholder="***********"
                            type="password"
                            disabled={isDisabled}
                            value={formData.password}
                            onChange={setPassword}
                            className={cn({
                                'focus-visible:ring-red-500':
                                    errors?.password,
                            })}
                        />
                        {errors?.password && (
                            <p className='text-sm text-red-500'>
                                {errors.password}
                            </p>
                        )}
                    </div>
                    <div className='flex flex-col gap-2'>
                        <Label>Sender Name</Label>
                        <Input
                            required
                            disabled={isDisabled}
                            value={formData.default_name}
                            onChange={setDefaultName}
                            className={cn({
                                'focus-visible:ring-red-500':
                                    errors?.host,
                            })}
                        />
                        {errors?.default_name && (
                            <p className='text-sm text-red-500'>
                                {errors.host}
                            </p>
                        )}
                    </div>
                    <Button disabled={isDisabled} type="submit">
                        {isLoading && (
                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                        )}
                        Add
                    </Button>
                </form>

            </div>


        </div>
    )


}



export default EmailIntegrationPage;