import { DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { IoMdClose } from "react-icons/io";

type ModalTitleProps = {
  children: React.ReactNode;
  onClose?: () => void;
};

function ModalTitle({ children, onClose, ...props }: ModalTitleProps) {
  return (
    <div className="relative flex items-center">
      <DialogTitle className="text-lg font-semibold" {...props}>
        {children}
      </DialogTitle>

      {onClose && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute right-0 top-0 text-muted-foreground hover:text-foreground"
          aria-label="close"
        >
          <IoMdClose className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
}

export default ModalTitle;