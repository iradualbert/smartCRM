import { useState } from "react";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axios from "axios";

interface EmailFormData {
  to: string;
  cc: string;
  bcc: string;
  subject: string;
  body: string;
  schedule_datetime: string;
  attachments: File[];
}

const MailForm = ({ onSubmit }) => {

  const [formData, setFormData] = useState<EmailFormData>({
    to: 'albert.iradukunda@yahoo.com',
    cc: '',
    bcc: '',
    subject: '',
    body: '',
    schedule_datetime: '',
    attachments: [],
  });

  const [errors, setErrors] = useState<any>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleBodyChange = (value: string) => {
    setFormData((prevData) => ({ ...prevData, body: value }));
  };

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const attachmentsArray = Array.from(files);
      setFormData((prevData) => ({ ...prevData, attachments: attachmentsArray }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    axios.post('/mails/', formData)
      .then(res => {
        console.log(res)
      })
      .catch(err => console.error(err))
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col mt-10">
      <div className="flex gap-4">
        <label className="label">To:</label>
        <input
          className="input"
          placeholder="To"
          type="email"
          name="to"
          value={formData.to}
          onChange={handleChange}
          required
        />
      </div>
      <div className="flex gap-4">
        <label className="label">Subject: </label>
        <input
          className="input"
          type="text"
          value={formData.subject}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className="flex gap-4 mb-16">
        <label className="label">Body:</label>
        <ReactQuill value={formData.body} onChange={handleBodyChange} />
      </div>
      <div className="flex gap-4">
        <label className="label">Attachments:</label>
        <input
          type="file"
          name="attachments"
          onChange={handleAttachmentChange}
          multiple
          className="input"
        />

      </div>
      <div className="flex gap-4">
        <label className="label">Schedule Date Time:</label>
        <input
          type="datetime-local"
          name="schedule_datetime"
          value={formData.schedule_datetime}
          onChange={handleChange}
          className="input"
        />
      </div><div className="flex gap-4">
        <label className="label">CC:</label>
        <input
          type="email"
          name="cc"
          value={formData.cc}
          onChange={handleChange}
          className="input"
        />
      </div>
      <div className="flex gap-4">

        <label className="label">BCC:</label>
        <input
          type="email"
          name="bcc"
          value={formData.bcc}
          onChange={handleChange}
          className="input"
        />
      </div>
      <button type="submit" className="btn">
        Send Email
      </button>
    </form>
  )
};


export default MailForm