import React, { useState, useEffect } from 'react';
import { Container, Box, Typography } from '@mui/material';
import MaterialTable from '../components/MaterialTable';
import { supabase } from '../supabaseClient';

interface Material {
  id: number;
  name: string;
  price: number;
  usageCount: number;
}

const MaterialsPage: React.FC = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [sortField, setSortField] = useState<keyof Material>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    fetchMaterials();
  }, [sortField, sortDirection]);

  const fetchMaterials = async () => {
    try {
      const { data, error } = await supabase
        .from('materials')
        .select(`
          id,
          name,
          price,
          treatments (id)
        `)
        .order(sortField, { ascending: sortDirection === 'asc' });

      if (error) throw error;

      const materialsWithCount = data.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        usageCount: item.treatments?.length || 0
      }));

      setMaterials(materialsWithCount);
    } catch (error) {
      console.error('재료 목록을 불러오는데 실패했습니다:', error);
    }
  };

  const handleSort = (field: keyof Material) => {
    if (field === sortField) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleEdit = async (id: number) => {
    // TODO: 수정 다이얼로그 구현
    console.log('Edit material:', id);
  };

  const handleDelete = async (id: number) => {
    try {
      const { error } = await supabase
        .from('materials')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setMaterials(prev => prev.filter(material => material.id !== id));
      setSelectedItems(prev => prev.filter(itemId => itemId !== id));
    } catch (error) {
      console.error('재료 삭제에 실패했습니다:', error);
    }
  };

  const handleSelectItem = (id: number) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedItems(prev => 
      prev.length === materials.length
        ? []
        : materials.map(material => material.id)
    );
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          시술 재료 관리
        </Typography>
        <MaterialTable
          materials={materials}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onSort={handleSort}
          sortField={sortField}
          sortDirection={sortDirection}
          selectedItems={selectedItems}
          onSelectItem={handleSelectItem}
          onSelectAll={handleSelectAll}
        />
      </Box>
    </Container>
  );
};

export default MaterialsPage; 