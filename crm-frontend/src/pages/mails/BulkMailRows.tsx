import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

type BulkMailFormProps = {
    parameters: { name: string, defaultValue?: string }[],
    rows: object[],
    onRemoveRow: (removeAt: number) => void,
    onRowInputChange: (e: React.ChangeEvent<HTMLInputElement>, rowIndex: number) => void,
    onRowInputUseDefaultValueChange: (paramName: string, rowIndex: number) => void,
    rowResults: any,
    isDisabled: true | false,
}

const BulkMailRows = ({ parameters, rows, isDisabled, onRemoveRow, onRowInputChange, onRowInputUseDefaultValueChange, rowResults }: BulkMailFormProps) => {
    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow>
                        {/* <TableHead>Schedule</TableHead> */}
                        {parameters.map(param => <TableHead key={param.name}>{param.name}</TableHead>)}
                        <TableHead>Status</TableHead>
                        <TableHead>Delete</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.map((row: any, rowIndex) => {
                        const is_saved = rowResults[row._id] === "sent";
                        const is_failed = rowResults[row._id] && rowResults[row._id] !== "sent";

                        const _isDisabled = is_saved || isDisabled

                        return (
                            <TableRow key={rowIndex}>
                                {/* <TableCell>
                                <Input type="datetime-local" />
                            </TableCell>  */}
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
                                                    disabled={willUseDefaultValue || _isDisabled}
                                                />
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        disabled={_isDisabled}
                                                        id="use_default_value"
                                                        checked={willUseDefaultValue}
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
                                <TableCell className="text-sm text-neutral-400">
                                    {is_saved ? "SENT" : is_failed && "FAILED" }
                                </TableCell>
                                <TableCell>
                                    <Button
                                        onClick={() => onRemoveRow(rowIndex)}
                                        variant="destructive"
                                        size="icon"
                                    >
                                        X
                                    </Button>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </>
    )
}

export default BulkMailRows;