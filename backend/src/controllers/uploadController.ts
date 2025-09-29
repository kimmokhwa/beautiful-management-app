import { Request, Response } from 'express';
import multer from 'multer';
import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';
import prisma from '../lib/prisma';
import { supabase } from '../index';

// Some browsers send multipart filenames as latin1. Decode to UTF-8 for non-ASCII names (e.g. Korean).
const decodeFilename = (name: string): string => {
  try {
    // If already valid UTF-8 this is a no-op for ASCII subset; for mojibake, this fixes common cases.
    return Buffer.from(name, 'latin1').toString('utf8');
  } catch {
    return name;
  }
};

// 파일 업로드 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  if (file.mimetype.includes('spreadsheet') ||
      file.mimetype.includes('excel') ||
      file.mimetype.includes('csv') ||
      path.extname(file.originalname) === '.xlsx' ||
      path.extname(file.originalname) === '.csv') {
    cb(null, true);
  } else {
    cb(new Error('Excel (.xlsx) 또는 CSV 파일만 업로드 가능합니다.'), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

// POST /api/upload/materials - 재료 대량 업로드
export const uploadMaterials = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '파일이 업로드되지 않았습니다.'
      });
    }

    const { mode = 'add' } = req.body; // add, update, replace
    const filePath = req.file.path;
    const fileName = decodeFilename(req.file.originalname);

    // 업로드 작업 생성 (Supabase)
    const { data: uploadJob, error: jobError } = await supabase
      .from('upload_jobs')
      .insert([{
        type: 'materials',
        file_name: fileName,
        file_size: req.file.size,
        status: 'processing',
        started_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (jobError) {
      throw jobError;
    }

    // 파일 파싱
    let data: any[] = [];

    if (path.extname(fileName) === '.xlsx') {
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    } else if (path.extname(fileName) === '.csv') {
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    }

    // 헤더 제거
    const headers = data[0];
    const rows = data.slice(1).filter(row => row.some(cell => cell)); // 빈 행 제거

    let successCount = 0;
    let errorCount = 0;
    const errors: any[] = [];

    // 백업 데이터 (롤백용)
    let originalData = null;
    if (mode === 'replace') {
      const { data } = await supabase.from('materials').select('*');
      originalData = data;
      await supabase.from('materials').delete().neq('id', 0); // 전체 삭제
    }

    // 데이터 처리
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNumber = i + 2; // Excel 행 번호 (헤더 포함)

      try {
        const [name, cost] = row;

        if (!name || cost === undefined) {
          errors.push({
            row: rowNumber,
            message: '재료명과 원가는 필수입니다.'
          });
          errorCount++;
          continue;
        }

        const materialData = {
          name: String(name).trim(),
          cost: parseFloat(String(cost).replace(/[^\d.-]/g, '')), // 숫자 외 문자 제거
          description: null,
          supplier: null
        };

        if (isNaN(materialData.cost)) {
          errors.push({
            row: rowNumber,
            message: '잘못된 가격 형식입니다.'
          });
          errorCount++;
          continue;
        }

        if (mode === 'add') {
          // 중복 검사 후 추가 (Supabase)
          const { data: existing } = await supabase
            .from('materials')
            .select('id')
            .eq('name', materialData.name)
            .single();

          if (existing) {
            errors.push({
              row: rowNumber,
              message: `중복된 재료명: ${materialData.name}`
            });
            errorCount++;
            continue;
          }

          const { error: insertError } = await supabase
            .from('materials')
            .insert([materialData]);

          if (insertError) {
            throw insertError;
          }
        } else if (mode === 'update') {
          // 업데이트 또는 생성 (Supabase)
          const { error: upsertError } = await supabase
            .from('materials')
            .upsert([materialData], { onConflict: 'name' });

          if (upsertError) {
            throw upsertError;
          }
        } else if (mode === 'replace') {
          // 전체 교체 (Supabase)
          const { error: insertError } = await supabase
            .from('materials')
            .insert([materialData]);

          if (insertError) {
            throw insertError;
          }
        }

        successCount++;
      } catch (error) {
        errors.push({
          row: rowNumber,
          message: error instanceof Error ? error.message : '알 수 없는 오류'
        });
        errorCount++;
      }
    }

    // 업로드 작업 완료 처리 (Supabase)
    await supabase
      .from('upload_jobs')
      .update({
        status: errorCount === 0 ? 'completed' : 'failed',
        total_rows: rows.length,
        success_rows: successCount,
        error_rows: errorCount,
        error_details: errors.length > 0 ? { errors } : null,
        original_data: originalData ? { data: originalData } : null,
        completed_at: new Date().toISOString()
      })
      .eq('id', uploadJob.id);

    // 임시 파일 삭제
    fs.unlinkSync(filePath);

    res.json({
      success: true,
      message: '업로드가 완료되었습니다.',
      data: {
        jobId: uploadJob.id,
        totalRows: rows.length,
        successRows: successCount,
        errorRows: errorCount,
        errors: errors.slice(0, 10) // 최대 10개 오류만 반환
      }
    });

  } catch (error) {
    console.error('uploadMaterials error:', error);
    res.status(500).json({
      success: false,
      message: '업로드 처리 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// POST /api/upload/procedures - 시술 대량 업로드
export const uploadProcedures = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '파일이 업로드되지 않았습니다.'
      });
    }

    const { mode = 'add' } = req.body;
    const filePath = req.file.path;
    const fileName = decodeFilename(req.file.originalname);

    // 업로드 작업 생성 (Supabase)
    const { data: uploadJob, error: jobError } = await supabase
      .from('upload_jobs')
      .insert([{
        type: 'procedures',
        file_name: fileName,
        file_size: req.file.size,
        status: 'processing',
        started_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (jobError) {
      throw jobError;
    }

    // 파일 파싱 (재료와 동일)
    let data: any[] = [];

    if (path.extname(fileName) === '.xlsx') {
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    }

    const headers = data[0];
    const rows = data.slice(1).filter(row => row.some(cell => cell));

    let successCount = 0;
    let errorCount = 0;
    const errors: any[] = [];

    // 데이터 처리
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNumber = i + 2;

      try {
        const [name, categoryName, customerPrice, materials] = row;

        if (!name || customerPrice === undefined) {
          errors.push({
            row: rowNumber,
            message: '시술명과 고객가격은 필수입니다.'
          });
          errorCount++;
          continue;
        }

        const price = parseFloat(String(customerPrice).replace(/[^\d.-]/g, ''));
        if (isNaN(price)) {
          errors.push({
            row: rowNumber,
            message: '잘못된 가격 형식입니다.'
          });
          errorCount++;
          continue;
        }

        // 카테고리 처리 (Supabase)
        let categoryId = null;
        if (categoryName) {
          const categoryNameTrimmed = String(categoryName).trim();
          
          // 카테고리 찾기
          let { data: category } = await supabase
            .from('categories')
            .select('id')
            .eq('name', categoryNameTrimmed)
            .single();

          if (!category) {
            // 카테고리 생성
            const { data: newCategory, error: categoryError } = await supabase
              .from('categories')
              .insert([{ name: categoryNameTrimmed }])
              .select('id')
              .single();

            if (categoryError) {
              throw categoryError;
            }
            category = newCategory;
          }
          categoryId = category.id;
        }

        // 시술 생성 (Supabase)
        const { data: procedure, error: procedureError } = await supabase
          .from('procedures')
          .insert([{
            name: String(name).trim(),
            category_id: categoryId,
            customer_price: price,
            is_recommended: false
          }])
          .select('id')
          .single();

        if (procedureError) {
          throw procedureError;
        }

        // 재료 연결 (Supabase) - 복수 재료 지원
        if (materials) {
          const materialNames = String(materials).split(',').map(m => m.trim()).filter(m => m);
          
          for (const materialName of materialNames) {
            // 재료 찾기
            const { data: material } = await supabase
              .from('materials')
              .select('id')
              .eq('name', materialName)
              .single();

            if (material) {
              // 시술-재료 연결
              const { error: linkError } = await supabase
                .from('procedure_materials')
                .insert([{
                  procedure_id: procedure.id,
                  material_id: material.id,
                  quantity: 1.0
                }]);

              if (linkError) {
                console.warn(`재료 연결 실패: ${materialName}`, linkError);
              }
            } else {
              console.warn(`재료를 찾을 수 없음: ${materialName}`);
            }
          }
        }

        successCount++;
      } catch (error) {
        errors.push({
          row: rowNumber,
          message: error instanceof Error ? error.message : '알 수 없는 오류'
        });
        errorCount++;
      }
    }

    // 업로드 작업 완료 (Supabase)
    await supabase
      .from('upload_jobs')
      .update({
        status: 'completed',
        total_rows: rows.length,
        success_rows: successCount,
        error_rows: errorCount,
        error_details: errors.length > 0 ? { errors } : null,
        completed_at: new Date().toISOString()
      })
      .eq('id', uploadJob.id);

    fs.unlinkSync(filePath);

    res.json({
      success: true,
      message: '업로드가 완료되었습니다.',
      data: {
        jobId: uploadJob.id,
        totalRows: rows.length,
        successRows: successCount,
        errorRows: errorCount,
        errors: errors.slice(0, 10)
      }
    });

  } catch (error) {
    console.error('uploadProcedures error:', error);
    res.status(500).json({
      success: false,
      message: '업로드 처리 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// GET /api/upload/history - 업로드 히스토리
export const getUploadHistory = async (req: Request, res: Response) => {
  try {
    const { type, limit = 20 } = req.query;

    let query = supabase
      .from('upload_jobs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(parseInt(limit as string));

    if (type) {
      query = query.eq('type', type as string);
    }

    const { data: uploadJobs, error } = await query;

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: uploadJobs
    });
  } catch (error) {
    console.error('getUploadHistory error:', error);
    res.status(500).json({
      success: false,
      message: '업로드 히스토리를 불러오는데 실패했습니다.',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// GET /api/upload/templates/:type - 템플릿 다운로드
export const downloadTemplate = async (req: Request, res: Response) => {
  try {
    const { type } = req.params;

    if (type === 'materials') {
      // 재료 템플릿
      const data = [
        ['재료명', '원가'],
        ['보톡스 100U', '120000'],
        ['레스틸렌 0.5cc', '77000']
      ];

      const worksheet = XLSX.utils.aoa_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, '재료 목록');

      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      res.setHeader('Content-Disposition', 'attachment; filename="materials_template.xlsx"');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.send(buffer);

    } else if (type === 'procedures') {
      // 시술 템플릿
      const data = [
        ['시술명', '카테고리', '고객가격', '재료명'],
        ['보톡스 100U 시술', '보톡스', '400000', '보톡스 100U,마취크림,주사기'],
        ['레스틸렌 필러 1cc', '필러', '350000', '레스틸렌 1cc,마취크림,주사기'],
        ['복합 시술', '보톡스', '600000', '보톡스 100U,레스틸렌 1cc,마취크림,주사기']
      ];

      const worksheet = XLSX.utils.aoa_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, '시술 목록');

      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      res.setHeader('Content-Disposition', 'attachment; filename="procedures_template.xlsx"');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.send(buffer);

    } else {
      return res.status(400).json({
        success: false,
        message: '잘못된 템플릿 타입입니다. (materials 또는 procedures)'
      });
    }
  } catch (error) {
    console.error('downloadTemplate error:', error);
    res.status(500).json({
      success: false,
      message: '템플릿 다운로드에 실패했습니다.',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};