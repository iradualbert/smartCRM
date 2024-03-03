import { Button, Typography } from "@mui/material";

const BookingPage = () => {
    return (
        <div>
            <Button size="small" variant="outlined">Create a Booking Link</Button>
            <div className="flex">
                <Typography>Booking Link One</Typography>
                <Button>Share Via Email</Button>
                <Button>Edit</Button>
                <Button>Copy</Button>
            </div>
        </div>
    )
}

export default BookingPage
