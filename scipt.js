        document.addEventListener('DOMContentLoaded', () => {
            console.log("Admin script starting..."); 

            // --- SIMULACIÓN DE BASE DE DATOS (Solo para JS) ---
            // Los datos reales para el PDF ahora están en el PHP
            const cursosPorAño = { 1: 7, 2: 7, 3: 7, 4: 4, 5: 4, 6: 4, 7: 4 };
            let usuariosDB = [ /* ... datos ... */ 
                { dni: 12345678, nombre: "Pérez, Juan Ignacio", password: "123", correo: "juan@mail.com", rol: "alumno", nacimiento: "2008-05-10", grupoSanguineo: "A+", año: 1, curso: 1, foto: "", dieta: 0, alergias: "Maní", observaciones: "" }, { dni: 87654321, nombre: "García, María Luz", password: "123", correo: "maria@mail.com", rol: "alumno", nacimiento: "2007-10-20", grupoSanguineo: "0+", año: 2, curso: 3, foto: "", dieta: 1, alergias: "", observaciones: "Dieta Vegetariana" }, { dni: 11112222, nombre: "Admin, Carlos", password: "123", correo: "admin@mail.com", rol: "preceptor", nacimiento: "1980-01-15", grupoSanguineo: "B+", año: null, curso: null, foto: null, dieta: null, alergias: null, observaciones: null }, { dni: 33334444, nombre: "Comedor, Ana", password: "123", correo: "comedor@mail.com", rol: "comedor", nacimiento: "1990-03-25", grupoSanguineo: "AB-", año: null, curso: null, foto: null, dieta: null, alergias: null, observaciones: null }
            ];
            const todosLosAlumnos = usuariosDB.filter(u => u.rol === 'alumno'); // Necesario para la vista previa
            let reservasCountDB = { desayuno: 120, almuerzo: 250, merienda: 90, cena: 45 };
            // Datos simulados para la VISTA PREVIA en HTML
            const reporteResumenDB_JS = { 
                "2025-10-01": { fecha: "01/10/2025", desayuno: 100, almuerzo: 210, merienda: 80, cena: 35, total: 425, obs: "Inicio de mes." },
                "2025-10-05": { fecha: "05/10/2025", desayuno: 110, almuerzo: 230, merienda: 85, cena: 40, total: 465, obs: "" },
                "2025-10-18": { fecha: "18/10/2025", desayuno: 115, almuerzo: 240, merienda: 88, cena: 40, total: 483, obs: "Día normal." },
                "2025-10-19": { fecha: "19/10/2025", desayuno: 90, almuerzo: 200, merienda: 70, cena: 30, total: 390, obs: "Llovió, concurrencia baja." } 
            };
            const reporteDetalleDB_JS = {
                "2025-10-01": [ { dni: 87654321, atendido: ['almuerzo'] } ],
                "2025-10-05": [ { dni: 12345678, atendido: ['almuerzo'] }, { dni: 87654321, atendido: ['almuerzo'] } ],
                "2025-10-18": [ { dni: 12345678, atendido: ['desayuno', 'almuerzo'] }, { dni: 87654321, atendido: ['almuerzo', 'cena'] } ],
                "2025-10-19": [ { dni: 12345678, atendido: ['desayuno'] } ]
            };
            const obsHoy = "Sin observaciones por el momento.";
            const iconTildeHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500 mx-auto" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>`;
            const iconEquisHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-500 mx-auto" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" /></svg>`;

            // --- REFERENCIAS AL DOM ---
            const currentDateEl = document.getElementById('current-date-small');
            const rtCounts = { desayuno: document.getElementById('rt-count-desayuno'), almuerzo: document.getElementById('rt-count-almuerzo'), merienda: document.getElementById('rt-count-merienda'), cena: document.getElementById('rt-count-cena') };
            const accordions = document.querySelectorAll('.accordion-header');
            const modalAgregar = document.getElementById('modal-agregar');
            const modalModificar = document.getElementById('modal-modificar');
            const modalEliminar = document.getElementById('modal-eliminar');
            const modalConfirmacion = document.getElementById('modal-confirmacion');
            const btnOpenAgregar = document.getElementById('btn-open-agregar');
            const btnOpenModificar = document.getElementById('btn-open-modificar');
            const btnOpenEliminar = document.getElementById('btn-open-eliminar');
            const btnCancelAgregar = document.getElementById('btn-cancel-agregar');
            const btnCancelModificar = document.getElementById('btn-cancel-modificar');
            const btnCancelEliminar = document.getElementById('btn-cancel-eliminar');
            const btnCancelarFinal = document.getElementById('btn-cancelar-final');
            const btnConfirmarFinal = document.getElementById('btn-confirmar-final');
            const formAgregarUsuario = document.getElementById('form-agregar-usuario');
            const addDniInput = document.getElementById('add-dni');
            const addPasswordInput = document.getElementById('add-password');
            const addRolSelect = document.getElementById('add-rol');
            const addAlumnoFields = document.getElementById('alumno-fields-container');
            const addAñoSelect = document.getElementById('add-año');
            const addCursoSelect = document.getElementById('add-curso');
            const formBuscarModificar = document.getElementById('form-buscar-modificar');
            const formModificarUsuario = document.getElementById('form-modificar-usuario');
            const modBuscarContainer = document.getElementById('mod-buscar-container');
            const modBuscarError = document.getElementById('mod-buscar-error');
            const modSubmitButton = document.getElementById('btn-submit-modificar');
            const modRolSelect = document.getElementById('mod-rol');
            const modAlumnoFields = document.getElementById('mod-alumno-fields-container');
            const modAñoSelect = document.getElementById('mod-año');
            const modCursoSelect = document.getElementById('mod-curso');
            const formBuscarEliminar = document.getElementById('form-buscar-eliminar');
            const formEliminarUsuario = document.getElementById('form-eliminar-usuario');
            const delBuscarContainer = document.getElementById('del-buscar-container');
            const delBuscarError = document.getElementById('del-buscar-error');
            const delInfoContainer = document.getElementById('form-eliminar-usuario');
            const delSubmitButton = document.getElementById('btn-submit-eliminar');
            const formConsulta = document.getElementById('form-consulta-usuario');
            const consultaResultado = document.getElementById('consulta-resultado');
            const formReporte = document.getElementById('form-generar-reporte');
            const reporteResultado = document.getElementById('reporte-resultado');
            const btnReporteMes = document.getElementById('btn-reporte-mes');
            const downloadPDFContainer = document.getElementById('download-pdf-container');
            const btnDownloadPDF = document.getElementById('btn-download-pdf');
            const estadisticasContenido = document.getElementById('estadisticas-contenido');
            
            // --- NUEVAS REFERENCIAS ESTADO SISTEMA ---
            const btnDisableSystem = document.getElementById('btn-disable-system');
            const btnEnableSystem = document.getElementById('btn-enable-system');

            let currentAction = null;
            let userToModifyDNI = null;
            let userToEliminarDNI = null;
            
            // --- NUEVA VARIABLE ESTADO GLOBAL ---
            let sistemaHabilitado = true; // true = Habilitado, false = Deshabilitado

            // --- LÓGICA DE FECHA Y SUB-HEADER ---
            const now = new Date();
            const fechaHoy = now.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
            currentDateEl.textContent = fechaHoy;
            function updateRealTimeCounts() { reservasCountDB.desayuno += Math.floor(Math.random() * 2); reservasCountDB.almuerzo += Math.floor(Math.random() * 2); rtCounts.desayuno.textContent = reservasCountDB.desayuno; rtCounts.almuerzo.textContent = reservasCountDB.almuerzo; rtCounts.merienda.textContent = reservasCountDB.merienda; rtCounts.cena.textContent = reservasCountDB.cena; }
            setInterval(updateRealTimeCounts, 3000);

            // --- LÓGICA ACORDEÓN ---
            // (Esta función existente detectará el nuevo acordeón automáticamente por la clase)
            accordions.forEach(header => { header.addEventListener('click', () => { const content = header.nextElementSibling; const icon = header.querySelector('svg'); if (content.style.display === "block") { content.style.display = "none"; icon.style.transform = "rotate(0deg)"; } else { content.style.display = "block"; icon.style.transform = "rotate(180deg)"; } }); });

            // --- LÓGICA DE CURSOS DINÁMICOS ---
            function populateCursos(añoSeleccionado, selectCurso) { const numCursos = cursosPorAño[añoSeleccionado] || 0; selectCurso.innerHTML = ''; for (let i = 1; i <= numCursos; i++) { selectCurso.innerHTML += `<option value="${i}">${i}º Curso</option>`; } }

            // --- LÓGICA MODALES GESTIÓN USUARIOS ---
            btnOpenAgregar.addEventListener('click', () => { formAgregarUsuario.reset(); populateCursos(addAñoSelect.value, addCursoSelect); addAlumnoFields.style.display = 'block'; modalAgregar.classList.remove('hidden'); });
            addDniInput.addEventListener('input', () => { addPasswordInput.value = addDniInput.value; });
            addRolSelect.addEventListener('change', () => { addAlumnoFields.style.display = (addRolSelect.value === 'alumno') ? 'block' : 'none'; });
            addAñoSelect.addEventListener('change', () => { populateCursos(addAñoSelect.value, addCursoSelect); });
            formAgregarUsuario.addEventListener('submit', (e) => { e.preventDefault(); currentAction = 'agregar'; showConfirmationModal('Agregar Usuario', '¿Está seguro de que desea agregar este nuevo usuario?'); });
            btnOpenModificar.addEventListener('click', () => { formBuscarModificar.reset(); formModificarUsuario.reset(); modBuscarContainer.classList.remove('hidden'); modBuscarError.classList.add('hidden'); formModificarUsuario.classList.add('hidden'); modSubmitButton.classList.add('hidden'); modalModificar.classList.remove('hidden'); });
            formBuscarModificar.addEventListener('submit', (e) => {
                e.preventDefault(); const dni = document.getElementById('mod-buscar-dni').value; const user = usuariosDB.find(u => u.dni == dni);
                if (user) { userToModifyDNI = user.dni; modBuscarContainer.classList.add('hidden'); formModificarUsuario.classList.remove('hidden'); modSubmitButton.classList.remove('hidden'); modBuscarError.classList.add('hidden'); document.getElementById('mod-nombre').value = user.nombre; document.getElementById('mod-dni').value = user.dni; document.getElementById('mod-email').value = user.correo; document.getElementById('mod-rol').value = user.rol; document.getElementById('mod-nacimiento').value = user.nacimiento; document.getElementById('mod-sangre').value = user.grupoSanguineo; if (user.rol === 'alumno') { modAlumnoFields.style.display = 'block'; document.getElementById('mod-año').value = user.año; populateCursos(user.año, modCursoSelect); document.getElementById('mod-curso').value = user.curso; document.getElementById('mod-dieta').value = user.dieta; document.getElementById('mod-alergias').value = user.alergias; document.getElementById('mod-obs').value = user.observaciones; } else { modAlumnoFields.style.display = 'none'; } } else { modBuscarError.classList.remove('hidden'); }
            });
            modRolSelect.addEventListener('change', () => { modAlumnoFields.style.display = (modRolSelect.value === 'alumno') ? 'block' : 'none'; });
            modAñoSelect.addEventListener('change', () => { populateCursos(modAñoSelect.value, modCursoSelect); });
            formModificarUsuario.addEventListener('submit', (e) => { e.preventDefault(); currentAction = 'modificar'; showConfirmationModal('Modificar Usuario', `¿Está seguro de que desea guardar los cambios para el DNI ${userToModifyDNI}?`); });
            btnOpenEliminar.addEventListener('click', () => { formBuscarEliminar.reset(); delBuscarContainer.classList.remove('hidden'); delBuscarError.classList.add('hidden'); delInfoContainer.classList.add('hidden'); delSubmitButton.classList.add('hidden'); modalEliminar.classList.remove('hidden'); });
            formBuscarEliminar.addEventListener('submit', (e) => {
                e.preventDefault(); const dni = document.getElementById('del-buscar-dni').value; const user = usuariosDB.find(u => u.dni == dni);
                if (user) { userToEliminarDNI = user.dni; delBuscarContainer.classList.add('hidden'); delInfoContainer.classList.remove('hidden'); delSubmitButton.classList.remove('hidden'); delBuscarError.classList.add('hidden'); document.getElementById('del-info-nombre').textContent = user.nombre; document.getElementById('del-info-dni').textContent = user.dni; document.getElementById('del-info-email').textContent = user.correo; document.getElementById('del-info-rol').textContent = user.rol.charAt(0).toUpperCase() + user.rol.slice(1); } else { delBuscarError.classList.remove('hidden'); }
            });
            formEliminarUsuario.addEventListener('submit', (e) => { e.preventDefault(); currentAction = 'eliminar'; showConfirmationModal('Eliminar Usuario', `¿Está SEGURO de que desea ELIMINAR al usuario con DNI ${userToEliminarDNI}? Esta acción no se puede deshacer.`); });
            
            // --- LÓGICA DE CONFIRMACIÓN FINAL (ACTUALIZADA) ---
            function showConfirmationModal(title, message) { document.getElementById('confirm-title').textContent = title; document.getElementById('confirm-message').textContent = message; modalConfirmacion.classList.remove('hidden'); }
            btnConfirmarFinal.addEventListener('click', () => {
                
                if (currentAction === 'agregar') {
                    const rol = addRolSelect.value; const newUser = { dni: addDniInput.value, nombre: document.getElementById('add-nombre').value, password: addPasswordInput.value, correo: document.getElementById('add-email').value, rol: rol, nacimiento: document.getElementById('add-nacimiento').value, grupoSanguineo: document.getElementById('add-sangre').value, año: (rol === 'alumno') ? addAñoSelect.value : null, curso: (rol === 'alumno') ? addCursoSelect.value : null, foto: "", dieta: (rol === 'alumno') ? document.getElementById('add-dieta').value : null, alergias: (rol === 'alumno') ? document.getElementById('add-alergias').value : null, observaciones: (rol === 'alumno') ? document.getElementById('add-obs').value : null }; usuariosDB.push(newUser); console.log("Usuario agregado:", newUser); modalAgregar.classList.add('hidden');
                
                } else if (currentAction === 'modificar') {
                    const user = usuariosDB.find(u => u.dni == userToModifyDNI); const newPassword = document.getElementById('mod-password').value; const rol = modRolSelect.value; user.nombre = document.getElementById('mod-nombre').value; user.correo = document.getElementById('mod-email').value; if (newPassword) user.password = newPassword; user.rol = rol; user.nacimiento = document.getElementById('mod-nacimiento').value; user.grupoSanguineo = document.getElementById('mod-sangre').value; if (rol === 'alumno') { user.año = document.getElementById('mod-año').value; user.curso = document.getElementById('mod-curso').value; user.dieta = document.getElementById('mod-dieta').value; user.alergias = document.getElementById('mod-alergias').value; user.obs = document.getElementById('mod-obs').value; } else { user.año = null; user.curso = null; user.dieta = null; user.alergias = null; user.obs = null; } console.log("Usuario modificado:", user); modalModificar.classList.add('hidden');
                
                } else if (currentAction === 'eliminar') { 
                    usuariosDB = usuariosDB.filter(u => u.dni != userToEliminarDNI); console.log(`Usuario ${userToEliminarDNI} eliminado.`); modalEliminar.classList.add('hidden'); 
                
                // --- NUEVA LÓGICA DE ESTADO ---
                } else if (currentAction === 'deshabilitar-sistema') {
                    console.log("Sistema Deshabilitado");
                    sistemaHabilitado = false;
                    actualizarBotonesSistema();
                    // (En un futuro, aquí llamarías a un fetch() para guardar esto en la BD)
                } else if (currentAction === 'habilitar-sistema') {
                    console.log("Sistema Habilitado");
                    sistemaHabilitado = true;
                    actualizarBotonesSistema();
                    // (En un futuro, aquí llamarías a un fetch() para guardar esto en la BD)
                }
                
                modalConfirmacion.classList.add('hidden'); 
                currentAction = null; 
                userToModifyDNI = null; 
                userToEliminarDNI = null;
            });
            btnCancelAgregar.addEventListener('click', () => modalAgregar.classList.add('hidden'));
            btnCancelModificar.addEventListener('click', () => modalModificar.classList.add('hidden'));
            btnCancelEliminar.addEventListener('click', () => modalEliminar.classList.add('hidden'));
            btnCancelarFinal.addEventListener('click', () => modalConfirmacion.classList.add('hidden'));
            
            // --- LÓGICA CONSULTA USUARIOS ---
            formConsulta.addEventListener('submit', (e) => { e.preventDefault(); const dni = document.getElementById('consulta-dni').value; const user = usuariosDB.find(u => u.dni == dni); if (user) { let html = `<h4 class="font-bold text-lg">${user.nombre} (DNI: ${user.dni})</h4><p><span class="font-semibold">Rol:</span> ${user.rol}</p><p><span class="font-semibold">Correo:</span> ${user.correo}</p><p><span class="font-semibold">Nacimiento:</span> ${user.nacimiento}</p><p><span class="font-semibold">Grupo Sang.:</span> ${user.grupoSanguineo}</p>`; if (user.rol === 'alumno') { html += `<div class="mt-2 pt-2 border-t"><p><span class="font-semibold">Curso:</span> ${user.año}º Año - ${user.curso}º Curso</p><p><span class="font-semibold">Dieta:</span> Tipo ${user.dieta}</p><p><span class="font-semibold">Alergias:</span> ${user.alergias || 'Ninguna'}</p><p><span class="font-semibold">Obs:</span> ${user.observaciones || 'Ninguna'}</p></div>`; } consultaResultado.innerHTML = html; } else { consultaResultado.innerHTML = `<p class="text-red-600">Usuario no encontrado.</p>`; } });


            // --- NUEVA LÓGICA ESTADO SISTEMA ---
            btnDisableSystem.addEventListener('click', () => {
                currentAction = 'deshabilitar-sistema';
                showConfirmationModal(
                    'Deshabilitar Sistema', 
                    '¿Está seguro de que desea deshabilitar el sistema para Alumnos y Preceptores?'
                );
            });

            btnEnableSystem.addEventListener('click', () => {
                currentAction = 'habilitar-sistema';
                showConfirmationModal(
                    'Habilitar Sistema', 
                    '¿Está seguro de que desea volver a habilitar el sistema?'
                );
            });

            // Función para actualizar la UI de los botones de estado
            function actualizarBotonesSistema() {
                if (sistemaHabilitado) {
                    // Sistema HABILITADO (estado inicial)
                    btnDisableSystem.disabled = false; // El botón se puede clickear
                    btnEnableSystem.classList.add('hidden'); // Oculta "Habilitar"
                } else {
                    // Sistema DESHABILITADO
                    btnDisableSystem.disabled = true; // El botón se pone gris y no se puede clickear
                    btnEnableSystem.classList.remove('hidden'); // Muestra "Habilitar"
                }
            }
            // ------------------------------------


            // --- LÓGICA GENERAR REPORTE (HTML VISIBLE Y DISPARADOR PDF PHP) ---
            
            /** Genera el HTML para la vista previa en pantalla (con Tailwind) */
            function generarReporteHTMLVistaPrevia(fechaInicio, fechaFin) {
                // Usa los datos JS para la vista previa
                let html = `<h4 class="font-bold text-lg mb-2">Reporte Generado (${fechaInicio} al ${fechaFin})</h4>`; let totalGeneral = 0; let diasEncontrados = 0;
                const fechasOrdenadas = Object.keys(reporteResumenDB_JS).sort(); 
                for (const dateKey of fechasOrdenadas) {
                    if (dateKey >= fechaInicio && dateKey <= fechaFin) {
                        diasEncontrados++; const reporte = reporteResumenDB_JS[dateKey]; const detalleDia = reporteDetalleDB_JS[dateKey] || [];
                        html += `<div class="reporte-dia-card mb-6 p-4 bg-white border rounded-lg shadow-md"><p class="font-bold text-xl text-blue-700">${reporte.fecha}</p><div class="grid grid-cols-2 md:grid-cols-5 gap-2 my-2 text-sm"><div><span class="font-semibold">Desayuno:</span> ${reporte.desayuno}</div><div><span class="font-semibold">Almuerzo:</span> ${reporte.almuerzo}</div><div><span class="font-semibold">Merienda:</span> ${reporte.merienda}</div><div><span class="font-semibold">Cena:</span> ${reporte.cena}</div><div class="font-bold text-gray-900"><span class="font-semibold">Total:</span> ${reporte.total}</div></div><p class="text-sm mb-4"><span class="font-semibold">Observaciones:</span> ${reporte.obs || 'N/A'}</p>`;
                        html += `<div class="mt-4 border-t pt-4"><h5 class="font-semibold text-md mb-2">Detalle de Asistencia de Alumnos</h5><div class="overflow-x-auto reporte-tabla-alumnos"><table class="min-w-full divide-y divide-gray-200 text-sm"><thead class="bg-gray-100"><tr><th class="px-3 py-2 text-left font-medium text-gray-600">Alumno</th><th class="px-3 py-2 text-center font-medium text-gray-600">Des.</th><th class="px-3 py-2 text-center font-medium text-gray-600">Alm.</th><th class="px-3 py-2 text-center font-medium text-gray-600">Mer.</th><th class="px-3 py-2 text-center font-medium text-gray-600">Cena</th></tr></thead><tbody class="bg-white divide-y divide-gray-200">`;
                        for (const alumno of todosLosAlumnos) { // Usa la lista de alumnos global
                            const registroAlumno = detalleDia.find(d => d.dni == alumno.dni); const atendido = registroAlumno ? registroAlumno.atendido : [];
                            html += `<tr><td class="px-3 py-2 whitespace-nowrap">${alumno.nombre} <span class="text-xs text-gray-500">(DNI: ${alumno.dni})</span></td><td class="px-3 py-2">${atendido.includes('desayuno') ? iconTildeHTML : iconEquisHTML}</td><td class="px-3 py-2">${atendido.includes('almuerzo') ? iconTildeHTML : iconEquisHTML}</td><td class="px-3 py-2">${atendido.includes('merienda') ? iconTildeHTML : iconEquisHTML}</td><td class="px-3 py-2">${atendido.includes('cena') ? iconTildeHTML : iconEquisHTML}</td></tr>`;
                        }
                        html += `</tbody></table></div></div></div>`; totalGeneral += reporte.total;
                    }
                }
                if (diasEncontrados === 0) { html = `<p class="text-gray-500">No se encontraron datos para el rango de fechas seleccionado.</p>`; downloadPDFContainer.classList.add('hidden'); } else { html += `<p class="font-bold text-lg mt-4 text-right">Total General del Periodo: ${totalGeneral}</p>`; downloadPDFContainer.classList.remove('hidden'); }
                reporteResultado.innerHTML = html;
            }

            // Listener para el formulario de rango de fechas (muestra vista previa)
            formReporte.addEventListener('submit', (e) => {
                e.preventDefault(); 
                const fechaInicio = document.getElementById('reporte-fecha-inicio').value;
                const fechaFin = document.getElementById('reporte-fecha-fin').value;
                if (!fechaInicio || !fechaFin) { alert("Por favor, seleccione fecha inicial y final."); return; }
                if (fechaInicio > fechaFin) { alert("La fecha inicial no puede ser posterior a la fecha final."); return; }
                console.log("Generando vista previa..."); 
                generarReporteHTMLVistaPrevia(fechaInicio, fechaFin); 
            });

            // Listener para el botón mensual (muestra vista previa)
            btnReporteMes.addEventListener('click', () => {
                console.log("Botón Reporte Mes presionado"); 
                const now = new Date(); const primerDia = new Date(now.getFullYear(), now.getMonth(), 1);
                const toISODate = (date) => date.toISOString().split('T')[0];
                const fechaInicio = toISODate(primerDia); const fechaFin = toISODate(now);
                document.getElementById('reporte-fecha-inicio').value = fechaInicio; document.getElementById('reporte-fecha-fin').value = fechaFin;
                generarReporteHTMLVistaPrevia(fechaInicio, fechaFin); 
            });
            
            // Listener para el botón de descarga PDF (llama a PHP)
            btnDownloadPDF.addEventListener('click', () => {
                console.log("[PDF] Botón Descargar PDF presionado. Redirigiendo a PHP..."); 
                const fechaInicio = document.getElementById('reporte-fecha-inicio').value; 
                const fechaFin = document.getElementById('reporte-fecha-fin').value;

                if (!fechaInicio || !fechaFin) {
                    alert("Por favor, asegúrese de que las fechas de inicio y fin estén seleccionadas.");
                    return;
                }
                if (fechaInicio > fechaFin) {
                     alert("La fecha inicial no puede ser posterior a la fecha final."); 
                     return;
                }

                // Construimos la URL con los parámetros
                const url = `generar_reporte_pdf.php?inicio=${encodeURIComponent(fechaInicio)}&fin=${encodeURIComponent(fechaFin)}`;
                
                // Abrimos la URL en una nueva pestaña. 
                // El script PHP se encargará de generar y forzar la descarga del PDF.
                window.open(url, '_blank'); 
                console.log("[PDF] Nueva pestaña abierta para:", url);
            });
            
            // --- LÓGICA ESTADÍSTICAS ---
            function loadEstadisticas() { const totalHoy = Object.values(reservasCountDB).reduce((a, b) => a + b, 0); const servicioMasConsumido = Object.entries(reservasCountDB).reduce((a, b) => a[1] > b[1] ? a : b); let html = `<p><span class="font-semibold">Fecha:</span> ${fechaHoy}</p><div class="mt-4 grid grid-cols-2 gap-4"><div><span class="font-semibold text-blue-600">Desayuno:</span> ${reservasCountDB.desayuno}</div><div><span class="font-semibold text-green-600">Almuerzo:</span> ${reservasCountDB.almuerzo}</div><div><span class="font-semibold text-yellow-600">Merienda:</span> ${reservasCountDB.merienda}</div><div><span class="font-semibold text-indigo-600">Cena:</span> ${reservasCountDB.cena}</div></div><div class="mt-4 pt-4 border-t"><p><span class="font-semibold">Servicio más consumido:</span> <span class="capitalize font-bold">${servicioMasConsumido[0]}</span> (${servicioMasConsumido[1]} reservas)</p><p><span class="font-semibold">Cantidad Total de Reservas:</span> <span class="font-bold text-xl">${totalHoy}</span></p><p class="mt-2"><span class="font-semibold">Observaciones:</span> ${obsHoy}</p></div>`; estadisticasContenido.innerHTML = html; }

            // --- INICIALIZACIÓN ---
            function init() { 
                updateRealTimeCounts(); 
                populateCursos(addAñoSelect.value, addCursoSelect); 
                loadEstadisticas(); 
                actualizarBotonesSistema(); // <-- Llama a la función al cargar
                console.log("Admin script initialized."); 
            }
            init();

        }); // Cierre del DOMContentLoaded