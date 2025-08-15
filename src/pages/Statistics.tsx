import { Grid, Paper, Typography, Box } from '@mui/material';
import {
  TrendingUp as ProfitIcon,
  Inventory as MaterialIcon,
  MedicalServices as ProcedureIcon,
  Timeline as TrendIcon,
} from '@mui/icons-material';

const StatCard = ({ title, value, icon, color }: { title: string; value: string; icon: React.ReactNode; color: string }) => (
  <Paper sx={{ p: 3 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      <Box sx={{ 
        backgroundColor: `${color}20`,
        borderRadius: '50%',
        p: 1,
        mr: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {React.cloneElement(icon as React.ReactElement, { sx: { color } })}
      </Box>
      <Typography color="textSecondary">{title}</Typography>
    </Box>
    <Typography variant="h4">{value}</Typography>
  </Paper>
);

const Statistics = () => {
  const stats = [
    {
      title: '이번 달 매출',
      value: '₩12,500,000',
      icon: <ProfitIcon />,
      color: '#2196f3'
    },
    {
      title: '등록된 재료',
      value: '45개',
      icon: <MaterialIcon />,
      color: '#4caf50'
    },
    {
      title: '시술 종류',
      value: '28개',
      icon: <ProcedureIcon />,
      color: '#ff9800'
    },
    {
      title: '평균 마진율',
      value: '68.5%',
      icon: <TrendIcon />,
      color: '#f44336'
    }
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        통계
      </Typography>
      
      <Grid container spacing={3}>
        {stats.map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.title}>
            <StatCard {...stat} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              카테고리별 매출
            </Typography>
            {/* TODO: 차트 컴포넌트 추가 */}
            <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography color="textSecondary">차트가 들어갈 자리입니다</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              월별 매출 추이
            </Typography>
            {/* TODO: 차트 컴포넌트 추가 */}
            <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography color="textSecondary">차트가 들어갈 자리입니다</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Statistics; 