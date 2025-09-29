import React, { useEffect, useState } from 'react';
import api from '../services/api';

interface Material {
  id: number;
  name: string;
  cost: number;
  description?: string;
  supplier?: string;
  createdAt: string;
}

const Materials: React.FC = () => {
  // 서버 데이터
  const [materials, setMaterials] = useState<Material[]>([]);

  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'cost' | 'createdAt'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [newMaterial, setNewMaterial] = useState({
    name: '',
    cost: '',
    description: '',
    supplier: ''
  });
  const [editMaterial, setEditMaterial] = useState({
    name: '',
    cost: '',
    description: '',
    supplier: ''
  });

  // 초기 로드: 백엔드에서 재료 목록 가져오기
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const response = await api.materials.getAll();
        const list = response.data || [];
        // 백엔드 필드명(created_at 등)을 화면 모델에 맞게 변환
        const mapped: Material[] = list.map((m: any) => ({
          id: m.id,
          name: m.name,
          cost: m.cost,
          description: m.description ?? '',
          supplier: m.supplier ?? '',
          createdAt: (m.createdAt || m.created_at || '').toString().split('T')[0] || ''
        }));
        setMaterials(mapped);
      } catch (error) {
        console.error('Failed to load materials:', error);
      }
    };
    fetchMaterials();
  }, []);

  // 정렬 핸들러
  const handleSort = (column: 'name' | 'cost' | 'createdAt') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  // 검색 및 정렬된 재료 목록
  const filteredMaterials = materials.filter(material =>
    material.name.toLowerCase().includes(search.toLowerCase())
  );

  const sortedMaterials = [...filteredMaterials].sort((a, b) => {
    let aValue: any = a[sortBy];
    let bValue: any = b[sortBy];

    // 숫자 타입 처리
    if (sortBy === 'cost') {
      aValue = Number(aValue) || 0;
      bValue = Number(bValue) || 0;
    }
    
    // 날짜 타입 처리
    if (sortBy === 'createdAt') {
      aValue = new Date(aValue || '').getTime() || 0;
      bValue = new Date(bValue || '').getTime() || 0;
    }
    
    // 문자열 타입 처리
    if (sortBy === 'name') {
      aValue = String(aValue || '').toLowerCase();
      bValue = String(bValue || '').toLowerCase();
    }

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // 수정 핸들러
  const handleEdit = (material: Material) => {
    setSelectedMaterial(material);
    setEditMaterial({
      name: material.name,
      cost: material.cost.toString(),
      description: material.description || '',
      supplier: material.supplier || ''
    });
    setShowEditModal(true);
  };

  // 삭제 핸들러
  const handleDelete = (material: Material) => {
    setSelectedMaterial(material);
    setShowDeleteModal(true);
  };

  // 수정 저장
  const handleSaveEdit = async () => {
    if (!selectedMaterial) return;

    try {
      await api.materials.update(selectedMaterial.id, {
        name: editMaterial.name,
        cost: parseFloat(editMaterial.cost),
        description: editMaterial.description,
        supplier: editMaterial.supplier
      });

      // 목록 새로고침
      const response = await api.materials.getAll();
      const list = response.data || [];
      const mapped: Material[] = list.map((m: any) => ({
        id: m.id,
        name: m.name,
        cost: m.cost,
        description: m.description ?? '',
        supplier: m.supplier ?? '',
        createdAt: (m.createdAt || m.created_at || '').toString().split('T')[0] || ''
      }));
      setMaterials(mapped);

      setShowEditModal(false);
      setSelectedMaterial(null);
    } catch (error) {
      console.error('재료 수정 실패:', error);
      alert('재료 수정에 실패했습니다.');
    }
  };

  // 삭제 확인
  const handleConfirmDelete = async () => {
    if (!selectedMaterial) return;

    try {
      const response = await api.materials.delete(selectedMaterial.id);
      
      if (response.success) {
        // 목록에서 제거
        setMaterials(materials.filter(m => m.id !== selectedMaterial.id));
        setShowDeleteModal(false);
        setSelectedMaterial(null);
        alert('재료가 성공적으로 삭제되었습니다.');
      } else {
        throw new Error(response.message || '삭제에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('재료 삭제 실패:', error);
      
      // 더 자세한 에러 메시지 표시
      let errorMessage = '재료 삭제에 실패했습니다.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
      setShowDeleteModal(false);
      setSelectedMaterial(null);
    }
  };

  const handleAddMaterial = () => {
    if (newMaterial.name && newMaterial.cost) {
      const material: Material = {
        id: Date.now(),
        name: newMaterial.name,
        cost: parseFloat(newMaterial.cost),
        description: newMaterial.description,
        supplier: newMaterial.supplier,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setMaterials([...materials, material]);
      setNewMaterial({ name: '', cost: '', description: '', supplier: '' });
      setShowAddModal(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">🧪 재료 관리</h2>
          <p className="text-gray-600 mt-2">시술에 사용되는 재료와 원가를 관리합니다.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary"
        >
          + 새 재료 추가
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="재료명으로 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field"
          />
        </div>
        <button className="btn-secondary">
          필터
        </button>
      </div>

      {/* Materials Table */}
      <div className="card overflow-hidden">
        <table className="table">
          <thead>
            <tr>
              <th 
                className="cursor-pointer hover:bg-gray-50 select-none"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center justify-between">
                  재료명
                  <span className="text-xs">
                    {sortBy === 'name' ? (sortOrder === 'asc' ? '↑' : '↓') : '↕'}
                  </span>
                </div>
              </th>
              <th 
                className="cursor-pointer hover:bg-gray-50 select-none"
                onClick={() => handleSort('cost')}
              >
                <div className="flex items-center justify-between">
                  원가
                  <span className="text-xs">
                    {sortBy === 'cost' ? (sortOrder === 'asc' ? '↑' : '↓') : '↕'}
                  </span>
                </div>
              </th>
              <th 
                className="cursor-pointer hover:bg-gray-50 select-none"
                onClick={() => handleSort('createdAt')}
              >
                <div className="flex items-center justify-between">
                  등록일
                  <span className="text-xs">
                    {sortBy === 'createdAt' ? (sortOrder === 'asc' ? '↑' : '↓') : '↕'}
                  </span>
                </div>
              </th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            {sortedMaterials.map((material) => (
              <tr key={material.id}>
                <td>
                  <div className="font-medium text-gray-900">{material.name}</div>
                </td>
                <td>
                  <div className="font-semibold text-gray-900">
                    {material.cost.toLocaleString()}원
                  </div>
                </td>
                <td>
                  <div className="text-gray-500">{material.createdAt}</div>
                </td>
                <td>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEdit(material)}
                      className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                    >
                      수정
                    </button>
                    <button 
                      onClick={() => handleDelete(material)}
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

        {filteredMaterials.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            검색 결과가 없습니다.
          </div>
        )}
      </div>

      {/* Add Material Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">새 재료 추가</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  재료명 *
                </label>
                <input
                  type="text"
                  value={newMaterial.name}
                  onChange={(e) => setNewMaterial({...newMaterial, name: e.target.value})}
                  className="input-field"
                  placeholder="재료명을 입력하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  원가 *
                </label>
                <input
                  type="number"
                  value={newMaterial.cost}
                  onChange={(e) => setNewMaterial({...newMaterial, cost: e.target.value})}
                  className="input-field"
                  placeholder="원가를 입력하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  공급업체
                </label>
                <input
                  type="text"
                  value={newMaterial.supplier}
                  onChange={(e) => setNewMaterial({...newMaterial, supplier: e.target.value})}
                  className="input-field"
                  placeholder="공급업체를 입력하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  설명
                </label>
                <textarea
                  value={newMaterial.description}
                  onChange={(e) => setNewMaterial({...newMaterial, description: e.target.value})}
                  className="input-field"
                  rows={3}
                  placeholder="재료에 대한 설명을 입력하세요"
                />
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
                onClick={handleAddMaterial}
                disabled={!newMaterial.name || !newMaterial.cost}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                추가
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Material Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">재료 수정</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  재료명 *
                </label>
                <input
                  type="text"
                  value={editMaterial.name}
                  onChange={(e) => setEditMaterial({...editMaterial, name: e.target.value})}
                  className="input-field"
                  placeholder="재료명을 입력하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  원가 *
                </label>
                <input
                  type="number"
                  value={editMaterial.cost}
                  onChange={(e) => setEditMaterial({...editMaterial, cost: e.target.value})}
                  className="input-field"
                  placeholder="원가를 입력하세요"
                />
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
                disabled={!editMaterial.name || !editMaterial.cost}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">재료 삭제</h3>
            <p className="text-gray-600 mb-6">
              '{selectedMaterial?.name}' 재료를 삭제하시겠습니까?<br/>
              이 재료가 사용된 모든 시술에 영향을 줄 수 있습니다.<br/>
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

export default Materials;