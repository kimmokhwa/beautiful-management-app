import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, Select, MenuItem, FormControl } from '@mui/material';
import TreatmentTable from '../components/TreatmentTable';
import { supabase } from '../lib/supabase';

interface Treatment {
  id: number;
  name: string;
  cost: number;
  usageCount: number;
}

const TreatmentsPage: React.FC = () => {
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [sortField, setSortField] = useState<keyof Treatment>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filter, setFilter] = useState('current');

  useEffect(() => {
    fetchTreatments();
  }, [sortField, sortDirection]);

  const fetchTreatments = async () => {
    try {
      const { data, error } = await supabase
        .from('treatments')
        .select(`
          id,
          name,
          cost,
          usage_count
        `)
        .order(sortField, { ascending: sortDirection === 'asc' });

      if (error) throw error;

      const formattedData = data.map(item => ({
        id: item.id,
        name: item.name,
        cost: item.cost,
        usageCount: item.usage_count || 0
      }));

      setTreatments(formattedData);
    } catch (error) {
      console.error('시술 목록을 불러오는데 실패했습니다:', error);
    }
  };

  const handleSort = (field: keyof Treatment) => {
    if (field === sortField) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography 
          variant="h3" 
          component="h1" 
          gutterBottom
          sx={{ 
            color: '#333',
            fontWeight: 'bold',
            fontSize: '2.5rem',
            mb: 3
          }}
        >
          시술 조회
        </Typography>
        
        <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl sx={{ minWidth: 200 }}>
            <Select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              displayEmpty
              sx={{
                backgroundColor: 'white',
                '& .MuiSelect-select': {
                  py: 1.5,
                  px: 2,
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#e0e0e0',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#bdbdbd',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#2196f3',
                },
              }}
            >
              <MenuItem value="current">현재고리 필터</MenuItem>
              <MenuItem value="all">전체 보기</MenuItem>
              <MenuItem value="active">활성 시술</MenuItem>
              <MenuItem value="inactive">비활성 시술</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <TreatmentTable
          treatments={treatments}
          onSort={handleSort}
          sortField={sortField}
          sortDirection={sortDirection}
        />
      </Box>
    </Container>
  );
};

export default TreatmentsPage; 