/**
 * CCTV Data — Yogyakarta City CCTV live stream locations.
 *
 * Data is fetched live from the government API (cctv.jogjakota.go.id).
 * Each camera provides HLS (.m3u8) streams played via hls.js.
 *
 * Source: https://cctv.jogjakota.go.id/
 */

/** Map center — Yogyakarta city center */
export const YOGYA_CENTER = { lat: -7.7956, lng: 110.3695 };

/** Default zoom level */
export const DEFAULT_ZOOM = 14;

/** Category labels */
export const CCTV_CATEGORIES = {
  "1": "ATCS (Simpang)",
  "2": "BPBD (Sungai)",
  "3": "Malioboro",
  "9": "RTHP",
  "12": "Balaikota",
  "33": "Margo Utomo",
  "34": "Kotabaru",
  "35": "Kemantren",
  "195": "DPRD Kota",
};

/**
 * Normalize raw API data into clean camera objects.
 */
export function normalizeCCTV(raw) {
  return raw
    .filter(
      (c) =>
        c.cctv_latitude &&
        c.cctv_longitude &&
        c.cctv_link &&
        c.cctv_link.includes(".m3u8")
    )
    .map((c) => ({
      id: c.cctv_id,
      name: c.cctv_title,
      streamUrl: c.cctv_link,
      lat: parseFloat(c.cctv_latitude),
      lng: parseFloat(c.cctv_longitude),
      category: c.cctv_category,
      categoryLabel: CCTV_CATEGORIES[c.cctv_category] || "Lainnya",
      district: c.kecamatan_nama
        ? c.kecamatan_nama.charAt(0) + c.kecamatan_nama.slice(1).toLowerCase()
        : "",
      kelurahan: c.kelurahan_nama
        ? c.kelurahan_nama.charAt(0) + c.kelurahan_nama.slice(1).toLowerCase()
        : "",
      description: c.cctv_desc || "",
      status: "live", // All returned cameras are active
    }));
}
