import { useState, useRef, FormEvent } from "react";
import ImportTemplate from "@/components/ImportTemplate";
import ContactsImporter from "@/components/ContactsImporter";
import { FormControl, Input, InputAdornment, Button, InputLabel, FormGroup, FormControlLabel, Switch, Typography } from "@mui/material";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { ImAttachment } from "react-icons/im";
import { MdOutlineSchedule } from "react-icons/md";
import { createEmail } from "@/lib/api";


const MailForm = () => {
  const [isBulk, setIsBulk] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [attachments, setAttachments] = useState(new Set());
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [CC, setCC] = useState("");
  const [mailBody, setMailBody] = useState("");
  const [isSendLater, setIsSendLater] = useState(false);
  const [scheduleAt, setScheduleAt] = useState("");
  const [isScheduleDisabled, setIsScheduleDisabled] = useState(false);

  const attachInputRef = useRef();

  const [template, setTemplate] = useState({
    id: undefined,
    templateName: "",
    subject: "",
    mailBody: "",
    parameters: []
  });

  const handleSubmit = (e: any) => {
    e.preventDefault();
    const data = {
      to,
      cc: CC,
      body: mailBody,
      subject,
    }
    if (isSendLater && scheduleAt) {
      data.schedule_datetime = scheduleAt
    }

    const formData = new FormData();
    formData.append("to", to);
    formData.append("cc", CC);
    formData.append("body", mailBody);
    formData.append("subject", subject);
    if (isSendLater && scheduleAt) {
      formData.append("schedule_datetime", scheduleAt);
    }
    attachments.forEach(attach => {
      formData.append("attachment", attach);
    });
    createEmail(formData);

  }

  const handleAttachClick = () => {
    attachInputRef.current.click();
  }

  const handleSelect = (template: object) => {
    const newTemplate = {
      id: template.id,
      templateName: template.name,
      subject: template.subject,
      mailBody: template.body,
      parameters: template.parameters
    }
    setSelectedTemplate(newTemplate)
    setTemplate(newTemplate)
  }
  const handleChange = template => {
    setTemplate(template)
  }

  const handleAddAttach = (e) => {
    setAttachments((prev) => new Set([...prev, ...e.target.files]));
  };

  const handleRemoveAttach = (index) => {
    setAttachments((prev) => {
      const newFiles = new Set([...prev]);

      // Convert set to an array, remove the file at the specified index, and convert back to a set
      const filesArray = Array.from(newFiles);
      filesArray.splice(index, 1);
      const updatedFilesSet = new Set(filesArray);

      return updatedFilesSet;
    });
  };

  function getCurrentDateTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }


  return (
    <section className="bg-primary-50 max-w-xl bg-dotted-pattern bg-center bg-cover py-2  md:py-3">
      <Typography variant="h5">Send & Schedule Email</Typography>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2 md:gap-5 py-5 md:py-10">
        <FormControl fullWidth>
          <Input
            size="small"
            value={to}
            onChange={e => setTo(e.target.value)}
            startAdornment={
              <InputAdornment position="start">
                <InputLabel>To: </InputLabel>
              </InputAdornment>
            }
          />
        </FormControl>
        <FormControl fullWidth>
          <Input
            value={subject}
            onChange={e => setSubject(e.target.value)}
            size="small"
            startAdornment={
              <InputAdornment position="start">
                <InputLabel>Subject:</InputLabel>
              </InputAdornment>
            }
          />
        </FormControl>
        <FormControl fullWidth>
          <Input
            value={CC}
            onChange={e => setCC(e.target.value)}
            size="small"
            startAdornment={
              <InputAdornment position="start">
                <InputLabel>CC:</InputLabel>
              </InputAdornment>
            }
          />
        </FormControl>
        <ReactQuill
          value={mailBody}
          onChange={setMailBody}
          placeholder="Mail Body"
          className="mb-12 min-h-20"
        />
        {attachments &&
          <div className="flex">
            {Array.from(attachments).map((file, idx) => <li key={idx}>{file.name}</li>)}
          </div>

        }

        <div className="py-2">
          <input hidden type="file" onChange={handleAddAttach} multiple ref={attachInputRef} />
          <Button startIcon={<ImAttachment />} onClick={handleAttachClick}>Add Attachments</Button>
        </div>
        <FormGroup row>

          <div className="flex gap-2 items-center">
            <InputLabel>Send At:</InputLabel>
            <input
              value={scheduleAt}
              disabled={isScheduleDisabled}
              onChange={(e) => {
                setScheduleAt(e.target.value);
                if (e.target.value) setIsSendLater(true);
              }}
              className=" outline-none" type="datetime-local"
              min={getCurrentDateTime()}
            />
          </div>
          <FormControlLabel
            value="Send Now"
            control={<Switch color="primary" checked={!isSendLater} />}
            label="Send Now"
            labelPlacement="start"
            onChange={e => {
              setIsSendLater(!e.target.checked);
              setIsScheduleDisabled(e.target.checked);
            }}
          />
        </FormGroup>

        <div className="flex gap-3 flex-wrap ">
          <Button
            onClick={handleSubmit}
            variant="contained"
          >
            {isSendLater && scheduleAt ? "Schedule" : "Send Now"}
          </Button>
        </div>
      </form>
    </section>
  )
}


export default MailForm;