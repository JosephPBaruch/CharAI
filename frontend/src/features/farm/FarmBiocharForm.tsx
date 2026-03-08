import React from "react";
import {
  Box,
  Button,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { COLORS } from "../../styles/colors";
import BudgetSettings from "./BudgetSettings";
import FieldsList from "./FieldsList";
import type { FieldEntry } from "./FieldsList";
import FileUploadSection from "./FileUploadSection";
import SubmitSection from "./SubmitSection";
import { useCoordinates } from "../../contexts/CoordinateContext";
import { POSTFieldData } from "../../api/fetch";
import { useNavigate } from "react-router";

const DEFAULT_FIELD = (): FieldEntry => ({
  id: `main-field-${crypto.randomUUID()}`,
  cropType: "Wheat",
  customCrop: "",
  price: "",
  unit: "bushel",
});

export default function FarmBiocharForm() {
  const { data, hasCoordinates, setFormSubmitted } = useCoordinates();
  const [field, setField] = React.useState<FieldEntry>(DEFAULT_FIELD());
  const [globalMax, setGlobalMax] = React.useState<number | "">("");
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const navigate = useNavigate();

  const updateField = (patch: Partial<FieldEntry>) => {
    setField((prev) => ({ ...prev, ...patch }));
  };

  // file/manual coordinate state (ready when uploaded OR drawn OR already present)
  const [coordUploaded, setCoordUploaded] = React.useState<boolean>(false);

  // If coordinates already exist in context (from upload or manual draw), mark as ready
  React.useEffect(() => {
    if (hasCoordinates) {
      setCoordUploaded(true);
    }
  }, [hasCoordinates]);

  const handleCoordSelect = (file: File | null) => {
    setCoordUploaded(!!file);
  };

  const handleCoordUploaded = () => {
    setCoordUploaded(true);
  };

  const handleYieldSelect = () => {
    // yield file is optional, no action needed on select
  };

  const handleYieldUploaded = () => {
    // yield file is optional, no action needed on upload completion
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const coordsReady = coordUploaded || hasCoordinates;
  const isPriceValid = field.price !== "" && field.price > 0;

  return (
    <>
      {/* Modal Trigger Button */}
      <Button
        variant="contained"
        onClick={openModal}
        sx={{
          backgroundColor: COLORS.indigo,
          "&:hover": { backgroundColor: COLORS.indigoHover },
        }}
      >
        {hasCoordinates ? "Edit Farm Configuration" : "Configure Farm"}
      </Button>

      {/* Modal Dialog */}
      <Dialog
        open={isModalOpen}
        onClose={closeModal}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: COLORS.blackFull,
            backgroundImage: "none",
            color: COLORS.whiteHigh,
            maxHeight: "90vh",
            overflowY: "auto",
          },
        }}
      >
        <DialogTitle sx={{ display: "flex", justifyContent: "flex-end", p: 1 }}>
          <IconButton onClick={closeModal} sx={{ color: COLORS.whiteMedium }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 0, pb: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Title Section */}
            <Box>
              <Typography
                variant="h5"
                sx={{ color: COLORS.whiteHigh, fontWeight: 700, mb: 0.5 }}
              >
                Farm Configuration
              </Typography>
              <Typography variant="body2" sx={{ color: COLORS.whiteMedium }}>
                Configure your field's crop and selling price, set your biochar
                budget, and upload boundary coordinates to calculate optimal
                application rates.
              </Typography>
            </Box>

            {/* Budget Settings */}
            <BudgetSettings globalMax={globalMax} onChange={setGlobalMax} />

            {/* Field Configuration */}
            <FieldsList field={field} onUpdateField={updateField} />

            {/* File Upload Section */}
            <FileUploadSection
              onCoordSelect={handleCoordSelect}
              onCoordUploaded={handleCoordUploaded}
              onYieldSelect={handleYieldSelect}
              onYieldUploaded={handleYieldUploaded}
            />

            {/* Submit Section */}
            <SubmitSection
              coordsReady={coordsReady && isPriceValid}
              onSubmit={() => {
                if (!isPriceValid) {
                  alert("Please enter a valid crop selling price.");
                  return;
                }
                const payload = { globalMax, field, data };
                console.log(
                  `Sending the following field payload to the backend: ${JSON.stringify(payload)}`,
                );
                POSTFieldData(payload);
                setFormSubmitted(true);
                closeModal();
                navigate("/fields");
              }}
            />
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}
