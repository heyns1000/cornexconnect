import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Store, MapPin, Users, Search, Filter, Building2, Globe, TrendingUp, BarChart3 } from "lucide-react";
import { PageTransition } from "@/components/PageTransition";
import { useTranslation } from "@/hooks/useTranslation";

export default function HardwareStores() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("all");

  const { data: stores = [], isLoading: storesLoading } = useQuery({
    queryKey: ["/api/hardware-stores"],
  });

  const { data: analytics = {} as any } = useQuery({
    queryKey: ["/api/hardware-stores/analytics"],
  });

  // Filter stores
  const filteredStores = (stores as any[]).filter((store: any) => {
    const matchesSearch = store.storeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         store.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         store.ownerName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProvince = selectedProvince === "all" || store.province === selectedProvince;
    return matchesSearch && matchesProvince;
  });

  const provinceList = analytics.byProvince
    ? Object.entries(analytics.byProvince as Record<string, number>).sort((a, b) => b[1] - a[1])
    : [];

  return (
    <PageTransition>
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
              Hardware Stores Network
            </h1>
            <p className="text-muted-foreground mt-2">
              {analytics.totalStores || (stores as any[]).length} real stores across {analytics.provinces || 9} provinces + {(analytics.internationalRegions || []).length} international regions
            </p>
          </div>
          <div className="flex gap-2">
            <Button className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white">
              <Store className="w-4 h-4 mr-2" />
              Add Store
            </Button>
          </div>
        </div>

        {/* Analytics Cards - Real Data */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="backdrop-blur-sm bg-white/10 border border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Stores</CardTitle>
              <Store className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">
                {(analytics.totalStores || (stores as any[]).length).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">From real client spreadsheets</p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/10 border border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Territories</CardTitle>
              <MapPin className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {analytics.territories || 0}
              </div>
              <p className="text-xs text-muted-foreground">{analytics.cities || 0} cities mapped</p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/10 border border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Retail Groups</CardTitle>
              <Building2 className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {(analytics.retailGroups || []).length}
              </div>
              <p className="text-xs text-muted-foreground">
                {((analytics.retailGroups || []) as string[]).slice(0, 3).join(', ')}
              </p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/10 border border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Potential</CardTitle>
              <TrendingUp className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">
                R{((analytics.totalMonthlyPotential || 0) / 1000000).toFixed(1)}M
              </div>
              <p className="text-xs text-muted-foreground">Combined store potential</p>
            </CardContent>
          </Card>
        </div>

        {/* Province Heatmap */}
        {provinceList.length > 0 && (
          <Card className="backdrop-blur-sm bg-white/10 border border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-emerald-500" />
                Province Distribution Heatmap
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {provinceList.map(([province, count]) => {
                  const max = provinceList[0][1] as number;
                  const intensity = Math.round((count as number / max) * 100);
                  return (
                    <button
                      key={province}
                      onClick={() => setSelectedProvince(province === selectedProvince ? "all" : province)}
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
            </CardContent>
          </Card>
        )}

        {/* Store Type Breakdown */}
        {analytics.byStoreType && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="backdrop-blur-sm bg-white/10 border border-white/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Independent</p>
                    <p className="text-2xl font-bold">{analytics.byStoreType.independent?.toLocaleString()}</p>
                  </div>
                  <Badge variant="outline" className="text-emerald-500 border-emerald-500/30">IND</Badge>
                </div>
              </CardContent>
            </Card>
            <Card className="backdrop-blur-sm bg-white/10 border border-white/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Chain Stores</p>
                    <p className="text-2xl font-bold">{analytics.byStoreType.chain?.toLocaleString()}</p>
                  </div>
                  <Badge variant="outline" className="text-blue-500 border-blue-500/30">CHAIN</Badge>
                </div>
              </CardContent>
            </Card>
            <Card className="backdrop-blur-sm bg-white/10 border border-white/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Franchise</p>
                    <p className="text-2xl font-bold">{analytics.byStoreType.franchise?.toLocaleString()}</p>
                  </div>
                  <Badge variant="outline" className="text-purple-500 border-purple-500/30">FRAN</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Search and Filters */}
        <Card className="backdrop-blur-sm bg-white/10 border border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Store Directory</span>
              <Badge variant="secondary">{filteredStores.length.toLocaleString()} stores</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search stores, locations, or contacts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedProvince} onValueChange={setSelectedProvince}>
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

            {/* Top Territories */}
            {analytics.topTerritories && analytics.topTerritories.length > 0 && selectedProvince === "all" && (
              <div className="flex flex-wrap gap-1.5">
                <span className="text-xs text-muted-foreground py-1">Top territories:</span>
                {(analytics.topTerritories as any[]).slice(0, 8).map((t: any) => (
                  <Badge key={t.territory} variant="outline" className="text-xs">
                    {t.territory} ({t.count})
                  </Badge>
                ))}
              </div>
            )}

            {/* Store List */}
            <div className="space-y-2">
              {storesLoading ? (
                <div className="text-center py-8">Loading stores...</div>
              ) : (
                filteredStores.slice(0, 20).map((store: any, index: number) => (
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
                          {store.ownerName && store.ownerName !== 'Store Owner' ? ` - ${store.ownerName}` : ''}
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
                ))
              )}
              {filteredStores.length > 20 && (
                <p className="text-center text-sm text-muted-foreground py-2">
                  Showing 20 of {filteredStores.length.toLocaleString()} stores. Use search to narrow results.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
