import { NextRequest, NextResponse } from 'next/server'; 
import { connectToDatabase } from '@/lib/db'; 
import mongoose from 'mongoose';
import Store from '@/lib/models/Store';

// Force Store model registration if not already registered
if (!mongoose.models.Store) {
  mongoose.model('Store', Store.schema);
}
import Medicine from '@/lib/models/Medicine'; 

// Geolocation calculation function
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in kilometers
  return distance;
}

export async function GET(req: NextRequest) { 
  try { 
    console.log('Connecting to database...');
    await connectToDatabase();
    console.log('Database connected successfully'); 
     
    const { searchParams } = new URL(req.url); 
    const query = searchParams.get('q'); 
    const lat = parseFloat(searchParams.get('lat') || '0'); 
    const lng = parseFloat(searchParams.get('lng') || '0'); 
    const radius = parseInt(searchParams.get('radius') || '10'); // Default 10km radius 
 
    if (!query) { 
      return NextResponse.json( 
        { error: 'Search query is required' }, 
        { status: 400 } 
      ); 
    } 
 
    console.log('Search query:', query, 'Location:', { lat, lng, radius });

    // Find medicines matching the search query 
    console.log('Searching for medicines...');
    
    // First, let's try a simpler query to test if the database is working
    let medicines;
    try {
      medicines = await Medicine.find({ 
        $or: [ 
          { name: { $regex: query, $options: 'i' } }, 
          { genericName: { $regex: query, $options: 'i' } }, 
          { brand: { $regex: query, $options: 'i' } }, 
        ], 
        inStock: true, 
        quantity: { $gt: 0 }, 
      }).populate('store'); 
    } catch (dbError) {
      console.error('Database query error:', dbError);
      return NextResponse.json( 
        { 
          error: 'Database query failed',
          message: dbError instanceof Error ? dbError.message : 'Unknown database error',
        }, 
        { status: 500 } 
      ); 
    }
    
    console.log('Found medicines:', medicines.length); 
 
    // If no medicines found, return empty results
    if (!medicines || medicines.length === 0) {
      return NextResponse.json({
        results: [],
        total: 0,
        message: 'No medicines found matching your search'
      });
    }

    // Filter by location if coordinates are provided 
    let results = medicines; 
    if (lat && lng && lat !== 0 && lng !== 0) { 
      results = medicines.filter((medicine: any) => { 
        const store = medicine.store; 
        if (!store || !store.location || !store.location.coordinates) return false; 
         
        try {
          const distance = calculateDistance( 
            lat, 
            lng, 
            store.location.coordinates[1], 
            store.location.coordinates[0] 
          ); 
           
          return distance <= radius; 
        } catch (geoError) {
          console.error('Geolocation calculation error:', geoError);
          return false; // Skip this medicine if geolocation fails
        }
      }); 
 
      // Sort by distance 
      results.sort((a: any, b: any) => { 
        try {
          const distanceA = calculateDistance( 
            lat, 
            lng, 
            a.store.location.coordinates[1], 
            a.store.location.coordinates[0] 
          ); 
          const distanceB = calculateDistance( 
            lat, 
            lng, 
            b.store.location.coordinates[1], 
            b.store.location.coordinates[0] 
          ); 
          return distanceA - distanceB; 
        } catch (geoError) {
          console.error('Sorting by distance error:', geoError);
          return 0; // Keep original order if sorting fails
        }
      }); 
    } 
 
    // Group by store and calculate distances 
    const storeResults = new Map(); 
     
    results.forEach((medicine: any) => { 
      const store = medicine.store; 
      if (!store) return; // Skip if store is null
      
      const storeId = store._id.toString(); 
       
      let distance = 0; 
      if (lat && lng && lat !== 0 && lng !== 0) { 
        try {
          if (store.location && store.location.coordinates) {
            distance = calculateDistance( 
              lat, 
              lng, 
              store.location.coordinates[1], 
              store.location.coordinates[0] 
            ); 
          }
        } catch (geoError) {
          console.error('Distance calculation error:', geoError);
          distance = 0; // Set to 0 if calculation fails
        }
      } 
       
      if (!storeResults.has(storeId)) { 
        storeResults.set(storeId, { 
          store: { 
            id: store._id, 
            name: store.name, 
            address: store.address, 
            phone: store.phone, 
            email: store.email, 
            location: store.location, 
          }, 
          medicines: [], 
          distance: distance, 
        }); 
      } 
       
      storeResults.get(storeId).medicines.push({ 
        id: medicine._id, 
        name: medicine.name, 
        genericName: medicine.genericName, 
        brand: medicine.brand, 
        price: medicine.price, 
        quantity: medicine.quantity, 
        category: medicine.category, 
        description: medicine.description, 
      }); 
    }); 
 
    const finalResults = Array.from(storeResults.values()); 
 
    return NextResponse.json({ 
      results: finalResults, 
      total: finalResults.length, 
    }); 
  } catch (error) { 
    console.error('Search error:', error);
    
    // Return a proper JSON error response
    return NextResponse.json( 
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
      }, 
      { status: 500 } 
    ); 
  } 
}