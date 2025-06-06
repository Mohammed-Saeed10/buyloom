import type { Product } from "./types"

export interface CSVProduct {
  name: string
  description: string
  images: string
  affiliateUrl: string
  rating: string
  tags: string
  category: string
}

export interface ParsedProduct extends Omit<Product, "id" | "createdAt"> {
  rowNumber: number
  errors: string[]
}

export interface CSVParseResult {
  validProducts: ParsedProduct[]
  invalidProducts: ParsedProduct[]
  totalRows: number
  errors: string[]
}

// Expected CSV headers
export const CSV_HEADERS = ["name", "description", "images", "affiliateUrl", "rating", "tags", "category"]

// Sample CSV content for download
export const SAMPLE_CSV_CONTENT = `name,description,images,affiliateUrl,rating,tags,category
"Wireless Bluetooth Earbuds","High-quality wireless earbuds with noise cancellation and long battery life","https://example.com/image1.jpg,https://example.com/image2.jpg","https://amazon.com/example-earbuds",4.5,"Hot,New","Electronics"
"Yoga Mat Premium","Non-slip yoga mat perfect for all types of yoga and exercise","https://example.com/yoga-mat.jpg","https://amazon.com/example-yoga-mat",4.7,"Top","Health & Fitness"
"Coffee Maker Deluxe","Programmable coffee maker with built-in grinder and thermal carafe","https://example.com/coffee-maker1.jpg,https://example.com/coffee-maker2.jpg","https://amazon.com/example-coffee-maker",4.3,"New","Home & Garden"`

export function parseCSV(csvContent: string): CSVParseResult {
  const result: CSVParseResult = {
    validProducts: [],
    invalidProducts: [],
    totalRows: 0,
    errors: [],
  }

  try {
    const lines = csvContent.trim().split("\n")

    if (lines.length < 2) {
      result.errors.push("CSV file must contain at least a header row and one data row")
      return result
    }

    // Parse header
    const headerLine = lines[0]
    const headers = parseCSVLine(headerLine).map((h) => h.toLowerCase().trim())

    // Validate headers
    const missingHeaders = CSV_HEADERS.filter((required) => !headers.includes(required))
    if (missingHeaders.length > 0) {
      result.errors.push(`Missing required columns: ${missingHeaders.join(", ")}`)
      return result
    }

    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue // Skip empty lines

      result.totalRows++
      const rowNumber = i + 1

      try {
        const values = parseCSVLine(line)
        const product = parseProductRow(headers, values, rowNumber)

        if (product.errors.length === 0) {
          result.validProducts.push(product)
        } else {
          result.invalidProducts.push(product)
        }
      } catch (error) {
        result.invalidProducts.push({
          name: "",
          description: "",
          images: [],
          affiliateUrl: "",
          rating: 0,
          tags: [],
          category: "",
          rowNumber,
          errors: [`Row ${rowNumber}: ${error instanceof Error ? error.message : "Invalid row format"}`],
        })
      }
    }
  } catch (error) {
    result.errors.push(`Failed to parse CSV: ${error instanceof Error ? error.message : "Unknown error"}`)
  }

  return result
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ""
  let inQuotes = false
  let i = 0

  while (i < line.length) {
    const char = line[i]

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"'
        i += 2
      } else {
        // Toggle quote state
        inQuotes = !inQuotes
        i++
      }
    } else if (char === "," && !inQuotes) {
      // End of field
      result.push(current.trim())
      current = ""
      i++
    } else {
      current += char
      i++
    }
  }

  // Add the last field
  result.push(current.trim())

  return result
}

function parseProductRow(headers: string[], values: string[], rowNumber: number): ParsedProduct {
  const product: ParsedProduct = {
    name: "",
    description: "",
    images: [],
    affiliateUrl: "",
    rating: 0,
    tags: [],
    category: "",
    rowNumber,
    errors: [],
  }

  // Map values to product fields
  headers.forEach((header, index) => {
    const value = values[index] || ""

    switch (header) {
      case "name":
        product.name = value.replace(/^"|"$/g, "").trim()
        break
      case "description":
        product.description = value.replace(/^"|"$/g, "").trim()
        break
      case "images":
        const imageUrls = value
          .replace(/^"|"$/g, "")
          .split(",")
          .map((url) => url.trim())
          .filter((url) => url)
        product.images = imageUrls
        break
      case "affiliateurl":
        product.affiliateUrl = value.replace(/^"|"$/g, "").trim()
        break
      case "rating":
        const rating = Number.parseFloat(value.replace(/^"|"$/g, "").trim())
        product.rating = isNaN(rating) ? 0 : rating
        break
      case "tags":
        const tags = value
          .replace(/^"|"$/g, "")
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag)
        product.tags = tags
        break
      case "category":
        product.category = value.replace(/^"|"$/g, "").trim()
        break
    }
  })

  // Validate product
  validateProduct(product)

  return product
}

function validateProduct(product: ParsedProduct): void {
  // Validate name
  if (!product.name) {
    product.errors.push("Product name is required")
  } else if (product.name.length < 3) {
    product.errors.push("Product name must be at least 3 characters")
  } else if (product.name.length > 100) {
    product.errors.push("Product name must be less than 100 characters")
  }

  // Validate description
  if (!product.description) {
    product.errors.push("Description is required")
  } else if (product.description.length < 10) {
    product.errors.push("Description must be at least 10 characters")
  } else if (product.description.length > 1000) {
    product.errors.push("Description must be less than 1000 characters")
  }

  // Validate images
  if (product.images.length === 0) {
    product.errors.push("At least one image URL is required")
  } else {
    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/
    const invalidImages = product.images.filter((img) => !urlPattern.test(img))
    if (invalidImages.length > 0) {
      product.errors.push(`Invalid image URLs: ${invalidImages.join(", ")}`)
    }
  }

  // Validate affiliate URL
  if (!product.affiliateUrl) {
    product.errors.push("Affiliate URL is required")
  } else {
    const urlPattern = /^https?:\/\/.+/
    if (!urlPattern.test(product.affiliateUrl)) {
      product.errors.push("Affiliate URL must start with http:// or https://")
    }
  }

  // Validate rating
  if (product.rating < 1 || product.rating > 5) {
    product.errors.push("Rating must be between 1 and 5")
  }

  // Validate category
  if (!product.category) {
    product.errors.push("Category is required")
  }
}

export function downloadSampleCSV(): void {
  const blob = new Blob([SAMPLE_CSV_CONTENT], { type: "text/csv" })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = "buyloom-products-sample.csv"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}
