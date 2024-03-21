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
import { Loader2, Mail } from "lucide-react";
import { MdOutlineSchedule } from "react-icons/md";
import { createBulkEmail, createEmail } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import MailAttachments from "./MailAttachments";
import { TemplateParameter } from "@/lib/types";
import { getUpdatedParams } from "@/lib/utils";
import ParameterInput from "@/components/forms/ParameterInput";
import BulkMailRows from "./BulkMailRows";
import ImportBulkMailRows from "./ImportMailRows";
import { BiCalendarEvent } from 'react-icons/bi';
import { SiMicrosoftexcel } from "react-icons/si";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "react-router-dom";



type InputEvent = React.ChangeEvent<HTMLInputElement>;

type BulkMailFormProps = {
    isSaved?: boolean,
    mailContent?: {
        to?: string,
        cc?: string,
        body?: string,
        subject?: string,
    }
    onAfterSend?: () => void,
    isSendingToContact?: true | false,
    contactCategoryId?: number | string,
    recipients?: { [key: string]: object }[], // this can be a list of contacts or subscribers - fields shall be mapped accordingly 
}

const BulkMailForm = ({ mailContent, onAfterSend }: BulkMailFormProps) => {

    const [errors, setErrors] = useState<any>(null);
    const [scheduleAt, setScheduleAt] = useState("");
    const [bulkEmailId, setBulkEmailId] = useState<undefined | string>();
    const [mailData, setMailData] = useState({
        subject: "",
        to: "{{ EMAIL }}",
        cc: "",
        body: ""
    })
    const [templateParameters, setTemplateParameters] = useState<TemplateParameter[]>([]);
    const [paramDefaultValues, setParamDefaultValues] = useState<any>({});
    const [gridRows, setGridRows] = useState<object[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
    const { toast } = useToast();
    const timer = useRef<number | any>();
    const [attachments, setAttachments] = useState<Set<File>>(new Set());
    const formRef = useRef<any>()
    const [isResultDialogOpen, setIsResultDialogOpen] = useState(false);
    const [results, setResults] = useState<any>({
        total_saved: 0,
        total_failed: 0,
    });
    const [rowResults, setRowResults] = useState<any>({})

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
            return currentRows.map((row: any) => {
                const _row: any = {_id : row._id}
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



    const updateParameterDefaultValue = (e: any, idx: number) => {
        setTemplateParameters(currentParams => {
            const _currentParams = [...currentParams]
            _currentParams[idx].defaultValue = e.target.value;
            return _currentParams
        })
        setParamDefaultValues((current: any) => ({
            ...current,
            [e.target.name]: e.target.value
        }))
    }

    function generateRandomString(length: number) {
        const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
        let result = "";
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }

    const handleImportedRows = ({ fieldMapping, rows }: any) => {

        rows.forEach((row: any) => {
            const rowData: any = { _id: generateRandomString(10) }
            Object.keys(fieldMapping).forEach(field => {
                rowData[field] = {
                    currentValue: row[fieldMapping[field]],
                    willUseDefaultValue: false
                }
            });
            rowData._id = generateRandomString(10);
            setGridRows(currentRows => [...currentRows, rowData])
        })
    }

    const handleAddRow = () => {
        const row: any = { _id: generateRandomString(10) }
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
    const handleRowInputChange = (e: any, rowIndex: number) => {
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

    const handleRowInputToggleUseDefaultValue = (paramName: string, rowIndex: number) => {
        setGridRows(currentRows => {
            const newRows = [...currentRows];
            const updatedRow: any = newRows[rowIndex];
            let willUseDefaultValue = true;
            let currentValue = paramDefaultValues[paramName];
            try {
                willUseDefaultValue = !updatedRow[paramName].willUseDefaultValue;
                currentValue = willUseDefaultValue ? paramDefaultValues[paramName] : updatedRow[paramName].currentValue;
            } catch (err) {
                console.error(err)
            }
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

        if (gridRows.length <= 0) {
            alert("Add at least one row");
            return
        }
        setResults({
            total_saved: "",
            total_failed: ""
        })
        setIsSubmitting(true);
        const formData = new FormData();
        const mailTemplate: any = mailData;
        if (isScheduled && scheduleAt) {
            mailTemplate["schedule_datetime"] = scheduleAt;
        }
        formData.append("template", JSON.stringify(mailTemplate));

        attachments.forEach(attach => {
            formData.append("attachment", attach);
        });
        const rowsToSend = gridRows.filter((row: any) => rowResults[row._id] !== "sent")
        formData.append("mailRows", JSON.stringify(rowsToSend));
        const parameters: any = {}
        templateParameters.forEach(param => {
            parameters[param.name] = paramDefaultValues[param.name] === undefined ? param.defaultValue : paramDefaultValues[param.name]
        })
        formData.append("paramDefaultValues", JSON.stringify(parameters))
        try {
            const { data } = await createBulkEmail(formData)
            setIsResultDialogOpen(true);
            setBulkEmailId(data.bulk_mail_id)
            setResults({ ...data.results })
            setRowResults((prevResults: any) => ({ ...prevResults, ...data.row_results }))
            setErrors({})

        } catch (err: any) {
            setErrors(err.response?.data)
            if (err.response?.data) toast({
                title: "Template error",
                description: "Check the template and try again.",
                variant: "destructive"
            });
            formRef.current.scrollIntoView()

        }
        finally {
            setIsSubmitting(false);
            setIsScheduleDialogOpen(false);
        }
    }


    return (
        <>
            <h1 className="text-3xl font-bold my-10">EMail template</h1>
            <div className="flex gap-4 py-6 justify-between flex-wrap bg-slate-100 p-4 mt-4">
                <form onSubmit={handleSubmit} ref={formRef} className="flex flex-col gap-4 max-w-3xl w-full">
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
                    <div className="flex flex-col gap-3 bg-white">
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
            <h1 className="text-3xl font-bold my-10">EMAILS & VALUES</h1>
            <div className="flex flex-col gap-6">
                <p className="text-lg text-neutral-400">{"Add row and type values & import from Excel / CSV"}</p>
                <BulkMailRows
                    isDisabled={isDisabled}
                    rowResults={rowResults}
                    onRemoveRow={handleRemoveRow}
                    rows={gridRows}
                    parameters={templateParameters}
                    onRowInputChange={handleRowInputChange}
                    onRowInputUseDefaultValueChange={handleRowInputToggleUseDefaultValue}
                />
                <div className="flex gap-4 items-center">
                    <Button onClick={handleAddRow} size="sm">+ Add Row</Button>
                    <ImportBulkMailRows
                        key={templateParameters as any}
                        parameters={
                            templateParameters.reduce((p: any, { name }) => {
                                p[name] = "";
                                return p;
                            }, {})}
                        onImportRows={handleImportedRows}
                    >
                        <Button variant="outline" size="sm">
                            <SiMicrosoftexcel className="mr-2 h-4 w-4" />
                            Import Excel
                        </Button>
                    </ImportBulkMailRows>
                    <span>Total: {gridRows.length} </span>
                </div>
            </div >
            <div className="flex gap-8 my-16">
                <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isDisabled}
                    size="lg"
                >

                    {isSubmitting && (
                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    )}
                    Send All Now
                </Button>
                <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
                    <DialogTrigger asChild>
                        <Button type="button" size="lg" variant="secondary" disabled={isDisabled}>
                            <BiCalendarEvent className="mr-2 h-4 w-4" />
                            Schedule
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="py-4" asChild>
                                <div className="flex gap-4 items-center">
                                    <MdOutlineSchedule size={26} />
                                    <span>Send All Emails At</span>
                                </div>

                            </DialogTitle>
                            <DialogDescription className="py-6" asChild>
                                <div className="flex flex-col gap-8">
                                    <Input
                                        type="datetime-local"
                                        value={scheduleAt}
                                        onChange={(e) => {
                                            setScheduleAt(e.target.value);
                                        }}
                                    />
                                    {/* <div className="flex gap-4 items-center">
                                        <Checkbox />
                                        <span>Only for Emails without custom schedule</span>
                                    </div> */}

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
            <Dialog open={isResultDialogOpen} onOpenChange={setIsResultDialogOpen}>
                <DialogTrigger asChild>
                    <Button type="button" size="lg" variant="secondary">
                        <BiCalendarEvent className="mr-2 h-4 w-4" />
                        View Status
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {isSubmitting ? "Scheduling & Sending...." : "Status"}
                        </DialogTitle>
                        <DialogDescription className="py-6" asChild>
                            <div className="flex flex-col gap-4">
                                <>
                                    <p>Failed: {results.total_failed} </p>
                                    <p>Scheduled Emails: {results.total_saved}</p>
                                </>
                                <div className="flex gap-4">

                                    <Button variant="outline" onClick={() => setIsResultDialogOpen(false)}>
                                        Continue Sending
                                    </Button>
                                    <Link to="/emails/new">
                                        <Button variant="secondary">New Email</Button>
                                    </Link>
                                    <Link to="/emails">
                                        <Button variant="default">Dashboard</Button>
                                    </Link>
                                </div>
                            </div>

                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>

        </>

    )
}


export default BulkMailForm