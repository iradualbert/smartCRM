import { useState } from "react";
import DialogButton from "./ui/DialogButton";
import { Button, Typography, TableContainer, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";
import * as XLSX from "xlsx"

const ContactsImporter = ({ title = "Upload / Import from a file" }) => {
  const [excelFile, setExcelFile] = useState(null);
  const [excelData, setExcelData] = useState();

  const handleSubmit = e => {
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

  return (
    <DialogButton modalTitle="Import Contacts" btnTitle="Import From A File">
      <Typography variant="h4">Upload a Excel Sheet, CSV</Typography>
      <input type="file" onChange={handleFileChange} />
      <Button onClick={handleSubmit} variant="outlined">Ok</Button>
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
    </DialogButton>
  )
}

export default ContactsImporter