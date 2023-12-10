import { useState } from 'react'
import DialogButton from './ui/DialogButton';
import { TextField, FormControlLabel, Radio, RadioGroup } from "@mui/material"

const ScheduleMeetingButton = ({ contact }) => {
    const [meetingDetails, setMeetingDetails] = useState({
        title: '',
        description: '',
        date: null,
        time: null,
        platform: null,
        guests: [],
    });

    const handleChange = (event) => {
        setMeetingDetails({
            ...meetingDetails,
            [event.target.name]: event.target.value,
        });
    };

    return (
        <DialogButton
            modalTitle={`Schedule a meeting with ${contact.first_name}`}
            btnTitle="Meet"
        >
            <div className='flex flex-col gap-4'>
                <TextField
                    fullWidth
                    label="Title"
                    name="title"
                    value={meetingDetails.title}
                    onChange={handleChange}
                />
                <RadioGroup>
                    <FormControlLabel value="google_meet" control={<Radio />} label="Google Meet" />
                    <FormControlLabel value="zoom" control={<Radio />} label="Zoom" />
                    <FormControlLabel value="outlook" control={<Radio />} label="Outlook" />
                </RadioGroup>
                <TextField
                    fullWidth
                    label="Description"
                    name="description"
                    multiline
                    rows={4}
                    value={meetingDetails.description}
                    onChange={handleChange}
                />
                <TextField
                    label="Guests"
                    type="email"
                    placeholder="Enter guest email"
                />
                <input className='input' type="datetime-local"/>
            </div>

        </DialogButton>
    )
}

export default ScheduleMeetingButton