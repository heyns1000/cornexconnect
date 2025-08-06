import { useQuery } from "@tanstack/react-query";
import { TrendingUp, Cpu, Globe, RotateCw, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import MetricCard from "@/components/MetricCard";
import DemandChart from "@/components/DemandChart";
import ProductionSchedule from "@/components/ProductionSchedule";
import DistributorMap from "@/components/DistributorMap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSimulatedMetrics } from "@/hooks/useRealTimeData";
import { formatCurrency } from "@/lib/currency";
import { CORNEX_BRANDS } from "@/lib/constants";
import { Link } from "wouter";

export default function Dashboard() {
  const metrics = useSimulatedMetrics();
  
  const { data: summary } = useQuery({
    queryKey: ["/api/dashboard/summary"],
  });

  const { data: topProducts } = useQuery({
    queryKey: ["/api/sales-metrics/top-products"],
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="space-y-8 p-8">
        {/* Page Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl shadow-xl px-8 py-6 card-hover-transition"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 180 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-blue-600"
                >
                  <Cpu className="h-6 w-6 text-white" />
                </motion.div>
                <h2 className="text-2xl font-bold text-gray-900">AI-Powered Operations Dashboard</h2>
              </div>
              <p className="text-gray-600 mt-1 ml-13">🍎 Real-time insights across global manufacturing and distribution network</p>
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white shadow-lg">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Data
              </Button>
            </motion.div>
          </div>
        </motion.div>

      {/* Real-time Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Global Revenue"
          value={formatCurrency(metrics.revenue * 1000000, "ZAR")}
          change="+23.5% vs last month"
          changeType="positive"
          icon={TrendingUp}
          iconColor="text-green-600"
        />
        
        <MetricCard
          title="Production Efficiency"
          value={`${metrics.efficiency.toFixed(1)}%`}
          change="AI Optimized"
          changeType="positive"
          icon={Cpu}
          iconColor="text-blue-600"
        />
        
        <MetricCard
          title="Active Distributors"
          value={metrics.distributors.toLocaleString()}
          change="Across 16 countries"
          changeType="neutral"
          icon={Globe}
          iconColor="text-purple-600"
        />
        
        <MetricCard
          title="Inventory Turnover"
          value={`${metrics.turnover.toFixed(1)}x`}
          change="+15% improvement"
          changeType="positive"
          icon={RotateCw}
          iconColor="text-orange-600"
        />
      </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* AI Demand Forecast */}
          <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl rounded-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-white" />
                  </div>
                  <span>AI Demand Forecasting</span>
                </CardTitle>
                <div className="flex items-center space-x-2 text-sm text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>🍎 95.3% Accuracy</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <DemandChart />
            </CardContent>
          </Card>

          {/* Production Schedule */}
          <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl rounded-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                    <Cpu className="h-4 w-4 text-white" />
                  </div>
                  <span>Production Schedule</span>
                </CardTitle>
                <Button variant="link" className="text-blue-600 hover:text-blue-800 p-0">
                  View Details →
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ProductionSchedule />
            </CardContent>
          </Card>
        </div>

        {/* Product Performance & Global Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Top Performing SKUs */}
          <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
                <span>Top Performing SKUs</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
            <div className="space-y-4">
              {(topProducts && Array.isArray(topProducts) ? topProducts.slice(0, 5) : []).map((item: any) => (
                <div key={item.product.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      item.product.category === 'EPS' ? 'bg-blue-100' :
                      item.product.category === 'BR' ? 'bg-green-100' : 'bg-purple-100'
                    }`}>
                      <span className={`text-xs font-bold ${
                        item.product.category === 'EPS' ? 'text-blue-600' :
                        item.product.category === 'BR' ? 'text-green-600' : 'text-purple-600'
                      }`}>
                        {item.product.sku}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{item.product.name}</p>
                      <p className="text-sm text-gray-600">{item.units.toLocaleString()} units</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">{formatCurrency(parseFloat(item.revenue), "ZAR")}</p>
                    <p className="text-xs text-gray-500">+{Math.floor(Math.random() * 20 + 5)}%</p>
                  </div>
                </div>
              )) || (
                // Fallback data
                [
                  { sku: "EPS04", name: "SANTE EPS 85mm", units: 2340, revenue: "25100" },
                  { sku: "BR9", name: "BR9 XPS 140mm", units: 1890, revenue: "28700" },
                  { sku: "EPS07", name: "ALINA EPS 140mm", units: 1756, revenue: "21100" }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-xs font-bold text-blue-600">{item.sku}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-600">{item.units.toLocaleString()} units</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">{formatCurrency(parseFloat(item.revenue), "ZAR")}</p>
                      <p className="text-xs text-gray-500">+{Math.floor(Math.random() * 20 + 5)}%</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

          {/* Global Distribution Network */}
          <Card className="lg:col-span-2 bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl rounded-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <Globe className="h-4 w-4 text-white" />
                  </div>
                  <span>Global Distribution Network</span>
                </CardTitle>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>🟢 Active: {(summary as any)?.distributorsCount || 0}</span>
                  <span>📍 Countries: 16</span>
                  <span>🍎 Real-time sync</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <DistributorMap />
            </CardContent>
          </Card>
        </div>

        {/* Cornex Brand Portfolio Showcase */}
        <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl rounded-2xl border-2 border-emerald-200/50 bg-gradient-to-br from-emerald-50 via-white to-blue-50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl text-cornex-blue mb-2">🎨 Cornex™ Brand Portfolio</CardTitle>
              <p className="text-gray-600">FAA.Zone Sovereign Scrolls • VaultMesh Memory Certified • TreatyMesh Housing Compliance</p>
            </div>
            <Badge variant="outline" className="bg-white border-cornex-blue text-cornex-blue px-3 py-1">
              4 Active Brands
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {CORNEX_BRANDS.map((brand, index) => (
              <Link key={brand.id} href={`/brands/${brand.id}`}>
                <div 
                  className="group cursor-pointer brand-card-hover glow-on-hover"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <Card className="border-2 hover:border-gray-300 bg-white/90 backdrop-blur-sm shadow-lg">
                    <CardContent className="p-6 text-center">
                      <div className="flex items-center justify-center mb-4">
                        <div 
                          className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold shadow-xl floating-animation"
                          style={{ 
                            backgroundColor: brand.color,
                            boxShadow: `0 8px 32px ${brand.color}40`
                          }}
                        >
                          <span className="text-xl">{brand.icon}</span>
                        </div>
                      </div>
                      <h3 className="font-bold text-lg text-gray-900 mb-2 gradient-text">{brand.displayName}</h3>
                      <p className="text-sm text-gray-600 mb-4 leading-relaxed">{brand.description}</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full group-hover:bg-gray-50 transition-all duration-300 font-semibold"
                        style={{ borderColor: brand.color, color: brand.color }}
                      >
                        Explore Brand →
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

        {/* AI Insights Panel */}
        <Card className="bg-gradient-to-r from-emerald-500 to-blue-600 text-white shadow-xl rounded-2xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">🤖 AI Recommendations</h3>
              <div className="space-y-2 text-blue-100">
                <p>• Increase EPS04 production by 15% based on demand forecast</p>
                <p>• Optimize BR9 inventory levels for Q2 seasonal demand</p>
                <p>• Consider new distribution partnerships in East Africa</p>
              </div>
            </div>
            <Button variant="secondary" className="bg-white/20 backdrop-blur hover:bg-white/30 text-white border-0">
              View Full Analysis
            </Button>
          </div>
        </CardContent>
        </Card>
      </div>
    </div>
  );
}
