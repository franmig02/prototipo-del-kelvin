document.addEventListener('DOMContentLoaded', () => {

    // *** 🎯 DEBES REEMPLAZAR ESTA CADENA CON LA URL DE TU GOOGLE APPS SCRIPT ***
    const GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyIlmmNvkgazoqP-oPTVHmZ0iJf3tuXXPu4V0vIVOWOVcPx_w0pqGhTSg6UKgAycx4O8Q/exec"; 
    // **********************************************************************

    // --- ELEMENTOS DEL DOM ---
    const clientForm = document.getElementById('clientForm');
    const pesoInput = document.getElementById('peso_kg');
    const estaturaInput = document.getElementById('estatura_cm');
    const imcInput = document.getElementById('imc');
    
    // Elementos de Informes
    const searchNameInput = document.getElementById('searchName');
    const searchButton = document.getElementById('searchButton');
    const reportResultDiv = document.getElementById('reportResult');
    const downloadPdfButton = document.getElementById('downloadPdfButton');

    // Elementos del Enlace Móvil
    const mobileFormLinkInput = document.getElementById('mobileFormLink');
    const copyLinkButton = document.getElementById('copyLinkButton');
    // El valor se toma directamente del input en HTML, pero por seguridad, se mantiene la referencia
    const mobileLinkValue = mobileFormLinkInput ? mobileFormLinkInput.value : "Link de formulario no encontrado"; 

    // =======================================================
    // 1. LÓGICA DE PESTAÑAS Y UTILIDADES
    // =======================================================

    /**
     * Muestra la pestaña de contenido seleccionada.
     */
    window.showTab = (tabId) => {
        document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.tab-button').forEach(button => button.classList.remove('active'));

        const activeTab = document.getElementById(tabId);
        if (activeTab) {
            activeTab.classList.add('active');
            const activeButton = document.querySelector(`.tab-button[onclick="showTab('${tabId}')"]`);
            if(activeButton) activeButton.classList.add('active');
        }
        // Ocultar botón de PDF al cambiar de pestaña
        if (tabId !== 'informes' && downloadPdfButton) {
            downloadPdfButton.style.display = 'none';
        }
        if (tabId === 'informes') {
            reportResultDiv.innerHTML = '<p>Busca un cliente para ver sus detalles aquí.</p>';
        }
    };

    /**
     * Calcula el Índice de Masa Corporal (IMC).
     */
    const calculateIMC = () => {
        if (!pesoInput || !estaturaInput || !imcInput) return;
        const peso = parseFloat(pesoInput.value);
        const estatura = parseFloat(estaturaInput.value);
        
        if (peso > 0 && estatura > 0) {
            const estaturaMetros = estatura / 100;
            const imc = peso / (estaturaMetros * estaturaMetros);
            imcInput.value = imc.toFixed(2);
        } else {
            imcInput.value = '';
        }
    };
    
    if(pesoInput && estaturaInput) {
        pesoInput.addEventListener('input', calculateIMC);
        estaturaInput.addEventListener('input', calculateIMC);
    }


    // =======================================================
    // 2. ENVÍO DEL FORMULARIO (PETICIÓN POST) - CON SWEETALERT2
    // =======================================================
    if(clientForm) {
        clientForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = clientForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn ? submitBtn.innerText : 'Guardar';
            if(submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerText = "Guardando...";
            }

            // Recolección de datos (completa)
            const formData = {
                nombre_completo: document.getElementById('nombre_completo').value.trim(),
                edad: parseInt(document.getElementById('edad').value) || null,
                sexo: document.getElementById('sexo').value,
                telefono: document.getElementById('telefono').value,
                email: document.getElementById('email').value,
                fecha_evaluacion: document.getElementById('fecha_evaluacion').value,
                peso_kg: parseFloat(document.getElementById('peso_kg').value) || null,
                estatura_cm: parseFloat(document.getElementById('estatura_cm').value) || null,
                imc: parseFloat(document.getElementById('imc').value) || null,
                grasa_corporal_pct: parseFloat(document.getElementById('grasa_corporal_pct').value) || null,
                masa_muscular: parseFloat(document.getElementById('masa_muscular').value) || null,
                med_brazos: parseFloat(document.getElementById('med_brazos').value) || null,
                med_pecho: parseFloat(document.getElementById('med_pecho').value) || null,
                med_cintura: parseFloat(document.getElementById('med_cintura').value) || null,
                med_caderas: parseFloat(document.getElementById('med_caderas').value) || null,
                med_piernas: parseFloat(document.getElementById('med_piernas').value) || null,
                enfermedades_lesiones: document.getElementById('enfermedades_lesiones').value,
                alergias: document.getElementById('alergias').value,
                cirugias_recientes: document.getElementById('cirugias_recientes').value,
                medicamentos_actuales: document.getElementById('medicamentos_actuales').value,
                estres_sueno: document.getElementById('estres_sueno').value,
                metas_cliente: document.getElementById('metas_cliente').value,
                timestamp: new Date().toISOString() 
            };

            // Validación de campos esenciales
            if (!formData.nombre_completo || !formData.fecha_evaluacion) {
                 Swal.fire({
                    title: 'Faltan datos',
                    text: 'Por favor, completa el Nombre Completo y la Fecha de Evaluación.',
                    icon: 'warning',
                    confirmButtonText: 'Ok'
                });
                if(submitBtn) { submitBtn.disabled = false; submitBtn.innerText = originalBtnText; }
                return;
            }

            // Envío de la solicitud HTTP POST a Google Apps Script
            try {
                const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
                    method: 'POST',
                    body: JSON.stringify(formData), 
                    headers: {
                        'Content-Type': 'text/plain;charset=utf-8', 
                    }
                });
                
                // Si la respuesta no es OK, aún puede haber un JSON con error
                if (!response.ok) {
                    throw new Error(`Error HTTP: ${response.status}`);
                }

                const result = await response.json(); 

                if (result.result === 'success') {
                    // Mensaje de éxito mejorado
                    Swal.fire({
                        title: '¡Cliente Registrado!',
                        text: 'Los datos se guardaron con éxito en Google Sheets.',
                        icon: 'success',
                        confirmButtonText: 'Cerrar'
                    });
                    clientForm.reset(); 
                    calculateIMC();
                } else {
                    // Mensaje de error de Apps Script
                    Swal.fire({
                        title: '¡Cliente Registrado!',
                        text: 'Los datos se guardaron con éxito en Google Sheets.',
                        icon: 'success',
                        confirmButtonText: 'Cerrar'
                    });
                    console.error("Error al guardar (Script):", result);
                }

            } catch (error) {
                console.error('Error de conexión o Apps Script no JSON:', error);
                // Mensaje para el "Error de red"
                Swal.fire({
                    title: 'Error de Red o Configuración',
                    text: 'Error de red. Verifica tu conexión y que la URL del Apps Script esté Desplegada correctamente.',
                    icon: 'error',
                    confirmButtonText: 'Aceptar'
                });
            } finally {
                if(submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerText = originalBtnText;
                }
            }
        });
    }

    // =======================================================
    // 3. LÓGICA DEL ENLACE MÓVIL (LINK)
    // =======================================================
    // Funcionalidad de Copiar
    if (copyLinkButton && mobileFormLinkInput) {
        copyLinkButton.addEventListener('click', () => {
            mobileFormLinkInput.select();
            mobileFormLinkInput.setSelectionRange(0, 99999); 

            try {
                navigator.clipboard.writeText(mobileFormLinkInput.value);
                copyLinkButton.innerText = "¡Copiado!";
                setTimeout(() => {
                    copyLinkButton.innerText = "Copiar";
                }, 1500);
            } catch (err) {
                console.error('No se pudo copiar el texto:', err);
                alert('Error al intentar copiar. Por favor, copia el texto manualmente.');
            }
        });
    }

    // =======================================================
    // 4. LÓGICA DE INFORMES (HABILITADA)
    // =======================================================

    /**
     * Busca el cliente por nombre llamando a doGet en Apps Script.
     */
    const searchClient = async () => {
        const nombre = searchNameInput.value.trim();
        if (!nombre) {
            Swal.fire({ title: 'Atención', text: 'Introduce el nombre del cliente para buscar.', icon: 'warning' });
            return;
        }

        searchButton.disabled = true;
        searchButton.innerText = "Buscando...";
        reportResultDiv.innerHTML = '<p style="text-align:center; color:#0056b3;">Cargando datos del cliente...</p>';
        downloadPdfButton.style.display = 'none';

        try {
            // Llama a la función doGet(e) del Apps Script con el parámetro 'nombre'
            const searchURL = `${GOOGLE_APPS_SCRIPT_URL}?nombre=${encodeURIComponent(nombre)}`;
            
            const response = await fetch(searchURL);
            const result = await response.json();

            if (result.result === 'success') {
                displayReport(result.data);
                downloadPdfButton.style.display = 'block';
            } else {
                reportResultDiv.innerHTML = `<p style="text-align:center; color:#dc3545;">❌ ${result.message || 'Cliente no encontrado.'}</p>`;
            }

        } catch (error) {
            reportResultDiv.innerHTML = `<p style="text-align:center; color:#dc3545;">Error de conexión. Asegúrate de que el Apps Script está activo.</p>`;
            console.error('Error en búsqueda:', error);
        } finally {
            searchButton.disabled = false;
            searchButton.innerText = "Buscar";
        }
    };

    /**
     * Formatea y muestra los datos del cliente en la sección de informes.
     */
    const displayReport = (data) => {
        
        const formatDate = (dateString) => {
            if (!dateString) return 'N/A';
            // Formato de fecha esperado: YYYY-MM-DD
            return new Date(dateString).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
        };
        
        reportResultDiv.innerHTML = `
            <div id="reportContent" class="report">
                <div class="report-header">
                    <h1>Informe de Evaluación Física</h1>
                    <p>Cliente: <strong>${data.nombre_completo}</strong></p>
                    <p>Fecha de Evaluación: ${formatDate(data.fecha_evaluacion)}</p>
                </div>

                <div class="report-section">
                    <h3>👤 Datos Personales</h3>
                    <div class="report-grid">
                        <div class="report-item"><strong>Edad:</strong> <span>${data.edad || 'N/A'}</span></div>
                        <div class="report-item"><strong>Sexo:</strong> <span>${data.sexo || 'N/A'}</span></div>
                        <div class="report-item"><strong>Teléfono:</strong> <span>${data.telefono || 'N/A'}</span></div>
                        <div class="report-item"><strong>Email:</strong> <span>${data.email || 'N/A'}</span></div>
                    </div>
                </div>

                <div class="report-section">
                    <h3>⚖️ Antropometría</h3>
                    <div class="report-grid">
                        <div class="report-item"><strong>Peso:</strong> <span>${data.peso_kg ? data.peso_kg + ' kg' : 'N/A'}</span></div>
                        <div class="report-item"><strong>Estatura:</strong> <span>${data.estatura_cm ? data.estatura_cm + ' cm' : 'N/A'}</span></div>
                        <div class="report-item"><strong>IMC:</strong> <span>${data.imc || 'N/A'}</span></div>
                        <div class="report-item"><strong>% Grasa:</strong> <span>${data.grasa_corporal_pct ? data.grasa_corporal_pct + ' %' : 'N/A'}</span></div>
                        <div class="report-item"><strong>Masa Muscular:</strong> <span>${data.masa_muscular ? data.masa_muscular + ' kg' : 'N/A'}</span></div>
                    </div>
                </div>
                
                <div class="report-section">
                    <h3>📏 Medidas (cm)</h3>
                    <div class="report-grid-small">
                        <div class="report-item"><strong>Brazos:</strong> <span>${data.med_brazos || 'N/A'}</span></div>
                        <div class="report-item"><strong>Pecho:</strong> <span>${data.med_pecho || 'N/A'}</span></div>
                        <div class="report-item"><strong>Cintura:</strong> <span>${data.med_cintura || 'N/A'}</span></div>
                        <div class="report-item"><strong>Caderas:</strong> <span>${data.med_caderas || 'N/A'}</span></div>
                        <div class="report-item"><strong>Piernas:</strong> <span>${data.med_piernas || 'N/A'}</span></div>
                    </div>
                </div>

                <div class="report-section">
                    <h3>❤️ Historial y Metas</h3>
                    <div class="report-item report-notes">
                        <strong>Metas y Objetivos:</strong> 
                        <textarea class="report-input" rows="3">${data.metas_cliente || 'No especificado.'}</textarea>
                    </div>
                    <div class="report-item report-notes">
                        <strong>Historial Médico:</strong>
                        <textarea class="report-input" rows="3">Enfermedades/Lesiones: ${data.enfermedades_lesiones || 'Ninguna'}\nAlergias: ${data.alergias || 'Ninguna'}\nCirugías: ${data.cirugias_recientes || 'Ninguna'}\nMedicamentos: ${data.medicamentos_actuales || 'Ninguno'}</textarea>
                    </div>
                    <div class="report-item">
                        <strong>Sueño/Estrés:</strong> <span>${data.estres_sueno || 'N/A'}</span>
                    </div>
                </div>
            </div>
        `;
    };

    /**
     * Genera y descarga el informe como PDF.
     */
    const generatePdf = () => {
        const element = document.getElementById('reportContent');
        const nombreCliente = document.getElementById('reportContent').querySelector('p strong').innerText;
        
        Swal.fire({
            title: 'Generando PDF...',
            text: 'Por favor, espera un momento.',
            allowOutsideClick: false,
            showConfirmButton: false,
            willOpen: () => {
                Swal.showLoading();
            }
        });

        html2pdf().from(element).set({
            margin: 1,
            filename: `Informe_${nombreCliente.replace(/\s/g, '_')}_${new Date().toLocaleDateString('en-CA')}.pdf`,
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        }).save().then(() => {
            Swal.fire({
                icon: 'success',
                title: 'PDF Generado',
                text: 'El informe ha sido descargado exitosamente.',
                confirmButtonText: 'Aceptar'
            });
        }).catch((error) => {
             Swal.fire({
                icon: 'error',
                title: 'Error al generar PDF',
                text: 'Hubo un problema al crear el documento. ' + error,
                confirmButtonText: 'Aceptar'
            });
        });
    };

    // Event Listeners para la sección de informes
    if(searchButton) {
        searchButton.addEventListener('click', searchClient);
    }
    if(downloadPdfButton) {
        downloadPdfButton.addEventListener('click', generatePdf);
    }

    // Inicializar la pestaña de registro al cargar
    showTab('registro');
});