const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/store', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).catch(err => console.error('MongoDB connection error:', err));

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  description: String,
  image: String,
});
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  cart: [{ productId: mongoose.Schema.Types.ObjectId, quantity: Number }],
});
const Product = mongoose.model('Product', productSchema);
const User = mongoose.model('User', userSchema);

const JWT_SECRET = 'secretkey';

app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  const user = new User({ username, password: hash, cart: [] });
  await user.save();
  res.json({ message: 'User registered' });
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ userId: user._id }, JWT_SECRET);
  res.json({ token });
});

function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'Unauthorized' });
  const token = header.split(' ')[1];
  try {
    const data = jwt.verify(token, JWT_SECRET);
    req.userId = data.userId;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

app.get('/products', async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

app.get('/products/:id', async (req, res) => {
  const prod = await Product.findById(req.params.id);
  if (!prod) return res.status(404).json({ error: 'Not found' });
  res.json(prod);
});

app.post('/cart/add', auth, async (req, res) => {
  const { productId, quantity } = req.body;
  const user = await User.findById(req.userId);
  const item = user.cart.find(i => i.productId.equals(productId));
  if (item) item.quantity += quantity;
  else user.cart.push({ productId, quantity });
  await user.save();
  res.json({ message: 'Cart updated' });
});

app.get('/cart', auth, async (req, res) => {
  const user = await User.findById(req.userId).populate('cart.productId');
  res.json(user.cart);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log('Server running on', PORT));
