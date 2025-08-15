import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { EditProcedureModal } from './EditProcedureModal';
import { proceduresApi } from '../lib/supabase';
import { Procedure } from '../types';

export const ProceduresTable: React.FC = () => {
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProcedure, setSelectedProcedure] = useState<Procedure | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  useEffect(() => {
    loadProcedures();
  }, []);

  const loadProcedures = async () => {
    try {
      const data = await proceduresApi.getAll();
      const formattedData = data.map((p: any) => ({
        id: p.id,
        category: p.category,
        name: p.name,
        price: p.price || 0,
        total_cost: p.cost || 0,
        margin: (p.price || 0) - (p.cost || 0),
        margin_rate: p.price ? ((p.price - (p.cost || 0)) / p.price * 100) : 0,
        materials: p.procedure_materials?.map((m: any) => ({
          material_id: m.material_id,
          quantity: m.quantity
        })) || []
      }));
      // 타입 오류를 해결하기 위해 formattedData를 Procedure 타입에 맞게 변환
      setProcedures(
        formattedData.map((item: any) => ({
          id: item.id,
          category: item.category,
          name: item.name,
          price: item.price, // Procedure 타입에 맞게 price로 매핑
          cost: item.total_cost,      // Procedure 타입에 맞게 cost로 매핑
          margin: item.margin,
          margin_rate: item.margin_rate,
          materials: item.materials
        }))
      );
    } catch (error) {
      console.error('시술 목록 불러오기 중 오류 발생:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await proceduresApi.delete(id);
      setProcedures(procedures.filter(p => p.id !== id));
    } catch (error) {
      console.error('시술 삭제 중 오류 발생:', error);
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedItems.map(id => proceduresApi.delete(id)));
      setProcedures(procedures.filter(p => !selectedItems.includes(p.id)));
      setSelectedItems([]);
    } catch (error) {
      console.error('시술 일괄 삭제 중 오류 발생:', error);
    }
  };

  const handleEdit = (procedure: Procedure) => {
    setSelectedProcedure(procedure);
    setEditModalOpen(true);
  };

  const handleEditComplete = (updatedProcedure: Procedure) => {
    setProcedures(procedures.map(p => p.id === updatedProcedure.id ? updatedProcedure : p));
    setEditModalOpen(false);
    setSelectedProcedure(null);
  };

  const filteredProcedures = procedures.filter(procedure =>
    procedure.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    procedure.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedItems(procedures.map(p => p.id));
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
          placeholder="시술명 또는 분류로 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          sx={{ flexGrow: 1 }}
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleEdit({
            id: 0,
            category: '',
            name: '',
            price: 0,
            cost: 0,
            materials: []
          })}
          sx={{ bgcolor: '#4caf50', '&:hover': { bgcolor: '#388e3c' } }}
        >
          시술 추가
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

      <TableContainer 
        component={Paper} 
        sx={{ 
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          borderRadius: '12px',
          overflow: 'hidden',
          border: '1px solid #e0e0e0',
          maxWidth: '96%',
          mx: 'auto',
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox" sx={{ textAlign: 'center' }}>
                <Checkbox
                  checked={selectedItems.length === procedures.length}
                  indeterminate={selectedItems.length > 0 && selectedItems.length < procedures.length}
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell sx={{ textAlign: 'center' }}>분류</TableCell>
              <TableCell sx={{ textAlign: 'center' }}>시술명</TableCell>
              <TableCell align="right" sx={{ textAlign: 'center' }}>고객가</TableCell>
              <TableCell align="right" sx={{ textAlign: 'center' }}>총 원가</TableCell>
              <TableCell align="right" sx={{ textAlign: 'center' }}>마진</TableCell>
              <TableCell align="right" sx={{ textAlign: 'center' }}>마진율</TableCell>
              <TableCell align="center" sx={{ textAlign: 'center' }}>작업</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProcedures.map((procedure) => (
              <TableRow key={procedure.id}>
                <TableCell padding="checkbox" sx={{ textAlign: 'center' }}>
                  <Checkbox
                    checked={selectedItems.includes(procedure.id)}
                    onChange={() => handleSelectItem(procedure.id)}
                  />
                </TableCell>
                <TableCell sx={{ textAlign: 'center' }}>
                  <Chip
                    label={procedure.category}
                    size="small"
                    sx={{
                      bgcolor: '#e3f2fd',
                      color: '#1976d2',
                      fontWeight: 500,
                    }}
                  />
                </TableCell>
                <TableCell sx={{ textAlign: 'center' }}>{procedure.name}</TableCell>
                <TableCell align="right" sx={{ textAlign: 'center' }}>
                          ₩{('price' in procedure && typeof procedure.price === 'number'
          ? procedure.price
                    : 0
                  ).toLocaleString()}
                </TableCell>
                <TableCell align="right" sx={{ textAlign: 'center' }}>
                  ₩{('total_cost' in procedure && typeof procedure.total_cost === 'number'
                    ? procedure.total_cost
                    : 0
                  ).toLocaleString()}
                </TableCell>
                <TableCell align="right" sx={{ textAlign: 'center' }}>
                  ₩{('margin' in procedure && typeof procedure.margin === 'number'
                    ? procedure.margin
                    : 0
                  ).toLocaleString()}
                </TableCell>
                <TableCell align="right" sx={{ textAlign: 'center' }}>
                  {('margin_rate' in procedure && typeof procedure.margin_rate === 'number'
                    ? procedure.margin_rate
                    : 0
                  ).toFixed(2)}%
                </TableCell>
                <TableCell align="center" sx={{ textAlign: 'center' }}>
                  <Button
                    variant="contained"
                    color="warning"
                    size="small"
                    onClick={() => handleEdit(procedure)}
                    sx={{
                      minWidth: '60px',
                      px: 2,
                      '&:hover': {
                        transform: 'translateY(-1px)',
                      },
                    }}
                  >
                    수정
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    size="small"
                    onClick={() => handleDelete(procedure.id)}
                    sx={{
                      minWidth: '60px',
                      px: 2,
                      '&:hover': {
                        transform: 'translateY(-1px)',
                      },
                    }}
                  >
                    삭제
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <EditProcedureModal
        open={editModalOpen}
        procedure={selectedProcedure}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedProcedure(null);
        }}
        onSave={handleEditComplete}
      />
    </Box>
  );
}; 