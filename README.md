```` markdown
## 💪 Pre-sprint Homework: The Plant Care Tracker API

### Project Overview
The objective of this assignment is to implement a RESTful API using **Next.js Route Handlers (App Router)**. You are tasked with providing the backend logic for a "Plant Care Tracker" application. The frontend is already configured to consume these specific endpoints to display, add, and update plant data.

### Technical Requirements
*   **Framework:** Next.js 14+ (App Router)
*   **Language:** TypeScript
*   **Routing:** File-based routing using `route.ts` files.
*   **Response Format:** All responses must be valid JSON using the `NextResponse` utility.

### Data Model
Use the following TypeScript interface for your data objects. This is included in `@/types`.

```typescript
export interface Plant {
  id: string;
  name: string;        // e.g., "Spike"
  species: string;     // e.g., "Snake Plant"
  location: string;    // e.g., "Living Room", "Office"
  lastWatered: Date;   // Date
  status: 'Healthy' | 'Thirsty' | 'Overwatered';
}

````

### Folder Structure (Required)

Next.js uses folder-based routing. Your implementation must follow this structure to ensure the frontend can reach the endpoints:

``` plaintext
app/
└── api/
    └── plants/
        ├── route.ts          // Handles GET (all) and POST
        └── [id]/
            └── route.ts      // Handles GET (single), PATCH, and DELETE

```

### API Endpoint Specifications

#### Collection Operations

**Endpoint:** `/api/plants`

| **Method** | **Description**  | **Requirements**                                                                                                           |
| :--------: | :--------------: | :------------------------------------------------------------------------------------------------------------------------: |
| **GET**    | Fetch all plants | Must support a `?location=` query parameter. If provided, filter the results by location (case-insensitive).               |
| **POST**   | Add a new plant  | Expects a JSON body with `name`, `species`, and `location`. Auto-generate an `id` and set a default `status` of "Healthy". |

#### Individual Resource Operations

**Endpoint:** `/api/plants/[id]`

| **Method** | **Description**      | **Requirements**                                                               |
| :--------: | :------------------: | :----------------------------------------------------------------------------: |
| **GET**    | Fetch specific plant | Retrieve the plant matching the `id` in the URL.                               |
| **PATCH**  | Update plant status  | Allow partial updates to `status` or `lastWatered`. Return the updated object. |
| **DELETE** | Remove a plant       | Delete the record from the collection.                                         |

-----

### Data Access Layer: The `db` Singleton

To simulate a real-world production environment without the overhead of a live database, we are using a **Mock DB Client** located in `@/lib/db.ts`.

#### Method Reference

The `db` client mimics a modern ORM (like Prisma). **Note:** All methods are `async` and must be `await-ed`, as they simulate database I/O.

| **Method**          | **Signature**           | **Returns**        |
| :-----------------: | :---------------------: | :----------------: |
| `findMany(filter?)` | `{ location?: string }` | `Promise<Plant[]>` |

| `findUnique(id)`   | `string`                 | \`Promise\<Plant   | null\>\` |
| :----------------- | :----------------------- | :----------------- | :------- |
| `update(id, data)` | `string, Partial<Plant>` | \`Promise\<Plant   | null\>\` |
| `delete(id)`       | `string`                 | `Promise<boolean>` |          |

#### How to Use in Route Handlers

Import the `db` instance directly into your `route.ts` files. Do not try to instantiate a new version of the class.

``` typescript
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  // 1. Always await the db call
  const allPlants = await db.findMany();
  
  // 2. Return the data in the standardized ApiResponse format
  return NextResponse.json({ data: allPlants });
}

```

#### Critical Rules

  * **No Direct Manipulation:** Do not attempt to find the plants array inside `db.ts` and push to it directly. Use the provided methods to ensure the "DB" logic remains encapsulated.
  * **ID Generation:** When calling `.create()`, do not provide an ID. The mock client generates a random string ID automatically to simulate a database primary key.
  * **Error States:** If `findUnique` or `update` returns `null`, your API route should handle this by returning a **404 Not Found** status.

### Success & Error Handling

You are expected to return appropriate HTTP status codes to the frontend:

  * **200 OK:** Successful `GET`, `PATCH`, or `DELETE`.
  * **201 Created:** Successful `POST`.
  * **400 Bad Request:** Missing required fields in `POST` (e.g., missing name).
  * **404 Not Found:** When an `id` provided in a dynamic route does not exist.

#### Example Response Structure:

``` json
// GET /api/plants/123 - Success
{
  "data": { "id": "123", "name": "Spike", ... },
  "message": "Plant retrieved successfully"
}

// GET /api/plants/999 - Failure
{
  "error": "Plant with ID 999 not found"
}

```

 

