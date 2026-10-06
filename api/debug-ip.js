export default async function handler(req, res) {
  const response = await fetch("https://api.ipify.org?format=json");
  const data = await response.json();
  console.log("Vercel outbound IP is:", data.ip);
  res.status(200).json({ ip: data.ip });
}