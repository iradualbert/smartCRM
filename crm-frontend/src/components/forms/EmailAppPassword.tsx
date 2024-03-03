import { useState } from "react";
import { Button, TextField, Typography } from "@mui/material";
import { FaExternalLinkAlt } from "react-icons/fa";

const AddGmailAppPassword = ({ isEditMode = true }) => {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [_isEditMode, setIsEditMode] = useState(isEditMode);

    const handleSubmit = e => {
        e.preventDefault();
    }

    return (
        <div className="flex flex-col border p-4 rounded-md gap-3" style={{ maxWidth: 500 }}>
            <Typography variant="h5">Connect With Gmail App Password</Typography>
            <Typography variant="body2" marginY={4}>
                If you're using Gmail, you can connect directly with App Password.
                An app password allows you to connect to third-party apps without revealing your real password.
                With App Password, you authorize Our app to send emails on your behalf via SMTP Connection.
            </Typography>
            <form className="flex flex-col gap-6 max-w-md " onSubmit={handleSubmit}>
                <TextField
                    label="Email"
                    InputLabelProps={{
                        shrink: true,
                    }}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    variant="standard"
                />
                <TextField
                    label="App Password"
                    type={isEditMode ? "text" : "password"}
                    InputLabelProps={{
                        shrink: true,
                    }}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    variant="standard"
                />
                <a className="flex gap-2 mt-2" href="https://knowledge.workspace.google.com/kb/how-to-generate-an-app-passwords-000009237" target="_blank">
                <FaExternalLinkAlt className="self-center" />
                <Typography variant="h6">
                    How to generate App Passwords
                </Typography>

            </a>

            <a className="flex gap-2" href="https://myaccount.google.com/apppasswords" target="_blank" >
                <FaExternalLinkAlt className="self-center" />
                <Typography variant="h6">
                    Get App Password
                </Typography>

            </a>
                <div className="flex justify-end gap-3">
                    <Button variant="outlined">Cancel</Button>
                    <Button type="submit" variant="contained">Save</Button>
                </div>

            </form>

            




        </div>

    )
}

export default AddGmailAppPassword;