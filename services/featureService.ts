
import { Feature, FeatureSchema } from '../types';

const API_BASE_URL = 'http://localhost:3000/api/features';

/**
 * Servicio de persistencia para el Rastro de Funciones.
 */
export const featureService = {
  
  getAll: async (): Promise<Feature[]> => {
    try {
      const response = await fetch(API_BASE_URL);
      if (!response.ok) throw new Error('Backend offline');
      const data = await response.json();
      return data.map((item: any) => FeatureSchema.parse(item));
    } catch (error) {
      const localData = localStorage.getItem('scriptorium_features');
      if (localData) {
          const parsed = JSON.parse(localData);
          return parsed.map((item: any) => FeatureSchema.parse(item));
      }
      
      // Intentar cargar del archivo seed si no hay nada en localStorage
      try {
          const seedResponse = await fetch('/features_seed.json');
          if (seedResponse.ok) {
              const seedData = await seedResponse.json();
              localStorage.setItem('scriptorium_features', JSON.stringify(seedData));
              return seedData.map((item: any) => FeatureSchema.parse(item));
          }
      } catch (seedErr) {
          console.error("No se pudo cargar el archivo seed:", seedErr);
      }
      
      return [];
    }
  },

  save: async (feature: Feature): Promise<void> => {
    const validated = FeatureSchema.parse(feature);
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validated)
      });
      if (!response.ok) throw new Error('Error al guardar en backend');
    } catch (error) {
      const features = await featureService.getAll();
      const exists = features.find(f => f.id === validated.id);
      const updatedList = exists 
        ? features.map(f => f.id === validated.id ? validated : f)
        : [validated, ...features];
      
      localStorage.setItem('scriptorium_features', JSON.stringify(updatedList));
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await fetch(`${API_BASE_URL}/${id}`, { method: 'DELETE' });
    } catch (error) {
      const features = await featureService.getAll();
      localStorage.setItem('scriptorium_features', JSON.stringify(features.filter(f => f.id !== id)));
    }
  }
};
