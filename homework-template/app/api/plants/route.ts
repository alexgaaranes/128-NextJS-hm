// Build on this, you can add your own as long as it fits the specs

import { NextRequest, NextResponse } from "next/server";
import { db } from '@/lib/db';
import { Plant } from '@/types';

export async function GET(request: NextRequest) {
  try {
    // get the location parameter
    const locationParam = request.nextUrl.searchParams.get('location');

    // find all plants with that filter
    const plants = await db.findMany(
      locationParam ? { location: locationParam } : undefined
    );

    return NextResponse.json(plants, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch plants' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
    try{
        const { name, species, location } : Plant = await request.json();

        // validate fields
        if (!name || !species || !location ) { 
            return NextResponse.json({ error: "Invalid JSON File: Missing required fields." }, { status: 400 });
        }

        // add new plant to db
        const created_plant = await db.create({
            name,
            species,
            location,
            status: "Healthy",
            lastWatered: new Date(),
        });

        return NextResponse.json({
                message: "Plant added successfully",
                data: created_plant
            }, 
            {status: 201}
        );

    } catch {
    return NextResponse.json(
      { error: 'Invalid JSON' },
      { status: 400 }
    );
  }
}