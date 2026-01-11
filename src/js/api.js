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

        let data = {};
        const contentType = response.headers.get("content-type");

        if (contentType && contentType.includes("application/json")) {
            data = await response.json();
        }

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

    async login(credenciales) {
        const response = await this.request('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({
                username: credenciales.username,
                password: credenciales.password
            })
        });

        if (response.success && response.data?.token) {
            this.setToken(response.data.token);
            localStorage.setItem(
                'currentUser',
                JSON.stringify(response.data.usuario)
            );
        }

        return response;
    }

    async getProducts() {
        return this.request('/api/juguetes');
    }

    async createProduct(data) {
        return this.request('/api/juguetes', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async updateProduct(id, data) {
        return this.request(`/api/juguetes/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async deleteProduct(id) {
        return this.request(`/api/juguetes/${id}`, {
            method: 'DELETE'
        });
    }
}

// ✅ UNA SOLA VEZ
window.api = new ApiClient();

// Mensajes
function showMessage(message, type = 'info') {
    alert(message);
}
window.showMessage = showMessage;