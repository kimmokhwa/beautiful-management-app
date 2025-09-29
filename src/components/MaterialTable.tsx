import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  Button,
  Box,
} from '@mui/material';

interface Material {
  id: number;
  name: string;
  price: number;
  usageCount: number;
}

interface MaterialTableProps {
  materials: Material[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onSort: (field: keyof Material) => void;
  sortField?: keyof Material;
  sortDirection: 'asc' | 'desc';
  selectedItems: number[];
  onSelectItem: (id: number) => void;
  onSelectAll: () => void;
}

const MaterialTable: React.FC<MaterialTableProps> = ({
  materials,
  onEdit,
  onDelete,
  onSort,
  sortField,
  sortDirection,
  selectedItems,
  onSelectItem,
}) => {
  const formatPrice = (price: number) => {
    return `₩${price.toLocaleString()}`;
  };

  return (
    <TableContainer 
      component={Paper} 
      sx={{ 
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
        borderRadius: 2,
      }}
    >
      <Table>
        <TableHead>
          <TableRow>
            <TableCell 
              padding="checkbox"
              sx={{
                backgroundColor: '#2196f3',
                color: 'white',
              }}
            >
              <Checkbox
                color="default"
                sx={{
                  color: 'white',
                  '&.Mui-checked': {
                    color: 'white',
                  },
                }}
              />
            </TableCell>
            <TableCell 
              onClick={() => onSort('name')}
              sx={{
                backgroundColor: '#2196f3',
                color: 'white',
                cursor: 'pointer',
                fontWeight: 'bold',
                '&:hover': {
                  backgroundColor: '#1976d2',
                },
              }}
            >
              재료명 {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
            </TableCell>
            <TableCell 
              align="center"
              sx={{
                backgroundColor: '#2196f3',
                color: 'white',
                fontWeight: 'bold',
              }}
            >
              원가
            </TableCell>
            <TableCell 
              align="center"
              sx={{
                backgroundColor: '#2196f3',
                color: 'white',
                fontWeight: 'bold',
              }}
            >
              사용 시술 수
            </TableCell>
            <TableCell 
              align="center"
              sx={{
                backgroundColor: '#2196f3',
                color: 'white',
                fontWeight: 'bold',
              }}
            >
              작업
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {materials.map((material) => (
            <TableRow 
              key={material.id}
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                },
              }}
            >
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectedItems.includes(material.id)}
                  onChange={() => onSelectItem(material.id)}
                  color="primary"
                />
              </TableCell>
              <TableCell>{material.name}</TableCell>
              <TableCell align="center" sx={{ 
                color: '#2E7D32',
                fontWeight: 600,
              }}>
                {formatPrice(material.price)}
              </TableCell>
              <TableCell align="center">{material.usageCount}개 시술</TableCell>
              <TableCell align="center">
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                  <Button
                    variant="contained"
                    color="warning"
                    size="small"
                    onClick={() => onEdit(material.id)}
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
                    onClick={() => onDelete(material.id)}
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
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default MaterialTable; 