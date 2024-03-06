import { Button } from "@/components/ui/button";
import { useEffect, useRef } from "react";
import { ImAttachment } from "react-icons/im";

type f = (prev: Set<File>) => Set<File>

type MailAttachmentsProps = {
    attachments: Set<File>,
    isDisabled? : boolean,
    onAttachmentsChange: (prev: f) => void
}


const MailAttachments = ({  attachments, isDisabled=false, onAttachmentsChange: setAttachments}: MailAttachmentsProps) => {
    const attachInputRef = useRef();

    const handleAttachClick = () => {
        attachInputRef.current?.click();
    }


    const handleAddAttach = (e) => {
        setAttachments((prev) => {
            const newAttchments = new Set([...prev, ...e.target.files])
            return newAttchments
        });
    };

    const handleRemoveAttach = (index: number) => {
        setAttachments((prev) => {
            const newFiles = new Set([...prev]);

            // Convert set to an array, remove the file at the specified index, and convert back to a set
            const filesArray = Array.from(newFiles);
            filesArray.splice(index, 1);
            const updatedFilesSet = new Set(filesArray);

            return updatedFilesSet;
        });
    };

    return (
        <div className="flex flex-col items-start py-4 gap-2">
            <Button disabled={isDisabled} type="button" variant="ghost" onClick={handleAttachClick} className="flex gap-2 items-center">
                <ImAttachment />
                Attachments
            </Button>
            <div className="py-4 w-full px-2 rounded-md border">
                <input hidden type="file" onChange={handleAddAttach} multiple ref={attachInputRef} />
                {attachments &&
                    <div className="flex gap-3 flex-wrap">
                        {
                            Array.from(attachments).map(
                                (file, idx) => (<div className="p-2 flex gap-2 items-center rounded-lg bg-slate-200" key={idx}>
                                    <span>{file.name}</span>
                                    <Button type="button" variant="secondary" onClick={() => handleRemoveAttach(idx)} >X</Button>
                                </div>),
                            )}
                    </div>
                }
            </div>
            <Button type="button" disabled={isDisabled} onClick={handleAttachClick} variant="outline" size="sm">+ Add</Button>
        </div>
    )
}


export default MailAttachments;