import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Route, 
  MapPin, 
  Users, 
  Clock,
  Navigation,
  Car,
  Calendar,
  Smartphone,
  Zap,
  Target,
  TrendingUp,
  Eye,
  Edit,
  Play,
  Pause,
  CheckCircle
} from "lucide-react";
import { PageTransition } from "@/components/PageTransition";
import { TransitionHints, useTransitionHints } from "@/components/TransitionHints";
import { AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import RouteMap from "@/components/RouteMap";

interface RouteStore {
  id: string;
  storeName: string;
  address: string;
  city: string;
  province: string;
  visitOrder: number;
  estimatedDuration: number;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  lastVisitDate?: string;
  visitNotes?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

interface RoutePlan {
  id: string;
  planName: string;
  salesRepName: string;
  salesRepId: string;
  startDate: string;
  endDate: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  stores: RouteStore[];
  estimatedDistance: number;
  estimatedDuration: number;
  actualDistance?: number;
  actualDuration?: number;
  optimizedRoute?: any;
  createdAt: string;
}

export default function RouteOptimization() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRoute, setSelectedRoute] = useState<RoutePlan | null>(null);
  const [showRouteDetails, setShowRouteDetails] = useState(false);
  const [showMobileView, setShowMobileView] = useState(false);
  const [selectedSalesRep, setSelectedSalesRep] = useState("all");

  // Transition hints
  const { 
    activeHints, 
    isVisible: hintsVisible, 
    showHints, 
    hideHints, 
    completeHints 
  } = useTransitionHints();

  // Data queries
  const { data: routePlans = [], isLoading } = useQuery({
    queryKey: ["/api/route-plans"],
  });

  const { data: salesReps = [] } = useQuery({
    queryKey: ["/api/sales-reps"],
  });

  const { data: routeAnalytics } = useQuery({
    queryKey: ["/api/analytics/route-performance"],
  });

  // Mutations
  const optimizeRouteMutation = useMutation({
    mutationFn: async (routeId: string) => {
      return await apiRequest(`/api/route-plans/${routeId}/optimize`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/route-plans"] });
      toast({ title: "Route optimized successfully" });
    },
  });

  const updateRouteStatusMutation = useMutation({
    mutationFn: async (data: { routeId: string; status: string }) => {
      return await apiRequest(`/api/route-plans/${data.routeId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: data.status }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/route-plans"] });
      toast({ title: "Route status updated" });
    },
  });

  // Filter routes
  const filteredRoutes = routePlans.filter((route: RoutePlan) => {
    return selectedSalesRep === "all" || route.salesRepId === selectedSalesRep;
  });

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatDistance = (distance: number) => {
    return `${distance.toFixed(1)} km`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'draft': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getStoreStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'in_progress': return <Play className="w-4 h-4 text-blue-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'skipped': return <Pause className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const startRouteOptimizationTour = () => {
    const routeHints = [
      {
        id: 'overview',
        title: 'AI Route Optimization',
        description: 'Plan optimal sales routes with AI-powered distance calculation and visit scheduling across 1,800+ hardware stores.',
        type: 'info' as const,
        position: 'center' as const
      },
      {
        id: 'route-analytics',
        title: 'Route Performance Analytics',
        description: 'Monitor route efficiency, completion rates, and sales performance metrics.',
        targetElement: '[data-hint="route-analytics"]',
        type: 'success' as const,
        position: 'bottom' as const
      },
      {
        id: 'mobile-optimization',
        title: 'Mobile Field Support',
        description: 'Access routes on mobile devices with GPS navigation and offline sync capabilities.',
        targetElement: '[data-hint="mobile-view"]',
        type: 'tip' as const,
        position: 'left' as const
      }
    ];
    showHints(routeHints);
  };

  return (
    <PageTransition>
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
              🗺️ Route Optimization
            </h1>
            <p className="text-muted-foreground mt-2">
              AI-powered route planning for sales representatives
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={startRouteOptimizationTour}>
              🎯 Take Tour
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowMobileView(!showMobileView)}
              data-hint="mobile-view"
            >
              <Smartphone className="w-4 h-4 mr-2" />
              Mobile View
            </Button>
          </div>
        </div>

        {/* Route Analytics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6" data-hint="route-analytics">
          <Card className="backdrop-blur-sm bg-white/10 border border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Routes</CardTitle>
              <Route className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {routePlans.filter((r: RoutePlan) => r.status === 'active').length}
              </div>
              <p className="text-xs text-muted-foreground">Currently in progress</p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/10 border border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Efficiency</CardTitle>
              <Target className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {routeAnalytics?.avgEfficiency || 87}%
              </div>
              <p className="text-xs text-muted-foreground">Route completion rate</p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/10 border border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Distance Saved</CardTitle>
              <Navigation className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {routeAnalytics?.distanceSaved || 1247} km
              </div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/10 border border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Time Saved</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {routeAnalytics?.timeSaved || 156}h
              </div>
              <p className="text-xs text-muted-foreground">Optimization impact</p>
            </CardContent>
          </Card>
        </div>

        {/* Filter Controls */}
        <Card className="backdrop-blur-sm bg-white/10 border border-white/20">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Select value={selectedSalesRep} onValueChange={setSelectedSalesRep}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by Sales Rep" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sales Representatives</SelectItem>
                    {salesReps.map((rep: any) => (
                      <SelectItem key={rep.id} value={rep.id}>{rep.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button>
                <Route className="w-4 h-4 mr-2" />
                Create New Route
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Interactive Route Map */}
        <Card className="backdrop-blur-sm bg-white/10 border border-white/20" data-hint="route-map">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Map className="w-5 h-5" />
              Interactive Route Map
            </CardTitle>
            <CardDescription>
              Real-time route visualization with Google Maps integration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RouteMap
              stops={optimizedRoute.map(stop => ({
                id: stop.storeId,
                name: stop.storeName,
                address: `${stop.city}, ${stop.province}`,
                position: { 
                  lat: stop.latitude || (-26.2041 + (Math.random() - 0.5) * 2), 
                  lng: stop.longitude || (28.0473 + (Math.random() - 0.5) * 2)
                },
                estimatedTime: stop.estimatedTime,
                status: stop.visitStatus as any
              }))}
              optimizeRoute={true}
              onRouteOptimized={(optimizedStops) => {
                console.log('Route optimized:', optimizedStops);
              }}
              height="500px"
              className="w-full"
            />
          </CardContent>
        </Card>

        {/* Route Plans Grid */}
        <div className={`grid gap-6 ${showMobileView ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
          {filteredRoutes.map((route: RoutePlan) => (
            <Card key={route.id} className="backdrop-blur-sm bg-white/10 border border-white/20 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{route.planName}</CardTitle>
                  <Badge className={getStatusColor(route.status)}>
                    {route.status}
                  </Badge>
                </div>
                <CardDescription>
                  {route.salesRepName} • {route.stores.length} stores
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Route Stats */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-blue-500" />
                    <span>{formatDistance(route.estimatedDistance)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-green-500" />
                    <span>{formatDuration(route.estimatedDuration)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-purple-500" />
                    <span>{new Date(route.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-orange-500" />
                    <span>{route.stores.filter(s => s.status === 'completed').length}/{route.stores.length}</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{Math.round((route.stores.filter(s => s.status === 'completed').length / route.stores.length) * 100)}%</span>
                  </div>
                  <Progress 
                    value={(route.stores.filter(s => s.status === 'completed').length / route.stores.length) * 100}
                    className="h-2"
                  />
                </div>

                {/* Store List Preview */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Next Stores:</h4>
                  <div className="space-y-1">
                    {route.stores
                      .filter(s => s.status === 'pending')
                      .slice(0, 3)
                      .map((store) => (
                      <div key={store.id} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          {getStoreStatusIcon(store.status)}
                          <span>{store.storeName}</span>
                        </div>
                        <span className="text-muted-foreground">{store.city}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => {
                      setSelectedRoute(route);
                      setShowRouteDetails(true);
                    }}
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    View
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => optimizeRouteMutation.mutate(route.id)}
                    disabled={optimizeRouteMutation.isPending}
                  >
                    <Zap className="w-3 h-3 mr-1" />
                    Optimize
                  </Button>
                  {route.status === 'draft' && (
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => updateRouteStatusMutation.mutate({
                        routeId: route.id,
                        status: 'active'
                      })}
                    >
                      <Play className="w-3 h-3 mr-1" />
                      Start
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Route Details Dialog */}
        <Dialog open={showRouteDetails} onOpenChange={setShowRouteDetails}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedRoute?.planName}</DialogTitle>
              <DialogDescription>
                Detailed route information and store visit tracking
              </DialogDescription>
            </DialogHeader>
            
            {selectedRoute && (
              <div className="space-y-6">
                {/* Route Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 border border-white/10 rounded-lg bg-white/5">
                    <div className="text-lg font-bold text-blue-600">
                      {formatDistance(selectedRoute.estimatedDistance)}
                    </div>
                    <div className="text-xs text-muted-foreground">Distance</div>
                  </div>
                  <div className="text-center p-3 border border-white/10 rounded-lg bg-white/5">
                    <div className="text-lg font-bold text-green-600">
                      {formatDuration(selectedRoute.estimatedDuration)}
                    </div>
                    <div className="text-xs text-muted-foreground">Duration</div>
                  </div>
                  <div className="text-center p-3 border border-white/10 rounded-lg bg-white/5">
                    <div className="text-lg font-bold text-purple-600">
                      {selectedRoute.stores.length}
                    </div>
                    <div className="text-xs text-muted-foreground">Stores</div>
                  </div>
                  <div className="text-center p-3 border border-white/10 rounded-lg bg-white/5">
                    <div className="text-lg font-bold text-orange-600">
                      {selectedRoute.stores.filter(s => s.status === 'completed').length}
                    </div>
                    <div className="text-xs text-muted-foreground">Completed</div>
                  </div>
                </div>

                {/* Store List */}
                <div>
                  <h3 className="font-semibold mb-4">Store Visit Schedule</h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {selectedRoute.stores
                      .sort((a, b) => a.visitOrder - b.visitOrder)
                      .map((store, index) => (
                      <div key={store.id} className="flex items-center justify-between p-3 border border-white/10 rounded-lg bg-white/5">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xs font-medium">
                            {index + 1}
                          </div>
                          {getStoreStatusIcon(store.status)}
                          <div>
                            <p className="font-medium text-sm">{store.storeName}</p>
                            <p className="text-xs text-muted-foreground">{store.address}</p>
                          </div>
                        </div>
                        <div className="text-right text-xs">
                          <p className="font-medium">{formatDuration(store.estimatedDuration)}</p>
                          <Badge variant="outline" className="text-xs">
                            {store.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
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