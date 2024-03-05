import React, { useState } from "react";
import * as XLSX from "xlsx"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "../../components/ui/label";
import { Loader2 } from "lucide-react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { ADD_CONTACTS_MANY } from "@/redux/types";


const ImportContacts = ({ title = "Upload / Import from a file", children }: { children: React.ReactNode }) => {
    const [excelFile, setExcelFile] = useState(null);
    const [excelData, setExcelData] = useState();
    const [currentStep, setCurrentStep] = useState(1);
    const [isUploading, setIsUploading] = useState(false);
    const [isCanceled, setIsCanceled] = useState(false);
    const abortController = new AbortController();
    const dispatch = useDispatch();

    const [uploadResults, setUploadResults] = useState({
        skipped: 0,
        duplicate: 0,
        uploaded: 0
    })

    const [fieldMapping, setFieldMapping] = useState({
        first_name: "",
        last_name: "",
        email: "",
        phone_number: "",
        company: "",
    })

    const [options, setOptions] = useState({
        duplicate: "skip"
    })

    const handleSubmit = () => {
        if (excelFile == null) return;
        const workbook = XLSX.read(excelFile, { type: "buffer" });
        const workSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[workSheetName]
        const data = XLSX.utils.sheet_to_json(worksheet);
        setExcelData(data);
    }

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            const reader = new FileReader();
            reader.readAsArrayBuffer(selectedFile);
            reader.onload = e => {
                setExcelFile(e.target?.result)
            }
        }
    }

    const goBack = () => setCurrentStep(_current => _current - 1)
    const next = () => setCurrentStep(_current => _current + 1)

    const handleSaveContacts = async () => {
        if(!excelData) return
        next();
        

        const contacts = excelData.map( c => ({
            first_name: c[fieldMapping.first_name] || null,
            last_name: c[fieldMapping.last_name] || null,
            email: c[fieldMapping.email] || null,
            phone_number: c[fieldMapping.phone_number] || null,
            company: c[fieldMapping.company] || null
        }))
        for (let i = 0; i < contacts.length; i+=10) {
            if(isCanceled) return;
            const toSend = contacts.slice(i, i+10)
            const res = await axios.post('/contacts/?type=multiple', {contacts: toSend, options}, {
                signal: abortController.signal
            });
            const { uploaded, duplicate_total, skipped_total } = res.data
            if(uploaded.length){
                dispatch({
                    type: ADD_CONTACTS_MANY,
                    payload: uploaded
                })
            }
            setUploadResults( prev => ({
                uploaded: prev.uploaded + uploaded.length,
                duplicate: prev.duplicate + duplicate_total,
                skipped: prev.skipped + skipped_total
            }))
        }
    }

    const handleCancelSaving = () => {
        abortController.abort();
        setIsCanceled(true)
    }

    const handleModalToggle = () => {
        setExcelData()
        setExcelFile()
        setCurrentStep(1)
        setIsCanceled(false)

    }

    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className={"lg:max-w-screen-lg overflow-y-scroll max-h-screen"}>
                <DialogHeader>
                    <DialogTitle>Import Contacts</DialogTitle>
                    <DialogDescription className="py-6" asChild>
                        <div>
                            {currentStep === 1 && (
                                <>
                                    <div className="flex flex-col gap-6 p-2 min-h-fit">
                                        <p className="text-xl">Upload an Excel, or CSV File containing your contacts</p>
                                        <Input
                                            onChange={handleFileChange}
                                            type="file"
                                            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                                        />
                                        <div className="flex gap-4">
                                            <Button variant="outline" disabled={!excelFile} onClick={handleSubmit} className="w-min">Preview</Button>
                                            <Button disabled={!excelFile} onClick={() => {
                                                handleSubmit()
                                                next();
                                            }}>{"Next ->"}</Button>
                                        </div>

                                    </div>
                                    <div>
                                        {excelData && (
                                            <TableContainer>
                                                <Table>
                                                    <TableHead>
                                                        <TableRow>
                                                            {Object.keys(excelData[0]).map((key) => (
                                                                <TableCell key={key}>{key}</TableCell>
                                                            ))}
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {excelData.map((row, index) => (
                                                            <TableRow key={index}>
                                                                {Object.values(row).map((value) => (
                                                                    <TableCell key={value}>{value}</TableCell>
                                                                ))}
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        )}
                                    </div>
                                </>

                            )}
                            {currentStep === 2 && (
                                <div className="flex flex-col gap-4">
                                    <h1 className="text-2xl">Field Mapping</h1>
                                    <div className="flex gap-12 items-center">
                                        <span className="w-44">{"First Name   --->"}</span>
                                        <Select
                                            value={fieldMapping.first_name}
                                            onValueChange={value => setFieldMapping(prev => ({
                                                ...prev,
                                                first_name: value
                                            }))}
                                        >
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue placeholder="Select Field" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    {Object.keys(excelData[0]).map((key) => (<SelectItem value={key}>{key}</SelectItem>))
                                                    }
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex gap-12 items-center">
                                        <span className="w-44">{"Last Name  --->"}</span>
                                        <Select
                                            value={fieldMapping.last_name}
                                            onValueChange={value => setFieldMapping(prev => ({
                                                ...prev,
                                                last_name: value
                                            }))}
                                        >
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue placeholder="Select Field" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    {Object.keys(excelData[0]).map((key) => (<SelectItem value={key}>{key}</SelectItem>))
                                                    }
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex gap-12 items-center">
                                        <span className="w-44">{"Email   --->"}</span>
                                        <Select
                                            value={fieldMapping.email}
                                            onValueChange={value => setFieldMapping(prev => ({
                                                ...prev,
                                                email: value
                                            }))}
                                        >
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue placeholder="Select Field" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    {Object.keys(excelData[0]).map((key) => (<SelectItem value={key}>{key}</SelectItem>))
                                                    }
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex gap-12 items-center">
                                        <span className="w-44">{"Company   --->"}</span>
                                        <Select
                                            value={fieldMapping.phone_number}
                                            onValueChange={value => setFieldMapping(prev => ({
                                                ...prev,
                                                company: value
                                            }))}
                                        >
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue placeholder="Select Field" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    {Object.keys(excelData[0]).map((key) => (<SelectItem value={key}>{key}</SelectItem>))
                                                    }
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                </div>
                            )
                            }
                            {currentStep === 3 && (
                                <div className="flex flex-col gap-4">
                                    <h1 className="text-2xl">Options</h1>
                                    <div className="space-y-3">
                                        <Label>If contact already exists...</Label>
                                        <RadioGroup
                                            value={options.duplicate}
                                            onValueChange={value => setOptions({ duplicate: value })}
                                            className="flex flex-col space-y-1"
                                        >
                                            <div className="flex items-center space-x-3 space-y-0">
                                                <RadioGroupItem value="add" />
                                                <Label className="font-normal">
                                                    Just add to the group
                                                </Label>
                                            </div>
                                            <div className="flex items-center space-x-3 space-y-0">
                                                <RadioGroupItem value="update" />
                                                <Label className="font-normal">
                                                    Update and add to the group
                                                </Label>
                                            </div>
                                            <div className="flex items-center space-x-3 space-y-0">
                                                <RadioGroupItem value="skip" />
                                                <Label className="font-normal">
                                                    Skip
                                                </Label>
                                            </div>
                                        </RadioGroup>
                                    </div>
                                </div>
                            )}
                            {currentStep === 4 && (
                                <div className="flex flex-col gap-4">
                                    <div className="flex justify-center items-center">
                                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                        <h3 className="text-lg">Saving Contacts...</h3>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Uploaded Contacts:</span>
                                        <span>{uploadResults.uploaded}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Skipped Rows:</span>
                                        <span>{uploadResults.skipped}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Duplicate Rows:</span>
                                        <span>{uploadResults.duplicate}</span>
                                    </div>
                                    <div className="flex justify-end">
                                        <Button onClick={goBack} variant="outline">Back</Button>
                                        <Button variant="destructive" onClick={handleCancelSaving}>Cancel Upload</Button>
                                    </div>

                                </div>
                            )}
                            {currentStep !== 1 && currentStep !== 4 && (
                                <div className="flex gap-4 mt-8 justify-end">
                                    <Button onClick={goBack} variant="outline">Back</Button>
                                    {currentStep !== 3
                                        ? <Button onClick={next}>Next</Button>
                                        : <Button onClick={handleSaveContacts}>Import Contacts</Button>
                                    }


                                </div>
                            )}
                        </div>
                    </DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )
}

export default ImportContacts;


