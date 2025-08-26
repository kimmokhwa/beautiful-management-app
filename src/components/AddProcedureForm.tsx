import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Card,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { addProcedure } from '../supabase';

interface Material {
  name: string;
  quantity: string;
}

export const AddProcedureForm: React.FC = () => {
  const [category, setCategory] = useState('');
  const [name, setName] = useState('');
  const [customerPrice, setCustomerPrice] = useState('');
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddMaterial = () => {
    if (selectedMaterial && quantity) {
      setMaterials([...materials, { name: selectedMaterial, quantity }]);
      setSelectedMaterial('');
      setQuantity('');
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !name || !customerPrice) return;

    try {
      setLoading(true);
      await addProcedure({
        category,
        name,
        customer_price: parseInt(customerPrice),
        materials: materials.map(m => `${m.name} ${m.quantity}`),
      });
      
      // 폼 초기화
      setCategory('');
      setName('');
      setCustomerPrice('');
      setMaterials([]);
    } catch (error) {
      console.error('시술 추가 중 오류 발생:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ 
      borderRadius: '18px',
      boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
      background: 'white',
      p: { xs: 2, sm: 4 },
      maxWidth: 1100,
      mx: 'auto',
      mt: 3
    }}>
      <Box sx={{
        mb: 3,
        background: '#FF85A1',
        color: 'white',
        borderTopLeftRadius: '18px',
        borderTopRightRadius: '18px',
        height: 64,
        display: 'flex',
        alignItems: 'center',
        pl: 4,
        fontWeight: 700,
        fontSize: '1.35rem',
        letterSpacing: '0.5px',
      }}>
        <span style={{ color: 'white', fontSize: '1.6rem', fontWeight: 900, marginRight: 12 }}>＋</span>
        새 시술 추가
      </Box>

      <form onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* 입력 필드 3개 한 줄 */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 3 }}>
            <TextField
              label="분류"
              placeholder="예: 리프팅, 보톡스, 필러"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                },
              }}
            />
            <TextField
              label="시술명"
              placeholder="시술명을 입력하세요"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                },
              }}
            />
            <TextField
              label="고객가 (원)"
              placeholder="고객에게 청구할 가격"
              type="number"
              value={customerPrice}
              onChange={(e) => setCustomerPrice(e.target.value)}
              required
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                },
              }}
            />
          </Box>

          {/* 시술 구성 재료 영역 */}
          <Box sx={{ 
            border: '2px dashed #7ec4fa',
            borderRadius: '10px',
            p: 2,
            backgroundColor: '#fafdff',
            mb: 1
          }}>
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>시술 구성 재료</Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                placeholder="재료를 선택하세요"
                value={selectedMaterial}
                onChange={(e) => setSelectedMaterial(e.target.value)}
                fullWidth
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
              />
              <TextField
                placeholder="자동 계산됨"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                sx={{ width: 200, '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                disabled
              />
              <Button
                variant="contained"
                color="error"
                onClick={handleAddMaterial}
                disabled={!selectedMaterial || !quantity}
                sx={{
                  borderRadius: '8px',
                  px: 3,
                  fontWeight: 600,
                  ml: 'auto',
                  minWidth: 80
                }}
              >
                삭제
              </Button>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddMaterial}
              sx={{
                mt: 2,
                background: '#22b573',
                color: 'white',
                fontWeight: 700,
                borderRadius: '8px',
                px: 3,
                boxShadow: 'none',
                '&:hover': {
                  background: '#1e9e5b',
                },
              }}
            >
              + 재료 추가
            </Button>
          </Box>

          {/* 총 원가/마진/마진율 한 줄 */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 3 }}>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>총 원가</Typography>
              <TextField
                value="자동 계산됨"
                disabled
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                  },
                  '& .MuiInputBase-input': {
                    color: '#2E7D32',
                    fontWeight: 700,
                  },
                }}
              />
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>마진</Typography>
              <TextField
                value="자동 계산됨"
                disabled
                fullWidth
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
              />
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>마진율 (%)</Typography>
              <TextField
                value="자동 계산됨"
                disabled
                fullWidth
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
              />
            </Box>
          </Box>

          {/* 저장 버튼 */}
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading || !category || !name || !customerPrice}
            sx={{
              mt: 3,
              py: 2,
              backgroundColor: '#4ea1f7',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '1.1rem',
              boxShadow: 'none',
              '&:hover': {
                backgroundColor: '#3498db',
              },
            }}
          >
            <span role="img" aria-label="save" style={{ marginRight: 8 }}>💾</span> 시술 저장
          </Button>
        </Box>
      </form>
    </Card>
  );
};

export default AddProcedureForm;