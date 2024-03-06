import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
type BulkMailFormProps = {
    parameters: { name: string, defaultValue?: string }[],
    rows: object[],
    onAddRow: () => void,
    onRemoveRow: (removeAt: number) => void,
    onRowInputChange: (e: React.ChangeEvent<HTMLInputElement>, rowIndex: number) => void,
    onRowInputUseDefaultValueChange: (paramName: string, rowIndex: number) => void
}

const BulkMailRows = ({ parameters, rows, onAddRow, onRemoveRow, onRowInputChange, onRowInputUseDefaultValueChange }: BulkMailFormProps) => {
    return (
        <>
            <Table>
                <TableCaption>Mail Instances(10 maximum)</TableCaption>
                <TableHeader>
                    <TableRow>
                        {parameters.map(param => <TableHead key={param.name}>{param.name}</TableHead>)}
                        <TableHead>Delete</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.map((row, rowIndex) => (
                        <TableRow key={rowIndex}>
                            {parameters.map(parameter => {
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
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="use_default_value"
                                                    checked={ willUseDefaultValue}
                                                    onCheckedChange={() => onRowInputUseDefaultValueChange(parameter.name, rowIndex)}
                                                />
                                                <label
                                                    htmlFor="use_default_value"
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                    Use Default
                                                </label>
                                            </div>
                                        </div>

                                    </TableCell>
                                )
                            })}
                            <TableCell>
                                <Button onClick={() => onRemoveRow(rowIndex)} variant="destructive">X</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
                <TableFooter>

                </TableFooter>
                <div className="flex gap-6 py-4 items-center">
                    <Button onClick={onAddRow}>+ Add Row</Button>
                    <span>Total: {rows.length}</span>
                </div>
            </Table>
        </>
    )
}

export default BulkMailRows;