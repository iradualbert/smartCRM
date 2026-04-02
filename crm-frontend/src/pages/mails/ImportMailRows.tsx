import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import FieldsMapper from "@/components/FieldsMapper";
import { Input } from "@/components/ui";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";

type ImportBulkMailRowsProps = {
  children: React.ReactNode;
  parameters: { [key: string]: "" };
  onImportRows: (t: any) => void;
};

const ImportBulkMailRows = ({
  children,
  parameters,
  onImportRows,
}: ImportBulkMailRowsProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [fieldMapping, setFieldMapping] = useState(parameters);
  const [rowTitles, setRowTitles] = useState<string[]>([]);
  const [excelFile, setExcelFile] = useState<ArrayBuffer | null>(null);
  const [excelData, setExcelData] = useState<Record<string, any>[] | undefined>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const reset = () => {
    setCurrentStep(1);
    setFieldMapping(parameters);
    setRowTitles([]);
    setExcelFile(null);
    setExcelData(undefined);
  };

  const handleSubmit = () => {
    if (excelFile == null) return;

    const workbook = XLSX.read(excelFile, { type: "buffer" });
    const workSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[workSheetName];
    const data = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet);

    setExcelData(data);
    setRowTitles(data.length ? Object.keys(data[0]) : []);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const reader = new FileReader();
    reader.readAsArrayBuffer(selectedFile);
    reader.onload = (event) => {
      if (event.target?.result instanceof ArrayBuffer) {
        setExcelFile(event.target.result);
      }
    };
  };

  const goBack = () => setCurrentStep((current) => current - 1);
  const next = () => setCurrentStep((current) => current + 1);

  const handleSaveRows = () => {
    onImportRows({
      fieldMapping,
      rows: excelData,
    });

    reset();
    setIsDialogOpen(false);
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="max-h-screen overflow-y-auto lg:max-w-screen-lg">
        <DialogHeader>
          <DialogTitle>Import Rows</DialogTitle>

          <DialogDescription className="mt-10 py-6" asChild>
            <div>
              {currentStep === 1 && (
                <>
                  <div className="flex min-h-fit flex-col gap-6 p-2">
                    <p className="text-xl font-medium">Upload Excel or CSV File</p>

                    <Input
                      onChange={handleFileChange}
                      type="file"
                      accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                    />

                    <div className="flex gap-4">
                      <Button
                        variant="outline"
                        disabled={!excelFile}
                        onClick={handleSubmit}
                        className="w-min"
                      >
                        Preview
                      </Button>

                      <Button
                        disabled={!excelFile}
                        onClick={() => {
                          handleSubmit();
                          next();
                        }}
                      >
                        {"Next ->"}
                      </Button>
                    </div>
                  </div>

                  <div>
                    {excelData && (
                      <div className="mt-6 overflow-x-auto rounded-md border">
                        <table className="w-full text-sm">
                          <thead className="bg-muted/50">
                            <tr className="border-b">
                              {rowTitles.map((key) => (
                                <th
                                  key={key}
                                  className="px-4 py-2 text-left font-medium"
                                >
                                  {key}
                                </th>
                              ))}
                            </tr>
                          </thead>

                          <tbody>
                            {excelData.map((row, index) => (
                              <tr key={index} className="border-b last:border-0">
                                {Object.values(row).map((value, valueIndex) => (
                                  <td
                                    key={`${index}-${valueIndex}`}
                                    className="px-4 py-2 align-top"
                                  >
                                    {String(value ?? "")}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
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
                <div className="mt-8 flex justify-end gap-4">
                  <Button onClick={goBack} variant="outline">
                    Back
                  </Button>

                  {currentStep !== 2 ? (
                    <Button onClick={next}>Next</Button>
                  ) : (
                    <Button onClick={handleSaveRows}>Finish</Button>
                  )}
                </div>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default ImportBulkMailRows;