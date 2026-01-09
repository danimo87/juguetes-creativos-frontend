// --- LÓGICA DE LOGIN ---
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const emailValue = document.getElementById('loginEmail').value;
    const passwordValue = document.getElementById('loginPassword').value;
    
    try {
        const response = await api.login({ 
            username: emailValue, 
            password: passwordValue 
        });
        
        if (response.success) {
            // Guardamos el usuario y saltamos al dashboard
            localStorage.setItem('currentUser', JSON.stringify(response.data.usuario));
            showDashboard();
            if (typeof showMessage === 'function') showMessage('¡Bienvenido!', 'success');
        } else {
            alert('Credenciales incorrectas: ' + (response.message || ''));
        }
    } catch (error) {
        console.error("Error detallado:", error);
        alert('Error al intentar ingresar. Revisa que el backend esté activo.');
    }
});

function showDashboard() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('dashboardScreen').classList.remove('hidden');
    document.getElementById('userNav')?.classList.remove('hidden'); 
    document.getElementById('btnLogout')?.classList.remove('hidden'); 

    if (typeof loadDashboardData === 'function') {
        loadDashboardData(); 
    }
}

function logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken'); // Cambiado a 'authToken' para que coincida con api.js
    window.location.reload();
}

function mostrarPerfil() {
    const datosUser = localStorage.getItem('currentUser');
    if (datosUser) {
        const usuario = JSON.parse(datosUser);
        alert(`👤 PERFIL\n\nNombre: ${usuario.nombre}\nCorreo: ${usuario.email}\nRol: Administrador`);
    }
}

// --- HACER FUNCIONES VISIBLES PARA EL HTML ---
window.showDashboard = showDashboard;
window.logout = logout;
window.mostrarPerfil = mostrarPerfil;