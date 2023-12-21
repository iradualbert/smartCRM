import { useEffect, useState, Fragment } from "react";
import { Button, Dialog, DialogActions, DialogContent, Divider, List, ListItem, ListItemButton, ListItemText, Typography } from "@mui/material";
import ModalTitle from "./ui/ModalTitle";
import { getTemplates } from "@/lib/utils";
import dompurify from "dompurify"
import { TemplateType } from "./forms/MailTemplateForm";

const sanitizer = (raw) => {
    return {
        __html: dompurify.sanitize(raw)
    }

}


const ImportTemplate = ({ onSelect }) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [templates, setTemplates] = useState([]);


    useEffect(() => {
        if (!isDialogOpen) return;
        getTemplates().then(_templates => setTemplates(_templates));
    }, [isDialogOpen])


    const toggleDialog = () => {
        setIsDialogOpen(prev => !prev)
    }


    const handleSelect = (template: TemplateType) => {
        onSelect(template);
        setIsDialogOpen(false);
    }


    return (
        <>
            <Button style={{ alignSelf: "flex-start", textDecoration: "underline" }} onClick={toggleDialog}>Import Template</Button>
            {isDialogOpen && (
                <Dialog
                    open={isDialogOpen}
                    onClose={toggleDialog}

                >
                    <ModalTitle onClose={toggleDialog}>Select Template</ModalTitle>
                    <DialogContent dividers>
                        <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
                            {templates.map(template => (
                                <Fragment key={template.id}>
                                    <ListItemButton alignItems="flex-start" onClick={() => handleSelect(template)}>
                                        <ListItemText
                                            primary={template.name}
                                            secondary={
                                                <>
                                                    <Typography
                                                        sx={{ display: 'inline' }}
                                                        component="span"
                                                        variant="body2"
                                                        color="text.primary"

                                                    >
                                                        {template.subject}
                                                    </Typography>
                                                    <p dangerouslySetInnerHTML={sanitizer(template.body)}></p>
                                                </>
                                            }
                                        />

                                    </ListItemButton>
                                    <Divider/>
                                </Fragment>
                            ))}
                        </List>

                    </DialogContent>
                    <DialogActions>
                        <Button>Cancel</Button>
                    </DialogActions>
                </Dialog>
            )}
        </>

    )
};


export default ImportTemplate;