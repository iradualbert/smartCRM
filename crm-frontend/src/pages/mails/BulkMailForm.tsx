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
import { MdOutlineSchedule } from "react-icons/md";
import { createEmail } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import MailAttachments from "./MailAttachments";
import { TemplateParameter } from "@/lib/types";
import { getUpdatedParams } from "@/lib/utils";
import ParameterInput from "@/components/forms/ParameterInput";
import BulkMailRows from "./BulkMailRows";


type InputEvent = React.ChangeEvent<HTMLInputElement>;

type MailFormProps = {
    isSaved?: boolean,
    mailContent?: {
        to?: string,
        cc?: string,
        body?: string,
        subject?: string,
    }
    onAfterSend?: () => void
}

const BulkMailForm = ({ mailContent, onAfterSend }: MailFormProps) => {


    const [errors, setErrors] = useState(null);
    const [scheduleAt, setScheduleAt] = useState("");
    const [bulkEmailId, setBulkEmailId] = useState<undefined | string>();
    const [mailData, setMailData] = useState({
        subject: "",
        to: "{{ email }}",
        cc: "",
        body: "{{ amir}} {{manager}}"
    })
    const [templateParameters, setTemplateParameters] = useState<TemplateParameter[]>([]);
    const [paramDefaultValues, setParamDefaultValues] = useState({});
    const [gridRows, setGridRows] = useState<object[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
    const { toast } = useToast();
    const timer = useRef<number>();
    const [attachments, setAttachments] = useState<Set<File>>(new Set());

    const isDisabled = isSubmitting

    useEffect(() => {
        if (mailContent) {
            setMailData(prev => ({
                ...prev,
                ...mailContent
            }))
        }
    }, [mailContent])

    useEffect(() => {
        if (timer.current) {
            clearTimeout(timer.current as number);
        }
        timer.current = setTimeout(() => {
            setTemplateParameters(current => {
                const { params } = getUpdatedParams(mailData.to + mailData.cc + mailData.subject + mailData.body, current);
                return params
            });
        }, 1000)
        return () => clearTimeout(timer.current)

    }, [mailData])
    useEffect(() => {
        setGridRows(currentRows => {
            return currentRows.map(row => {
                const _row = {}
                templateParameters.forEach(param => {
                    _row[param.name] = row[param.name] || { currentValue: "", willUseDefaultValue: false }
                })
                return _row
            })
        })
    }, [templateParameters])

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



    const updateParameterDefaultValue = (e, idx) => {
        setTemplateParameters(currentParams => {
            const _currentParams = [...currentParams]
            _currentParams[idx].defaultValue = e.target.value;
            return _currentParams
        })
        setParamDefaultValues(current => ({
            ...current,
            [e.target.name]: e.target.value
        }))
    }

    const handleAddRow = () => {
        const row = {}
        templateParameters.forEach(param => {
            row[param.name] = {
                currentValue: "", //paramDefaultValues[param.name] || param.defaultValue,
                willUseDefaultValue: false,
            }
        })
        setGridRows(current => [...current, row])
    }

    const handleRemoveRow = (removeAt: number) => {
        setGridRows(currentRows => {
            const newRows = [...currentRows];
            newRows.splice(removeAt, 1)
            return newRows
        })
    }
    const handleRowInputChange = (e, rowIndex) => {
        setGridRows(currentRows => {
            const newRows = [...currentRows];
            const updatedRow = newRows[rowIndex];
            newRows[rowIndex] = {
                ...updatedRow,
                [e.target.name]: {
                    currentValue: e.target.value,
                    willUseDefaultValue: false,
                }
            }
            return newRows
        })
    }

    const handleRowInputToggleUseDefaultValue = (paramName: string, rowIndex: nubmer) => {
        setGridRows(currentRows => {
            const newRows = [...currentRows];
            const updatedRow = newRows[rowIndex];
            let willUseDefaultValue = true;
            let currentValue = paramDefaultValues[paramName];
            try {
                willUseDefaultValue = !updatedRow[paramName].willUseDefaultValue;
                currentValue = willUseDefaultValue ? paramDefaultValues[paramName] : updatedRow[paramName].currentValue;
            } catch (err) {
                console.error(err)
            }

            console.log(updatedRow)

            newRows[rowIndex] = {
                ...updatedRow,
                [paramName]: {
                    currentValue: currentValue || "",
                    willUseDefaultValue,
                }
            }
            return newRows
        })

    }


    const handleSubmit = async (e: any, isScheduled = false) => {
        e.preventDefault();
        return
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
                if (onAfterSend) onAfterSend();
                setMailData({
                    to: mailContent?.to || "",
                    cc: mailContent?.cc || "",
                    subject: mailContent?.subject || "",
                    body: mailContent?.body || "",
                })
                setAttachments(new Set())
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
        <>
            <div className="flex gap-4 py-6 justify-between flex-wrap">
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-3xl w-full">
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
                    <MailAttachments
                        attachments={attachments}
                        onAttachmentsChange={setAttachments}
                    />

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
                            {isSubmitting && (
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
                {templateParameters.length > 0 && (
                    <div className="flex flex-col border-2 p-5 rounded-md self-start gap-3">
                        <h2 className="text-2xl">Parameters</h2>
                        {templateParameters.map((param, idx) => (
                            <ParameterInput
                                onChange={e => updateParameterDefaultValue(e, idx)}
                                key={idx}
                                param={param}
                                value={paramDefaultValues[param.name]}
                            />
                        ))
                        }
                    </div>
                )}
            </div>
            <div className="flex flex-col gap-8">
                <div className="flex gap-4">
                    <Button variant="secondary">Send All</Button>
                    <Button variant="secondary">Schedule All</Button>
                    <Button variant="outline">Preview</Button>
                    <Button variant="outline">Select Contacts</Button>
                    <Button variant="outline">Import Excel</Button>
                </div>
                <BulkMailRows
                    onAddRow={handleAddRow}
                    onRemoveRow={handleRemoveRow}
                    rows={gridRows}
                    parameters={templateParameters}
                    onRowInputChange={handleRowInputChange}
                    onRowInputUseDefaultValueChange={handleRowInputToggleUseDefaultValue}
                />
            </div>
        </>

    )
}


export default BulkMailForm