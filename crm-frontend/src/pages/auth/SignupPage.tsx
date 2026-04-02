import { Link, useNavigate } from "react-router-dom";
import FormWrapper from "./FormWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useDispatch } from "react-redux";
import { useState } from "react";
import {
  registerUser,
  resend_verification_code,
  verify_code,
} from "@/redux/actions/userActions";

const SignupPage = () => {
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<any>({});
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const userData = {
      fullname,
      email,
      password,
      password_confirm: passwordConfirm,
    };

    const newErrors = await dispatch(registerUser(userData));
    if (newErrors) {
      setErrors(newErrors);
    } else {
      setStep(2);
    }

    setIsLoading(false);
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const newErrors = await dispatch(
      verify_code({ code: verificationCode, email }, navigate)
    );

    setErrors(newErrors);
    setIsLoading(false);
  };

  const handleResend = async () => {
    setIsLoading(true);
    const newErrors = await resend_verification_code({ email });

    if (newErrors) {
      alert(newErrors.error);
    } else {
      alert("Verification code was sent again");
    }

    setIsLoading(false);
  };

  // 🔐 STEP 2: VERIFY
  if (step === 2) {
    return (
      <FormWrapper title="Email Verification">
        <form onSubmit={handleVerifyCode} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label>Enter verification code sent to your email</Label>
            <Input
              value={verificationCode}
              type="password"
              placeholder="Verification code"
              onChange={(e) => setVerificationCode(e.target.value)}
              required
              disabled={isLoading}
              autoFocus
            />
          </div>

          <Button
            type="button"
            variant="secondary"
            onClick={handleResend}
            disabled={isLoading}
          >
            Resend Code
          </Button>

          <Button disabled={isLoading} type="submit">
            {isLoading && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Submit
          </Button>

          <Button
            disabled={isLoading}
            onClick={() => setStep(1)}
            variant="outline"
            type="button"
          >
            {"< Back"}
          </Button>
        </form>
      </FormWrapper>
    );
  }

  // 📝 STEP 1: SIGNUP
  return (
    <FormWrapper title="Create Account">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Full Name */}
        <div className="flex flex-col gap-2">
          <Label>Full Name</Label>
          <Input
            value={fullname}
            placeholder="John Doe"
            onChange={(e) => setFullname(e.target.value)}
            disabled={isLoading}
          />
          {errors?.fullname && (
            <p className="text-sm text-destructive">{errors.fullname}</p>
          )}
        </div>

        {/* Email */}
        <div className="flex flex-col gap-2">
          <Label>Email</Label>
          <Input
            type="email"
            value={email}
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />
          {errors?.email && (
            <p className="text-sm text-destructive">{errors.email}</p>
          )}
        </div>

        {/* Password */}
        <div className="flex flex-col gap-2">
          <Label>Password</Label>
          <Input
            type="password"
            value={password}
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />
          {errors?.password && (
            <p className="text-sm text-destructive">{errors.password}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="flex flex-col gap-2">
          <Label>Confirm Password</Label>
          <Input
            type="password"
            value={passwordConfirm}
            placeholder="Confirm Password"
            onChange={(e) => setPasswordConfirm(e.target.value)}
            disabled={isLoading}
          />
          {errors?.password_confirm && (
            <p className="text-sm text-destructive">
              {errors.password_confirm}
            </p>
          )}
        </div>

        {/* Global Errors */}
        {errors?.non_field_errors && (
          <p className="text-sm text-destructive">
            {errors.non_field_errors}
          </p>
        )}

        {/* Terms */}
        <div className="text-sm text-muted-foreground">
          By joining, you agree to our{" "}
          <a href="/terms" target="_blank" className="underline">
            Terms
          </a>{" "}
          and{" "}
          <a
            href="/privacy-policy"
            target="_blank"
            className="underline"
          >
            Privacy Policy
          </a>
          .
        </div>

        {/* Submit */}
        <Button disabled={isLoading} type="submit">
          {isLoading && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Sign Up
        </Button>

        {/* Login */}
        <div className="mt-4 flex justify-center text-sm text-muted-foreground">
          Have an account already?
        </div>

        <Link to="/login">
          <Button disabled={isLoading} className="w-full" type="button">
            Login
          </Button>
        </Link>
      </form>
    </FormWrapper>
  );
};

export default SignupPage;