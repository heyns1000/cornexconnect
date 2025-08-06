import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Factory, Users, BarChart3, Zap, Shield, Globe } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-blue-600">
                <Factory className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">CornexConnect</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">🍎 Powered by Fruitful Assist AI</p>
              </div>
            </div>
            <Button onClick={() => window.location.href = '/api/login'} size="lg">
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-6">
            🍎 AI-Powered Manufacturing Platform
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Transform Your
            <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent"> Manufacturing </span>
            Operations
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Complete enterprise solution for Cornex brand manufacturing with AI-driven insights, 
            automated production scheduling, and global distribution management.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => window.location.href = '/api/login'} size="lg" className="text-lg px-8 py-3">
              Get Started
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-3">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Comprehensive Manufacturing Intelligence
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            From production planning to global distribution, CornexConnect integrates every aspect 
            of your manufacturing operations.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <CardTitle>Business Intelligence</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Real-time analytics, demand forecasting, and automated insights across all 
                product lines and regions.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                  <Factory className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle>Smart Production</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                AI-powered production scheduling, capacity planning, and automated optimization 
                for maximum efficiency.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                  <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle>Sales Network</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Manage 8500+ hardware stores, optimize sales rep routes, and track performance 
                across South Africa.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                  <Zap className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <CardTitle>Automation Engine</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Automated workflows, intelligent selling capabilities, and proactive 
                maintenance scheduling.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                  <Globe className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle>Global Distribution</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Multi-currency support for 190+ currencies, regional management, and 
                scalable distribution networks.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <CardTitle>Enterprise Security</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Role-based access control, secure authentication, and comprehensive 
                audit trails for enterprise compliance.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center text-gray-600 dark:text-gray-400">
            <p>© 2025 CornexConnect. Powered by 🍎 Fruitful Assist AI Technology.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}