import React, { useEffect, useState } from 'react';
import api, { DashboardStats, ProcedureWithMargin } from '../services/api';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [topMarginProcedures, setTopMarginProcedures] = useState<ProcedureWithMargin[]>([]);
  const [topMarginRateProcedures, setTopMarginRateProcedures] = useState<ProcedureWithMargin[]>([]);
  const [recommendedProcedures, setRecommendedProcedures] = useState<ProcedureWithMargin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [statsResponse, topMarginResponse, topMarginRateResponse, recommendedResponse] = await Promise.allSettled([
          api.dashboard.getStats(),
          api.dashboard.getTopMargin(),
          api.dashboard.getTopMarginRate(),
          api.dashboard.getRecommended()
        ]);

        if (statsResponse.status === 'fulfilled') {
          setStats(statsResponse.value.data);
        } else {
          console.error('Stats fetch failed:', statsResponse.reason);
        }

        if (topMarginResponse.status === 'fulfilled') {
          setTopMarginProcedures(topMarginResponse.value.data);
        } else {
          console.error('Top margin fetch failed:', topMarginResponse.reason);
        }

        if (topMarginRateResponse.status === 'fulfilled') {
          setTopMarginRateProcedures(topMarginRateResponse.value.data);
        } else {
          console.error('Top margin rate fetch failed:', topMarginRateResponse.reason);
        }

        if (recommendedResponse.status === 'fulfilled') {
          setRecommendedProcedures(recommendedResponse.value.data);
        } else {
          console.error('Recommended procedures fetch failed:', recommendedResponse.reason);
        }

      } catch (err) {
        setError('대시보드 데이터를 불러오는데 실패했습니다.');
        console.error('Dashboard data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // 데이터 새로고침 함수 (추천 시술 변경 시 사용)
  const refreshDashboard = async () => {
    try {
      const recommendedResponse = await api.dashboard.getRecommended();
      if (recommendedResponse.success) {
        setRecommendedProcedures(recommendedResponse.data);
      }
    } catch (error) {
      console.error('추천 시술 새로고침 실패:', error);
    }
  };

  // 전역에서 사용할 수 있도록 window에 함수 등록
  useEffect(() => {
    (window as any).refreshDashboard = refreshDashboard;
    return () => {
      delete (window as any).refreshDashboard;
    };
  }, []);

  const getMarginClass = (rate: number) => {
    if (rate >= 70) return 'margin-high';
    if (rate >= 40) return 'margin-medium';
    return 'margin-low';
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">📊 대시보드</h2>
          <p className="text-gray-600 mt-2">원가관리 시스템 주요 지표</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">📊 대시보드</h2>
          <p className="text-gray-600 mt-2">원가관리 시스템 주요 지표</p>
        </div>
        <div className="bg-danger-50 border border-danger-200 rounded-lg p-6">
          <div className="flex items-center">
            <span className="text-danger-400 text-xl mr-3">⚠️</span>
            <div>
              <p className="font-medium text-danger-800">데이터를 불러올 수 없습니다</p>
              <p className="text-sm text-danger-600 mt-1">{error}</p>
              <p className="text-sm text-danger-600 mt-1">
                Supabase 데이터베이스가 연결되어 있는지 확인하세요.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">📊 대시보드</h2>
        <p className="text-gray-600 mt-2">원가관리 시스템 주요 지표</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-500">총 시술수</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats?.totalProcedures?.toLocaleString() || '0'}
              </p>
            </div>
            <div className="ml-4">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">💉</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-500">평균 마진율</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats?.avgMarginRate || 0}%
              </p>
            </div>
            <div className="ml-4">
              <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📈</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-500">최고 마진</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats?.maxMargin?.toLocaleString() || '0'}원
              </p>
            </div>
            <div className="ml-4">
              <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-500">추천 제품수</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats?.recommendedCount || 0}개
              </p>
            </div>
            <div className="ml-4">
              <div className="w-12 h-12 bg-danger-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⭐</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 마진 TOP 5 */}
        <div className="card p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">💰 마진 TOP 5</h3>
          <div className="space-y-4">
            {topMarginProcedures.map((procedure, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold text-sm mr-3">
                    {index + 1}
                  </div>
                  <span className="font-medium text-gray-900">{procedure.name}</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">
                    {(procedure.margin || 0).toLocaleString()}원
                  </div>
                  <div className={getMarginClass(procedure.marginRate || 0)}>
                    {Math.round(procedure.marginRate || 0)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 마진율 TOP 5 */}
        <div className="card p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">📈 마진율 TOP 5</h3>
          <div className="space-y-4">
            {topMarginRateProcedures.length > 0 ? (
              topMarginRateProcedures.map((procedure, index) => (
                <div key={procedure.id || index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-success-100 rounded-full flex items-center justify-center text-success-600 font-semibold text-sm mr-3">
                      {index + 1}
                    </div>
                    <span className="font-medium text-gray-900">{procedure.name}</span>
                  </div>
                  <div className="text-right">
                    <div className={getMarginClass(procedure.marginRate || 0)}>
                      {Math.round(procedure.marginRate || 0)}%
                    </div>
                    <div className="text-sm text-gray-500">
                      {(procedure.margin || 0).toLocaleString()}원
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                데이터가 없습니다
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 추천 시술 목록 */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">⭐ 추천 시술</h3>
          <span className="text-sm text-gray-500">
            {recommendedProcedures.length}개의 추천 시술
          </span>
        </div>
        
        {recommendedProcedures.length > 0 ? (
          <div className="space-y-4">
            {recommendedProcedures.map((procedure, index) => (
              <div key={procedure.id || index} className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center">
                  <div className="text-yellow-500 mr-3">⭐</div>
                  <div>
                    <div className="font-medium text-gray-900">{procedure.name}</div>
                    <div className="text-sm text-gray-500">{procedure.category}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">
                    {(procedure.customerPrice || 0).toLocaleString()}원
                  </div>
                  <div className="text-sm text-gray-500">
                    마진: {(procedure.margin || 0).toLocaleString()}원 ({Math.round(procedure.marginRate || 0)}%)
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <div className="text-6xl mb-4">⭐</div>
            <p className="text-gray-600">추천 시술이 없습니다.</p>
            <p className="text-sm text-gray-500 mt-2">시술 관리에서 별표를 클릭하여 추천 시술을 설정할 수 있습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;