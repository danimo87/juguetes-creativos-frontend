class ApiClient {
    constructor() {
        this.baseURL = 'https://juguetes-creativos-backend.onrender.com'; 
        this.token = localStorage.getItem('authToken');
    }

    async request(url, options = {}) {
        const config = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        };

        if (this.token) {
            config.headers['Authorization'] = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(`${this.baseURL}${url}`, config);
            
            const contentType = response.headers.get("content-type");
            let data;
            
            if (contentType && contentType.includes("application/json")) {
                data = await response.json();
            } else {
                throw new Error(`Error ${response.status}: El servidor no respondió con JSON.`);
            }

            if (!response.ok) {
                throw new Error(data.message || 'Error en la petición');
            }

            return data;
        } catch (error) {
            console.error('Error en request:', error);
            throw error;
        }
    }

    setToken(token) {
        this.token = token;
        localStorage.setItem('authToken', token);
    }

    // --- AUTENTICACIÓN ---
    async login(credenciales) {
        const response = await this.request('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({
                username: credenciales.username || credenciales.email,
                password: credenciales.password
            })
        });
        
        if (response.success) {
            this.setToken(response.data.token);
            localStorage.setItem('currentUser', JSON.stringify(response.data.usuario));
        }
        return response;
    }

    // --- JUGUETES (CRUD) ---
    async getProducts() {
        return await this.request('/api/juguetes'); 
    }

    async createProduct(productData) {
        return await this.request('/api/juguetes', {
            method: 'POST',
            body: JSON.stringify(productData)
        });
    }

    /**
     * ACTUALIZAR PRODUCTO (Integrado)
     * Usamos el método PUT y pasamos los datos del juguete
     */
    async updateProduct(id, productData) {
        return await this.request(`/api/juguetes/${id}`, {
            method: 'PUT',
            body: JSON.stringify(productData)
        });
    }

    async deleteProduct(id) {
        return await this.request(`/api/juguetes/${id}`, {
            method: 'DELETE'
        });
    }
}


// Instanciamos la clase para que app.js pueda usarla
const api = new ApiClient();

// --- FUNCIONES DE NOTIFICACIÓN (Fuera de la clase) ---
function showMessage(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${getMessageType(type)} alert-dismissible fade show fixed-top m-3 ms-auto`;
    alertDiv.style.width = '350px';
    alertDiv.style.zIndex = '1050';
    alertDiv.setAttribute('role', 'alert');

    alertDiv.innerHTML = `
        <i class="fas ${getIcon(type)} me-2"></i>
        <span>${message}</span>
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    document.body.appendChild(alertDiv);

    setTimeout(() => {
        const bsAlert = new bootstrap.Alert(alertDiv);
        bsAlert.close();
    }, 4000);
}

function getMessageType(type) {
    switch(type) {
        case 'success': return 'success';
        case 'error': return 'danger';
        case 'warning': return 'warning';
        default: return 'primary';
    }
}

function getIcon(type) {
    switch(type) {
        case 'success': return 'fa-check-circle';
        case 'error': return 'fa-exclamation-circle';
        default: return 'fa-info-circle';
    }
}
