const reglas = {
  'presencia_humana,es_de_noche,temperatura_baja': 'encender_luces+bajar_persianas+termostato_24',
  'presencia_humana,es_de_noche,temperatura_media': 'encender_luces+bajar_persianas',
  'presencia_humana,es_de_noche,temperatura_alta': 'encender_luces+bajar_persianas+activar_ventilacion',
  'presencia_humana,es_de_dia,temperatura_baja': 'subir_persianas+termostato_24',
  'presencia_humana,es_de_dia,temperatura_media': 'subir_persianas',
  'presencia_humana,es_de_dia,temperatura_alta': 'bajar_persianas+activar_ventilacion',
  'sin_presencia,es_de_noche': 'apagar_luces+bajar_persianas',
  'sin_presencia,es_de_dia': 'subir_persianas+apagar_luces',
  'humedad_alta,presencia_humana': 'activar_deshumidificador+abrir_ventanas_parcial',
  'humedad_alta,sin_presencia': 'activar_deshumidificador+cerrar_ventanas',
  'puerta_abierta,es_de_noche': 'enviar_alerta_seguridad+encender_luces_exteriores',
  'puerta_abierta,es_de_dia': 'enviar_alerta_seguridad',
  'humo_detectado': 'activar_alarma+apagar_energia+notificar_bomberos',
  'humo_detectado,presencia_humana': 'activar_alarma+guiar_salida_autonoma+notificar_bomberos',
  'co2_alto': 'activar_extractor_aire+abrir_ventanas+notificar_usuarios',
  'fuga_agua_detectada': 'cerrar_valvula_principal+notificar_plomeria+activar_bomba_extractor',
  'modo_ausente': 'apagar_luces+cerrar_persianas+activar_alarma+termostato_eco',
  'modo_noche,presencia_humana': 'encender_luces_suaves+activar_seguridad_perimetral',
  'modo_noche,sin_presencia': 'apagar_luces+activar_alarma_noche',
  'mascota_en_casa,temperatura_baja': 'encender_calefaccion_mascota',
  'mascota_en_casa,sin_presencia': 'activar_camara_mascota+modo_ahorro_energia',
  'puerta_abierta,sin_presencia': 'apagar_luces+cerrar_puerta',

  // combinaciones extendidas
  'presencia_humana,es_de_noche,temperatura_baja,humedad_alta': 'encender_luces+bajar_persianas+termostato_24+activar_deshumidificador',
  'sin_presencia,es_de_dia,temperatura_alta,puerta_abierta': 'subir_persianas+apagar_luces+enviar_alerta_seguridad',
  'humo_detectado,puerta_abierta': 'activar_alarma+notificar_bomberos+abrir_puertas_seguras',
  'co2_alto,es_de_dia': 'activar_extraccion+abrir_ventanas_parcial+notificar_ocupantes',
  'presencia_humana,modo_ausente': 'anular_modo_ausente+encender_luces+notificar_usuario'
};

const opcionesPercepcion = [
  'presencia_humana', 'sin_presencia', 'es_de_noche', 'es_de_dia',
  'temperatura_baja', 'temperatura_media', 'temperatura_alta',
  'humedad_alta', 'puerta_abierta', 'humo_detectado', 'fuga_agua_detectada',
  'co2_alto', 'mascota_en_casa', 'modo_ausente', 'modo_noche'
];

let registros = [];

function normalizarClave(s) {
  return s.split(',').map(x => x.trim()).filter(Boolean).join(',');
}
// Agente inteligente
function actuarAgente(percepcionStr) {
  if (!percepcionStr || percepcionStr.trim() === '') {
    return { accion: 'acción no parametrizada', claveCoincidente: null, notas: 'Percepción vacía' };
  }
  const claveNorm = normalizarClave(percepcionStr);
  if (reglas.hasOwnProperty(claveNorm)) {
    return { accion: reglas[claveNorm], claveCoincidente: claveNorm, notas: 'Coincidencia exacta' };
  }
  const clavesOrdenadas = Object.keys(reglas).sort((a, b) => b.split(',').length - a.split(',').length);
  const partesPercepcion = claveNorm.split(',');
  for (const k of clavesOrdenadas) {
    const tokens = k.split(',').map(x => x.trim());
    const todosPresentes = tokens.every(t => partesPercepcion.includes(t));
    if (todosPresentes) {
      return { accion: reglas[k], claveCoincidente: k, notas: 'Fallback por subconjunto (todas las palabras de la regla están presentes)' };
    }
  }
  return { accion: 'acción por defecto: no definida para esta percepción', claveCoincidente: null, notas: 'No se encontró coincidencia' };
}

// Elementos de la interfaz de usuario
const listaCheckboxes = document.getElementById('listaCheckboxes');
const textoSeleccion = document.getElementById('textoSeleccion');
const botonToggle = document.getElementById('btnToggleDesplegable');
const desplegable = document.getElementById('desplegable');
const buscarPercepcion = document.getElementById('buscarPercepcion');

const percepcionActual = document.getElementById('percepcionActual');
const accionResultado = document.getElementById('accionResultado');
const claveCoincidente = document.getElementById('claveCoincidente');
const notas = document.getElementById('notas');
const areaLog = document.getElementById('areaLog');
const listaReglas = document.getElementById('listaReglas');

function crearCheckbox(label) {
  const wrapper = document.createElement('label');
  wrapper.className = 'perc-checkbox';
  const input = document.createElement('input');
  input.type = 'checkbox';
  input.value = label;
  input.setAttribute('aria-label', label);
  const span = document.createElement('span');
  span.textContent = label;
  wrapper.appendChild(input);
  wrapper.appendChild(span);
  return wrapper;
}
function poblarListaCheckboxes(filtro = '') {
  const seleccionPrev = new Set([...listaCheckboxes.querySelectorAll('input[type="checkbox"]:checked')].map(i => i.value));
  listaCheckboxes.innerHTML = '';
  const items = opcionesPercepcion.filter(o => o.includes(filtro));
  items.forEach(opt => {
    const ch = crearCheckbox(opt);
    const input = ch.querySelector('input');
    if (seleccionPrev.has(opt)) input.checked = true;
    listaCheckboxes.appendChild(ch);
  });
}
poblarListaCheckboxes('');

function leerSeleccionDesplegable() {
  const checks = [...listaCheckboxes.querySelectorAll('input[type="checkbox"]:checked')].map(i => i.value);
  return checks;
}

function refrescarTextoSeleccion() {
  const sel = leerSeleccionDesplegable();
  if (sel.length === 0) textoSeleccion.textContent = 'Seleccionar percepciones...';
  else if (sel.length === 1) textoSeleccion.textContent = sel[0];
  else textoSeleccion.textContent = `${sel.length} percepciones seleccionadas`;
}

botonToggle.addEventListener('click', (e) => {
  const abierto = desplegable.style.display === 'block';
  desplegable.style.display = abierto ? 'none' : 'block';
  botonToggle.setAttribute('aria-expanded', String(!abierto));
});

document.getElementById('btnCerrarDesplegable').addEventListener('click', () => {
  desplegable.style.display = 'none';
  botonToggle.setAttribute('aria-expanded', 'false');
});

buscarPercepcion.addEventListener('input', (e) => {
  poblarListaCheckboxes(e.target.value.trim());
  refrescarTextoSeleccion();
});

document.getElementById('btnSeleccionarTodo').addEventListener('click', () => {
  listaCheckboxes.querySelectorAll('input[type="checkbox"]').forEach(i => i.checked = true);
  refrescarTextoSeleccion();
});
document.getElementById('btnLimpiarSeleccion').addEventListener('click', () => {
  listaCheckboxes.querySelectorAll('input[type="checkbox"]').forEach(i => i.checked = false);
  refrescarTextoSeleccion();
});

listaCheckboxes.addEventListener('change', (e) => {
  refrescarTextoSeleccion();
});

document.getElementById('agregarPersonalizado').addEventListener('click', () => {
  const v = document.getElementById('personalizado').value.trim();
  if (!v) return;
  const tokens = v.split(',').map(x => x.trim()).filter(Boolean);
  tokens.forEach(t => {
    if (!opcionesPercepcion.includes(t)) {
      opcionesPercepcion.push(t);
    }
  });
  poblarListaCheckboxes('');
  listaCheckboxes.querySelectorAll('input[type="checkbox"]').forEach(i => {
    if (tokens.includes(i.value)) i.checked = true;
  });
  document.getElementById('personalizado').value = '';
  refrescarTextoSeleccion();
});

document.getElementById('btnActuar').addEventListener('click', () => {
  const seleccion = leerSeleccionDesplegable();
  const clave = normalizarClave(seleccion.join(','));
  const respuesta = actuarAgente(clave);
  actualizarResultado(clave, respuesta);
  desplegable.style.display = 'none';
  botonToggle.setAttribute('aria-expanded', 'false');
});

document.getElementById('btnAleatorio').addEventListener('click', () => {
  const n = Math.floor(Math.random() * 4) + 1; // 1..4 percepciones
  const pool = [...opcionesPercepcion];
  const picked = [];
  for (let i = 0; i < n; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    picked.push(pool.splice(idx, 1)[0]);
  }
  poblarListaCheckboxes('');
  listaCheckboxes.querySelectorAll('input[type="checkbox"]').forEach(i => i.checked = picked.includes(i.value));
  refrescarTextoSeleccion();
  const clave = normalizarClave(picked.join(','));
  const respuesta = actuarAgente(clave);
  actualizarResultado(clave, respuesta);
});

document.getElementById('btnLimpiar').addEventListener('click', () => {
  listaCheckboxes.querySelectorAll('input[type="checkbox"]').forEach(i => i.checked = false);
  refrescarTextoSeleccion();
  percepcionActual.textContent = '—'; accionResultado.textContent = '—'; claveCoincidente.textContent = '—'; notas.textContent = '—';
});

function actualizarResultado(percepStr, res) {
  percepcionActual.textContent = percepStr || '—';
  accionResultado.textContent = res.accion;
  claveCoincidente.textContent = res.claveCoincidente || '—';
  notas.textContent = res.notas;
  const ts = new Date().toLocaleString();
  const entrada = { ts, percepcion: percepStr, accion: res.accion, clave: res.claveCoincidente || '' };
  registros.unshift(entrada);
  refrescarAreaLog();
  renderizarReglas();
}

function refrescarAreaLog() {
  if (registros.length === 0) {
    areaLog.innerHTML = '<div class="log-line">—</div>';
    return;
  }
  const lineas = registros.map(l => {
    const fecha = `<span class="fecha-neon">[${l.ts}]</span>`;
    const contenido = ` percepcion="${escapeHtml(l.percepcion)}" => accion="${escapeHtml(l.accion)}" (clave: ${escapeHtml(l.clave || '—')})`;
    return `<div class="log-line">${fecha}${contenido}</div>`;
  });
  areaLog.innerHTML = lineas.join('');
}

function escapeHtml(s) {
  if (!s) return '';
  return s.toString().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

document.getElementById('btnBorrarLog').addEventListener('click', () => {
  if (!confirm('¿Borrar todo el registro?')) return;
  registros = [];
  refrescarAreaLog();
});

function renderizarReglas() {
  listaReglas.innerHTML = '';
  const claves = Object.keys(reglas).sort((a, b) => a.localeCompare(b));
  claves.forEach(k => {
    const div = document.createElement('div');
    div.className = 'rule-item';
    const left = document.createElement('div');
    left.innerHTML = `<small>${k}</small><div style="font-weight:700;margin-top:6px">${reglas[k]}</div>`;
    const right = document.createElement('div');
    const botonEliminar = document.createElement('button');
    botonEliminar.textContent = 'Eliminar';
    botonEliminar.addEventListener('click', () => {
      if (confirm(`¿Eliminar regla "${k}" ?`)) {
        delete reglas[k];
        renderizarReglas();
      }
    });
    right.appendChild(botonEliminar);
    div.appendChild(left);
    div.appendChild(right);
    listaReglas.appendChild(div);
  });
}
renderizarReglas();

document.getElementById('btnAgregarRegla').addEventListener('click', () => {
  const clave = document.getElementById('claveRegla').value.trim();
  const accion = document.getElementById('accionRegla').value.trim();
  if (!clave || !accion) { alert('Ingresa clave y acción'); return; }
  const claveNorm = normalizarClave(clave);
  reglas[claveNorm] = accion;
  claveNorm.split(',').forEach(tok => {
    if (!opcionesPercepcion.includes(tok)) {
      opcionesPercepcion.push(tok);
    }
  });
  poblarListaCheckboxes('');
  document.getElementById('claveRegla').value = '';
  document.getElementById('accionRegla').value = '';
  renderizarReglas();
});
