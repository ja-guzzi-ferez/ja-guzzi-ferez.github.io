// Configuración inicial
const variables = {
  'T2': {
    name: 'Temperatura a 2m (°C)',
    niveles: [-10, -7.5, -5, -2.5, 0, 2.5, 5, 7.5, 10, 12.5, 15, 17.5, 20, 22.5, 25, 27.5, 30, 32.5, 35, 37.5, 40],
    colores: ["#6a51a4", "#817dba", "#9d9ac7", "#bcbddc", "#7fcebb", "#41b7c5", "#1d91c0", "#225ea7", "#248444", "#40ab5d", "#78c67a", "#adde8f", "#d9f0a2", "#f7fcb9", "#ffd976", "#fdb24c", "#fd8c3c", "#fc4e2b", "#e21a1c", "#bc0126"],
    under: "#54278e",
    over: "#810026"
  },
  'RH2': {
    name: 'Humedad Relativa (%)',
    niveles: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
    colores: ["#a50026", "#d73027", "#f46d43", "#fdae61", "#fee08b", "#ffffbf", "#d9ef8b", "#a6d96a", "#66bd63", "#1a9850", "#006837"],
    under: "#54278e",
    over: "#4A0000"
  },
  'RAINC': {
    name: 'Precipitación Acumulada (mm)',
    niveles: [0, 0.05, 1, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 80, 90, 100, 200, 300],
    colores: ["#FFFFFF", "#CFF0FF", "#8ADFFE", "#3EBAED", "#00A9EE", "#BAFDEC", "#78F0CD", "#2BDCA8", "#FFFFCD", "#FFF09B", "#FFDE41", "#FFCA00", "#FFDECD", "#FCBA98", "#FFAC66", "#FC8618", "#FCBABB", "#FE7877", "#FF4246", "#EE0808", "#FF78CD"],
    under: "#FFFFFF",
    over: "#010101"
  },

  'RAINH': {
    name: 'Precipitación Horaria (mm)',
    niveles: [0, 0.05, 1, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 80, 90, 100, 200, 300],
    colores: ["#FFFFFF", "#CFF0FF", "#8ADFFE", "#3EBAED", "#00A9EE", "#BAFDEC", "#78F0CD", "#2BDCA8", "#FFFFCD", "#FFF09B", "#FFDE41", "#FFCA00", "#FFDECD", "#FCBA98", "#FFAC66", "#FC8618", "#FCBABB", "#FE7877", "#FF4246", "#EE0808", "#FF78CD"],
    under: "#FFFFFF",
    over: "#010101"
  }, 
  'VIENTO_INT': {

      name: 'Velocidad del Viento (km/h)',
      niveles: [0, 1, 5, 10, 15, 20, 30, 40, 55, 70, 85, 103, 119, 154, 178],
      colores: ["#E3F2FD", "#BBDEFB", "#90CAF9", "#64B5F6","#42A5F5", "#4DD0E1", "#26A69A", "#66BB6A", "#9CCC65", "#FDD835", "#FFB300","#FB8C00", "#F4511E", "#E53935"],
      under: "#54278e",

      over: "#4A0000",
  }
};

// Inicializar mapa
const map = L.map('map');

const mexicoBounds = [
  [14.5, -116.5], // Suroeste (Pacífico sur)
  [32.8, -86.5]   // Noreste (frontera norte / Golfo)
];

map.fitBounds(mexicoBounds);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 12,
  attribution: '© OpenStreetMap'
}).addTo(map);


const regiones = {
  republica_mexicana: { lat: 23.6345, lon: -102.5528, zoom: 5 },
  aguascalientes: { lat: 21.8853, lon: -102.2916, zoom: 7 },
  baja_california: { lat: 30.8406, lon: -115.2838, zoom: 6 },
  baja_california_sur: { lat: 26.0444, lon: -111.6661, zoom: 6 },
  campeche: { lat: 19.8301, lon: -90.5349, zoom: 7 },
  chiapas: { lat: 16.7569, lon: -93.1292, zoom: 7 },
  chihuahua: { lat: 28.6320, lon: -106.0691, zoom: 6 },
  ciudad_de_mexico: { lat: 19.4326, lon: -99.1332, zoom: 10 },
  coahuila: { lat: 27.0587, lon: -101.7068, zoom: 6 },
  colima: { lat: 19.2452, lon: -103.7241, zoom: 8 },
  durango: { lat: 24.0277, lon: -104.6532, zoom: 6 },
  estado_de_mexico: { lat: 19.4839, lon: -99.6899, zoom: 8 },
  guanajuato: { lat: 21.0190, lon: -101.2574, zoom: 7 },
  guerrero: { lat: 17.4392, lon: -99.5451, zoom: 7 },
  hidalgo: { lat: 20.0911, lon: -98.7624, zoom: 7 },
  jalisco: { lat: 20.6597, lon: -103.3496, zoom: 7 },
  michoacan: { lat: 19.5665, lon: -101.7068, zoom: 7 },
  morelos: { lat: 18.6813, lon: -99.1013, zoom: 8 },
  nayarit: { lat: 21.7514, lon: -104.8455, zoom: 7 },
  nuevo_leon: { lat: 25.5922, lon: -99.9962, zoom: 7 },
  oaxaca: { lat: 17.0732, lon: -96.7266, zoom: 7 },
  puebla: { lat: 19.0414, lon: -98.2063, zoom: 8 },
  queretaro: { lat: 20.5888, lon: -100.3899, zoom: 8 },
  quintana_roo: { lat: 19.1817, lon: -88.4791, zoom: 7 },
  san_luis_potosi: { lat: 22.1565, lon: -100.9855, zoom: 7 },
  sinaloa: { lat: 25.1721, lon: -107.4795, zoom: 6 },
  sonora: { lat: 29.0729, lon: -110.9559, zoom: 6 },
  tabasco: { lat: 17.8409, lon: -92.6189, zoom: 7 },
  tamaulipas: { lat: 24.2669, lon: -98.8363, zoom: 6 },
  tlaxcala: { lat: 19.3182, lon: -98.2375, zoom: 8 },
  veracruz: { lat: 19.1738, lon: -96.1342, zoom: 7 },
  yucatan: { lat: 20.7099, lon: -89.0943, zoom: 7 },
  zacatecas: { lat: 22.7709, lon: -102.5833, zoom: 7 }
};


document.getElementById("buscador").addEventListener("change", function(){
    const r = regiones[this.value];
    if(r){
        map.setView([r.lat, r.lon], r.zoom);
    }
});

// Variables globales
let currentVariable = 'T2'; // Variable por defecto
let currentTimeIndex = 0;
let availableTimes = {}; // Almacenará los tiempos disponibles por variable
let layers = {}; // Almacenará todas las capas por variable
let windDirectionLayers = {}; // Almacenará las capas de dirección del viento
let activeLayer = null;
let activeWindDirectionLayer = null;
let municipiosLayer = null;
let regionesLayer = null;
let windEnabled = false;
let currentModel = 'WRF';

const modelosConfig = {
  WRF: {
    basePath: 'geojsons',
    timesFile: 'geojsons/wrf_times.json'
  },
  GFS: {
    basePath: 'GFS',
    timesFile: 'GFS/GFS_times.json'
  },
  ECMWF: {
    basePath: 'ECMWF',
    timesFile: 'ECMWF/ECMWF_times.json'
  }
};



// Crear paneles personalizados
map.createPane('referencia');
map.getPane('referencia').style.zIndex = 650;

map.createPane('datosWrf');
map.getPane('datosWrf').style.zIndex = 600;

map.createPane('windDirection');
map.getPane('windDirection').style.zIndex = 700; // Mayor z-index para que esté encima

// Inicialización
initVariableSelector();
cargarCapasReferencia();
loadModelTimes().then(() => {
  updateSlider();
  updateLegend();
  loadCurrentVariable();
  llenarSelectTiempos();   
  initWindToggleButton();
  document.getElementById('modelos').value = 'WRF';
});


async function loadModelTimes() {
  const config = modelosConfig[currentModel];
  const res = await fetch(config.timesFile);
  const times = await res.json();

  for (const variable of Object.keys(variables)) {
    availableTimes[variable] = times;
  }
}


function formatearTiempo(t) {
  // t viene como "11_01_2026_02"
  const [dia, mes, anio, hora] = t.split('_');
  return `${dia}/${mes}/${anio} ${hora}:00`;
}

function llenarSelectTiempos() {
  const select = document.getElementById('extra-filters');
  select.innerHTML = ''; // limpiar

  const tiempos = availableTimes[currentVariable];
  if (!tiempos || tiempos.length === 0) return;

  tiempos.forEach((t, i) => {
    const option = document.createElement('option');
    option.value = i;                 // índice REAL
    option.textContent = formatearTiempo(t);
    select.appendChild(option);
  });

  // sincronizar con el slider actual
  select.value = document.getElementById('slider').value;
}

document.getElementById('extra-filters').addEventListener('change', function () {
  const index = parseInt(this.value);
  const slider = document.getElementById('slider');

  slider.value = index;
  slider.dispatchEvent(new Event('input'));
});




// Actualizar el slider según la variable seleccionada
function updateSlider() {
  const times = availableTimes[currentVariable] || [];
  const slider = document.getElementById('slider');
  const timeRange = document.getElementById('time-range');
  
  slider.min = 0;
  slider.max = Math.max(0, times.length - 1);
  slider.value = Math.min(currentTimeIndex, slider.max);
  
  timeRange.textContent = `Tiempo ${parseInt(slider.value) + 1} de ${times.length}`;
  updateTimeDisplay();
}

// Inicializar selector de variables
  function initVariableSelector() {

      const container = document.getElementById('variable-selector');

      // Ver si YA existe el select
      let select = document.getElementById("variable-select");

      // Si NO existe, lo creamos (no tocamos nada más del contenedor)
      if (!select) {
          select = document.createElement('select');
          select.id = "variable-select";
          select.style.width = "100%";
          select.style.padding = "6px";
          select.style.fontSize = "14px";
          select.style.borderRadius = "4px";
          container.prepend(select); // Lo mete arriba, sin borrar nada más
      }

      // Limpiar solo sus opciones, no el resto del contenedor
      select.innerHTML = "";

      // Insertar opciones basado en "variables"
      Object.keys(variables).forEach(varName => {
          const opt = document.createElement('option');
          opt.value = varName;
          opt.textContent = variables[varName].name;

          if (varName === currentVariable) opt.selected = true;

          select.appendChild(opt);
      });

      // Evento al cambiar variable (solo lo agregamos una vez)
      if (!select.dataset.listenerAdded) {
          select.addEventListener("change", () => {
              currentVariable = select.value;
              currentTimeIndex = 0;

              updateSlider();
              updateLegend();
              loadCurrentVariable();
          });

          select.dataset.listenerAdded = "1"; // Evita agregar varios listeners
      }
  }



// Cargar capas de referencia
function cargarCapasReferencia() {
  // Capa de municipios

  // Capa de regiones
  fetch('geojsons/repmex2.geojson')
    .then(res => res.json())
    .then(data => {
      regionesLayer = L.geoJSON(data, {
        style: {
          fillColor: 'transparent',
          fillOpacity: 0,
          color: '#000',
          weight: 1,
          opacity: 0.9
        },
        interactive: false,
        pane: 'referencia'
      }).addTo(map);
    })
    .catch(err => console.error('Error cargando estados:', err));
}

// Cargar la variable actual
function loadCurrentVariable() {
  const times = availableTimes[currentVariable] || [];
  if (times.length === 0) {
    document.getElementById('time-display').textContent = "No hay datos disponibles";
    return;

  }
  
  const timeStr = times[currentTimeIndex];
  const basePath = modelosConfig[currentModel].basePath;
  const filename = `${basePath}/${currentVariable}_${timeStr}.geojson`;

  
  // Si ya tenemos esta capa cargada, solo la mostramos
  if (layers[currentVariable] && layers[currentVariable][currentTimeIndex]) {
    if (activeLayer) map.removeLayer(activeLayer);
    activeLayer = layers[currentVariable][currentTimeIndex];
    map.addLayer(activeLayer);

    
    

    return;
  }
  

  // Si no, la cargamos
  fetch(filename)

    .then(res => {

      if (!res.ok) throw new Error(`Error al cargar ${filename}`);
      return res.json();

    })

    .then(data => {

      // Eliminar capa anterior si existe
      if (activeLayer) map.removeLayer(activeLayer);

      
      // Crear nueva capa
      const newLayer = L.geoJSON(data, {

        style: feature => getStyleForVariable(currentVariable, feature),
        onEachFeature: (feature, layer) => {
          if (feature.properties && feature.properties.rango) {
            layer.bindPopup(`<b>${variables[currentVariable].name}</b><br>Rango: ${feature.properties.rango}`);
          }
        },

        pane: 'datosWrf'
      });
      
      // Guardar en cache
      if (!layers[currentVariable]) layers[currentVariable] = [];
      layers[currentVariable][currentTimeIndex] = newLayer;
      
      // Mostrar

      activeLayer = newLayer;
      map.addLayer(newLayer);
      
      
      
      // Actualizar display de tiempo
      updateTimeDisplay();

      // Si el usuario tiene activados los vectores, sincronizarlos con el nuevo tiempo
      if (windEnabled) {
        loadWindDirectionLayer(timeStr);
      }

      updateWindToggleButton();


    })
    .catch(err => {
      console.error('Error al cargar GeoJSON:', err);
      document.getElementById('time-display').textContent = `Error cargando ${variables[currentVariable].name}`;
    });

}

function resetLayers() {
  if (activeLayer) {
    map.removeLayer(activeLayer);
    activeLayer = null;
  }

  if (activeWindDirectionLayer) {
    map.removeLayer(activeWindDirectionLayer);
    activeWindDirectionLayer = null;
  }

  layers = {};
}

document.getElementById('modelos').addEventListener('change', async function () {
  if (!this.value) return;

  currentModel = this.value;

  resetLayers();

  await loadModelTimes();

  currentTimeIndex = 0;
  updateSlider();
  llenarSelectTiempos();
  loadCurrentVariable();
});


// Función mejorada para cargar dirección del viento
function loadWindDirectionLayer(timeStr) {
    const basePath = modelosConfig[currentModel].basePath;
    const windDirFilename = `${basePath}/VIENTO_DIR_${timeStr}.geojson`;
  
    fetch(windDirFilename)
        .then(res => res.text())
        .then(text => {
            // Elimina TODOS los caracteres de escape y prefijos/sufijos
            const cleanText = text
                .replace(/\\"/g, '"')  // Elimina escapes de comillas
                .replace(/^[^{]*/, '') // Elimina texto antes del {

                .replace(/[^}]*$/, ''); // Elimina texto después del }
          
            try {
                const data = JSON.parse(cleanText);
              
                // Debug final

                console.log("JSON parseado:", data);
              
                // Crear capa
                if (activeWindDirectionLayer) map.removeLayer(activeWindDirectionLayer);
                activeWindDirectionLayer = L.geoJSON(data, {
                    style: { color: '#000000', weight: 2 }
                }).addTo(map);

              
                updateWindToggleButton();

            } catch (e) {

                throw new Error(`El archivo no es un GeoJSON válido. Error: ${e.message}`);

            }
        })
        .catch(err => {
            console.error("Error definitivo:", err);
            document.getElementById('time-display').textContent = 
                `Error: Verifica la consola (F12 > Console)`;
        });
}

// Añadir control para mostrar/ocultar vectores de viento
function initWindToggleButton() {
  const btn = document.getElementById("toggle-wind");

  btn.addEventListener("click", function () {

    // CASO 1: el viento YA existe y está visible → ocultar
    if (activeWindDirectionLayer && map.hasLayer(activeWindDirectionLayer)) {
      map.removeLayer(activeWindDirectionLayer);
      btn.textContent = "Mostrar Vectores";
      windEnabled = false;
      return;
    }

    // CASO 2: el viento YA existe pero está oculto → mostrar
    if (activeWindDirectionLayer && !map.hasLayer(activeWindDirectionLayer)) {
      map.addLayer(activeWindDirectionLayer);
      btn.textContent = "Ocultar Vectores";
      return;
    }

    // CASO 3: el viento NO existe todavía → CREARLO
    const times = availableTimes[currentVariable] || [];
    const timeStr = times[currentTimeIndex];
    if (!timeStr) return;

    windEnabled = true;
    loadWindDirectionLayer(timeStr);
    btn.textContent = "Ocultar Vectores";
  });
}


function updateWindToggleButton() {
  const btn = document.getElementById("toggle-wind");
  if (!btn) return;

  if (activeWindDirectionLayer && map.hasLayer(activeWindDirectionLayer)) {
      btn.textContent = "Ocultar Vectores";
  } else {
      btn.textContent = "Mostrar Vectores";
  }
}



// Obtener estilo según variable
function getStyleForVariable(varName, feature) {
  const config = variables[varName];

  const val = parseFloat(feature.properties.rango.split('–')[0] || feature.properties.rango.split('-')[0]);
  
  let color = '#000'; // fallback

  if (isNaN(val)) return { fillColor: color, fillOpacity: 0.8, color: '#333', weight: 0.1 };
  

  if (val < config.niveles[0]) color = config.under;
  else if (val >= config.niveles[config.niveles.length - 1]) color = config.over;
  else {
    for (let i = 0; i < config.niveles.length - 1; i++) {
      if (val >= config.niveles[i] && val < config.niveles[i + 1]) {
        color = config.colores[i];
        break;

      }
    }
  }
  

  return { fillColor: color, fillOpacity: 0.6, color: '#333', weight: 0.1 };
}

// Actualizar leyenda
function updateLegend() {
  const legend = document.getElementById('legend');

  if (!legend) return;
  
  const config = variables[currentVariable];
  if (!config) return;
  
  // Limpiar y reconstruir toda la leyenda
  legend.innerHTML = `
    <div class="legend-title">${config.name}</div>
  `;
  
  // Añadir items de leyenda
  for (let i = 0; i < config.niveles.length - 1; i++) {
    const from = config.niveles[i];
    const to = config.niveles[i + 1];
    const color = config.colores[i];
    
    const item = document.createElement('div');
    item.className = 'legend-item';
    item.innerHTML = `
      <i style="background:${color};"></i>
      <span class="legend-from">${from.toFixed(1)}</span>
      <span class="legend-dash">  –  </span>
      <span class="legend-to">${to.toFixed(1)}</span>
    `;
    legend.appendChild(item);
  }
  
  // Añadir extremos

  const itemUnder = document.createElement('div');
  itemUnder.innerHTML = `
    <i style="background:${config.under}; width:20px; height:20px; display:inline-block;"></i>
    < ${config.niveles[0].toFixed(1)}
  `;
  legend.appendChild(itemUnder);
  
  const itemOver = document.createElement('div');

  itemOver.innerHTML = `
    <i style="background:${config.over}; width:20px; height:20px; display:inline-block;"></i>
    ≥ ${config.niveles[config.niveles.length - 1].toFixed(1)}
  `;

  legend.appendChild(itemOver);
}

// Actualizar display de tiempo
function updateTimeDisplay() {
  const times = availableTimes[currentVariable] || [];
  if (times.length === 0) {
    document.getElementById('time-display').textContent = "No hay datos disponibles";

    return;

  }

  
  const timeStr = times[currentTimeIndex];
  const [dia, mes, año, hora] = timeStr.split('_');
  document.getElementById('time-display').textContent = `Fecha: ${dia}-${mes}-${año} Hora: ${hora}`;
}

// Control de slider
document.getElementById('slider').addEventListener('input', function() {

  currentTimeIndex = parseInt(this.value);
  updateTimeDisplay();
  loadCurrentVariable();

  document.getElementById('extra-filters').value = this.value;

});

let playInterval = null;

document.getElementById('playBtn').addEventListener('click', () => {
  document.getElementById('playBtn').style.display = 'none';
  document.getElementById('pauseBtn').style.display = 'inline';



  playInterval = setInterval(() => {

    const slider = document.getElementById('slider');

    if (parseInt(slider.value) < parseInt(slider.max)) {
      slider.value = parseInt(slider.value) + 1;
      currentTimeIndex = parseInt(slider.value);
      updateSlider();
      loadCurrentVariable();

    } else {

      clearInterval(playInterval);

      document.getElementById('playBtn').style.display = 'inline';
      document.getElementById('pauseBtn').style.display = 'none';
    }
  }, 800); // Velocidad de reproducción (milisegundos)

});

document.getElementById('pauseBtn').addEventListener('click', () => {
  clearInterval(playInterval);
  document.getElementById('playBtn').style.display = 'inline';
  document.getElementById('pauseBtn').style.display = 'none';
});

document.getElementById('prevBtn').addEventListener('click', () => {
  const slider = document.getElementById('slider');
  if (parseInt(slider.value) > parseInt(slider.min)) {
    slider.value = parseInt(slider.value) - 1;

    currentTimeIndex = parseInt(slider.value);

    updateSlider();
    loadCurrentVariable();
  }
});

document.getElementById('nextBtn').addEventListener('click', () => {
  const slider = document.getElementById('slider');
  if (parseInt(slider.value) < parseInt(slider.max)) {
    slider.value = parseInt(slider.value) + 1;
    currentTimeIndex = parseInt(slider.value);
    updateSlider();

    loadCurrentVariable();

  }
});



