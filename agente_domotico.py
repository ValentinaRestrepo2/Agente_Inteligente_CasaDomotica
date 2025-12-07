acciones = {
    'presencia_humana,es_de_noche,temperatura_baja'   : 'encender_luces+bajar_persianas+termostato_24',
    'presencia_humana,es_de_noche,temperatura_media'  : 'encender_luces+bajar_persianas',
    'presencia_humana,es_de_noche,temperatura_alta'   : 'encender_luces+bajar_persianas+termostato_22',
    'sin_presencia,es_de_noche,temperatura_baja'      : 'apagar_luces+bajar_persianas',
    'sin_presencia,es_de_noche,temperatura_media'     : 'apagar_luces+bajar_persianas',
    'sin_presencia,es_de_noche,temperatura_alta'      : 'apagar_luces+bajar_persianas',
    'presencia_humana,es_de_dia,temperatura_baja'     : 'subir_persianas+termostato_24',
    'presencia_humana,es_de_dia,temperatura_media'    : 'subir_persianas+apagar_luces',
    'presencia_humana,es_de_dia,temperatura_alta'     : 'bajar_persianas+apagar_luces+termostato_22',
    'sin_presencia,es_de_dia,temperatura_baja'        : 'subir_persianas+apagar_luces',
    'sin_presencia,es_de_dia,temperatura_media'       : 'subir_persianas+apagar_luces',
    'sin_presencia,es_de_dia,temperatura_alta'        : 'subir_persianas+apagar_luces',
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
    'mascota_en_casa,sin_presencia': 'activar_camara_mascota+modo_ahorro',
    'presencia_humana,es_de_noche,temperatura_baja,humedad_alta': 
        'encender_luces+bajar_persianas+termostato_24+activar_deshumidificador',
    'sin_presencia,es_de_dia,temperatura_alta,puerta_abierta': 
        'subir_persianas+apagar_luces+enviar_alerta_seguridad',

    'co2_alto,es_de_dia,presencia_humana': 
        'activar_extractor_aire+abrir_ventanas+notificar_usuarios',
}


class agentePercepciones:
    def __init__(self, acciones: dict):
        self.acciones = acciones
        self.percepciones = ''

    def actuar(self, percepcion: str, accion_basica: str = 'secuencia de percepciones no parametrizadas, intentelo de nuevo') -> str:
        if not percepcion:
            return accion_basica
        self.percepciones = percepcion
        print("percepciones:", self.percepciones)

        if self.percepciones in self.acciones:
            return self.acciones[self.percepciones]

        self.percepciones = ''
        return accion_basica
    
if __name__ == '__main__':
    pruebas = [
        "presencia_humana,es_de_noche,temperatura_baja",
        "humedad_alta,sin_presencia",
        "puerta_abierta,es_de_dia",
        "humo_detectado",
        "modo_ausente",
        "co2_alto,es_de_dia,presencia_humana",
        "mascota_en_casa,temperatura_baja"
    ]

    for p in pruebas:
        print("\nPercepción:", p)
        print("Acción:", agentePercepciones(acciones).actuar(p))
