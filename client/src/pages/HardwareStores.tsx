import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { 
  Store, 
  MapPin, 
  Users, 
  Search, 
  Filter,
  Edit,
  Eye,
  Phone,
  Mail,
  DollarSign,
  TrendingUp,
  Calendar,
  Route,
  Upload,
  Download,
  Plus,
  BarChart3
} from "lucide-react";
import { PageTransition } from "@/components/PageTransition";
import { TransitionHints, useTransitionHints, HINT_SEQUENCES } from "@/components/TransitionHints";
import { AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import GoogleMap from "@/components/GoogleMap";
import { useCountry } from "@/hooks/useCountryContext";

interface HardwareStore {
  id: string;
  storeCode?: string;
  storeName: string;
  ownerName?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address: string;
  city: string;
  province: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  storeSize?: string;
  storeType: string;
  creditRating?: string;
  monthlyPotential?: string;
  lastOrderDate?: string;
  lastVisitDate?: string;
  isActive?: boolean;
  status?: 'active' | 'inactive' | 'pending';
  performance?: {
    monthlyRevenue?: number;
    totalOrders?: number;
    averageOrderValue?: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

interface SalesRep {
  id: string;
  name: string;
  email: string;
  territory: string[];
  assignedStores: number;
}

export default function HardwareStores() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("all");
  const [selectedSize, setSelectedSize] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedStore, setSelectedStore] = useState<HardwareStore | null>(null);
  const [showStoreDetails, setShowStoreDetails] = useState(false);
  const [showAddStore, setShowAddStore] = useState(false);
  const [showBulkAssign, setShowBulkAssign] = useState(false);

  // Transition hints
  const { 
    activeHints, 
    isVisible: hintsVisible, 
    showHints, 
    hideHints, 
    completeHints 
  } = useTransitionHints();

  // Data queries
  const { data: stores = [], isLoading: storesLoading } = useQuery({
    queryKey: ["/api/hardware-stores"],
  });

  const { data: salesReps = [] } = useQuery({
    queryKey: ["/api/sales-reps"],
  });

  const { data: storeAnalytics = {} } = useQuery({
    queryKey: ["/api/hardware-stores/analytics"],
  });

  // Mutations
  const updateStoreMutation = useMutation({
    mutationFn: async (data: { storeId: string; updates: Partial<HardwareStore> }) => {
      return await apiRequest(`/api/hardware-stores/${data.storeId}`, {
        method: "PATCH",
        body: JSON.stringify(data.updates),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hardware-stores"] });
      toast({ title: "Store updated successfully" });
    },
  });

  const assignSalesRepMutation = useMutation({
    mutationFn: async (data: { storeIds: string[]; salesRepId: string }) => {
      return await apiRequest("/api/hardware-stores/assign-rep", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hardware-stores"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sales-reps"] });
      toast({ title: "Sales representative assigned successfully" });
      setShowBulkAssign(false);
    },
  });

  // Filter stores
  const filteredStores = stores.filter((store: HardwareStore) => {
    const matchesSearch = store.storeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (store.ownerName || store.contactPerson || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         store.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProvince = selectedProvince === "all" || store.province === selectedProvince;
    const matchesSize = selectedSize === "all" || store.storeSize === selectedSize;
    const matchesStatus = selectedStatus === "all" || 
      (selectedStatus === "active" && store.isActive === true) ||
      (selectedStatus === "inactive" && store.isActive === false);
    
    return matchesSearch && matchesProvince && matchesSize && matchesStatus;
  });

  // Get unique provinces
  const provinces = [...new Set(stores.map((store: HardwareStore) => store.province))];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getStoreStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'inactive': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getSizeIcon = (size: string) => {
    switch (size) {
      case 'large': return '🏢';
      case 'medium': return '🏪';
      case 'small': return '🏬';
      default: return '🏪';
    }
  };

  const startHardwareStoreTour = () => {
    const hardwareStoreHints = [
      {
        id: 'overview',
        title: 'Hardware Store Management',
        description: 'Manage your entire network of 1,800+ hardware stores across South Africa with advanced analytics and route optimization.',
        type: 'info' as const,
        position: 'center' as const
      },
      {
        id: 'search-filters',
        title: 'Smart Search & Filters',
        description: 'Quickly find stores using powerful search and filter by province, size, or status.',
        targetElement: '[data-hint="search-filters"]',
        type: 'tip' as const,
        position: 'bottom' as const
      },
      {
        id: 'store-analytics',
        title: 'Performance Analytics',
        description: 'Monitor store performance with revenue tracking, order metrics, and growth indicators.',
        targetElement: '[data-hint="store-analytics"]',
        type: 'success' as const,
        position: 'left' as const
      },
      {
        id: 'sales-reps',
        title: 'Sales Rep Management',
        description: 'Assign sales representatives to territories and track their performance across assigned stores.',
        targetElement: '[data-hint="sales-reps"]',
        type: 'tip' as const,
        position: 'top' as const
      }
    ];
    showHints(hardwareStoreHints);
  };

  return (
    <PageTransition>
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
              🏪 Hardware Store Network
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage 1,800+ hardware stores across South Africa
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={startHardwareStoreTour}>
              📋 Take Tour
            </Button>
            <Button onClick={() => setShowAddStore(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Store
            </Button>
            <Button variant="outline" onClick={() => setShowBulkAssign(true)}>
              <Users className="w-4 h-4 mr-2" />
              Assign Reps
            </Button>
          </div>
        </div>

        {/* Analytics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6" data-hint="store-analytics">
          <Card className="backdrop-blur-sm bg-white/10 border border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Stores</CardTitle>
              <Store className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stores.length}</div>
              <p className="text-xs text-muted-foreground">Across 9 provinces</p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/10 border border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Stores</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stores.filter((s: HardwareStore) => s.isActive === true).length}
              </div>
              <p className="text-xs text-muted-foreground">
                {stores.length > 0 ? Math.round((stores.filter((s: HardwareStore) => s.isActive === true).length / stores.length) * 100) : 0}% active rate
              </p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/10 border border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {storeAnalytics?.totalMonthlyRevenue ? formatCurrency(storeAnalytics.totalMonthlyRevenue) : 'R0'}
              </div>
              <p className="text-xs text-muted-foreground">+8.2% from last month</p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/10 border border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sales Reps</CardTitle>
              <Users className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{salesReps.length}</div>
              <p className="text-xs text-muted-foreground">
                Avg {salesReps.length > 0 ? Math.round(stores.length / salesReps.length) : 0} stores per rep
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="backdrop-blur-sm bg-white/10 border border-white/20" data-hint="search-filters">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search stores, customers, or locations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={selectedProvince} onValueChange={setSelectedProvince}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Province" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Provinces</SelectItem>
                    {provinces.map((province) => (
                      <SelectItem key={province} value={province}>{province}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedSize} onValueChange={setSelectedSize}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sizes</SelectItem>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stores Grid */}
        <Card className="backdrop-blur-sm bg-white/10 border border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Hardware Stores ({filteredStores.length})</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Import
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredStores.map((store: HardwareStore) => (
                  <Card key={store.id} className="hover:shadow-lg transition-shadow cursor-pointer border border-white/10 bg-white/5">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getSizeIcon(store.storeSize)}</span>
                          <div>
                            <h3 className="font-semibold text-sm">{store.storeName}</h3>
                            <p className="text-xs text-muted-foreground">{store.customerName}</p>
                          </div>
                        </div>
                        <Badge className={getStoreStatusColor(store.status)}>
                          {store.status}
                        </Badge>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          <span>{store.city}, {store.province}</span>
                        </div>
                        {store.contactNumber && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-3 h-3 text-gray-400" />
                            <span>{store.contactNumber}</span>
                          </div>
                        )}
                        {store.salesRepName && (
                          <div className="flex items-center gap-2">
                            <Users className="w-3 h-3 text-gray-400" />
                            <span>{store.salesRepName}</span>
                          </div>
                        )}
                      </div>

                      <div className="mt-3 pt-3 border-t border-white/10">
                        <div className="flex items-center justify-between text-xs">
                          <span>Credit: {store.creditLimit ? formatCurrency(parseFloat(store.creditLimit)) : 'Not Set'}</span>
                          <span className="text-green-600">
                            {store.performance?.monthlyRevenue ? formatCurrency(store.performance.monthlyRevenue) : 'R0'}/mo
                          </span>
                        </div>
                        <div className="mt-2">
                          <Progress 
                            value={(store.currentBalance / store.creditLimit) * 100} 
                            className="h-1"
                          />
                        </div>
                      </div>

                      <div className="flex gap-1 mt-3">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 h-8"
                          onClick={() => {
                            setSelectedStore(store);
                            setShowStoreDetails(true);
                          }}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 h-8"
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Hardware Stores Map */}
        <Card className="backdrop-blur-sm bg-white/10 border border-white/20" data-hint="stores-map">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Store Locations Map
            </CardTitle>
            <CardDescription>Geographic distribution of {stores.length} hardware stores</CardDescription>
          </CardHeader>
          <CardContent>
            <GoogleMap
              center={{ lat: -26.2041, lng: 28.0473 }}
              zoom={6}
              height="400px"
              markers={filteredStores.slice(0, 100).map(store => ({
                id: store.id,
                position: { 
                  lat: store.latitude || (-26.2041 + (Math.random() - 0.5) * 10), 
                  lng: store.longitude || (28.0473 + (Math.random() - 0.5) * 10)
                },
                title: store.storeName,
                info: `${store.city}, ${store.province}<br/>Type: ${store.storeType}<br/>Status: ${store.isActive ? 'Active' : 'Inactive'}`,
                icon: store.isActive ? undefined : '/api/placeholder/32/32'
              }))}
              className="w-full"
            />
          </CardContent>
        </Card>

        {/* Sales Reps Overview */}
        <Card className="backdrop-blur-sm bg-white/10 border border-white/20" data-hint="sales-reps">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Sales Representatives
            </CardTitle>
            <CardDescription>Territory assignments and performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {salesReps.map((rep: SalesRep) => (
                <Card key={rep.id} className="border border-white/10 bg-white/5">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{rep.name}</h3>
                      <Badge variant="outline">{rep.assignedStores} stores</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{rep.email}</p>
                    <div className="text-xs">
                      <p className="font-medium">Territory:</p>
                      <p className="text-muted-foreground">{rep.territory.join(', ')}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Store Details Dialog */}
        <Dialog open={showStoreDetails} onOpenChange={setShowStoreDetails}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedStore?.storeName}</DialogTitle>
              <DialogDescription>
                Complete store information and performance metrics
              </DialogDescription>
            </DialogHeader>
            
            {selectedStore && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Store Information</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Owner:</span> {selectedStore.ownerName || selectedStore.contactPerson || 'N/A'}</p>
                      <p><span className="font-medium">Location:</span> {selectedStore.city}, {selectedStore.province}</p>
                      <p><span className="font-medium">Type:</span> {selectedStore.storeType}</p>
                      <p><span className="font-medium">Status:</span> {selectedStore.isActive ? 'Active' : 'Inactive'}</p>
                      {selectedStore.phone && (
                        <p><span className="font-medium">Phone:</span> {selectedStore.phone}</p>
                      )}
                      {selectedStore.email && (
                        <p><span className="font-medium">Email:</span> {selectedStore.email}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Financial Information</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Credit Rating:</span> {selectedStore.creditRating || 'B'}</p>
                      <p><span className="font-medium">Monthly Potential:</span> {selectedStore.monthlyPotential ? formatCurrency(parseFloat(selectedStore.monthlyPotential)) : 'R0'}</p>
                      <p><span className="font-medium">Store Type:</span> {selectedStore.storeType}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Performance Metrics</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Monthly Revenue:</span> {selectedStore.performance?.monthlyRevenue ? formatCurrency(selectedStore.performance.monthlyRevenue) : 'R0'}</p>
                      <p><span className="font-medium">Total Orders:</span> {selectedStore.performance?.totalOrders || 0}</p>
                      <p><span className="font-medium">Avg Order Value:</span> {selectedStore.performance?.averageOrderValue ? formatCurrency(selectedStore.performance.averageOrderValue) : 'R0'}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Sales Representative</h3>
                    <div className="space-y-2 text-sm">
                      {selectedStore.lastVisitDate ? (
                        <>
                          <p><span className="font-medium">Last Visit:</span> {new Date(selectedStore.lastVisitDate).toLocaleDateString()}</p>
                          {selectedStore.lastOrderDate && (
                            <p><span className="font-medium">Last Order:</span> {new Date(selectedStore.lastOrderDate).toLocaleDateString()}</p>
                          )}
                        </>
                      ) : (
                        <p className="text-muted-foreground">No sales representative assigned</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Transition Hints */}
        <AnimatePresence>
          {hintsVisible && (
            <TransitionHints
              steps={activeHints}
              isVisible={hintsVisible}
              onComplete={completeHints}
              onSkip={hideHints}
            />
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}