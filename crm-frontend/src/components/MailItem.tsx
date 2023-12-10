import Button from "@mui/material";

const MailItem = ({ mail, onCancelClick, onSendNowClick }) => {
  const { id, to, cc, bcc, subject, body, schedule_datetime, is_sent, sent_datetime } = mail;

  const formattedDateTime = schedule_datetime
    ? `Scheduled to be sent at ${new Date(schedule_datetime).toLocaleString()}`
    : `Sent at ${new Date(sent_datetime).toLocaleString()}`;

  return (
    
  );
};


export default MailItem;
