// ================== LOGIN ==================
const loginForm = document.getElementById('loginForm');

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const response = await api.login({
                username: email,
                password: password
            });

            if (!response || response.success === false) {
                alert(response?.message || 'Credenciales incorrectas');
                return;
            }

            // ✅ LOGIN CORRECTO
            showDashboard();
            if (typeof showMessage === 'function') {
                showMessage('¡Bienvenido!', 'success');
            }

        } catch (error) {
            console.error('Error login:', error);
            alert('Error de conexión con el servidor');
        }
    });
}

// ================== DASHBOARD ==================
function showDashboard() {
    document.getElementById('loginScreen')?.classList.add('hidden');
    document.getElementById('registerScreen')?.classList.add('hidden');
    document.getElementById('dashboardScreen')?.classList.remove('hidden');
    document.getElementById('userNav')?.classList.remove('hidden');
    document.getElementById('btnLogout')?.classList.remove('hidden');

    if (typeof loadDashboardData === 'function') {
        loadDashboardData();
    }
}

// ================== LOGOUT ==================
function logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    window.location.reload();
}

// ================== PERFIL ==================
function mostrarPerfil() {
    const datos = localStorage.getItem('currentUser');
    if (!datos) return;

    const usuario = JSON.parse(datos);
    alert(
        `👤 PERFIL\n\n` +
        `Nombre: ${usuario.nombre || 'N/A'}\n` +
        `Correo: ${usuario.email || 'N/A'}\n` +
        `Rol: ${usuario.rol || 'Usuario'}`
    );
}

// ================== LOGIN / REGISTRO ==================
function showRegisterForm() {
    document.getElementById('loginScreen')?.classList.add('hidden');
    document.getElementById('registerScreen')?.classList.remove('hidden');
}

function showLoginForm() {
    document.getElementById('registerScreen')?.classList.add('hidden');
    document.getElementById('loginScreen')?.classList.remove('hidden');
}

// ================== EXPOSICIÓN GLOBAL ==================
window.showDashboard = showDashboard;
window.logout = logout;
window.mostrarPerfil = mostrarPerfil;
window.showRegisterForm = showRegisterForm;
window.showLoginForm = showLoginForm;