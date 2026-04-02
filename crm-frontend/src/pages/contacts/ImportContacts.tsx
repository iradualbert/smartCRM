import React, { useMemo, useRef, useState } from "react";
import * as XLSX from "xlsx";
import axios from "axios";
import { useDispatch } from "react-redux";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ADD_CONTACTS_MANY } from "@/redux/types";

type ImportContactsProps = {
  title?: string;
  children: React.ReactNode;
};

type ExcelRow = Record<string, unknown>;

type DuplicateOption = "add" | "update" | "skip";

type UploadResults = {
  skipped: number;
  duplicate: number;
  uploaded: number;
};

type FieldMapping = {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  company: string;
};

type ImportOptions = {
  duplicate: DuplicateOption;
};

type PreviewTableProps<TData extends Record<string, unknown>> = {
  data: TData[];
};

function PreviewTable<TData extends Record<string, unknown>>({
  data,
}: PreviewTableProps<TData>) {
  const columns = useMemo<ColumnDef<TData>[]>(() => {
    const firstRow = data[0];
    if (!firstRow) return [];

    return Object.keys(firstRow).map((key) => ({
      accessorKey: key,
      header: key,
      cell: ({ getValue }) => String(getValue() ?? ""),
    }));
  }, [data]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (!data.length) return null;

  return (
    <div className="mt-6 overflow-x-auto rounded-md border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="border-b">
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-4 py-2 text-left font-medium whitespace-nowrap"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>

        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border-b last:border-0">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-2 align-top">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const ImportContacts = ({
  title = "Upload / Import from a file",
  children,
}: ImportContactsProps) => {
  const [excelFile, setExcelFile] = useState<ArrayBuffer | null>(null);
  const [excelData, setExcelData] = useState<ExcelRow[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [isCanceled, setIsCanceled] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const dispatch = useDispatch();

  const [uploadResults, setUploadResults] = useState<UploadResults>({
    skipped: 0,
    duplicate: 0,
    uploaded: 0,
  });

  const [fieldMapping, setFieldMapping] = useState<FieldMapping>({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    company: "",
  });

  const [options, setOptions] = useState<ImportOptions>({
    duplicate: "skip",
  });

  const excelColumns = useMemo(() => {
    if (!excelData.length) return [];
    return Object.keys(excelData[0]);
  }, [excelData]);

  const resetState = () => {
    setExcelFile(null);
    setExcelData([]);
    setCurrentStep(1);
    setIsCanceled(false);
    setUploadResults({
      skipped: 0,
      duplicate: 0,
      uploaded: 0,
    });
    setFieldMapping({
      first_name: "",
      last_name: "",
      email: "",
      phone_number: "",
      company: "",
    });
    setOptions({
      duplicate: "skip",
    });
    abortControllerRef.current = null;
  };

  const handleSubmit = () => {
    if (!excelFile) return;

    const workbook = XLSX.read(excelFile, { type: "buffer" });
    const workSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[workSheetName];
    const data = XLSX.utils.sheet_to_json<ExcelRow>(worksheet);

    setExcelData(data);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const reader = new FileReader();
    reader.readAsArrayBuffer(selectedFile);

    reader.onload = (event) => {
      const result = event.target?.result;
      if (result instanceof ArrayBuffer) {
        setExcelFile(result);
      }
    };
  };

  const goBack = () => setCurrentStep((current) => current - 1);
  const next = () => setCurrentStep((current) => current + 1);

  const handleSaveContacts = async () => {
    if (!excelData.length) return;

    setCurrentStep(4);
    setIsCanceled(false);
    setUploadResults({
      skipped: 0,
      duplicate: 0,
      uploaded: 0,
    });

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const contacts = excelData.map((row) => ({
      first_name: (row[fieldMapping.first_name] as string) || null,
      last_name: (row[fieldMapping.last_name] as string) || null,
      email: (row[fieldMapping.email] as string) || null,
      phone_number: (row[fieldMapping.phone_number] as string) || null,
      company: (row[fieldMapping.company] as string) || null,
    }));

    try {
      for (let i = 0; i < contacts.length; i += 10) {
        if (isCanceled) return;

        const toSend = contacts.slice(i, i + 10);

        const res = await axios.post(
          "/contacts/?type=multiple",
          { contacts: toSend, options },
          { signal: controller.signal }
        );

        const { uploaded, duplicate_total, skipped_total } = res.data;

        if (uploaded.length) {
          dispatch({
            type: ADD_CONTACTS_MANY,
            payload: uploaded,
          });
        }

        setUploadResults((prev) => ({
          uploaded: prev.uploaded + uploaded.length,
          duplicate: prev.duplicate + duplicate_total,
          skipped: prev.skipped + skipped_total,
        }));
      }
    } catch (error) {
      if (axios.isCancel?.(error)) return;
      console.error(error);
    }
  };

  const handleCancelSaving = () => {
    abortControllerRef.current?.abort();
    setIsCanceled(true);
  };

  const updateFieldMapping = (field: keyof FieldMapping, value: string) => {
    setFieldMapping((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      handleCancelSaving();
      resetState();
    }
  };

  return (
    <Dialog onOpenChange={handleDialogOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="max-h-screen overflow-y-auto lg:max-w-screen-lg">
        <DialogHeader>
          <DialogTitle>Import Contacts</DialogTitle>

          <DialogDescription className="py-10" asChild>
            <div>
              {currentStep === 1 && (
                <>
                  <div className="flex min-h-fit flex-col gap-6 p-2">
                    <p className="text-xl">
                      {title || "Upload an Excel or CSV file containing your contacts"}
                    </p>

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
                        type="button"
                      >
                        Preview
                      </Button>

                      <Button
                        disabled={!excelFile}
                        type="button"
                        onClick={() => {
                          handleSubmit();
                          next();
                        }}
                      >
                        Next -&gt;
                      </Button>
                    </div>
                  </div>

                  <div>{excelData.length > 0 && <PreviewTable data={excelData} />}</div>
                </>
              )}

              {currentStep === 2 && (
                <div className="flex flex-col gap-4">
                  <h1 className="text-2xl font-semibold">Field Mapping</h1>

                  <div className="flex items-center gap-12">
                    <span className="w-44">{"First Name --->"}</span>
                    <Select
                      value={fieldMapping.first_name}
                      onValueChange={(value) =>
                        updateFieldMapping("first_name", value)
                      }
                    >
                      <SelectTrigger className="w-[220px]">
                        <SelectValue placeholder="Select Field" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {excelColumns.map((key) => (
                            <SelectItem key={key} value={key}>
                              {key}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-12">
                    <span className="w-44">{"Last Name --->"}</span>
                    <Select
                      value={fieldMapping.last_name}
                      onValueChange={(value) =>
                        updateFieldMapping("last_name", value)
                      }
                    >
                      <SelectTrigger className="w-[220px]">
                        <SelectValue placeholder="Select Field" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {excelColumns.map((key) => (
                            <SelectItem key={key} value={key}>
                              {key}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-12">
                    <span className="w-44">{"Email --->"}</span>
                    <Select
                      value={fieldMapping.email}
                      onValueChange={(value) => updateFieldMapping("email", value)}
                    >
                      <SelectTrigger className="w-[220px]">
                        <SelectValue placeholder="Select Field" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {excelColumns.map((key) => (
                            <SelectItem key={key} value={key}>
                              {key}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-12">
                    <span className="w-44">{"Phone Number --->"}</span>
                    <Select
                      value={fieldMapping.phone_number}
                      onValueChange={(value) =>
                        updateFieldMapping("phone_number", value)
                      }
                    >
                      <SelectTrigger className="w-[220px]">
                        <SelectValue placeholder="Select Field" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {excelColumns.map((key) => (
                            <SelectItem key={key} value={key}>
                              {key}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-12">
                    <span className="w-44">{"Company --->"}</span>
                    <Select
                      value={fieldMapping.company}
                      onValueChange={(value) => updateFieldMapping("company", value)}
                    >
                      <SelectTrigger className="w-[220px]">
                        <SelectValue placeholder="Select Field" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {excelColumns.map((key) => (
                            <SelectItem key={key} value={key}>
                              {key}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="flex flex-col gap-4">
                  <h1 className="text-2xl font-semibold">Options</h1>

                  <div className="space-y-3">
                    <Label>If contact already exists...</Label>

                    <RadioGroup
                      value={options.duplicate}
                      onValueChange={(value: DuplicateOption) =>
                        setOptions({ duplicate: value })
                      }
                      className="flex flex-col space-y-1"
                    >
                      <div className="flex items-center space-x-3 space-y-0">
                        <RadioGroupItem value="add" id="duplicate-add" />
                        <Label htmlFor="duplicate-add" className="font-normal">
                          Just add to the group
                        </Label>
                      </div>

                      <div className="flex items-center space-x-3 space-y-0">
                        <RadioGroupItem value="update" id="duplicate-update" />
                        <Label htmlFor="duplicate-update" className="font-normal">
                          Update and add to the group
                        </Label>
                      </div>

                      <div className="flex items-center space-x-3 space-y-0">
                        <RadioGroupItem value="skip" id="duplicate-skip" />
                        <Label htmlFor="duplicate-skip" className="font-normal">
                          Skip
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <h3 className="text-lg">
                      {isCanceled ? "Upload canceled" : "Saving Contacts..."}
                    </h3>
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

                  <div className="flex justify-end gap-2">
                    <Button onClick={goBack} variant="outline" type="button">
                      Back
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleCancelSaving}
                      type="button"
                    >
                      Cancel Upload
                    </Button>
                  </div>
                </div>
              )}

              {currentStep !== 1 && currentStep !== 4 && (
                <div className="mt-8 flex justify-end gap-4">
                  <Button onClick={goBack} variant="outline" type="button">
                    Back
                  </Button>

                  {currentStep !== 3 ? (
                    <Button onClick={next} type="button">
                      Next
                    </Button>
                  ) : (
                    <Button onClick={handleSaveContacts} type="button">
                      Import Contacts
                    </Button>
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

export default ImportContacts;