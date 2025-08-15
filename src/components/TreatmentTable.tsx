import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Box,
} from '@mui/material';

interface Treatment {
  id: number;
  name: string;
  cost: number;
  usageCount: number;
}

interface TreatmentTableProps {
  treatments: Treatment[];
  onSort: (field: keyof Treatment) => void;
  sortField?: keyof Treatment;
  sortDirection: 'asc' | 'desc';
}

const TreatmentTable: React.FC<TreatmentTableProps> = ({
  treatments,
  onSort,
  sortField,
  sortDirection,
}) => {
  const formatPrice = (price: number) => {
    return `${price.toLocaleString()}원`;
  };

  return (
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
          <TableRow sx={{ 
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
            '&:first-of-type': {
              borderTopLeftRadius: '18px',
            },
            '&:last-of-type': {
              borderTopRightRadius: '18px',
            },
          }}>
            <TableCell 
              sx={{ 
                cursor: 'pointer',
                background: '#FF85A1',
                height: 64,
                borderTopLeftRadius: '18px',
                borderBottom: 'none',
              }}
              onClick={() => onSort('name')}
            >
              시술명 {sortField === 'name' && (
                <span style={{ marginLeft: '4px', fontSize: '0.8rem' }}>
                  {sortDirection === 'asc' ? '↑' : '↓'}
                </span>
              )}
            </TableCell>
            <TableCell align="center" sx={{ background: '#FF85A1', height: 64, borderBottom: 'none' }}>
              비용
            </TableCell>
            <TableCell align="center" sx={{ background: '#FF85A1', height: 64, borderTopRightRadius: '18px', borderBottom: 'none' }}>
              작업
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {treatments.map((treatment, index) => (
            <TableRow
              key={treatment.id}
              sx={{
                backgroundColor: index % 2 === 0 ? '#fafafa' : 'white',
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                  transform: 'translateY(-1px)',
                  transition: 'all 0.2s'
                },
                '& td': {
                  borderBottom: '1px solid #e0e0e0',
                  padding: '12px 16px'
                }
              }}
            >
              <TableCell sx={{ 
                textAlign: 'center', 
                color: '#333',
                fontWeight: 500
              }}>
                {treatment.name}
              </TableCell>
              <TableCell align="center" sx={{ 
                color: '#00796b',
                fontWeight: 600,
                fontSize: '0.95rem'
              }}>
                {formatPrice(treatment.cost)}
              </TableCell>
              <TableCell align="center">
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  gap: 1 
                }}>
                  <Button
                    variant="contained"
                    color="warning"
                    size="small"
                    onClick={() => {/* TODO: Add edit handler */}}
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
                    onClick={() => {/* TODO: Add delete handler */}}
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

export default TreatmentTable; 