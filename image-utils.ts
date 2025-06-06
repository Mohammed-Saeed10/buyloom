export interface ImageValidationResult {
  isValid: boolean
  error?: string
  dimensions?: { width: number; height: number }
}

export async function validateImageUrl(url: string): Promise<ImageValidationResult> {
  if (!url.trim()) {
    return { isValid: false, error: "Image URL is required" }
  }

  // Basic URL validation
  try {
    new URL(url)
  } catch {
    return { isValid: false, error: "Invalid URL format" }
  }

  // Check if URL starts with http/https
  if (!url.match(/^https?:\/\//)) {
    return { isValid: false, error: "URL must start with http:// or https://" }
  }

  // Check file extension
  const validExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"]
  const hasValidExtension = validExtensions.some((ext) => url.toLowerCase().includes(ext))

  if (!hasValidExtension) {
    // If no extension, try to load the image to validate
    return new Promise((resolve) => {
      const img = new Image()
      img.crossOrigin = "anonymous"

      const timeout = setTimeout(() => {
        resolve({ isValid: false, error: "Image loading timeout" })
      }, 10000) // 10 second timeout

      img.onload = () => {
        clearTimeout(timeout)
        resolve({
          isValid: true,
          dimensions: { width: img.width, height: img.height },
        })
      }

      img.onerror = () => {
        clearTimeout(timeout)
        resolve({ isValid: false, error: "Failed to load image" })
      }

      img.src = url
    })
  }

  // For URLs with valid extensions, do a quick validation
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = "anonymous"

    const timeout = setTimeout(() => {
      resolve({ isValid: false, error: "Image loading timeout" })
    }, 5000) // 5 second timeout for extension-based URLs

    img.onload = () => {
      clearTimeout(timeout)
      resolve({
        isValid: true,
        dimensions: { width: img.width, height: img.height },
      })
    }

    img.onerror = () => {
      clearTimeout(timeout)
      resolve({ isValid: false, error: "Invalid image URL or image not accessible" })
    }

    img.src = url
  })
}

export function getImagePlaceholder(width = 400, height = 400): string {
  return `/placeholder.svg?height=${height}&width=${width}`
}

export function isValidImageExtension(url: string): boolean {
  const validExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"]
  return validExtensions.some((ext) => url.toLowerCase().includes(ext))
}
