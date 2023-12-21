import { TemplateParameter } from "@/lib/types";

type ParameterInputProps = {
    value: any,
    param: TemplateParameter,
    onChange: (e: any) => void
}

const ParameterInput = ({ param, value, onChange }: ParameterInputProps) => {

    const currentValue = value !== undefined ? value: param.defaultValue;

    return (
        <div className="flex">
            <label className="label">{param.name}</label>
            <input
                name={param.name}
                className="input"
                value={currentValue}
                placeholder="Default Value"
                onChange={onChange}
                required
            />
        </div>
    )

}

export default ParameterInput;