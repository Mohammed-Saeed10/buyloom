"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Save, RotateCcw, X, Edit, Plus, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/hooks/use-toast"
import type { Product } from "@/lib/types"
import { categories } from "@/lib/products"
import { ImageInput } from "./image-input"
import ProductCard from "@/components/product-card"

interface FormErrors {
  name?: string
  description?: string
  images?: string
  affiliateUrl?: string
  general?: string
}

interface ResponsiveProductFormProps {
  product?: Product | null
  onProductSaved: (product: Product) => void
  onProductUpdated?: (product: Product) => void
  onCancel: () => void
  isMobile?: boolean
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

export function ResponsiveProductForm({
  product,
  onProductSaved,
  onProductUpdated,
  onCancel,
  isMobile = false,
}: ResponsiveProductFormProps) {
  const isEditing = !!product
  const [formData, setFormData] = useState(() => getInitialFormData(product))
  const [originalFormData] = useState(() => getInitialFormData(product))
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [activeTab, setActiveTab] = useState("details")

  // Reset form data when product changes
  useEffect(() => {
    const newFormData = getInitialFormData(product)
    setFormData(newFormData)
    setFormErrors({})
    setHasUnsavedChanges(false)
    setActiveTab("details")
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

  const handleInputChange = (field: string, value: string | string[]) => {
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

  const resetForm = () => {
    setFormData(getInitialFormData(product))
    setFormErrors({})
    setHasUnsavedChanges(false)
    setActiveTab("details")
    toast({
      title: "Form Reset",
      description: "All changes have been discarded.",
    })
  }

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before saving.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
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

      if (isEditing && onProductUpdated) {
        onProductUpdated(productData)
        toast({
          title: "Product updated successfully",
          description: `"${productData.name}" has been updated.`,
        })
      } else {
        onProductSaved(productData)
        toast({
          title: "Product saved successfully",
          description: `"${productData.name}" has been added.`,
        })
      }

      if (!isEditing) {
        setFormData(getInitialFormData())
        setFormErrors({})
        setHasUnsavedChanges(false)
        setActiveTab("details")
      } else {
        setHasUnsavedChanges(false)
      }
    } catch (error) {
      setFormErrors({
        general: "An error occurred while saving. Please try again.",
      })
      toast({
        title: "Save Failed",
        description: "There was an error saving your changes.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Create preview product
  const previewProduct: Product = {
    id: "preview",
    name: formData.name || "Product Name",
    description: formData.description || "Product description will appear here...",
    images: formData.images.filter((img) => img.trim()) || ["/placeholder.svg?height=400&width=400"],
    affiliateUrl: formData.affiliateUrl || "#",
    rating: formData.rating,
    tags: formData.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag !== ""),
    category: formData.category,
    createdAt: new Date(),
  }

  // Mobile layout with tabs
  if (isMobile) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col">
        {/* Mobile Header */}
        <div className="sticky top-0 z-10 bg-background border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {isEditing ? <Edit className="h-5 w-5 mr-2" /> : <Plus className="h-5 w-5 mr-2" />}
              <h2 className="font-semibold truncate">{isEditing ? "Edit Product" : "Add Product"}</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Mobile Content */}
        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-3 mx-4 mt-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="images">Images</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto p-4">
              <TabsContent value="details" className="space-y-4 mt-0">
                {formErrors.general && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{formErrors.general}</AlertDescription>
                  </Alert>
                )}

                {/* Product Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Product Name <span className="text-destructive">*</span>
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter product name"
                    className={formErrors.name ? "border-destructive" : ""}
                  />
                  {formErrors.name && <p className="text-destructive text-xs">{formErrors.name}</p>}
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Description <span className="text-destructive">*</span>
                  </label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Enter product description"
                    rows={4}
                    className={formErrors.description ? "border-destructive" : ""}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{formData.description.length}/1000 characters</span>
                    {formErrors.description && <span className="text-destructive">{formErrors.description}</span>}
                  </div>
                </div>

                {/* Affiliate URL */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Affiliate URL <span className="text-destructive">*</span>
                  </label>
                  <Input
                    value={formData.affiliateUrl}
                    onChange={(e) => handleInputChange("affiliateUrl", e.target.value)}
                    placeholder="https://example.com/product"
                    className={formErrors.affiliateUrl ? "border-destructive" : ""}
                  />
                  {formErrors.affiliateUrl && <p className="text-destructive text-xs">{formErrors.affiliateUrl}</p>}
                </div>

                {/* Category and Rating */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => handleInputChange("category", e.target.value)}
                      className="w-full p-2 border border-input rounded-md bg-background text-sm"
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
                    <label className="text-sm font-medium">Rating</label>
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
                  <label className="text-sm font-medium">Tags</label>
                  <Input
                    value={formData.tags}
                    onChange={(e) => handleInputChange("tags", e.target.value)}
                    placeholder="Hot, New, Top (comma-separated)"
                  />
                  <p className="text-xs text-muted-foreground">Separate multiple tags with commas</p>
                </div>
              </TabsContent>

              <TabsContent value="images" className="mt-0">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Product Images</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Add image URLs from external sources. Images will be validated automatically.
                    </p>
                  </div>

                  <ImageInput
                    images={formData.images}
                    onChange={(images) => handleInputChange("images", images)}
                    error={formErrors.images}
                  />
                </div>
              </TabsContent>

              <TabsContent value="preview" className="mt-0">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Live Preview</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      This is how your product will appear to customers
                    </p>
                  </div>

                  <div className="max-w-xs mx-auto">
                    <ProductCard product={previewProduct} onClick={() => {}} />
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Mobile Footer */}
        <div className="sticky bottom-0 bg-background border-t p-4 space-y-3">
          <Button onClick={handleSaveChanges} disabled={isSubmitting} className="w-full" size="lg">
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
            <Button variant="outline" onClick={resetForm} className="w-full">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset Changes
            </Button>
          )}
        </div>
      </div>
    )
  }

  // Desktop layout
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
        {formErrors.general && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{formErrors.general}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSaveChanges} className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left Column - Form Fields */}
            <div className="space-y-6">
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
            </div>

            {/* Right Column - Images and Preview */}
            <div className="space-y-6">
              {/* Images */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Images <span className="text-destructive">*</span>
                </label>
                <ImageInput
                  images={formData.images}
                  onChange={(images) => handleInputChange("images", images)}
                  error={formErrors.images}
                />
              </div>

              {/* Live Preview */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Live Preview</label>
                <div className="max-w-xs">
                  <ProductCard product={previewProduct} onClick={() => {}} />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90" disabled={isSubmitting} size="lg">
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
