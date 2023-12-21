import {
    TableContainer,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Checkbox,
    Button
} from "@mui/material";
import { TemplateParameter } from "@/lib/types";
import { useEffect } from "react";

interface RecipientsTableProps {
    parameters: TemplateParameter[];
    onAddRow: () => void;
    onRemoveRow: (removeAt: number) => void;
    rows: object[];
    onRowInputChange: (e, rowIndex) => void;
    paramDefaultValues: object;
}

const RecipientsTable: React.FC<RecipientsTableProps> = ({ paramDefaultValues, onRowInputChange, rows, onAddRow, onRemoveRow, parameters }) => {
    useEffect(() => {
        console.log(rows)
    }, [rows])
    return (
        <TableContainer>
            <Table sx={{ minWidth: 750 }} aria-labelledby="Emails" size="medium">
                <TableHead>
                    <TableRow>

                        <TableCell padding="checkbox">
                            <Checkbox color="primary" />
                        </TableCell>
                        <TableCell>No. </TableCell>
                        {parameters.map((parameter) => (
                            <TableCell key={parameter.name}>{parameter.name}</TableCell>
                        ))}
                        <TableCell>Remove</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.map((row, idx) => (
                        <TableRow key={idx}>
                            <TableCell padding="checkbox">
                                <Checkbox
                                    color="primary"
                                />
                            </TableCell>
                            <TableCell>{idx + 1}</TableCell>
                            {parameters.map((parameter) => {
                                const currentValue = row[parameter.name];
                                return (
                                    
                                <TableCell key={parameter.name}>
                                    <input
                                        name={parameter.name}
                                        className="input"
                                        placeholder={parameter.name}
                                        onChange={(e) => onRowInputChange(e, idx)}
                                        value={currentValue}
                                    />
                                </TableCell>
                            )})}
                            <TableCell><Button onClick={() => onRemoveRow(idx)} color="warning">Remove</Button></TableCell>
                        </TableRow>
                    ))}

                </TableBody>
            </Table>
            <Button onClick={onAddRow}>Add</Button>
        </TableContainer>


    );
};

export default RecipientsTable;
