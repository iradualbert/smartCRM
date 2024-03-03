import { useState } from "react";

const BookingLinkForm = () => {
    const [title, setTitle] = useState("");
    const [canReschedule, setCanReschedule]=useState(false);
    const [requireConfirmation, setRequireConfirmation] = useState(false);
    const [meetingPlaces, setMeetingPlaces] = useState([]);
    const [time, setTime] = useState("");
    const [timeslots, setTimeSlots] = useState([]);
    

}

export default BookingLinkForm;