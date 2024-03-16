import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { cn } from '@/lib/utils'
import { Loader2 } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import FormWrapper from "./FormWrapper";
import axios from "axios";
import { logoutUserAll } from "@/redux/actions/userActions";

const PasswordResetPage = () => {
    const [currentPassword, setCurrentPassword] = useState("");
    const [password, setPassword] = useState("")
    const [passwordConfirm, setPasswordConfirm] = useState("")
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<any>({});
    const { uid, token } = useParams();
    const [isPasswordChanged, setIsPasswordChanged] = useState(false);

    const isViaEmailClick = uid && token;

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setIsLoading(true);
        const userData: any = { password, password_confirm: passwordConfirm };
        if (!isViaEmailClick) {
            userData.current_password = currentPassword
        };
        try {
            const requestUrl =
                isViaEmailClick ? `/accounts/password-reset/${uid}/${token}` : "/accounts/password-reset/";
            await axios.post(requestUrl, userData);
            setIsPasswordChanged(true);
        } catch (err: any) {
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
                    {isViaEmailClick ? (
                        <Link to="/login">
                            <Button className="w-full mt-10" variant="outline" type="button">
                                Log In
                            </Button>
                        </Link>
                    ) : (
                        <Button
                            onClick={() => logoutUserAll()} size="lg" className="my-10"
                        >
                            Logout All Sessions
                        </Button>
                    )
                    }

                </>
                )
                : (
                    <form onSubmit={handleSubmit}>
                        <div className='flex flex-col gap-6'>
                            <div className='flex flex-col gap-2'>
                                <Label>Current Password</Label>
                                <Input
                                    required
                                    disabled={isLoading}
                                    value={currentPassword}
                                    type="password"
                                    onChange={e => setCurrentPassword(e.target.value)}
                                    className={cn({
                                        'focus-visible:ring-red-500':
                                            errors?.current_password,
                                    })}

                                />
                                {errors?.current_password && (
                                    <p className='text-sm text-red-500'>
                                        {errors.current_password}
                                    </p>
                                )}
                            </div>
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
                        {isViaEmailClick && <Link to="/login">
                            <Button className="w-full mt-10" variant="outline" type="button">
                                Log In
                            </Button>
                        </Link>}

                    </form>
                )}

        </FormWrapper>

    )
}

export default PasswordResetPage;