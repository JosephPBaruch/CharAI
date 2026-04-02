import {
  TextField,
  type TextFieldProps,
  FormHelperText,
  Box,
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";

export type FormTextFieldProps = TextFieldProps & {
  errorText?: string; // <-- explicitly type errorText
  sx?: SxProps<Theme>; // optional styling override
};

export function FormTextField({ errorText, sx, ...props }: FormTextFieldProps) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      <TextField
        {...props}
        variant="outlined"
        fullWidth
        error={!!errorText}
        sx={{
          ...sx,
        }}
      />
      {errorText && (
        <FormHelperText
          error
          sx={{ marginLeft: 0, marginTop: 0.5, fontSize: "0.75rem" }}
        >
          {errorText}
        </FormHelperText>
      )}
    </Box>
  );
}
