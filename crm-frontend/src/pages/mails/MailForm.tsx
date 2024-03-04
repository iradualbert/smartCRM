import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useRef, useState } from "react";
import ReactQuill from "react-quill";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { ImAttachment } from "react-icons/im";
import { Chip } from "@mui/material";

type InputEvent = React.ChangeEvent<HTMLInputElement>;

const MailForm = ({ isBulk = false, isSaved = false }) => {
    const [errors, setErrors] = useState(null);
    const [scheduledAt, setSceduledAt] = useState("");
    const [mailData, setMailData] = useState({
        subject: "",
        to: "",
        cc: "",
        body: ""
    })
    const attachInputRef = useRef();

    const onSubjectChange = (e: InputEvent) => {
        setMailData(prev => ({ ...prev, subject: e.target.value }))
    }
    const onToChange = (e: InputEvent) => {
        setMailData(prev => ({ ...prev, to: e.target.value }))
    }
    const onCCChange = (e: InputEvent) => {
        setMailData(prev => ({ ...prev, cc: e.target.value }))
    }
    const onBodyChange = (value: string) => {
        setMailData(prev => ({ ...prev, body: value }))
    }

    const [attachments, setAttachments] = useState(new Set());

    const handleSubmit = () => {

    }

    const handleAttachClick = () => {
        attachInputRef.current?.click();
    }


    const handleAddAttach = (e) => {
        setAttachments((prev) => new Set([...prev, ...e.target.files]));
    };

    const handleRemoveAttach = (index: number) => {
        setAttachments((prev) => {
            const newFiles = new Set([...prev]);

            // Convert set to an array, remove the file at the specified index, and convert back to a set
            const filesArray = Array.from(newFiles);
            filesArray.splice(index, 1);
            const updatedFilesSet = new Set(filesArray);

            return updatedFilesSet;
        });
    };


    return (
        <div className="flex flex-col gap-4 py-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex items-center gap-3 border-b">
                    <Label>To: </Label>
                    <Input
                        className="border-none outline-none focus:outline-none focus:border-none"
                        value={mailData.to} onChange={onSubjectChange}
                    />
                </div>
                <div className="flex items-center gap-3 border-b">
                    <Label>CC: </Label>
                    <Input className="border-none outline-none focus:outline-none focus:border-none"
                        value={mailData.to}
                        onChange={onSubjectChange}
                    />
                </div>
                <div className="flex items-center gap-3 border-b">
                    <Input className="border-none outline-none focus:outline-none focus:border-none"
                        value={mailData.to}
                        placeholder="Subject"
                        onChange={onSubjectChange}
                    />
                </div>
                <ReactQuill
                    value={mailData.body}
                    onChange={onBodyChange}
                    placeholder="Start typing......"
                    className="mb-12 min-h-20"
                />

                <div className="flex flex-col items-start py-4 gap-2">
                    <Button type="button" variant="ghost" onClick={handleAttachClick} className="flex gap-2 items-center">
                        <ImAttachment />
                        Attachments
                    </Button>
                    <div className="py-4 w-full px-2 rounded-md border">
                        <input hidden type="file" onChange={handleAddAttach} multiple ref={attachInputRef} />
                        {attachments &&
                            <div className="flex gap-3 flex-wrap">
                                {
                                    Array.from(attachments).map(
                                        (file, idx) => (<div className="p-2 flex gap-2 items-center rounded-lg bg-slate-200" key={idx}>
                                            <span>{file.name}</span>
                                            <Button type="button" variant="secondary" onClick={() => handleRemoveAttach(idx)} >X</Button>
                                        </div>),
                                    )}
                            </div>
                        }
                    </div>
                    <Button type="button" onClick={handleAttachClick} variant="outline" size="sm">+ Add</Button>
                </div>

                <div className="flex gap-4">
                    <Button variant="outline" type="button">Send Now</Button>
                    <Dialog>
                        <DialogTrigger asChild><Button type="button" variant="secondary">Schedule</Button></DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle className="py-4">
                                    Send Email At
                                </DialogTitle>
                                <DialogDescription className="py-6" asChild>
                                    <div className="flex gap-4">
                                        <Input type="datetime-local" />
                                        <Button type="button">Schedule</Button>
                                    </div>
                                </DialogDescription>
                            </DialogHeader>
                        </DialogContent>
                    </Dialog>
                </div>

            </form>
            {isSaved && (
                <div className="flex gap-3">
                    <Button type="button">Delete</Button>
                    <Button type="button">Reschudule</Button>
                </div>
            )}
        </div>
    )
}


export default MailForm