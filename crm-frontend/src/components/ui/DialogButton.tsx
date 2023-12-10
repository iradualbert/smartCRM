import{ useState } from 'react';

import { Button, Dialog, DialogActions, DialogContent } from "@mui/material";
import ModalTitle from "./ModalTitle";

const DialogButton = ({ modalTitle, btnTitle, children, onOpen, onCancel }) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const toggleDialog = () => {
      setIsDialogOpen(prev => !prev)
    }
  
    return (
      <>
        <Button onClick={toggleDialog}>{btnTitle}</Button>
        {isDialogOpen && (
          <Dialog
            open={isDialogOpen}
            onClose={toggleDialog}
  
          >
            <ModalTitle onClose={toggleDialog}>{modalTitle}</ModalTitle>
            <DialogContent dividers>
                {children}
            </DialogContent>
            <DialogActions>
              <Button onClick={toggleDialog}>Cancel</Button>
            </DialogActions>
          </Dialog>
        )}
      </>
  
    )
}

export default DialogButton