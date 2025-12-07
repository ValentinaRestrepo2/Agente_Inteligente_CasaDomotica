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
  // combinaciones extendidas
  'presencia_humana,es_de_noche,temperatura_baja,humedad_alta': 'encender_luces+bajar_persianas+termostato_24+activar_deshumidificador',
  'sin_presencia,es_de_dia,temperatura_alta,puerta_abierta': 'subir_persianas+apagar_luces+enviar_alerta_seguridad',
  'humo_detectado,puerta_abierta': 'activar_alarma+notificar_bomberos+abrir_puertas_seguras',
  'co2_alto,es_de_dia': 'activar_extraccion+abrir_ventanas_parcial+notificar_ocupantes',
  'presencia_humana,modo_ausente': 'anular_modo_ausente+encender_luces+notificar_usuario'
};

const opcionesPercepcion = [
  'presencia_humana','sin_presencia','es_de_noche','es_de_dia',
  'temperatura_baja','temperatura_media','temperatura_alta',
  'humedad_alta','puerta_abierta','humo_detectado','fuga_agua_detectada',
  'co2_alto','mascota_en_casa','modo_ausente','modo_noche'
];

let registros = [];

function normalizarClave(s){
  return s.split(',').map(x => x.trim()).filter(Boolean).join(',');
}

function actuarAgente(percepcionStr){
  if (!percepcionStr || percepcionStr.trim() === '') {
    return { accion: 'acción no parametrizada', claveCoincidente: null, notas: 'Percepción vacía' };
  }
  const claveNorm = normalizarClave(percepcionStr);
  if (reglas.hasOwnProperty(claveNorm)){
    return { accion: reglas[claveNorm], claveCoincidente: claveNorm, notas: 'Coincidencia exacta' };
  }
  const clavesOrdenadas = Object.keys(reglas).sort((a,b) => b.split(',').length - a.split(',').length);
  const partesPercepcion = claveNorm.split(',');
  for (const k of clavesOrdenadas){
    const tokens = k.split(',').map(x => x.trim());
    const todosPresentes = tokens.every(t => partesPercepcion.includes(t));
    if (todosPresentes) {
      return { accion: reglas[k], claveCoincidente: k, notas: 'Fallback por subconjunto (todas las palabras de la regla están presentes)' };
    }
  }
  return { accion: 'acción por defecto: no definida para esta percepción', claveCoincidente: null, notas: 'No se encontró coincidencia' };
}
