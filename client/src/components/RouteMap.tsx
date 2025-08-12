import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, Clock, Route } from 'lucide-react';

interface RouteStop {
  id: string;
  name: string;
  address: string;
  position: { lat: number; lng: number };
  estimatedTime?: string;
  status?: 'pending' | 'completed' | 'current';
}

interface RouteMapProps {
  stops: RouteStop[];
  optimizeRoute?: boolean;
  onRouteOptimized?: (optimizedStops: RouteStop[]) => void;
  className?: string;
  height?: string;
}

export function RouteMap({ 
  stops, 
  optimizeRoute = false,
  onRouteOptimized,
  className = "",
  height = "500px"
}: RouteMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [routeInfo, setRouteInfo] = useState<{
    distance: string;
    duration: string;
    optimized: boolean;
  } | null>(null);

  useEffect(() => {
    const loader = new Loader({
      apiKey: import.meta.env.VITE_GOOGLE_API_KEY || '',
      version: 'weekly',
      libraries: ['places', 'geometry', 'directions']
    });

    loader.load().then(() => {
      setIsLoaded(true);
    }).catch(err => {
      console.error('Error loading Google Maps:', err);
    });
  }, []);

  useEffect(() => {
    if (isLoaded && mapRef.current && !map) {
      const newMap = new google.maps.Map(mapRef.current, {
        center: { lat: -26.2041, lng: 28.0473 }, // Johannesburg center
        zoom: 10,
        styles: [
          {
            featureType: 'all',
            elementType: 'geometry.fill',
            stylers: [{ color: '#f5f5f5' }]
          },
          {
            featureType: 'water',
            elementType: 'geometry',
            stylers: [{ color: '#e9e9e9' }]
          },
          {
            featureType: 'road',
            elementType: 'geometry',
            stylers: [{ color: '#ffffff' }]
          }
        ]
      });

      const directionsService = new google.maps.DirectionsService();
      const directionsRenderer = new google.maps.DirectionsRenderer({
        suppressMarkers: false,
        polylineOptions: {
          strokeColor: '#10B981',
          strokeWeight: 4
        }
      });

      directionsRenderer.setMap(newMap);

      setMap(newMap);
      setDirectionsService(directionsService);
      setDirectionsRenderer(directionsRenderer);
    }
  }, [isLoaded]);

  const calculateRoute = async (stopsToUse: RouteStop[]) => {
    if (!directionsService || !directionsRenderer || stopsToUse.length < 2) return;

    const origin = stopsToUse[0].position;
    const destination = stopsToUse[stopsToUse.length - 1].position;
    const waypoints = stopsToUse.slice(1, -1).map(stop => ({
      location: stop.position,
      stopover: true
    }));

    try {
      const result = await new Promise<google.maps.DirectionsResult>((resolve, reject) => {
        directionsService.route({
          origin,
          destination,
          waypoints,
          optimizeWaypoints: optimizeRoute,
          travelMode: google.maps.TravelMode.DRIVING,
        }, (result, status) => {
          if (status === 'OK' && result) {
            resolve(result);
          } else {
            reject(new Error(`Directions request failed: ${status}`));
          }
        });
      });

      directionsRenderer.setDirections(result);

      // Extract route information
      const route = result.routes[0];
      let totalDistance = 0;
      let totalDuration = 0;

      route.legs.forEach(leg => {
        if (leg.distance?.value) totalDistance += leg.distance.value;
        if (leg.duration?.value) totalDuration += leg.duration.value;
      });

      setRouteInfo({
        distance: `${(totalDistance / 1000).toFixed(1)} km`,
        duration: `${Math.round(totalDuration / 60)} min`,
        optimized: optimizeRoute && !!result.routes[0].waypoint_order
      });

      // If route was optimized, reorder the stops
      if (optimizeRoute && result.routes[0].waypoint_order && onRouteOptimized) {
        const optimizedOrder = result.routes[0].waypoint_order;
        const optimizedStops = [
          stopsToUse[0], // Origin stays first
          ...optimizedOrder.map(index => stopsToUse[index + 1]), // Waypoints reordered
          stopsToUse[stopsToUse.length - 1] // Destination stays last
        ];
        onRouteOptimized(optimizedStops);
      }

    } catch (error) {
      console.error('Error calculating route:', error);
    }
  };

  useEffect(() => {
    if (stops.length >= 2 && directionsService && directionsRenderer) {
      calculateRoute(stops);
    }
  }, [stops, directionsService, directionsRenderer, optimizeRoute]);

  const getMarkerIcon = (status?: string) => {
    switch (status) {
      case 'completed':
        return {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: '#10B981',
          fillOpacity: 1,
          strokeColor: '#047857',
          strokeWeight: 2,
          scale: 8
        };
      case 'current':
        return {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: '#F59E0B',
          fillOpacity: 1,
          strokeColor: '#D97706',
          strokeWeight: 2,
          scale: 10
        };
      default:
        return {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: '#6B7280',
          fillOpacity: 1,
          strokeColor: '#374151',
          strokeWeight: 2,
          scale: 6
        };
    }
  };

  if (!isLoaded) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}
        style={{ height }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading route map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Route Information */}
      {routeInfo && (
        <div className="flex flex-wrap gap-2 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
          <Badge variant="outline" className="flex items-center gap-1">
            <Route className="w-3 h-3" />
            {routeInfo.distance}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {routeInfo.duration}
          </Badge>
          {routeInfo.optimized && (
            <Badge variant="outline" className="flex items-center gap-1 bg-green-100 text-green-800">
              <Navigation className="w-3 h-3" />
              Optimized
            </Badge>
          )}
        </div>
      )}

      {/* Map */}
      <div 
        ref={mapRef} 
        className="rounded-lg overflow-hidden border"
        style={{ height }}
      />

      {/* Route Stops List */}
      <div className="space-y-2">
        <h4 className="font-medium text-sm text-gray-700">Route Stops ({stops.length})</h4>
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {stops.map((stop, index) => (
            <div key={stop.id} className="flex items-center gap-3 p-2 rounded bg-gray-50 text-sm">
              <div className="flex items-center gap-2 flex-1">
                <span className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium">
                  {index + 1}
                </span>
                <div>
                  <p className="font-medium">{stop.name}</p>
                  <p className="text-xs text-gray-600">{stop.address}</p>
                </div>
              </div>
              {stop.status && (
                <Badge 
                  variant={stop.status === 'completed' ? 'default' : 'secondary'}
                  className={
                    stop.status === 'completed' ? 'bg-green-100 text-green-800' :
                    stop.status === 'current' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }
                >
                  {stop.status}
                </Badge>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default RouteMap;