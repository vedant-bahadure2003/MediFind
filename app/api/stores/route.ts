import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Store from '@/lib/models/Store';
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

    const { name, address, phone, email, latitude, longitude } = await req.json();

    if (!name || !address || !phone || !email || !latitude || !longitude) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    const store = new Store({
      name,
      address,
      phone,
      email,
      location: {
        type: 'Point',
        coordinates: [longitude, latitude],
      },
      owner: decoded.userId,
    });

    await store.save();

    return NextResponse.json({
      id: store._id,
      name: store.name,
      address: store.address,
      phone: store.phone,
      email: store.email,
      location: store.location,
    });
  } catch (error) {
    console.error('Store creation error:', error);
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

    const stores = await Store.find({ owner: decoded.userId, isActive: true });

    return NextResponse.json({ stores });
  } catch (error) {
    console.error('Store fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}