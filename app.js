document.addEventListener('DOMContentLoaded', () => {

    // *** 🎯 DEBES REEMPLAZAR ESTA CADENA CON LA URL QUE TE DIO APPS SCRIPT ***
    const GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwB0ILClDlyofK7TKouASLs0ppGuzbKU-FFMKm7o7xfv9QPyhIWlR1DabFzwfbszT"; 
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

    // 2. Envío del formulario: Ahora envía datos a Google Sheets
    clientForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Recolectar datos del formulario
        const formData = {
            // Se utiliza la clave/valor (Key/Value) que coincide con el encabezado de Google Sheets
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
            // Campo clave para registrar el momento (debe ser el primer encabezado en Sheets)
            timestamp: new Date().toISOString() 
        };

        if (!formData.nombre_completo || !formData.fecha_evaluacion) {
            alert('Por favor, completa el Nombre Completo y la Fecha de Evaluación.');
            return;
        }

        // Envío de la solicitud HTTP POST a Google Apps Script
        try {
            const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify(formData), 
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const result = await response.json();

            if (response.ok && result.result === 'success') {
                alert('¡Cliente registrado con éxito en Google Sheets! Revisa tu hoja de cálculo.');
                clientForm.reset(); 
                calculateIMC();
            } else {
                console.error("Error al guardar:", result.message);
                alert('Error al guardar los datos. Revisa la consola y la URL de Apps Script.');
            }

        } catch (error) {
            console.error('Error de conexión:', error);
            alert('Error de red o conexión al intentar guardar los datos.');
        }
    });

    // --- FUNCIONALIDAD DE INFORMES (DESHABILITADA) ---
    searchButton.addEventListener('click', () => {
        alert('Funcionalidad de búsqueda deshabilitada. Revisa la pestaña de informes para más detalles.');
    });

    downloadPdfButton.addEventListener('click', () => {
        alert('Funcionalidad de PDF deshabilitada. Necesitas un código de búsqueda (GET) en Apps Script para generar un informe.');
    });

    showTab('registro');
});