import React, { useEffect, useState, useRef } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  Divider,
  TextField,
  InputAdornment,
  Button,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Procedure, Material, proceduresApi, materialsApi, goalProceduresApi } from '../services/api';
import { supabase } from '../lib/supabase';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Download } from '@mui/icons-material';

const COLORS = ['#FF85A1', '#FFB7B7', '#FFD1DC', '#FFE5EC', '#FFF0F3'];
const CHART_COLORS = ['#FF85A1', '#FFB7B7', '#FFD1DC', '#FFE5EC', '#FFF0F3'];

interface StatCardProps {
  title: string;
  value: string | number;
  color?: string;
  textColor?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, color = '#FF85A1', textColor = 'white' }) => (
  <Paper
    sx={{
      p: 3,
      textAlign: 'center',
      background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
      borderRadius: '16px',
      boxShadow: '0 8px 16px rgba(255, 133, 161, 0.1)',
      transition: 'transform 0.3s ease',
      '&:hover': {
        transform: 'translateY(-5px)',
      },
    }}
  >
    <Typography variant="h6" sx={{ color: textColor, mb: 1, fontWeight: 500 }}>
      {title}
    </Typography>
    <Typography variant="h4" sx={{ color: textColor, fontWeight: 700 }}>
      {value}
    </Typography>
  </Paper>
);

export const Dashboard: React.FC = () => {
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [stats, setStats] = useState({
    totalProcedures: 0,
    totalMaterials: 0,
    averageMarginRate: 0,
    totalRevenue: 0,
    totalCost: 0,
    totalProfit: 0,
  });
  const [categoryStats, setCategoryStats] = useState<{ name: string; count: number }[]>([]);
  const [marginRangeStats, setMarginRangeStats] = useState<{ range: string; count: number }[]>([]);
  const [topProcedures, setTopProcedures] = useState<Procedure[]>([]);
  const [topMaterials, setTopMaterials] = useState<Material[]>([]);
  const [goalSalesCount, setGoalSalesCount] = useState<number>(100);
  const [goalAchieveRate, setGoalAchieveRate] = useState<number>(0);
  const [procedureGoals, setProcedureGoals] = useState<{ [id: number]: number }>({});
  const [goalTop5, setGoalTop5] = useState<{ id: number | null; goal: number }[]>([
    { id: null, goal: 0 },
    { id: null, goal: 0 },
    { id: null, goal: 0 },
    { id: null, goal: 0 },
    { id: null, goal: 0 },
  ]);
  // 마진 TOP5 목표량 상태 추가
  const [marginTop5Goals, setMarginTop5Goals] = useState<{ [procedureId: number]: number }>({});

  // Dashboard 컴포넌트 내부
  // 상담직원 이름/판매량 상태
  const [consultants, setConsultants] = useState<{ name: string; sales: number }[]>([
    { name: '', sales: 0 },
    { name: '', sales: 0 },
    { name: '', sales: 0 },
    { name: '', sales: 0 },
  ]);

  const [saveGoalLoading, setSaveGoalLoading] = useState(false);
  const [saveMarginLoading, setSaveMarginLoading] = useState(false);
  const [saveResult, setSaveResult] = useState<{ open: boolean; success: boolean; message: string }>({ open: false, success: true, message: '' });
  const [pdfLoading, setPdfLoading] = useState(false);
  
  // PDF 출력용 ref
  const pdfContentRef = useRef<HTMLDivElement>(null);

  const loadData = async () => {
    try {
      const [proceduresData, materialsData] = await Promise.all([
        proceduresApi.getAll(),
        materialsApi.getAll()
      ]);
      setProcedures(proceduresData);
      setMaterials(materialsData);

      // 기본 통계 계산
      const totalRevenue = proceduresData.reduce((sum, p) => sum + p.customer_price, 0);
      const totalCost = proceduresData.reduce((sum, p) => sum + p.cost, 0);
      const averageMarginRate = proceduresData.reduce((sum, p) => sum + p.margin_rate, 0) / proceduresData.length;

      setStats({
        totalProcedures: proceduresData.length,
        totalMaterials: materialsData.length,
        averageMarginRate: Number(averageMarginRate.toFixed(2)),
        totalRevenue,
        totalCost,
        totalProfit: totalRevenue - totalCost,
      });

      // 카테고리별 통계
      const categoryCount = proceduresData.reduce((acc, p) => {
        acc[p.category] = (acc[p.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      setCategoryStats(
        Object.entries(categoryCount)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
      );

      // 마진율 범위별 통계
      const marginRanges = proceduresData.reduce((acc, p) => {
        const range = Math.floor(p.margin_rate / 10) * 10;
        const rangeStr = `${range}-${range + 10}%`;
        acc[rangeStr] = (acc[rangeStr] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      setMarginRangeStats(
        Object.entries(marginRanges)
          .map(([range, count]) => ({ range, count }))
          .sort((a, b) => Number(a.range.split('-')[0]) - Number(b.range.split('-')[0]))
      );

      // 상위 시술/재료
      setTopProcedures(
        [...proceduresData]
          .sort((a, b) => b.customer_price - a.customer_price)
          .slice(0, 5)
      );

      setTopMaterials(
        [...materialsData]
          .sort((a, b) => b.cost - a.cost)
          .slice(0, 5)
      );

    } catch (error) {
      console.error('데이터 로딩 중 오류:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // 목표 달성률 계산 (전체 시술 판매량 합산)
    const totalSales = procedures.reduce((sum, p) => sum + (p.sales_count || 0), 0);
    setGoalAchieveRate(goalSalesCount > 0 ? Math.round((totalSales / goalSalesCount) * 100) : 0);
  }, [procedures, goalSalesCount]);

  // 목표/마진 TOP5 불러오기 (type 구분)
  useEffect(() => {
    const fetchGoalTop5 = async () => {
      try {
        const { data, error } = await supabase
          .from('goal_procedures')
          .select('procedure_id, goal_count, type');
        if (error) throw error;
        // goal_top5
        const goalTop5Data = (data || []).filter((item: any) => item.type === 'goal_top5');
        const top5 = Array(5).fill(null).map((_, i) => {
          const item = goalTop5Data[i];
          return item ? { id: item.procedure_id, goal: item.goal_count } : { id: null, goal: 0 };
        });
        setGoalTop5(top5);
        // margin_top5
        const marginTop5Data = (data || []).filter((item: any) => item.type === 'margin_top5');
        const marginGoals: { [procedureId: number]: number } = {};
        marginTop5Data.forEach((item: any) => {
          if (item.procedure_id) marginGoals[item.procedure_id] = item.goal_count;
        });
        setMarginTop5Goals(marginGoals);
      } catch (e) {
        // 무시
      }
    };
    fetchGoalTop5();
  }, []);

  // 마진율 TOP5 시술
  const topMarginProcedures = [...procedures]
    .sort((a, b) => b.margin_rate - a.margin_rate)
    .slice(0, 5);

  // 목표 TOP5 시술 변경 시 Supabase에 저장
  const handleGoalTop5Change = (idx: number, field: 'id' | 'goal', value: number) => {
    const newGoalTop5 = [...goalTop5];
    if (field === 'id' && !value) {
      // 시술 선택 해제 시 텍스트/목표량 모두 초기화
      newGoalTop5[idx] = { id: null, goal: 0 };
    } else {
      newGoalTop5[idx][field] = value;
    }
    setGoalTop5(newGoalTop5);
  };
  // 목표 TOP5만 저장 (독립적)
  const handleSaveGoalTop5 = async () => {
    setSaveGoalLoading(true);
    try {
      // 목표 TOP5만 저장
      const saveList = goalTop5.filter(item => item.id).map(item => ({ procedure_id: item.id!, goal_count: item.goal, type: 'goal_top5' }));
      console.log('목표 TOP5 저장할 데이터:', saveList);
      const { data, error } = await supabase
        .from('goal_procedures')
        .upsert(saveList, { onConflict: 'procedure_id' })
        .select();
      if (error) throw error;
      setSaveResult({ open: true, success: true, message: '목표 TOP5 저장 완료!' });
    } catch (e) {
      setSaveResult({ open: true, success: false, message: '목표 TOP5 저장 실패: ' + (e instanceof Error ? e.message : '알 수 없는 오류') });
    } finally {
      setSaveGoalLoading(false);
    }
  };

  // 마진율 TOP5만 별도 저장하는 핸들러 추가
  const handleSaveMarginTop5 = async () => {
    setSaveMarginLoading(true);
    try {
      const marginSaveList = topMarginProcedures.map(proc => ({
        procedure_id: proc.id,
        goal_count: marginTop5Goals[proc.id] || 0,
        type: 'margin_top5'
      }));
      console.log('마진 TOP5 저장할 데이터:', marginSaveList);
      const { data, error } = await supabase
        .from('goal_procedures')
        .upsert(marginSaveList, { onConflict: 'procedure_id' })
        .select();
      if (error) throw error;
      setSaveResult({ open: true, success: true, message: '마진율 TOP5 저장 완료!' });
    } catch (e) {
      setSaveResult({ open: true, success: false, message: '저장 실패: ' + (e instanceof Error ? e.message : '알 수 없는 오류') });
    } finally {
      setSaveMarginLoading(false);
    }
  };

  // PDF 출력 함수
  const handleExportToPDF = async () => {
    if (!pdfContentRef.current) return;
    
    setPdfLoading(true);
    try {
      // 더 나은 한글 렌더링을 위해 잠시 대기
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const canvas = await html2canvas(pdfContentRef.current, {
        useCORS: true,
        allowTaint: true,
        width: pdfContentRef.current.scrollWidth,
        height: pdfContentRef.current.scrollHeight,
      });
      
      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const currentDate = new Date().toLocaleDateString('ko-KR');
      
      // A4 크기 설정
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // 이미지 크기 계산
      const imgWidth = pageWidth - 20; // 좌우 여백 10mm씩
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // 제목 추가
      pdf.setFont('helvetica');
      pdf.setFontSize(16);
      pdf.text('Beautiful Management System', 10, 15);
      pdf.setFontSize(14);
      pdf.text('TOP5 Procedures Report', 10, 25);
      
      // 현재 날짜 추가
      pdf.setFontSize(10);
      pdf.text(`Generated: ${currentDate}`, 10, 35);
      
      // 이미지 추가
      let yPosition = 45;
      if (imgHeight + yPosition > pageHeight) {
        // 이미지가 페이지를 넘어가면 크기 조정
        const scaledHeight = pageHeight - yPosition - 10;
        const scaledWidth = (canvas.width * scaledHeight) / canvas.height;
        pdf.addImage(imgData, 'PNG', 10, yPosition, scaledWidth, scaledHeight);
      } else {
        pdf.addImage(imgData, 'PNG', 10, yPosition, imgWidth, imgHeight);
      }
      
      // PDF 저장
      pdf.save(`TOP5시술현황_${currentDate.replace(/\./g, '')}.pdf`);
      
      setSaveResult({
        open: true,
        success: true,
        message: 'PDF가 성공적으로 저장되었습니다.',
      });
    } catch (error) {
      console.error('PDF 생성 중 오류:', error);
      setSaveResult({
        open: true,
        success: false,
        message: 'PDF 저장 중 오류가 발생했습니다.',
      });
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3, background: '#FFF5F7' }}>
      {/* PDF 출력 버튼 */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<Download />}
          onClick={handleExportToPDF}
          disabled={pdfLoading}
          sx={{
            background: 'linear-gradient(135deg, #FF85A1 0%, #FF6B8A 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #FF6B8A 0%, #FF5577 100%)',
            },
          }}
        >
          {pdfLoading ? 'PDF 생성 중...' : 'TOP5 시술 PDF 출력'}
        </Button>
      </Box>

      {/* PDF 출력용 숨김 컴포넌트 */}
      <Box
        ref={pdfContentRef}
        sx={{
          position: 'absolute',
          left: '-9999px',
          top: '-9999px',
          width: '800px',
          backgroundColor: 'white',
          padding: '20px',
          fontFamily: '"Noto Sans KR", "Malgun Gothic", "맑은 고딕", sans-serif',
        }}
      >
        <Typography variant="h4" sx={{ mb: 3, textAlign: 'center', fontWeight: 'bold' }}>
          TOP5 시술 현황 리포트
        </Typography>
        
        {/* 목표 TOP5 시술 테이블 */}
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: '#FF85A1' }}>
          목표 TOP5 시술
        </Typography>
        <TableContainer component={Paper} sx={{ mb: 4 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#FF85A1' }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>순위</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>시술명</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>목표 판매량</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {goalTop5
                .filter(item => item.id && item.goal > 0)
                .map((item, index) => {
                  const procedure = procedures.find(p => p.id === item.id);
                  return (
                    <TableRow key={index}>
                      <TableCell sx={{ textAlign: 'center', fontWeight: 'bold' }}>{index + 1}</TableCell>
                      <TableCell>{procedure?.name || '시술명'}</TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>{item.goal}회</TableCell>
                    </TableRow>
                  );
                })
              }
              {goalTop5.filter(item => item.id && item.goal > 0).length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} sx={{ textAlign: 'center', color: '#666' }}>
                    설정된 목표 시술이 없습니다.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* 마진율 TOP5 시술 테이블 */}
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: '#FF85A1' }}>
          마진율 TOP5 시술
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#FF85A1' }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>순위</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>시술명</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>마진율</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>고객가</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>목표 판매량</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {topMarginProcedures.map((procedure, index) => (
                <TableRow key={procedure.id}>
                  <TableCell sx={{ textAlign: 'center', fontWeight: 'bold' }}>{index + 1}</TableCell>
                  <TableCell>{procedure.name}</TableCell>
                  <TableCell>{procedure.margin_rate}%</TableCell>
                  <TableCell>{procedure.customer_price.toLocaleString()}원</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>{marginTop5Goals[procedure.id] || 0}회</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      
      {/* 목표 TOP5/마진율 TOP5 시술 최상단 배치 */}
      <Box 
        sx={{
          fontFamily: '"Noto Sans KR", "Malgun Gothic", "맑은 고딕", sans-serif',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          textRendering: 'optimizeLegibility',
        }}
      >
        <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* 목표 TOP5 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="목표 TOP5 시술" />
            <CardContent>
              <List>
                {goalTop5.map((item, idx) => (
                  <React.Fragment key={idx}>
                    <ListItem sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Select
                        value={item.id ?? ''}
                        onChange={e => handleGoalTop5Change(idx, 'id', Number(e.target.value))}
                        displayEmpty
                        sx={{ minWidth: 180 }}
                      >
                        <MenuItem value="">시술 선택</MenuItem>
                        {procedures.map(p => (
                          <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                        ))}
                      </Select>
                      <TextField
                        label="목표 판매량"
                        type="number"
                        size="small"
                        value={item.goal}
                        onChange={e => handleGoalTop5Change(idx, 'goal', Number(e.target.value))}
                        sx={{ width: 100 }}
                        disabled={!item.id}
                      />
                    </ListItem>
                    {idx < goalTop5.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
            <Box sx={{ textAlign: 'right', mt: 2 }}>
              <Button variant="contained" color="primary" onClick={handleSaveGoalTop5} disabled={saveGoalLoading}>
                {saveGoalLoading ? '저장 중...' : '목표 TOP5 저장'}
              </Button>
            </Box>
          </Card>
        </Grid>
        {/* 마진율 TOP5 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="마진율 TOP5 시술" />
            <CardContent>
              <List>
                {topMarginProcedures.map((procedure, index) => (
                  <React.Fragment key={procedure.id}>
                    <ListItem sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <ListItemText
                        primary={procedure.name}
                        secondary={`마진율: ${procedure.margin_rate}% (고객가: ${procedure.customer_price.toLocaleString()}원)`}
                      />
                      <TextField
                        label="목표 판매량"
                        type="number"
                        size="small"
                        value={marginTop5Goals[procedure.id] ?? ''}
                        onChange={e => setMarginTop5Goals(goals => ({ ...goals, [procedure.id]: Number(e.target.value) }))}
                        sx={{ width: 100 }}
                      />
                    </ListItem>
                    {index < topMarginProcedures.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
            <Box sx={{ textAlign: 'right', mt: 2 }}>
              <Button variant="contained" color="primary" onClick={handleSaveMarginTop5} disabled={saveMarginLoading}>
                {saveMarginLoading ? '저장 중...' : '마진율 TOP5 저장'}
              </Button>
            </Box>
          </Card>
        </Grid>
      </Grid>
      </Box>
      {/* 목표 판매량/달성률 영역 숨김 처리
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <TextField
            label="목표 판매량"
            type="number"
            value={goalSalesCount}
            onChange={e => setGoalSalesCount(Number(e.target.value))}
            InputProps={{ endAdornment: <InputAdornment position="end">건</InputAdornment> }}
            sx={{ width: 200 }}
          />
          <Typography variant="h6" color={goalAchieveRate >= 100 ? 'primary' : 'textSecondary'}>
            달성률: {goalAchieveRate}%
          </Typography>
        </Box>
      </Box>
      */}
      {/* 주요 지표 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="총 시술 수"
            value={stats.totalProcedures}
            color="#FF85A1"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="총 재료 수"
            value={stats.totalMaterials}
            color="#FF9EBA"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="평균 마진율"
            value={`${stats.averageMarginRate}%`}
            color="#FFB7D3"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="최고 마진율"
            value="98.18%"
            color="#28a745"
          />
        </Grid>
      </Grid>

      {/* 차트 및 목록 */}
      <Grid container spacing={3}>
        {/* 카테고리별 시술 수 */}
        <Grid item xs={12} md={6}>
          <Card sx={{
            borderRadius: '16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            background: 'white',
          }}>
            <CardHeader 
              title="카테고리별 시술 수" 
              sx={{
                '& .MuiCardHeader-title': {
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  color: '#2D3748',
                },
                borderBottom: '1px solid #EDF2F7',
                p: 3,
              }}
            />
            <CardContent sx={{ p: 3 }}>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={categoryStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#EDF2F7" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: '#718096' }}
                      axisLine={{ stroke: '#CBD5E0' }}
                    />
                    <YAxis 
                      tick={{ fill: '#718096' }}
                      axisLine={{ stroke: '#CBD5E0' }}
                    />
                    <Tooltip 
                      contentStyle={{
                        background: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      }}
                    />
                    <Bar 
                      dataKey="count" 
                      fill="#FF85A1"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </Grid>

        {/* 마진율 분포 */}
        <Grid item xs={12} md={6}>
          <Card sx={{
            borderRadius: '16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            background: 'white',
          }}>
            <CardHeader 
              title="마진율 분포" 
              sx={{
                '& .MuiCardHeader-title': {
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  color: '#2D3748',
                },
                borderBottom: '1px solid #EDF2F7',
                p: 3,
              }}
            />
            <CardContent sx={{ p: 3 }}>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={marginRangeStats}
                      dataKey="count"
                      nameKey="range"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {marginRangeStats.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={CHART_COLORS[index % CHART_COLORS.length]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        background: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </Grid>

        {/* 상위 시술 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="매출액 상위 시술" />
            <CardContent>
              <List>
                {topProcedures.map((procedure, index) => (
                  <React.Fragment key={procedure.id}>
                    <ListItem>
                      <ListItemText
                        primary={procedure.name}
                        secondary={`${procedure.customer_price.toLocaleString()}원 (마진율: ${procedure.margin_rate}%)`}
                      />
                    </ListItem>
                    {index < topProcedures.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* 상위 재료 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="비용 상위 재료" />
            <CardContent>
              <List>
                {topMaterials.map((material, index) => (
                  <React.Fragment key={material.id}>
                    <ListItem>
                      <ListItemText
                        primary={material.name}
                        secondary={`${material.cost.toLocaleString()}원`}
                      />
                    </ListItem>
                    {index < topMaterials.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Snackbar open={saveResult.open} autoHideDuration={2000} onClose={() => setSaveResult(r => ({ ...r, open: false }))} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={() => setSaveResult(r => ({ ...r, open: false }))} severity={saveResult.success ? 'success' : 'error'} sx={{ width: '100%' }}>
          {saveResult.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}; 