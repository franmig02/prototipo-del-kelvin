document.addEventListener('DOMContentLoaded', () => {

    // *** 🎯 IMPORTANTE: ASEGÚRATE DE QUE ESTA URL SEA LA DE TU IMPLEMENTACIÓN ACTUAL ***
    // Si volviste a desplegar el script como "Nueva implementación", la URL cambió.
    const GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxZ_lsNOECVi2RxbANScWR6kgAmTneNbkPXL9RWER_SK5tP-QEyUXUT3BlgT4XLJBFWyQ/exec"; 
    // **********************************************************************

    const clientForm = document.getElementById('clientForm');
    const pesoInput = document.getElementById('peso_kg');
    const estaturaInput = document.getElementById('estatura_cm');
    const imcInput = document.getElementById('imc');
    
    const searchButton = document.getElementById('searchButton');
    const reportResultDiv = document.getElementById('reportResult');
    const downloadPdfButton = document.getElementById('downloadPdfButton');


    // --- LÓGICA DE PESTAÑAS ---
    window.showTab = (tabId) => {
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelectorAll('.tab-button').forEach(button => {
            button.classList.remove('active');
        });

        document.getElementById(tabId).classList.add('active');
        document.querySelector(`.tab-button[onclick="showTab('${tabId}')"]`).classList.add('active');
    };
    
    // --- LÓGICA DEL FORMULARIO DE REGISTRO ---

    // 1. Cálculo automático de IMC
    const calculateIMC = () => {
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
    pesoInput.addEventListener('input', calculateIMC);
    estaturaInput.addEventListener('input', calculateIMC);

    // 2. Envío del formulario: Con corrección CORS
    clientForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Recolectar datos del formulario
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
            timestamp: new Date().toISOString() 
        };

        if (!formData.nombre_completo || !formData.fecha_evaluacion) {
            alert('Por favor, completa el Nombre Completo y la Fecha de Evaluación.');
            return;
        }

        // Envío de la solicitud HTTP POST a Google Apps Script
        try {
            // *** CORRECCIÓN AQUÍ ***
            const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify(formData), 
                // Usamos text/plain para evitar la verificación estricta de CORS que causa el error
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8', 
                }
            });

            const result = await response.json();

            if (result.result === 'success') {
                alert('¡Cliente registrado con éxito en Google Sheets!');
                clientForm.reset(); 
                calculateIMC();
            } else {
                console.error("Error al guardar (Script):", result);
                alert('Error: ' + (result.message || result.error || 'Desconocido'));
            }

        } catch (error) {
            console.error('Error de conexión:', error);
            alert('Error de red. Verifica que la URL del script sea correcta y tengas internet.');
        }
    });

    // --- FUNCIONALIDAD DE INFORMES ---
    
    searchButton.addEventListener('click', async () => {
        const searchName = document.getElementById('searchName').value.trim();
        
        if (!searchName) {
            alert('Por favor escribe un nombre para buscar.');
            return;
        }

        reportResultDiv.innerHTML = '<p>Buscando datos...</p>';
        downloadPdfButton.style.display = 'none';

        try {
            // Usamos GET. Aquí NO usamos 'no-cors' porque necesitamos leer la respuesta.
            // Como el script está público ("Cualquier usuario"), esto funcionará.
            const urlWithParams = `${GOOGLE_APPS_SCRIPT_URL}?nombre=${encodeURIComponent(searchName)}`;
            
            const response = await fetch(urlWithParams);
            const result = await response.json();

            if (result.result === 'success') {
                const data = result.data;
                
                // Renderizar el informe en HTML usando las clases de tu CSS
                const htmlContent = `
                    <div class="report">
                        <div class="report-header">
                            <h1>Informe de Evaluación Física</h1>
                            <p>Cliente: <strong>${data.nombre}</strong></p>
                            <p>Fecha: ${new Date(data.fecha).toLocaleDateString()}</p>
                        </div>
                        
                        <div class="report-section">
                            <h3>Datos Generales</h3>
                            <div class="report-grid">
                                <div class="report-item"><strong>Edad:</strong> ${data.edad} años</div>
                                <div class="report-item"><strong>Peso:</strong> ${data.peso} kg</div>
                                <div class="report-item"><strong>Estatura:</strong> ${data.estatura} cm</div>
                                <div class="report-item" style="background-color: #e3f2fd;"><strong>IMC:</strong> ${data.imc}</div>
                            </div>
                        </div>

                        <div class="report-section">
                            <h3>Composición Corporal</h3>
                            <div class="report-grid">
                                <div class="report-item"><strong>% Grasa:</strong> ${data.grasa}%</div>
                                <div class="report-item"><strong>Masa Muscular:</strong> ${data.musculo} kg</div>
                            </div>
                        </div>

                        <div class="report-section">
                            <h3>Medidas (cm)</h3>
                            <div class="report-grid">
                                <div class="report-item"><strong>Brazos:</strong> ${data.medidas.brazos}</div>
                                <div class="report-item"><strong>Pecho:</strong> ${data.medidas.pecho}</div>
                                <div class="report-item"><strong>Cintura:</strong> ${data.medidas.cintura}</div>
                                <div class="report-item"><strong>Caderas:</strong> ${data.medidas.caderas}</div>
                                <div class="report-item"><strong>Piernas:</strong> ${data.medidas.piernas}</div>
                            </div>
                        </div>
                        
                        <div class="report-section">
                           <h3>Notas de Salud</h3>
                           <div class="report-notes">
                               <p><strong>Lesiones/Enfermedades:</strong> ${data.salud.lesiones || 'Ninguna'}</p>
                               <p><strong>Medicamentos:</strong> ${data.salud.medicamentos || 'Ninguno'}</p>
                           </div>
                        </div>
                    </div>
                `;
                
                reportResultDiv.innerHTML = htmlContent;
                downloadPdfButton.style.display = 'block'; // Mostrar botón PDF
            } else {
                reportResultDiv.innerHTML = `<p style="color:red;">${result.message}</p>`;
            }

        } catch (error) {
            console.error(error);
            reportResultDiv.innerHTML = '<p style="color:red;">Error al buscar. Revisa la consola.</p>';
        }
    });

    // Funcionalidad PDF (usando html2pdf que ya tienes importado en index.html)
    downloadPdfButton.addEventListener('click', () => {
        const element = document.getElementById('reportResult');
        const opt = {
            margin:       10,
            filename:     'Informe_Cliente.pdf',
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2 },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        
        // Generar PDF
        html2pdf().set(opt).from(element).save();
    });

});