import "./mailstyle.css";
import { useApiListView, useDashboardData } from "@/lib/hooks";
import { useEffect, useRef, useState } from "react";
import { DataGrid, GridRowsProp, GridColDef, GridEventListener, GridRenderCellParams, GridTreeNodeWithRender } from '@mui/x-data-grid';
import MailForm from "@/components/forms/MailForm";
import { Button, Typography } from "@mui/material";
import DashboardCard from "../dashboard-components/DashboardCard";
import { Link } from "react-router-dom";
import { MdDeleteForever } from "react-icons/md";


const getMailBodyText = body => {
    const div = document.createElement("div");
    div.innerHTML = body;
    return div.innerText;
}

const MailDashoardPage = () => {

    const api = useApiListView("/mails/");
    const dashboard = useDashboardData();
    const [selectedMail, setSelectedMail] = useState(null);
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10})
    
    const dataGridRef = useRef();
    const mailFormRef = useRef();

    useEffect(() => {
        //if(!paginationModel.page || !paginationModel.pageSize) return;
        api.setParams({
            offset: (paginationModel.page * paginationModel.pageSize),
            limit: paginationModel.pageSize
        })
    }, [paginationModel])

    useEffect(() => {
        if (selectedMail) {
            //mailFormRef.current.scrollIntoView()
        }
    }, [selectedMail])



    const handleRowClick: GridEventListener<'rowClick'> = (params) => {
        setSelectedMail(params.row)
    };

    const onFormClose = () => {
        setSelectedMail(null);
        //dataGridRef.current.scrollIntoView();
    }

    const getStatus = (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => {
        const { is_sent, failed, sent_datetime, schedule_datetime } = params.row;

        if (is_sent) return {
            message: "Sent",
            time: new Date(sent_datetime).toLocaleString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
        }
        if (failed) return {
            message: "Failed",
            time: ""
        }

        return {
            message: "Scheduled",
            time: new Date(schedule_datetime).toLocaleString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
        }
    }

    const columns: GridColDef[] = [
        { field: 'id', headerName: '', width: 50 },
        { field: "recipient", headerName: "Recipient", width: 200 },
        { field: "content", headerName: "Content", width: 400 },
        { field: 'schedule_datetime', headerName: 'Schedule Time', width: 200 },
        {
            field: "status",
            headerName: "Status",
            width: 150,
            renderCell: (params) => {
                let status = getStatus(params);
                return (
                    <div className={`status ${status.message}`}>
                        <p>{status.message}</p>
                    </div>
                )
            }
        },
        {
            field: 'action',
            headerName: 'Action',
            width: 220,
            renderCell: (params) => {
                return (
                    <div className="flex gap-2 items-end justify-end w-full">
                        {
                            params.row.failed ?
                                <Button size="small" color="primary" variant="outlined">Try Again</Button> : params.row.is_sent ? "" : <Button>Reschedule</Button> 
                    }
                        <Button size="small" startIcon={<MdDeleteForever />} color="warning"/>
                    </div>
                )
            }
        },

    ];

    const rows: GridRowsProp = api.results.map((mail: object, index) => {
        // { id: 1, col1: 'Hello', col2: 'World' },
        // { id: 2, col1: 'DataGridPro', col2: 'is Awesome' },
        // { id: 3, col1: 'MUI', col2: 'is Amazing' },
        return {
            ...mail,
            id: index + 1,
            recipient: `${mail.to} CC:${mail.cc}`,
            content: `${mail.subject}\n${getMailBodyText(mail.body)}`,
            status: "sent",
            schedule_datetime: new Date(mail.schedule_datetime || mail.created_at).toLocaleString('tr-TR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
            action: "Try again, Reschule, Send Now, Delete",
        }
    })



    return (
        <div>
            <div className="flex gap-3 mb-7">
                <Link to="/emails/new?type=single">
                    <Button size="small" variant="outlined">Send & Schedule</Button>
                </Link>
                <Link to="/emails/new?type=multiple">
                    <Button size="small" variant="outlined">Send Multiple Emails</Button>
                </Link>
                <Link to="/emails/templates">
                    <Button size="small" variant="outlined">Templates</Button>
                </Link>
            </div>
            <Typography variant="h4" component="h1">Emails Dashboard</Typography>
            <div className="flex gap-4 mt-6 mb-5 md:mb-10">
                <DashboardCard
                    cardTitle="Sent"
                    value={dashboard.data.sent_emails}
                    borderBottomColor="success.main"
                />
                <DashboardCard
                    cardTitle="Scheduled"
                    value={dashboard.data.scheduled_emails}
                    borderBottomColor="primary.main"
                />
                <DashboardCard
                    cardTitle="Failed"
                    value={dashboard.data.failed_emails}
                    borderBottomColor="warning.main"
                />
            </div>
            
            <div className="flex gap-4 flex-wrap">
                <DataGrid
                    ref={dataGridRef}
                    rows={rows}
                    columns={columns}
                    onRowClick={handleRowClick}
                    rowCount={api.count}
                    loading={api.isLoading}
                    onPaginationModelChange = {setPaginationModel}
                    paginationModel={paginationModel}
                    pageSizeOptions={[5, 10, 25, 50]}
                    paginationMode="server"
                />
                {selectedMail && (
                    <div className="flex flex-col gap-2 p-3" ref={mailFormRef}>
                        <div className="flex">
                            Status: Sent Today at 7:32 AM
                            <Button variant="outlined" style={{ marginLeft: "auto" }} onClick={onFormClose}>Close</Button>
                        </div>
                        <div>
                            <MailForm isReadOnly data={selectedMail} showAttachments />
                        </div>

                    </div>

                )}
            </div>

        </div>
    )
}

export default MailDashoardPage;