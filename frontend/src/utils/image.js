export function getImageUrl(image) {
  if (!image || typeof image !== "string") return null;

  const value = image.trim();
  if (!value) return null;

  if (/^https?:\/\//i.test(value) || value.startsWith("data:")) {
    return value;
  }

  if (value.startsWith("/uploads/")) {
    const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    const origin = apiBase.replace(/\/api\/?$/, "");
    return origin ? `${origin}${value}` : value;
  }

  const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const origin = apiBase.replace(/\/api\/?$/, "");
  const normalized = value.replace(/^\/+/, "");

  if (origin) {
    return `${origin}/uploads/${normalized}`;
  }

  return `/uploads/${normalized}`;
}
