import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import { materialsApi } from '../lib/supabase';
import { Material, ProcedureMaterial } from '../types';

interface Procedure {
  id: number;
  category: string;
  name: string;
  price: number;
  cost: number;
  materials: ProcedureMaterial[];
  sale_count?: number;
}

interface EditProcedureModalProps {
  open: boolean;
  procedure: Procedure | null;
  onClose: () => void;
  onSave: (procedure: Procedure) => void;
}

export const EditProcedureModal: React.FC<EditProcedureModalProps> = ({
  open,
  procedure,
  onClose,
  onSave,
}) => {
  const [category, setCategory] = useState(procedure?.category || '');
  const [name, setName] = useState(procedure?.name || '');
  const [price, setPrice] = useState(procedure?.price || 0);
  const [cost, setCost] = useState(procedure?.cost || 0);
  const [materials, setMaterials] = useState<ProcedureMaterial[]>(procedure?.materials || []);
  const [availableMaterials, setAvailableMaterials] = useState<Material[]>([]);
  const [saleCount, setSaleCount] = useState(procedure?.sale_count || 0);

  useEffect(() => {
    if (open) {
      setCategory(procedure?.category || '');
      setName(procedure?.name || '');
      setPrice(procedure?.price || 0);
      setCost(procedure?.cost || 0);
      setMaterials(procedure?.materials || []);
      setSaleCount(procedure?.sale_count || 0);
      loadMaterials();
    }
  }, [open, procedure]);

  const loadMaterials = async () => {
    try {
      const data = await materialsApi.getAll();
      setAvailableMaterials(data);
    } catch (error) {
      console.error('재료 목록 로딩 중 오류 발생:', error);
    }
  };

  const handleAddMaterial = () => {
    setMaterials([...materials, { material_id: 0, quantity: 1, procedure_id: procedure?.id || 0 }]);
  };

  const handleRemoveMaterial = (index: number) => {
    setMaterials(materials.filter((_, i) => i !== index));
  };

  const handleMaterialChange = (index: number, materialId: number) => {
    const newMaterials = [...materials];
    newMaterials[index] = { ...newMaterials[index], material_id: materialId };
    setMaterials(newMaterials);
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    const newMaterials = [...materials];
    newMaterials[index] = { ...newMaterials[index], quantity };
    setMaterials(newMaterials);
  };

  const handleSave = () => {
    if (!name || !category) {
      alert('시술명과 카테고리를 입력해주세요.');
      return;
    }

    onSave({
      id: procedure?.id || 0,
      category,
      name,
      price,
      cost,
      materials,
      sale_count: saleCount
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {procedure?.id ? '시술 수정' : '시술 추가'}
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
            label="카테고리"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            fullWidth
          />
          <TextField
            label="시술명"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
          />
          <TextField
            label="가격"
            type="number"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            fullWidth
          />
          <TextField
            label="원가"
            type="number"
            value={cost}
            onChange={(e) => setCost(Number(e.target.value))}
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

          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              사용 재료
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>재료명</TableCell>
                    <TableCell align="right">수량</TableCell>
                    <TableCell align="center">작업</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {materials.map((material, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <TextField
                          select
                          fullWidth
                          value={material.material_id}
                          onChange={(e) => handleMaterialChange(index, Number(e.target.value))}
                          SelectProps={{
                            native: true,
                          }}
                        >
                          <option value={0}>재료 선택</option>
                          {availableMaterials.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.name}
                            </option>
                          ))}
                        </TextField>
                      </TableCell>
                      <TableCell align="right">
                        <TextField
                          type="number"
                          value={material.quantity}
                          onChange={(e) => handleQuantityChange(index, Number(e.target.value))}
                          inputProps={{ min: 1 }}
                          sx={{ width: 100 }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          color="error"
                          onClick={() => handleRemoveMaterial(index)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Button
              variant="outlined"
              onClick={handleAddMaterial}
              sx={{ mt: 2 }}
            >
              재료 추가
            </Button>
          </Box>
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