async function cargarCSV(ruta) {
  return new Promise((resolve) => {
    Papa.parse(ruta, {
      download: true,
      header: true,
      complete: (resultado) => resolve(resultado.data),
    });
  });
}

function crearTarjeta(datos) {
  const tarjeta = document.createElement("div");
  tarjeta.className = "tarjeta";

  const nombre = datos.estacion;
  const region = datos.REGION_2;
  const municipio = datos.MPO_2;
  const direccion = datos.REF;
  const institucion = datos.INSTITUCION;
  const enlace = datos.link;

  tarjeta.innerHTML = `
    <p><strong>Estación: </strong> <a href="${enlace}" target="_blank" rel="noopener noreferrer">${nombre}</a>     - <strong> ${institucion}</strong></p>
    <p><strong>Municipio: </strong>${municipio}</p>
    <p><strong>Referencia: </strong>${direccion}</p>
    <div class="graficas" id="graficas-${nombre}"></div>
  `;

  setTimeout(() => renderGraficas(nombre, datos), 0);
  return tarjeta;
}

function renderGraficas(nombre, datos) {
  const contenedor = document.getElementById(`graficas-${nombre}`);
  const temp = parseFloat(datos.temp_C);
  const hr = parseFloat(datos.HR);
  const lluvia = parseFloat(datos.razon_lluvia);
  const acum = parseFloat(datos.acum_calc); // const acum = parseFloat(datos.lluvia_acumulada_mm); 
  const vel = parseFloat(datos["vel_viento"]);
  const racha = parseFloat(datos["racha_viento"]);
  const dirLetra = datos.letra_dir;

  const filaBarras = document.createElement("div");
  filaBarras.style.display = "flex";
  filaBarras.style.gap = "10px";
  filaBarras.style.flexWrap = "wrap";
  filaBarras.style.justifyContent = "center";
  contenedor.appendChild(filaBarras);

  // const layoutPeq = {
  //   margin: { t: 20, b: 20, l: 25, r: 25 },
  //   width: 150,
  //   height: 250
  // };
  
  const layoutPeq = {
    margin: { t: 20, b: 35, l: 20, r: 15 },
    width: 90,
    height: 180,  
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)', 
    font: { family: 'Arial', size: 11 },
    xaxis: { tickfont: { size: 13 } },
    yaxis: {
      tickfont: { size: 10 },
      showgrid: true,
      gridcolor: 'rgba(200,200,200,0.3)'
    }
  };
  
  
  const plot = (titulo, valor, color, rango) => {
    const div = document.createElement("div");
    Plotly.newPlot(div, [{
      type: 'bar',
      x: [titulo],
      y: [valor],
      marker: { color },
      text: [valor.toFixed(1)],  
      textposition: 'outside',
    }], {
      ...layoutPeq,
      yaxis: { range: rango }
    },
    { staticPlot: true });
    filaBarras.appendChild(div);
  };

  plot('Temp<br> (°C)', temp, 'red', [-5, 45]);
  plot('HR<br> (%)', hr, 'blue', [0, 100]);
  plot('Intensidad<br> (mm/h)', lluvia, 'cyan', [0, 200]);
  plot('Acumulado<br> (mm)', acum, 'cyan', [0, 200]);

  const filaGauges = document.createElement("div");
  filaGauges.style.display = "flex";
  filaGauges.style.justifyContent = "space-around";
  filaGauges.style.alignItems = "center"; 
  filaGauges.style.marginTop = "10px";
  contenedor.appendChild(filaGauges);

  const gaugeLayout = {
    margin: { t: 10, b: 10, l: 30, r: 30 },
    width: 150,
    height: 150
  };

  const gaugeConfig = {
    displayModeBar: false,
    staticPlot: true
  };

  const crearGaugeData = (titulo, valor) => ({
    type: "indicator",
    mode: "gauge+number",
    value: valor,
    title: {
      text: titulo,
      font: { size: 14, color: "black" }
    },
    number: {
      font: { size: 10, color: "black" },
      suffix: " km/h"
    },
    gauge: {
      axis: {
        range: [0, 120],
        tickvals: [0, 20, 40, 60, 80, 100, 120],
        tickfont: {
          size: 10
        }
      },
      bar: {
        color: "black",
        thickness: 0.3
      },
      steps: [
        { range: [0, 40], color: "green" },
        { range: [40, 60], color: "yellow" },
        { range: [60, 80], color: "orange" },
        { range: [80, 120], color: "red" }
      ]
    }
  });

  const gaugeVel = document.createElement("div");
  Plotly.newPlot(
    gaugeVel,
    [crearGaugeData("Viento medio km/h", vel)],
    gaugeLayout,
    gaugeConfig
  );
  filaGauges.appendChild(gaugeVel);

  const gaugeRacha = document.createElement("div");
  Plotly.newPlot(
    gaugeRacha,
    [crearGaugeData("Rachas km/h", racha)],
    gaugeLayout,
    gaugeConfig
  );
  filaGauges.appendChild(gaugeRacha);

  function direccionADegrees(letra) {
    const mapa = {
      N: 0, NNE: 22.5, NE: 45, ENE: 67.5,
      E: 90, ESE: 112.5, SE: 135, SSE: 157.5,
      S: 180, SSW: 202.5, SW: 225, WSW: 247.5,
      W: 270, WNW: 292.5, NW: 315, NNW: 337.5
    };
    return mapa[letra.toUpperCase().trim()] ?? 0;
  }

  const rosa = document.createElement("div");
  rosa.style.width = "135px";
  rosa.style.height = "135px";
  filaGauges.appendChild(rosa);

  Plotly.newPlot(rosa, [{
    type: "scatterpolar",
    r: [0, 1],
    theta: [direccionADegrees(dirLetra), direccionADegrees(dirLetra)],
    mode: "lines+markers",
    line: { color: "orange", width: 4 },
    marker: { color: "orange", size: 10 },
    name: `Dirección: ${dirLetra}`
  }], {
    polar: {
      radialaxis: { visible: false, range: [0, 1.2] },
      angularaxis: {
        direction: "clockwise",
        rotation: 90,
        tickmode: "array",
        tickfont: {
          size: 8
        },
        tickvals: [0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5, 180, 202.5, 225, 247.5, 270, 292.5, 315, 337.5],
        ticktext: ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"]
      }
    },
    showlegend: false,
    margin: { t: 30, b: 50, l: 45, r: 30 },
    width: 135,
    height: 135
  },
  {
    staticPlot: true
  });
}

function actualizarFiltros(estaciones) {
  const regiones = [...new Set(estaciones.map(e => e.REGION_2).filter(Boolean))];
  const municipios = [...new Set(estaciones.map(e => e.MPO_2).filter(Boolean))];

  // 2. Ordenar
  regiones.sort((a, b) => a.localeCompare(b, 'es'));
  municipios.sort((a, b) => a.localeCompare(b, 'es'));

  // 3. Limpiar selects
  const filtroRegion    = document.getElementById('filtro-region');
  const filtroMunicipio = document.getElementById('filtro-municipio');

  
  for (const r of regiones) {
    const opt = document.createElement("option");
    opt.value = r;
    opt.textContent = r;
    opt.textContent = capitalizar(r);
    filtroRegion.appendChild(opt);
  }
  for (const m of municipios) {
    const opt = document.createElement("option");
    opt.value = m;
    opt.textContent = m;
    filtroMunicipio.appendChild(opt);
  }
}

function capitalizar(texto) {
  if (typeof texto !== 'string') return texto ?? '';
  return texto
    .toLowerCase()
    .split(' ')
    .map(p => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ');
}


// FILTROS DE RANGO
let filtrosRango = {
  temp_C: [-Infinity, Infinity],
  HR: [-Infinity, Infinity],
  racha_viento: [-Infinity, Infinity],
  razon_lluvia: [-Infinity, Infinity],
  acum_calc: [-Infinity, Infinity], //lluvia_acumulada_mm: [-Infinity, Infinity], 
};

function crearSlider(id, min, max, step, propiedad) {
  const slider = document.getElementById(id);
  noUiSlider.create(slider, {
    start: [min, max],
    connect: true,
    range: { min, max },
    step,
    tooltips: true,
    format: {
      to: value => value.toFixed(1),
      from: value => parseFloat(value)
    }
  });

  slider.noUiSlider.on('change', function (valores) {
    filtrosRango[propiedad] = valores.map(parseFloat);
    render(); // solo al soltar clic
  });
}

function cumpleRangos(estacion) {
  return (
    parseFloat(estacion.temp_C) >= filtrosRango.temp_C[0] &&
    parseFloat(estacion.temp_C) <= filtrosRango.temp_C[1] &&
    parseFloat(estacion.HR) >= filtrosRango.HR[0] &&
    parseFloat(estacion.HR) <= filtrosRango.HR[1] &&
    parseFloat(estacion.racha_viento) >= filtrosRango.racha_viento[0] &&
    parseFloat(estacion.racha_viento) <= filtrosRango.racha_viento[1] &&
    parseFloat(estacion.razon_lluvia) >= filtrosRango.razon_lluvia[0] &&
    parseFloat(estacion.razon_lluvia) <= filtrosRango.razon_lluvia[1] &&
    parseFloat(estacion.acum_calc) >= filtrosRango.acum_calc[0] &&
    parseFloat(estacion.acum_calc) <= filtrosRango.acum_calc[1]
    //parseFloat(estacion.lluvia_acumulada_mm) >= filtrosRango.lluvia_acumulada_mm[0] &&
    //parseFloat(estacion.lluvia_acumulada_mm) <= filtrosRango.lluvia_acumulada_mm[1]
  );
}

function aplicarFiltros(estaciones) {
  const region = document.getElementById("filtro-region").value;
  const municipio = document.getElementById("filtro-municipio").value;
  const texto = document.getElementById("filtro-busqueda").value.toLowerCase();

  return estaciones.filter(e =>
    (!region || e.REGION_2 === region) &&
    (!municipio || e.MPO_2 === municipio) &&
    (!texto || (e.REF && e.REF.toLowerCase().includes(texto))) &&
    cumpleRangos(e)
  );
}

let datosActuales = [];

function render() {
  const contenedor = document.getElementById("contenedor-estaciones");
  contenedor.innerHTML = "";

  const filtradas = aplicarFiltros(datosActuales);

  // Group by region
  const porRegion = {};
  filtradas.forEach(e => {
    if (!e.REGION_2) return; // ← ESTA LÍNEA ES LA CLAVE

    if (!porRegion[e.REGION_2]) porRegion[e.REGION_2] = [];
    porRegion[e.REGION_2].push(e);
  });

  // Force vertical stacking of regions
  contenedor.style.display = "flex";
  contenedor.style.flexDirection = "column";
  contenedor.style.gap = "2em"; // Space between regions

  Object.entries(porRegion).forEach(([region, estaciones]) => {
    // Create a container for the entire region block
    const regionBlock = document.createElement("div");
    regionBlock.style.width = "100%"; // Take full width

    // Region title
    const titulo = document.createElement("h2");
    titulo.textContent = `Región: ${region}`;
    titulo.style.fontSize = "1.1em";
    titulo.style.margin = "0 0 0.5em 0"; // Only bottom margin
    regionBlock.appendChild(titulo);

    // Container for the cards grid (3 columns)
    const grupo = document.createElement("div");
    grupo.className = "grupo-region";


    // Create cards for each station
    estaciones.forEach(estacion => {
      const tarjeta = crearTarjeta(estacion);
      grupo.appendChild(tarjeta);
    });

    regionBlock.appendChild(grupo);
    contenedor.appendChild(regionBlock);
  });
}



async function iniciarDashboard() {
  datosActuales = await cargarCSV("data/cond_act_ultima.csv?v=" + new Date().getTime());
  console.log("Ejemplo de datos:", datosActuales[0]);
  console.log("Todas las claves:", Object.keys(datosActuales[0]));

  
  actualizarFiltros(datosActuales);

  crearSlider("slider-temp", -5, 45, 0.5, "temp_C");
  crearSlider("slider-hr", 0, 100, 1, "HR");
  crearSlider("slider-racha", 0, 120, 1, "racha_viento");
  crearSlider("slider-lluvia", 0, 200, 1, "razon_lluvia");
  crearSlider("slider-acum", 0, 200, 1, "acum_calc");
  //crearSlider("slider-acum", 0, 200, 1, "lluvia_acumulada_mm");

  document.getElementById("filtro-region").onchange = render;
  document.getElementById("filtro-municipio").onchange = render;
  document.getElementById("filtro-busqueda").oninput = render;

  render();
}

iniciarDashboard();
setInterval(iniciarDashboard, 10 * 60 * 1000);


const filtrosContainer = document.querySelector(".filtros-container");
const filtrosHeader = document.querySelector(".filtros-header");

filtrosHeader.addEventListener("click", () => {
  filtrosContainer.classList.toggle("colapsado");
});
