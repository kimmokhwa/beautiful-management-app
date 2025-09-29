import React, { useEffect, useState } from 'react';
import api from '../services/api';

interface Procedure {
  id: number;
  name: string;
  category: string;
  customerPrice: number;
  totalCost: number;
  margin: number;
  marginRate: number;
  isRecommended: boolean;
}

interface Material {
  id: number;
  name: string;
  cost: number;
}

interface SelectedMaterial {
  materialId: number;
  name: string;
  cost: number;
  quantity: number;
}

const Procedures: React.FC = () => {
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<SelectedMaterial[]>([]);

  // 초기 로드: 백엔드에서 시술 목록 가져오기
  useEffect(() => {
    const fetchProcedures = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching procedures...');
        
        const response = await api.procedures.getAll();
        console.log('API response:', response);
        
        if (!response.success) {
          throw new Error(response.message || 'API 응답이 실패했습니다.');
        }
        
        const list = response.data || [];
        console.log('Raw data:', list);
        
        if (!Array.isArray(list)) {
          throw new Error('데이터가 배열 형태가 아닙니다.');
        }
        
        const mapped: Procedure[] = list.map((p: any) => ({
          id: p.id,
          name: p.name,
          category: p.category || p.categoryName || '',
          customerPrice: p.customerPrice || p.customer_price || 0,
          totalCost: p.totalCost ?? p.total_cost ?? 0,
          margin: p.margin ?? (p.customerPrice - (p.totalCost ?? 0)),
          marginRate: p.marginRate ?? p.margin_rate ?? (p.customerPrice ? Math.round(((p.customerPrice - (p.totalCost ?? 0)) / p.customerPrice) * 1000) / 10 : 0),
          isRecommended: Boolean(p.isRecommended ?? p.is_recommended)
        }));
        
        console.log('Mapped procedures:', mapped);
        setProcedures(mapped);
      } catch (error) {
        console.error('Failed to load procedures:', error);
        setError(error instanceof Error ? error.message : '시술 목록을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchProcedures();
  }, []);

  // 재료 목록 로드
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const response = await api.materials.getAll();
        if (response.success && response.data) {
          setMaterials(response.data);
        }
      } catch (error) {
        console.error('재료 목록 로드 실패:', error);
      }
    };
    fetchMaterials();
  }, []);

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [sortBy, setSortBy] = useState<'name' | 'category' | 'customerPrice' | 'totalCost' | 'margin' | 'marginRate' | 'isRecommended'>('marginRate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProcedure, setSelectedProcedure] = useState<Procedure | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    category: '',
    customerPrice: '',
    isRecommended: false
  });
  const [addForm, setAddForm] = useState({
    name: '',
    category: '보톡스',
    customerPrice: '',
    isRecommended: false
  });

  const categories = ['전체', '보톡스', '필러', '레이저', '스킨케어', '기타'];

  const getMarginClass = (rate: number) => {
    if (rate >= 70) return 'margin-high';
    if (rate >= 40) return 'margin-medium';
    return 'margin-low';
  };

  // 정렬 핸들러
  const handleSort = (column: 'name' | 'category' | 'customerPrice' | 'totalCost' | 'margin' | 'marginRate' | 'isRecommended') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder(column === 'marginRate' || column === 'customerPrice' || column === 'totalCost' || column === 'margin' ? 'desc' : 'asc');
    }
  };

  const filteredProcedures = procedures.filter(procedure => {
    const matchesSearch = procedure.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === '전체' || procedure.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedProcedures = [...filteredProcedures].sort((a, b) => {
    let aValue: any = a[sortBy];
    let bValue: any = b[sortBy];

    // 숫자 타입 처리
    if (sortBy === 'customerPrice' || sortBy === 'totalCost' || sortBy === 'margin' || sortBy === 'marginRate') {
      aValue = Number(aValue) || 0;
      bValue = Number(bValue) || 0;
    }
    
    // 불린 타입 처리 (추천)
    if (sortBy === 'isRecommended') {
      aValue = aValue ? 1 : 0;
      bValue = bValue ? 1 : 0;
    }
    
    // 문자열 타입 처리
    if (sortBy === 'name' || sortBy === 'category') {
      aValue = String(aValue || '').toLowerCase();
      bValue = String(bValue || '').toLowerCase();
    }

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // 수정 핸들러
  const handleEdit = (procedure: Procedure) => {
    setSelectedProcedure(procedure);
    setEditForm({
      name: procedure.name,
      category: procedure.category,
      customerPrice: procedure.customerPrice.toString(),
      isRecommended: procedure.isRecommended
    });
    setShowEditModal(true);
  };

  // 삭제 핸들러
  const handleDelete = (procedure: Procedure) => {
    setSelectedProcedure(procedure);
    setShowDeleteModal(true);
  };

  // 수정 저장
  const handleSaveEdit = async () => {
    if (!selectedProcedure) return;

    try {
      await api.procedures.update(selectedProcedure.id, {
        name: editForm.name,
        customerPrice: parseFloat(editForm.customerPrice),
        isRecommended: editForm.isRecommended
      });

      // 목록 새로고침
      const response = await api.procedures.getAll();
      const list = response.data || [];
      const mapped: Procedure[] = list.map((p: any) => ({
        id: p.id,
        name: p.name,
        category: p.category || p.categoryName || '',
        customerPrice: p.customerPrice,
        totalCost: p.totalCost ?? 0,
        margin: p.margin ?? (p.customerPrice - (p.totalCost ?? 0)),
        marginRate: p.marginRate ?? (p.customerPrice ? Math.round(((p.customerPrice - (p.totalCost ?? 0)) / p.customerPrice) * 1000) / 10 : 0),
        isRecommended: Boolean(p.isRecommended)
      }));
      setProcedures(mapped);

      setShowEditModal(false);
      setSelectedProcedure(null);
    } catch (error) {
      console.error('시술 수정 실패:', error);
      alert('시술 수정에 실패했습니다.');
    }
  };

  // 삭제 확인
  const handleConfirmDelete = async () => {
    if (!selectedProcedure) return;

    try {
      await api.procedures.delete(selectedProcedure.id);

      // 목록에서 제거
      setProcedures(procedures.filter(p => p.id !== selectedProcedure.id));

      setShowDeleteModal(false);
      setSelectedProcedure(null);
    } catch (error) {
      console.error('시술 삭제 실패:', error);
      alert('시술 삭제에 실패했습니다.');
    }
  };

  // 추천 토글
  const handleToggleRecommendation = async (procedure: Procedure) => {
    try {
      await api.procedures.toggleRecommendation(procedure.id);

      // 목록에서 해당 시술의 추천 상태 업데이트
      setProcedures(procedures.map(p => 
        p.id === procedure.id 
          ? { ...p, isRecommended: !p.isRecommended }
          : p
      ));

      // 대시보드의 추천 시술 목록도 업데이트
      if ((window as any).refreshDashboard) {
        (window as any).refreshDashboard();
      }
    } catch (error) {
      console.error('추천 설정 변경 실패:', error);
      alert('추천 설정 변경에 실패했습니다.');
    }
  };

  // 새 시술 추가 핸들러
  const handleAdd = () => {
    setAddForm({
      name: '',
      category: '보톡스',
      customerPrice: '',
      isRecommended: false
    });
    setSelectedMaterials([]);
    setShowAddModal(true);
  };

  // 재료 선택 핸들러
  const handleAddMaterial = (materialId: number) => {
    const material = materials.find(m => m.id === materialId);
    if (material && !selectedMaterials.find(sm => sm.materialId === materialId)) {
      setSelectedMaterials([...selectedMaterials, {
        materialId: material.id,
        name: material.name,
        cost: material.cost,
        quantity: 1
      }]);
    }
  };

  const handleRemoveMaterial = (materialId: number) => {
    setSelectedMaterials(selectedMaterials.filter(sm => sm.materialId !== materialId));
  };

  const handleQuantityChange = (materialId: number, quantity: number) => {
    if (quantity > 0) {
      setSelectedMaterials(selectedMaterials.map(sm => 
        sm.materialId === materialId 
          ? { ...sm, quantity }
          : sm
      ));
    }
  };

  // 총원가 계산
  const calculateTotalCost = () => {
    return selectedMaterials.reduce((total, material) => {
      return total + (material.cost * material.quantity);
    }, 0);
  };

  const handleSaveAdd = async () => {
    if (!addForm.name || !addForm.customerPrice) {
      alert('시술명과 고객가격을 입력해주세요.');
      return;
    }

    try {
      const response = await api.procedures.create({
        name: addForm.name,
        category: addForm.category,
        customerPrice: parseFloat(addForm.customerPrice),
        isRecommended: addForm.isRecommended,
        materials: selectedMaterials.map(sm => ({
          materialId: sm.materialId,
          quantity: sm.quantity
        }))
      });

      if (response.success) {
        // 목록 새로고침
        const updatedResponse = await api.procedures.getAll();
        if (updatedResponse.success) {
          const list = updatedResponse.data || [];
          const mapped: Procedure[] = list.map((p: any) => ({
            id: p.id,
            name: p.name,
            category: p.category || p.categoryName || '',
            customerPrice: p.customerPrice || p.customer_price || 0,
            totalCost: p.totalCost ?? p.total_cost ?? 0,
            margin: p.margin ?? (p.customerPrice - (p.totalCost ?? 0)),
            marginRate: p.marginRate ?? p.margin_rate ?? (p.customerPrice ? Math.round(((p.customerPrice - (p.totalCost ?? 0)) / p.customerPrice) * 1000) / 10 : 0),
            isRecommended: Boolean(p.isRecommended ?? p.is_recommended)
          }));
          setProcedures(mapped);
        }
        
        setShowAddModal(false);
        alert('새 시술이 성공적으로 추가되었습니다.');
      } else {
        throw new Error(response.message || '추가에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('시술 추가 실패:', error);
      let errorMessage = '시술 추가에 실패했습니다.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      alert(errorMessage);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">💉 시술 관리</h2>
          <p className="text-gray-600 mt-2">시술별 원가와 마진을 관리합니다.</p>
        </div>
        <button onClick={handleAdd} className="btn-primary">
          + 새 시술 추가
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="시술명으로 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="input-field w-40"
        >
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
        <button className="btn-secondary">
          정렬
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="text-sm text-gray-500">전체 시술</div>
          <div className="text-2xl font-bold text-gray-900">{procedures.length}개</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-gray-500">추천 시술</div>
          <div className="text-2xl font-bold text-primary-600">
            {procedures.filter(p => p.isRecommended).length}개
          </div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-gray-500">평균 마진율</div>
          <div className="text-2xl font-bold text-success-600">
            {Math.round(procedures.reduce((acc, p) => acc + p.marginRate, 0) / procedures.length)}%
          </div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-gray-500">최고 마진율</div>
          <div className="text-2xl font-bold text-warning-600">
            {Math.max(...procedures.map(p => p.marginRate)).toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Procedures Table */}
      <div className="card overflow-hidden">
        <table className="table">
          <thead>
            <tr>
              <th 
                className="cursor-pointer hover:bg-gray-50 select-none"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center justify-between">
                  시술명
                  <span className="text-xs">
                    {sortBy === 'name' ? (sortOrder === 'asc' ? '↑' : '↓') : '↕'}
                  </span>
                </div>
              </th>
              <th 
                className="cursor-pointer hover:bg-gray-50 select-none"
                onClick={() => handleSort('category')}
              >
                <div className="flex items-center justify-between">
                  카테고리
                  <span className="text-xs">
                    {sortBy === 'category' ? (sortOrder === 'asc' ? '↑' : '↓') : '↕'}
                  </span>
                </div>
              </th>
              <th 
                className="cursor-pointer hover:bg-gray-50 select-none"
                onClick={() => handleSort('customerPrice')}
              >
                <div className="flex items-center justify-between">
                  고객가격
                  <span className="text-xs">
                    {sortBy === 'customerPrice' ? (sortOrder === 'asc' ? '↑' : '↓') : '↕'}
                  </span>
                </div>
              </th>
              <th 
                className="cursor-pointer hover:bg-gray-50 select-none"
                onClick={() => handleSort('totalCost')}
              >
                <div className="flex items-center justify-between">
                  총 원가
                  <span className="text-xs">
                    {sortBy === 'totalCost' ? (sortOrder === 'asc' ? '↑' : '↓') : '↕'}
                  </span>
                </div>
              </th>
              <th 
                className="cursor-pointer hover:bg-gray-50 select-none"
                onClick={() => handleSort('margin')}
              >
                <div className="flex items-center justify-between">
                  마진
                  <span className="text-xs">
                    {sortBy === 'margin' ? (sortOrder === 'asc' ? '↑' : '↓') : '↕'}
                  </span>
                </div>
              </th>
              <th 
                className="cursor-pointer hover:bg-gray-50 select-none"
                onClick={() => handleSort('marginRate')}
              >
                <div className="flex items-center justify-between">
                  마진율
                  <span className="text-xs">
                    {sortBy === 'marginRate' ? (sortOrder === 'asc' ? '↑' : '↓') : '↕'}
                  </span>
                </div>
              </th>
              <th 
                className="cursor-pointer hover:bg-gray-50 select-none"
                onClick={() => handleSort('isRecommended')}
              >
                <div className="flex items-center justify-between">
                  추천
                  <span className="text-xs">
                    {sortBy === 'isRecommended' ? (sortOrder === 'asc' ? '↑' : '↓') : '↕'}
                  </span>
                </div>
              </th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            {sortedProcedures.map((procedure) => (
              <tr key={procedure.id}>
                <td>
                  <div className="font-medium text-gray-900">{procedure.name}</div>
                </td>
                <td>
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                    {procedure.category}
                  </span>
                </td>
                <td>
                  <div className="font-semibold text-gray-900">
                    {procedure.customerPrice.toLocaleString()}원
                  </div>
                </td>
                <td>
                  <div className="text-gray-600">
                    {procedure.totalCost.toLocaleString()}원
                  </div>
                </td>
                <td>
                  <div className="font-semibold text-gray-900">
                    {procedure.margin.toLocaleString()}원
                  </div>
                </td>
                <td>
                  <span className={getMarginClass(procedure.marginRate)}>
                    {Math.round(procedure.marginRate)}%
                  </span>
                </td>
                <td>
                  <div className="flex items-center">
                    <button
                      onClick={() => handleToggleRecommendation(procedure)}
                      className="hover:scale-110 transition-transform cursor-pointer"
                      title={procedure.isRecommended ? "추천 해제" : "추천 설정"}
                    >
                      {procedure.isRecommended ? (
                        <span className="text-warning-500">⭐</span>
                      ) : (
                        <span className="text-gray-300 hover:text-warning-400">☆</span>
                      )}
                    </button>
                  </div>
                </td>
                <td>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEdit(procedure)}
                      className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                    >
                      수정
                    </button>
                    <button 
                      onClick={() => handleDelete(procedure)}
                      className="text-danger-600 hover:text-danger-800 text-sm font-medium"
                    >
                      삭제
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {loading && (
          <div className="p-8 text-center text-gray-500">
            시술 목록을 불러오는 중...
          </div>
        )}

        {error && (
          <div className="p-8 text-center text-red-500">
            {error}
            <br />
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 text-blue-600 hover:text-blue-800"
            >
              새로고침
            </button>
          </div>
        )}

        {!loading && !error && sortedProcedures.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            {search || selectedCategory !== '전체' ? '검색 결과가 없습니다.' : '등록된 시술이 없습니다.'}
          </div>
        )}
      </div>

      {/* Margin Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">높은 마진율 (70% 이상)</h3>
          <div className="space-y-3">
            {procedures
              .filter(p => p.marginRate >= 70)
              .sort((a, b) => b.marginRate - a.marginRate)
              .map(procedure => (
                <div key={procedure.id} className="flex justify-between">
                  <span className="text-gray-700">{procedure.name}</span>
                  <span className="margin-high">{procedure.marginRate.toFixed(1)}%</span>
                </div>
              ))}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">보통 마진율 (40-70%)</h3>
          <div className="space-y-3">
            {procedures
              .filter(p => p.marginRate >= 40 && p.marginRate < 70)
              .sort((a, b) => b.marginRate - a.marginRate)
              .map(procedure => (
                <div key={procedure.id} className="flex justify-between">
                  <span className="text-gray-700">{procedure.name}</span>
                  <span className="margin-medium">{procedure.marginRate.toFixed(1)}%</span>
                </div>
              ))}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">낮은 마진율 (40% 미만)</h3>
          <div className="space-y-3">
            {procedures
              .filter(p => p.marginRate < 40)
              .sort((a, b) => b.marginRate - a.marginRate)
              .map(procedure => (
                <div key={procedure.id} className="flex justify-between">
                  <span className="text-gray-700">{procedure.name}</span>
                  <span className="margin-low">{procedure.marginRate.toFixed(1)}%</span>
                </div>
              ))}
            {procedures.filter(p => p.marginRate < 40).length === 0 && (
              <div className="text-gray-500 text-sm">해당 범위의 시술이 없습니다.</div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">시술 수정</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  시술명 *
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  className="input-field"
                  placeholder="시술명을 입력하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  고객가격 *
                </label>
                <input
                  type="number"
                  value={editForm.customerPrice}
                  onChange={(e) => setEditForm({...editForm, customerPrice: e.target.value})}
                  className="input-field"
                  placeholder="고객가격을 입력하세요"
                />
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editForm.isRecommended}
                    onChange={(e) => setEditForm({...editForm, isRecommended: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">추천 시술</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="btn-secondary flex-1"
              >
                취소
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={!editForm.name || !editForm.customerPrice}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Procedure Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">새 시술 추가</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  시술명 *
                </label>
                <input
                  type="text"
                  value={addForm.name}
                  onChange={(e) => setAddForm({...addForm, name: e.target.value})}
                  className="input-field"
                  placeholder="시술명을 입력하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  카테고리
                </label>
                <select
                  value={addForm.category}
                  onChange={(e) => setAddForm({...addForm, category: e.target.value})}
                  className="input-field"
                >
                  {categories.filter(c => c !== '전체').map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  고객가격 *
                </label>
                <input
                  type="number"
                  value={addForm.customerPrice}
                  onChange={(e) => setAddForm({...addForm, customerPrice: e.target.value})}
                  className="input-field"
                  placeholder="고객가격을 입력하세요"
                />
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={addForm.isRecommended}
                    onChange={(e) => setAddForm({...addForm, isRecommended: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">추천 시술</span>
                </label>
              </div>

              {/* 재료 선택 섹션 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  사용 재료
                </label>
                
                {/* 재료 추가 */}
                <div className="mb-3">
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        handleAddMaterial(parseInt(e.target.value));
                        e.target.value = '';
                      }
                    }}
                    className="input-field"
                    defaultValue=""
                  >
                    <option value="" disabled>재료를 선택하세요</option>
                    {materials
                      .filter(material => !selectedMaterials.find(sm => sm.materialId === material.id))
                      .map(material => (
                        <option key={material.id} value={material.id}>
                          {material.name} ({material.cost.toLocaleString()}원)
                        </option>
                      ))}
                  </select>
                </div>

                {/* 선택된 재료 목록 */}
                {selectedMaterials.length > 0 && (
                  <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
                    {selectedMaterials.map(material => (
                      <div key={material.materialId} className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{material.name}</span>
                          <span className="text-gray-500">({material.cost.toLocaleString()}원)</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            min="1"
                            value={material.quantity}
                            onChange={(e) => handleQuantityChange(material.materialId, parseInt(e.target.value) || 1)}
                            className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                          />
                          <button
                            onClick={() => handleRemoveMaterial(material.materialId)}
                            className="text-red-500 hover:text-red-700"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    {/* 총원가 표시 */}
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between font-semibold">
                        <span>총 원가:</span>
                        <span>{calculateTotalCost().toLocaleString()}원</span>
                      </div>
                      {addForm.customerPrice && (
                        <div className="flex justify-between text-sm text-gray-600 mt-1">
                          <span>예상 마진:</span>
                          <span>
                            {(parseFloat(addForm.customerPrice) - calculateTotalCost()).toLocaleString()}원
                            ({addForm.customerPrice ? Math.round(((parseFloat(addForm.customerPrice) - calculateTotalCost()) / parseFloat(addForm.customerPrice)) * 100) : 0}%)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="btn-secondary flex-1"
              >
                취소
              </button>
              <button
                onClick={handleSaveAdd}
                disabled={!addForm.name || !addForm.customerPrice}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                추가
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">시술 삭제</h3>
            <p className="text-gray-600 mb-6">
              '{selectedProcedure?.name}' 시술을 삭제하시겠습니까?<br/>
              이 작업은 되돌릴 수 없습니다.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn-secondary flex-1"
              >
                취소
              </button>
              <button
                onClick={handleConfirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium flex-1"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Procedures;