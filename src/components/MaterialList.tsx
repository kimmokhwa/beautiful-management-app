import React, { useEffect, useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  InputAdornment,
  IconButton,
  TableSortLabel,
  Typography,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Upload as UploadIcon } from '@mui/icons-material';
import SearchIcon from '@mui/icons-material/Search';
import { Material, materialsApi } from '../services/api';
import { BulkUpload } from './BulkUpload';
import { Procedure, proceduresApi } from '../services/api';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

type Order = 'asc' | 'desc';

interface ExtendedMaterial extends Material {
  cost?: number;
  price?: number;
  unit?: string;
}

export const MaterialList: React.FC = () => {
  const [materials, setMaterials] = useState<ExtendedMaterial[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<ExtendedMaterial[]>([]);
  const [open, setOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Partial<ExtendedMaterial>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [orderBy, setOrderBy] = useState<string>('name');
  const [order, setOrder] = useState<Order>('asc');
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);
  const [procedures, setProcedures] = useState<Procedure[]>([]);

  useEffect(() => {
    loadMaterials();
    proceduresApi.getAll().then(setProcedures);
  }, []);

  useEffect(() => {
    const filtered = materials.filter(material =>
      material.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredMaterials(filtered);
  }, [searchTerm, materials]);

  const materialUsageCount = useMemo(() => {
    const count: Record<string, number> = {};
    procedures.forEach(proc => {
      proc.materials?.forEach(matName => {
        count[matName] = (count[matName] || 0) + 1;
      });
    });
    return count;
  }, [procedures]);

  const loadMaterials = async () => {
    try {
      const data = await materialsApi.getAll();
      setMaterials(data);
      setFilteredMaterials(data);
    } catch (error) {
      console.error('재료 목록 로딩 중 오류:', error);
    }
  };

  const handleRequestSort = (property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);

    let sorted;
    if (property === 'usage_count') {
      sorted = [...filteredMaterials].sort((a, b) => {
        const aCount = materialUsageCount[a.name] || 0;
        const bCount = materialUsageCount[b.name] || 0;
        return (aCount - bCount) * (isAsc ? 1 : -1);
      });
    } else {
      sorted = [...filteredMaterials].sort((a, b) => {
        if (property === 'cost') {
          return ((a[property] || 0) - (b[property] || 0)) * (isAsc ? 1 : -1);
        }
        return ((a[property] || '') < (b[property] || '') ? -1 : 1) * (isAsc ? 1 : -1);
      });
    }
    setFilteredMaterials(sorted);
  };

  const handleOpen = (material?: ExtendedMaterial) => {
    if (material) {
      setEditingMaterial(material);
      setIsEditing(true);
    } else {
      setEditingMaterial({});
      setIsEditing(false);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingMaterial({});
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      if (isEditing && editingMaterial.id) {
        await materialsApi.update(editingMaterial.id, {
          name: editingMaterial.name,
          price: editingMaterial.cost || 0,
          unit: editingMaterial.unit || '개'
        });
      } else {
        await materialsApi.create({
          name: editingMaterial.name || '',
          price: editingMaterial.cost || 0,
          unit: editingMaterial.unit || '개'
        });
      }
      handleClose();
      loadMaterials();
    } catch (error) {
      console.error('재료 저장 중 오류:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('이 재료를 삭제하시겠습니까?')) {
      try {
        await materialsApi.delete(id);
        loadMaterials();
      } catch (error) {
        console.error('재료 삭제 중 오류:', error);
      }
    }
  };

  const handleBulkUploadSuccess = () => {
    loadMaterials();
    setBulkUploadOpen(false);
  };

  // 엑셀 다운로드 함수 추가
  const handleDownloadXLSX = () => {
    const header = ['재료명', '비용', '사용 시술수'];
    const rows = filteredMaterials.map(material => [
      material.name,
      material.cost,
      materialUsageCount[material.name] || 0
    ]);
    const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '재료 리스트');
    XLSX.writeFile(wb, '재료_시술_리스트.xlsx');
  };

  return (
    <div>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, maxWidth: '96%', mx: 'auto' }}>
        <Typography 
          variant="h3" 
          sx={{
            color: '#FF85A1',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            fontWeight: 'bold',
            fontSize: '2.5rem',
            '&::before': {
              content: '""',
              display: 'block',
              width: '4px',
              height: '36px',
              backgroundColor: '#FF85A1',
              borderRadius: '4px',
            },
          }}
        >
          재료 관리
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            color="success"
            onClick={handleDownloadXLSX}
            sx={{ px: 2, py: 1 }}
          >
            엑셀 다운로드
          </Button>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<UploadIcon />}
            onClick={() => setBulkUploadOpen(true)}
            sx={{ 
              px: 2,
              py: 1,
            }}
          >
            대량 업로드
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
            sx={{ 
              px: 2,
              py: 1,
            }}
          >
            재료 추가
          </Button>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, maxWidth: '96%', mx: 'auto' }}>
        <TextField
          placeholder="재료 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#FF85A1' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#FFA5B9',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#FF85A1',
              },
            },
          }}
        />
      </Box>

      <TableContainer 
        component={Paper}
        sx={{ 
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          borderRadius: 4,
          overflow: 'hidden',
          maxWidth: '96%',
          mx: 'auto',
        }}
      >
        <Table>
          <TableHead>
            <TableRow
              sx={{
                background: '#FF85A1',
                height: 64,
                '& th': {
                  color: 'white',
                  padding: '20px 16px',
                  fontWeight: 600,
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                  fontSize: '1rem',
                  letterSpacing: '0.5px',
                  borderBottom: 'none',
                  lineHeight: 1.2,
                },
              }}
            >
              <TableCell
                sx={{
                  background: '#FF85A1',
                  height: 64,
                  borderTopLeftRadius: '18px',
                  borderBottom: 'none',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '1rem',
                  p: '20px 16px',
                }}
              >
                <TableSortLabel
                  active={orderBy === 'name'}
                  direction={orderBy === 'name' ? order : 'asc'}
                  onClick={() => handleRequestSort('name')}
                  sx={{ color: 'white !important', '& .MuiTableSortLabel-icon': { color: 'white !important' } }}
                >
                  이름
                </TableSortLabel>
              </TableCell>
              <TableCell
                align="right"
                sx={{
                  background: '#FF85A1',
                  height: 64,
                  borderBottom: 'none',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '1rem',
                  p: '20px 16px',
                }}
              >
                <TableSortLabel
                  active={orderBy === 'cost'}
                  direction={orderBy === 'cost' ? order : 'asc'}
                  onClick={() => handleRequestSort('cost')}
                  sx={{ color: 'white !important', '& .MuiTableSortLabel-icon': { color: 'white !important' } }}
                >
                  비용
                </TableSortLabel>
              </TableCell>
              <TableCell
                align="right"
                sx={{
                  background: '#FF85A1',
                  height: 64,
                  borderBottom: 'none',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '1rem',
                  p: '20px 16px',
                }}
              >
                <TableSortLabel
                  active={orderBy === 'usage_count'}
                  direction={orderBy === 'usage_count' ? order : 'asc'}
                  onClick={() => handleRequestSort('usage_count')}
                  sx={{ color: 'white !important', '& .MuiTableSortLabel-icon': { color: 'white !important' } }}
                >
                  사용 시술수
                </TableSortLabel>
              </TableCell>
              <TableCell
                align="right"
                sx={{
                  background: '#FF85A1',
                  height: 64,
                  borderTopRightRadius: '18px',
                  borderBottom: 'none',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '1rem',
                  p: '20px 16px',
                }}
              >
                작업
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredMaterials.map((material) => (
              <TableRow 
                key={material.id}
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(255, 133, 161, 0.04)',
                  },
                  '& td': {
                    py: 2,
                  },
                }}
              >
                <TableCell sx={{ textAlign: 'center', fontWeight: 700 }}>{material.name}</TableCell>
                <TableCell sx={{ textAlign: 'center', color: '#2E7D32', fontWeight: 600 }}>{material.price?.toLocaleString() || material.cost?.toLocaleString() || 0}원</TableCell>
                <TableCell sx={{ textAlign: 'center' }}>{materialUsageCount[material.name] || 0}</TableCell>
                <TableCell sx={{ textAlign: 'center' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                    <Button
                      variant="contained"
                      color="warning"
                      size="small"
                      onClick={() => handleOpen(material)}
                      sx={{ minWidth: '60px', px: 2 }}
                    >
                      수정
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      size="small"
                      onClick={() => handleDelete(material.id)}
                      sx={{ minWidth: '60px', px: 2 }}
                    >
                      삭제
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{isEditing ? '재료 수정' : '새 재료 추가'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="재료 이름"
            fullWidth
            value={editingMaterial.name || ''}
            onChange={(e) => setEditingMaterial({
              ...editingMaterial,
              name: e.target.value
            })}
          />
          <TextField
            margin="dense"
            label="가격"
            type="number"
            fullWidth
            value={editingMaterial.cost || editingMaterial.price || ''}
            onChange={(e) => setEditingMaterial({
              ...editingMaterial,
              cost: parseInt(e.target.value) || 0,
              price: parseInt(e.target.value) || 0
            })}
          />
          <TextField
            margin="dense"
            label="단위"
            fullWidth
            value={editingMaterial.unit || ''}
            onChange={(e) => setEditingMaterial({
              ...editingMaterial,
              unit: e.target.value
            })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>취소</Button>
          <Button onClick={handleSave} color="primary">
            저장
          </Button>
        </DialogActions>
      </Dialog>

      <BulkUpload
        open={bulkUploadOpen}
        onClose={() => setBulkUploadOpen(false)}
        onSuccess={handleBulkUploadSuccess}
      />
    </div>
  );
}; 