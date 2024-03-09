import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { cn } from '@/lib/utils'
import { Loader2 } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import FormWrapper from "./FormWrapper";
import axios from "axios";

const PasswordResetPage = () => {
    const [password, setPassword] = useState("")
    const [passwordConfirm, setPasswordConfirm] = useState("")
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const { uid, token } = useParams();
    const [isPasswordChanged, setIsPasswordChanged] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const userData = { password, password_confirm: passwordConfirm };
        try {
            await axios.post(`/accounts/password-reset/${uid}/${token}`, userData);
            setIsPasswordChanged(true);
        } catch (err) {
            setErrors(err.response?.data)
        }
        finally {
            setIsLoading(false);
        }
    };

    return (
        <FormWrapper title="Reset Password">
            {isPasswordChanged ?
                (<>
                    <p className="py-6 text-center">
                        Your password has been reset successfully. 
                    </p>
                    <Link to="/login">
                        <Button className="w-full mt-10" variant="outline" type="button">
                            Log In
                        </Button>
                    </Link>
                </>)
                : (
                    <form onSubmit={handleSubmit}>
                        <div className='flex flex-col gap-6'>
                            <div className='flex flex-col gap-2'>
                                <Label>New Password</Label>
                                <Input
                                    required
                                    disabled={isLoading}
                                    value={password}
                                    type="password"
                                    onChange={e => setPassword(e.target.value)}
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
                                <Label>Confirm Password</Label>
                                <Input
                                    required
                                    disabled={isLoading}
                                    value={passwordConfirm}
                                    type="password"
                                    onChange={e => setPasswordConfirm(e.target.value)}
                                    className={cn({
                                        'focus-visible:ring-red-500':
                                            errors?.password_confirm,
                                    })}

                                />
                                {errors?.password_confirm && (
                                    <p className='text-sm text-red-500'>
                                        {errors.password_confirm}
                                    </p>
                                )}
                            </div>
                            {errors?.non_field_errors && (
                                <p className='text-sm text-red-500'>
                                    {errors.non_field_errors}
                                </p>
                            )}
                            <Button disabled={isLoading || !password || !passwordConfirm} type="submit">
                                {isLoading && (
                                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                )}
                                Reset Password
                            </Button>
                        </div>
                        <Link to="/login">
                            <Button className="w-full mt-10" variant="outline" type="button">
                                Log In
                            </Button>
                        </Link>
                    </form>
                )}

        </FormWrapper>

    )
}

export default PasswordResetPage;