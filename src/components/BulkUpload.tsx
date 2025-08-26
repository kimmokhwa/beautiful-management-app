import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Tab,
  Tabs,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import * as XLSX from 'xlsx';
import { Material, Procedure, materialsApi, proceduresApi } from '../services/api';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

interface BulkUploadProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const BulkUpload: React.FC<BulkUploadProps> = ({ open, onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setError(null);
    setSuccess(null);
    setValidationErrors([]);
  };

  const validateMaterials = (materials: any[]): string[] => {
    const errors: string[] = [];
    materials.forEach((material, index) => {
      if (!material.name) {
        errors.push(`행 ${index + 2}: 재료명이 없습니다.`);
      }
      if (isNaN(material.cost) || material.cost < 0) {
        errors.push(`행 ${index + 2}: 비용이 유효하지 않습니다.`);
      }
    });
    return errors;
  };

  const validateProcedures = (procedures: any[]): string[] => {
    const errors: string[] = [];
    procedures.forEach((procedure, index) => {
      if (!procedure.name) {
        errors.push(`행 ${index + 2}: 시술명이 없습니다.`);
      }
      if (!procedure.category) {
        errors.push(`행 ${index + 2}: 카테고리가 없습니다.`);
      }
      if (isNaN(procedure.customer_price) || procedure.customer_price < 0) {
        errors.push(`행 ${index + 2}: 고객 가격이 유효하지 않습니다.`);
      }
      if (isNaN(procedure.cost) || procedure.cost < 0) {
        errors.push(`행 ${index + 2}: 비용이 유효하지 않습니다.`);
      }
    });
    return errors;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      setValidationErrors([]);

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          if (activeTab === 0) { // 재료 업로드
            const errors = validateMaterials(jsonData);
            if (errors.length > 0) {
              setValidationErrors(errors);
              return;
            }

            const materials = jsonData.map((row: any) => ({
              name: row.name,
              cost: Number(row.cost),
            }));

            await Promise.all(materials.map(material => materialsApi.create(material)));
            setSuccess(`${materials.length}개의 재료가 성공적으로 업로드되었습니다.`);
          } else { // 시술 업로드
            const errors = validateProcedures(jsonData);
            if (errors.length > 0) {
              setValidationErrors(errors);
              return;
            }

            const procedures = jsonData.map((row: any) => ({
              name: row.name,
              category: row.category,
              customer_price: Number(row.customer_price),
              cost: Number(row.cost),
              materials: [], // 초기에는 빈 배열로 설정
            }));

            await Promise.all(procedures.map(procedure => proceduresApi.create(procedure)));
            setSuccess(`${procedures.length}개의 시술이 성공적으로 업로드되었습니다.`);
          }

          onSuccess();
        } catch (error) {
          console.error('파일 처리 중 오류:', error);
          setError('파일 처리 중 오류가 발생했습니다.');
        }
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('파일 업로드 중 오류:', error);
      setError('파일 업로드 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const wb = XLSX.utils.book_new();
    let ws;

    if (activeTab === 0) {
      // 재료 템플릿
      ws = XLSX.utils.aoa_to_sheet([
        ['name', 'cost'],
        ['샴푸', 10000],
        ['트리트먼트', 15000],
      ]);
    } else {
      // 시술 템플릿
      ws = XLSX.utils.aoa_to_sheet([
        ['name', 'category', 'customer_price', 'cost'],
        ['커트', '헤어', 15000, 5000],
        ['염색', '헤어', 50000, 20000],
      ]);
    }

    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, activeTab === 0 ? 'materials_template.xlsx' : 'procedures_template.xlsx');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>대량 업로드</DialogTitle>
      <DialogContent>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="재료 업로드" />
            <Tab label="시술 업로드" />
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          <Typography variant="body1" gutterBottom>
            재료 정보를 엑셀 파일로 업로드합니다. 파일은 다음 열을 포함해야 합니다:
          </Typography>
          <List>
            <ListItem>
              <ListItemText primary="name" secondary="재료명" />
            </ListItem>
            <ListItem>
              <ListItemText primary="cost" secondary="비용 (숫자)" />
            </ListItem>
          </List>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <Typography variant="body1" gutterBottom>
            시술 정보를 엑셀 파일로 업로드합니다. 파일은 다음 열을 포함해야 합니다:
          </Typography>
          <List>
            <ListItem>
              <ListItemText primary="name" secondary="시술명" />
            </ListItem>
            <ListItem>
              <ListItemText primary="category" secondary="카테고리" />
            </ListItem>
            <ListItem>
              <ListItemText primary="customer_price" secondary="고객 가격 (숫자)" />
            </ListItem>
            <ListItem>
              <ListItemText primary="cost" secondary="비용 (숫자)" />
            </ListItem>
          </List>
        </TabPanel>

        <Box sx={{ mt: 2, mb: 2 }}>
          <Button
            variant="outlined"
            onClick={downloadTemplate}
            sx={{ mr: 2 }}
          >
            템플릿 다운로드
          </Button>

          <Button
            variant="contained"
            component="label"
            startIcon={<CloudUploadIcon />}
            disabled={loading}
          >
            파일 선택
            <input
              type="file"
              hidden
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
            />
          </Button>
        </Box>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {success}
          </Alert>
        )}

        {validationErrors.length > 0 && (
          <Alert severity="error" sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              다음 오류를 수정해주세요:
            </Typography>
            <List>
              {validationErrors.map((error, index) => (
                <ListItem key={index}>
                  <ListItemText primary={error} />
                </ListItem>
              ))}
            </List>
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>닫기</Button>
      </DialogActions>
    </Dialog>
  );
}; 