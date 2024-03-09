import { useApiListView } from "@/lib/hooks";
import { useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import DataTable from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { FiEye } from "react-icons/fi";

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

const getMailBodyText = (body: string) => {
    const div = document.createElement("div");
    div.innerHTML = body;
    return div.innerText;
}

const MailHistoryTable = () => {
    const api = useApiListView("/mails/");
    const [paginationModel, _] = useState({ page: 0, pageSize: 10 })


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
            <div className="flex flex-col gap-3">
                <h1 className="text-xl">{mail.subject}</h1>
                <p>{getMailBodyText(mail.body)}</p>
            </div>
        )
    }

    const columns: ColumnDef<object>[] = [
        {
            id: "preview",
            cell: () => (
                <Button size="icon" variant="link"><FiEye /></Button>
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
                const { is_sent, failed }  = row.original as {is_sent: boolean, failed: boolean};
                const status = is_sent ? "Sent" : failed ? "Failed": "Scheduled"
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
            cell: ({ row }) => {
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>Send Now</DropdownMenuItem>
                            <DropdownMenuItem>Reschedule</DropdownMenuItem>
                            <DropdownMenuItem>View Failure Reason</DropdownMenuItem>
                            <DropdownMenuItem>Delete & Cancel</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
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