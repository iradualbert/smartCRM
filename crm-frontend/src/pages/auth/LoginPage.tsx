import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { cn } from '@/lib/utils'
import { Loader2 } from "lucide-react";
import { useDispatch } from "react-redux";
import { loginUser } from "@/redux/actions/userActions";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@/lib/hooks";
import FormWrapper from "./FormWrapper";

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const next = useQuery().get('next')

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const userData = { email, password };
        const newErrors = await dispatch(loginUser(userData, navigate, next));
        setErrors(newErrors);
        setIsLoading(false);
    };

    return (
        <FormWrapper title="Log in to beinPark">
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
                        />
                        {errors?.email && (
                            <p className='text-sm text-red-500'>
                                {errors.email}
                            </p>
                        )}
                    </div>

                    <div className='grid gap-1 py-2'>
                        <Label htmlFor='password'>Password</Label>
                        <Input
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            type='password'
                            className={cn({
                                'focus-visible:ring-red-500':
                                    errors?.password,
                            })}
                            placeholder='Password'
                        />
                        {errors?.password && (
                            <p className='text-sm text-red-500'>
                                {errors?.password}
                            </p>
                        )}
                    </div>
                    {errors?.non_field_errors && (
                        <p className='text-sm text-red-500'>
                            {errors.non_field_errors}
                        </p>
                    )}
                    <Button disabled={isLoading} type="submit">
                        {isLoading && (
                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                        )}
                        Sign in
                    </Button>
                </div>
                <div className="mt-4 mb-4 text-center underline">
                    <Link to="/accounts/forgot-password">Forgot Password?</Link>
                </div>

                <div className='mt-4 mb-4 flex justify-center text-md'>
                    <span className='bg-background px-2 text-muted-foreground'>
                        Don't have an account yet?
                    </span>
                </div>
                <Link to="/signup">
                    <Button className="w-full" type="button">
                        Sign Up
                    </Button>
                </Link>
            </form>
        </FormWrapper>

    )
}

export default LoginPage;