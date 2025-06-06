// URL obfuscation for affiliate links

// Simple encoding function to obfuscate URLs
export function encodeAffiliateUrl(url: string): string {
  if (!url) return ""

  try {
    // Create a base64 encoded version of the URL
    const encoded = btoa(encodeURIComponent(url))
    // Generate a short ID based on the URL
    const shortId = generateShortId(url)
    return shortId
  } catch (error) {
    console.error("Error encoding affiliate URL:", error)
    return ""
  }
}

// Generate a short ID from a URL
function generateShortId(url: string): string {
  // Create a simple hash from the URL
  let hash = 0
  for (let i = 0; i < url.length; i++) {
    const char = url.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }

  // Convert to alphanumeric string
  const hashStr = Math.abs(hash).toString(36)
  return hashStr.substring(0, 8)
}

// Store the mapping between short IDs and actual URLs
export function storeAffiliateMapping(id: string, url: string): void {
  if (typeof window === "undefined") return

  try {
    const mappingsStr = localStorage.getItem("buyloom-affiliate-mappings")
    const mappings = mappingsStr ? JSON.parse(mappingsStr) : {}

    mappings[id] = url
    localStorage.setItem("buyloom-affiliate-mappings", JSON.stringify(mappings))
  } catch (error) {
    console.error("Error storing affiliate mapping:", error)
  }
}

// Get the actual URL from a short ID
export function getAffiliateUrl(id: string): string | null {
  if (typeof window === "undefined") return null

  try {
    const mappingsStr = localStorage.getItem("buyloom-affiliate-mappings")
    if (!mappingsStr) return null

    const mappings = JSON.parse(mappingsStr)
    return mappings[id] || null
  } catch (error) {
    console.error("Error getting affiliate URL:", error)
    return null
  }
}

// Generate a go link for a product
export function generateGoLink(productId: string, affiliateUrl: string): string {
  const shortId = encodeAffiliateUrl(affiliateUrl)
  storeAffiliateMapping(shortId, affiliateUrl)
  return `/go/${shortId}?pid=${productId}`
}
