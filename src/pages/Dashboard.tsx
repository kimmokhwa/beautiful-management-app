import { Grid, Card, CardContent, Typography, Box } from '@mui/material';
import {
  TrendingUp as ProfitIcon,
  Inventory as MaterialIcon,
  MedicalServices as ProcedureIcon,
  Timeline as TrendIcon,
} from '@mui/icons-material';

const StatCard = ({ title, value, icon, color }: { title: string; value: string; icon: JSX.Element; color: string }) => (
  <Card>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Box sx={{ 
          backgroundColor: `${color}20`,
          borderRadius: '50%',
          p: 1,
          mr: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {icon}
        </Box>
        <Typography color="textSecondary">{title}</Typography>
      </Box>
      <Typography variant="h5">{value}</Typography>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const stats = [
    {
      title: '오늘의 매출',
      value: '₩850,000',
      icon: <ProfitIcon sx={{ color: '#2196f3' }} />,
      color: '#2196f3'
    },
    {
      title: '재료 소진율',
      value: '75%',
      icon: <MaterialIcon sx={{ color: '#4caf50' }} />,
      color: '#4caf50'
    },
    {
      title: '예약된 시술',
      value: '8건',
      icon: <ProcedureIcon sx={{ color: '#ff9800' }} />,
      color: '#ff9800'
    },
    {
      title: '일일 마진율',
      value: '72.5%',
      icon: <TrendIcon sx={{ color: '#f44336' }} />,
      color: '#f44336'
    }
  ];

  return (
    <Box>
      <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold', fontSize: '2.5rem' }}>
        대시보드
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
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                오늘의 시술 현황
              </Typography>
              <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="textSecondary">차트가 들어갈 자리입니다</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                재료 소진 현황
              </Typography>
              <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="textSecondary">차트가 들어갈 자리입니다</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 