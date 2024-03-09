import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { cn } from '@/lib/utils'
import { Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import FormWrapper from "./FormWrapper";
import axios from "axios";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [isEmailSent, setIsEmailSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const userData = { email };
        try {
            await axios.post("/accounts/forgot-password", userData);
            setIsEmailSent(true);
        } catch (err) {
            setErrors(err.response?.data);
        } finally {
            setIsLoading(false);
        }

    };

    return (
        <FormWrapper title="Forgot Password">
            {isEmailSent ?
                (<p className="py-6 text-center">
                    A link to reset your password has been sent to your email address. 
                    Please check your email address. 
                </p>)
                : (
                    <>
                        <p className="py-6 text-center">Enter your email and we'll send you a link to reset your password.</p>
                        <form onSubmit={handleSubmit}>
                            <div className='grid gap-2'>
                                <div className='grid gap-1 py-2'>
                                    <Label htmlFor='email'>Email</Label>
                                    <Input
                                        value={email}
                                        type="email"
                                        onChange={e => setEmail(e.target.value)}
                                        className={cn({
                                            'focus-visible:ring-red-500':
                                                errors?.email,
                                        })}
                                        placeholder='you@example.com'
                                        disabled={isLoading}
                                    />
                                    {errors?.email && (
                                        <p className='text-sm text-red-500'>
                                            {errors.email}
                                        </p>
                                    )}
                                </div>
                                {errors?.non_field_errors && (
                                    <p className='text-sm text-red-500'>
                                        {errors.non_field_errors}
                                    </p>
                                )}
                                <Button disabled={isLoading || !email } type="submit">
                                    {isLoading && (
                                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                    )}
                                    Send Login Link
                                </Button>
                            </div>
                            <Link to="/login">
                                <Button className="w-full mt-10" variant="outline" type="button">
                                    Log In
                                </Button>
                            </Link>
                        </form>
                    </>
                )}

        </FormWrapper>

    )
}

export default ForgotPassword;