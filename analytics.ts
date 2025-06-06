// Simple analytics tracking for product clicks
interface ClickData {
  productId: string
  timestamp: number
  source: string
}

export function trackProductClick(productId: string, source = "product-card"): void {
  if (typeof window === "undefined") return

  try {
    // Get existing click data
    const clickDataString = localStorage.getItem("buyloom-click-tracking")
    const clickData: Record<string, ClickData[]> = clickDataString ? JSON.parse(clickDataString) : {}

    // Initialize array for this product if it doesn't exist
    if (!clickData[productId]) {
      clickData[productId] = []
    }

    // Add new click data
    clickData[productId].push({
      productId,
      timestamp: Date.now(),
      source,
    })

    // Store updated data
    localStorage.setItem("buyloom-click-tracking", JSON.stringify(clickData))

    // Dispatch event for any listeners
    window.dispatchEvent(
      new CustomEvent("productClicked", {
        detail: { productId, source },
      }),
    )

    // If Google Analytics is available, track the event
    if (typeof window.gtag === "function") {
      window.gtag("event", "product_click", {
        product_id: productId,
        source: source,
      })
    }
  } catch (error) {
    console.error("Error tracking product click:", error)
  }
}

export function getProductClicks(productId: string): number {
  if (typeof window === "undefined") return 0

  try {
    const clickDataString = localStorage.getItem("buyloom-click-tracking")
    if (!clickDataString) return 0

    const clickData: Record<string, ClickData[]> = JSON.parse(clickDataString)
    return clickData[productId]?.length || 0
  } catch (error) {
    console.error("Error getting product clicks:", error)
    return 0
  }
}

export function getTotalClicks(): number {
  if (typeof window === "undefined") return 0

  try {
    const clickDataString = localStorage.getItem("buyloom-click-tracking")
    if (!clickDataString) return 0

    const clickData: Record<string, ClickData[]> = JSON.parse(clickDataString)
    return Object.values(clickData).reduce((total, clicks) => total + clicks.length, 0)
  } catch (error) {
    console.error("Error getting total clicks:", error)
    return 0
  }
}

export function getClicksByTimeframe(days = 7): Record<string, number> {
  if (typeof window === "undefined") return {}

  try {
    const clickDataString = localStorage.getItem("buyloom-click-tracking")
    if (!clickDataString) return {}

    const clickData: Record<string, ClickData[]> = JSON.parse(clickDataString)
    const now = Date.now()
    const timeframeStart = now - days * 24 * 60 * 60 * 1000

    // Count clicks by day
    const clicksByDay: Record<string, number> = {}

    Object.values(clickData)
      .flat()
      .forEach((click) => {
        if (click.timestamp >= timeframeStart) {
          const date = new Date(click.timestamp).toLocaleDateString()
          clicksByDay[date] = (clicksByDay[date] || 0) + 1
        }
      })

    return clicksByDay
  } catch (error) {
    console.error("Error getting clicks by timeframe:", error)
    return {}
  }
}
