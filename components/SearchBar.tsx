'use client';

import { useState } from 'react';
import { Search, MapPin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getCurrentLocation } from '@/lib/geolocation';

interface SearchBarProps {
  onSearch: (query: string, location?: { lat: number; lng: number }) => void;
  isLoading?: boolean;
}

export function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  const handleLocationClick = async () => {
    setLocationLoading(true);
    try {
      const userLocation = await getCurrentLocation();
      setLocation({
        lat: userLocation.latitude,
        lng: userLocation.longitude,
      });
    } catch (error) {
      console.error('Error getting location:', error);
      alert('Unable to get your location. Please enable location services.');
    } finally {
      setLocationLoading(false);
    }
  };

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query.trim(), location || undefined);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search for medicines (e.g., Paracetamol, Aspirin)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10 pr-4 py-6 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-lg"
            />
          </div>
          <Button
            onClick={handleLocationClick}
            disabled={locationLoading}
            variant="outline"
            className="h-12 px-4 border-2 border-gray-200 hover:border-blue-500"
          >
            {locationLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <MapPin className={`h-5 w-5 ${location ? 'text-green-500' : 'text-gray-400'}`} />
            )}
          </Button>
          <Button
            onClick={handleSearch}
            disabled={!query.trim() || isLoading}
            className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              'Search'
            )}
          </Button>
        </div>
        
        {location && (
          <div className="mt-2 flex items-center text-sm text-green-600">
            <MapPin className="h-4 w-4 mr-1" />
            Location detected - showing nearby results
          </div>
        )}
      </div>
    </div>
  );
}