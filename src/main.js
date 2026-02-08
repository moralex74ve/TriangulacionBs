const precioDolarInput = document.getElementById('precioDolar');
const cambioCOPInput = document.getElementById('cambioCOP');
const costoInput = document.getElementById('costoInput');
const resBsDisplay = document.getElementById('resBs');
const resCopDisplay = document.getElementById('resCop');
const fetchDolarBtn = document.getElementById('fetchDolar');
const labelCosto = document.getElementById('labelCosto');
const labelResultMain = document.getElementById('labelResultMain');
const labelResultAlt = document.getElementById('labelResultAlt');
const currencyRadios = document.querySelectorAll('input[name="currency"]');

// Cargar valores guardados al iniciar
window.addEventListener('DOMContentLoaded', () => {
    const savedPrecio = localStorage.getItem('precioDolar');
    const savedCambio = localStorage.getItem('cambioCOP');
    const savedCosto = localStorage.getItem('costoInput');
    const savedCurrency = localStorage.getItem('selectedCurrency') || 'BS';

    if (savedPrecio) precioDolarInput.value = savedPrecio;
    if (savedCambio) cambioCOPInput.value = savedCambio;
    if (savedCosto) costoInput.value = savedCosto;

    const radioToSelect = document.querySelector(`input[name="currency"][value="${savedCurrency}"]`);
    if (radioToSelect) radioToSelect.checked = true;

    updateLabels();
    calculate();
});

function saveToLocal() {
    const selectedCurrency = document.querySelector('input[name="currency"]:checked')?.value || 'BS';
    localStorage.setItem('precioDolar', precioDolarInput.value);
    localStorage.setItem('cambioCOP', cambioCOPInput.value);
    localStorage.setItem('costoInput', costoInput.value);
    localStorage.setItem('selectedCurrency', selectedCurrency);
}

function updateLabels() {
    const selectedCurrency = document.querySelector('input[name="currency"]:checked')?.value || 'BS';

    if (selectedCurrency === 'USD') {
        labelCosto.innerText = 'Costo en Dollar de articulo';
        costoInput.placeholder = 'Monto en USD';
        labelResultMain.innerText = 'Costo en Bs.';
        labelResultAlt.innerText = 'Monto en COP';
    } else if (selectedCurrency === 'COP') {
        labelCosto.innerText = 'Costo en Pesos de articulo';
        costoInput.placeholder = 'Monto en COP';
        labelResultMain.innerText = 'Costo en Bs.';
        labelResultAlt.innerText = 'Monto en Dollar';
    } else { // BS
        labelCosto.innerText = 'Costo en Bs de articulo';
        costoInput.placeholder = 'Monto en Bs';
        labelResultMain.innerText = 'Costo en COP';
        labelResultAlt.innerText = 'Monto en Dollar';
    }
}

function calculate() {
    const precioDolar = parseFloat(precioDolarInput.value) || 0;
    const cambioCOP = parseFloat(cambioCOPInput.value) || 0;
    const montoInput = parseFloat(costoInput.value) || 0;
    const selectedCurrency = document.querySelector('input[name="currency"]:checked')?.value || 'BS';

    let resultMain = 0;
    let resultAlt = 0;

    if (selectedCurrency === 'USD') {
        // Modo Dólar: Bs = Monto USD * Precio Dollar
        resultMain = montoInput * precioDolar;
        // COP = Bs * Cambio por COP
        resultAlt = resultMain * cambioCOP;
    } else if (selectedCurrency === 'COP') {
        // Modo Pesos: Bs = Monto Pesos / Cambio por COP
        resultMain = cambioCOP > 0 ? montoInput / cambioCOP : 0;
        // Dollar = Bs / Precio de Dollar
        resultAlt = precioDolar > 0 ? resultMain / precioDolar : 0;
    } else { // Modo BS
        // COP = Monto Bs * Cambio por COP
        resultMain = montoInput * cambioCOP;
        // Dollar = Monto Bs / Precio de Dollar
        resultAlt = precioDolar > 0 ? montoInput / precioDolar : 0;
    }

    resBsDisplay.innerText = resultMain.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    resCopDisplay.innerText = resultAlt.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    saveToLocal();
}

currencyRadios.forEach(radio => {
    radio.addEventListener('change', () => {
        updateLabels();
        calculate();
    });
});

async function scrapeBCV(e) {
    if (e) e.preventDefault();
    if (fetchDolarBtn.disabled) return;

    fetchDolarBtn.disabled = true;
    fetchDolarBtn.classList.add('loading');

    try {
        const apiResponse = await fetch('https://ve.dolarapi.com/v1/dolares/oficial');
        if (apiResponse.ok) {
            const data = await apiResponse.json();
            if (data && data.promedio) {
                precioDolarInput.value = data.promedio;
                calculate();
                return;
            }
        }
    } catch (error) {
        console.warn('Error al obtener tasa BCV:', error);
    } finally {
        setTimeout(() => {
            fetchDolarBtn.disabled = false;
            fetchDolarBtn.classList.remove('loading');
        }, 500);
    }
}

[precioDolarInput, cambioCOPInput, costoInput].forEach(input => {
    input.addEventListener('input', calculate);
});

fetchDolarBtn.addEventListener('click', scrapeBCV);
