// ======================================================================
// SISTEMA DE PESTAÑAS
// ======================================================================
document.addEventListener('DOMContentLoaded', function() {
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabPanels = document.querySelectorAll('.tab-panel');
  let frentesInitialized = false;
  let cicloneInitialized = false;
  let modelosInitialized = false;
  let sateliteInitialized = false;
  
  tabButtons.forEach(button => {
    button.addEventListener('click', function() {
      const targetTab = this.getAttribute('data-tab');
      
      // Remover clase active de todos los botones y paneles
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabPanels.forEach(panel => panel.classList.remove('active'));
      
      // Agregar clase active al botón y panel correspondiente
      this.classList.add('active');
      document.getElementById(targetTab).classList.add('active');
      
      // Si se activa la pestaña del mapa, inicializar o invalidar
      if (targetTab === 'tab-mapa') {
        if (!modelosInitialized) {
          initModelos();
          modelosInitialized = true;
        } else if (typeof map !== 'undefined') {
          setTimeout(() => {
            map.invalidateSize();
          }, 100);
        }
      }

      // Si se activa la pestaña de frentes, inicializar o invalidar
      if (targetTab === 'tab-frentes') {
        if (!frentesInitialized) {
          initFrentes();
          frentesInitialized = true;
        } else if (typeof mapFrentes !== 'undefined') {
          setTimeout(() => {
            mapFrentes.invalidateSize();
          }, 100);
        }
      }
      
      // Si se activa la pestaña de satelite, inicializar o invalidar
      if (targetTab === 'tab-Satelite') {
        if (!sateliteInitialized) {
          initSatelite();
          sateliteInitialized = true;
        } else if (typeof mapSatelite !== 'undefined') {
          setTimeout(() => {
            mapSatelite.invalidateSize();
          }, 100);
        }
      }
      
      // Si se activa la pestaña de ciclones, inicializar o invalidar
      if (targetTab === 'tab-ciclones') {
        if (!cicloneInitialized) {
          initCiclones();
          cicloneInitialized = true;
        } else if (typeof mapCiclones !== 'undefined') {
          setTimeout(() => {
            mapCiclones.invalidateSize();
          }, 100);
        }
      }
    });
  });

  // Inicializar la pestaña activa por defecto (frentes)
  if (document.getElementById('tab-frentes')?.classList.contains('active')) {
    initFrentes();
    frentesInitialized = true;
  }
});

// ======================================================================
// MÓDULO DE FRENTES (CONDICIONES ACTUALES)
// ======================================================================
let mapFrentes;
let frentesLayerGroup = null;

const FRONT_ICONS = {
  cold: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgAgMAAAAOFJJnAAAADFBMVEUAAAD///8AAP8AAP873J53AAAAA3RSTlMAAAD6dsTeAAAAAWJLR0QB/wIt3gAAAAlwSFlzAAALEwAACxMBAJqcGAAAAFRJREFUGNNjYGBgEA1lgADyGMwfoAx+GMMexvgPZTDDGPwwhj2M8R/KYIYx+DFE4GoY9kMZTOuhDK7VMJFVMDWr9kMZWuuhDK6pUKcywRgMU4n1IAAfoS/xp4FQPwAAABl0RVh0Q29tbWVudABDcmVhdGVkIHdpdGggR0lNUFeBDhcAAAAldEVYdGRhdGU6Y3JlYXRlADIwMTctMTEtMDhUMjA6MjU6NTkrMDA6MDBcZbhBAAAAJXRFWHRkYXRlOm1vZGlmeQAyMDE3LTExLTA4VDIwOjI1OjU5KzAwOjAwLTgA/QAAAABJRU5ErkJggg==",
  warm: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgAgMAAAAOFJJnAAAACVBMVEUAAAD/////AADNXrecAAAAAnRSTlMAAHaTzTgAAAABYktHRAH/Ai3eAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAMElEQVQY02NgYGAQDWWAAPIYDAtgjFVwBkxo1QoMxipMRgMpDAztmFbAbafIX2AGAJPCHhHT1ydrAAAAGXRFWHRDb21tZW50AENyZWF0ZWQgd2l0aCBHSU1QV4EOFwAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAxNy0xMS0wOFQxOTo1NToyMiswMDowMIZo3xIAAAAldEVYdGRhdGU6bW9kaWZ5ADIwMTctMTEtMDhUMTk6NTU6MjIrMDA6MDD3NWeuAAAAAElFTkSuQmCC",
  occluded: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgAgMAAAAOFJJnAAAACVBMVEUAAAD///9mM8xZJd9IAAAAAnRSTlMAAHaTzTgAAAABYktHRAH/Ai3eAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAL0lEQVQY02NgYGAQDWWAAPIYXFCaYRVMAMbQwmCsQmcwkcLA1I7FCrjtcPdQ4kEAL8cX4RsxrWEAAAAZdEVYdENvbW1lbnQAQ3JlYXRlZCB3aXRoIEdJTVBXgQ4XAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDE3LTExLTA4VDE5OjE4OjQ5KzAwOjAwByd6XQAAACV0RVh0ZGF0ZTptb2RpZnkAMjAxNy0xMS0wOFQxOToxODo0OSswMDowMHZ6wuEAAAAASUVORK5CYII="
};

function styleFeatureFrentes(f) {
  switch (f.properties?.front) {
    case 'Cold Front': return { color: '#0066ff', weight: 3 };
    case 'Warm Front': return { color: '#cc0000', weight: 3 };
    case 'Occluded Front': return { color: '#993399', weight: 3 };
    case 'Stationary': return { color: '#800080', weight: 3 };
    case 'Trough': return { color: '#ff8c00', weight: 3, dashArray: '5,6' };
    default: return { color: '#000', weight: 1 };
  }
}

function bearingFrentes(lat1, lon1, lat2, lon2) {
  const y = Math.sin((lon2 - lon1) * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180);
  const x = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) -
    Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.cos((lon2 - lon1) * Math.PI / 180);
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}

function sampleAlongLineFrentes(coords, stepKm = 160) {
  const out = [];
  if (!coords.length) return out;
  let prevLon = coords[0][0];
  let prevLat = coords[0][1];
  out.push({ lat: prevLat, lon: prevLon });

  let distAccum = 0;

  for (let i = 1; i < coords.length; i++) {
    const [lon2, lat2] = coords[i];
    let segLat1 = prevLat;
    let segLon1 = prevLon;
    const segLat2 = lat2;
    const segLon2 = lon2;

    const segDist = Math.hypot(segLat2 - segLat1, segLon2 - segLon1) * 111;
    let remaining = segDist;

    while (distAccum + remaining >= stepKm) {
      const need = stepKm - distAccum;
      const t = need / remaining;
      const newLat = segLat1 + (segLat2 - segLat1) * t;
      const newLon = segLon1 + (segLon2 - segLon1) * t;
      out.push({ lat: newLat, lon: newLon });

      segLat1 = newLat;
      segLon1 = newLon;
      remaining = Math.hypot(segLat2 - segLat1, segLon2 - segLon1) * 111;
      distAccum = 0;
    }

    distAccum += remaining;
    prevLat = segLat2;
    prevLon = segLon2;
  }

  return out;
}

function drawFrontFeature(feature, targetGroup) {
  const coords = feature.geometry.coordinates;
  const type = feature.properties.front;
  if (!['Cold Front', 'Warm Front', 'Stationary', 'Occluded Front'].includes(type)) return;

  const samples = sampleAlongLineFrentes(coords, 160);
  let symbolIndex = 0;

  samples.forEach((s, idx) => {
    const nextSample = samples[idx + 3] || samples[samples.length - 1];
    const angle = bearingFrentes(s.lat, s.lon, nextSample.lat, nextSample.lon);

    let iconUrl = null;
    if (type === 'Cold Front') iconUrl = FRONT_ICONS.cold;
    if (type === 'Warm Front') iconUrl = FRONT_ICONS.warm;
    if (type === 'Stationary') iconUrl = symbolIndex % 2 === 0 ? FRONT_ICONS.cold : FRONT_ICONS.warm;
    if (type === 'Occluded Front') iconUrl = FRONT_ICONS.occluded;
    if (!iconUrl) return;

    symbolIndex++;

    const marker = L.marker([s.lat, s.lon], {
      icon: L.icon({
        iconUrl,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      }),
      rotationAngle: angle,
      rotationOrigin: 'center'
    });

    marker.addTo(targetGroup);
  });
}

async function loadFrentesData() {
  if (frentesLayerGroup) {
    frentesLayerGroup.removeFrom(mapFrentes);
  }

  const res = await fetch('jsons/front.json');
  const data = await res.json();

  const group = L.layerGroup();

  const lines = L.geoJSON(data, {
    style: styleFeatureFrentes,
    pointToLayer: (f, ll) => {
      if (f.properties?.code === 'low') return L.marker(ll, { icon: L.divIcon({ className: 'pressure-low', html: 'L' }) });
      if (f.properties?.code === 'high') return L.marker(ll, { icon: L.divIcon({ className: 'pressure-high', html: 'H' }) });
      if (f.properties?.text) return L.marker(ll, { icon: L.divIcon({ className: 'pressure-label', html: f.properties.text }) });
    }
  });

  lines.addTo(group);

  data.features.forEach(f => {
    if (f.geometry?.type === 'LineString' && f.properties?.front) {
      drawFrontFeature(f, group);
    }
  });

  frentesLayerGroup = group;

  const toggle = document.getElementById('toggle-frentes');
  if (!toggle || toggle.checked) {
    frentesLayerGroup.addTo(mapFrentes);
  }
}

async function initFrentes() {
  mapFrentes = L.map('map-frentes').setView([30, -100], 4);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 12,
    attribution: '© OpenStreetMap'
  }).addTo(mapFrentes);

  const toggle = document.getElementById('toggle-frentes');
  if (toggle) {
    toggle.addEventListener('change', () => {
      if (toggle.checked) {
        if (frentesLayerGroup) frentesLayerGroup.addTo(mapFrentes);
      } else {
        if (frentesLayerGroup) frentesLayerGroup.removeFrom(mapFrentes);
      }
    });
  }

  try {
    await loadFrentesData();
  } catch (err) {
    console.error('Error cargando frentes:', err);
  }
}

// ======================================================================
// MÓDULO DE CICLONES
// ======================================================================
let mapCiclones;
let layersCiclones = [];
let ciclonDataCiclones = {}; // Almacena datos: { cuenca: { año: { ciclones: [...] } } }
let selectedCiclones = new Map(); // Almacena ciclones seleccionados: {id -> {id, nombre, cuenca, year}}

async function initCiclones() {
  mapCiclones = L.map('map-ciclones');
  const mexicoBounds = [[14.5, -116.5], [32.8, -86.5]];
  mapCiclones.fitBounds(mexicoBounds);
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 12,
    attribution: '© OpenStreetMap'
  }).addTo(mapCiclones);
  
  // Crear pane para referencias
  mapCiclones.createPane('referenciaCiclones');
  mapCiclones.getPane('referenciaCiclones').style.zIndex = 650;
  
  // Cargar capa de referencia (límites de estados)
  fetch('geojsons/repmex2.geojson')
    .then(res => res.json())
    .then(data => {
      L.geoJSON(data, {
        style: {
          fillColor: 'transparent',
          fillOpacity: 0,
          color: '#999',
          weight: 1.5,
          opacity: 0.7
        },
        interactive: false,
        pane: 'referenciaCiclones'
      }).addTo(mapCiclones);
    })
    .catch(err => console.error('Error cargando estados ciclones:', err));
  
  // Crear pane para ciclones (líneas)
  mapCiclones.createPane('dataCiclones');
  mapCiclones.getPane('dataCiclones').style.zIndex = 700;
  
  // Crear pane para puntos (sobre las líneas)
  mapCiclones.createPane('puntosCiclones');
  mapCiclones.getPane('puntosCiclones').style.zIndex = 750;
  
  // Crear pane para popups (sobre los puntos)
  mapCiclones.createPane('popupPane');
  mapCiclones.getPane('popupPane').style.zIndex = 800;
  
  // Cargar índice de cuencas
  try {
    const indexRes = await fetch('https://data.jmafp.xyz/ciclones/index.json');
    const indexData = await indexRes.json();
    
    console.log('Estructura de API ciclones:', indexData);
    
    // Llenar checkboxes de cuencas
    const cuencasDiv = document.getElementById('checkboxes-cuencas');
    cuencasDiv.innerHTML = '';
    
    // Determinar si cuencas es un array de strings o de objetos
    const cuencasArray = Array.isArray(indexData.cuencas) 
      ? indexData.cuencas.map(c => typeof c === 'string' ? c : c.id || c.name || Object.keys(c)[0])
      : Object.keys(indexData.cuencas);
    
    for (const cuenca of cuencasArray) {
      const div = document.createElement('div');
      div.className = 'checkbox-item';
      
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.id = `cuenca-${cuenca}`;
      input.dataset.cuenca = cuenca;
      
      const label = document.createElement('label');
      label.htmlFor = `cuenca-${cuenca}`;
      label.textContent = cuenca;
      
      input.addEventListener('change', () => handleCuencaChange(cuenca, input.checked));
      
      div.appendChild(input);
      div.appendChild(label);
      cuencasDiv.appendChild(div);
    }
  } catch (err) {
    console.error('Error cargando índice de ciclones:', err);
  }
}

async function handleCuencaChange(cuenca, isChecked) {
  const aniosDiv = document.getElementById('checkboxes-anios');
  const ciclonesDiv = document.getElementById('checkboxes-ciclones');
  
  if (isChecked) {
    // Cargar años para esta cuenca
    try {
      const yearRes = await fetch(`https://data.jmafp.xyz/ciclones/${cuenca}/index.json`);
      const yearData = await yearRes.json();
      
      // Almacenar años en ciclonDataCiclones
      if (!ciclonDataCiclones[cuenca]) {
        ciclonDataCiclones[cuenca] = {};
      }
      // GUARDAR los años que vienen del API
      ciclonDataCiclones[cuenca].anios = yearData.anios || [];
      
      console.log(`Años cargados para ${cuenca}:`, ciclonDataCiclones[cuenca].anios);
      
      // Renderizar años de TODAS las cuencas marcadas
      renderAniosCheckboxes();
      
    } catch (err) {
      console.error(`Error cargando años para ${cuenca}:`, err);
    }
  } else {
    // Al desmarcar, eliminar años y ciclones asociados
    delete ciclonDataCiclones[cuenca];
    
    const selectedCiclonesToRemove = Array.from(selectedCiclones.keys()).filter(id => {
      const data = selectedCiclones.get(id);
      return data.cuenca === cuenca;
    });
    selectedCiclonesToRemove.forEach(id => selectedCiclones.delete(id));
    
    renderAniosCheckboxes();
    updateCiclonLayers();
  }
}

async function renderAniosCheckboxes() {
  const aniosDiv = document.getElementById('checkboxes-anios');
  aniosDiv.innerHTML = '';
  
  // Recopilar todos los años de todas las cuencas seleccionadas
  const selectedCuencas = Array.from(document.querySelectorAll('#checkboxes-cuencas input:checked'))
    .map(cb => cb.dataset.cuenca);
  
  console.log('Cuencas seleccionadas:', selectedCuencas);
  
  const allYears = new Set();
  
  // Recopilar años de TODAS las cuencas seleccionadas (sin duplicados)
  for (const cuenca of selectedCuencas) {
    if (ciclonDataCiclones[cuenca] && ciclonDataCiclones[cuenca].anios) {
      ciclonDataCiclones[cuenca].anios.forEach(year => allYears.add(year));
    }
  }
  
  console.log('Años únicos encontrados:', Array.from(allYears).sort((a, b) => b - a));
  
  // Renderizar checkboxes de años en orden descendente
  const sortedYears = Array.from(allYears).sort((a, b) => b - a);
  for (const year of sortedYears) {
    const div = document.createElement('div');
    div.className = 'checkbox-item';
    
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.id = `anio-${year}`;
    input.dataset.anio = year;
    
    const label = document.createElement('label');
    label.htmlFor = `anio-${year}`;
    label.textContent = year;
    
    input.addEventListener('change', () => handleAnioChange(year, input.checked));
    
    div.appendChild(input);
    div.appendChild(label);
    aniosDiv.appendChild(div);
  }
}

async function handleAnioChange(year, isChecked) {
  const ciclonesDiv = document.getElementById('checkboxes-ciclones');
  
  if (isChecked) {
    // Cargar ciclones para este año en todas las cuencas seleccionadas
    const selectedCuencas = Array.from(document.querySelectorAll('#checkboxes-cuencas input:checked'))
      .map(cb => cb.dataset.cuenca);
    
    console.log(`Cargando ciclones para el año ${year} en cuencas:`, selectedCuencas);
    
    for (const cuenca of selectedCuencas) {
      try {
        // Inicializar estructura si no existe
        if (!ciclonDataCiclones[cuenca]) {
          ciclonDataCiclones[cuenca] = {};
        }
        
        if (!ciclonDataCiclones[cuenca].ciclones) {
          ciclonDataCiclones[cuenca].ciclones = {};
        }
        
        // Cargar ciclones para este año de esta cuenca
        if (!ciclonDataCiclones[cuenca].ciclones[year]) {
          const ciclonesRes = await fetch(`https://data.jmafp.xyz/ciclones/${cuenca}/${year}/index.json`);
          const ciclonesData = await ciclonesRes.json();
          ciclonDataCiclones[cuenca].ciclones[year] = ciclonesData;
          console.log(`Ciclones cargados para ${cuenca}/${year}:`, ciclonesData);
        }
      } catch (err) {
        console.error(`Error cargando ciclones para ${cuenca}/${year}:`, err);
      }
    }
    
    renderCiclonesCheckboxes();
  } else {
    // Al desmarcar, eliminar ciclones de este año
    const selectedCiclonesToRemove = Array.from(selectedCiclones.values())
      .filter(data => data.year === year)
      .map(data => data.id);
    selectedCiclonesToRemove.forEach(id => selectedCiclones.delete(id));
    
    renderCiclonesCheckboxes();
    updateCiclonLayers();
  }
}

async function renderCiclonesCheckboxes() {
  const ciclonesDiv = document.getElementById('checkboxes-ciclones');
  ciclonesDiv.innerHTML = '';
  
  // Recopilar ciclones de años seleccionados
  const selectedYears = Array.from(document.querySelectorAll('#checkboxes-anios input:checked'))
    .map(cb => parseInt(cb.dataset.anio));
  
  const selectedCuencas = Array.from(document.querySelectorAll('#checkboxes-cuencas input:checked'))
    .map(cb => cb.dataset.cuenca);
  
  const cicloneSet = new Map(); // key -> { cuenca, year, cicloneName }
  
  console.log('Años seleccionados:', selectedYears);
  console.log('Cuencas seleccionadas:', selectedCuencas);
  
  for (const cuenca of selectedCuencas) {
    for (const year of selectedYears) {
      try {
        // Acceder a la estructura correcta: ciclonDataCiclones[cuenca].ciclones[year]
        if (ciclonDataCiclones[cuenca] && 
            ciclonDataCiclones[cuenca].ciclones && 
            ciclonDataCiclones[cuenca].ciclones[year]) {
          
          const ciclonesData = ciclonDataCiclones[cuenca].ciclones[year];
          console.log(`Ciclones en ${cuenca}/${year}:`, ciclonesData);
          
          // ciclonesData es un objeto con propiedad "ciclones" que es un array
          if (ciclonesData.ciclones && Array.isArray(ciclonesData.ciclones)) {
            ciclonesData.ciclones.forEach(cicloneObj => {
              // Usar el ID como clave (ej: EP102024)
              const key = cicloneObj.id;
              cicloneSet.set(key, { 
                cuenca, 
                year, 
                id: cicloneObj.id,
                nombre: cicloneObj.nombre
              });
            });
          }
        }
      } catch (err) {
        console.error(`Error accediendo a ciclones ${cuenca}/${year}:`, err);
      }
    }
  }
  
  console.log('Ciclones totales encontrados:', cicloneSet.size);
  
  // Renderizar checkboxes de ciclones en orden alfabético por nombre
  const sortedCyclones = Array.from(cicloneSet.entries())
    .sort((a, b) => a[1].nombre.localeCompare(b[1].nombre));
  
  for (const [key, data] of sortedCyclones) {
    const div = document.createElement('div');
    div.className = 'checkbox-item';
    
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.id = `ciclone-${key}`;
    input.dataset.ciclon = key;
    input.checked = selectedCiclones.has(key);
    
    const label = document.createElement('label');
    label.htmlFor = `ciclone-${key}`;
    label.textContent = `${data.nombre} (${data.year})`;
    
    input.addEventListener('change', () => handleCicloneChange(key, data, input.checked));
    
    div.appendChild(input);
    div.appendChild(label);
    ciclonesDiv.appendChild(div);
  }
}

async function handleCicloneChange(key, data, isChecked) {
  if (isChecked) {
    selectedCiclones.set(key, data);
  } else {
    selectedCiclones.delete(key);
  }
  
  updateCiclonLayers();
}

async function updateCiclonLayers() {
  // Limpiar capas previas
  layersCiclones.forEach(layer => mapCiclones.removeLayer(layer));
  layersCiclones = [];
  
  // Cargar geojsons de ciclones seleccionados
  const promises = Array.from(selectedCiclones.entries()).map(([id, data]) => {
    const cuenca = data.cuenca;
    const year = data.year;
    const nombre = data.nombre;
    // Construir URL: EP/2024/EP102024_JOHN.geojson
    const url = `https://data.jmafp.xyz/ciclones/${cuenca}/${year}/${id}_${nombre}.geojson`;
    
    console.log(`Cargando ciclón: ${url}`);
    
    return fetch(url)
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${url}`);
        }
        return res.json();
      })
      .then(data => {
        // Crear layer con colores del geojson
        const geoJsonLayer = L.geoJSON(data, {
          pointToLayer: (feature, latlng) => {
            const color = feature.properties.color || '#ff0000';
            return L.circleMarker(latlng, {
              radius: 8,
              fillColor: color,
              color: color,
              weight: 1,
              opacity: 1.0,
              fillOpacity: 1.0,
              pane: 'puntosCiclones'
            });
          },
          style: (feature) => {
            const color = feature.properties.color || '#ff0000';
            return {
              color: color,
              weight: 2,
              opacity: 0.8,
              fillOpacity: 0.7
            };
          },
          onEachFeature: (feature, layer) => {
            let popupText = `<strong>${nombre}</strong><br>`;
            for (const [key, value] of Object.entries(feature.properties)) {
              if (key !== 'color') {
                popupText += `${key}: ${value}<br>`;
              }
            }
            layer.bindPopup(popupText);
          }
        });
        
        geoJsonLayer.addTo(mapCiclones);
        layersCiclones.push(geoJsonLayer);
      })
      .catch(err => console.error(`Error cargando ${url}:`, err));
  });
  
  await Promise.all(promises);
}

// ======================================================================
// MÓDULO DE SATÉLITE
// ======================================================================
let mapSatelite;
let overlaysSatelite = [];
let framesSatelite = [];
let idxSatelite = 0;
let playingSatelite = false;
let animationTimeoutSatelite = null;

const regionesSatelite = {
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

async function fetchImageAsBlobUrlSatelite(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Error cargando imagen ${url}`);
  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

async function preloadAndCreateOverlaysSatelite(data, delta = 0.8) {
  for (const frame of data) {
    try {
      const blobUrl = await fetchImageAsBlobUrlSatelite('satelite/' + frame.file);
      const overlay = L.imageOverlay(
        blobUrl,
        [[frame.bounds[0][0] - delta, frame.bounds[0][1]],
         [frame.bounds[1][0] - delta, frame.bounds[1][1]]],
        { opacity: 0.0 }
      );
      overlaysSatelite.push(overlay);
      overlay.addTo(mapSatelite);
    } catch (err) {
      console.error(`Error precargando imagen ${frame.file}:`, err);
    }
  }
}

function showFrameSatelite(i) {
  overlaysSatelite.forEach((o, index) => o.setOpacity(index === i ? 0.95 : 0));
  
  const t = framesSatelite[i].timestamp;
  const match = t.match(/^(\d{4})_([A-Za-z]{3})_(\d{2})_(\d{2})_(\d{2})$/);
  if (match) {
    document.getElementById('time-display-satelite').textContent = 
      `${match[3]}-${match[2]}-${match[1]} ${match[4]}:${match[5]} CDT`;
  } else {
    document.getElementById('time-display-satelite').textContent = t;
  }
  
  document.getElementById('slider-satelite').value = i;
  document.getElementById('time-range-satelite').textContent = `Frame ${i + 1} de ${overlaysSatelite.length}`;
  idxSatelite = i;
}

function animateSatelite() {
  if (!playingSatelite) return;
  idxSatelite = (idxSatelite + 1) % overlaysSatelite.length;
  showFrameSatelite(idxSatelite);
  animationTimeoutSatelite = setTimeout(animateSatelite, 800);
}

function initSatelite() {
  mapSatelite = L.map('map-satelite');
  const mexicoBounds = [[14.5, -116.5], [32.8, -86.5]];
  mapSatelite.fitBounds(mexicoBounds);
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 12,
    attribution: '© OpenStreetMap'
  }).addTo(mapSatelite);
  
  // Crear pane para referencias
  mapSatelite.createPane('referenciaSatelite');
  mapSatelite.getPane('referenciaSatelite').style.zIndex = 650;
  
  // Cargar capa de referencia
  fetch('geojsons/repmex2.geojson')
    .then(res => res.json())
    .then(data => {
      L.geoJSON(data, {
        style: {
          fillColor: 'transparent',
          fillOpacity: 0,
          color: '#fff',
          weight: 1,
          opacity: 0.9
        },
        interactive: false,
        pane: 'referenciaSatelite'
      }).addTo(mapSatelite);
    })
    .catch(err => console.error('Error cargando estados satelite:', err));
  
  // Buscador de estados
  document.getElementById('buscador-satelite').addEventListener('change', function() {
    const r = regionesSatelite[this.value];
    if (r) {
      mapSatelite.setView([r.lat, r.lon], r.zoom);
    }
  });
  
  // Cargar frames
  fetch('satelite/frames.json')
    .then(r => r.json())
    .then(async data => {
      if (!data.length) {
        document.getElementById('time-display-satelite').textContent = 'No hay imágenes disponibles';
        return;
      }
      
      framesSatelite = data.reverse();
      await preloadAndCreateOverlaysSatelite(framesSatelite);
      
      const sliderSat = document.getElementById('slider-satelite');
      sliderSat.max = overlaysSatelite.length - 1;
      sliderSat.value = idxSatelite;
      
      // Eventos del slider
      sliderSat.addEventListener('input', e => {
        playingSatelite = false;
        clearTimeout(animationTimeoutSatelite);
        document.getElementById('playBtn-satelite').textContent = '▶';
        document.getElementById('pauseBtn-satelite').style.display = 'none';
        document.getElementById('playBtn-satelite').style.display = 'flex';
        showFrameSatelite(+e.target.value);
      });
      
      // Botones de control
      document.getElementById('prevBtn-satelite').onclick = () => {
        playingSatelite = false;
        clearTimeout(animationTimeoutSatelite);
        document.getElementById('playBtn-satelite').textContent = '▶';
        showFrameSatelite((idxSatelite - 1 + overlaysSatelite.length) % overlaysSatelite.length);
      };
      
      document.getElementById('nextBtn-satelite').onclick = () => {
        playingSatelite = false;
        clearTimeout(animationTimeoutSatelite);
        document.getElementById('playBtn-satelite').textContent = '▶';
        showFrameSatelite((idxSatelite + 1) % overlaysSatelite.length);
      };
      
      document.getElementById('playBtn-satelite').onclick = () => {
        playingSatelite = !playingSatelite;
        document.getElementById('playBtn-satelite').textContent = playingSatelite ? '⏸' : '▶';
        if (playingSatelite) animateSatelite();
        else clearTimeout(animationTimeoutSatelite);
      };
      
      // Mostrar último frame
      showFrameSatelite(idxSatelite);
      
      // Iniciar animación
      playingSatelite = true;
      document.getElementById('playBtn-satelite').textContent = '⏸';
      animateSatelite();
    })
    .catch(err => {
      console.error('Error cargando frames satelite:', err);
      document.getElementById('time-display-satelite').textContent = 'Error cargando datos';
    });
}

// ======================================================================
// CONFIGURACIÓN DEL MAPA METEOROLÓGICO
// ======================================================================
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

// Mapa se inicializa vía lazy loading
let map;


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

const R2_BASE_URL = "https://data.jmafp.xyz";

const modelosConfig = {
  WRF: {
    model: "wrf",
    timesFile: "WRF_times.json"
  },
  GFS: {
    model: "gfs",
    timesFile: "GFS_times.json"
  },
  ECMWF: {
    model: "ecmwf",
    timesFile: "ECMWF_times.json"
  },
  ICON: {
    model: "icon",
    timesFile: "ICON_times.json"
  }
};




function initModelos() {
  // Inicializar mapa
  map = L.map('map');

  const mexicoBounds = [
    [14.5, -116.5],
    [32.8, -86.5]
  ];

  map.fitBounds(mexicoBounds);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 12,
    attribution: '© OpenStreetMap'
  }).addTo(map);

  // Crear paneles personalizados
  map.createPane('referencia');
  map.getPane('referencia').style.zIndex = 650;

  map.createPane('datosWrf');
  map.getPane('datosWrf').style.zIndex = 600;

  map.createPane('windDirection');
  map.getPane('windDirection').style.zIndex = 700;

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
}

let currentRun = null;

async function loadModelTimes() {

  // 1. Leer latest.json DEL MODELO ACTUAL
  const config = modelosConfig[currentModel];

  const latestRes = await fetch(
    `${R2_BASE_URL}/${config.model}/latest.json`
  );
  const latest = await latestRes.json();

  currentRun = latest.run

  // 2. Leer times del modelo + corrida
  const timesUrl = `${R2_BASE_URL}/${config.model}/${currentRun}/${config.timesFile}`;
  const timesRes = await fetch(timesUrl);
  const times = await timesRes.json();

  // 3. Asignar tiempos a todas las variables
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
  const config = modelosConfig[currentModel];
  const filename = `${R2_BASE_URL}/${config.model}/${currentRun}/${currentVariable}_${timeStr}.geojson`;


  
  // Si ya tenemos esta capa cargada, solo la mostramos
  if (layers[currentVariable] && layers[currentVariable][currentTimeIndex]) {
    if (activeLayer) map.removeLayer(activeLayer);
    activeLayer = layers[currentVariable][currentTimeIndex];
    map.addLayer(activeLayer);

    updateLegendImage(); 

    
    

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
      updateLegendImage();

      // Si el usuario tiene activados los vectores, sincronizarlos con el nuevo tiempo
      if (windEnabled) {
        loadWindDirectionLayer(timeStr);
      }

      updateWindToggleButton();
      prefetchAdjacentTimes();



    })
    .catch(err => {
      console.error('Error al cargar GeoJSON:', err);
      document.getElementById('time-display').textContent = `Error cargando ${variables[currentVariable].name}`;
    });

}

function prefetchAdjacentTimes() {
  const times = availableTimes[currentVariable] || [];
  if (times.length === 0) return;

  const basePath = modelosConfig[currentModel].basePath;

  const indices = [
    currentTimeIndex - 1,
    currentTimeIndex + 1
  ];

  indices.forEach(i => {
    if (i < 0 || i >= times.length) return;

    const t = times[i];
    const url = `${basePath}/${currentVariable}_${t}.geojson`;

    // Prefetch silencioso
    fetch(url, { cache: "force-cache" }).catch(() => {});
  });
}


function updateLegendImage() {
  const img = document.getElementById('legend-img');

  if (!img) {
    console.error('NO existe <img id="legend-img"> en el DOM');
    return;
  }

  const isMobile = window.innerWidth <= 768;
  const suffix = isMobile ? '_horizontal.png' : '_vertical.png';
  const path = `images/${currentVariable}${suffix}`;

  console.log('Cargando leyenda:', path);
  img.src = path;
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
    const config = modelosConfig[currentModel];
    const windDirFilename = `${R2_BASE_URL}/${config.model}/${currentRun}/VIENTO_DIR_${timeStr}.geojson`;

  
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
      btn.classList.remove('wind-active');
      windEnabled = false;
      return;
    }

    // CASO 2: el viento YA existe pero está oculto → mostrar
    if (activeWindDirectionLayer && !map.hasLayer(activeWindDirectionLayer)) {
      map.addLayer(activeWindDirectionLayer);
      btn.textContent = "Ocultar Vectores";
      btn.classList.add('wind-active');
      return;
    }

    // CASO 3: el viento NO existe todavía → CREARLO
    const times = availableTimes[currentVariable] || [];
    const timeStr = times[currentTimeIndex];
    if (!timeStr) return;

    windEnabled = true;
    loadWindDirectionLayer(timeStr);
    btn.textContent = "Ocultar Vectores";
    btn.classList.add('wind-active');
  });
}


function updateWindToggleButton() {
  const btn = document.getElementById("toggle-wind");
  if (!btn) return;

  if (activeWindDirectionLayer && map.hasLayer(activeWindDirectionLayer)) {
      btn.textContent = "Ocultar Vectores";
      btn.classList.add('wind-active');
  } else {
      btn.textContent = "Mostrar Vectores";
      btn.classList.remove('wind-active');
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
  // Leyenda ahora es por imagen estática (no JS)
  return;
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


window.addEventListener('resize', updateLegendImage);

