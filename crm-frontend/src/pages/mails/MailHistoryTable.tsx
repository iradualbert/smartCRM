import { useApiListView } from "@/lib/hooks";
import { useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import DataTable from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { FiEye } from "react-icons/fi";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import MailForm from "./MailForm";
import { Input } from "@/components/ui";
import { Label } from "@/components/ui/label";

const parseTime = (time: string) => {
    if (!time) return ""
    return new Date(time)
        .toLocaleString('tr-TR',
            { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }
        )
}


type Mail = {
    [key: string]: string

}

type funAR = {
    id: number | string,
    urlWithId: string,
    data?: object
}

type API = {
    results: Mail[],
    deleteItem: (args: funAR) => void;
    updateItem: (args: funAR) => void;
}

const getMailBodyText = (body: string) => {
    const div = document.createElement("div");
    div.innerHTML = body;
    return div.innerText;
}

const Actions = ({ api, mail }: { api: API, mail: Mail }) => {
    const now = (new Date()).toISOString().slice(0, 16);
    const [isPerformingAction, setIsPerformingAction] = useState(false);
    const { is_sent, failed } = mail;
    const status = is_sent ? "Sent" : failed ? "Failed" : "Scheduled"
    const { toast } = useToast();
    const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false);
    const [scheduleDateTime, setScheduleDateTime] = useState(now);

    const handleDelete = async () => {
        setIsPerformingAction(true)
        toast({ title: "Deleting..." })
        try {
            await api.deleteItem({ urlWithId: `/mails/${mail.id}/`, id: mail.id })
            toast({ title: "Email deleted & canceled" })
        } catch (err) {
            toast({ title: "Something went wrong", variant: "destructive" })
        }
        finally {
            setIsPerformingAction(false);
        }

    }

    const handleUpdate = async (e: any,action: string) => {
        e.preventDefault();
        setIsPerformingAction(true)
        toast({ title: "Updating..." })
        try {
            await api.updateItem({
                urlWithId: `/mails/${mail.id}/?action=${action}`, id: mail.id, data: {
                    schedule_datetime: scheduleDateTime || now
                }
            })
            toast({ title: "Updated" })
        } catch (err) {
            toast({ 
                title: "Something went wrong", 
                variant: "destructive",
                description: JSON.stringify(err.response)
            })
        }
        finally {
            setIsPerformingAction(false);
        }
    }

    const handleViewFailureReason = () => {
        toast({
            title: mail.failure_reason,
            variant: "destructive",
        })
    }

    return (
        <DropdownMenu>
            <Dialog open={isRescheduleDialogOpen} onOpenChange={setIsRescheduleDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Resend & Rescedule Email</DialogTitle>
                        <DialogDescription className="py-6 mt-10 " asChild>
                            <form
                                className="flex flex-col gap-4"
                                onSubmit={(e) => handleUpdate(e, "reschedule")}
                            >
                                <Label>Send At: </Label>
                                <Input
                                    type="datetime-local"
                                    value={scheduleDateTime}
                                    onChange={(e) => setScheduleDateTime(e.target.value)}
                                />
                                <Button type="submit">Schedule</Button>
                            </form>
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                {status === "Scheduled" &&
                    <DropdownMenuItem
                        disabled={isPerformingAction}
                        onClick={(e) => handleUpdate(e, "send_now")}
                    >
                        Send Now
                    </DropdownMenuItem>
                }
                <DropdownMenuItem
                    disabled={isPerformingAction}
                    onClick={() => setIsRescheduleDialogOpen(true)}
                >
                    Reschedule & Send Again
                </DropdownMenuItem>
                {status === "Failed" &&
                    <DropdownMenuItem onClick={handleViewFailureReason}>View Failure Reason</DropdownMenuItem>
                }
                <DropdownMenuItem disabled={isPerformingAction} onClick={handleDelete}>Delete & Cancel</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

const MailHistoryTable = () => {
    const api: API = useApiListView("/mails/") as any;
    const [paginationModel, _] = useState({ page: 0, pageSize: 10 });



    useEffect(() => {
        api.setParams({
            offset: (paginationModel.page * paginationModel.pageSize),
            limit: paginationModel.pageSize
        })
    }, [paginationModel]);

    const formatMailRecipients = (mail: Mail) => {
        if (mail.cc) return `${mail.to}\nCC: ${mail.cc}`
        return mail.to
    }

    const formatMailContent = (mail: Mail) => {
        return (
            <div className="flex flex-col gap-3 max-w-md mb-2">
                <h1 className="text-xl truncate">{mail.subject}</h1>
                <p className="truncate">{getMailBodyText(mail.body)}</p>
            </div>
        )
    }

    const columns: ColumnDef<object>[] = [
        {
            id: "preview",
            cell: ({ row }) => (
                <Dialog>
                    <DialogTrigger asChild><Button size="icon" variant="link"><FiEye /></Button></DialogTrigger>
                    <DialogContent className={"lg:max-w-screen-lg overflow-y-scroll max-h-screen"}>
                        <DialogHeader>
                            <DialogTitle>Email Preview</DialogTitle>
                            <DialogDescription className="py-6 mt-10 " asChild>
                                <MailForm mailContent={row.original} isPreview={true} />
                            </DialogDescription>
                        </DialogHeader>
                    </DialogContent>
                </Dialog>
            )
        },
        {
            accessorKey: "recipients",
            header: "Recipients",
            cell: ({ row }) => row.getValue("recipients")
        },
        {
            accessorKey: "content",
            header: "Content",
            cell: ({ row }) => row.getValue("content")
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const { is_sent, failed } = row.original as { is_sent: boolean, failed: boolean };
                const status = is_sent ? "Sent" : failed ? "Failed" : "Scheduled"
                return (
                    <div className={`status ${status}`}>
                        <p>{status}</p>
                    </div>
                )
            }
        },
        {
            accessorKey: "scheduleTime",
            header: "Sending Date",
            cell: ({ row }) => parseTime(row.original.schedule_datetime)

        },
        {
            accessorKey: "createdAt",
            header: "Created At",
            cell: ({ row }) => parseTime(row.original.created_at)
        },

        {
            id: "actions",
            cell: ({ row }) => <Actions mail={row.original as Mail} api={api} />
        },

    ]



    const dataRows = api.results.map((mail: Mail) => ({
        recipients: formatMailRecipients(mail),
        content: formatMailContent(mail),
        status: "Sent",
        ...mail
    }))

    return (
        <>
            <DataTable
                columns={columns}
                data={dataRows}
                hasNext={api.moreAvailable}
                onNext={api.loadMore}
                isLoading={api.isLoading}
                count={api.count}
            />
        </>
    )

}

export default MailHistoryTable