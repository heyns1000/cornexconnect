import { db } from "./db";
import { products } from "../shared/schema";

const cornexProducts = [
  // EPS Premium Range (13 products)
  { sku: "EPS01", name: "EPS Cornice 55mm", category: "EPS", dimensions: "55mm x 55mm", basePrice: "8.63", costPrice: "6.47", description: "Premium polystyrene cornice, ideal for small rooms" },
  { sku: "EPS02", name: "EPS Cornice 70mm", category: "EPS", dimensions: "70mm x 70mm", basePrice: "9.85", costPrice: "7.39", description: "Medium-sized EPS cornice for standard installations" },
  { sku: "EPS03", name: "EPS Cornice 90mm", category: "EPS", dimensions: "90mm x 90mm", basePrice: "11.20", costPrice: "8.40", description: "Large EPS cornice for spacious areas" },
  { sku: "EPS04", name: "EPS Cornice 110mm", category: "EPS", dimensions: "110mm x 110mm", basePrice: "13.45", costPrice: "10.09", description: "Extra large EPS cornice for commercial spaces" },
  { sku: "EPS05", name: "EPS Cornice 130mm", category: "EPS", dimensions: "130mm x 130mm", basePrice: "15.70", costPrice: "11.78", description: "Premium large EPS cornice" },
  { sku: "EPS06", name: "EPS Cornice 150mm", category: "EPS", dimensions: "150mm x 150mm", basePrice: "17.95", costPrice: "13.46", description: "Commercial grade EPS cornice" },
  { sku: "EPS07", name: "EPS Cornice 175mm", category: "EPS", dimensions: "175mm x 175mm", basePrice: "18.58", costPrice: "13.94", description: "Largest EPS cornice in range" },
  { sku: "EPS08", name: "EPS Corner 55mm", category: "EPS", dimensions: "55mm corner", basePrice: "4.20", costPrice: "3.15", description: "Corner piece for 55mm EPS cornice" },
  { sku: "EPS09", name: "EPS Corner 70mm", category: "EPS", dimensions: "70mm corner", basePrice: "4.85", costPrice: "3.64", description: "Corner piece for 70mm EPS cornice" },
  { sku: "EPS10", name: "EPS Corner 90mm", category: "EPS", dimensions: "90mm corner", basePrice: "5.50", costPrice: "4.13", description: "Corner piece for 90mm EPS cornice" },
  { sku: "EPS11", name: "EPS End Cap 55mm", category: "EPS", dimensions: "55mm end cap", basePrice: "3.20", costPrice: "2.40", description: "End cap for 55mm EPS cornice" },
  { sku: "EPS12", name: "EPS End Cap 70mm", category: "EPS", dimensions: "70mm end cap", basePrice: "3.85", costPrice: "2.89", description: "End cap for 70mm EPS cornice" },
  { sku: "EPS13", name: "EPS Junction 90mm", category: "EPS", dimensions: "90mm junction", basePrice: "6.75", costPrice: "5.06", description: "Junction piece for 90mm EPS cornice" },

  // BR XPS Budget Range (13 products)
  { sku: "BR01", name: "BR XPS Cornice 55mm", category: "BR", dimensions: "55mm x 55mm", basePrice: "6.90", costPrice: "5.18", description: "High-density XPS cornice for professional use" },
  { sku: "BR02", name: "BR XPS Cornice 70mm", category: "BR", dimensions: "70mm x 70mm", basePrice: "8.45", costPrice: "6.34", description: "Professional grade XPS cornice" },
  { sku: "BR03", name: "BR XPS Cornice 90mm", category: "BR", dimensions: "90mm x 90mm", basePrice: "10.20", costPrice: "7.65", description: "Large XPS cornice with superior finish" },
  { sku: "BR04", name: "BR XPS Cornice 110mm", category: "BR", dimensions: "110mm x 110mm", basePrice: "12.80", costPrice: "9.60", description: "Extra large XPS cornice" },
  { sku: "BR05", name: "BR XPS Cornice 130mm", category: "BR", dimensions: "130mm x 130mm", basePrice: "15.40", costPrice: "11.55", description: "Premium XPS cornice for luxury installations" },
  { sku: "BR06", name: "BR XPS Cornice 150mm", category: "BR", dimensions: "150mm x 150mm", basePrice: "18.90", costPrice: "14.18", description: "Commercial XPS cornice" },
  { sku: "BR07", name: "BR XPS Cornice 170mm", category: "BR", dimensions: "170mm x 170mm", basePrice: "21.50", costPrice: "16.13", description: "Largest XPS cornice in range" },
  { sku: "BR08", name: "BR XPS Corner 55mm", category: "BR", dimensions: "55mm corner", basePrice: "3.95", costPrice: "2.96", description: "Corner piece for 55mm XPS cornice" },
  { sku: "BR09", name: "BR XPS Corner 70mm", category: "BR", dimensions: "70mm corner", basePrice: "4.60", costPrice: "3.45", description: "Corner piece for 70mm XPS cornice" },
  { sku: "BR10", name: "BR XPS Corner 90mm", category: "BR", dimensions: "90mm corner", basePrice: "5.25", costPrice: "3.94", description: "Corner piece for 90mm XPS cornice" },
  { sku: "BR11", name: "BR XPS End Cap 55mm", category: "BR", dimensions: "55mm end cap", basePrice: "2.95", costPrice: "2.21", description: "End cap for 55mm XPS cornice" },
  { sku: "BR12", name: "BR XPS End Cap 70mm", category: "BR", dimensions: "70mm end cap", basePrice: "3.60", costPrice: "2.70", description: "End cap for 70mm XPS cornice" },
  { sku: "BR13", name: "BR XPS Junction 90mm", category: "BR", dimensions: "90mm junction", basePrice: "6.25", costPrice: "4.69", description: "Junction piece for 90mm XPS cornice" },

  // LED Ready Series (8 products)  
  { sku: "LED01", name: "LED Ready Cornice 40mm", category: "LED", dimensions: "40mm x 60mm", basePrice: "15.90", costPrice: "11.93", description: "Compact LED-ready cornice for accent lighting" },
  { sku: "LED02", name: "LED Ready Cornice 60mm", category: "LED", dimensions: "60mm x 80mm", basePrice: "18.75", costPrice: "14.06", description: "Standard LED-ready cornice" },
  { sku: "LED03", name: "LED Ready Cornice 80mm", category: "LED", dimensions: "80mm x 100mm", basePrice: "22.40", costPrice: "16.80", description: "Large LED-ready cornice for main lighting" },
  { sku: "LED04", name: "LED Ready Cornice 100mm", category: "LED", dimensions: "100mm x 120mm", basePrice: "26.85", costPrice: "20.14", description: "Extra large LED-ready cornice" },
  { sku: "LED05", name: "LED Ready Cornice 120mm", category: "LED", dimensions: "120mm x 140mm", basePrice: "29.90", costPrice: "22.43", description: "Premium LED-ready cornice" },
  { sku: "LED06", name: "LED Ready Cornice 145mm", category: "LED", dimensions: "145mm x 165mm", basePrice: "32.75", costPrice: "24.56", description: "Largest LED-ready cornice" },
  { sku: "LED07", name: "LED Corner 60mm", category: "LED", dimensions: "60mm LED corner", basePrice: "8.90", costPrice: "6.68", description: "Corner piece for 60mm LED cornice" },
  { sku: "LED08", name: "LED Diffuser Strip 2m", category: "LED", dimensions: "2000mm diffuser", basePrice: "45.00", costPrice: "33.75", description: "LED diffuser strip for smooth light distribution" }
];

export async function restoreProducts() {
  try {
    console.log('🔄 Restoring Cornex product catalog...');
    
    // Clear existing products first
    await db.delete(products);
    console.log('✅ Cleared existing products');
    
    // Insert all products
    for (const product of cornexProducts) {
      await db.insert(products).values({
        ...product,
        subcategory: product.category === 'EPS' ? 'Premium' : product.category === 'BR' ? 'Budget' : 'Ready',
        packSize: 1,
        packsPerBox: product.category === 'LED' ? 5 : 10,
        weight: '0.500',
        specifications: {
          material: product.category === 'EPS' ? 'Expanded Polystyrene' : product.category === 'BR' ? 'Extruded Polystyrene' : 'LED-Compatible Polystyrene',
          density: product.category === 'EPS' ? '15kg/m³' : product.category === 'BR' ? '35kg/m³' : '25kg/m³',
          fireRating: 'Class E',
          installation: 'Adhesive mounting recommended'
        },
        isActive: true
      });
    }
    
    console.log(`✅ Successfully restored ${cornexProducts.length} products`);
    console.log('📊 Product breakdown:');
    console.log(`   • EPS Premium Range: ${cornexProducts.filter(p => p.category === 'EPS').length} products`);
    console.log(`   • BR XPS Budget Range: ${cornexProducts.filter(p => p.category === 'BR').length} products`);
    console.log(`   • LED Ready Series: ${cornexProducts.filter(p => p.category === 'LED').length} products`);
    
    return true;
  } catch (error) {
    console.error('❌ Error restoring products:', error);
    return false;
  }
}