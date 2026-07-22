import {
  FAKE_EVENTS,
  EVENTS_PER_PAGE,
  paginateEvents,
} from "@/data/fake-data/events";
import { toApiEvents } from "@/lib/events/serializeEvent";

/**
 * Mock `GET /api/events?page=&perPage=` for Swagger Try it out.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") ?? 1);
  const perPage = Number(searchParams.get("perPage") ?? EVENTS_PER_PAGE);

  const result = paginateEvents(
    FAKE_EVENTS,
    Number.isFinite(page) ? page : 1,
    Number.isFinite(perPage) ? perPage : EVENTS_PER_PAGE,
  );

  return Response.json(
    {
      ...result,
      items: toApiEvents(result.items),
    },
    {
      headers: {
        "Cache-Control": "no-store",
        "Access-Control-Allow-Origin": "*",
      },
    },
  );
}
