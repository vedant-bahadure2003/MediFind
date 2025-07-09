'use client';

import { useState, useEffect } from 'react';
import { Pill, Store, Users, Search, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchBar } from '@/components/SearchBar';
import { SearchResults } from '@/components/SearchResults';
import { AuthModal } from '@/components/AuthModal';
import { StoreOwnerDashboard } from '@/components/StoreOwnerDashboard';

interface SearchResult {
  store: {
    id: string;
    name: string;
    address: string;
    phone: string;
    email: string;
    location: {
      type: string;
      coordinates: [number, number];
    };
  };
  medicines: Array<{
    id: string;
    name: string;
    genericName?: string;
    brand?: string;
    price: number;
    quantity: number;
    category: string;
    description?: string;
  }>;
  distance: number;
}

export default function Home() {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleSearch = async (query: string, location?: { lat: number; lng: number }) => {
    setIsSearching(true);
    setError('');
    
    try {
      const params = new URLSearchParams({
        q: query,
        ...(location && {
          lat: location.lat.toString(),
          lng: location.lng.toString(),
        }),
      });

      console.log('Making request to:', `/api/medicines/search?${params}`);
      
      const response = await fetch(`/api/medicines/search?${params}`);
      
      // Check if the response is ok
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error('Server returned non-JSON response');
      }
      
      const data = await response.json();
      console.log('Search response:', data);
      
      if (data.results) {
        setSearchResults(data.results);
      } else {
        console.error('Search failed:', data.error);
        setError(data.error || 'Search failed');
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setError(error instanceof Error ? error.message : 'Search failed');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAuth = (authToken: string, authUser: any) => {
    setToken(authToken);
    setUser(authUser);
    
    // Only use localStorage if running in browser (not in artifacts)
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem('auth_token', authToken);
        localStorage.setItem('user', JSON.stringify(authUser));
      } catch (e) {
        console.warn('LocalStorage not available');
      }
    }
  };

  const handleLogout = () => {
    setToken('');
    setUser(null);
    
    // Only use localStorage if running in browser (not in artifacts)
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
      } catch (e) {
        console.warn('LocalStorage not available');
      }
    }
  };

  // Check for existing auth on component mount
  useEffect(() => {
    // Only use localStorage if running in browser (not in artifacts)
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const savedToken = localStorage.getItem('auth_token');
        const savedUser = localStorage.getItem('user');
        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
        }
      } catch (e) {
        console.warn('LocalStorage not available or corrupted');
      }
    }
  }, []);

  if (user && user.role === 'store_owner') {
    return <StoreOwnerDashboard user={user} token={token} onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Pill className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">MediFind</h1>
                <p className="text-gray-600 text-sm">Find medicines near you</p>
              </div>
            </div>
            <Button
              onClick={() => setShowAuthModal(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Store className="h-4 w-4 mr-2" />
              Store Owner Login
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Find Your Medicines Instantly
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            Discover the nearest medical stores with your required medicines in stock. 
            Fast, accurate, and location-based search.
          </p>
          
          <SearchBar onSearch={handleSearch} isLoading={isSearching} />
          
          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}
          
          {/* Quick Stats */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-sm">
              <div className="bg-blue-100 p-3 rounded-full mb-4">
                <Search className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Search</h3>
              <p className="text-gray-600 text-center">
                Search by medicine name, brand, or generic name with intelligent matching
              </p>
            </div>
            
            <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-sm">
              <div className="bg-green-100 p-3 rounded-full mb-4">
                <MapPin className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Location-Based</h3>
              <p className="text-gray-600 text-center">
                Find stores near you with accurate distance calculations and directions
              </p>
            </div>
            
            <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-sm">
              <div className="bg-purple-100 p-3 rounded-full mb-4">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-Time</h3>
              <p className="text-gray-600 text-center">
                Get up-to-date stock information and availability from verified stores
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Search Results */}
      {(searchResults.length > 0 || isSearching) && (
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <SearchResults results={searchResults} isLoading={isSearching} />
          </div>
        </section>
      )}

      {/* How It Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">For Customers</h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 rounded-full p-2 flex-shrink-0">
                    <span className="text-blue-600 font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Search for Medicine</h4>
                    <p className="text-gray-600">Enter the medicine name you need</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 rounded-full p-2 flex-shrink-0">
                    <span className="text-blue-600 font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Allow Location</h4>
                    <p className="text-gray-600">Enable location to find nearby stores</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 rounded-full p-2 flex-shrink-0">
                    <span className="text-blue-600 font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Find & Contact</h4>
                    <p className="text-gray-600">Browse results and contact the store</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">For Store Owners</h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-green-100 rounded-full p-2 flex-shrink-0">
                    <span className="text-green-600 font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Register Store</h4>
                    <p className="text-gray-600">Create an account and add your store details</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-green-100 rounded-full p-2 flex-shrink-0">
                    <span className="text-green-600 font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Add Inventory</h4>
                    <p className="text-gray-600">List all available medicines with prices</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-green-100 rounded-full p-2 flex-shrink-0">
                    <span className="text-green-600 font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Get Customers</h4>
                    <p className="text-gray-600">Receive inquiries from nearby customers</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <Pill className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold">MediFind</h3>
              </div>
              <p className="text-gray-400 mb-4">
                Making healthcare accessible by connecting patients with nearby medical stores 
                and ensuring medicine availability in real-time.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Customers</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Search Medicines</li>
                <li>Find Stores</li>
                <li>Compare Prices</li>
                <li>Get Directions</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Stores</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Register Store</li>
                <li>Manage Inventory</li>
                <li>Update Stock</li>
                <li>Get Customers</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 MediFind. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuth={handleAuth}
      />
    </div>
  );
}