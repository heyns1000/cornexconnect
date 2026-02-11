import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Store, MapPin, Users, Search, Building2, TrendingUp,
  Globe, BarChart3, UserCheck, CheckCircle2,
  Mail, Calendar
} from "lucide-react";
import { PageTransition } from "@/components/PageTransition";
import { useTranslation } from "@/hooks/useTranslation";
import {
  getAllStores,
  getStats,
  getSAProvinces,
  getInternationalRegions,
  getRetailGroups,
  getSalesReps,
  getRepPerformance,
  getTop40Customers,
  searchStores,
  PROVINCE_COLORS,
  type Store as StoreType
} from "@/data/clientDataService";

export default function HardwareStores() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("all");
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [selectedRep, setSelectedRep] = useState("all");
  const [selectedTab, setSelectedTab] = useState("overview");

  const stats = useMemo(() => getStats(), []);
  const saProvinces = useMemo(() => getSAProvinces(), []);
  const intlRegions = useMemo(() => getInternationalRegions(), []);
  const retailGroups = useMemo(() => getRetailGroups(), []);
  const salesReps = useMemo(() => getSalesReps(), []);
  const repPerformance = useMemo(() => getRepPerformance(), []);
  const top40 = useMemo(() => getTop40Customers(), []);

  // Filter stores
  const filteredStores = useMemo(() => {
    let results = searchTerm ? searchStores(searchTerm) : getAllStores();
    if (selectedProvince !== "all") {
      results = results.filter(s => s.normalizedProvince === selectedProvince);
    }
    if (selectedGroup !== "all") {
      results = results.filter(s => s.group.toLowerCase().includes(selectedGroup.toLowerCase()));
    }
    if (selectedRep !== "all") {
      results = results.filter(s => s.repName.toLowerCase() === selectedRep.toLowerCase());
    }
    return results;
  }, [searchTerm, selectedProvince, selectedGroup, selectedRep]);

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
              {stats.totalStores.toLocaleString()} real stores across {stats.totalProvinces} SA provinces + {stats.internationalRegions} African countries
            </p>
          </div>
          <Badge variant="outline" className="text-emerald-600 border-emerald-300 px-3 py-1">
            Live Data from Homemart Spreadsheets
          </Badge>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card className="backdrop-blur-sm bg-white/10 border border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="h-4 w-4 text-emerald-500" />
                <span className="text-xs text-muted-foreground">Total Stores</span>
              </div>
              <div className="text-2xl font-bold text-emerald-600">{stats.totalStores.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card className="backdrop-blur-sm bg-white/10 border border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-xs text-muted-foreground">Active</span>
              </div>
              <div className="text-2xl font-bold text-green-600">{stats.activeStores.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card className="backdrop-blur-sm bg-white/10 border border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-blue-500" />
                <span className="text-xs text-muted-foreground">Sales Reps</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">{stats.totalSalesReps}</div>
            </CardContent>
          </Card>
          <Card className="backdrop-blur-sm bg-white/10 border border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="h-4 w-4 text-purple-500" />
                <span className="text-xs text-muted-foreground">Territories</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">{stats.totalTerritories.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card className="backdrop-blur-sm bg-white/10 border border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Store className="h-4 w-4 text-orange-500" />
                <span className="text-xs text-muted-foreground">Retail Groups</span>
              </div>
              <div className="text-2xl font-bold text-orange-600">{stats.totalRetailGroups}</div>
            </CardContent>
          </Card>
          <Card className="backdrop-blur-sm bg-white/10 border border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Globe className="h-4 w-4 text-cyan-500" />
                <span className="text-xs text-muted-foreground">Countries</span>
              </div>
              <div className="text-2xl font-bold text-cyan-600">{stats.internationalRegions + 1}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Province Heatmap</TabsTrigger>
            <TabsTrigger value="stores">Store Directory</TabsTrigger>
            <TabsTrigger value="reps">Sales Reps</TabsTrigger>
            <TabsTrigger value="groups">Retail Groups</TabsTrigger>
            <TabsTrigger value="top40">Top 40 Clients</TabsTrigger>
          </TabsList>

          {/* PROVINCE HEATMAP TAB */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 backdrop-blur-sm bg-white/10 border border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-emerald-500" />
                    South African Provinces
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {saProvinces.map(p => {
                    const pct = Math.round((p.storeCount / stats.totalStores) * 100);
                    const color = PROVINCE_COLORS[p.name] || '#6b7280';
                    return (
                      <div key={p.name} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                            <span className="font-medium text-sm">{p.name}</span>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span>{p.storeCount} stores</span>
                            <span>{p.cityCount} cities</span>
                            <Badge variant="outline" className="text-xs">{pct}%</Badge>
                          </div>
                        </div>
                        <Progress value={pct * 3.3} className="h-2" />
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card className="backdrop-blur-sm bg-white/10 border border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="w-5 h-5 text-cyan-500" />
                      African Expansion
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {intlRegions.map(r => (
                      <div key={r.name} className="flex items-center justify-between py-1">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PROVINCE_COLORS[r.name] || '#6b7280' }} />
                          <span className="text-sm">{r.name}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">{r.storeCount} stores</Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="backdrop-blur-sm bg-white/10 border border-white/20">
                  <CardHeader>
                    <CardTitle className="text-sm">Store Type Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Independent</span>
                      <span className="font-medium">{stats.independentStores.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Franchise</span>
                      <span className="font-medium">{stats.franchiseStores.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Chain</span>
                      <span className="font-medium">{stats.chainStores.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Wholesalers</span>
                      <span className="font-medium">{stats.wholesalers}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* STORE DIRECTORY TAB */}
          <TabsContent value="stores" className="space-y-4">
            <Card className="backdrop-blur-sm bg-white/10 border border-white/20">
              <CardContent className="p-4">
                <div className="flex gap-3 flex-wrap">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Search stores, cities, reps, groups..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={selectedProvince} onValueChange={setSelectedProvince}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="All Provinces" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Provinces</SelectItem>
                      {saProvinces.map(p => (
                        <SelectItem key={p.name} value={p.name}>{p.name} ({p.storeCount})</SelectItem>
                      ))}
                      {intlRegions.map(r => (
                        <SelectItem key={r.name} value={r.name}>{r.name} ({r.storeCount})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedRep} onValueChange={setSelectedRep}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="All Reps" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Reps</SelectItem>
                      {salesReps.map(r => (
                        <SelectItem key={r.empId} value={r.name}>{r.name} ({r.storeCount})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  Showing {filteredStores.length.toLocaleString()} of {stats.totalStores.toLocaleString()} stores
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-white/10 border border-white/20">
              <CardContent className="p-0">
                <div className="max-h-[600px] overflow-y-auto">
                  {filteredStores.slice(0, 100).map((store, index) => (
                    <StoreRow key={store.storeCode} store={store} index={index} />
                  ))}
                </div>
                {filteredStores.length > 100 && (
                  <div className="p-4 text-center text-sm text-muted-foreground border-t">
                    Showing first 100 of {filteredStores.length.toLocaleString()} results. Use filters to narrow down.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* SALES REPS TAB */}
          <TabsContent value="reps" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {repPerformance.map(rep => (
                <Card key={rep.empId} className="backdrop-blur-sm bg-white/10 border border-white/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-5 h-5 text-emerald-500" />
                        <span className="font-bold">{rep.name}</span>
                      </div>
                      <Badge variant="outline">{rep.empId}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Stores:</span>
                        <span className="ml-1 font-medium">{rep.totalStores}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Active:</span>
                        <span className="ml-1 font-medium">{rep.activeStores}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Visit Rate:</span>
                        <span className="ml-1 font-medium">{rep.visitRate}%</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Regions:</span>
                        <span className="ml-1 font-medium">{rep.provinces.length}</span>
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {rep.provinces.slice(0, 4).map(p => (
                        <Badge key={p} variant="secondary" className="text-xs">{p}</Badge>
                      ))}
                      {rep.provinces.length > 4 && (
                        <Badge variant="secondary" className="text-xs">+{rep.provinces.length - 4}</Badge>
                      )}
                    </div>
                    <Progress value={rep.visitRate} className="h-1.5 mt-3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* RETAIL GROUPS TAB */}
          <TabsContent value="groups" className="space-y-4">
            <Card className="backdrop-blur-sm bg-white/10 border border-white/20">
              <CardContent className="p-4 space-y-3">
                {retailGroups.slice(0, 25).map((group, index) => {
                  const pct = Math.round((group.storeCount / stats.totalStores) * 100);
                  return (
                    <div key={group.name} className="flex items-center gap-4">
                      <div className="w-6 text-center text-sm text-muted-foreground">{index + 1}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">{group.name}</span>
                          <span className="text-sm text-muted-foreground">{group.storeCount} stores ({pct}%)</span>
                        </div>
                        <Progress value={pct * 3} className="h-1.5" />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TOP 40 TAB */}
          <TabsContent value="top40" className="space-y-4">
            <Card className="backdrop-blur-sm bg-white/10 border border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-amber-500" />
                  Top 40 Priority Customers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {top40.map(customer => (
                  <div key={customer.rank} className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-white/5">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center font-bold">
                        {customer.rank}
                      </Badge>
                      <div>
                        <p className="font-medium">{customer.companyName}</p>
                        <p className="text-sm text-muted-foreground">{customer.province}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {customer.corniceManufacturer && (
                        <Badge variant="secondary" className="text-xs">CM: {customer.corniceManufacturer}</Badge>
                      )}
                      {customer.lastInvoiceDate && (
                        <Badge variant="outline" className="text-xs">
                          <Calendar className="w-3 h-3 mr-1" />
                          {customer.lastInvoiceDate}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageTransition>
  );
}

function StoreRow({ store, index }: { store: StoreType; index: number }) {
  const provinceColor = PROVINCE_COLORS[store.normalizedProvince] || '#6b7280';

  return (
    <div className={`flex items-center justify-between p-3 border-b border-white/5 ${index % 2 === 0 ? 'bg-white/[0.02]' : ''} hover:bg-white/5 transition-colors`}>
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-2 h-8 rounded-full" style={{ backgroundColor: provinceColor }} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="font-medium text-sm truncate">{store.storeName}</p>
            {store.isWholesaler && <Badge variant="secondary" className="text-xs">Wholesale</Badge>}
            {!store.isActive && <Badge variant="destructive" className="text-xs">Inactive</Badge>}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3" />
            <span>{store.city}, {store.normalizedProvince}</span>
            {store.streetAddress && <span className="truncate max-w-[200px]">| {store.streetAddress}</span>}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {store.group && (
          <Badge variant="outline" className="text-xs">{store.group}</Badge>
        )}
        {store.repName && (
          <Badge variant="secondary" className="text-xs">
            <UserCheck className="w-3 h-3 mr-1" />
            {store.repName}
          </Badge>
        )}
        {store.email && <Mail className="w-3 h-3 text-muted-foreground" />}
      </div>
    </div>
  );
}
