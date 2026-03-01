import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Plant } from "@/types";

export async function GET(request: NextRequest) {
  const searchParams = await request.nextUrl.searchParams;
  const location = searchParams.get("location");

  const plants = await db.findMany({
    location: location ? location : undefined,
  });

  return NextResponse.json({
    data: plants,
    message: "Plants retrieved successfully",
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, species, location }: Plant = body;

    if (!name || !species || !location) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 },
      );
    }

    await db.create({
      name,
      species,
      location,
      status: "Healthy",
      lastWatered: new Date(),
    });

    return NextResponse.json(
      { message: `New plant ${name} created` },
      { status: 201 },
    );
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }
}
