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
import { useTheme } from "@mui/material/styles";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import MapIcon from "@mui/icons-material/Map";
import RefreshIcon from "@mui/icons-material/Refresh";
import { DeleteField, GETFields } from "../../api/fetch";
import FieldDialog from "../prescriptions/Dialog";
import { FarmBiocharForm } from "..";
import { formatTimestamp, formatPrice, truncateId } from "../../utils/format";
import { getPageGradientBg } from "../../utils/theme";

type FieldRecord = {
  id: number;
  field_id: string;
  name: string;
  description: string;
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
const MAX_FIELDS = 3;

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
  const [selectedFieldName, setSelectedFieldName] = React.useState("");
  const [selectedFieldDescription, setSelectedFieldDescription] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const theme = useTheme();

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
    setSelectedFieldName(field.name);
    setSelectedFieldDescription(field.description);
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

  const canCreateField = fields.length < MAX_FIELDS;

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography sx={{ color: "text.secondary" }}>Loading fields...</Typography>
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
    <Box
      sx={{
        minHeight: "calc(100vh - 64px)",
        background: getPageGradientBg(theme),
      }}
    >
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
            sx={{ color: "text.primary", fontWeight: 700 }}
          >
            Your Fields
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
            {fields.length} of {MAX_FIELDS} {fields.length === 1 ? "field" : "fields"} configured
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchFields} sx={{ color: "text.secondary" }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          {canCreateField ? (
            <FarmBiocharForm onFieldCreated={fetchFields} />
          ) : (
            <Tooltip title="Maximum of 3 fields reached">
              <span>
                <Button variant="contained" disabled>
                  Create Farm
                </Button>
              </span>
            </Tooltip>
          )}
        </Box>
      </Box>

      {/* Table */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
        }}
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Field ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Crop</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {fields.map((field) => (
              <TableRow key={field.id}>
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
                <TableCell>{field.name || "-"}</TableCell>
                <TableCell>
                  <Tooltip title={field.description || ""} placement="top">
                    <Typography
                      variant="body2"
                      component="span"
                      sx={{
                        maxWidth: 200,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        display: "inline-block",
                      }}
                    >
                      {field.description || "-"}
                    </Typography>
                  </Tooltip>
                </TableCell>
                <TableCell>{field.crop_type}</TableCell>
                <TableCell>{formatPrice(field.price, field.unit)}</TableCell>
                <TableCell>
                  <StatusChip status={field.prescription_map_status} />
                </TableCell>
                <TableCell>
                  <Tooltip title={new Date(field.created_at).toLocaleString()} placement="top">
                    <span>{formatTimestamp(field.created_at)}</span>
                  </Tooltip>
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: "flex", gap: 0.5, justifyContent: "flex-end" }}>
                    <Tooltip title="Delete field">
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteField(field)}
                        sx={{ color: "error.main" }}
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
                <TableCell colSpan={8} sx={{ textAlign: "center", py: 4 }}>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    No fields found. Create a farm to get started.
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
        name={selectedFieldName}
        description={selectedFieldDescription}
        onClose={() => {
          setOpen(false);
          setSelectedField("");
          setSelectedFieldName("");
          setSelectedFieldDescription("");
        }}
      />
    </Container>
    </Box>
  );
}
