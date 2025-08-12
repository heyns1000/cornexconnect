import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { PageTransition } from "@/components/PageTransition";
import { AnimatedCard, FadeIn } from "@/components/AnimatedComponents";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, Package, AlertCircle, Check, X } from "lucide-react";

interface InventoryItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  location: string;
  reorderPoint: number;
  maxStock: number;
  unitCost: number;
  totalValue: number;
  lastUpdated: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

interface UploadResult {
  success: boolean;
  processed: number;
  errors: string[];
  items: InventoryItem[];
}

export default function InventoryUpload() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const { toast } = useToast();

  const { data: inventory = [], isLoading } = useQuery<InventoryItem[]>({
    queryKey: ["/api/inventory"],
  });

  const uploadMutation = useMutation({
    mutationFn: (formData: FormData) => 
      fetch("/api/inventory/upload", {
        method: "POST",
        body: formData,
      }).then(res => res.json()),
    onSuccess: (result: UploadResult) => {
      setUploadResult(result);
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      if (result.success) {
        toast({
          title: "Upload Successful",
          description: `${result.processed} inventory items processed successfully.`,
        });
      } else {
        toast({
          title: "Upload Completed with Errors",
          description: `${result.processed} items processed, ${result.errors.length} errors found.`,
          variant: "destructive",
        });
      }
    },
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: (updates: Partial<InventoryItem>[]) =>
      apiRequest("/api/inventory/bulk-update", "POST", { updates }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      toast({
        title: "Bulk Update Complete",
        description: "Inventory has been updated successfully.",
      });
    },
  });

  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append("files", file);
    });

    uploadMutation.mutate(formData);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock': return 'bg-green-100 text-green-800';
      case 'low_stock': return 'bg-yellow-100 text-yellow-800';
      case 'out_of_stock': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStockStatus = (quantity: number, reorderPoint: number) => {
    if (quantity === 0) return 'out_of_stock';
    if (quantity <= reorderPoint) return 'low_stock';
    return 'in_stock';
  };

  return (
    <PageTransition>
      <div className="p-8 space-y-8">
        <FadeIn>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
              <p className="text-gray-600 mt-2">Upload and manage your product inventory</p>
            </div>
            <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
              <DialogTrigger asChild>
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Inventory
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Upload Inventory Data</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      dragOver
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                  >
                    <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Drop your files here
                    </h3>
                    <p className="text-gray-500 mb-4">
                      or click to select files (Excel, CSV supported)
                    </p>
                    <Input
                      type="file"
                      multiple
                      accept=".xlsx,.xls,.csv"
                      onChange={(e) => handleFileUpload(e.target.files)}
                      className="hidden"
                      id="file-upload"
                    />
                    <Label
                      htmlFor="file-upload"
                      className="cursor-pointer inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
                    >
                      Select Files
                    </Label>
                  </div>

                  {uploadMutation.isPending && (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                      <span className="ml-2 text-gray-600">Processing files...</span>
                    </div>
                  )}

                  {uploadResult && (
                    <div className="space-y-4">
                      <div className={`p-4 rounded-lg ${
                        uploadResult.success 
                          ? 'bg-green-50 border border-green-200' 
                          : 'bg-yellow-50 border border-yellow-200'
                      }`}>
                        <div className="flex items-center">
                          {uploadResult.success ? (
                            <Check className="h-5 w-5 text-green-600 mr-2" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                          )}
                          <span className="font-medium">
                            {uploadResult.processed} items processed
                          </span>
                        </div>
                      </div>

                      {uploadResult.errors.length > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <h4 className="font-medium text-red-800 mb-2">Errors Found:</h4>
                          <ul className="text-sm text-red-700 space-y-1">
                            {uploadResult.errors.map((error, index) => (
                              <li key={index}>• {error}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-800 mb-2">File Format Requirements:</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• SKU (Product Code) - Required</li>
                      <li>• Product Name - Required</li>
                      <li>• Quantity - Required (numeric)</li>
                      <li>• Location - Required</li>
                      <li>• Reorder Point - Optional (numeric)</li>
                      <li>• Unit Cost - Optional (numeric)</li>
                    </ul>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <FadeIn delay={0.1}>
            <AnimatedCard className="backdrop-blur-sm bg-white/80">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Package className="h-8 w-8 text-emerald-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Items</p>
                    <p className="text-2xl font-bold text-gray-900">{inventory.length}</p>
                  </div>
                </div>
              </CardContent>
            </AnimatedCard>
          </FadeIn>

          <FadeIn delay={0.2}>
            <AnimatedCard className="backdrop-blur-sm bg-white/80">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">In Stock</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {inventory.filter(item => getStockStatus(item.quantity, item.reorderPoint) === 'in_stock').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </AnimatedCard>
          </FadeIn>

          <FadeIn delay={0.3}>
            <AnimatedCard className="backdrop-blur-sm bg-white/80">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Low Stock</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {inventory.filter(item => getStockStatus(item.quantity, item.reorderPoint) === 'low_stock').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </AnimatedCard>
          </FadeIn>

          <FadeIn delay={0.4}>
            <AnimatedCard className="backdrop-blur-sm bg-white/80">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <X className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {inventory.filter(item => getStockStatus(item.quantity, item.reorderPoint) === 'out_of_stock').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </AnimatedCard>
          </FadeIn>
        </div>

        <AnimatedCard className="backdrop-blur-sm bg-white/80">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2 text-emerald-600" />
              Current Inventory
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {inventory.map((item, index) => {
                  const status = getStockStatus(item.quantity, item.reorderPoint);
                  return (
                    <FadeIn key={item.id} delay={index * 0.05}>
                      <div className="flex items-center justify-between p-4 rounded-lg border bg-white/50 hover:bg-white/80 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                            <Package className="h-6 w-6 text-emerald-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{item.productName}</h3>
                            <p className="text-sm text-gray-600">SKU: {item.sku}</p>
                            <p className="text-sm text-gray-600">Location: {item.location}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="font-semibold text-lg text-gray-900">{item.quantity}</p>
                            <p className="text-xs text-gray-500">Reorder: {item.reorderPoint}</p>
                          </div>
                          <Badge className={getStatusColor(status)}>
                            {status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </FadeIn>
                  );
                })}
                {inventory.length === 0 && (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No inventory items found</h3>
                    <p className="text-gray-500">Upload your first inventory file to get started.</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </AnimatedCard>
      </div>
    </PageTransition>
  );
}