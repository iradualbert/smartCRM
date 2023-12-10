import { DialogTitle, IconButton, Button } from "@mui/material";
import { IoMdClose } from "react-icons/io"; 

function ModalTitle(props) {
    const { children, onClose, ...other } = props;
  
    return (
      <DialogTitle sx={{ m: 0, p: 2 }} {...other}>
        {children}
        {onClose ? (
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <IoMdClose />
          </IconButton>
        ) : null}
      </DialogTitle>
    );
  }

  export default ModalTitle