'use client';

import { useState, useEffect } from 'react';
import { Plus, Store, Package, Edit, Trash2, MapPin, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Store {
  _id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
}

interface Medicine {
  _id: string;
  name: string;
  genericName?: string;
  brand?: string;
  price: number;
  quantity: number;
  category: string;
  description?: string;
  inStock: boolean;
}

interface StoreOwnerDashboardProps {
  user: any;
  token: string;
  onLogout: () => void;
}

export function StoreOwnerDashboard({ user, token, onLogout }: StoreOwnerDashboardProps) {
  const [stores, setStores] = useState<Store[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [selectedStore, setSelectedStore] = useState<string>('');
  const [showStoreForm, setShowStoreForm] = useState(false);
  const [showMedicineForm, setShowMedicineForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [storeForm, setStoreForm] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    latitude: '',
    longitude: '',
  });

  const [medicineForm, setMedicineForm] = useState({
    name: '',
    genericName: '',
    brand: '',
    price: '',
    quantity: '',
    category: '',
    description: '',
    expiryDate: '',
  });

  const categories = [
    'Pain Relief',
    'Antibiotics',
    'Vitamins',
    'Cold & Flu',
    'Digestive Health',
    'Heart & Blood Pressure',
    'Diabetes',
    'Skin Care',
    'Other',
  ];

  useEffect(() => {
    fetchStores();
  }, []);

  useEffect(() => {
    if (selectedStore) {
      fetchMedicines();
    }
  }, [selectedStore]);

  const fetchStores = async () => {
    try {
      const response = await fetch('/api/stores', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setStores(data.stores);
        if (data.stores.length > 0 && !selectedStore) {
          setSelectedStore(data.stores[0]._id);
        }
      }
    } catch (error) {
      console.error('Error fetching stores:', error);
    }
  };

  const fetchMedicines = async () => {
    if (!selectedStore) return;
    
    try {
      const response = await fetch(`/api/medicines?storeId=${selectedStore}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setMedicines(data.medicines);
      }
    } catch (error) {
      console.error('Error fetching medicines:', error);
    }
  };

  const handleStoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/stores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...storeForm,
          latitude: parseFloat(storeForm.latitude),
          longitude: parseFloat(storeForm.longitude),
        }),
      });

      if (response.ok) {
        setStoreForm({
          name: '',
          address: '',
          phone: '',
          email: '',
          latitude: '',
          longitude: '',
        });
        setShowStoreForm(false);
        fetchStores();
      }
    } catch (error) {
      console.error('Error creating store:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMedicineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/medicines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...medicineForm,
          price: parseFloat(medicineForm.price),
          quantity: parseInt(medicineForm.quantity),
          storeId: selectedStore,
        }),
      });

      if (response.ok) {
        setMedicineForm({
          name: '',
          genericName: '',
          brand: '',
          price: '',
          quantity: '',
          category: '',
          description: '',
          expiryDate: '',
        });
        setShowMedicineForm(false);
        fetchMedicines();
      }
    } catch (error) {
      console.error('Error creating medicine:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setStoreForm(prev => ({
            ...prev,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString(),
          }));
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Store className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Store Dashboard</h1>
                <p className="text-gray-600">Welcome back, {user.name}</p>
              </div>
            </div>
            <Button onClick={onLogout} variant="outline">
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="stores" className="space-y-6">
          <TabsList>
            <TabsTrigger value="stores">My Stores</TabsTrigger>
            <TabsTrigger value="medicines">Medicines</TabsTrigger>
          </TabsList>

          <TabsContent value="stores">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Your Stores</h2>
                <Button onClick={() => setShowStoreForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Store
                </Button>
              </div>

              {showStoreForm && (
                <Card>
                  <CardHeader>
                    <CardTitle>Add New Store</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleStoreSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Store Name</Label>
                          <Input
                            id="name"
                            value={storeForm.name}
                            onChange={(e) => setStoreForm({ ...storeForm, name: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            value={storeForm.phone}
                            onChange={(e) => setStoreForm({ ...storeForm, phone: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={storeForm.email}
                            onChange={(e) => setStoreForm({ ...storeForm, email: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="address">Address</Label>
                          <Input
                            id="address"
                            value={storeForm.address}
                            onChange={(e) => setStoreForm({ ...storeForm, address: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="latitude">Latitude</Label>
                          <Input
                            id="latitude"
                            type="number"
                            step="any"
                            value={storeForm.latitude}
                            onChange={(e) => setStoreForm({ ...storeForm, latitude: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="longitude">Longitude</Label>
                          <Input
                            id="longitude"
                            type="number"
                            step="any"
                            value={storeForm.longitude}
                            onChange={(e) => setStoreForm({ ...storeForm, longitude: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button type="button" onClick={getCurrentLocation} variant="outline">
                          <MapPin className="h-4 w-4 mr-2" />
                          Get Current Location
                        </Button>
                      </div>
                      <div className="flex space-x-2">
                        <Button type="submit" disabled={isLoading}>
                          {isLoading ? 'Adding...' : 'Add Store'}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setShowStoreForm(false)}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stores.map((store) => (
                  <Card key={store._id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Store className="h-5 w-5 mr-2" />
                        {store.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                          {store.address}
                        </div>
                        <div className="flex items-center text-sm">
                          <Phone className="h-4 w-4 mr-2 text-gray-500" />
                          {store.phone}
                        </div>
                        <div className="flex items-center text-sm">
                          <Mail className="h-4 w-4 mr-2 text-gray-500" />
                          {store.email}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="medicines">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Medicine Inventory</h2>
                <div className="flex items-center space-x-4">
                  <Select value={selectedStore} onValueChange={setSelectedStore}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select store" />
                    </SelectTrigger>
                    <SelectContent>
                      {stores.map((store) => (
                        <SelectItem key={store._id} value={store._id}>
                          {store.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={() => setShowMedicineForm(true)} disabled={!selectedStore}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Medicine
                  </Button>
                </div>
              </div>

              {showMedicineForm && (
                <Card>
                  <CardHeader>
                    <CardTitle>Add New Medicine</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleMedicineSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="medicineName">Medicine Name</Label>
                          <Input
                            id="medicineName"
                            value={medicineForm.name}
                            onChange={(e) => setMedicineForm({ ...medicineForm, name: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="genericName">Generic Name</Label>
                          <Input
                            id="genericName"
                            value={medicineForm.genericName}
                            onChange={(e) => setMedicineForm({ ...medicineForm, genericName: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="brand">Brand</Label>
                          <Input
                            id="brand"
                            value={medicineForm.brand}
                            onChange={(e) => setMedicineForm({ ...medicineForm, brand: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="category">Category</Label>
                          <Select value={medicineForm.category} onValueChange={(value) => setMedicineForm({ ...medicineForm, category: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="price">Price (₹)</Label>
                          <Input
                            id="price"
                            type="number"
                            step="0.01"
                            value={medicineForm.price}
                            onChange={(e) => setMedicineForm({ ...medicineForm, price: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="quantity">Quantity</Label>
                          <Input
                            id="quantity"
                            type="number"
                            value={medicineForm.quantity}
                            onChange={(e) => setMedicineForm({ ...medicineForm, quantity: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="expiryDate">Expiry Date</Label>
                          <Input
                            id="expiryDate"
                            type="date"
                            value={medicineForm.expiryDate}
                            onChange={(e) => setMedicineForm({ ...medicineForm, expiryDate: e.target.value })}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={medicineForm.description}
                          onChange={(e) => setMedicineForm({ ...medicineForm, description: e.target.value })}
                          rows={3}
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Button type="submit" disabled={isLoading}>
                          {isLoading ? 'Adding...' : 'Add Medicine'}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setShowMedicineForm(false)}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {medicines.map((medicine) => (
                  <Card key={medicine._id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{medicine.name}</CardTitle>
                        <Badge variant={medicine.inStock ? "default" : "destructive"}>
                          {medicine.inStock ? "In Stock" : "Out of Stock"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {medicine.genericName && (
                          <p className="text-sm text-gray-600">
                            <strong>Generic:</strong> {medicine.genericName}
                          </p>
                        )}
                        {medicine.brand && (
                          <p className="text-sm text-gray-600">
                            <strong>Brand:</strong> {medicine.brand}
                          </p>
                        )}
                        <p className="text-sm text-gray-600">
                          <strong>Category:</strong> {medicine.category}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Price:</strong> ₹{medicine.price.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Quantity:</strong> {medicine.quantity}
                        </p>
                        {medicine.description && (
                          <p className="text-sm text-gray-600">
                            <strong>Description:</strong> {medicine.description}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}