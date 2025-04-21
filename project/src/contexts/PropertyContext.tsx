import React, { createContext, useContext, useState, useEffect } from 'react';
import { Property } from '../types';
import { propertyService } from '../services/supabase';

interface PropertyContextType {
  properties: Property[];
  selectedProperty: Property | null;
  setSelectedProperty: (property: Property | null) => void;
  isLoading: boolean;
  error: string | null;
  refreshProperties: () => Promise<void>;
}

const PropertyContext = createContext<PropertyContextType>({
  properties: [],
  selectedProperty: null,
  setSelectedProperty: () => {},
  isLoading: true,
  error: null,
  refreshProperties: async () => {}
});

export const useProperty = () => useContext(PropertyContext);

export const PropertyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProperties = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await propertyService.getAll();
      setProperties(data);
      if (data.length > 0 && !selectedProperty) {
        setSelectedProperty(data[0]);
      }
    } catch (err) {
      console.error('Error loading properties:', err);
      setError('Failed to load properties. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProperties();
  }, []);

  return (
    <PropertyContext.Provider 
      value={{ 
        properties, 
        selectedProperty, 
        setSelectedProperty,
        isLoading,
        error,
        refreshProperties: loadProperties
      }}
    >
      {children}
    </PropertyContext.Provider>
  );
};