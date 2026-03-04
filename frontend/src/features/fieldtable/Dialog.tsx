import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";

type FieldDialogProps = {
  open: boolean;
  onClose: () => void;
  id: number | string | null;
};

export default function FieldDialog({ open, onClose, id }: FieldDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Field Dialog</DialogTitle>
      <DialogContent>
        <Typography>
          Selected ID: <strong>{id ?? "N/A"}</strong>
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
