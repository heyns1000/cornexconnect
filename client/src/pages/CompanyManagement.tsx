import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Users, Package, CreditCard, MapPin, Phone, Mail, FileText } from "lucide-react";

interface Distributor {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address?: string;
  city: string;
  region: string;
  country: string;
  currency: string;
  status: string;
  tier: string;
  creditLimit: string;
  currentBalance?: string;
  paymentTerms?: string;
  commissionRate?: string;
  brands?: string[];
  taxNumber?: string;
  registrationNumber?: string;
}

interface Product {
  id: string;
  name: string;
  category: string;
  sku: string;
}

export default function CompanyManagement() {
  const { data: distributors = [], isLoading } = useQuery<Distributor[]>({
    queryKey: ["/api/distributors"],
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const homemartAfrica = distributors.find(d => d.name === "HOMEMART AFRICA");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-emerald-100 p-6 flex items-center justify-center">
        <div className="text-center">Loading company information...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-emerald-100 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto space-y-8"
      >
        {/* Header */}
        <div className="text-center space-y-4">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent"
          >
            Company Management Portal
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-gray-600 text-lg max-w-2xl mx-auto"
          >
            Manage your Cornex™ product access and inventory across all brand lines
          </motion.p>
        </div>

        {homemartAfrica ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-6"
          >
            {/* Company Profile Card */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <Building2 className="h-8 w-8" />
                  {homemartAfrica.name}
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    {homemartAfrica.tier.toUpperCase()}
                  </Badge>
                </CardTitle>
                <CardDescription className="text-emerald-100">
                  Registration: {homemartAfrica.registrationNumber} | Tax No: {homemartAfrica.taxNumber}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Contact Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Users className="h-5 w-5 text-emerald-600" />
                      Contact Details
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span>{homemartAfrica.contactPerson}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span>{homemartAfrica.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span>{homemartAfrica.email}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                        <div>
                          <div>{homemartAfrica.address}</div>
                          <div className="text-gray-600">{homemartAfrica.city}, {homemartAfrica.region}</div>
                          <div className="text-gray-600">{homemartAfrica.country}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Financial Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-emerald-600" />
                      Financial Details
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Credit Limit:</span>
                        <span className="font-semibold text-green-600">
                          {homemartAfrica.currency} {parseFloat(homemartAfrica.creditLimit).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Current Balance:</span>
                        <span className="font-semibold">
                          {homemartAfrica.currency} {parseFloat(homemartAfrica.currentBalance || "0").toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payment Terms:</span>
                        <span className="font-semibold">{homemartAfrica.paymentTerms}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Commission Rate:</span>
                        <span className="font-semibold text-blue-600">{homemartAfrica.commissionRate}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Brand Access */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Package className="h-5 w-5 text-emerald-600" />
                      Brand Access
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {homemartAfrica.brands?.map((brand, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="bg-gradient-to-r from-emerald-50 to-blue-50 border-emerald-200 text-emerald-700"
                        >
                          {brand}
                        </Badge>
                      ))}
                    </div>
                    <div className="text-sm text-gray-600 mt-2">
                      Access to {products.length} total products across all brand lines
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl text-gray-900">Quick Actions</CardTitle>
                <CardDescription>Manage your inventory and orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Button className="h-20 flex-col gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700">
                    <Package className="h-6 w-6" />
                    <span>View Inventory</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2 border-blue-200 hover:bg-blue-50">
                    <FileText className="h-6 w-6 text-blue-600" />
                    <span>Place Order</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2 border-green-200 hover:bg-green-50">
                    <CreditCard className="h-6 w-6 text-green-600" />
                    <span>Payment History</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2 border-purple-200 hover:bg-purple-50">
                    <Users className="h-6 w-6 text-purple-600" />
                    <span>Support</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Product Catalog Summary */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl text-gray-900">Available Products</CardTitle>
                <CardDescription>Your complete Cornex™ product catalog access</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg">
                    <div className="text-3xl font-bold text-emerald-600">
                      {products.filter(p => p.category === 'EPS').length}
                    </div>
                    <div className="text-emerald-700 font-medium">EPS Products</div>
                    <div className="text-sm text-emerald-600 mt-1">EPS01-EPS18 Range</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600">
                      {products.filter(p => p.category === 'BR').length}
                    </div>
                    <div className="text-blue-700 font-medium">BR XPS Products</div>
                    <div className="text-sm text-blue-600 mt-1">BR1-BR13 Range</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                    <div className="text-3xl font-bold text-purple-600">
                      {products.filter(p => p.category === 'LED').length}
                    </div>
                    <div className="text-purple-700 font-medium">LED Products</div>
                    <div className="text-sm text-purple-600 mt-1">Premium LED Range</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-8 text-center">
              <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Company Found</h3>
              <p className="text-gray-600">Homemart Africa registration not found in the system.</p>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
}