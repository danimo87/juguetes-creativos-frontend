// Variables globales
let productos = [];
let editMode = false; // Indica si el formulario es para editar
let currentEditId = null; // Guarda el ID del juguete que estamos editando

// 1. Cargar datos al iniciar el Dashboard
async function loadDashboardData() {
    try {
        // Usamos api (que ahora será global gracias al cambio en api.js)
        const response = await api.getProducts(); 
        if (response.success) {
            productos = response.data;
            updateDashboardStats();
            renderProductsTable();
        }
    } catch (error) {
        console.error('Error cargando datos:', error);
    }
}

// 2. Actualizar las tarjetas de estadísticas
function updateDashboardStats() {
    const totalElement = document.getElementById('totalProductos');
    const stockBajoElement = document.getElementById('stockBajo');

    if (totalElement) totalElement.textContent = productos.length;
    if (stockBajoElement) {
        const stockBajoCount = productos.filter(p => (p.stock_actual || 0) < 10).length;
        stockBajoElement.textContent = stockBajoCount;
    }
}

// 3. Renderizar la tabla
function renderProductsTable() {
    const tbody = document.getElementById('productsTable');
    if (!tbody) return;

    if (productos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4">No hay juguetes registrados.</td></tr>`;
        return;
    }

    tbody.innerHTML = productos.map(p => {
        const id = p.id_juguete; 
        const stock = p.stock_actual || 0;
        const stockClass = stock < 10 ? 'bg-danger' : 'bg-success';
        
        return `
            <tr>
                <td><strong>#${id}</strong></td>
                <td>${p.nombre_juguete}</td>
                <td><span class="badge bg-info text-dark">${p.categoria || 'Sin Categoría'}</span></td>
                <td>${p.material || 'N/A'}</td>
                <td><span class="badge ${stockClass}">${stock} unidades</span></td>
                <td class="text-center">
                    <div class="btn-group btn-group-sm">
                        <button onclick="prepareEdit('${id}')" class="btn btn-outline-primary"><i class="fas fa-edit"></i></button>
                        <button onclick="confirmDelete('${id}')" class="btn btn-outline-danger"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            </tr>`;
    }).join('');
}

// 4. Manejar el envío del formulario (CREAR o EDITAR)
const formJuguete = document.getElementById('formJuguete');
if (formJuguete) {
    formJuguete.addEventListener('submit', async (e) => {
        e.preventDefault();

        const datosJuguete = {
            nombre_juguete: document.getElementById('prodNombre').value,
            categoria: document.getElementById('prodCategoria').value,
            material: document.getElementById('prodMaterial').value,
            stock_disponible: parseInt(document.getElementById('prodStock').value) || 0
        };

        try {
            let response;
            if (editMode) {
                response = await api.updateProduct(currentEditId, datosJuguete);
            } else {
                response = await api.createProduct(datosJuguete);
            }
            
            if (response.success) {
                const modalElement = document.getElementById('modalJuguete');
                const modal = bootstrap.Modal.getInstance(modalElement);
                if (modal) modal.hide();

                alert(editMode ? '¡Juguete actualizado!' : '¡Juguete registrado!');
                resetForm(); 
                await loadDashboardData(); 
            }
        } catch (error) {
            alert('Error en la operación: ' + error.message);
        }
    });
}

// 5. Eliminar Producto
async function confirmDelete(id) {
    if (confirm(`¿Estás seguro de eliminar el juguete #${id}?`)) {
        try {
            const response = await api.deleteProduct(id);
            if (response.success) {
                loadDashboardData();
            }
        } catch (error) {
            alert('Error al eliminar: ' + error.message);
        }
    }
}

// 6. Preparar Edición
function prepareEdit(id) {
    const producto = productos.find(p => p.id_juguete == id);
    if (producto) {
        editMode = true;
        currentEditId = id;

        document.querySelector('#modalJuguete .modal-title').innerHTML = '<i class="fas fa-edit me-2"></i>Editar Juguete';

        document.getElementById('prodNombre').value = producto.nombre_juguete;
        document.getElementById('prodCategoria').value = producto.id_categoria || ""; 
        document.getElementById('prodMaterial').value = producto.id_material || "";
        document.getElementById('prodStock').value = producto.stock_actual;

        const modalElement = document.getElementById('modalJuguete');
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
    }
}

function resetForm() {
    editMode = false;
    currentEditId = null;
    formJuguete.reset();
    document.querySelector('#modalJuguete .modal-title').innerHTML = '<i class="fas fa-rocket me-2"></i>Registrar Nuevo Juguete';
}

// --- CAMBIO 1: INICIALIZACIÓN CORREGIDA ---
document.addEventListener('DOMContentLoaded', () => {
    // Verificamos si ya hay una sesión iniciada
    if (localStorage.getItem('authToken')) {
        // Si hay token, cargamos datos y saltamos al dashboard
        loadDashboardData();
        if(typeof showDashboard === 'function') {
            showDashboard();
        }
    } 
    // Nota: Eliminamos el 'else' con el redirect para evitar el bucle infinito en index.html
});

// Función para filtrar y mostrar solo stock bajo
function filterLowStock() {
    const productosBajos = productos.filter(p => (p.stock_actual || 0) < 10);
    const tituloTabla = document.querySelector('.card-header h5');
    tituloTabla.innerHTML = `
        <span class="text-danger">Mostrando: Stock Bajo</span> 
        <button class="btn btn-sm btn-link" onclick="loadDashboardData()">Ver todos</button>
    `;
    renderFilteredTable(productosBajos);
}

function renderFilteredTable(lista) {
    const tbody = document.getElementById('productsTable');
    if (!tbody) return;

    if (lista.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4">No hay productos con stock bajo.</td></tr>`;
        return;
    }

    tbody.innerHTML = lista.map(p => {
        const id = p.id_juguete; 
        const stock = p.stock_actual || 0;
        const stockClass = stock < 10 ? 'bg-danger' : 'bg-success';
        
        return `
            <tr>
                <td><strong>#${id}</strong></td>
                <td>${p.nombre_juguete}</td>
                <td><span class="badge bg-info text-dark">${p.categoria || 'Sin Categoría'}</span></td>
                <td>${p.material || 'N/A'}</td>
                <td><span class="badge ${stockClass}">${stock} unidades</span></td>
                <td class="text-center">
                    <div class="btn-group btn-group-sm">
                        <button onclick="prepareEdit('${id}')" class="btn btn-outline-primary"><i class="fas fa-edit"></i></button>
                        <button onclick="confirmDelete('${id}')" class="btn btn-outline-danger"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            </tr>`;
    }).join('');
}

// Búsqueda en tiempo real
const searchInput = document.getElementById('searchInput');
if (searchInput) {
    searchInput.addEventListener('keyup', function(e) {
        const term = e.target.value.toLowerCase();
        const rows = document.querySelectorAll('#productsTable tr');

        rows.forEach(row => {
            const text = row.innerText.toLowerCase();
            row.style.display = text.includes(term) ? '' : 'none';
        });
    });
}

// --- CAMBIO 2: HACER FUNCIONES VISIBLES GLOBALMENTE ---
window.prepareEdit = prepareEdit;
window.confirmDelete = confirmDelete;
window.loadDashboardData = loadDashboardData;
window.resetForm = resetForm;