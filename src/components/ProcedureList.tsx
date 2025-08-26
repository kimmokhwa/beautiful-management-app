import React, { useEffect, useState } from 'react';
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Box,
  InputAdornment,
  TableSortLabel,
  Checkbox,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { Procedure, Material, proceduresApi, materialsApi } from '../services/api';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Upload as UploadIcon } from '@mui/icons-material';
import { BulkUpload } from './BulkUpload';
import { Typography } from '@mui/material';
import { Box as MuiBox } from '@mui/material';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

type Order = 'asc' | 'desc';

export const ProcedureList: React.FC<{ showDownloadButton?: boolean }> = ({ showDownloadButton = true }) => {
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [filteredProcedures, setFilteredProcedures] = useState<Procedure[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [open, setOpen] = useState(false);
  const [editingProcedure, setEditingProcedure] = useState<Partial<Procedure>>({
    materials: []
  });
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [orderBy, setOrderBy] = useState<keyof Procedure>('name');
  const [order, setOrder] = useState<Order>('asc');
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);

  const loadData = async () => {
    try {
      const [proceduresData, materialsData] = await Promise.all([
        proceduresApi.getAll(),
        materialsApi.getAll()
      ]);
      setProcedures(proceduresData);
      setFilteredProcedures(proceduresData);
      setMaterials(materialsData);
    } catch (error) {
      console.error('데이터 로딩 중 오류:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    let filtered = [...procedures];
    
    // 검색어 필터링
    if (searchTerm) {
      filtered = filtered.filter(procedure =>
        procedure.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        procedure.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // 카테고리 필터링
    if (categoryFilter) {
      filtered = filtered.filter(procedure =>
        procedure.category === categoryFilter
      );
    }

    setFilteredProcedures(filtered);
  }, [searchTerm, categoryFilter, procedures]);

  useEffect(() => {
    if (open && editingProcedure.materials && materials.length > 0) {
      const totalCost = (editingProcedure.materials as string[]).reduce((sum, matName) => {
        const mat = materials.find(m => m.name === matName);
        return sum + (mat?.cost || 0);
      }, 0);
      setEditingProcedure(prev => ({ ...prev, cost: totalCost }));
    }
    // eslint-disable-next-line
  }, [editingProcedure.materials, materials, open]);

  useEffect(() => {
    const cost = editingProcedure.cost || 0;
    const customerPrice = editingProcedure.customer_price || 0;
    const margin = customerPrice - cost;
    const marginRate = customerPrice > 0 ? (margin / customerPrice) * 100 : 0;
    setEditingProcedure(prev => ({
      ...prev,
      margin,
      margin_rate: Number(marginRate.toFixed(2))
    }));
  }, [editingProcedure.cost, editingProcedure.customer_price]);

  const handleRequestSort = (property: keyof Procedure) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);

    const sorted = [...filteredProcedures].sort((a, b) => {
      if (property === 'customer_price' || property === 'cost' || property === 'margin' || property === 'margin_rate') {
        return ((a[property] || 0) - (b[property] || 0)) * (isAsc ? 1 : -1);
      }
      const aValue = a[property]?.toString() || '';
      const bValue = b[property]?.toString() || '';
      return (aValue < bValue ? -1 : 1) * (isAsc ? 1 : -1);
    });
    setFilteredProcedures(sorted);
  };

  const uniqueCategories = Array.from(new Set(procedures.map(p => p.category)));

  const handleOpen = (procedure?: Procedure) => {
    if (procedure) {
      setEditingProcedure(procedure);
      setIsEditing(true);
    } else {
      setEditingProcedure({ materials: [] });
      setIsEditing(false);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingProcedure({ materials: [] });
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      if (isEditing && editingProcedure.id) {
        await proceduresApi.update(editingProcedure.id, editingProcedure);
      } else {
        await proceduresApi.create(editingProcedure as Omit<Procedure, 'id'>);
      }
      handleClose();
      loadData();
    } catch (error) {
      console.error('시술 저장 중 오류:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('이 시술을 삭제하시겠습니까?')) {
      try {
        await proceduresApi.delete(id);
        loadData();
      } catch (error) {
        console.error('시술 삭제 중 오류:', error);
      }
    }
  };

  const calculateMargin = (customerPrice: number, cost: number) => {
    const margin = customerPrice - cost;
    const marginRate = (margin / customerPrice) * 100;
    return {
      margin,
      margin_rate: Number(marginRate.toFixed(2))
    };
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const customerPrice = parseInt(e.target.value) || 0;
    const cost = editingProcedure.cost || 0;
    setEditingProcedure({
      ...editingProcedure,
      customer_price: customerPrice,
      ...calculateMargin(customerPrice, cost)
    });
  };

  const handleCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cost = parseInt(e.target.value) || 0;
    const customerPrice = editingProcedure.customer_price || 0;
    setEditingProcedure({
      ...editingProcedure,
      cost,
      ...calculateMargin(customerPrice, cost)
    });
  };

  const handleBulkUploadSuccess = () => {
    loadData();
    setBulkUploadOpen(false);
  };

  // 엑셀 다운로드 함수 추가
  const handleDownloadXLSX = () => {
    const header = ['시술명', '판매량', '고객가', '원가', '마진', '마진율', '사용재료'];
    const rows = filteredProcedures.map(procedure => [
      procedure.name,
      procedure.sales_count ?? 0,
      procedure.customer_price,
      procedure.cost,
      procedure.margin,
      procedure.margin_rate,
      (procedure.materials || []).join(' ')
    ]);
    const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '시술 리스트');
    XLSX.writeFile(wb, '시술_리스트.xlsx');
  };

  return (
    <div>
      <MuiBox sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, maxWidth: '96%', mx: 'auto' }}>
        <Typography variant="h5">시술 관리</Typography>
        <MuiBox>
          {/* 엑셀 다운로드 버튼을 props.showDownloadButton === true일 때만 렌더링하도록 조건부 처리 */}
          {/* export const ProcedureList = ({ showDownloadButton = true }) => { ... } */}
          {showDownloadButton && (
            <Button
              variant="outlined"
              color="success"
              onClick={handleDownloadXLSX}
              sx={{ px: 2, py: 1, mr: 1 }}
            >
              엑셀 다운로드
            </Button>
          )}
          <Button
            variant="outlined"
            startIcon={<UploadIcon />}
            onClick={() => setBulkUploadOpen(true)}
            sx={{ mr: 1 }}
          >
            대량 업로드
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
          >
            새 시술 추가
          </Button>
        </MuiBox>
      </MuiBox>

      <Box sx={{ display: 'flex', gap: 2, mb: 2, maxWidth: '96%', mx: 'auto' }}>
        <TextField
          placeholder="시술 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <FormControl sx={{ minWidth: 200 }}>
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            displayEmpty
          >
            <MenuItem value="">전체</MenuItem>
            {uniqueCategories.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper} sx={{ maxWidth: '96%', mx: 'auto' }}>
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
              <TableCell sx={{ background: '#FF85A1', height: 64, borderBottom: 'none', color: 'white', fontWeight: 600, fontSize: '1rem', p: '20px 16px', textAlign: 'center', width: '20%' }}>
                <TableSortLabel
                  active={orderBy === 'name'}
                  direction={orderBy === 'name' ? order : 'asc'}
                  onClick={() => handleRequestSort('name')}
                  sx={{ color: 'white !important', '& .MuiTableSortLabel-icon': { color: 'white !important' } }}
                >
                  이름
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ background: '#FF85A1', height: 64, borderBottom: 'none', color: 'white', fontWeight: 600, fontSize: '1rem', p: '20px 16px', textAlign: 'center' }}>
                <TableSortLabel
                  active={orderBy === 'sales_count'}
                  direction={orderBy === 'sales_count' ? order : 'asc'}
                  onClick={() => handleRequestSort('sales_count')}
                  sx={{ color: 'white !important', '& .MuiTableSortLabel-icon': { color: 'white !important' } }}
                >
                  판매량
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ background: '#FF85A1', height: 64, borderBottom: 'none', color: 'white', fontWeight: 600, fontSize: '1rem', p: '20px 16px', textAlign: 'center' }}>
                <TableSortLabel
                  active={orderBy === 'customer_price'}
                  direction={orderBy === 'customer_price' ? order : 'asc'}
                  onClick={() => handleRequestSort('customer_price')}
                  sx={{ color: 'white !important', '& .MuiTableSortLabel-icon': { color: 'white !important' } }}
                >
                  고객가
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ background: '#FF85A1', height: 64, borderBottom: 'none', color: 'white', fontWeight: 600, fontSize: '1rem', p: '20px 16px', textAlign: 'center' }}>
                <TableSortLabel
                  active={orderBy === 'cost'}
                  direction={orderBy === 'cost' ? order : 'asc'}
                  onClick={() => handleRequestSort('cost')}
                  sx={{ color: 'white !important', '& .MuiTableSortLabel-icon': { color: 'white !important' } }}
                >
                  원가
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ background: '#FF85A1', height: 64, borderBottom: 'none', color: 'white', fontWeight: 600, fontSize: '1rem', p: '20px 16px', textAlign: 'center' }}>
                <TableSortLabel
                  active={orderBy === 'margin'}
                  direction={orderBy === 'margin' ? order : 'asc'}
                  onClick={() => handleRequestSort('margin')}
                  sx={{ color: 'white !important', '& .MuiTableSortLabel-icon': { color: 'white !important' } }}
                >
                  마진
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ background: '#FF85A1', height: 64, borderBottom: 'none', color: 'white', fontWeight: 600, fontSize: '1rem', p: '20px 16px', textAlign: 'center' }}>
                <TableSortLabel
                  active={orderBy === 'margin_rate'}
                  direction={orderBy === 'margin_rate' ? order : 'asc'}
                  onClick={() => handleRequestSort('margin_rate')}
                  sx={{ color: 'white !important', '& .MuiTableSortLabel-icon': { color: 'white !important' } }}
                >
                  마진율
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ background: '#FF85A1', height: 64, borderBottom: 'none', color: 'white', fontWeight: 600, fontSize: '0.8em', p: '20px 16px', textAlign: 'center', width: '20%' }}>
                <TableSortLabel
                  active={orderBy === 'materials'}
                  direction={orderBy === 'materials' ? order : 'asc'}
                  onClick={() => handleRequestSort('materials')}
                  sx={{ color: 'white !important', '& .MuiTableSortLabel-icon': { color: 'white !important' } }}
                >
                  사용 재료
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ background: '#FF85A1', height: 64, borderTopRightRadius: '18px', borderBottom: 'none', color: 'white', fontWeight: 600, fontSize: '1rem', p: '20px 16px', textAlign: 'center' }}>작업</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProcedures.map((procedure) => (
              <TableRow key={procedure.id}>
                <TableCell sx={{ textAlign: 'center', fontWeight: 700 }}>{procedure.name}</TableCell>
                <TableCell sx={{ textAlign: 'center' }}>{procedure.sales_count ?? 0}</TableCell>
                <TableCell sx={{ textAlign: 'center' }} align="right">{(procedure.customer_price || 0).toLocaleString()}원</TableCell>
                <TableCell sx={{ textAlign: 'center', color: '#2E7D32', fontWeight: 600 }}>
                  {(procedure.cost || 0).toLocaleString()}원
                </TableCell>
                <TableCell sx={{ textAlign: 'center' }} align="right">{(procedure.margin || 0).toLocaleString()}원</TableCell>
                <TableCell sx={{ textAlign: 'center' }} align="right">{procedure.margin_rate || 0}%</TableCell>
                <TableCell sx={{ textAlign: 'center', fontSize: '0.8em', width: '20%' }}>
                  {(procedure.materials || []).map((material, index) => (
                    <Chip key={index} label={material} sx={{ m: 0.1, fontSize: '0.8em', fontWeight: 700 }} />
                  ))}
                </TableCell>
                <TableCell sx={{ textAlign: 'center' }} align="right">
                  <Button
                    variant="contained"
                    color="warning"
                    size="small"
                    onClick={() => handleOpen(procedure)}
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

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{isEditing ? '시술 수정' : '새 시술 추가'}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>카테고리</InputLabel>
            <Select
              value={editingProcedure.category || ''}
              onChange={e => setEditingProcedure({ ...editingProcedure, category: e.target.value })}
              label="카테고리"
            >
              {uniqueCategories.map((category) => (
                <MenuItem key={category} value={category}>{category}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="시술명"
            fullWidth
            value={editingProcedure.name || ''}
            onChange={e => setEditingProcedure({ ...editingProcedure, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="판매량"
            type="number"
            value={editingProcedure.sales_count ?? 0}
            onChange={e => setEditingProcedure({ ...editingProcedure, sales_count: parseInt(e.target.value) || 0 })}
            fullWidth
          />
          <TextField
            margin="dense"
            label="고객가"
            type="number"
            fullWidth
            value={editingProcedure.customer_price || ''}
            onChange={handlePriceChange}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>사용 재료</InputLabel>
            <Select
              multiple
              value={editingProcedure.materials || []}
              onChange={e => setEditingProcedure({ ...editingProcedure, materials: e.target.value as string[] })}
              renderValue={selected => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {(selected as string[]).map((value) => (
                    <Chip key={value} label={value} />
                  ))}
                </Box>
              )}
              MenuProps={{
                PaperProps: {
                  sx: {
                    '& .Mui-selected': {
                      backgroundColor: '#FF85A1 !important',
                      color: 'white',
                    },
                  },
                },
              }}
            >
              {materials.map((material) => (
                <MenuItem key={material.id} value={material.name} selected={(editingProcedure.materials || []).includes(material.name)}>
                  {material.name}
                  <Checkbox checked={(editingProcedure.materials || []).includes(material.name)} sx={{ color: '#FF85A1', '&.Mui-checked': { color: '#FF85A1' } }} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="원가"
            type="number"
            value={editingProcedure.cost || ''}
            fullWidth
            disabled
            sx={{ '& .MuiInputBase-input': { color: '#2E7D32', fontWeight: 600 } }}
          />
          <TextField
            margin="dense"
            label="마진"
            type="number"
            fullWidth
            value={editingProcedure.margin || ''}
            disabled
          />
          <TextField
            margin="dense"
            label="마진율"
            type="number"
            fullWidth
            value={editingProcedure.margin_rate || ''}
            disabled
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