import { Button } from "@/components/ui/button";
import { FormControl, FormLabel, TextField, Typography } from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useParams } from "react-router-dom";
import Logo from "@/components/Logo";




const SubscribePage = () => {
    const [isLoadingInfo, setIsLoadingInfo] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [linkData, setLinkData] = useState({});
    const [isInvalidLink, setIsInvalidLink] = useState(false);

    const { linkId } = useParams();
    const [formData, setFormData] = useState({
        "first_name": "",
        "last_name": "",
        "email": "",
    })
    const [errors, setErrors] = useState({});

    useEffect(() => {
        axios.get(`/subscriptions/${linkId}`)
            .then(res => {
                setIsLoadingInfo(false);
                setLinkData(res.data)
            })
            .catch(() => {
                setIsInvalidLink(true)
            })
            .finally(() => setIsLoadingInfo(false))
    }, [])

    const onFieldChange = e => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleSubmit = e => {
        e.preventDefault();
        setIsSubmitting(true)
        axios.post(`/subscriptions/${linkId}`, formData).then(() => {
            setHasSubmitted(true);
            setErrors({});
            setFormData({
                first_name: "",
                last_name:"",
                email: ""
            })
        })
            .catch(err => {
                setErrors(err.response?.data)
            })
            .finally(() => {
                setIsSubmitting(false)
            })
    }

    const handleSubmitAgain = e => {
        setHasSubmitted(false);
    }
    if (isLoadingInfo) return <Typography>Loading....</Typography>
    if (isInvalidLink) return <Typography>Invalid or Expired Link</Typography>

    if (hasSubmitted) return (
        <div>
            <Typography>Thank you from subscribing to {linkData.title}</Typography>
            <Button onClick={handleSubmitAgain}>Submit Again</Button>
        </div>
    )

    return (
        <div className="mx-auto flex w-full flex-col justify-center pt-10 space-y-6 sm:w-[600px]">
            <form className="flex flex-col gap-2  md:px-10" onSubmit={handleSubmit}>
                <Typography variant="h3" component="p" textAlign="center">{linkData.title}</Typography>
                <Logo />
                <Typography textAlign="center">{linkData.description}</Typography>
                {errors?.non_field_errors && <p>{errors.non_field_errors}</p>}
                <FormControl fullWidth>
                    <FormLabel component="p">First Name *</FormLabel>
                    <TextField
                        className="input"
                        value={formData.first_name}
                        disabled={isSubmitting}
                        size="small"
                        variant="outlined"
                        name="first_name"
                        onChange={onFieldChange}
                        error={errors?.first_name}
                        helperText={errors?.first_name}
                    />
                </FormControl>
                <FormControl fullWidth>
                    <FormLabel component="p">Last Name *</FormLabel>
                    <TextField
                        className="input"
                        value={formData.last_name}
                        disabled={isSubmitting}
                        size="small"
                        variant="outlined"
                        name="last_name"
                        onChange={onFieldChange}
                        error={errors?.last_name}
                        helperText={errors?.last_name}
                    />
                </FormControl>
                <FormControl fullWidth>
                    <FormLabel component="p">Email *</FormLabel>
                    <TextField
                        className="input"
                        type="email"
                        value={formData.email}
                        size="small"
                        variant="outlined"
                        disabled={isSubmitting}
                        onChange={onFieldChange}
                        name="email"
                        error={errors?.email}
                        helperText={errors?.email}
                    />
                </FormControl>
                <Button disabled={isSubmitting} type="submit">
                    {isSubmitting && (
                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    )}
                    Subscribe
                </Button>
            </form>
        </div>

    )

}


export default SubscribePage