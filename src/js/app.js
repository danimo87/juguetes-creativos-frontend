// Variables globales
let productos = [];
let editMode = false; // Indica si el formulario es para editar
let currentEditId = null; // Guarda el ID del juguete que estamos editando

// 1. Cargar datos al iniciar el Dashboard
async function loadDashboardData() {
    try {
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
                // LLAMADA A EDITAR
                response = await api.updateProduct(currentEditId, datosJuguete);
            } else {
                // LLAMADA A CREAR
                response = await api.createProduct(datosJuguete);
            }
            
            if (response.success) {
                const modalElement = document.getElementById('modalJuguete');
                const modal = bootstrap.Modal.getInstance(modalElement);
                if (modal) modal.hide();

                alert(editMode ? '¡Juguete actualizado!' : '¡Juguete registrado!');
                resetForm(); // Limpiar todo
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

// 6. Preparar Edición (LLENA EL FORMULARIO Y ABRE EL MODAL)
function prepareEdit(id) {
    const producto = productos.find(p => p.id_juguete == id);
    if (producto) {
        editMode = true;
        currentEditId = id;

        // Cambiar el título del modal para que el usuario sepa que está editando
        document.querySelector('#modalJuguete .modal-title').innerHTML = '<i class="fas fa-edit me-2"></i>Editar Juguete';

        // Llenar los campos del formulario con los datos de la fila
        document.getElementById('prodNombre').value = producto.nombre_juguete;
        document.getElementById('prodCategoria').value = producto.id_categoria || ""; // Usar ID si tienes relación
        document.getElementById('prodMaterial').value = producto.id_material || "";
        document.getElementById('prodStock').value = producto.stock_actual;

        // Abrir el modal manualmente
        const modalElement = document.getElementById('modalJuguete');
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
    }
}

// Función extra para limpiar el formulario cuando se va a crear uno nuevo
function resetForm() {
    editMode = false;
    currentEditId = null;
    formJuguete.reset();
    document.querySelector('#modalJuguete .modal-title').innerHTML = '<i class="fas fa-rocket me-2"></i>Registrar Nuevo Juguete';
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('authToken')) {
        loadDashboardData();
        
        // --- AGREGAR ESTO ---
        const btnBajo = document.getElementById('cardStockBajo');
        if (btnBajo) {
            btnBajo.addEventListener('click', filterLowStock);
        }
        // --------------------

    } else {
        window.location.href = 'index.html';
    }
});

// Función para filtrar y mostrar solo stock bajo
function filterLowStock() {
    const productosBajos = productos.filter(p => (p.stock_actual || 0) < 10);
    
    // Cambiamos un poco el título de la tabla para que el usuario sepa que está filtrando
    const tituloTabla = document.querySelector('.card-header h5');
    tituloTabla.innerHTML = `
        <span class="text-danger">Mostrando: Stock Bajo</span> 
        <button class="btn btn-sm btn-link" onclick="loadDashboardData()">Ver todos</button>
    `;

    // Reutilizamos tu función de renderizado pero pasándole solo los filtrados
    renderFilteredTable(productosBajos);
}

// Una pequeña modificación a tu render para que acepte una lista opcional
function renderFilteredTable(lista) {
    const tbody = document.getElementById('productsTable');
    if (!tbody) return;

    if (lista.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4">No hay productos con stock bajo.</td></tr>`;
        return;
    }

    // El mismo código que ya tienes en renderProductsTable, pero usando 'lista'
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

// Lógica para filtrar la tabla en tiempo real
document.getElementById('searchInput').addEventListener('keyup', function(e) {
    const term = e.target.value.toLowerCase();
    const rows = document.querySelectorAll('#productsTable tr');

    rows.forEach(row => {
        const text = row.innerText.toLowerCase();
        row.style.display = text.includes(term) ? '' : 'none';
    });
});