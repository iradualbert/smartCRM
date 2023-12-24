import { FormControl, Input, InputAdornment, InputLabel, Button, Chip } from "@mui/material"
import { useRef } from "react"
import { ImAttachment } from "react-icons/im"
import ReactQuill from "react-quill"
import { sanitizer } from "@/lib/utils";

type MailType = {
    id?: number | string,
    to: string,
    body: string,
    cc: string,
    subject: string,
    attachments: Set<File>,
}

type MailFormProps = {
    isReadOnly?: true | false,
    showAttachments?: true | false,
    onDataChange?: (callback: (currentState: MailType) => MailType) => void,
    status?: "sent" | "failed" | "scheduled",
    id?: number | string,
    errors?: object,
    data: MailType,
}


const MailForm = ({
    isReadOnly = false,
    showAttachments = true,
    data,
    onDataChange
}: MailFormProps) => {

    const { attachments } = data;

    const attachInputRef = useRef()

    const onChange = (callback) => {
        const currentState = {};
        const updatedState = callback(currentState);
        // do something with update status
        // setState(updatedState)
    }

    const handleChange = (e) => {
        if (!onDataChange) return;
        onDataChange((current: MailType) => ({
            ...current,
            [e.target.name]: e.target.value
        }))
    }

    const handleBodyChange = (value: string) => {
        if (!onDataChange) return;
        onDataChange((current: MailType) => ({
            ...current,
            body: value,
        }))
    }

    const handleAttachClick = () => {
        attachInputRef.current.click();
    }


    const handleAddAttach = (e) => {
        if (!onDataChange) return;
        onDataChange((prev: MailType) => ({
            ...prev,
            attachments: new Set([...prev.attachments, ...e.target.files])
        }))
    };

    const handleRemoveAttach = (index: number) => {
        if (!onDataChange) return;
        onDataChange((prev) => {
            const newFiles = new Set([...prev.attachments]);

            // Convert set to an array, remove the file at the specified index, and convert back to a set
            const filesArray = Array.from(newFiles);
            filesArray.splice(index, 1);
            const updatedFilesSet = new Set(filesArray);
            return {
                ...prev,
                attachments: updatedFilesSet
            }
        });
    };

    return (
        <>
            <FormControl fullWidth>
                <Input
                    disabled={isReadOnly}
                    size="small"
                    value={data.to}
                    name="to"
                    onChange={handleChange}
                    startAdornment={
                        <InputAdornment position="start">
                            <InputLabel>To: </InputLabel>
                        </InputAdornment>
                    }
                />
            </FormControl>
            <FormControl fullWidth>
                <Input
                    disabled={isReadOnly}
                    name="cc"
                    value={data.cc}
                    onChange={handleChange}
                    size="small"
                    startAdornment={
                        <InputAdornment position="start">
                            <InputLabel>CC:</InputLabel>
                        </InputAdornment>
                    }
                />
            </FormControl>
            <FormControl fullWidth>
                <Input
                    disabled={isReadOnly}
                    name="subject"
                    value={data.subject}
                    onChange={handleChange}
                    size="small"
                    placeholder="Subject"

                />
            </FormControl>
            {isReadOnly ? (
                <div className="py-4 w-full rounded-sm mt-2" dangerouslySetInnerHTML={sanitizer(data.body)} />
            ) : (
                <ReactQuill
                    readOnly={isReadOnly}
                    value={data.body}
                    onChange={handleBodyChange}
                    placeholder="Start typing......"
                    className="mb-12 min-h-20"
                />
            )}

            {(showAttachments && !(isReadOnly || !attachments)) &&(
                <div className="flex flex-col items-start py-2 gap-2">
                    <Button disabled={isReadOnly} startIcon={<ImAttachment />} onClick={handleAttachClick}>Attachments</Button>
                    <div className="py-4 w-full px-2 rounded-md border">
                        <input hidden type="file" onChange={handleAddAttach} multiple ref={attachInputRef} />
                        {attachments &&
                            <div className="flex gap-3 flex-wrap">
                                {Array.from(attachments).map(
                                    (file, idx) => <Chip key={idx} label={file.name} onDelete={() => handleRemoveAttach(idx)} />)}
                            </div>

                        }
                    </div>
                    {!isReadOnly && (
                        <Button onClick={handleAttachClick} style={{ marginLeft: "auto" }} variant="outlined" size="small">+ Add</Button>
                    )}
                </div>
            )}

        </>
    )

}

export default MailForm