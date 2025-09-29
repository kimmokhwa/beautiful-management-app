import { 
  supabase,
  getMaterials,
  addMaterial,
  updateMaterial,
  deleteMaterial,
  getProcedures,
  addProcedure,
  updateProcedure,
  deleteProcedure,
  getSystemInfo,
  updateSystemInfo
} from './supabase';
import type { Database } from './types/supabase';

type Material = Database['public']['Tables']['materials']['Row'];
type Procedure = Database['public']['Tables']['procedures']['Row'];
type SystemInfo = Database['public']['Tables']['system_info']['Row'];

// 탭 전환 기능
export function switchTab(tabId: string): void {
    const tabs = document.querySelectorAll('.tab-content');
    const navTabs = document.querySelectorAll('.nav-tab');
    
    tabs.forEach(tab => tab.classList.remove('active'));
    navTabs.forEach(tab => tab.classList.remove('active'));
    
    document.getElementById(tabId)?.classList.add('active');
    document.querySelector(`[data-tab="${tabId}"]`)?.classList.add('active');
}

// 모달 관련 기능
export function openModal(modalId: string): void {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'block';
}

export function closeModal(modalId: string): void {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'none';
}

// 테이블 정렬 기능
export function sortTable(columnIndex: number, tableId: string): void {
    const table = document.getElementById(tableId);
    if (!table) return;

    const tbody = table.querySelector('tbody');
    if (!tbody) return;

    const rows = Array.from(tbody.querySelectorAll('tr'));
    const ths = table.querySelectorAll('th');
    const th = ths[columnIndex];
    if (!th) return;
    
    const isAsc = !th.classList.contains('sort-asc');
    
    ths.forEach(header => {
        header.classList.remove('sort-asc', 'sort-desc');
    });
    
    th.classList.add(isAsc ? 'sort-asc' : 'sort-desc');
    
    rows.sort((a, b) => {
        const aCell = a.cells[columnIndex];
        const bCell = b.cells[columnIndex];
        if (!aCell || !bCell) return 0;

        const aValue = aCell.textContent?.trim() || '';
        const bValue = bCell.textContent?.trim() || '';
        
        if (!isNaN(Number(aValue)) && !isNaN(Number(bValue))) {
            return isAsc ? Number(aValue) - Number(bValue) : Number(bValue) - Number(aValue);
        }
        
        return isAsc ? 
            aValue.localeCompare(bValue, 'ko') : 
            bValue.localeCompare(aValue, 'ko');
    });
    
    rows.forEach(row => tbody.appendChild(row));
}

// 검색 필터 기능
export function filterTable(inputId: string, tableId: string, columnIndex: number): void {
    const input = document.getElementById(inputId) as HTMLInputElement;
    if (!input) return;

    const filter = input.value.toLowerCase();
    const table = document.getElementById(tableId);
    if (!table) return;

    const rows = table.getElementsByTagName('tr');
    
    for (let i = 1; i < rows.length; i++) {
        const cell = rows[i].getElementsByTagName('td')[columnIndex];
        if (cell) {
            const text = cell.textContent || cell.innerText;
            rows[i].style.display = text.toLowerCase().includes(filter) ? '' : 'none';
        }
    }
}

// 선택된 항목 수 업데이트
export function updateSelectedCount(tableId: string): void {
    const table = document.getElementById(tableId);
    if (!table) return;

    const selectedCount = table.querySelectorAll('input[type="checkbox"]:checked').length;
    const bulkActions = document.querySelector('.bulk-actions');
    const countSpan = document.querySelector('.selected-count');
    
    if (bulkActions && countSpan) {
        if (selectedCount > 0) {
            bulkActions.classList.remove('hidden');
            countSpan.textContent = `${selectedCount}개 선택됨`;
        } else {
            bulkActions.classList.add('hidden');
        }
    }
}

// 전체 선택/해제 기능
export function toggleAllCheckboxes(tableId: string, checked: boolean): void {
    const table = document.getElementById(tableId);
    if (!table) return;

    const checkboxes = table.querySelectorAll('input[type="checkbox"]') as NodeListOf<HTMLInputElement>;
    checkboxes.forEach(checkbox => checkbox.checked = checked);
    updateSelectedCount(tableId);
}

// 페이지 로드 시 데이터 로드
export async function loadInitialData(): Promise<void> {
    try {
        // 재료 목록 로드
        const materials = await getMaterials();
        displayMaterials(materials);
        
        // 시술 목록 로드
        const procedures = await getProcedures();
        displayProcedures(procedures);
        
        // 시스템 정보 로드
        const systemInfo = await getSystemInfo();
        updateSystemInfoDisplay(systemInfo);
    } catch (error) {
        console.error('데이터 로드 중 오류 발생:', error);
        alert('데이터를 불러오는 중 오류가 발생했습니다.');
    }
}

// 재료 목록 표시
export function displayMaterials(materials: Material[]): void {
    const tbody = document.querySelector('#materialsTable tbody');
    if (!tbody) return;

    tbody.innerHTML = '';
    
    materials.forEach(material => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="checkbox" onchange="updateSelectedCount('materialsTable')"></td>
            <td>${material.name}</td>
            <td>${material.cost.toLocaleString()}원</td>
            <td>
                <button class="btn btn-warning" onclick="editMaterial(${material.id})">수정</button>
                <button class="btn btn-danger" onclick="deleteMaterialItem(${material.id})">삭제</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// 시술 목록 표시
export function displayProcedures(procedures: Procedure[]): void {
    const tbody = document.querySelector('#proceduresTable tbody');
    if (!tbody) return;

    tbody.innerHTML = '';
    
    procedures.forEach(procedure => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${procedure.category}</td>
            <td>${procedure.name}</td>
            <td>${procedure.customer_price.toLocaleString()}원</td>
            <td>${procedure.cost?.toLocaleString() || 0}원</td>
            <td>${procedure.margin?.toLocaleString() || 0}원</td>
            <td>${procedure.margin_rate || 0}%</td>
            <td>${procedure.materials?.join(', ') || ''}</td>
            <td>
                <button class="btn btn-warning" onclick="editProcedure(${procedure.id})">수정</button>
                <button class="btn btn-danger" onclick="deleteProcedureItem(${procedure.id})">삭제</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// 시스템 정보 표시 업데이트
export function updateSystemInfoDisplay(info: SystemInfo): void {
    const totalProcedures = document.getElementById('totalProcedures');
    const totalMaterials = document.getElementById('totalMaterials');
    const lastUpdated = document.getElementById('lastUpdated');

    if (totalProcedures) totalProcedures.textContent = String(info.total_procedures || 0);
    if (totalMaterials) totalMaterials.textContent = String(info.total_materials || 0);
    if (lastUpdated && info.last_updated) {
        lastUpdated.textContent = new Date(info.last_updated).toLocaleString();
    }
}

// 재료 추가
export async function addMaterialItem(formId: string): Promise<void> {
    const form = document.getElementById(formId) as HTMLFormElement;
    if (!form) return;

    const nameInput = form.querySelector('[name="name"]') as HTMLInputElement;
    const costInput = form.querySelector('[name="cost"]') as HTMLInputElement;
    
    const name = nameInput.value;
    const cost = parseInt(costInput.value);
    
    if (!name || isNaN(cost)) {
        alert('모든 필드를 올바르게 입력해주세요.');
        return;
    }
    
    try {
        await addMaterial(name, cost);
        const materials = await getMaterials();
        displayMaterials(materials);
        form.reset();
        closeModal('addItemModal');
    } catch (error) {
        console.error('재료 추가 중 오류 발생:', error);
        alert('재료를 추가하는 중 오류가 발생했습니다.');
    }
}

// 재료 수정
export async function editMaterial(id: number): Promise<void> {
    try {
        const materials = await getMaterials();
        const material = materials.find(m => m.id === id);
        if (!material) return;

        const form = document.getElementById('editMaterialForm') as HTMLFormElement;
        if (!form) return;

        const nameInput = form.querySelector('[name="name"]') as HTMLInputElement;
        const costInput = form.querySelector('[name="cost"]') as HTMLInputElement;
        const idInput = form.querySelector('[name="id"]') as HTMLInputElement;

        nameInput.value = material.name;
        costInput.value = String(material.cost);
        idInput.value = String(material.id);

        openModal('editMaterialModal');
    } catch (error) {
        console.error('재료 정보 불러오기 중 오류 발생:', error);
        alert('재료 정보를 불러오는 중 오류가 발생했습니다.');
    }
}

// 수정된 재료 저장
export async function saveEditedMaterial(formId: string): Promise<void> {
    const form = document.getElementById(formId) as HTMLFormElement;
    if (!form) return;

    const nameInput = form.querySelector('[name="name"]') as HTMLInputElement;
    const costInput = form.querySelector('[name="cost"]') as HTMLInputElement;
    const idInput = form.querySelector('[name="id"]') as HTMLInputElement;

    const id = parseInt(idInput.value);
    const name = nameInput.value;
    const cost = parseInt(costInput.value);

    if (!name || isNaN(cost) || isNaN(id)) {
        alert('모든 필드를 올바르게 입력해주세요.');
        return;
    }

    try {
        await updateMaterial(id, { name, cost });
        const materials = await getMaterials();
        displayMaterials(materials);
        closeModal('editMaterialModal');
    } catch (error) {
        console.error('재료 수정 중 오류 발생:', error);
        alert('재료를 수정하는 중 오류가 발생했습니다.');
    }
}

// 재료 삭제
export async function deleteMaterialItem(id: number): Promise<void> {
    if (!confirm('정말로 이 재료를 삭제하시겠습니까?')) return;

    try {
        await deleteMaterial(id);
        const materials = await getMaterials();
        displayMaterials(materials);
    } catch (error) {
        console.error('재료 삭제 중 오류 발생:', error);
        alert('재료를 삭제하는 중 오류가 발생했습니다.');
    }
}

// 시술 추가
export async function addProcedureItem(formId: string): Promise<void> {
    const form = document.getElementById(formId) as HTMLFormElement;
    if (!form) return;

    const categoryInput = form.querySelector('[name="category"]') as HTMLInputElement;
    const nameInput = form.querySelector('[name="name"]') as HTMLInputElement;
    const priceInput = form.querySelector('[name="customer_price"]') as HTMLInputElement;
    const materialsInput = form.querySelector('[name="materials"]') as HTMLSelectElement;

    const category = categoryInput.value;
    const name = nameInput.value;
    const customer_price = parseInt(priceInput.value);
    const materials = Array.from(materialsInput.selectedOptions).map(option => option.value);

    if (!category || !name || isNaN(customer_price)) {
        alert('모든 필드를 올바르게 입력해주세요.');
        return;
    }

    try {
        await addProcedure({ category, name, customer_price, materials });
        const procedures = await getProcedures();
        displayProcedures(procedures);
        form.reset();
        closeModal('addProcedureModal');
    } catch (error) {
        console.error('시술 추가 중 오류 발생:', error);
        alert('시술을 추가하는 중 오류가 발생했습니다.');
    }
}

// 시술 수정
export async function editProcedure(id: number): Promise<void> {
    try {
        const procedures = await getProcedures();
        const procedure = procedures.find(p => p.id === id);
        if (!procedure) return;

        const form = document.getElementById('editProcedureForm') as HTMLFormElement;
        if (!form) return;

        const categoryInput = form.querySelector('[name="category"]') as HTMLInputElement;
        const nameInput = form.querySelector('[name="name"]') as HTMLInputElement;
        const priceInput = form.querySelector('[name="customer_price"]') as HTMLInputElement;
        const materialsInput = form.querySelector('[name="materials"]') as HTMLSelectElement;
        const idInput = form.querySelector('[name="id"]') as HTMLInputElement;

        categoryInput.value = procedure.category;
        nameInput.value = procedure.name;
        priceInput.value = String(procedure.customer_price);
        idInput.value = String(procedure.id);

        if (procedure.materials) {
            Array.from(materialsInput.options).forEach(option => {
                option.selected = procedure.materials?.includes(option.value) || false;
            });
        }

        openModal('editProcedureModal');
    } catch (error) {
        console.error('시술 정보 불러오기 중 오류 발생:', error);
        alert('시술 정보를 불러오는 중 오류가 발생했습니다.');
    }
}

// 수정된 시술 저장
export async function saveEditedProcedure(formId: string): Promise<void> {
    const form = document.getElementById(formId) as HTMLFormElement;
    if (!form) return;

    const categoryInput = form.querySelector('[name="category"]') as HTMLInputElement;
    const nameInput = form.querySelector('[name="name"]') as HTMLInputElement;
    const priceInput = form.querySelector('[name="customer_price"]') as HTMLInputElement;
    const materialsInput = form.querySelector('[name="materials"]') as HTMLSelectElement;
    const idInput = form.querySelector('[name="id"]') as HTMLInputElement;

    const id = parseInt(idInput.value);
    const category = categoryInput.value;
    const name = nameInput.value;
    const customer_price = parseInt(priceInput.value);
    const materials = Array.from(materialsInput.selectedOptions).map(option => option.value);

    if (!category || !name || isNaN(customer_price) || isNaN(id)) {
        alert('모든 필드를 올바르게 입력해주세요.');
        return;
    }

    try {
        await updateProcedure(id, { category, name, customer_price, materials });
        const procedures = await getProcedures();
        displayProcedures(procedures);
        closeModal('editProcedureModal');
    } catch (error) {
        console.error('시술 수정 중 오류 발생:', error);
        alert('시술을 수정하는 중 오류가 발생했습니다.');
    }
}

// 시술 삭제
export async function deleteProcedureItem(id: number): Promise<void> {
    if (!confirm('정말로 이 시술을 삭제하시겠습니까?')) return;

    try {
        await deleteProcedure(id);
        const procedures = await getProcedures();
        displayProcedures(procedures);
    } catch (error) {
        console.error('시술 삭제 중 오류 발생:', error);
        alert('시술을 삭제하는 중 오류가 발생했습니다.');
    }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', loadInitialData); 