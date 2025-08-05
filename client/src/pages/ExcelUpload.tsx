import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Upload, 
  FileSpreadsheet, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Database,
  Store,
  Route,
  Apple
} from "lucide-react";

interface ExcelUpload {
  id: string;
  fileName: string;
  mappedName: string;
  fileSize: number;
  uploadedAt: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  storesCount: number;
  routesCount: number;
  errorMessage?: string;
}

interface HardwareStore {
  id: string;
  storeName: string;
  storeAddress: string;
  cityTown: string;
  province: string;
  contactPerson: string;
  phoneNumber: string;
  repName: string;
  visitFrequency: string;
  mappedToCornex: string;
  createdAt: string;
}

interface SalesRepRoute {
  id: string;
  repName: string;
  routeName: string;
  visitDay: string;
  visitFrequency: string;
  priority: number;
  mappedToCornex: string;
  createdAt: string;
}

export default function ExcelUpload() {
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [customMapping, setCustomMapping] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all Excel uploads with status
  const { data: uploads = [], isLoading: uploadsLoading } = useQuery<ExcelUpload[]>({
    queryKey: ['/api/excel-uploads'],
    refetchInterval: 2000 // Refresh every 2 seconds for real-time sync
  });

  // Fetch hardware stores from Excel uploads
  const { data: hardwareStores = [], isLoading: storesLoading } = useQuery<HardwareStore[]>({
    queryKey: ['/api/hardware-stores-excel'],
    refetchInterval: 2000
  });

  // Fetch sales rep routes from Excel uploads
  const { data: salesRoutes = [], isLoading: routesLoading } = useQuery<SalesRepRoute[]>({
    queryKey: ['/api/routes-excel'],
    refetchInterval: 2000
  });

  // Fetch sync status for 24/7 balance monitoring
  const { data: syncStatus, isLoading: syncLoading } = useQuery({
    queryKey: ['/api/sync-status'],
    refetchInterval: 1000 // Check sync status every second
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      if (customMapping) {
        formData.append('mappedName', customMapping);
      }

      return fetch('/api/excel-upload', {
        method: 'POST',
        body: formData,
      }).then(res => {
        if (!res.ok) throw new Error('Upload failed');
        return res.json();
      });
    },
    onSuccess: () => {
      toast({
        title: "🍎 Fruitful Upload Complete",
        description: "Excel file processed successfully. Hardware store directory updated.",
      });
      setSelectedFile(null);
      setCustomMapping('');
      setUploadProgress(0);
      
      // Invalidate all related queries for instant sync
      queryClient.invalidateQueries({ queryKey: ['/api/excel-uploads'] });
      queryClient.invalidateQueries({ queryKey: ['/api/hardware-stores-excel'] });
      queryClient.invalidateQueries({ queryKey: ['/api/routes-excel'] });
      queryClient.invalidateQueries({ queryKey: ['/api/hardware-stores'] });
      queryClient.invalidateQueries({ queryKey: ['/api/routes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/sync-status'] });
    },
    onError: () => {
      toast({
        title: "Upload Failed",
        description: "Failed to process Excel file. Please check format and try again.",
        variant: "destructive",
      });
      setUploadProgress(0);
    },
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    handleFileSelection(files[0]);
  };

  const handleFileSelection = (file: File) => {
    if (!file) return;
    
    // Validate file type
    const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                   file.type === 'application/vnd.ms-excel' ||
                   file.name.match(/\.(xlsx|xls)$/i);
    
    if (!isExcel) {
      toast({
        title: "Invalid File Type",
        description: "Please upload an Excel file (.xlsx or .xls)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "File size must be under 10MB",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFileSelection(files[0]);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) return;
    
    setUploadProgress(10);
    uploadMutation.mutate(selectedFile);
    
    // Simulate progress for better UX
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return prev;
        }
        return prev + 10;
      });
    }, 200);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'processing': return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const mapFileNameToCornex = (fileName: string): string => {
    const lowerName = fileName.toLowerCase();
    if (lowerName.includes('zollie')) return 'Cornex Zollie District Routes';
    if (lowerName.includes('homemart')) return 'Cornex Homemart Store Network';
    if (lowerName.includes('tripot')) return 'Cornex Tripot Distribution Points';
    if (lowerName.includes('cornice maker')) return 'Cornex Cornice Maker Retailers';
    return `Cornex ${fileName}`;
  };

  // Calculate totals for 24/7 balanced sync display
  const totalStores = hardwareStores.length;
  const totalRoutes = salesRoutes.length;
  const totalUploads = uploads.length;
  const completedUploads = uploads.filter(u => u.status === 'completed').length;
  const processingUploads = uploads.filter(u => u.status === 'processing').length;

  return (
    <div className="space-y-6">
      {/* Header with Fruitful Assist Branding */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-2">
          <Apple className="h-6 w-6 text-green-500" />
          <h1 className="text-2xl font-bold">Fruitful Assist - Excel Upload System</h1>
        </div>
      </div>

      {/* Sync Status Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{totalUploads}</div>
                <div className="text-sm text-gray-600">Total Uploads</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Store className="h-4 w-4 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{totalStores}</div>
                <div className="text-sm text-gray-600">Hardware Stores</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Route className="h-4 w-4 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">{totalRoutes}</div>
                <div className="text-sm text-gray-600">Sales Routes</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className={`h-4 w-4 ${syncStatus?.isBalanced ? 'text-green-500' : 'text-yellow-500'}`} />
              <div>
                <div className="text-2xl font-bold">
                  {syncStatus?.syncHealth === 'healthy' ? '✓' : '⟳'}
                </div>
                <div className="text-sm text-gray-600">24/7 Sync Status</div>
                {syncStatus && (
                  <div className="text-xs text-gray-500">
                    {syncStatus.isBalanced ? 'Balanced' : 'Syncing...'}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upload Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Excel File Upload
          </CardTitle>
          <CardDescription>
            Upload up to 120 Excel sheets with sales rep routes and hardware store lists.
            Supports .xlsx and .xls files up to 10MB each.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* File Drop Zone */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <div className="space-y-2">
                <p className="text-lg font-medium">
                  Drop Excel files here or click to browse
                </p>
                <p className="text-sm text-gray-500">
                  Supports .xlsx, .xls files up to 10MB each
                </p>
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                >
                  Choose Files
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileInput}
                  className="hidden"
                />
              </div>
            </div>

            {/* Selected File and Custom Mapping */}
            {selectedFile && (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{selectedFile.name}</p>
                      <p className="text-sm text-gray-500">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <p className="text-sm text-blue-600">
                        Auto-mapped to: {mapFileNameToCornex(selectedFile.name)}
                      </p>
                    </div>
                    <Button 
                      onClick={() => setSelectedFile(null)}
                      variant="ghost" 
                      size="sm"
                    >
                      Remove
                    </Button>
                  </div>
                </div>

                {/* Custom Mapping Input */}
                <div className="space-y-2">
                  <Label htmlFor="customMapping">Custom Cornex Mapping (Optional)</Label>
                  <Input
                    id="customMapping"
                    value={customMapping}
                    onChange={(e) => setCustomMapping(e.target.value)}
                    placeholder="Enter custom Cornex reference name"
                  />
                  <p className="text-xs text-gray-500">
                    Leave blank to use auto-mapping: zollie → Cornex Zollie District Routes, 
                    homemart → Cornex Homemart Store Network, etc.
                  </p>
                </div>

                {/* Upload Progress */}
                {uploadProgress > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} />
                  </div>
                )}

                {/* Upload Button */}
                <Button 
                  onClick={handleUpload}
                  disabled={uploadMutation.isPending}
                  className="w-full"
                >
                  {uploadMutation.isPending ? 'Processing...' : 'Upload & Process File'}
                </Button>
              </div>
            )}

            {/* Required Columns Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Required Excel Columns:</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium mb-2">Store Information:</p>
                    <ul className="space-y-1 text-gray-600">
                      <li>• Store Name</li>
                      <li>• Store Address</li>
                      <li>• City/Town</li>
                      <li>• Province</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium mb-2">Contact & Route Details:</p>
                    <ul className="space-y-1 text-gray-600">
                      <li>• Contact Person</li>
                      <li>• Phone Number</li>
                      <li>• Rep Name</li>
                      <li>• Visit Frequency</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Upload History & Status */}
      <Card>
        <CardHeader>
          <CardTitle>Upload History & Real-Time Status</CardTitle>
          <CardDescription>
            Live tracking of all Excel uploads and processing status. Updates automatically every 2 seconds.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {uploadsLoading ? (
            <div className="text-center py-8">
              <Clock className="mx-auto h-8 w-8 animate-spin text-gray-400 mb-4" />
              <p>Loading upload history...</p>
            </div>
          ) : uploads.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p>No Excel files uploaded yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {uploads.map((upload) => (
                <div key={upload.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(upload.status)}
                      <div>
                        <p className="font-medium">{upload.fileName}</p>
                        <p className="text-sm text-gray-600">{upload.mappedName}</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(upload.status)}>
                      {upload.status}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <span>Size: {(upload.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                    <span>Stores: {upload.storesCount}</span>
                    <span>Routes: {upload.routesCount}</span>
                    <span>Uploaded: {new Date(upload.uploadedAt).toLocaleString()}</span>
                  </div>
                  
                  {upload.errorMessage && (
                    <div className="mt-2 p-2 bg-red-50 text-red-600 text-sm rounded">
                      Error: {upload.errorMessage}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Synchronized Data Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Hardware Stores Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Hardware Store Directory
            </CardTitle>
            <CardDescription>
              Real-time synchronized store data from Excel uploads
            </CardDescription>
          </CardHeader>
          <CardContent>
            {storesLoading ? (
              <div className="text-center py-4">
                <Clock className="mx-auto h-6 w-6 animate-spin text-gray-400 mb-2" />
                <p className="text-sm">Syncing store data...</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-2xl font-bold">{totalStores} Stores</div>
                <div className="text-sm text-gray-600">
                  {hardwareStores.filter(s => s.province === 'Western Cape').length} Western Cape •{' '}
                  {hardwareStores.filter(s => s.province === 'Gauteng').length} Gauteng •{' '}
                  {hardwareStores.filter(s => s.province === 'KwaZulu-Natal').length} KZN
                </div>
                <div className="mt-4">
                  <Badge className="bg-green-100 text-green-800">
                    ✓ Synchronized with Database
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sales Routes Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Route className="h-5 w-5" />
              Sales Routes Network
            </CardTitle>
            <CardDescription>
              Real-time synchronized route data from Excel uploads
            </CardDescription>
          </CardHeader>
          <CardContent>
            {routesLoading ? (
              <div className="text-center py-4">
                <Clock className="mx-auto h-6 w-6 animate-spin text-gray-400 mb-2" />
                <p className="text-sm">Syncing route data...</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-2xl font-bold">{totalRoutes} Routes</div>
                <div className="text-sm text-gray-600">
                  {new Set(salesRoutes.map(r => r.repName)).size} Active Reps
                </div>
                <div className="mt-4">
                  <Badge className="bg-green-100 text-green-800">
                    ✓ Synchronized with Database
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}