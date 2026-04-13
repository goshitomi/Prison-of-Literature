const API_KEY = "92c6104efdf269a89493d8f294b16d85b566e78804977e0793dc3b202192d6c1";
const API_BASE = "https://apis.data.go.kr/1371029/BookInformationService/getbookList";

function hasKorean(s) {
  return /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/.test(s || "");
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");

  const { pageNo = "1", numOfRows = "20", koreanOnly = "true" } = req.query;
  const fetchRows = koreanOnly === "true" ? Math.min(parseInt(numOfRows) * 5, 100) : parseInt(numOfRows);

  const params = new URLSearchParams({
    serviceKey: API_KEY,
    pageNo: String(pageNo),
    numOfRows: String(fetchRows),
    type: "JSON",
  });

  try {
    const response = await fetch(`${API_BASE}?${params}`, {
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return res.status(response.status).json({ error: `Upstream HTTP ${response.status}` });

    const text = await response.text();
    let data;
    try { data = JSON.parse(text); } catch { return res.status(502).json({ error: "Parse failed" }); }

    if (koreanOnly === "true" && data?.body?.items) {
      data.body.items = data.body.items
        .filter((item) => hasKorean(item.DCTERMS_title || item.RDFS_label || "") || hasKorean(item.DCTERMS_creator || ""))
        .slice(0, parseInt(numOfRows));
    }

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
