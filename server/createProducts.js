const mongoose = require('mongoose')
const dotenv = require('dotenv')
const Product = require('./models/Product')

dotenv.config()

const sampleProducts = [
  {
    name: 'Wireless Headphones Pro',
    description: 'High-quality wireless headphones with active noise cancellation, 30-hour battery life, and premium sound quality',
    price: 2999,
    originalPrice: 4999,
    category: 'Electronics',
    subCategory: 'Audio',
    images: [
      'https://via.placeholder.com/400?text=Headphones+1',
      'https://via.placeholder.com/400?text=Headphones+2'
    ],
    stock: 50,
    brand: 'AudioPro',
    sku: 'AUDIO-001',
    rating: 4.5,
    reviews: 150,
    discount: 40,
    tags: ['wireless', 'headphones', 'audio', 'noise-cancelling'],
    isActive: true
  },
  {
    name: 'Premium Cotton T-Shirt',
    description: 'Comfortable and breathable 100% cotton t-shirt available in multiple colors. Perfect for casual wear',
    price: 499,
    originalPrice: 799,
    category: 'Clothing',
    subCategory: 'T-Shirts',
    images: [
      'https://via.placeholder.com/400?text=Tshirt+1',
      'https://via.placeholder.com/400?text=Tshirt+2'
    ],
    stock: 150,
    brand: 'FashionHub',
    sku: 'CLOTH-001',
    rating: 4,
    reviews: 80,
    discount: 37,
    tags: ['clothing', 'casual', 'cotton', 'comfortable'],
    isActive: true
  },
  {
    name: 'Organic Coffee Beans',
    description: 'Premium organic coffee beans sourced from the highlands. Rich flavor and aroma. 500g pack',
    price: 599,
    originalPrice: 799,
    category: 'Food',
    subCategory: 'Beverages',
    images: [
      'https://via.placeholder.com/400?text=Coffee+1',
      'https://via.placeholder.com/400?text=Coffee+2'
    ],
    stock: 200,
    brand: 'CoffeeArt',
    sku: 'FOOD-001',
    rating: 4.7,
    reviews: 200,
    discount: 25,
    tags: ['coffee', 'organic', 'beverage', 'premium'],
    isActive: true
  },
  {
    name: 'Modern Desk Lamp',
    description: 'LED desk lamp with adjustable brightness and color temperature. Perfect for work or reading',
    price: 1299,
    originalPrice: 1999,
    category: 'Home',
    subCategory: 'Lighting',
    images: [
      'https://via.placeholder.com/400?text=Lamp+1',
      'https://via.placeholder.com/400?text=Lamp+2'
    ],
    stock: 75,
    brand: 'HomeLights',
    sku: 'HOME-001',
    rating: 4.3,
    reviews: 120,
    discount: 35,
    tags: ['lamp', 'led', 'desk', 'lighting'],
    isActive: true
  },
  {
    name: 'JavaScript Mastery Book',
    description: 'Complete guide to JavaScript programming. Learn ES6+, async/await, and modern frameworks',
    price: 349,
    originalPrice: 549,
    category: 'Books',
    subCategory: 'Programming',
    images: [
      'https://via.placeholder.com/400?text=Book+1',
      'https://via.placeholder.com/400?text=Book+2'
    ],
    stock: 100,
    brand: 'TechPress',
    sku: 'BOOK-001',
    rating: 4.8,
    reviews: 300,
    discount: 36,
    tags: ['book', 'programming', 'javascript', 'learning'],
    isActive: true
  },
  {
    name: 'Yoga Mat Premium',
    description: '6mm thick yoga mat with non-slip surface. Eco-friendly and durable material',
    price: 799,
    originalPrice: 1299,
    category: 'Sports',
    subCategory: 'Yoga',
    images: [
      'https://via.placeholder.com/400?text=Yoga+1',
      'https://via.placeholder.com/400?text=Yoga+2'
    ],
    stock: 60,
    brand: 'FitLife',
    sku: 'SPORT-001',
    rating: 4.6,
    reviews: 95,
    discount: 38,
    tags: ['yoga', 'sports', 'fitness', 'mat'],
    isActive: true
  },
  {
    name: 'Educational Robot Kit',
    description: 'Fun and educational robot kit for kids. Includes sensors, motors, and programming interface',
    price: 1999,
    originalPrice: 2999,
    category: 'Toys',
    subCategory: 'Educational',
    images: [
      'https://via.placeholder.com/400?text=Robot+1',
      'https://via.placeholder.com/400?text=Robot+2'
    ],
    stock: 45,
    brand: 'TechToys',
    sku: 'TOY-001',
    rating: 4.7,
    reviews: 180,
    discount: 33,
    tags: ['toy', 'robot', 'educational', 'kids'],
    isActive: true
  },
  {
    name: 'Organic Face Serum',
    description: 'Natural face serum with vitamin C and hyaluronic acid. Suitable for all skin types',
    price: 649,
    originalPrice: 999,
    category: 'Beauty',
    subCategory: 'Skincare',
    images: [
      'https://via.placeholder.com/400?text=Serum+1',
      'https://via.placeholder.com/400?text=Serum+2'
    ],
    stock: 120,
    brand: 'BeautyNature',
    sku: 'BEAUTY-001',
    rating: 4.5,
    reviews: 210,
    discount: 35,
    tags: ['beauty', 'skincare', 'organic', 'serum'],
    isActive: true
  }
]

async function createProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce')
    console.log('✓ Connected to MongoDB')

    const existingCount = await Product.countDocuments()
    if (existingCount > 0) {
      console.log(`⚠️  Database already contains ${existingCount} products`)
      const answer = await new Promise(resolve => {
        process.stdout.write('Do you want to clear and recreate? (yes/no): ')
        process.stdin.once('data', data => {
          resolve(data.toString().trim().toLowerCase())
        })
      })

      if (answer === 'yes') {
        await Product.deleteMany({})
        console.log('Cleared existing products')
      } else {
        console.log('Aborting...')
        await mongoose.connection.close()
        process.exit(0)
      }
    }

    const result = await Product.insertMany(sampleProducts)
    console.log(`✓ ${result.length} products created successfully!\n`)

    console.log('📦 Products Created:')
    result.forEach((product, idx) => {
      console.log(`${idx + 1}. ${product.name} - ₹${product.price}`)
    })

    console.log('\n=== Product Statistics ===')
    console.log(`Total Products: ${result.length}`)
    console.log(
      `Total Stock: ${sampleProducts.reduce((sum, p) => sum + p.stock, 0)}`
    )
    console.log('==========================\n')

    await mongoose.connection.close()
    process.exit(0)
  } catch (err) {
    console.error('❌ Error creating products:', err.message)
    await mongoose.connection.close()
    process.exit(1)
  }
}

createProducts()
