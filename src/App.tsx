import React from 'react';
import { Container, Box, Typography, Paper } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from './styles/theme';
import { MaterialList } from './components/MaterialList';
import { ProcedureList } from './components/ProcedureList';
import { Dashboard } from './components/Dashboard';
// 마이그레이션 기능 비활성화 - 필요시 재활성화
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import CircleIcon from '@mui/icons-material/Circle';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import SearchIcon from '@mui/icons-material/Search';
import Inventory2Icon from '@mui/icons-material/Inventory2';

import InsightsIcon from '@mui/icons-material/Insights';

function App() {
  const [value, setValue] = React.useState(0);

  const handleTabClick = (newValue: number) => {
    setValue(newValue);
  };

  // 마이그레이션 비활성화
  // React.useEffect(() => {
  //   migrateProcedureMaterials();
  // }, []);

  const TabButton = ({ 
    icon, 
    label, 
    isSelected, 
    onClick 
  }: { 
    icon: React.ReactNode; 
    label: string; 
    isSelected: boolean; 
    onClick: () => void; 
  }) => (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        py: 1.5,
        px: 3,
        cursor: 'pointer',
        color: isSelected && value === 2 ? 'white' : isSelected ? '#FF85A1' : '#666',
        backgroundColor: isSelected ? (value === 2 ? '#FF85A1' : 'white') : 'transparent',
        borderRadius: 3,
        transition: 'all 0.3s',
        boxShadow: isSelected ? '0 2px 8px rgba(255, 133, 161, 0.2)' : 'none',
        '&:hover': {
          backgroundColor: isSelected ? (value === 2 ? '#FF85A1' : 'white') : 'rgba(255, 133, 161, 0.08)',
          transform: 'translateY(-1px)',
        },
      }}
    >
      {React.cloneElement(icon as React.ReactElement, {
        sx: { 
          fontSize: '1.25rem',
          color: isSelected && value === 2 ? 'white' : isSelected ? '#FF85A1' : '#666',
          transition: 'color 0.3s',
        }
      })}
      <Typography
        sx={{
          fontSize: '1.25rem',
          fontWeight: 'bold',
          color: isSelected && value === 2 ? 'white' : undefined,
          transition: 'all 0.3s',
        }}
      >
        {label}
      </Typography>
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #FFE5EC 0%, #FFD1DC 100%)',
        pt: 4,
        pb: 4
      }}>
        <Container maxWidth={false} sx={{ maxWidth: '1440px', px: 0 }}>
          <Box sx={{ 
            textAlign: 'center', 
            mb: 4,
            color: '#444',
            maxWidth: '100%',
          }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              justifyContent: 'center',
              mb: 1
            }}>
              <LocalHospitalIcon sx={{ 
                fontSize: '2rem',
                mr: 2,
                backgroundColor: '#FF85A1',
                borderRadius: '12px',
                padding: '8px',
                color: 'white',
                boxShadow: '0 4px 12px rgba(255, 133, 161, 0.3)',
              }} />
              <Typography variant="h4" component="h1" sx={{
                fontWeight: 'bold',
                background: 'linear-gradient(45deg, #FF85A1, #FFA5B9)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: 'none',
              }}>
                미용 시술 원가관리 시스템
              </Typography>
            </Box>
            <Typography variant="subtitle1" sx={{
              mb: 2,
              color: '#666',
              fontWeight: 500,
            }}>
              Advanced Medical Procedure Cost Management System
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '16px',
              padding: '8px 16px',
              width: 'fit-content',
              margin: '0 auto',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
            }}>
              <LocalFireDepartmentIcon sx={{ color: '#FF85A1', mr: 1 }} />
              <Typography variant="body2" component="span" sx={{ 
                mr: 1,
                color: '#666',
                fontWeight: 500,
              }}>
                Supabase 연동됨
              </Typography>
              <CircleIcon sx={{ 
                color: '#4CAF50',
                fontSize: '0.8rem'
              }} />
            </Box>
          </Box>

          <Paper elevation={3} sx={{ 
            backgroundColor: 'white',
            borderRadius: 4,
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            maxWidth: '100%',
            mx: 'auto',
          }}>
            <Box sx={{ 
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              p: 2,
              borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
              backgroundColor: value === 0 ? '#FF85A1' : '#FFF5F7',
              color: value === 0 ? 'white' : 'inherit',
              borderTopLeftRadius: value === 0 ? 18 : 0,
              borderTopRightRadius: value === 0 ? 18 : 0,
              height: value === 0 ? 64 : 'auto',
            }}>
              <TabButton
                icon={<InsightsIcon />}
                label="대시보드"
                isSelected={value === 0}
                onClick={() => handleTabClick(0)}
              />
              <TabButton
                icon={<SearchIcon />}
                label="시술 조회"
                isSelected={value === 1}
                onClick={() => handleTabClick(1)}
              />
              <TabButton
                icon={<Inventory2Icon />}
                label="재료 관리"
                isSelected={value === 2}
                onClick={() => handleTabClick(2)}
              />
            </Box>

            <Box sx={{ p: 4, maxWidth: '100%' }}>
              {value === 0 && <Dashboard />}
              {value === 1 && <ProcedureList />}
              {value === 2 && <MaterialList />}
            </Box>
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App; 