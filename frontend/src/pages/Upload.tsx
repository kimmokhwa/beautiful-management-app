import React, { useState, useCallback, useEffect } from 'react';
import api, { UploadResult, UploadJob, API_BASE_URL } from '../services/api';

const Upload: React.FC = () => {
  const [uploadType, setUploadType] = useState<'materials' | 'procedures'>('materials');
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [uploadHistory, setUploadHistory] = useState<UploadJob[]>([]);
  const [uploadMode, setUploadMode] = useState<'add' | 'update' | 'replace'>('add');

  // 업로드 히스토리 로드
  useEffect(() => {
    const fetchUploadHistory = async () => {
      try {
        const response = await api.upload.getHistory();
        setUploadHistory(response.data);
      } catch (error) {
        console.error('Upload history fetch error:', error);
      }
    };

    fetchUploadHistory();
  }, []);

  // 드래그 앤 드롭 핸들러
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const uploadedFile = e.dataTransfer.files[0];
      if (uploadedFile.type.includes('spreadsheet') || uploadedFile.name.endsWith('.xlsx') || uploadedFile.name.endsWith('.csv')) {
        setFile(uploadedFile);
      } else {
        alert('Excel 또는 CSV 파일만 업로드 가능합니다.');
      }
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);
    setUploadResult(null);

    try {
      // 실제 API 업로드
      const uploadPromise = uploadType === 'materials'
        ? api.upload.materials(file, uploadMode)
        : api.upload.procedures(file, uploadMode);

      // 진행률 시뮬레이션 (실제로는 서버에서 진행률을 받아와야 함)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);

      const response = await uploadPromise;

      clearInterval(progressInterval);
      setUploadProgress(100);
      setIsUploading(false);

      setUploadResult(response.data);

      // 업로드 히스토리 갱신
      const historyResponse = await api.upload.getHistory();
      setUploadHistory(historyResponse.data);

    } catch (error: any) {
      setIsUploading(false);
      setUploadProgress(0);
      console.error('Upload error:', error);

      let errorMessage = '업로드 중 오류가 발생했습니다.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setUploadResult({
        jobId: '',
        totalRows: 0,
        successRows: 0,
        errorRows: 1,
        errors: [{
          row: 1,
          message: errorMessage
        }]
      });

      // 사용자에게 알림
      alert(`업로드 실패: ${errorMessage}`);
    }
  };

  const handleTemplateDownload = async () => {
    try {
      // 브라우저 창 대신 직접 다운로드
      const response = await fetch(`${API_BASE_URL}/upload/templates/${uploadType}`);
      
      if (!response.ok) {
        throw new Error(`다운로드 실패: ${response.status} ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${uploadType}_template.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Template download error:', error);
      alert('템플릿 다운로드에 실패했습니다.');
    }
  };

  // 결과 다운로드 함수
  const handleResultDownload = () => {
    if (!uploadResult) return;

    const data = [
      ['행 번호', '오류 메시지'],
      ...uploadResult.errors.map(error => [error.row, error.message])
    ];

    // CSV 형태로 변환
    const csvContent = data.map(row => 
      row.map(field => `"${field}"`).join(',')
    ).join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `upload_errors_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };


  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">📤 대량 업로드</h2>
        <p className="text-gray-600 mt-2">Excel/CSV 파일을 통해 대량의 데이터를 한번에 업로드할 수 있습니다.</p>
      </div>

      {/* Upload Type Selection */}
      <div className="card p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">업로드 타입 선택</h3>
        <div className="flex gap-4">
          <button
            onClick={() => setUploadType('materials')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              uploadType === 'materials'
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🧪 재료 업로드
          </button>
          <button
            onClick={() => setUploadType('procedures')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              uploadType === 'procedures'
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            💉 시술 업로드
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* File Upload */}
        <div className="lg:col-span-2 space-y-6">
          {/* Template Download */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 업로드 템플릿</h3>
            <p className="text-gray-600 mb-4">
              {uploadType === 'materials' ? '재료 업로드' : '시술 업로드'} 양식을 다운로드하여 데이터를 입력하세요.
            </p>
            <button
              onClick={handleTemplateDownload}
              className="btn-secondary"
            >
              📥 {uploadType === 'materials' ? '재료' : '시술'} 템플릿 다운로드
            </button>
          </div>

          {/* File Upload Area */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">파일 업로드</h3>

            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {file ? (
                <div className="space-y-4">
                  <div className="text-6xl">📊</div>
                  <div>
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      크기: {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    onClick={() => setFile(null)}
                    className="text-danger-600 hover:text-danger-800 text-sm font-medium"
                  >
                    파일 제거
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-6xl">📁</div>
                  <div>
                    <p className="text-lg font-medium text-gray-900">
                      파일을 드래그하거나 클릭하여 업로드
                    </p>
                    <p className="text-gray-500">Excel (.xlsx) 또는 CSV 파일만 지원</p>
                  </div>
                  <input
                    type="file"
                    accept=".xlsx,.csv"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="btn-primary inline-block cursor-pointer"
                  >
                    파일 선택
                  </label>
                </div>
              )}
            </div>

            {file && !isUploading && !uploadResult && (
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">업로드 옵션</span>
                  <select
                    value={uploadMode}
                    onChange={(e) => setUploadMode(e.target.value as 'add' | 'update' | 'replace')}
                    className="border border-gray-300 rounded px-3 py-1 text-sm"
                  >
                    <option value="add">새 데이터 추가</option>
                    <option value="update">기존 데이터 업데이트</option>
                    <option value="replace">전체 교체</option>
                  </select>
                </div>
                <button
                  onClick={handleUpload}
                  className="btn-primary w-full"
                >
                  업로드 시작
                </button>
              </div>
            )}

            {/* Upload Progress */}
            {isUploading && (
              <div className="mt-6 space-y-4">
                <div className="text-center">
                  <p className="font-medium text-gray-900">업로드 중...</p>
                  <p className="text-sm text-gray-500">데이터를 처리하고 있습니다.</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-center text-sm text-gray-600">{uploadProgress}%</p>
              </div>
            )}

            {/* Upload Result */}
            {uploadResult && (
              <div className="mt-6 space-y-4">
                <div className={`p-4 rounded-lg ${uploadResult.successRows > 0 ? 'bg-success-50' : 'bg-danger-50'}`}>
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">
                      {uploadResult.successRows > 0 ? '✅' : '❌'}
                    </span>
                    <div>
                      <p className={`font-medium ${uploadResult.successRows > 0 ? 'text-success-800' : 'text-danger-800'}`}>
                        업로드 {uploadResult.successRows > 0 ? '완료' : '실패'}
                      </p>
                      <p className="text-sm text-gray-600">
                        총 {uploadResult.totalRows}행 중 {uploadResult.successRows}행 성공, {uploadResult.errorRows}행 실패
                      </p>
                    </div>
                  </div>
                </div>

                {uploadResult.errors && uploadResult.errors.length > 0 && (
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-yellow-800">오류 상세</h4>
                      <button
                        onClick={handleResultDownload}
                        className="text-sm text-yellow-600 hover:text-yellow-800 font-medium"
                      >
                        📥 오류 목록 다운로드
                      </button>
                    </div>
                    <ul className="space-y-1">
                      {uploadResult.errors.map((error, index) => (
                        <li key={index} className="text-sm text-yellow-700">
                          {error.row}행: {error.message}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setFile(null);
                      setUploadResult(null);
                      setUploadProgress(0);
                    }}
                    className="btn-secondary"
                  >
                    새로 업로드
                  </button>
                  <button className="btn-primary">
                    결과 다운로드
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Upload History */}
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📜 업로드 히스토리</h3>
            <div className="space-y-4">
              {uploadHistory.length > 0 ? (
                uploadHistory.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 text-sm truncate">
                        {item.fileName}
                      </h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.status === 'completed'
                          ? 'bg-success-100 text-success-800'
                          : item.status === 'failed'
                          ? 'bg-danger-100 text-danger-800'
                          : item.status === 'processing'
                          ? 'bg-warning-100 text-warning-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {item.status === 'completed' ? '완료' :
                         item.status === 'failed' ? '실패' :
                         item.status === 'processing' ? '진행중' : '대기중'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 space-y-1">
                      <p>타입: {item.type === 'materials' ? '재료' : '시술'}</p>
                      <p>업로드: {new Date(item.createdAt).toLocaleString('ko-KR')}</p>
                      {item.status === 'completed' && (
                        <p>성공: {item.successRows}/{item.totalRows}행</p>
                      )}
                      {item.errorRows > 0 && (
                        <p className="text-danger-600">오류: {item.errorRows}행</p>
                      )}
                    </div>
                    {item.status === 'completed' && (
                      <button className="text-xs text-danger-600 hover:text-danger-800 mt-2">
                        롤백
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500 text-sm">
                  업로드 이력이 없습니다
                </div>
              )}
            </div>
          </div>

          {/* Upload Tips */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 업로드 팁</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                템플릿을 사용하여 정확한 형식으로 데이터를 입력하세요
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                중복된 데이터는 자동으로 감지됩니다
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                최대 10MB 크기의 파일까지 업로드 가능합니다
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                업로드 완료 후 결과를 확인하고 필요시 롤백하세요
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload;