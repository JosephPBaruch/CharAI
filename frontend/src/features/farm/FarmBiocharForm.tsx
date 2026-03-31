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
import BiocharSettings from "./BudgetSettings";
import FieldsList from "./FieldsList";
import type { FieldEntry } from "./FieldsList";
import FileUploadSection from "./FileUploadSection";
import SubmitSection from "./SubmitSection";
import { useCoordinates } from "../../contexts/CoordinateContext";
import { POSTFieldData } from "../../api/fetch";
import { useNavigate } from "react-router";
import { v4 as uuidv4 } from "uuid";

const DEFAULT_FIELD = (): FieldEntry => ({
  id: `main-field-${uuidv4()}`,
  cropType: "WW",
  price: "",
  unit: "bushel",
  biocharTonsPerHectare: 20,
  biocharCostPerTon: "",
});

interface FarmBiocharFormProps {
  onFieldCreated?: () => void;
}

export default function FarmBiocharForm({
  onFieldCreated,
}: FarmBiocharFormProps) {
  const { data, hasCoordinates, setFormSubmitted } = useCoordinates();
  const [field, setField] = React.useState<FieldEntry>(DEFAULT_FIELD());
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

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const coordsReady = coordUploaded || hasCoordinates;
  const isPriceValid = field.price !== "" && field.price > 0;
  const isBiocharCostValid =
    field.biocharCostPerTon !== "" && field.biocharCostPerTon > 0;
  const canSubmit = coordsReady && isPriceValid && isBiocharCostValid;

  return (
    <>
      {/* Modal Trigger Button */}
      <Button variant="contained" onClick={openModal}>
        Create Farm
      </Button>

      {/* Modal Dialog */}
      <Dialog open={isModalOpen} onClose={closeModal} maxWidth="lg" fullWidth>
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h5" component="span" sx={{ fontWeight: 700 }}>
            Create New Field
          </Typography>
          <IconButton onClick={closeModal} sx={{ color: "text.secondary" }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 0, pb: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Configure your field's crop and selling price, set your biochar
              budget, and upload boundary coordinates to calculate optimal
              application rates.
            </Typography>

            {/* Biochar Settings */}
            <BiocharSettings
              biocharTonsPerHectare={field.biocharTonsPerHectare}
              biocharCostPerTon={field.biocharCostPerTon}
              onChangeTonsPerHectare={(v) =>
                updateField({ biocharTonsPerHectare: v })
              }
              onChangeCostPerTon={(v) => updateField({ biocharCostPerTon: v })}
            />

            {/* Field Configuration */}
            <FieldsList field={field} onUpdateField={updateField} />

            {/* File Upload Section */}
            <FileUploadSection />

            {/* Submit Section */}
            <SubmitSection
              coordsReady={canSubmit}
              onSubmit={async () => {
                if (!isPriceValid) {
                  alert("Please enter a valid crop selling price.");
                  return;
                }
                if (!isBiocharCostValid) {
                  alert("Please enter a valid biochar cost per ton.");
                  return;
                }
                const payload = {
                  field: {
                    ...field,
                    biocharCostPerTon: field.biocharCostPerTon as number,
                  },
                  data,
                };
                console.debug(
                  `Sending the following field payload to the backend: ${JSON.stringify(payload)}`,
                );
                try {
                  await POSTFieldData(payload);
                  setFormSubmitted(true);
                  closeModal();
                  // Reset form for next creation
                  setField(DEFAULT_FIELD());
                  // Reload field list before navigation to avoid race condition
                  if (onFieldCreated) {
                    onFieldCreated();
                  }
                  navigate("/fields");
                } catch (err) {
                  console.debug("Field submission failed:", err);
                  alert("Failed to submit field. Please try again.");
                }
              }}
            />
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}
