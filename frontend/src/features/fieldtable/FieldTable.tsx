import React from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import MapIcon from "@mui/icons-material/Map";
import RefreshIcon from "@mui/icons-material/Refresh";
import { DeleteField, GETFields } from "../../api/fetch";
import FieldDialog from "../prescriptions/Dialog";
import { FarmBiocharForm } from "..";
import { COLORS } from "../../styles/colors";
import { formatTimestamp, formatPrice, truncateId } from "../../utils/format";

type FieldRecord = {
  id: number;
  field_id: string;
  crop_type: string;
  price: string;
  unit: string;
  global_max: string;
  prescription_map_status: string;
  prescription_map_file: string;
  created_at: string;
  updated_at: string;
};

type GetFieldsResponse = {
  fields: FieldRecord[];
};

const POLL_INTERVAL_MS = 5000;

function StatusChip({ status }: { status: string }) {
  const config: Record<string, { color: "success" | "warning" | "error" | "info" | "default"; label: string }> = {
    complete: { color: "success", label: "Complete" },
    started: { color: "info", label: "Processing" },
    pending: { color: "warning", label: "Pending" },
    failed: { color: "error", label: "Failed" },
  };

  const { color, label } = config[status] ?? { color: "default" as const, label: status };

  return <Chip size="small" color={color} label={label} variant="outlined" />;
}

export default function FieldTable() {
  const [fields, setFields] = React.useState<FieldRecord[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedField, setSelectedField] = React.useState("");
  const [open, setOpen] = React.useState(false);

  const fetchFields = React.useCallback(async () => {
    try {
      const response: GetFieldsResponse = await GETFields();
      setFields(Array.isArray(response.fields) ? response.fields : []);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load fields.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  React.useEffect(() => {
    fetchFields();
  }, [fetchFields]);

  // Auto-poll when any field is still processing
  React.useEffect(() => {
    const hasProcessing = fields.some(
      (f) => f.prescription_map_status === "pending" || f.prescription_map_status === "started",
    );
    if (!hasProcessing) return;

    const interval = setInterval(fetchFields, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fields, fetchFields]);

  const handleGetMap = (field: FieldRecord) => {
    setSelectedField(field.field_id);
    setOpen(true);
  };

  const handleDeleteField = async (field: FieldRecord) => {
    try {
      const status = await DeleteField(field.field_id);
      if (status === 200) {
        setFields((prev) => prev.filter((f) => f.field_id !== field.field_id));
      }
    } catch (err) {
      console.debug("Delete failed:", err);
    }
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography sx={{ color: COLORS.whiteMedium }}>Loading fields...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header bar */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{ color: COLORS.whiteHigh, fontWeight: 700 }}
          >
            Your Fields
          </Typography>
          <Typography variant="body2" sx={{ color: COLORS.whiteMedium, mt: 0.5 }}>
            {fields.length} {fields.length === 1 ? "field" : "fields"} configured
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchFields} sx={{ color: COLORS.whiteMedium }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <FarmBiocharForm />
        </Box>
      </Box>

      {/* Table */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          backgroundColor: COLORS.bgCard,
          border: `1px solid ${COLORS.whiteVeryLow}`,
          borderRadius: 2,
        }}
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Field ID</TableCell>
              <TableCell>Crop</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Unit</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Prescription File</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Updated</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {fields.map((field) => (
              <TableRow key={field.id}>
                <TableCell>{field.id}</TableCell>
                <TableCell>
                  <Tooltip title={field.field_id} placement="top">
                    <Typography
                      variant="body2"
                      component="span"
                      sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}
                    >
                      {truncateId(field.field_id)}
                    </Typography>
                  </Tooltip>
                </TableCell>
                <TableCell>{field.crop_type}</TableCell>
                <TableCell>{formatPrice(field.price, field.unit)}</TableCell>
                <TableCell>{field.unit}</TableCell>
                <TableCell>
                  <StatusChip status={field.prescription_map_status} />
                </TableCell>
                <TableCell>
                  {field.prescription_map_file ? (
                    <Tooltip title={field.prescription_map_file} placement="top">
                      <Typography
                        variant="body2"
                        component="span"
                        sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}
                      >
                        {truncateId(field.prescription_map_file, 20)}
                      </Typography>
                    </Tooltip>
                  ) : (
                    <Typography variant="body2" sx={{ color: COLORS.whiteMedium }}>
                      -
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Tooltip title={new Date(field.created_at).toLocaleString()} placement="top">
                    <span>{formatTimestamp(field.created_at)}</span>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Tooltip title={new Date(field.updated_at).toLocaleString()} placement="top">
                    <span>{formatTimestamp(field.updated_at)}</span>
                  </Tooltip>
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: "flex", gap: 0.5, justifyContent: "flex-end" }}>
                    <Tooltip title="Delete field">
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteField(field)}
                        sx={{ color: COLORS.error }}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<MapIcon />}
                      onClick={() => handleGetMap(field)}
                      disabled={field.prescription_map_status !== "complete"}
                      sx={{ minWidth: "auto", fontSize: "0.75rem" }}
                    >
                      Get Map
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {fields.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} sx={{ textAlign: "center", py: 4 }}>
                  <Typography variant="body2" sx={{ color: COLORS.whiteMedium }}>
                    No fields found. Configure a farm to get started.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <FieldDialog
        open={open}
        id={selectedField}
        onClose={() => {
          setOpen(false);
          setSelectedField("");
        }}
      />
    </Container>
  );
}
