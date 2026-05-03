// Strip basic HTML tags to prevent XSS
export function sanitizeText(text) {
  if (!text) return "";
  return text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Extract the 11 character YouTube ID strictly, returning null if not found
export function extractAndSanitizeYouTubeId(url) {
  if (!url) return null;
  // Match standard youtube links and extract exactly 11 characters
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  if (match && match[1]) {
    // Return only alphanumeric and underscores/hyphens which make up a youtube id
    const sanitizedId = match[1].replace(/[^a-zA-Z0-9_-]/g, "");
    if (sanitizedId.length === 11) {
      return sanitizedId;
    }
  }
  return null;
}
