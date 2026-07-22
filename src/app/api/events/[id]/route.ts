import { findFakeEventById } from "@/data/fake-data/events";
import { toApiEvent } from "@/lib/events/serializeEvent";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * Mock `GET /api/events/{id}` for Swagger Try it out.
 */
export async function GET(_request: Request, context: RouteContext) {
  const { id: rawId } = await context.params;
  const id = Number(rawId);

  if (!Number.isFinite(id) || id <= 0) {
    return Response.json(
      { message: "Invalid event id" },
      { status: 400 },
    );
  }

  const event = findFakeEventById(id);
  if (!event) {
    return Response.json(
      { message: "Event not found" },
      { status: 404 },
    );
  }

  return Response.json(toApiEvent(event), {
    headers: {
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
