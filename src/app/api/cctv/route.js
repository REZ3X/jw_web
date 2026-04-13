/**
 * CCTV Proxy — Fetches CCTV data from cctv.jogjakota.go.id
 *
 * The government API requires X-Requested-With header and
 * blocks direct browser access. This proxy adds the proper headers.
 */

export async function GET() {
  try {
    const res = await fetch("https://cctv.jogjakota.go.id/home/getdata", {
      headers: {
        "X-Requested-With": "XMLHttpRequest",
        "Accept": "application/json",
        "Referer": "https://cctv.jogjakota.go.id/home",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!res.ok) {
      return Response.json(
        { error: `Upstream returned ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return Response.json(data);
  } catch (err) {
    return Response.json(
      { error: "Failed to fetch CCTV data", details: err.message },
      { status: 500 }
    );
  }
}
