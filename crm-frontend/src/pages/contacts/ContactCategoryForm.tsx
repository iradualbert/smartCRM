import { useState } from "react";
import { Dialog, DialogContent, DialogActions, Button, FormControl, FormLabel, TextField } from "@mui/material";
import ModalTitle from "../../components/ui/ModalTitle";
import axios from "axios";



const ContactCategoryForm = ({ children, onUpdate, onCreate, onDelete, isReadOnly, isCreate }) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState(null);
    const [categoryName, setCategoryName] = useState("")

    const toggleShowDialog = () => {
        setErrors(null);
        setIsDialogOpen(prev => !prev)
    }

    const handleChange = (e: any) => {

    }

    const handleCreate = () => {

    }

    const handleUpdate = () => {

    }

    const handleDelete = () => {

    }


    return (
        <>
            <Button variant="outlined" onClick={toggleShowDialog}>{children ? children : "Update"}</Button>
            {isDialogOpen && (
                <Dialog
                    open={isDialogOpen}
                    onClose={toggleShowDialog}
                    fullWidth
                >
                    <ModalTitle onClose={toggleShowDialog}>{isCreate ? "New Category" : "Category Update"}</ModalTitle>
                    <DialogContent dividers>
                        <form>
                            <FormControl fullWidth>
                                <FormLabel component="p">Category Name *</FormLabel>
                                <TextField
                                    className="input"
                                    value={categoryName}
                                    disabled={isReadOnly}
                                    size="small"
                                    variant="outlined"
                                    name="Category Name"
                                    onChange={e => setCategoryName(e.target.value)}
                                    error={errors?.name}
                                    helperText={errors?.name}
                                />
                            </FormControl>
                        </form>
                    </DialogContent>
                    <DialogActions>
                        {!isReadOnly && !isCreate && (
                            <Button
                                size="small"
                                style={{ marginRight: "auto" }}
                                variant="contained"
                                color="error"
                                disabled={isSaving}
                                onClick={handleDelete}
                            >
                                Delete
                            </Button>
                        )}

                        <Button
                            size="small"
                            disabled={isSaving}
                            variant="outlined"
                            color="warning"
                            onClick={() => setIsDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            size="small"
                            variant="contained"
                            onClick={isCreate ? handleCreate : handleUpdate}
                            disabled={isSaving || isReadOnly}
                        >
                            {isCreate ? "Create" : "Save"}
                        </Button>
                    </DialogActions>
                </Dialog>
            )}
        </>
    )
}

export default ContactCategoryForm;