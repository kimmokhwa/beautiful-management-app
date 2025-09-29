// 숫자를 한국 원화 형식으로 포맷
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    minimumFractionDigits: 0
  }).format(amount);
};

// 숫자를 쉼표가 있는 형식으로 포맷
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('ko-KR').format(num);
};

// 마진율을 퍼센트로 포맷
export const formatPercent = (rate: number): string => {
  return `${rate.toFixed(1)}%`;
};

// 마진율에 따른 색상 클래스 반환
export const getMarginRateColor = (marginRate: number): string => {
  if (marginRate >= 50) return 'text-green-600 bg-green-50';
  if (marginRate >= 30) return 'text-yellow-600 bg-yellow-50';
  if (marginRate >= 10) return 'text-orange-600 bg-orange-50';
  return 'text-red-600 bg-red-50';
};

// 날짜를 한국 형식으로 포맷
export const formatDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(d);
};

// 파일 크기를 읽기 쉬운 형식으로 포맷
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 업로드 상태에 따른 색상 클래스 반환
export const getUploadStatusColor = (status: string): string => {
  switch (status) {
    case 'completed': return 'text-green-600 bg-green-50 border-green-200';
    case 'processing': return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'failed': return 'text-red-600 bg-red-50 border-red-200';
    case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    default: return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

// 업로드 상태 한글 변환
export const getUploadStatusText = (status: string): string => {
  switch (status) {
    case 'pending': return '대기중';
    case 'processing': return '처리중';
    case 'completed': return '완료';
    case 'failed': return '실패';
    case 'rollback': return '롤백됨';
    default: return status;
  }
};