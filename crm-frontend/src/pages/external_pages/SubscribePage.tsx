import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useParams } from "react-router-dom";
import Logo from "@/components/Logo";

const SubscribePage = () => {
  const [isLoadingInfo, setIsLoadingInfo] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [linkData, setLinkData] = useState<any>({});
  const [isInvalidLink, setIsInvalidLink] = useState(false);

  const { linkId } = useParams();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
  });

  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    axios
      .get(`/subscriptions/${linkId}`)
      .then((res) => {
        setLinkData(res.data);
      })
      .catch(() => {
        setIsInvalidLink(true);
      })
      .finally(() => setIsLoadingInfo(false));
  }, []);

  const onFieldChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    axios
      .post(`/subscriptions/${linkId}`, formData)
      .then(() => {
        setHasSubmitted(true);
        setErrors({});
        setFormData({
          first_name: "",
          last_name: "",
          email: "",
        });
      })
      .catch((err) => {
        setErrors(err.response?.data);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const handleSubmitAgain = () => {
    setHasSubmitted(false);
  };

  // 🔄 Loading
  if (isLoadingInfo) {
    return (
      <div className="flex justify-center pt-20">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  // ❌ Invalid link
  if (isInvalidLink) {
    return (
      <div className="flex justify-center pt-20 text-destructive">
        Invalid or expired link
      </div>
    );
  }

  // ✅ Success
  if (hasSubmitted) {
    return (
      <div className="flex flex-col items-center gap-4 pt-20">
        <p className="text-lg font-medium">
          Thank you for subscribing to {linkData.title}
        </p>

        <Button onClick={handleSubmitAgain}>
          Submit Again
        </Button>
      </div>
    );
  }

  // 📝 Form
  return (
    <div className="mx-auto flex w-full flex-col justify-center space-y-6 pt-10 sm:w-[600px]">
      <form
        className="flex flex-col gap-4 md:px-10"
        onSubmit={handleSubmit}
      >
        <h1 className="text-center text-3xl font-bold">
          {linkData.title}
        </h1>

        <Logo />

        <p className="text-center text-muted-foreground">
          {linkData.description}
        </p>

        {errors?.non_field_errors && (
          <p className="text-sm text-destructive">
            {errors.non_field_errors}
          </p>
        )}

        {/* First Name */}
        <div className="flex flex-col gap-2">
          <Label>First Name *</Label>
          <Input
            name="first_name"
            value={formData.first_name}
            onChange={onFieldChange}
            disabled={isSubmitting}
          />
          {errors?.first_name && (
            <p className="text-sm text-destructive">
              {errors.first_name}
            </p>
          )}
        </div>

        {/* Last Name */}
        <div className="flex flex-col gap-2">
          <Label>Last Name *</Label>
          <Input
            name="last_name"
            value={formData.last_name}
            onChange={onFieldChange}
            disabled={isSubmitting}
          />
          {errors?.last_name && (
            <p className="text-sm text-destructive">
              {errors.last_name}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="flex flex-col gap-2">
          <Label>Email *</Label>
          <Input
            type="email"
            name="email"
            value={formData.email}
            onChange={onFieldChange}
            disabled={isSubmitting}
          />
          {errors?.email && (
            <p className="text-sm text-destructive">
              {errors.email}
            </p>
          )}
        </div>

        <Button disabled={isSubmitting} type="submit">
          {isSubmitting && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Subscribe
        </Button>
      </form>
    </div>
  );
};

export default SubscribePage;