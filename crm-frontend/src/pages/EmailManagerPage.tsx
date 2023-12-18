import { useState, useEffect } from "react";
import axios from "axios";
import 'react-quill/dist/quill.snow.css';
import MailForm from "../components/forms/MailForm";
import { Button } from "@/components/ui/button";
import dompurify from "dompurify";
import { TableContainer, Table, TableHead, Checkbox, TableBody, TableCell, TableRow, Typography } from "@mui/material";
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';


const parseTime = (s) => {
  const date = new Date(s);
  const today = new Date();

  if (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  ) {
    // If the date is today, return only the time
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else {
    // If the date is not today, return the date without seconds
    return date.toLocaleString([], { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
};

const sanitizer = dompurify.sanitize;

const getMailBodyText = body => {
  const div = document.createElement("div");
  div.innerHTML = body;
  return div.innerText;
}

const EmailManagerPage = () => {

  const [emails, setEmails] = useState([]);



  useEffect(() => {
    axios.get('/mails/')
      .then(response => setEmails(response.data))
      .catch(error => console.error('Error fetching time slots:', error));
  }, []);


  return (
    <div>
      <div className="flex gap-10">
        <Button>Send An Email</Button>
        <Button>Schedule Email</Button>
        <Button>Multiple Email</Button>
        <Button className="group">
          Email Compaign
          <span className="sidebar-tooltip group-hover:scale-100">
            {"Send Email To users & Import Exel file & use Templates & add and remove recipients"}
          </span></Button>
        <Button>Create Email Template</Button>
      </div>
      <MailForm onSubmit={() => { }} />
      <div>
        <button>Send Email</button>
        <button>Schedule an Email</button>
        <button>Multiple Email</button>
        <h1>Sent Mails</h1>
        <h1>Scheduled Mails</h1>
        <h2>Recent Mails</h2>
        <div>
          to: , subject : status: sent/scheduled, type: single mail/toplu email, bcc, cc,
        </div>
        <h1>User One - type: Lead</h1>
        <h1>User Two - type: Customer</h1>
      </div>
      <div className="flex flex-col">
        <FormControl sx={{ m: 2, width: 180 }} size="small">
          <Select
            label="Status"
            value={"10"}
          >
            <MenuItem value={10}>All Emails</MenuItem>
            <MenuItem value={20}>Scheduled</MenuItem>
            <MenuItem value={30}>Sent</MenuItem>
            <MenuItem value={40}>Failed</MenuItem>
          </Select>
        </FormControl>
        <TableContainer>
          <Table
            sx={{ minWidth: 750 }}
            aria-labelledby="Emails"
            size='medium'
          >
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    color="primary"
                  />
                </TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Recipient</TableCell>
                <TableCell>Content</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Cancel / Delete</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {emails.map((mail) => {
                return (
                  <TableRow
                    key={mail.id}
                    hover
                    role="checkbox"
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                      />
                    </TableCell>
                    <TableCell>{parseTime(mail.created_at)}</TableCell>
                    <TableCell
                      component="th"
                      scope="row"
                      padding="none"
                    >
                      <Typography textOverflow="ellipsis">To: {mail.to}</Typography>
                      <Typography>CC: {mail.cc}</Typography>
                      <Typography>To: {mail.bcc}</Typography>
                    </TableCell>

                    <TableCell align="left">
                      <Typography fontWeight="600">{mail.subject}</Typography>
                      <Typography>{getMailBodyText(mail.body)}</Typography>
                    </TableCell>


                    <TableCell>
                      {mail.is_sent ? (
                        <>
                          <Typography color="primary">Sent</Typography>
                          <Typography>{parseTime(mail.sent_datetime)}</Typography>
                        </>
                      )
                        : mail.failed ? <Typography>Failed</Typography> : (
                          <>
                            <Typography>Scheduled</Typography>
                            <Typography>{parseTime(mail.schedule_datetime)}</Typography>
                          </>

                        )
                      }
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {mail.is_sent && <Button>Send Again</Button>}
                        {mail.failed && <Button>Try Again</Button>}
                        {!mail.is_sent && <Button>Send Now</Button>}
                        {!mail.is_sent && <Button>Reschedule</Button>}
                      </div>
                    </TableCell>
                    <TableCell><Button>Delete</Button></TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>

      </div>
    </div>
  )

}

export default EmailManagerPage