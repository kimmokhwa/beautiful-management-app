import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { materialsApi } from '../services/api';

interface Material {
  id: number;
  name: string;
  price: number;
}

interface MaterialFormData {
  name: string;
  price: string;
  unit: string;
}

const MaterialManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [materials, setMaterials] = useState<Material[]>([]);
  const [, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [formData, setFormData] = useState<MaterialFormData>({ name: '', price: '', unit: '' });

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    try {
      const data = await materialsApi.getAll();
      setMaterials(data);
    } catch (err) {
      setError('재료 목록을 불러오는데 실패했습니다.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (material?: Material) => {
    if (material) {
      setEditingMaterial(material);
      setFormData({ name: material.name, price: material.price?.toString() || '', unit: (material as any).unit || '' });
    } else {
      setEditingMaterial(null);
      setFormData({ name: '', price: '', unit: '' });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingMaterial(null);
    setFormData({ name: '', price: '', unit: '' });
  };

  const handleSubmit = async () => {
    try {
      if (editingMaterial) {
        await materialsApi.update(editingMaterial.id, {
          name: formData.name,
          price: Number(formData.price),
          unit: formData.unit,
        });
      } else {
        await materialsApi.create({
          name: formData.name,
          price: Number(formData.price),
          unit: formData.unit,
        });
      }
      await loadMaterials();
      handleCloseDialog();
    } catch (err) {
      setError('재료 저장에 실패했습니다.');
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('정말로 이 재료를 삭제하시겠습니까?')) {
      try {
        await materialsApi.delete(id);
        await loadMaterials();
      } catch (err) {
        setError('재료 삭제에 실패했습니다.');
        console.error(err);
      }
    }
  };

  const filteredMaterials = materials.filter((material) =>
    material.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">재료 관리</Typography>
        <Button variant="contained" color="primary" onClick={() => handleOpenDialog()}>
          재료 추가
        </Button>
      </Box>

      <TextField
        fullWidth
        variant="outlined"
        placeholder="재료명 검색..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 3 }}
      />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>재료명</TableCell>
              <TableCell align="right">가격</TableCell>
              <TableCell align="center">관리</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredMaterials.map((material) => (
              <TableRow key={material.id}>
                <TableCell>{material.name}</TableCell>
                <TableCell align="right">{material.price.toLocaleString()}원</TableCell>
                <TableCell align="center">
                  <IconButton color="primary" onClick={() => handleOpenDialog(material)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(material.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={isDialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>{editingMaterial ? '재료 수정' : '재료 추가'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="재료명"
            fullWidth
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="가격"
            type="number"
            fullWidth
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          />
          <TextField
            margin="dense"
            label="단위"
            fullWidth
            value={formData.unit}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>취소</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            저장
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setError(null)} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MaterialManagement; 