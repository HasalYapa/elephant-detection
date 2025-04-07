export default function imageLoader({ src, width, quality }) {
  // For absolute URLs (external images)
  if (src.startsWith('http')) {
    return src;
  }
  
  // For relative URLs (local images)
  // In production, this will be the correct path
  return `${src}?w=${width}&q=${quality || 75}`;
}
