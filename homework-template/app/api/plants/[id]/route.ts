import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { STATUS_OPTIONS, PlantStatus } from "@/app/types/plants";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const id = (await params).id;
  const plant = await db.findUnique(id);

  if (!plant) {
    return NextResponse.json(
      { error: `Plant with id ${id} not found.` },
      { status: 404 },
    );
  }

  return NextResponse.json({
    data: plant,
    message: "Plant retrieved successfully",
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const id = (await params).id;
  const { status, lastWatered } = await request.json();

  if (!status && !lastWatered) {
    return NextResponse.json(
      { error: "Missing status or lastWatered field" },
      { status: 400 },
    );
  }

  if (status && !STATUS_OPTIONS.includes(status as PlantStatus)) {
    return NextResponse.json(
      { error: `Invalid status. Must be one of: ${STATUS_OPTIONS.join(", ")}` },
      { status: 400 },
    );
  }

  if (lastWatered) {
    const date = new Date(lastWatered);

    if (isNaN(date.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format" },
        { status: 400 },
      );
    }

    if (date > new Date()) {
      return NextResponse.json(
        { error: "Date cannot be in the future" },
        { status: 400 },
      );
    }
  }

  const updatedPlant = await db.update(id, { status, lastWatered });

  if (!updatedPlant) {
    return NextResponse.json(
      { error: `Plant with id ${id} not found` },
      { status: 404 },
    );
  }

  return NextResponse.json({
    message: "Plant updated successfully",
    data: updatedPlant,
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const id = (await params).id;
  const success = await db.delete(id);

  if (!success) {
    return NextResponse.json(
      { error: `Plant with id ${id} not found` },
      { status: 404 },
    );
  }

  return NextResponse.json({ message: "Plant successfully deleted" });
}
