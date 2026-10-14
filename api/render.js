export default async function handler(req, res) {
  console.log("=== RENDER PROXY ===");
  console.log("METHOD:", req.method);
  console.log("URL:", req.url);
  console.log("BODY:", req.body);

  try {
    const path = req.query.path || "";

    const query = new URLSearchParams(req.query);
    query.delete("path");

    const targetUrl =
      `https://render-a0lw.onrender.com/${path}` +
      (query.toString() ? "?" + query.toString() : "");

    console.log("TARGET:", targetUrl);

    const options = {
      method: req.method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    // Передаём body для POST/PUT/PATCH
    if (["POST", "PUT", "PATCH"].includes(req.method)) {
      options.body = JSON.stringify(req.body);
    }

    const response = await fetch(targetUrl, options);

    const text = await response.text();

    console.log("STATUS:", response.status);
    console.log("RESPONSE:", text);

    res.status(response.status).send(text);

  } catch (error) {
    console.error("PROXY ERROR:", error);

    res.status(500).json({
      error: error.message,
    });
  }
}
