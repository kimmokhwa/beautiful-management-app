import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Typography
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Material as MaterialType } from '../types';
interface Material {
  id: number;
  name: string;
  price: number;
  unit: string;
  usage_count?: number;
  sales_count?: number;
}

interface EditMaterialModalProps {
  open: boolean;
  material: Material | null;
  onClose: () => void;
  onSave: (material: Material) => void;
}

export const EditMaterialModal: React.FC<EditMaterialModalProps> = ({
  open,
  material,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState(material?.name || '');
  const [price, setPrice] = useState(material?.price || 0);
  const [unit, setUnit] = useState(material?.unit || '');
  const [saleCount, setSaleCount] = useState(material?.sales_count || 0);

  useEffect(() => {
    if (open) {
      setName(material?.name || '');
      setPrice(material?.price || 0);
      setUnit(material?.unit || '');
      setSaleCount(material?.sales_count || 0);
    }
  }, [open, material]);

  const handleSave = () => {
    if (!name || !unit) {
      alert('재료명과 단위를 입력해주세요.');
      return;
    }

    onSave({
      id: material?.id || 0,
      name,
      price,
      unit,
      usage_count: material?.usage_count || 0,
      sales_count: saleCount
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {material?.id ? '재료 수정' : '재료 추가'}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <TextField
            label="재료명"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
          />
          <TextField
            label="단가"
            type="number"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            fullWidth
          />
          <TextField
            label="단위"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            fullWidth
          />
          <TextField
            label="판매량"
            type="number"
            value={saleCount ?? 0}
            onChange={e => setSaleCount(Number(e.target.value))}
            fullWidth
            sx={{ mt: 2 }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          저장
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 