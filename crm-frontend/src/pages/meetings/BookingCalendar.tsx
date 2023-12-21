import axios from "axios";
import { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from 'moment';

const localizer = momentLocalizer(moment);

const BookingCalendar = () => {

    const [bookedSlots, setBookedSlots] = useState([]);

    useEffect(() => {
        axios.get('/slots/')
            .then(response => setBookedSlots(response.data))
            .catch(error => console.error('Error fetching time slots:', error));
    }, []);

    const handleSelectSlot = ({ start, end }) => {
        // Logic for handling the click on a time slot and showing a popup
        console.log('Selected slot:', { start, end });
    };

    const [events, setEvents] = useState([
        {
          title: 'Unavailable Slot',
          start: new Date(2023, 10, 15, 10, 0, 0),
          end: new Date(2023, 10, 15, 12, 0, 0),
          desc: 'This slot is unavailable',
        },
        // Add more events as needed
      ]);
    const handleSelectEvent = (event) => {
        // Logic for handling the click on a calendar event
        console.log('Selected event:', event);
    }
    const eventPropGetter = (event: Event) => {
        if (
          moment(event.start).isoWeekday() === 5 && // Friday
          moment(event.start).hour() >= 12 // Afternoon
        ) {
          return {
            style: {
              backgroundColor: 'red',
              color: 'white',
              cursor: 'not-allowed',
            },
          };
        }
        return {};
      };

    return (
        <div>
            <h1>Booking</h1>
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                selectable
                onSelectSlot={handleSelectSlot}
                onSelectEvent={handleSelectEvent}
                eventPropGetter={eventPropGetter}
            />
            <h1>My Calendar: Upcoming Events</h1>
            <p>Filter: Approved, Unapproved, Rejected</p>
        </div>
    )
};


export default BookingCalendar;