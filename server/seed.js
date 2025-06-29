const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/store', { useNewUrlParser: true, useUnifiedTopology: true });

const productSchema = new mongoose.Schema({ name: String, price: Number, description: String, image: String });
const Product = mongoose.model('Product', productSchema);

async function seed() {
  await Product.deleteMany({});
  await Product.insertMany([
    { name: 'Product 1', price: 10, description: 'Description 1', image: 'image1.jpg' },
    { name: 'Product 2', price: 20, description: 'Description 2', image: 'image2.jpg' },
    { name: 'Product 3', price: 30, description: 'Description 3', image: 'image3.jpg' },
    { name: 'Product 4', price: 40, description: 'Description 4', image: 'image4.jpg' },
    { name: 'Product 5', price: 50, description: 'Description 5', image: 'image5.jpg' },
    { name: 'Product 6', price: 60, description: 'Description 6', image: 'image6.jpg' },
  ]);
  console.log('Database seeded');
  mongoose.disconnect();
}

seed();
