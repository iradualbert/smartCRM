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
        <div className='container relative flex pt-20 flex-col items-center justify-center lg:px-0'>
            <div className='mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]'>
                <div className="flex flex-col justify-center items-center">
                    <h1>Login To SmartCRM</h1>
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
                            <Button disabled={isLoading}>
                                {isLoading && (
                                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                )}
                                Sign in
                            </Button>
                        </div>
                    </form>
                    <div className='mt-4 mb-4 flex justify-center text-xs uppercase'>
                            <span className='bg-background px-2 text-muted-foreground'>
                                or
                            </span>
                    </div>
                    <Button className="w-full">
                        <Link to="/signup">Sign Up</Link>
                    </Button>
                </div>
            </div>

        </div>

    )
}

export default LoginPage;