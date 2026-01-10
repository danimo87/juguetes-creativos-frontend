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

        const response = await fetch(`${this.baseURL}${url}`, config);

        const contentType = response.headers.get("content-type");
        let data = {};

        if (contentType && contentType.includes("application/json")) {
            data = await response.json();
        }

        // 👇 DEVOLVEMOS EL ERROR CONTROLADO
        if (!response.ok) {
            return {
                success: false,
                message: data.message || 'Error en la petición'
            };
        }

        return data;
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
                username: credenciales.username,
                password: credenciales.password
            })
        });

        // 👇 SOLO SI ES EXITOSO
        if (response.success && response.data?.token) {
            this.setToken(response.data.token);
            localStorage.setItem(
                'currentUser',
                JSON.stringify(response.data.usuario)
            );
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

// ✅ SOLO UNA VEZ
window.api = new ApiClient();

// --- FUNCIONES DE NOTIFICACIÓN ---
function showMessage(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${getMessageType(type)} alert-dismissible fade show fixed-top m-3 ms-auto`;
    alertDiv.style.width = '350px';
    alertDiv.style.zIndex = '1050';
    alertDiv.setAttribute('role', 'alert');

    alertDiv.innerHTML = `
        <span>${message}</span>
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    document.body.appendChild(alertDiv);

    setTimeout(() => {
        alertDiv.remove();
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

window.showMessage = showMessage;