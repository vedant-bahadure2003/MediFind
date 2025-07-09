import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Store from '@/lib/models/Store';
import Medicine from '@/lib/models/Medicine';
import { verifyToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const { name, genericName, brand, price, quantity, description, category, storeId, expiryDate } = await req.json();

    if (!name || !price || !quantity || !category || !storeId) {
      return NextResponse.json(
        { error: 'Name, price, quantity, category, and store are required' },
        { status: 400 }
      );
    }

    // Verify store ownership
    const store = await Store.findOne({ _id: storeId, owner: decoded.userId });
    if (!store) {
      return NextResponse.json(
        { error: 'Store not found or access denied' },
        { status: 403 }
      );
    }

    const medicine = new Medicine({
      name,
      genericName,
      brand,
      price,
      quantity,
      description,
      category,
      store: storeId,
      inStock: quantity > 0,
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
    });

    await medicine.save();

    return NextResponse.json({
      id: medicine._id,
      name: medicine.name,
      genericName: medicine.genericName,
      brand: medicine.brand,
      price: medicine.price,
      quantity: medicine.quantity,
      category: medicine.category,
      description: medicine.description,
      inStock: medicine.inStock,
      expiryDate: medicine.expiryDate,
    });
  } catch (error) {
    console.error('Medicine creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get('storeId');

    if (!storeId) {
      return NextResponse.json(
        { error: 'Store ID is required' },
        { status: 400 }
      );
    }

    // Verify store ownership
    const store = await Store.findOne({ _id: storeId, owner: decoded.userId });
    if (!store) {
      return NextResponse.json(
        { error: 'Store not found or access denied' },
        { status: 403 }
      );
    }

    const medicines = await Medicine.find({ store: storeId }).sort({ createdAt: -1 });

    return NextResponse.json({ medicines });
  } catch (error) {
    console.error('Medicine fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}