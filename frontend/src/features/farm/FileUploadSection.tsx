import { Box, Stack, Typography } from '@mui/material';
import { COLORS } from '../../styles/colors';
import CoordinateFileUpload from './CoordinateFileUpload';
import YieldFileUpload from './YieldFileUpload';
import ManualCoordinateUpload from './ManualCoordinateUpload';

interface FileUploadSectionProps {
  onCoordSelect: (file: File | null) => void;
  onCoordUploaded: () => void;
  onYieldSelect: () => void;
  onYieldUploaded: () => void;
}

export default function FileUploadSection({
  onCoordSelect,
  onCoordUploaded,
  onYieldSelect,
  onYieldUploaded,
}: FileUploadSectionProps) {
  return (
    <Box sx={{ p: 2.5, border: `1px dashed ${COLORS.indigo}`, borderRadius: 2, backgroundColor: COLORS.indigoVeryLight }}>
      <Typography variant="h6" sx={{ color: COLORS.indigo, fontWeight: 600, mb: 1.5 }}>
        Upload Farm Data
      </Typography>
      <Typography variant="body2" sx={{ color: COLORS.whiteMedium, mb: 2.5 }}>
        Upload geographic coordinate data (required) to define your farm boundaries. You can also optionally upload yield data to improve calculations. Supported formats: Shapefile, GeoJSON, CSV, KML, and other standard formats.
      </Typography>

      <Stack direction="column" spacing={2.5}>
        {/* Coordinate File Box */}
        <Box sx={{ p: 2, backgroundColor: COLORS.indigoMedium, border: `2px solid ${COLORS.indigo}`, borderRadius: 1.5 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="subtitle1" sx={{ color: COLORS.indigo, fontWeight: 700 }}>Coordinate file</Typography>
            <Box sx={{ px: 1, py: 0.5, backgroundColor: COLORS.indigo, borderRadius: 0.5 }}>
              <Typography variant="caption" sx={{ color: COLORS.blackFull, fontWeight: 600 }}>Required</Typography>
            </Box>
          </Stack>
          <Typography variant="body2" sx={{ color: COLORS.whiteMedium, mb: 2 }}>
            Upload a file containing your farm boundary coordinates, or draw them manually.
          </Typography>
          <CoordinateFileUpload onSelect={onCoordSelect} onUploadComplete={onCoordUploaded} />
          <Typography variant="caption" sx={{ color: COLORS.whiteMedium, my: 1.5, display: 'block' }}>
            Accepted formats: Shapefile (.shp, .shx, .dbf), GeoJSON (.geojson), CSV (.csv), KML/KMZ (.kml, .kmz)
          </Typography>
          <ManualCoordinateUpload />
        </Box>

        {/* Yield File Box */}
        <Box sx={{ p: 2, backgroundColor: 'transparent', border: `1px solid ${COLORS.whiteLow}`, borderRadius: 1.5 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="subtitle1" sx={{ color: COLORS.whiteHigh, fontWeight: 600 }}>Yield file</Typography>
            <Box sx={{ px: 1, py: 0.5, backgroundColor: COLORS.whiteLow, borderRadius: 0.5 }}>
              <Typography variant="caption" sx={{ color: COLORS.whiteMedium, fontWeight: 600 }}>Optional</Typography>
            </Box>
          </Stack>
          <Typography variant="body2" sx={{ color: COLORS.whiteMedium, mb: 2 }}>
            Upload historical yield data to enable yield-based calculations and recommendations. This helps predict potential ROI from biochar applications.
          </Typography>
          <YieldFileUpload onSelect={onYieldSelect} onUploadComplete={onYieldUploaded} />
          <Typography variant="caption" sx={{ color: COLORS.whiteMedium, mt: 1.5, display: 'block' }}>
            Accepted formats: CSV (.csv), ISOXML (.xml), Shapefile (.shp), TXT (.txt)
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}
