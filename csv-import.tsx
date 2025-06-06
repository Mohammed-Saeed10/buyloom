"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, Download, FileText, AlertCircle, CheckCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "@/hooks/use-toast"
import { parseCSV, downloadSampleCSV, type CSVParseResult } from "@/lib/csv-parser"
import type { Product } from "@/lib/types"

interface CSVImportProps {
  onProductsImported: (products: Product[]) => void
  onClose: () => void
}

export function CSVImport({ onProductsImported, onClose }: CSVImportProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [parseResult, setParseResult] = useState<CSVParseResult | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (file: File) => {
    if (!file.name.toLowerCase().endsWith(".csv")) {
      toast({
        title: "Invalid File Type",
        description: "Please select a CSV file.",
        variant: "destructive",
      })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      toast({
        title: "File Too Large",
        description: "Please select a file smaller than 5MB.",
        variant: "destructive",
      })
      return
    }

    setSelectedFile(file)
    processFile(file)
  }

  const processFile = async (file: File) => {
    setIsProcessing(true)
    setParseResult(null)

    try {
      const content = await file.text()
      const result = parseCSV(content)
      setParseResult(result)

      if (result.errors.length > 0) {
        toast({
          title: "CSV Parse Errors",
          description: `Found ${result.errors.length} error(s) in the CSV file.`,
          variant: "destructive",
        })
      } else if (result.validProducts.length > 0) {
        toast({
          title: "CSV Parsed Successfully",
          description: `Found ${result.validProducts.length} valid product(s) ready to import.`,
        })
      }
    } catch (error) {
      toast({
        title: "File Processing Error",
        description: "Failed to process the CSV file. Please check the file format.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleImportProducts = () => {
    if (!parseResult || parseResult.validProducts.length === 0) return

    const products: Product[] = parseResult.validProducts.map((product, index) => ({
      id: `csv-${Date.now()}-${index}`,
      name: product.name,
      description: product.description,
      images: product.images,
      affiliateUrl: product.affiliateUrl,
      rating: product.rating,
      tags: product.tags,
      category: product.category,
      createdAt: new Date(),
    }))

    onProductsImported(products)

    toast({
      title: "Products Imported Successfully",
      description: `${products.length} product(s) have been added to your catalog.`,
    })

    onClose()
  }

  const resetImport = () => {
    setSelectedFile(null)
    setParseResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Upload className="h-5 w-5 mr-2" />
            Bulk Import Products
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Instructions */}
        <div className="space-y-4">
          <Alert>
            <FileText className="h-4 w-4" />
            <AlertDescription>
              Upload a CSV file to import multiple products at once. The CSV must include columns for: name,
              description, images, affiliateUrl, rating, tags, and category.
            </AlertDescription>
          </Alert>

          <div className="flex gap-2">
            <Button variant="outline" onClick={downloadSampleCSV} className="flex items-center">
              <Download className="h-4 w-4 mr-2" />
              Download Sample CSV
            </Button>
          </div>
        </div>

        <Separator />

        {/* File Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-muted-foreground/50"
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileInputChange} className="hidden" />

          {isProcessing ? (
            <div className="space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground">Processing CSV file...</p>
            </div>
          ) : selectedFile ? (
            <div className="space-y-4">
              <FileText className="h-12 w-12 text-primary mx-auto" />
              <div>
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">{(selectedFile.size / 1024).toFixed(1)} KB</p>
              </div>
              <Button variant="outline" onClick={resetImport}>
                Choose Different File
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Upload className="h-12 w-12 text-muted-foreground mx-auto" />
              <div>
                <p className="text-lg font-medium">Drop your CSV file here</p>
                <p className="text-muted-foreground">or click to browse</p>
              </div>
              <Button onClick={() => fileInputRef.current?.click()}>Select CSV File</Button>
            </div>
          )}
        </div>

        {/* Parse Results */}
        {parseResult && (
          <div className="space-y-4">
            <Separator />

            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{parseResult.validProducts.length}</div>
                  <div className="text-sm text-muted-foreground">Valid Products</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">{parseResult.invalidProducts.length}</div>
                  <div className="text-sm text-muted-foreground">Invalid Products</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold">{parseResult.totalRows}</div>
                  <div className="text-sm text-muted-foreground">Total Rows</div>
                </CardContent>
              </Card>
            </div>

            {/* General Errors */}
            {parseResult.errors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    {parseResult.errors.map((error, index) => (
                      <div key={index}>{error}</div>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Valid Products Preview */}
            {parseResult.validProducts.length > 0 && (
              <div>
                <h3 className="font-semibold text-green-600 mb-2 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Valid Products ({parseResult.validProducts.length})
                </h3>
                <ScrollArea className="h-48 border rounded-md p-4">
                  <div className="space-y-2">
                    {parseResult.validProducts.map((product, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded">
                        <div>
                          <span className="font-medium">{product.name}</span>
                          <div className="flex gap-1 mt-1">
                            <Badge variant="outline">{product.category}</Badge>
                            <Badge variant="secondary">★ {product.rating}</Badge>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">Row {product.rowNumber}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {/* Invalid Products */}
            {parseResult.invalidProducts.length > 0 && (
              <div>
                <h3 className="font-semibold text-red-600 mb-2 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Invalid Products ({parseResult.invalidProducts.length})
                </h3>
                <ScrollArea className="h-48 border rounded-md p-4">
                  <div className="space-y-3">
                    {parseResult.invalidProducts.map((product, index) => (
                      <div key={index} className="p-3 bg-red-50 rounded border-l-4 border-red-500">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{product.name || "Unnamed Product"}</span>
                          <span className="text-xs text-muted-foreground">Row {product.rowNumber}</span>
                        </div>
                        <div className="space-y-1">
                          {product.errors.map((error, errorIndex) => (
                            <div key={errorIndex} className="text-sm text-red-600">
                              • {error}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {/* Import Button */}
            {parseResult.validProducts.length > 0 && (
              <div className="flex justify-end">
                <Button onClick={handleImportProducts} size="lg" className="bg-green-600 hover:bg-green-700">
                  Import {parseResult.validProducts.length} Product{parseResult.validProducts.length !== 1 ? "s" : ""}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
