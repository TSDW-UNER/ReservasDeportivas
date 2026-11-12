// src/componentes/EstadosComunes.tsx
import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';

// 1. Componente de Carga (Spinner)
export function EstadoCargando({ mensaje = 'Cargando datos...' }) {
  return (
    <View style={styles.contenedor}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={styles.texto}>{mensaje}</Text>
    </View>
  );
}

// 2. Componente de Vacío (Ideal para días bloqueados por lluvia o sin turnos)
export function EstadoVacio({ mensaje = 'No hay elementos disponibles en este momento.' }) {
  return (
    <View style={styles.contenedor}>
      <Text style={styles.iconoVacio}>🌧️</Text>
      <Text style={styles.textoPrincipal}>Sin disponibilidad</Text>
      <Text style={styles.textoSecundario}>{mensaje}</Text>
    </View>
  );
}

// 3. Componente de Error (Para fallas de red o API)
interface EstadoErrorProps {
  mensaje: string;
  onReintentar?: () => void;
}

export function EstadoError({ mensaje, onReintentar }: EstadoErrorProps) {
  return (
    <View style={styles.contenedor}>
      <Text style={styles.iconoError}>⚠️</Text>
      <Text style={styles.textoPrincipal}>Ocurrió un problema</Text>
      <Text style={styles.textoSecundario}>{mensaje}</Text>
      {onReintentar && (
        <TouchableOpacity style={styles.boton} onPress={onReintentar}>
          <Text style={styles.textoBoton}>Reintentar</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  texto: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  textoPrincipal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  textoSecundario: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  iconoVacio: {
    fontSize: 40,
  },
  iconoError: {
    fontSize: 40,
  },
  boton: {
    marginTop: 16,
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  textoBoton: {
    color: '#fff',
    fontWeight: 'bold',
  },
});