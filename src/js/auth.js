// --- LÓGICA DE LOGIN ---
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const emailValue = document.getElementById('loginEmail').value;
    const passwordValue = document.getElementById('loginPassword').value;

    const response = await api.login({ 
        username: emailValue,
        password: passwordValue
    });

    if (response.success) {
        // 🔥 REDIRECCIÓN REAL
        window.location.href = 'dashboard.html';
    } else {
        alert(response.message || 'Credenciales incorrectas');
    }
});

// --- LOGOUT ---
function logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    window.location.href = 'index.html';
}

// --- PERFIL ---
function mostrarPerfil() {
    const datosUser = localStorage.getItem('currentUser');
    if (!datosUser) return;

    const usuario = JSON.parse(datosUser);
    alert(
        `👤 PERFIL\n\n` +
        `Nombre: ${usuario.nombre}\n` +
        `Rol: ${usuario.rol}`
    );
}

// --- REGISTRO / LOGIN ---
function showRegisterForm() {
    document.getElementById('loginScreen')?.classList.add('hidden');
    document.getElementById('registerScreen')?.classList.remove('hidden');
}

function showLoginForm() {
    document.getElementById('registerScreen')?.classList.add('hidden');
    document.getElementById('loginScreen')?.classList.remove('hidden');
}

// --- HACER GLOBALES ---
window.logout = logout;
window.mostrarPerfil = mostrarPerfil;
window.showRegisterForm = showRegisterForm;
window.showLoginForm = showLoginForm;