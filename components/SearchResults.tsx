'use client';

import { Phone, Mail, MapPin, Clock, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Medicine {
  id: string;
  name: string;
  genericName?: string;
  brand?: string;
  price: number;
  quantity: number;
  category: string;
  description?: string;
}

interface Store {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
}

interface SearchResult {
  store: Store;
  medicines: Medicine[];
  distance: number;
}

interface SearchResultsProps {
  results: SearchResult[];
  isLoading?: boolean;
}

export function SearchResults({ results, isLoading }: SearchResultsProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-300 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 bg-gray-300 rounded"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
        <p className="text-gray-500">Try searching for a different medicine or check your location settings.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-sm text-gray-600 mb-4">
        Found {results.length} store{results.length !== 1 ? 's' : ''} with matching medicines
      </div>
      
      {results.map((result) => (
        <Card key={result.store.id} className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-xl text-gray-900 mb-1">
                  {result.store.name}
                </CardTitle>
                <div className="flex items-center text-gray-600 mb-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span className="text-sm">{result.store.address}</span>
                </div>
                {result.distance > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {result.distance.toFixed(1)} km away
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="h-4 w-4 mr-2" />
                <span>{result.store.phone}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="h-4 w-4 mr-2" />
                <span>{result.store.email}</span>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-3">Available Medicines:</h4>
              <div className="space-y-3">
                {result.medicines.map((medicine) => (
                  <div key={medicine.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">{medicine.name}</span>
                        {medicine.brand && (
                          <Badge variant="outline" className="text-xs">
                            {medicine.brand}
                          </Badge>
                        )}
                      </div>
                      {medicine.genericName && (
                        <p className="text-sm text-gray-600 mb-1">
                          Generic: {medicine.genericName}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>₹{medicine.price.toFixed(2)}</span>
                        <span className="flex items-center">
                          <Package className="h-3 w-3 mr-1" />
                          {medicine.quantity} in stock
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {medicine.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex items-center gap-2 mt-4 pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`tel:${result.store.phone}`, '_self')}
              >
                <Phone className="h-4 w-4 mr-2" />
                Call Store
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`mailto:${result.store.email}`, '_self')}
              >
                <Mail className="h-4 w-4 mr-2" />
                Email Store
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}