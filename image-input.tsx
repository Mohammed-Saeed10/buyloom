"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, AlertCircle, CheckCircle, Loader2, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { validateImageUrl, type ImageValidationResult } from "@/lib/image-utils"

interface ImageInputProps {
  images: string[]
  onChange: (images: string[]) => void
  error?: string
  className?: string
}

interface ImageState {
  url: string
  isValidating: boolean
  validation: ImageValidationResult | null
  showPreview: boolean
}

export function ImageInput({ images, onChange, error, className }: ImageInputProps) {
  const [imageStates, setImageStates] = useState<ImageState[]>([])

  // Initialize image states when images prop changes
  useEffect(() => {
    const newStates = images.map((url) => ({
      url,
      isValidating: false,
      validation: null,
      showPreview: true,
    }))

    // Ensure at least one empty input
    if (newStates.length === 0) {
      newStates.push({
        url: "",
        isValidating: false,
        validation: null,
        showPreview: true,
      })
    }

    setImageStates(newStates)
  }, [images])

  const validateImage = async (index: number, url: string) => {
    if (!url.trim()) {
      setImageStates((prev) =>
        prev.map((state, i) => (i === index ? { ...state, validation: null, isValidating: false } : state)),
      )
      return
    }

    setImageStates((prev) => prev.map((state, i) => (i === index ? { ...state, isValidating: true } : state)))

    try {
      const validation = await validateImageUrl(url)
      setImageStates((prev) =>
        prev.map((state, i) => (i === index ? { ...state, validation, isValidating: false } : state)),
      )
    } catch (error) {
      setImageStates((prev) =>
        prev.map((state, i) =>
          i === index
            ? {
                ...state,
                validation: { isValid: false, error: "Validation failed" },
                isValidating: false,
              }
            : state,
        ),
      )
    }
  }

  const handleImageChange = (index: number, value: string) => {
    const newStates = [...imageStates]
    newStates[index] = { ...newStates[index], url: value }
    setImageStates(newStates)

    // Update parent component
    const newImages = newStates.map((state) => state.url)
    onChange(newImages)

    // Debounced validation
    const timeoutId = setTimeout(() => {
      validateImage(index, value)
    }, 1000)

    return () => clearTimeout(timeoutId)
  }

  const addImageField = () => {
    const newState: ImageState = {
      url: "",
      isValidating: false,
      validation: null,
      showPreview: true,
    }

    const newStates = [...imageStates, newState]
    setImageStates(newStates)

    const newImages = newStates.map((state) => state.url)
    onChange(newImages)
  }

  const removeImageField = (index: number) => {
    if (imageStates.length > 1) {
      const newStates = imageStates.filter((_, i) => i !== index)
      setImageStates(newStates)

      const newImages = newStates.map((state) => state.url)
      onChange(newImages)
    }
  }

  const togglePreview = (index: number) => {
    setImageStates((prev) =>
      prev.map((state, i) => (i === index ? { ...state, showPreview: !state.showPreview } : state)),
    )
  }

  const getValidImages = () => {
    return imageStates.filter((state) => state.url.trim() && state.validation?.isValid)
  }

  return (
    <div className={className}>
      <div className="space-y-4">
        {/* Image URL Inputs */}
        <div className="space-y-3">
          {imageStates.map((imageState, index) => (
            <div key={index} className="space-y-2">
              {/* Input Row */}
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Input
                    value={imageState.url}
                    onChange={(e) => handleImageChange(index, e.target.value)}
                    placeholder="Enter image URL (https://...)"
                    className={`pr-10 ${error ? "border-destructive focus:border-destructive" : ""}`}
                  />

                  {/* Validation Status Icon */}
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {imageState.isValidating && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                    {!imageState.isValidating && imageState.validation?.isValid && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                    {!imageState.isValidating && imageState.validation && !imageState.validation.isValid && (
                      <AlertCircle className="h-4 w-4 text-destructive" />
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-1">
                  {imageState.url && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => togglePreview(index)}
                      className="shrink-0"
                    >
                      {imageState.showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  )}

                  {imageStates.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeImageField(index)}
                      className="shrink-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Validation Error */}
              {imageState.validation && !imageState.validation.isValid && (
                <p className="text-destructive text-xs flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {imageState.validation.error}
                </p>
              )}

              {/* Image Preview */}
              {imageState.url && imageState.showPreview && imageState.validation?.isValid && (
                <Card className="overflow-hidden">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-16 h-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                        <img
                          src={imageState.url || "/placeholder.svg"}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = "/placeholder.svg?height=64&width=64"
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">Image {index + 1}</p>
                        {imageState.validation.dimensions && (
                          <p className="text-xs text-muted-foreground">
                            {imageState.validation.dimensions.width} × {imageState.validation.dimensions.height}
                          </p>
                        )}
                        <Badge variant="outline" className="text-xs mt-1">
                          Valid
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ))}
        </div>

        {/* Add Image Button */}
        <Button type="button" variant="outline" size="sm" onClick={addImageField} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Another Image URL
        </Button>

        {/* Summary */}
        {imageStates.length > 0 && (
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
            <span>
              {getValidImages().length} valid image{getValidImages().length !== 1 ? "s" : ""}
            </span>
            <span>
              {imageStates.length} total input{imageStates.length !== 1 ? "s" : ""}
            </span>
          </div>
        )}

        {/* General Error */}
        {error && (
          <p className="text-destructive text-xs flex items-center">
            <AlertCircle className="h-3 w-3 mr-1" />
            {error}
          </p>
        )}
      </div>
    </div>
  )
}
