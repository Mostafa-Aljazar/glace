import { FAKE_HOME_PAGE } from "@/data/fake-data/homePage";
import { toApiHomePage } from "@/lib/home/serializeHomePage";

/**
 * Mock `GET /api/home` for local Swagger Try it out and frontend fallback testing.
 * Returns the same shape as the real backend `GET /home` (`IHomePageData` / `IApiHomePageData`).
 */
export async function GET() {
  const body = toApiHomePage(FAKE_HOME_PAGE);

  return Response.json(body, {
    headers: {
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
