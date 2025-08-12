import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PageTransition } from "@/components/PageTransition";
import { Store, MapPin, Phone, Mail, Users } from "lucide-react";

interface HardwareStore {
  id: string;
  email: string | null;
  isActive: boolean | null;
  createdAt: Date;
  contactPerson: string | null;
  phone: string | null;
  address: string;
  city: string;
  province: string;
  postalCode: string | null;
  gpsCoordinates: string | null;
  storeSize: string | null;
  creditLimit: string | null;
  paymentTerms: string | null;
  salesRepId: string | null;
  visitFrequency: string | null;
  lastOrderDate: Date | null;
  totalOrders: number;
  avgOrderValue: string | null;
  lastVisitDate: Date | null;
}

export default function HardwareStores() {
  const { data: stores = [], isLoading } = useQuery<HardwareStore[]>({
    queryKey: ["/api/hardware-stores"]
  });

  return (
    <PageTransition>
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
              🏪 Hardware Stores Database
            </h1>
            <p className="text-muted-foreground mt-2">
              Complete listing of all hardware stores imported from Excel files
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-lg px-4 py-2">
              {stores.length} Total Stores
            </Badge>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <Card className="backdrop-blur-sm bg-white/10 border border-white/20">
            <CardContent className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading hardware stores...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Store Grid */}
        {!isLoading && stores.length > 0 && (
          <ScrollArea className="h-[600px]">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {stores.map((store) => (
                <Card key={store.id} className="backdrop-blur-sm bg-white/10 border border-white/20 hover:bg-white/20 transition-all duration-300">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Store className="w-5 h-5 text-emerald-500" />
                      <span className="truncate">{store.contactPerson || "Hardware Store"}</span>
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {store.city}, {store.province}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm space-y-1">
                      <p className="font-medium text-muted-foreground">Address:</p>
                      <p className="text-sm">{store.address}</p>
                      {store.postalCode && (
                        <p className="text-xs text-muted-foreground">{store.postalCode}</p>
                      )}
                    </div>
                    
                    {store.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-blue-500" />
                        <span>{store.phone}</span>
                      </div>
                    )}
                    
                    {store.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-green-500" />
                        <span className="truncate">{store.email}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-purple-500" />
                        <span className="text-sm">{store.totalOrders} orders</span>
                      </div>
                      <Badge variant={store.isActive ? "default" : "secondary"}>
                        {store.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>

                    {store.storeSize && (
                      <Badge variant="outline" className="text-xs">
                        Size: {store.storeSize}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}

        {/* Empty State */}
        {!isLoading && stores.length === 0 && (
          <Card className="backdrop-blur-sm bg-white/10 border border-white/20">
            <CardContent className="flex items-center justify-center h-64">
              <div className="text-center">
                <Store className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No hardware stores found</p>
                <p className="text-sm text-muted-foreground mt-2">Import Excel files to add stores to the database</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageTransition>
  );
}