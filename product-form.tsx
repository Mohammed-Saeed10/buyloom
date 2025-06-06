"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Plus, Trash2, AlertCircle, RotateCcw, Save, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "@/hooks/use-toast"
import type { Product } from "@/lib/types"
import { categories } from "@/lib/products"

interface FormErrors {
  name?: string
  description?: string
  images?: string
  affiliateUrl?: string
  general?: string
}

interface ProductFormProps {
  product?: Product | null // For editing existing products
  onProductSaved: (product: Product) => void
  onProductUpdated?: (product: Product) => void
  onCancel: () => void
}

const getInitialFormData = (product?: Product | null) => {
  if (product) {
    return {
      name: product.name,
      description: product.description,
      images: product.images.length > 0 ? product.images : [""],
      affiliateUrl: product.affiliateUrl,
      tags: product.tags.join(", "),
      category: product.category,
      rating: product.rating,
    }
  }

  return {
    name: "",
    description: "",
    images: [""],
    affiliateUrl: "",
    tags: "",
    category: "Electronics",
    rating: 4.5,
  }
}

export function ProductForm({ product, onProductSaved, onProductUpdated, onCancel }: ProductFormProps) {
  const isEditing = !!product
  const [formData, setFormData] = useState(() => getInitialFormData(product))
  const [originalFormData] = useState(() => getInitialFormData(product))
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Reset form data when product changes
  useEffect(() => {
    const newFormData = getInitialFormData(product)
    setFormData(newFormData)
    setFormErrors({})
    setHasUnsavedChanges(false)
  }, [product])

  // Track form changes
  useEffect(() => {
    const hasChanges = Object.keys(formData).some((key) => {
      const currentValue = formData[key as keyof typeof formData]
      const originalValue = originalFormData[key as keyof typeof originalFormData]

      if (Array.isArray(currentValue) && Array.isArray(originalValue)) {
        return JSON.stringify(currentValue) !== JSON.stringify(originalValue)
      }
      return currentValue !== originalValue
    })
    setHasUnsavedChanges(hasChanges)
  }, [formData, originalFormData])

  const clearFormErrors = () => {
    setFormErrors({})
  }

  const validateForm = (): boolean => {
    const errors: FormErrors = {}

    // Validate product name
    if (!formData.name.trim()) {
      errors.name = "Product name is required"
    } else if (formData.name.trim().length < 3) {
      errors.name = "Product name must be at least 3 characters"
    } else if (formData.name.trim().length > 100) {
      errors.name = "Product name must be less than 100 characters"
    }

    // Validate description
    if (!formData.description.trim()) {
      errors.description = "Product description is required"
    } else if (formData.description.trim().length < 10) {
      errors.description = "Description must be at least 10 characters"
    } else if (formData.description.trim().length > 1000) {
      errors.description = "Description must be less than 1000 characters"
    }

    // Validate images
    const validImages = formData.images.filter((img) => img.trim() !== "")
    if (validImages.length === 0) {
      errors.images = "At least one image URL is required"
    } else {
      const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/
      const invalidImages = validImages.filter((img) => !urlPattern.test(img.trim()))
      if (invalidImages.length > 0) {
        errors.images = "Please enter valid image URLs"
      }
    }

    // Validate affiliate URL
    if (!formData.affiliateUrl.trim()) {
      errors.affiliateUrl = "Affiliate URL is required"
    } else {
      const urlPattern = /^https?:\/\/.+/
      if (!urlPattern.test(formData.affiliateUrl.trim())) {
        errors.affiliateUrl = "Please enter a valid URL starting with http:// or https://"
      }
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    // Clear specific field error when user starts typing
    if (formErrors[field as keyof FormErrors]) {
      setFormErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }))
    }
  }

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...formData.images]
    newImages[index] = value
    setFormData((prev) => ({
      ...prev,
      images: newImages,
    }))

    // Clear images error when user starts typing
    if (formErrors.images) {
      setFormErrors((prev) => ({
        ...prev,
        images: undefined,
      }))
    }
  }

  const addImageField = () => {
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ""],
    }))
  }

  const removeImageField = (index: number) => {
    if (formData.images.length > 1) {
      const newImages = formData.images.filter((_, i) => i !== index)
      setFormData((prev) => ({
        ...prev,
        images: newImages,
      }))
    }
  }

  const resetForm = () => {
    setFormData(getInitialFormData(product))
    setFormErrors({})
    setHasUnsavedChanges(false)
    toast({
      title: "Form Reset",
      description: "All changes have been discarded.",
    })
  }

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault()

    clearFormErrors()

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors below before saving.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const productData: Product = {
        id: product?.id || Date.now().toString(),
        name: formData.name.trim(),
        description: formData.description.trim(),
        images: formData.images.filter((img) => img.trim() !== ""),
        affiliateUrl: formData.affiliateUrl.trim(),
        rating: formData.rating,
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag !== ""),
        category: formData.category,
        createdAt: product?.createdAt || new Date(),
      }

      // Log the product object to console
      console.log(isEditing ? "Product updated:" : "New product saved:", productData)

      // Call appropriate callback
      if (isEditing && onProductUpdated) {
        onProductUpdated(productData)
        toast({
          title: "Product updated successfully",
          description: `"${productData.name}" has been updated in your catalog.`,
        })
      } else {
        onProductSaved(productData)
        toast({
          title: "Product saved successfully",
          description: `"${productData.name}" has been added to your catalog.`,
        })
      }

      // Reset form if adding new product
      if (!isEditing) {
        setFormData(getInitialFormData())
        setFormErrors({})
        setHasUnsavedChanges(false)
      } else {
        setHasUnsavedChanges(false)
      }
    } catch (error) {
      console.error("Error saving product:", error)
      setFormErrors({
        general: "An error occurred while saving. Please try again.",
      })
      toast({
        title: "Save Failed",
        description: "There was an error saving your changes. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          {isEditing ? <Edit className="h-5 w-5 mr-2" /> : <Plus className="h-5 w-5 mr-2" />}
          {isEditing ? `Edit Product: ${product?.name}` : "Add New Product"}
        </CardTitle>
        {isEditing && (
          <p className="text-sm text-muted-foreground">
            Make changes to your product and click save to update it in your catalog.
          </p>
        )}
      </CardHeader>
      <CardContent>
        {/* General Error Alert */}
        {formErrors.general && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{formErrors.general}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSaveChanges} className="space-y-6">
          {/* Product Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Product Name <span className="text-destructive">*</span>
            </label>
            <Input
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Enter product name"
              className={formErrors.name ? "border-destructive focus:border-destructive" : ""}
              required
            />
            {formErrors.name && (
              <p className="text-destructive text-xs flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {formErrors.name}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Description <span className="text-destructive">*</span>
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Enter product description"
              rows={4}
              className={formErrors.description ? "border-destructive focus:border-destructive" : ""}
              required
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formData.description.length}/1000 characters</span>
              {formErrors.description && (
                <span className="text-destructive flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {formErrors.description}
                </span>
              )}
            </div>
          </div>

          {/* Images */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Images <span className="text-destructive">*</span>
            </label>
            <div className="space-y-2">
              {formData.images.map((image, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={image}
                    onChange={(e) => handleImageChange(index, e.target.value)}
                    placeholder="Enter image URL (https://...)"
                    className={formErrors.images ? "border-destructive focus:border-destructive" : ""}
                  />
                  {formData.images.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeImageField(index)}
                      className="shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addImageField} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Image URL
              </Button>
            </div>
            {formErrors.images && (
              <p className="text-destructive text-xs flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {formErrors.images}
              </p>
            )}
          </div>

          {/* Affiliate URL */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Affiliate URL <span className="text-destructive">*</span>
            </label>
            <Input
              value={formData.affiliateUrl}
              onChange={(e) => handleInputChange("affiliateUrl", e.target.value)}
              placeholder="https://example.com/product"
              className={formErrors.affiliateUrl ? "border-destructive focus:border-destructive" : ""}
              required
            />
            {formErrors.affiliateUrl && (
              <p className="text-destructive text-xs flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {formErrors.affiliateUrl}
              </p>
            )}
          </div>

          {/* Category and Rating */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Category</label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange("category", e.target.value)}
                className="w-full p-2 border border-input rounded-md bg-background"
              >
                {categories
                  .filter((cat) => cat !== "All")
                  .map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Rating</label>
              <Input
                type="number"
                min="1"
                max="5"
                step="0.1"
                value={formData.rating}
                onChange={(e) => handleInputChange("rating", e.target.value)}
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Tags</label>
            <Input
              value={formData.tags}
              onChange={(e) => handleInputChange("tags", e.target.value)}
              placeholder="Hot, New, Top (comma-separated)"
            />
            <p className="text-xs text-muted-foreground">Separate multiple tags with commas</p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              type="submit"
              className="flex-1 bg-primary hover:bg-primary/90 focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-200"
              disabled={isSubmitting}
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  {isEditing ? "Updating..." : "Saving..."}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditing ? "Update Product" : "Save Product"}
                </>
              )}
            </Button>

            {hasUnsavedChanges && (
              <Button type="button" variant="outline" onClick={resetForm} size="lg" className="flex-1">
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset Changes
              </Button>
            )}

            <Button type="button" variant="ghost" onClick={onCancel} size="lg" className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
