import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  Typography,
  Checkbox,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { materialsApi } from '../services/api';
import { EditMaterialModal } from './EditMaterialModal';
import { Material } from '../services/api';

export const MaterialsTable: React.FC = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    try {
      const data = await materialsApi.getAll();
      const formattedData = data.map((m: any) => ({
        id: m.id,
        name: m.name,
        cost: m.cost || m.price || 0,
        price: m.price || 0,
        unit: m.unit || '',
        usage_count: m.usage_count || 0
      }));
      setMaterials(formattedData);
    } catch (error) {
      console.error('재료 목록 로딩 중 오류 발생:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await materialsApi.delete(id);
      setMaterials(materials.filter(m => m.id !== id));
    } catch (error) {
      console.error('재료 삭제 중 오류 발생:', error);
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedItems.map(id => materialsApi.delete(id)));
      setMaterials(materials.filter(m => !selectedItems.includes(m.id)));
      setSelectedItems([]);
    } catch (error) {
      console.error('재료 일괄 삭제 중 오류 발생:', error);
    }
  };

  const handleEdit = (material: Material) => {
    setSelectedMaterial(material);
    setEditModalOpen(true);
  };

  const handleEditComplete = (updatedMaterial: Material) => {
    setMaterials(materials.map(m => m.id === updatedMaterial.id ? updatedMaterial : m));
    setEditModalOpen(false);
    setSelectedMaterial(null);
  };

  const filteredMaterials = materials.filter(material =>
    material.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedItems(materials.map(m => m.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id: number) => {
    setSelectedItems(prev =>
      prev.includes(id)
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  };

  if (loading) {
    return <Typography>로딩 중...</Typography>;
  }

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          placeholder="재료명으로 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          sx={{ flexGrow: 1 }}
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleEdit({ id: 0, name: '', cost: 0, usage_count: 0 })}
          sx={{ bgcolor: '#4caf50', '&:hover': { bgcolor: '#388e3c' } }}
        >
          재료 추가
        </Button>
        {selectedItems.length > 0 && (
          <Button
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleBulkDelete}
          >
            전체 삭제
          </Button>
        )}
      </Box>

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectedItems.length === materials.length}
                  indeterminate={selectedItems.length > 0 && selectedItems.length < materials.length}
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell>재료명</TableCell>
              <TableCell align="right">원가</TableCell>
              <TableCell align="right">사용 시술 수</TableCell>
              <TableCell align="center">작업</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredMaterials.map((material) => (
              <TableRow key={material.id}>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedItems.includes(material.id)}
                    onChange={() => handleSelectItem(material.id)}
                  />
                </TableCell>
                <TableCell>{material.name}</TableCell>
                <TableCell align="right">₩{material.cost.toLocaleString()}</TableCell>
                <TableCell align="right">{material.usage_count}개 시술</TableCell>
                <TableCell align="center">
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleEdit(material)}
                    sx={{ mr: 1 }}
                  >
                    수정
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    size="small"
                    onClick={() => handleDelete(material.id)}
                  >
                    삭제
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <EditMaterialModal
        open={editModalOpen}
        material={selectedMaterial}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedMaterial(null);
        }}
        onSave={handleEditComplete}
      />
    </Box>
  );
}; 