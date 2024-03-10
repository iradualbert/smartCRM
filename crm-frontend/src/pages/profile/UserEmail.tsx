import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { SET_USER } from "@/redux/types";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { useState } from "react"
import { useDispatch } from "react-redux";

type UserEmailProps = {
    currentEmail: string,
    first_name: string
}

const UserEmail = ({ currentEmail, first_name }: UserEmailProps) => {
    const [fullName, setFullName] = useState(first_name)
    const [password, setPassword] = useState("");
    const [isEditMode, setIsEditMode] = useState(false);
    const [errors, setErrors] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState(currentEmail);
    const [verificationCode, setVerificationCode] = useState("");
    const [showVerificationCode, setShowVerificationCode] = useState(false);
    const dispatch = useDispatch();

    const isDisabled = !isEditMode || isLoading
    const isEmailChanged = email !== currentEmail

    const { toast } = useToast();

    const handleSubmit = async (event: any) => {
        event.preventDefault();
        setIsLoading(true)
        const userData: any = { first_name: fullName }
        if(isEmailChanged){
            userData.email = email;
            userData.password = password;
            if(showVerificationCode){
                userData.verification_code = verificationCode;
            }
        }
        try {

            const { data } = await axios.put("/auth/user", userData)
            
            // finished 
            if(!isEmailChanged || (isEmailChanged && showVerificationCode)){
                setIsEditMode(false);
                setShowVerificationCode(false);
                setVerificationCode("");
                setPassword("");
                toast({
                    title: "Updated successfully"
                })
                dispatch({
                    type: SET_USER,
                    payload: data,
                })

            } else if(isEmailChanged){
                setShowVerificationCode(true);
                toast({
                    title: `A verification code was sent to ${email}`
                })
            }
            setErrors({})

        } catch(err: any){
            setErrors(err.response?.data)
        }

        finally {
            setIsLoading(false);
        }

    }

    const handleChange = () => {
        setIsEditMode(true);
    }
    const handleCancel = () => {
        setEmail(currentEmail);
        setFullName(first_name);
        setPassword("");
        setIsEditMode(false);
    }

    return (
        <div className="">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className='grid gap-1 py-2'>
                    <Label>Full Name</Label>
                    <Input
                        disabled={isDisabled}
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        className={cn({
                            'focus-visible:ring-red-500':
                                errors?.first_name,
                        })}
                    />
                    {errors?.first_name && (
                        <p className='text-sm text-red-500'>
                            {errors.first_name}
                        </p>
                    )}
                </div>
                <div className='grid gap-1 py-2'>
                    <Label htmlFor='email'>Email</Label>
                    <Input
                        disabled={isDisabled}
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
                {isEditMode && isEmailChanged && (
                    <div className='flex flex-col gap-2'>
                        <Label>Your Password</Label>
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
                )}
                {isEditMode && isEmailChanged && showVerificationCode && (
                    <div className='flex flex-col gap-2'>
                        <Label>Verification Code</Label>
                        <Input
                            required
                            disabled={isLoading}
                            value={verificationCode}
                            onChange={e => setVerificationCode(e.target.value)}
                            className={cn({
                                'focus-visible:ring-red-500':
                                    errors?.verification_code,
                            })}
                        />
                        {errors?.verification_code && (
                            <p className='text-sm text-red-500'>
                                {errors.verification_code}
                            </p>
                        )}
                    </div>
                )}
                {errors?.non_field_errors && (
                    <p className='text-sm text-red-500'>
                        {errors.non_field_errors}
                    </p>
                )}
                <div className="flex gap-4">
                    {isEditMode &&
                        (
                            <>
                                <Button disabled={isDisabled} type="submit">
                                    {isLoading && (
                                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                    )}
                                    Update
                                </Button>
                                <Button onClick={handleCancel} disabled={isDisabled} variant="secondary">
                                    Cancel
                                </Button>
                            </>
                        ) 

                    }
                </div>
            </form>
            {!isEditMode && <Button onClick={handleChange}>Change</Button>}
        </div>
    )

}

export default UserEmail