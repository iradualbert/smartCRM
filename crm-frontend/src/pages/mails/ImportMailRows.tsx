import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import FieldsMapper from "@/components/FieldsMapper"
import { Input } from "@/components/ui"
import * as XLSX from "xlsx"
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material"

type ImportBulkMailRowsProps = {
    children: React.ReactNode,
    parameters: { [key: string]: "" },
    onImportRows: (t: any) => void
}

const ImportBulkMailRows = ({ children, parameters, onImportRows}: ImportBulkMailRowsProps) => {
    const [currentStep, setCurrentStep] = useState(1)
    const [fieldMapping, setFieldMapping] = useState(parameters);
    const [rowTitles, setRowTitles] = useState<string[]>([]);
    const [excelFile, setExcelFile] = useState(null);
    const [excelData, setExcelData] = useState<object>();

    const handleSubmit = () => {
        if (excelFile == null) return;
        const workbook = XLSX.read(excelFile, { type: "buffer" });
        const workSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[workSheetName]
        const data = XLSX.utils.sheet_to_json(worksheet);
        setExcelData(data as object);
        setRowTitles(Object.keys(data[0] as string[]))
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

    const handleSaveRows = () => {
        // fieldMapping 
        // excelData
        onImportRows({
            fieldMapping,
            rows: excelData
        })
    }

    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className={"lg:max-w-screen-lg overflow-y-scroll max-h-screen"}>
                <DialogHeader>
                    <DialogTitle>Import Rows</DialogTitle>
                    <DialogDescription className="py-6 mt-10" asChild>
                        <div>
                            {currentStep === 1 && (
                                <>
                                    <div className="flex flex-col gap-6 p-2 min-h-fit">
                                        <p className="text-xl">Upload Excel or CSV File</p>
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
                                            <Table>
                                                <TableHead>
                                                    <TableRow>
                                                        {rowTitles.map((key) => (
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
                                        )}
                                    </div>
                                </>

                            )}
                            {currentStep === 2 && (
                                <FieldsMapper
                                    fieldMapping={fieldMapping}
                                    onFieldMappingChange={setFieldMapping}
                                    options={rowTitles}
                                />
                            )}
                            {currentStep !== 1 && (
                                <div className="flex gap-4 mt-8 justify-end">
                                    <Button onClick={goBack} variant="outline">Back</Button>
                                    {currentStep !== 2
                                        ? <Button onClick={next}>Next</Button>
                                        : <Button onClick={handleSaveRows}>Finish</Button>
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

export default ImportBulkMailRows