export type ContactType = {
  id?: string | number;
  first_name: string;
  last_name: string;
  email: string;
  company: string;
  phone_number: string;
  address: string;
};

export type ContactFormProps = {
  type: "update" | "create";
  isReadOnly?: boolean;
  contact: ContactType;
  errors?: any;
  onFieldChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
};

const inputClassName =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

const inputErrorClassName = `${inputClassName} border-rose-400 focus-visible:ring-rose-500`;

const ContactForm = ({
  onFieldChange,
  isReadOnly,
  contact,
  errors,
}: ContactFormProps) => {
  return (
    <form className="flex flex-col gap-4 md:px-10">
      {errors?.non_field_errors && (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">
          {errors.non_field_errors}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label htmlFor="first_name" className="text-sm font-medium">
          First Name *
        </label>
        <input
          id="first_name"
          className={errors?.first_name ? inputErrorClassName : inputClassName}
          value={contact.first_name}
          disabled={isReadOnly}
          name="first_name"
          onChange={onFieldChange}
        />
        {errors?.first_name && (
          <p className="text-sm text-rose-600" role="alert">{errors.first_name}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="last_name" className="text-sm font-medium">
          Last Name *
        </label>
        <input
          id="last_name"
          className={errors?.last_name ? inputErrorClassName : inputClassName}
          value={contact.last_name}
          disabled={isReadOnly}
          name="last_name"
          onChange={onFieldChange}
        />
        {errors?.last_name && (
          <p className="text-sm text-rose-600" role="alert">{errors.last_name}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email *
        </label>
        <input
          id="email"
          className={errors?.email ? inputErrorClassName : inputClassName}
          type="email"
          value={contact.email}
          disabled={isReadOnly}
          onChange={onFieldChange}
          name="email"
        />
        {errors?.email && (
          <p className="text-sm text-rose-600" role="alert">{errors.email}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="phone_number" className="text-sm font-medium">
          Phone Number
        </label>
        <input
          id="phone_number"
          className={errors?.phone_number ? inputErrorClassName : inputClassName}
          value={contact.phone_number}
          disabled={isReadOnly}
          name="phone_number"
          onChange={onFieldChange}
        />
        {errors?.phone_number && (
          <p className="text-sm text-rose-600" role="alert">{errors.phone_number}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="address" className="text-sm font-medium">
          Address
        </label>
        <textarea
          id="address"
          className={errors?.address ? inputErrorClassName : inputClassName}
          value={contact.address}
          rows={2}
          placeholder="Address"
          readOnly={isReadOnly}
          name="address"
          onChange={onFieldChange}
        />
        {errors?.address && (
          <p className="text-sm text-rose-600" role="alert">{errors.address}</p>
        )}
      </div>
    </form>
  );
};

export default ContactForm;