// ================== VARIABLES GLOBALES ==================
let productos = [];
let editMode = false;
let currentEditId = null;

// ================== DASHBOARD ==================
async function loadDashboardData() {
    const response = await api.getProducts();

    if (!response || response.success === false) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        alert('Sesión expirada. Inicia sesión nuevamente.');
        window.location.reload();
        return;
    }

    productos = response.data || [];
    updateDashboardStats();
    renderProductsTable();
}

function updateDashboardStats() {
    const totalProductosEl = document.getElementById('totalProductos');
    if (totalProductosEl) {
        totalProductosEl.textContent = productos.length;
    }

    const stockBajo = productos.filter(p => (p.stock_actual || 0) < 10).length;
    const stockBajoEl = document.getElementById('stockBajo');
    if (stockBajoEl) {
        stockBajoEl.textContent = stockBajo;
    }
}

// ================== TABLA ==================
function renderProductsTable() {
    const tbody = document.getElementById('productsTable');
    if (!tbody) return;

    if (productos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center">No hay juguetes registrados</td></tr>`;
        return;
    }

    tbody.innerHTML = productos.map(p => {
        const stock = p.stock_actual || 0;
        const stockClass = stock < 10 ? 'bg-danger' : 'bg-success';

        return `
            <tr>
                <td>#${p.id_juguete}</td>
                <td>${p.nombre_juguete}</td>
                <td>${p.categoria || 'Sin categoría'}</td>
                <td>${p.material || 'N/A'}</td>
                <td><span class="badge ${stockClass}">${stock}</span></td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="prepareEdit(${p.id_juguete})">✏️</button>
                    <button class="btn btn-sm btn-danger" onclick="confirmDelete(${p.id_juguete})">🗑️</button>
                </td>
            </tr>`;
    }).join('');
}

// ================== FORMULARIO ==================
const formJuguete = document.getElementById('formJuguete');
if (formJuguete) {
    formJuguete.addEventListener('submit', async e => {
        e.preventDefault();

        const data = {
            nombre_juguete: prodNombre.value,
            categoria: prodCategoria.value,
            material: prodMaterial.value,
            stock_disponible: Number(prodStock.value) || 0
        };

        let response = editMode
            ? await api.updateProduct(currentEditId, data)
            : await api.createProduct(data);

        if (!response || response.success === false) {
            alert(response?.message || 'Error al guardar');
            return;
        }

        bootstrap.Modal.getInstance(modalJuguete)?.hide();
        resetForm();
        loadDashboardData();
    });
}

// ================== CRUD ==================
async function confirmDelete(id) {
    if (!confirm('¿Eliminar este juguete?')) return;

    const response = await api.deleteProduct(id);

    if (!response || response.success === false) {
        alert(response?.message || 'Error al eliminar');
        return;
    }

    loadDashboardData();
}

function prepareEdit(id) {
    const p = productos.find(x => x.id_juguete == id);
    if (!p) return;

    editMode = true;
    currentEditId = id;

    prodNombre.value = p.nombre_juguete;
    prodCategoria.value = p.categoria || '';
    prodMaterial.value = p.material || '';
    prodStock.value = p.stock_actual || 0;

    new bootstrap.Modal(modalJuguete).show();
}

function resetForm() {
    editMode = false;
    currentEditId = null;
    formJuguete.reset();
}

// ================== FILTROS ==================
function filterLowStock() {
    renderFilteredTable(productos.filter(p => (p.stock_actual || 0) < 10));
}

function renderFilteredTable(lista) {
    const tbody = document.getElementById('productsTable');
    tbody.innerHTML = lista.map(p => `
        <tr>
            <td>#${p.id_juguete}</td>
            <td>${p.nombre_juguete}</td>
            <td>${p.categoria || '-'}</td>
            <td>${p.material || '-'}</td>
            <td>${p.stock_actual || 0}</td>
            <td></td>
        </tr>
    `).join('');
}

// ================== BÚSQUEDA ==================
searchInput?.addEventListener('keyup', e => {
    const term = e.target.value.toLowerCase();
    document.querySelectorAll('#productsTable tr').forEach(row => {
        row.style.display = row.innerText.toLowerCase().includes(term) ? '' : 'none';
    });
});

// ================== INICIALIZACIÓN ==================
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('authToken');

    if (token) {
        if (typeof showDashboard === 'function') {
            showDashboard();
        }
        loadDashboardData();
    }
});

// ================== EXPOSICIÓN GLOBAL ==================
window.prepareEdit = prepareEdit;
window.confirmDelete = confirmDelete;
window.filterLowStock = filterLowStock;
window.loadDashboardData = loadDashboardData;