import { Link, useNavigate } from "react-router-dom";
import FormWrapper from "./FormWrapper";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { FormControl, TextField, Button as MUIButton } from "@mui/material";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useDispatch } from "react-redux";
import { registerUser, resend_verification_code, verify_code } from "@/redux/actions/userActions";

const SignupPage = () => {
    const [fullname, setFullname] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [passwordConfirm, setPasswordConfirm] = useState("")
    const [step, setStep] = useState(1)
    const [errors, setErrors] = useState({})
    const [verificationCode, setVerificationCode] = useState("")

    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const userData = { fullname, email, password, password_confirm: passwordConfirm };
        const newErrors = await dispatch(registerUser(userData));
        if (newErrors) {
            setErrors(newErrors);
        } else {
            setStep(2);
        }
        setIsLoading(false);
    }

    const handleVerifyCode = async (e) => {
        e.preventDefault();
        const newErrors = await dispatch(verify_code({ code: verificationCode, email  }, navigate));
        setErrors(newErrors)
    }

    const hanldeResend = async () => {
        setIsLoading(true)
        const newErrors = await resend_verification_code({ email });
        if(newErrors){
            alert(newErrors.error)
        } else {
            alert("Verification code was sent again")
        }
        setIsLoading(false)
        
    }

    if (step == 2) {
        return (
            <FormWrapper title="Email Verification">
                <form onSubmit={handleVerifyCode} className="flex flex-col gap-4">
                    <FormControl fullWidth>
                        <Label className="mb-4">Enter verification code sent to your email</Label>
                        <TextField
                            className="input"
                            size="small"
                            autoComplete="off"
                            value={verificationCode}
                            type="password"
                            autoFocus={true}
                            fullWidth
                            placeholder="Verification code"
                            onChange={e => setVerificationCode(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </FormControl>
                    <FormControl>
                        <MUIButton onClick={hanldeResend} fullWidth={false}>Resend Code</MUIButton>
                    </FormControl>

                    <Button disabled={isLoading} type="submit">
                        {isLoading && (
                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                        )}
                        Submit
                    </Button>
                    <Button disabled={isLoading} onClick={() => setStep(1)} variant="outline">{"< Back"}</Button>
                </form>
            </FormWrapper>
        )
    }

    return (
        <FormWrapper title="Create Account">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <FormControl fullWidth>
                    <Label className="mb-2">Full Name</Label>
                    <TextField
                        className="input"
                        size="small"
                        autoComplete="off"
                        value={fullname}
                        placeholder="John Doe"
                        autoFocus={true}
                        fullWidth
                        onChange={e => setFullname(e.target.value)}
                        error={errors.fullname}
                        helperText={errors.fullname}
                        required
                        disabled={isLoading}
                    />
                </FormControl>
                <FormControl fullWidth>
                    <Label className="mb-2">Enter Your Email</Label>
                    <TextField
                        type="email"
                        className="input"
                        size="small"
                        autoComplete="off"
                        value={email}
                        placeholder="Email"
                        fullWidth
                        onChange={e => setEmail(e.target.value)}
                        error={errors.email}
                        helperText={errors.email}
                        required
                        disabled={isLoading}
                    />
                </FormControl>
                <FormControl fullWidth>
                    <Label className="mb-2">Create a Password</Label>
                    <TextField
                        type="password"
                        className="input"
                        size="small"
                        autoComplete="off"
                        value={password}
                        placeholder="Password"
                        fullWidth
                        onChange={e => setPassword(e.target.value)}
                        error={errors.password}
                        helperText={errors.password}
                        required
                        disabled={isLoading}
                    />
                </FormControl>
                <FormControl fullWidth>
                    <Label htmlFor='email' className="mb-2">Re-enter Your Password</Label>
                    <TextField
                        type="password"
                        className="input"
                        size="small"
                        autoComplete="off"
                        value={passwordConfirm}
                        placeholder="Confirm Password"
                        fullWidth
                        onChange={e => setPasswordConfirm(e.target.value)}
                        error={errors.password_confirm}
                        helperText={errors.password_confirm}
                        required
                        disabled={isLoading}

                    />
                </FormControl>

                {errors?.non_field_errors && (
                    <p className='text-sm text-red-500'>
                        {errors.non_field_errors}
                    </p>
                )}
                <Button disabled={isLoading} type="submit">
                    {isLoading && (
                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    )}
                    Sign Up
                </Button>

                <div className='mt-4 mb-4 flex justify-center text-md'>
                    <span className='bg-background px-2 text-muted-foreground'>
                        Have an account already?
                    </span>
                </div>
                <Link to="/login">
                    <Button disabled={isLoading} className="w-full" type="button">
                        Login
                    </Button>
                </Link>
            </form>
        </FormWrapper>
    )
}

export default SignupPage