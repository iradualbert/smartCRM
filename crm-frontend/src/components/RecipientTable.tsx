import {
    TableContainer,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Checkbox,
    Button,
    FormControlLabel
} from "@mui/material";
import { TemplateParameter } from "@/lib/types";
import { useEffect } from "react";

interface RecipientsTableProps {
    parameters: TemplateParameter[];
    onAddRow: () => void;
    onRemoveRow: (removeAt: number) => void;
    rows: object[];
    onRowInputChange: (e, rowIndex: number) => void;
    onRowInputUseDefaultValueChange: (paramName: string, rowIndex: number) => void;
}

const RecipientsTable: React.FC<RecipientsTableProps> = ({
    onRowInputUseDefaultValueChange,
    onRowInputChange,
    rows,
    onAddRow,
    onRemoveRow,
    parameters
}) => {

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
                    {rows.map((row, rowIndex) => (
                        <TableRow key={rowIndex}>
                            <TableCell padding="checkbox">
                                <Checkbox
                                    color="primary"
                                />
                            </TableCell>
                            <TableCell>{rowIndex + 1}</TableCell>
                            {parameters.map((parameter) => {
                                const { currentValue, willUseDefaultValue } = row[parameter.name] || {};
                                return (

                                    <TableCell key={parameter.name}>
                                        <div className="flex flex-col gap-0">
                                            <input
                                                name={parameter.name}
                                                className="input m-1"
                                                placeholder={parameter.name}
                                                onChange={(e) => onRowInputChange(e, rowIndex)}
                                                value={currentValue}
                                                disabled={willUseDefaultValue}
                                            />
                                            <FormControlLabel
                                                control={<Checkbox size="small" onChange={() => onRowInputUseDefaultValueChange(parameter.name, rowIndex)} checked={willUseDefaultValue} />}
                                                label="Use Default Value"
                                            />
                                        </div>
                                    </TableCell>
                                )
                            })}
                            <TableCell><Button onClick={() => onRemoveRow(rowIndex)} color="warning">Remove</Button></TableCell>
                        </TableRow>
                    ))}

                </TableBody>
            </Table>
            <Button onClick={onAddRow}>Add</Button>
        </TableContainer>


    );
};

export default RecipientsTable;
