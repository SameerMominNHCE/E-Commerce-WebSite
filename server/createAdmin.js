const mongoose = require('mongoose')
const dotenv = require('dotenv')
const User = require('./models/User')

dotenv.config()

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce')
    console.log('✓ Connected to MongoDB')

    const adminEmail = 'admin@localstore.com'
    const adminPassword = 'admin@123456'
    const adminName = 'Admin User'

    const existingAdmin = await User.findOne({ email: adminEmail })
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!')
      console.log('Email:', existingAdmin.email)
      console.log('Name:', existingAdmin.name)
      await mongoose.connection.close()
      process.exit(0)
    }

    const admin = new User({
      name: adminName,
      email: adminEmail,
      password: adminPassword, // your User model should hash it in pre-save hook
      role: 'admin',
      isVerified: true,
      phone: '+1 (555) 123-4567',
      address: {
        street: '123 Main Street',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'United States'
      }
    })

    await admin.save()
    console.log('✓ Admin user created successfully!')
    console.log('\n=== Admin Credentials ===')
    console.log('📧 Email:', adminEmail)
    console.log('🔑 Password:', adminPassword)
    console.log('👤 Name:', adminName)
    console.log('💼 Role:', admin.role)
    console.log('========================\n')
    console.log('⚠️  IMPORTANT: Please change the password after first login!')
    console.log('📝 You can update it in your profile settings.\n')

    await mongoose.connection.close()
    process.exit(0)
  } catch (err) {
    console.error('❌ Error creating admin:', err.message)
    await mongoose.connection.close()
    process.exit(1)
  }
}

createAdmin()
