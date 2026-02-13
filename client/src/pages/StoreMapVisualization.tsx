import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Map, Search, MapPin, Filter, Globe, Building2, Users } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

export default function StoreMapVisualization() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProvince, setSelectedProvince] = useState<string>("all");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 50;

  const { data: stores = [], isLoading: storesLoading } = useQuery({
    queryKey: ["/api/hardware-stores"],
  });

  const { data: analytics = {} as any } = useQuery({
    queryKey: ["/api/hardware-stores/analytics"],
  });

  // Filter stores
  const filteredStores = (stores as any[]).filter((store: any) => {
    const matchesSearch = store.storeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         store.city?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProvince = selectedProvince === "all" || store.province === selectedProvince;
    return matchesSearch && matchesProvince;
  });

  const provinceList = analytics.byProvince
    ? Object.entries(analytics.byProvince as Record<string, number>).sort((a, b) => (b[1] as number) - (a[1] as number))
    : [];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
            Store Map Visualization
          </h1>
          <p className="text-muted-foreground mt-2">
            {analytics.totalStores || (stores as any[]).length} stores across {analytics.provinces || 9} provinces + {(analytics.internationalRegions || []).length} international regions
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedProvince} onValueChange={(v) => { setSelectedProvince(v); setPage(1); }}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Provinces" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Provinces</SelectItem>
              {provinceList.map(([province]) => (
                <SelectItem key={province} value={province as string}>{province as string}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="backdrop-blur-sm bg-white/10 border border-white/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-emerald-500" />
              <div>
                <div className="text-2xl font-bold text-emerald-600">
                  {(analytics.totalStores || (stores as any[]).length).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Total Stores</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="backdrop-blur-sm bg-white/10 border border-white/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold text-blue-600">{analytics.territories || 0}</div>
                <p className="text-xs text-muted-foreground">Territories</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="backdrop-blur-sm bg-white/10 border border-white/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Building2 className="w-5 h-5 text-purple-500" />
              <div>
                <div className="text-2xl font-bold text-purple-600">{analytics.cities || 0}</div>
                <p className="text-xs text-muted-foreground">Cities Covered</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="backdrop-blur-sm bg-white/10 border border-white/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-amber-500" />
              <div>
                <div className="text-2xl font-bold text-amber-600">{(analytics.salesReps || []).length}</div>
                <p className="text-xs text-muted-foreground">Sales Reps</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Controls */}
      <Card className="backdrop-blur-sm bg-white/10 border border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Map className="w-5 h-5 text-emerald-500" />
            Province Distribution Map
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search stores or locations..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                className="pl-10"
              />
            </div>
          </div>

          {/* Province Heatmap Grid */}
          {provinceList.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {provinceList.map(([province, count]) => {
                const max = provinceList[0][1] as number;
                const intensity = Math.round((count as number / max) * 100);
                return (
                  <button
                    key={province}
                    onClick={() => { setSelectedProvince(province === selectedProvince ? "all" : province); setPage(1); }}
                    className={`p-3 rounded-lg border text-left transition-all hover:scale-105 ${
                      selectedProvince === province
                        ? 'border-emerald-500 bg-emerald-500/20 ring-2 ring-emerald-500/30'
                        : 'border-white/10 bg-white/5 hover:border-white/30'
                    }`}
                  >
                    <div className="text-sm font-medium truncate">{province}</div>
                    <div className="text-lg font-bold">{(count as number).toLocaleString()}</div>
                    <div className="w-full bg-gray-700/30 rounded-full h-1.5 mt-1">
                      <div
                        className="bg-emerald-500 h-1.5 rounded-full transition-all"
                        style={{ width: `${intensity}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Filtered Statistics */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">
                {filteredStores.length.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Stores {selectedProvince !== 'all' ? `in ${selectedProvince}` : 'Found'}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {new Set(filteredStores.map((s: any) => s.province)).size}
              </div>
              <div className="text-sm text-muted-foreground">Provinces</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {new Set(filteredStores.map((s: any) => s.city).filter(Boolean)).size}
              </div>
              <div className="text-sm text-muted-foreground">Cities</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Store List */}
      <Card className="backdrop-blur-sm bg-white/10 border border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Store Locations</span>
            <Badge variant="secondary">{filteredStores.length.toLocaleString()} stores</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {storesLoading ? (
            <div className="text-center py-8">Loading stores...</div>
          ) : (
            <div className="space-y-2">
              {filteredStores.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((store: any, index: number) => (
                <div key={store.id || index} className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      store.storeSize === 'large' ? 'bg-emerald-500' :
                      store.storeSize === 'medium' ? 'bg-blue-500' : 'bg-gray-400'
                    }`} />
                    <div>
                      <p className="font-medium">{store.storeName}</p>
                      <p className="text-sm text-muted-foreground">
                        {store.city}{store.city && store.province ? ', ' : ''}{store.province}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{store.storeType}</Badge>
                    <Badge variant="outline" className={`text-xs ${
                      store.creditRating?.startsWith('A') ? 'text-emerald-500 border-emerald-500/30' :
                      store.creditRating?.startsWith('B') ? 'text-blue-500 border-blue-500/30' : 'text-gray-400'
                    }`}>{store.creditRating}</Badge>
                  </div>
                </div>
              ))}
              {filteredStores.length > PAGE_SIZE && (
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <p className="text-sm text-muted-foreground">
                    Page {page} of {Math.ceil(filteredStores.length / PAGE_SIZE)} ({filteredStores.length.toLocaleString()} stores)
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
                    <Button variant="outline" size="sm" disabled={page >= Math.ceil(filteredStores.length / PAGE_SIZE)} onClick={() => setPage(p => p + 1)}>Next</Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}