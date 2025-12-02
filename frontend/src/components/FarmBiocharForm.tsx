import React from 'react';
import {
  Box,
  Button,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { COLORS } from '../styles/colors';
import BudgetSettings from './BudgetSettings';
import FieldsList from './FieldsList';
import type { FieldEntry } from './FieldsList';
import FileUploadSection from './FileUploadSection';
import SubmitSection from './SubmitSection';

const DEFAULT_FIELD = (): FieldEntry => ({
  id: String(Date.now()) + Math.random().toString(36).slice(2, 9),
  cropType: 'Wheat',
  customCrop: '',
  price: '',
  unit: 'bushel',
});

export default function FarmBiocharForm() {
  const [fields, setFields] = React.useState<FieldEntry[]>([DEFAULT_FIELD()]);
  const [globalMax, setGlobalMax] = React.useState<number | ''>('');
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const addField = () => setFields(prev => [...prev, DEFAULT_FIELD()]);

  const removeField = (id: string) => setFields(prev => prev.filter(f => f.id !== id));

  const updateField = (id: string, patch: Partial<FieldEntry>) => {
    setFields(prev => prev.map(f => (f.id === id ? { ...f, ...patch } : f)));
  };

  // file upload state
  const [coordUploaded, setCoordUploaded] = React.useState<boolean>(false);

  const handleCoordSelect = (file: File | null) => {
    // If a file is selected, mark coordinates as uploaded/available so the form can be submitted.
    // This covers the common case where the user selects/uploads a file and we want the
    // Submit button to enable immediately. If the parent uploader also calls
    // `onUploadComplete`, that will also set this to true.
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

  const FormContent = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Title Section */}
      <Box>
        <Typography variant="h5" sx={{ color: COLORS.whiteHigh, fontWeight: 700, mb: 0.5 }}>
          Farm Configuration
        </Typography>
        <Typography variant="body2" sx={{ color: COLORS.whiteMedium }}>
          Define your fields, crops, and biochar budget allocation. Upload coordinate data to define your farm boundaries.
        </Typography>
      </Box>

      {/* Budget Settings */}
      <BudgetSettings globalMax={globalMax} onChange={setGlobalMax} />

      {/* Fields List */}
      <FieldsList
        fields={fields}
        onAddField={addField}
        onRemoveField={removeField}
        onUpdateField={updateField}
      />

      {/* File Upload Section */}
      <FileUploadSection
        onCoordSelect={handleCoordSelect}
        onCoordUploaded={handleCoordUploaded}
        onYieldSelect={handleYieldSelect}
        onYieldUploaded={handleYieldUploaded}
      />

      {/* Submit Section */}
      <SubmitSection
        coordUploaded={coordUploaded}
        onSubmit={() => {
          const payload = { globalMax, fields };
          console.log('Submit payload', payload);
          alert('Form submitted! Check console for payload details.');
        }}
      />
    </Box>
  );

  return (
    <>
      {/* Modal Trigger Button */}
      <Button
        variant="contained"
        onClick={openModal}
        sx={{ backgroundColor: COLORS.indigo, '&:hover': { backgroundColor: '#7a81ff' } }}
      >
        Configure Farm
      </Button>

      {/* Modal Dialog */}
      <Dialog
        open={isModalOpen}
        onClose={closeModal}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: '#000000',
            backgroundImage: 'none',
            color: COLORS.whiteHigh,
            maxHeight: '90vh',
            overflowY: 'auto',
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
          <IconButton onClick={closeModal} sx={{ color: COLORS.whiteMedium }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 0, pb: 3 }}>
          <FormContent />
        </DialogContent>
      </Dialog>
    </>
  );
}
