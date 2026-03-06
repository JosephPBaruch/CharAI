import React from "react";
import {
  Alert,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { DeleteField, GETFields } from "../../api/fetch";
import FieldDialog from "../prescriptions/Dialog";

type FieldRecord = {
  id: number;
  field_id: string;
  crop_type: string;
  custom_crop: string;
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

export default function FieldTable() {
  const [fields, setFields] = React.useState<FieldRecord[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedField, setSelectedField] = React.useState("");
  const [open, setOpen] = React.useState(false);

  const handleGetMap = (field: FieldRecord) => {
    setSelectedField(field.field_id);
    setOpen(true);
  };

  const handleDeleteMap = async (field: FieldRecord) => {
    try {
      const status = await DeleteField(field.field_id);
      if (status == 200) {
        console.log("Successful delete of field: ", field.field_id);
      }
    } catch (error) {
      console.log(error);
    }
  };

  React.useEffect(() => {
    let isMounted = true;

    GETFields()
      .then((response: GetFieldsResponse) => {
        if (!isMounted) return;
        setFields(Array.isArray(response.fields) ? response.fields : []);
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Failed to load fields.");
      })
      .finally(() => {
        if (!isMounted) return;
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return <Typography>Loading fields...</Typography>;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <>
      <TableContainer component={Paper}>
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
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {fields.map((field) => (
              <TableRow key={field.id}>
                <TableCell>{field.id}</TableCell>
                <TableCell>{field.field_id}</TableCell>
                <TableCell>{field.crop_type}</TableCell>
                <TableCell>{field.price}</TableCell>
                <TableCell>{field.unit}</TableCell>
                <TableCell>{field.prescription_map_status}</TableCell>
                <TableCell>{field.prescription_map_file || "-"}</TableCell>
                <TableCell>
                  {new Date(field.created_at).toLocaleString()}
                </TableCell>
                <TableCell>
                  {new Date(field.updated_at).toLocaleString()}
                </TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleDeleteMap(field)}
                    disabled={field.prescription_map_status !== "complete"}
                  >
                    Delete
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleGetMap(field)}
                    disabled={field.prescription_map_status !== "complete"}
                  >
                    Get Map
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {fields.length === 0 && (
              <TableRow>
                <TableCell colSpan={10}>No fields found.</TableCell>
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
    </>
  );
}
