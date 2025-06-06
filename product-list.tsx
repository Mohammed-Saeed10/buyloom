"use client"

import { useState } from "react"
import { Trash2, ExternalLink, Calendar, Edit, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "@/hooks/use-toast"
import type { Product } from "@/lib/types"

interface ProductListProps {
  products: Product[]
  onProductDeleted: (productId: string) => void
  onProductEdit: (product: Product) => void
}

export function ProductList({ products, onProductDeleted, onProductEdit }: ProductListProps) {
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean
    product: Product | null
    isDeleting: boolean
  }>({
    isOpen: false,
    product: null,
    isDeleting: false,
  })

  const handleDeleteClick = (product: Product) => {
    setDeleteDialog({
      isOpen: true,
      product,
      isDeleting: false,
    })
  }

  const handleEditClick = (product: Product) => {
    onProductEdit(product)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.product) return

    setDeleteDialog((prev) => ({ ...prev, isDeleting: true }))

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      onProductDeleted(deleteDialog.product.id)

      toast({
        title: "Product deleted successfully",
        description: `"${deleteDialog.product.name}" has been removed from your catalog.`,
      })

      setDeleteDialog({
        isOpen: false,
        product: null,
        isDeleting: false,
      })
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "There was an error deleting the product. Please try again.",
        variant: "destructive",
      })
      setDeleteDialog((prev) => ({ ...prev, isDeleting: false }))
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialog({
      isOpen: false,
      product: null,
      isDeleting: false,
    })
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const truncateUrl = (url: string, maxLength = 30) => {
    if (url.length <= maxLength) return url
    return url.substring(0, maxLength) + "..."
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground text-lg mb-2">No products yet</div>
        <p className="text-muted-foreground">Add your first product to get started!</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {products.map((product) => (
          <Card key={product.id} className="transition-all duration-200 hover:shadow-md">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                {/* Product Image */}
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted">
                    <img
                      src={product.images[0] || "/placeholder.svg?height=80&width=80"}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Product Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                    <h4 className="font-semibold text-lg leading-tight">{product.name}</h4>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{product.category}</Badge>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <span className="text-yellow-500 mr-1">★</span>
                        {product.rating}
                      </div>
                    </div>
                  </div>

                  <p className="text-muted-foreground text-sm line-clamp-2 mb-3">{product.description}</p>

                  {/* Tags */}
                  {product.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {product.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant={tag === "Hot" ? "destructive" : tag === "New" ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs text-muted-foreground mb-4">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      Added {formatDate(product.createdAt)}
                    </div>
                    <div className="hidden sm:block">•</div>
                    <div className="flex items-center">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      {truncateUrl(product.affiliateUrl)}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      {product.images.length} image{product.images.length !== 1 ? "s" : ""}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      {/* Desktop Actions */}
                      <div className="hidden sm:flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditClick(product)}
                          className="text-primary hover:text-primary hover:bg-primary/10"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteClick(product)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>

                      {/* Mobile Dropdown */}
                      <div className="sm:hidden">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditClick(product)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Product
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(product)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Product
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteDialog.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Product"
        description={`Are you sure you want to delete "${deleteDialog.product?.name}"? This action cannot be undone.`}
        confirmText="Confirm Delete"
        cancelText="Cancel"
        variant="destructive"
        isLoading={deleteDialog.isDeleting}
      />
    </>
  )
}
