import { FormControl, FormLabel, TextField } from "@mui/material";

export type ContactType = {
    id?: string | number;
    first_name: string;
    last_name: string,
    email: string,
    company: string,
    phone_number: string,
    address: string,
}



export type ContactFormProps = {
    type: "update" | "create";
    isReadOnly?: boolean;
    contact: ContactType;
    errors?: any;
    onFieldChange?: (e: any) => void
}


const ContactForm = ({ onFieldChange, isReadOnly, contact, errors }: ContactFormProps) => {
    return (
        <>
            <form className="flex flex-col gap-2  md:px-10">
                {errors?.non_field_errors && <p>{errors.non_field_errors}</p>}
                <FormControl fullWidth>
                    <FormLabel component="p">First Name *</FormLabel>
                    <TextField
                        className="input"
                        value={contact.first_name}
                        disabled={isReadOnly}
                        size="small"
                        variant="outlined"
                        name="first_name"
                        onChange={onFieldChange}
                        error={errors?.first_name}
                        helperText={errors?.first_name}
                    />
                </FormControl>
                <FormControl fullWidth>
                    <FormLabel component="p">Last Name *</FormLabel>
                    <TextField
                        className="input"
                        value={contact.last_name}
                        disabled={isReadOnly}
                        size="small"
                        variant="outlined"
                        name="last_name"
                        onChange={onFieldChange}
                        error={errors?.last_name}
                        helperText={errors?.last_name}
                    />
                </FormControl>
                <FormControl fullWidth>
                    <FormLabel component="p">Email *</FormLabel>
                    <TextField
                        className="input"
                        type="email"
                        value={contact.email}
                        size="small"
                        variant="outlined"
                        disabled={isReadOnly}
                        onChange={onFieldChange}
                        name="email"
                        error={errors?.email}
                        helperText={errors?.email}
                    />
                </FormControl>
                <FormControl fullWidth>
                    <FormLabel component="p">Phone Number</FormLabel>
                    <TextField
                        value={contact.phone_number}
                        size="small"
                        variant="outlined"
                        disabled={isReadOnly}
                        name="phone_number"
                        onChange={onFieldChange}
                        error={errors?.phone_number}
                        helperText={errors?.phone_number}
                    />
                </FormControl>
                <FormControl>
                    <FormLabel component="p">Address</FormLabel>
                    <TextField
                        fullWidth
                        value={contact.address}
                        multiline
                        minRows={2}
                        placeholder="Address"
                        InputProps={{
                            readOnly: isReadOnly
                        }}
                        variant="outlined"
                        name="address"
                        onChange={onFieldChange}
                        error={errors?.address}
                        helperText={errors?.address}
                    />
                </FormControl>
            </form>
        </>
    )
}

export default ContactForm