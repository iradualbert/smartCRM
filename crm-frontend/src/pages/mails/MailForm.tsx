import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useEffect, useRef, useState } from "react";
import ReactQuill from "react-quill";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Loader2 } from "lucide-react";
import { ImAttachment } from "react-icons/im";
import { MdOutlineSchedule } from "react-icons/md";
import { createEmail } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";


type InputEvent = React.ChangeEvent<HTMLInputElement>;

type MailFormProps = {
    isSaved? : boolean,
    mailContent?: {
        to?: string,
        cc?: string,
        body?: string,
        subject?: string,
    }
    onAfterSend?: () => void
}

const MailForm = ({ isSaved = false, mailContent, onAfterSend }: MailFormProps) => {
    const [errors, setErrors] = useState(null);
    const [scheduleAt, setScheduleAt] = useState("");
    const [mailData, setMailData] = useState({
        subject: "",
        to: "",
        cc: "",
        body: ""
    })
    const attachInputRef = useRef();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
    const { toast } = useToast();

    const isDisabled = isSubmitting

    useEffect(() => {
        if(mailContent){
            setMailData( prev => ({
                ...prev,
                ...mailContent
            }))
        }
    }, [mailContent])

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

    const handleSubmit = async (e: any, isScheduled = false) => {
        e.preventDefault();
        setIsSubmitting(true);
        setIsScheduleDialogOpen(false);
        const formData = new FormData();
        formData.append("to", mailData.to);
        formData.append("cc", mailData.cc);
        formData.append("body", mailData.body);
        formData.append("subject", mailData.subject);
        if (isScheduled && scheduleAt) {
            formData.append("schedule_datetime", scheduleAt);
        }
        attachments.forEach(attach => {
            formData.append("attachment", attach);
        });

        createEmail(formData)
            .then(() => {
                setErrors({})
                toast({
                    title: isScheduled ? "Email Scheduled" : "Email Sent"
                })
                if(onAfterSend) onAfterSend();
                setMailData({
                    to: mailContent?.to || "",
                    cc: mailContent?.cc || "",
                    subject: mailContent?.subject || "",
                    body: mailContent?.body || "",
                })
                setAttachments( new Set())
            })
            .catch((err) => {
                toast({
                    variant: "destructive",
                    title: "Request failed"
                })
                if (err.response)
                    setErrors(err.response?.data)
            })
            .finally(() => {
                setIsSubmitting(false);
            })
    }


    return (
        <div className="flex flex-col gap-4 py-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3 border-b">
                        <Label>To: </Label>
                        <Input
                            disabled={isDisabled}
                            className="border-none outline-none focus:outline-none focus:border-none"
                            value={mailData.to} onChange={onToChange}
                        />
                    </div>
                    {errors?.to && (
                        <p className='text-sm flex-1 text-red-500'>
                            {errors?.to}
                        </p>
                    )}
                </div>
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3 border-b">
                        <Label>CC: </Label>
                        <Input
                            disabled={isDisabled}
                            className="border-none outline-none focus:outline-none focus:border-none"
                            value={mailData.cc} onChange={onCCChange}
                        />
                    </div>
                    {errors?.cc && (
                        <p className='text-sm flex-1 text-red-500'>
                            {errors?.cc}
                        </p>
                    )}
                </div>
                <div className="flex flex-col gap-3 ">
                    <div className="border-b">
                        <Input className="border-none outline-none focus:outline-none focus:border-none"
                            value={mailData.subject}
                            placeholder="Subject"
                            onChange={onSubjectChange}
                            disabled={isDisabled}
                        />
                    </div>
                    {errors?.subject && (
                        <p className='text-sm flex-1 text-red-500'>
                            {errors?.subject}
                        </p>
                    )}
                </div>
                <div className="flex flex-col gap-3">
                    <ReactQuill
                        value={mailData.body}
                        onChange={onBodyChange}
                        placeholder="Start typing......"
                        className="mb-12 min-h-20"
                        readOnly={isDisabled}
                    />
                    {errors?.body && (
                        <p className='text-sm flex-1 text-red-500'>
                            {errors?.body}
                        </p>
                    )}
                </div>


                <div className="flex flex-col items-start py-4 gap-2">
                    <Button disabled={isDisabled} type="button" variant="ghost" onClick={handleAttachClick} className="flex gap-2 items-center">
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
                    <Button type="button" disabled={isDisabled} onClick={handleAttachClick} variant="outline" size="sm">+ Add</Button>
                </div>
                {errors?.non_field_errors && (
                    <p className='text-sm text-red-500'>
                        {errors.non_field_errors}
                    </p>
                )}
                <div className="flex gap-4">
                    <Button
                        variant="outline"
                        type="button"
                        onClick={handleSubmit}
                        disabled={isDisabled}
                    >
                        {isSubmitting  && (
                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                        )}
                        Send Now
                    </Button>
                    <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
                        <DialogTrigger asChild>
                            <Button type="button" variant="secondary" disabled={isDisabled}>Schedule</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle className="py-4" asChild>
                                    <div className="flex gap-4 items-center">
                                        <MdOutlineSchedule size={26} />
                                        <span>Send Email At</span>
                                    </div>

                                </DialogTitle>
                                <DialogDescription className="py-6" asChild>
                                    <div className="flex gap-4">
                                        <Input
                                            type="datetime-local"
                                            value={scheduleAt}
                                            onChange={(e) => {
                                                setScheduleAt(e.target.value);
                                            }}
                                        />
                                        <Button
                                            type="button"
                                            disabled={!scheduleAt}
                                            onClick={(e) => handleSubmit(e, true)}
                                        >
                                            Schedule
                                        </Button>
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
                    <Button type="button">Reschedule</Button>
                </div>
            )}
        </div>
    )
}


export default MailForm