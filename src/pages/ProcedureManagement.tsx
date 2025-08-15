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
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { proceduresApi, materialsApi } from '@/lib/supabase';

interface Material {
  id: number;
  name: string;
  price: number;
}

interface ProcedureMaterial {
  material_id: number;
  quantity: number;
}

interface Procedure {
  id: number;
  category: string;
  name: string;
  price: number;
  cost: number;
  procedure_materials: ProcedureMaterial[];
}

interface ProcedureFormData {
  category: string;
  name: string;
  price: string;
  materials: { material_id: number; quantity: number }[];
}

const CATEGORIES = ['커트', '염색', '펌', '클리닉', '스타일링'];

const ProcedureManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProcedure, setEditingProcedure] = useState<Procedure | null>(null);
  const [formData, setFormData] = useState<ProcedureFormData>({
    category: '',
    name: '',
    price: '',
    materials: [],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [proceduresData, materialsData] = await Promise.all([
        proceduresApi.getAll(),
        materialsApi.getAll(),
      ]);
      setProcedures(proceduresData);
      setMaterials(materialsData);
    } catch (err) {
      setError('데이터를 불러오는데 실패했습니다.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateCost = (procedureMaterials: { material_id: number; quantity: number }[]) => {
    return procedureMaterials.reduce((total, { material_id, quantity }) => {
      const material = materials.find(m => m.id === material_id);
      return total + (material?.price || 0) * quantity;
    }, 0);
  };

  const handleOpenDialog = (procedure?: Procedure) => {
    if (procedure) {
      setEditingProcedure(procedure);
      setFormData({
        category: procedure.category,
        name: procedure.name,
        price: procedure.price.toString(),
        materials: procedure.procedure_materials,
      });
    } else {
      setEditingProcedure(null);
      setFormData({
        category: '',
        name: '',
        price: '',
        materials: [],
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingProcedure(null);
    setFormData({
      category: '',
      name: '',
      price: '',
      materials: [],
    });
  };

  const handleSubmit = async () => {
    try {
      const cost = calculateCost(formData.materials);
      
      if (editingProcedure) {
        await proceduresApi.update(editingProcedure.id, {
          category: formData.category,
          name: formData.name,
          price: Number(formData.price),
          cost,
          materials: formData.materials,
        });
      } else {
        await proceduresApi.create({
          category: formData.category,
          name: formData.name,
          price: Number(formData.price),
          cost,
          materials: formData.materials,
        });
      }
      await loadData();
      handleCloseDialog();
    } catch (err) {
      setError('시술 저장에 실패했습니다.');
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('정말로 이 시술을 삭제하시겠습니까?')) {
      try {
        await proceduresApi.delete(id);
        await loadData();
      } catch (err) {
        setError('시술 삭제에 실패했습니다.');
        console.error(err);
      }
    }
  };

  const handleAddMaterial = (materialId: number) => {
    setFormData({
      ...formData,
      materials: [...formData.materials, { material_id: materialId, quantity: 1 }],
    });
  };

  const handleUpdateMaterialQuantity = (materialId: number, quantity: number) => {
    setFormData({
      ...formData,
      materials: formData.materials.map(m =>
        m.material_id === materialId ? { ...m, quantity } : m
      ),
    });
  };

  const handleRemoveMaterial = (materialId: number) => {
    setFormData({
      ...formData,
      materials: formData.materials.filter(m => m.material_id !== materialId),
    });
  };

  const filteredProcedures = procedures.filter(
    (procedure) =>
      procedure.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      procedure.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getMaterialName = (materialId: number) => {
    return materials.find(m => m.id === materialId)?.name || '알 수 없음';
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">시술 관리</Typography>
        <Button variant="contained" color="primary" onClick={() => handleOpenDialog()}>
          시술 추가
        </Button>
      </Box>

      <TextField
        fullWidth
        variant="outlined"
        placeholder="시술명 또는 카테고리 검색..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 3 }}
      />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>카테고리</TableCell>
              <TableCell>시술명</TableCell>
              <TableCell align="right">시술가</TableCell>
              <TableCell align="right">원가</TableCell>
              <TableCell align="right">마진</TableCell>
              <TableCell align="right">마진율</TableCell>
              <TableCell>사용 재료</TableCell>
              <TableCell align="center">관리</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProcedures.map((procedure) => (
              <TableRow key={procedure.id}>
                <TableCell>{procedure.category}</TableCell>
                <TableCell>{procedure.name}</TableCell>
                <TableCell align="right">{procedure.price.toLocaleString()}원</TableCell>
                <TableCell align="right">{procedure.cost.toLocaleString()}원</TableCell>
                <TableCell align="right">
                  {(procedure.price - procedure.cost).toLocaleString()}원
                </TableCell>
                <TableCell align="right">
                  {((procedure.price - procedure.cost) / procedure.price * 100).toFixed(1)}%
                </TableCell>
                <TableCell>
                  {procedure.procedure_materials.map((material) => (
                    <Chip
                      key={material.material_id}
                      label={`${getMaterialName(material.material_id)} x${material.quantity}`}
                      size="small"
                      sx={{ mr: 0.5, mb: 0.5 }}
                    />
                  ))}
                </TableCell>
                <TableCell align="center">
                  <IconButton color="primary" onClick={() => handleOpenDialog(procedure)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(procedure.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={isDialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editingProcedure ? '시술 수정' : '시술 추가'}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>카테고리</InputLabel>
            <Select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              {CATEGORIES.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <TextField
            margin="dense"
            label="시술명"
            fullWidth
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          
          <TextField
            margin="dense"
            label="시술가"
            type="number"
            fullWidth
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          />

          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
            사용 재료
          </Typography>

          <FormControl fullWidth margin="dense">
            <InputLabel>재료 추가</InputLabel>
            <Select
              value=""
              onChange={(e) => handleAddMaterial(Number(e.target.value))}
            >
              {materials
                .filter(m => !formData.materials.some(fm => fm.material_id === m.id))
                .map((material) => (
                  <MenuItem key={material.id} value={material.id}>
                    {material.name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          {formData.materials.map((material) => (
            <Box key={material.material_id} sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <Typography sx={{ flex: 1 }}>
                {getMaterialName(material.material_id)}
              </Typography>
              <TextField
                type="number"
                size="small"
                value={material.quantity}
                onChange={(e) => handleUpdateMaterialQuantity(material.material_id, Number(e.target.value))}
                sx={{ width: 100, mx: 2 }}
              />
              <Button
                color="error"
                onClick={() => handleRemoveMaterial(material.material_id)}
              >
                제거
              </Button>
            </Box>
          ))}
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

export default ProcedureManagement; 