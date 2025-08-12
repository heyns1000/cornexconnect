import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  MapPin, 
  Navigation, 
  Clock,
  CheckCircle,
  Camera,
  Phone,
  MessageSquare,
  Wifi,
  WifiOff,
  Battery,
  Signal,
  Upload,
  Download,
  Sync,
  AlertTriangle
} from "lucide-react";
import { PageTransition } from "@/components/PageTransition";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface StoreVisit {
  id?: string;
  storeId: string;
  storeName: string;
  address: string;
  contactPerson?: string;
  phone?: string;
  visitType: 'scheduled' | 'unscheduled' | 'follow_up';
  scheduledTime?: string;
  actualArrival?: string;
  actualDeparture?: string;
  visitDuration?: number;
  outcome: 'successful' | 'no_contact' | 'rescheduled' | 'cancelled';
  orderPlaced: boolean;
  orderValue?: number;
  storeCondition?: string;
  stockLevel?: string;
  competitorActivity?: string;
  notes?: string;
  photos?: string[];
  followUpRequired: boolean;
  followUpDate?: string;
  status: 'pending' | 'in_progress' | 'completed';
}

export default function MobileFieldApp() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [currentVisit, setCurrentVisit] = useState<StoreVisit | null>(null);
  const [showVisitForm, setShowVisitForm] = useState(false);
  const [visitNotes, setVisitNotes] = useState("");
  const [orderValue, setOrderValue] = useState("");
  const [syncQueue, setSyncQueue] = useState<any[]>([]);

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Current location and route
  const { data: currentRoute } = useQuery({
    queryKey: ["/api/route-plans/current"],
    enabled: isOnline,
  });

  const { data: todayVisits = [] } = useQuery({
    queryKey: ["/api/store-visits/today"],
    enabled: isOnline,
  });

  // Offline sync queue
  const syncMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("/api/store-visits/sync", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      setSyncQueue([]);
      queryClient.invalidateQueries({ queryKey: ["/api/store-visits"] });
      toast({ title: "Data synced successfully" });
    },
  });

  // Visit management
  const createVisitMutation = useMutation({
    mutationFn: async (visitData: StoreVisit) => {
      if (!isOnline) {
        // Add to offline queue
        setSyncQueue(prev => [...prev, visitData]);
        return visitData;
      }
      return await apiRequest("/api/store-visits", {
        method: "POST",
        body: JSON.stringify(visitData),
      });
    },
    onSuccess: () => {
      toast({ title: "Visit recorded successfully" });
      setShowVisitForm(false);
      setCurrentVisit(null);
    },
  });

  const startVisit = (store: any) => {
    const visit: StoreVisit = {
      storeId: store.id,
      storeName: store.storeName,
      address: store.address,
      contactPerson: store.contactPerson,
      phone: store.phone,
      visitType: 'scheduled',
      actualArrival: new Date().toISOString(),
      outcome: 'successful',
      orderPlaced: false,
      followUpRequired: false,
      status: 'in_progress'
    };
    setCurrentVisit(visit);
    setShowVisitForm(true);
  };

  const completeVisit = () => {
    if (!currentVisit) return;

    const completedVisit: StoreVisit = {
      ...currentVisit,
      actualDeparture: new Date().toISOString(),
      visitDuration: currentVisit.actualArrival 
        ? Math.floor((new Date().getTime() - new Date(currentVisit.actualArrival).getTime()) / 60000)
        : 0,
      notes: visitNotes,
      orderValue: orderValue ? parseFloat(orderValue) : undefined,
      status: 'completed'
    };

    createVisitMutation.mutate(completedVisit);
  };

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        {/* Mobile Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Field App</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">{getCurrentTime()}</p>
            </div>
            <div className="flex items-center gap-2">
              {/* Connection Status */}
              <div className="flex items-center gap-1">
                {isOnline ? (
                  <Wifi className="w-4 h-4 text-green-500" />
                ) : (
                  <WifiOff className="w-4 h-4 text-red-500" />
                )}
                <Signal className="w-4 h-4 text-gray-500" />
                <Battery className="w-4 h-4 text-gray-500" />
              </div>
              
              {/* Sync Status */}
              {syncQueue.length > 0 && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => syncMutation.mutate(syncQueue)}
                  disabled={!isOnline}
                >
                  <Sync className="w-4 h-4 mr-1" />
                  {syncQueue.length}
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Offline Alert */}
          {!isOnline && (
            <Card className="border-orange-200 bg-orange-50 dark:bg-orange-900/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  <span className="text-sm text-orange-700 dark:text-orange-300">
                    You're offline. Data will sync when connection is restored.
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Current Route Summary */}
          {currentRoute && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Today's Route</CardTitle>
                <CardDescription>{currentRoute.planName}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-blue-600">
                      {currentRoute.stores?.length || 0}
                    </div>
                    <div className="text-xs text-gray-500">Total Stores</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-600">
                      {todayVisits.filter((v: any) => v.status === 'completed').length}
                    </div>
                    <div className="text-xs text-gray-500">Completed</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-purple-600">
                      {currentRoute.estimatedDuration 
                        ? Math.floor(currentRoute.estimatedDuration / 60) + 'h'
                        : '0h'}
                    </div>
                    <div className="text-xs text-gray-500">Est. Time</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Store List */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Today's Visits</h2>
            
            {currentRoute?.stores?.map((store: any, index: number) => {
              const visit = todayVisits.find((v: any) => v.storeId === store.id);
              const isCompleted = visit?.status === 'completed';
              const isInProgress = currentVisit?.storeId === store.id;

              return (
                <Card key={store.id} className={`${isCompleted ? 'bg-green-50 dark:bg-green-900/20' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xs font-medium">
                            {index + 1}
                          </div>
                          <h3 className="font-medium">{store.storeName}</h3>
                          {isCompleted && <CheckCircle className="w-4 h-4 text-green-500" />}
                        </div>
                        
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {store.address}
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          {store.contactPerson && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span>{store.contactPerson}</span>
                            </div>
                          )}
                          {store.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              <span>{store.phone}</span>
                            </div>
                          )}
                        </div>
                        
                        {visit?.notes && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                            {visit.notes}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex flex-col gap-2 ml-4">
                        {!isCompleted && !isInProgress && (
                          <Button 
                            size="sm"
                            onClick={() => startVisit(store)}
                          >
                            Start Visit
                          </Button>
                        )}
                        
                        {isInProgress && (
                          <Badge variant="secondary">In Progress</Badge>
                        )}
                        
                        {isCompleted && visit?.orderValue && (
                          <Badge variant="outline" className="text-green-600">
                            {formatCurrency(visit.orderValue)}
                          </Badge>
                        )}
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            // Open maps navigation
                            const address = encodeURIComponent(store.address);
                            window.open(`https://maps.google.com/?q=${address}`, '_blank');
                          }}
                        >
                          <Navigation className="w-3 h-3 mr-1" />
                          Navigate
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Visit Form Modal */}
        <Dialog open={showVisitForm} onOpenChange={setShowVisitForm}>
          <DialogContent className="max-w-md mx-4">
            <DialogHeader>
              <DialogTitle>Visit: {currentVisit?.storeName}</DialogTitle>
              <DialogDescription>
                Record your visit details and any orders placed
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Visit Outcome */}
              <div>
                <label className="text-sm font-medium">Visit Outcome</label>
                <Select 
                  value={currentVisit?.outcome}
                  onValueChange={(value) => setCurrentVisit(prev => prev ? {...prev, outcome: value as any} : null)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="successful">Successful</SelectItem>
                    <SelectItem value="no_contact">No Contact</SelectItem>
                    <SelectItem value="rescheduled">Rescheduled</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Order Information */}
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox"
                  checked={currentVisit?.orderPlaced || false}
                  onChange={(e) => setCurrentVisit(prev => prev ? {...prev, orderPlaced: e.target.checked} : null)}
                />
                <label className="text-sm font-medium">Order Placed</label>
              </div>

              {currentVisit?.orderPlaced && (
                <div>
                  <label className="text-sm font-medium">Order Value (ZAR)</label>
                  <Input 
                    type="number"
                    value={orderValue}
                    onChange={(e) => setOrderValue(e.target.value)}
                    placeholder="Enter order value"
                    className="mt-1"
                  />
                </div>
              )}

              {/* Store Condition */}
              <div>
                <label className="text-sm font-medium">Store Condition</label>
                <Select 
                  value={currentVisit?.storeCondition}
                  onValueChange={(value) => setCurrentVisit(prev => prev ? {...prev, storeCondition: value} : null)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellent">Excellent</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                    <SelectItem value="poor">Poor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Stock Level */}
              <div>
                <label className="text-sm font-medium">Stock Level</label>
                <Select 
                  value={currentVisit?.stockLevel}
                  onValueChange={(value) => setCurrentVisit(prev => prev ? {...prev, stockLevel: value} : null)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select stock level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="overstocked">Overstocked</SelectItem>
                    <SelectItem value="well_stocked">Well Stocked</SelectItem>
                    <SelectItem value="low_stock">Low Stock</SelectItem>
                    <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Notes */}
              <div>
                <label className="text-sm font-medium">Visit Notes</label>
                <Textarea 
                  value={visitNotes}
                  onChange={(e) => setVisitNotes(e.target.value)}
                  placeholder="Enter any additional notes..."
                  className="mt-1"
                  rows={3}
                />
              </div>

              {/* Follow-up Required */}
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox"
                  checked={currentVisit?.followUpRequired || false}
                  onChange={(e) => setCurrentVisit(prev => prev ? {...prev, followUpRequired: e.target.checked} : null)}
                />
                <label className="text-sm font-medium">Follow-up Required</label>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowVisitForm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={completeVisit}
                  disabled={createVisitMutation.isPending}
                  className="flex-1"
                >
                  {createVisitMutation.isPending ? "Saving..." : "Complete Visit"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
}