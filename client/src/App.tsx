import React, { useState } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { FileUpload } from './components/FileUpload';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './components/ui/table';
import { skuAPI, currencyAPI, orderAPI, logisticsAPI, forecastAPI, importAPI } from './services/api';
import { Package, DollarSign, TruckIcon, TrendingUp, Upload } from 'lucide-react';

const queryClient = new QueryClient();

function Dashboard() {
  const [activeView, setActiveView] = useState<'skus' | 'currencies' | 'orders' | 'logistics' | 'forecasts' | 'import'>('import');

  const { data: skus, refetch: refetchSkus } = useQuery({
    queryKey: ['skus'],
    queryFn: async () => {
      const response = await skuAPI.getAll();
      return response.data;
    },
  });

  const { data: currencies } = useQuery({
    queryKey: ['currencies'],
    queryFn: async () => {
      const response = await currencyAPI.getAll();
      return response.data;
    },
  });

  const { data: orders } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const response = await orderAPI.getAll();
      return response.data;
    },
  });

  const { data: logistics } = useQuery({
    queryKey: ['logistics'],
    queryFn: async () => {
      const response = await logisticsAPI.getAll();
      return response.data;
    },
  });

  const { data: forecasts } = useQuery({
    queryKey: ['forecasts'],
    queryFn: async () => {
      const response = await forecastAPI.getAll();
      return response.data;
    },
  });

  const handleSkusUpload = async (file: File) => {
    const response = await importAPI.uploadSkus(file);
    await refetchSkus();
    return response;
  };

  const handleCustomersUpload = async (file: File) => {
    return await importAPI.uploadCustomers(file);
  };

  return (
    <div className="min-h-screen gradient-animated">
      <div className="container mx-auto p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-bold text-white mb-2">
            CornexConnect™ <span className="text-2xl">v2.6</span>
          </h1>
          <p className="text-white/80 text-lg">EPS Cornice Manufacturing Platform</p>
        </motion.div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex space-x-4 mb-6 overflow-x-auto pb-2"
        >
          {[
            { id: 'import', label: 'Import Data', icon: Upload },
            { id: 'skus', label: 'SKUs', icon: Package },
            { id: 'currencies', label: 'Currencies', icon: DollarSign },
            { id: 'orders', label: 'Orders', icon: Package },
            { id: 'logistics', label: 'Logistics', icon: TruckIcon },
            { id: 'forecasts', label: 'AI Forecasts', icon: TrendingUp },
          ].map((nav) => {
            const Icon = nav.icon;
            return (
              <Button
                key={nav.id}
                onClick={() => setActiveView(nav.id as any)}
                variant={activeView === nav.id ? 'default' : 'outline'}
                className={`glass ${activeView === nav.id ? 'bg-white/20' : ''}`}
              >
                <Icon className="mr-2 h-4 w-4" />
                {nav.label}
              </Button>
            );
          })}
        </motion.div>

        {/* Content */}
        <motion.div
          key={activeView}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeView === 'import' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FileUpload
                title="Import SKUs"
                description="Upload Excel or CSV file with SKU data"
                onUpload={handleSkusUpload}
              />
              <FileUpload
                title="Import Customers"
                description="Upload Excel or CSV file with customer data"
                onUpload={handleCustomersUpload}
              />
            </div>
          )}

          {activeView === 'skus' && (
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-white">SKU Management (31+ Products)</CardTitle>
                <CardDescription className="text-white/70">
                  EPS Cornice products inventory
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-white">SKU Code</TableHead>
                      <TableHead className="text-white">Name</TableHead>
                      <TableHead className="text-white">Category</TableHead>
                      <TableHead className="text-white">Price</TableHead>
                      <TableHead className="text-white">Stock</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {skus?.map((sku: any) => (
                      <TableRow key={sku.id}>
                        <TableCell className="text-white font-medium">{sku.sku_code}</TableCell>
                        <TableCell className="text-white">{sku.name}</TableCell>
                        <TableCell className="text-white">{sku.category}</TableCell>
                        <TableCell className="text-white">
                          {sku.currency} {sku.unit_price}
                        </TableCell>
                        <TableCell className="text-white">{sku.stock_quantity}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {(!skus || skus.length === 0) && (
                  <p className="text-center text-white/70 py-8">
                    No SKUs found. Import data to get started.
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {activeView === 'currencies' && (
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-white">Currency Management (190+ Currencies)</CardTitle>
                <CardDescription className="text-white/70">
                  Global currency support with live exchange rates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-white">Code</TableHead>
                      <TableHead className="text-white">Name</TableHead>
                      <TableHead className="text-white">Symbol</TableHead>
                      <TableHead className="text-white">Exchange Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currencies?.map((currency: any) => (
                      <TableRow key={currency.id}>
                        <TableCell className="text-white font-medium">{currency.code}</TableCell>
                        <TableCell className="text-white">{currency.name}</TableCell>
                        <TableCell className="text-white">{currency.symbol}</TableCell>
                        <TableCell className="text-white">{currency.exchange_rate}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {(!currencies || currencies.length === 0) && (
                  <p className="text-center text-white/70 py-8">
                    No currencies configured yet.
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {activeView === 'orders' && (
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-white">Order Management</CardTitle>
                <CardDescription className="text-white/70">
                  Track and manage customer orders
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-white">Order #</TableHead>
                      <TableHead className="text-white">Date</TableHead>
                      <TableHead className="text-white">Status</TableHead>
                      <TableHead className="text-white">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders?.map((order: any) => (
                      <TableRow key={order.id}>
                        <TableCell className="text-white font-medium">{order.order_number}</TableCell>
                        <TableCell className="text-white">
                          {new Date(order.order_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-white">{order.status}</TableCell>
                        <TableCell className="text-white">
                          {order.currency} {order.total_amount}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {(!orders || orders.length === 0) && (
                  <p className="text-center text-white/70 py-8">No orders yet.</p>
                )}
              </CardContent>
            </Card>
          )}

          {activeView === 'logistics' && (
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-white">Logistics (RouteMesh™ & Unitrans)</CardTitle>
                <CardDescription className="text-white/70">
                  Track shipments and deliveries
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-white">Provider</TableHead>
                      <TableHead className="text-white">Tracking #</TableHead>
                      <TableHead className="text-white">Status</TableHead>
                      <TableHead className="text-white">Est. Delivery</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logistics?.map((logistic: any) => (
                      <TableRow key={logistic.id}>
                        <TableCell className="text-white font-medium">{logistic.provider}</TableCell>
                        <TableCell className="text-white">{logistic.tracking_number}</TableCell>
                        <TableCell className="text-white">{logistic.status}</TableCell>
                        <TableCell className="text-white">
                          {logistic.estimated_delivery
                            ? new Date(logistic.estimated_delivery).toLocaleDateString()
                            : 'TBD'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {(!logistics || logistics.length === 0) && (
                  <p className="text-center text-white/70 py-8">No logistics entries yet.</p>
                )}
              </CardContent>
            </Card>
          )}

          {activeView === 'forecasts' && (
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-white">AI Demand Forecasting</CardTitle>
                <CardDescription className="text-white/70">
                  Machine learning powered demand predictions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-white">Forecast Date</TableHead>
                      <TableHead className="text-white">Predicted Demand</TableHead>
                      <TableHead className="text-white">Confidence</TableHead>
                      <TableHead className="text-white">Model</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {forecasts?.map((forecast: any) => (
                      <TableRow key={forecast.id}>
                        <TableCell className="text-white">
                          {new Date(forecast.forecast_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-white">{forecast.predicted_demand}</TableCell>
                        <TableCell className="text-white">{forecast.confidence_level}%</TableCell>
                        <TableCell className="text-white">{forecast.model_version}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {(!forecasts || forecasts.length === 0) && (
                  <p className="text-center text-white/70 py-8">
                    No forecasts generated yet.
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center text-white/60 text-sm"
        >
          <p>CornexConnect™ v2.6 - Pretoria, South Africa</p>
          <p className="mt-1">
            React 18 • TypeScript • Vite • TanStack Query • Tailwind CSS • shadcn/ui • Framer Motion
          </p>
          <p className="mt-1">Express.js • Drizzle ORM • Neon PostgreSQL</p>
        </motion.footer>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Dashboard />
    </QueryClientProvider>
  );
}

export default App;

