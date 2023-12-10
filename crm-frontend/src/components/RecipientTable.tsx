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

interface RecipientsTableProps {
    parameters: TemplateParameter[];
}

const RecipientsTable: React.FC<RecipientsTableProps> = ({ parameters }) => {

    return (
        <TableContainer>
            <Table sx={{ minWidth: 750 }} aria-labelledby="Emails" size="medium">
                <TableHead>
                    <TableRow>
                       
                        <TableCell padding="checkbox">
                            <Checkbox color="primary" />
                        </TableCell>
                        <TableCell>No. </TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>CC / BCC </TableCell>
                        {parameters.map((parameter) => (
                            <TableCell key={parameter.name}>{parameter.name}</TableCell>
                        ))}
                        <TableCell>Remove</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    <TableRow>
                        
                        <TableCell padding="checkbox">
                            <Checkbox
                                color="primary"
                            />
                        </TableCell>
                        <TableCell>1. </TableCell>
                        <TableCell>
                            <input className="input" placeholder="Email" />
                        </TableCell>
                        <TableCell>
                            <input className="input" placeholder="Name" />
                        </TableCell>
                        {parameters.map((parameter) => (
                            <TableCell key={parameter.name}>
                                <input className="input" placeholder={parameter.name} defaultValue={parameter.defaultValue} />
                            </TableCell>
                        ))}
                         <TableCell><Button color="warning">Remove</Button></TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default RecipientsTable;
