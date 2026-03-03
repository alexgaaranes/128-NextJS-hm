import { NextRequest, NextResponse } from "next/server";
import { db } from '@/lib/db';
import { STATUS_OPTIONS, PlantStatus } from '@/app/types/plants';

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    try{
        // get ID from URL
        const { id } = await context.params;

        // find the plant with that unique id
        const plant = await db.findUnique(id);

        if (!plant) {
            return NextResponse.json({ error: `Plant with ID ${id} not found` }, { status: 404 });
        }

        return NextResponse.json(plant, { status: 200 }); 
    } catch {
        return NextResponse.json(
            { error: 'Failed to find the plant ' },
            { status: 500 }
        );
    }
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    try{
        // get ID from URL
        const {id} = await context.params;

        // get the JSON from the body
        const {status, lastWatered} = await request.json();
        
        // atleast one of the field must exist
        if (!status && !lastWatered) {
                return NextResponse.json(
                    { error: "You must provide either 'status', 'lastWatered', or both to update the plant."},
                    { status: 400 }
            );
        }

        // check if status is valid
        if (status !== undefined && !STATUS_OPTIONS.includes(status as PlantStatus)) {
            return NextResponse.json(
                { error: `Invalid status '${status}'. Allowed values are: ${STATUS_OPTIONS.join(", ")}.`},
                { status: 400 }
            );
        }

        // check if lastWatered is valid
        if (lastWatered !== undefined) {
            const testDate = new Date(lastWatered);

            // Check if it is a valid date format
            if (isNaN(testDate.getTime())) {
                return NextResponse.json(
                    { error: "'lastWatered' must be a valid date string" },
                    { status: 400 }
                );
            }            

            // check if date is not in the future
            const now = new Date();
            if (testDate > now) {
                return NextResponse.json(
                    { error: "'lastWatered' cannot be a date in the future." },
                    { status: 400 }
                );
            }
        }

        // Everything looks good, update the database
        const updatedPlant = await db.update(id, {status, lastWatered});

        if (!updatedPlant) {
            return NextResponse.json(
                { error: `Plant with ID ${id} not found.` }, 
                { status: 404 }
            );
        }

        // return object
        return NextResponse.json(
            { message: "Plant updated", data: updatedPlant },
            { status: 200 }
        );
    } catch {
        return NextResponse.json(
            { error: 'Internal Server Error'},
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    try{
        // get ID from URL
        const {id} = await context.params;

        const deleted = await db.delete(id);
        if (!deleted){
             return NextResponse.json({ error: `Plant with ID ${id} not found` }, { status: 404 });
        }

        return NextResponse.json(
            {message: `Plant with ID ${id} successfully deleted`}, 
            { status: 200 }
        ); 
    } catch {
        return NextResponse.json(
            { error: 'Failed to find the plant ' },
            { status: 500 }
        );
    }
}