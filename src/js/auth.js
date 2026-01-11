// ================== LOGIN ==================
const loginForm = document.getElementById('loginForm');

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // ⚠️ En realidad es USERNAME, no email
        const username = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value.trim();

        if (!username || !password) {
            alert('Por favor ingrese usuario y contraseña');
            return;
        }

        try {
            const response = await api.login({
                username,
                password
            });

            if (!response || response.success === false) {
                alert(response?.message || 'Credenciales incorrectas');
                return;
            }

            // ✅ LOGIN CORRECTO
            showDashboard();
            showMessage('¡Bienvenido!', 'success');

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
        `Usuario: ${usuario.username || 'N/A'}\n` +
        `Nombre: ${usuario.nombre_completo || 'N/A'}\n` +
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