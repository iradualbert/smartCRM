import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

type FieldsMapperProps = {
    fieldMapping: {[key: string]: string},
    options: string[],
    onFieldMappingChange: (p: any) => void
}

const FieldsMapper = ({ fieldMapping, onFieldMappingChange, options }: FieldsMapperProps) => {


    return (
        <div className="flex flex-col gap-4">
            <h1 className="text-2xl">Field Mapping</h1>
            {Object.keys(fieldMapping).map(fieldName => (
                <div className="flex gap-12 items-center" key={fieldName}>
                    <span className="w-44">{`${fieldName}  ---> `}</span>
                    <Select
                        value={fieldMapping[fieldName]}
                        onValueChange={value => onFieldMappingChange((prev: any) => ({
                            ...prev,
                            [fieldName]: value
                        }))}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select Field" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                {
                                    options.map(option => (<SelectItem key={option} value={option}>{option}</SelectItem>))
                                }
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
            ))}

        </div>
    )

}

export default FieldsMapper