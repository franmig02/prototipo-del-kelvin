// *** Este archivo es 100% INDEPENDIENTE y maneja la lógica completa del formulario móvil. ***

// *** 🎯 URL DE TU GOOGLE APPS SCRIPT ***
const GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwB0ILClDlyofK7TKouASLs0ppGuzbKU-FFMKm7o7xfv9qpyhiwlrl1dabfzwfbszt9hhq/exec"; 
// **********************************************************************

// =======================================================
// VARIABLES Y DOM
// =======================================================
let currentStep = 1; 
const totalSteps = 3; // 3 pasos (Personal, Composición, Salud)
const labels = ["Datos Personales", "Composición Corporal", "Historial Salud"]; 

const clientForm = document.getElementById('clientForm');
const pesoInput = document.getElementById('peso_kg');
const estaturaInput = document.getElementById('estatura_cm');
const imcInput = document.getElementById('imc');


// =======================================================
// FUNCIONES DE NAVEGACIÓN Y CÁLCULO
// =======================================================

/**
 * Función genérica para mostrar/ocultar pestañas.
 * Se incluye para mantener paridad con app.js, aunque no es usada 
 * por la navegación por pasos del móvil.
 */
window.showTab = (tabId) => {
    // Busca todos los elementos que podrían actuar como contenido de pestaña
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    // Busca todos los elementos que podrían actuar como botones de pestaña
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });

    const activeTab = document.getElementById(tabId);
    if (activeTab) {
        activeTab.classList.add('active');
        // Intenta activar el botón si existe (usando la notación de atributo onclick)
        const activeButton = document.querySelector(`.tab-button[onclick="showTab('${tabId}')"]`);
        if(activeButton) {
             activeButton.classList.add('active');
        }
    }
};

/**
 * Actualiza la interfaz de navegación (barra y etiquetas de pasos).
 */
const updateUI = () => {
    // 1. Ocultar todas las tarjetas y mostrar la actual
    document.querySelectorAll('.card').forEach(card => card.classList.remove('active'));
    const activeCard = document.getElementById(`step${currentStep}`);
    if (activeCard) {
        activeCard.classList.add('active');
         const scrollArea = activeCard.querySelector('.card-scroll-area');
         if(scrollArea) scrollArea.scrollTop = 0;
    }
    
    // 2. Actualizar barra de progreso y etiquetas
    const progressPct = (currentStep / totalSteps) * 100;
    document.getElementById('progressBar').style.width = `${progressPct}%`;
    document.getElementById('stepCounter').innerText = `${currentStep}/${totalSteps}`;
    document.getElementById('stepLabel').innerText = labels[currentStep - 1];
};

/**
 * Avanza al siguiente paso (maneja validación).
 */
window.nextStep = (step) => {
    const currentCard = document.getElementById('step' + step);
    const requiredInputs = currentCard.querySelectorAll('input[required], select[required]');
    let valid = true;

    // Validación de campos requeridos (el código de validación se mantiene)
    requiredInputs.forEach(input => {
        if (!input.value) {
            valid = false;
            input.style.borderColor = '#ef4444'; 
            input.animate([{transform:'translateX(0)'},{transform:'translateX(-5px)'},{transform:'translateX(5px)'},{transform:'translateX(0)'}], {duration:300});
        } else {
            input.style.borderColor = '#e5e7eb';
        }
    });
    
    if (valid && currentStep < totalSteps) {
        currentStep++;
        updateUI();
    }
};

/**
 * Regresa al paso anterior.
 */
window.prevStep = (step) => {
    if (currentStep > 1) {
        currentStep--;
        updateUI();
    }
};

/**
 * Calcula el IMC automáticamente.
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

// =======================================================
// LÓGICA DE INICIALIZACIÓN Y ENVÍO (POST)
// =======================================================
document.addEventListener('DOMContentLoaded', () => {

    // Inicializar la interfaz de pasos
    updateUI(); 

    // Event Listeners para el IMC
    if(pesoInput && estaturaInput) {
        pesoInput.addEventListener('input', calculateIMC);
        estaturaInput.addEventListener('input', calculateIMC);
    }

    // LÓGICA DE ENVÍO DE DATOS (POST)
    if(clientForm) {
        clientForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = clientForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn ? submitBtn.innerText : 'Guardar';
            if(submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerText = "Guardando...";
            }

            // Recolección de datos
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
                
                // Los campos de medidas se envían como null (eliminados del formulario móvil)
                med_brazos: null, 
                med_pecho: null,
                med_cintura: null,
                med_caderas: null,
                med_piernas: null,

                enfermedades_lesiones: document.getElementById('enfermedades_lesiones').value,
                alergias: document.getElementById('alergias').value,
                cirugias_recientes: document.getElementById('cirugias_recientes').value,
                medicamentos_actuales: document.getElementById('medicamentos_actuales').value,
                estres_sueno: document.getElementById('estres_sueno').value,
                timestamp: new Date().toISOString() 
            };
            
            if (!formData.nombre_completo || !formData.fecha_evaluacion) {
                alert('Por favor, completa el Nombre Completo y la Fecha de Evaluación.');
                if(submitBtn) { submitBtn.disabled = false; submitBtn.innerText = originalBtnText; }
                return;
            }

            // Envío a Google Apps Script
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
                    alert('¡Cliente registrado con éxito en Google Sheets!');
                    clientForm.reset(); 
                    calculateIMC(); 
                    
                    // Reiniciar al paso 1 después del éxito
                    currentStep = 1;
                    updateUI();
                } else {
                    alert('Error al guardar: ' + (result.message || 'Error desconocido'));
                }

            } catch (error) {
                console.error('Error de conexión:', error);
                alert('Error de red. Verifica tu conexión y la URL del script.');
            } finally {
                if(submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerText = originalBtnText;
                }
            }
        });
    }
});