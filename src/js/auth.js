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
        
        console.log("Respuesta del servidor:", response);

        if (response.success) {
            currentUser = response.data.usuario; 
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            // Llamamos a la función que cambia las pantallas
            showDashboard();
            
            if (typeof showMessage === 'function') showMessage('¡Bienvenido!', 'success');
        } else {
            alert('Credenciales incorrectas: ' + (response.message || ''));
        }
    } catch (error) {
        console.error("Error detallado:", error);
        alert('Error al intentar ingresar. Revisa la consola (F12).');
    }
});

// --- FUNCIÓN DE NAVEGACIÓN CORREGIDA ---
function showDashboard() {
    // 1. Ocultar login y mostrar dashboard
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('dashboardScreen').classList.remove('hidden');
    
    // 2. MOSTRAR ELEMENTOS NUEVOS (Icono de perfil y Botón de salida)
    // Usamos el operador '?' por si acaso el elemento no existe, no rompa el código
    document.getElementById('userNav')?.classList.remove('hidden'); 
    document.getElementById('btnLogout')?.classList.remove('hidden'); 

    // 3. Cargar los datos de la tabla y estadísticas
    if (typeof loadDashboardData === 'function') {
        loadDashboardData(); 
    }
    
    // 4. CORRECCIÓN DEL ERROR 'NULL': 
    // Comentamos la línea que buscaba 'userName' porque ahora usamos un ICONO
    /* if (currentUser && document.getElementById('userName')) {
        document.getElementById('userName').textContent = `Hola, ${currentUser.nombre}`;
    } 
    */
    console.log("Dashboard cargado correctamente para:", currentUser?.nombre);
}

// --- FUNCIÓN PARA CERRAR SESIÓN ---
function logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token'); // Si usas tokens
    
    // Recargar la página para limpiar todo y volver al login
    window.location.reload();
}

function mostrarPerfil() {
    // 1. Intentamos obtener los datos del usuario guardados en el navegador
    const datosUser = localStorage.getItem('currentUser');
    
    if (datosUser) {
        const usuario = JSON.parse(datosUser);
        
        // 2. Mostramos la información en una alerta estética
        alert(`👤 INFORMACIÓN DEL PERFIL\n\n` +
              `Nombre: ${usuario.nombre || 'No disponible'}\n` +
              `Correo: ${usuario.email || 'No disponible'}\n` +
              `Rol: ${usuario.rol || 'Administrador'}`);
    } else {
        alert("No se encontró información del usuario. Intenta reingresar.");
    }
}