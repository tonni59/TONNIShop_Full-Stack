// -------------------- Imports --------------------
const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const path = require("path");
const cors = require("cors");
const fs = require("fs");
require("dotenv").config();

// -------------------- Constants --------------------
const app = express();
const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/ecommerce";
const BASE_URL = "https://tonnishop-backend-8fr7.onrender.com";

// -------------------- Middleware --------------------
app.use(express.json());
app.use(cors());

// Ensure upload folder exists
const uploadPath = path.join(__dirname, "upload/images");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// -------------------- MongoDB Connection --------------------
mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Error:", err));

// -------------------- Image Upload Config --------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'upload/images'),
  filename: (req, file, cb) =>
    cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage });

// -------------------- Static Files --------------------
app.use('/images', express.static(path.join(__dirname, 'upload/images')));

// -------------------- Helpers --------------------
const fixImageURL = (product) => {
  if (product.image && product.image.includes("localhost")) {
    product.image = product.image.replace("http://localhost:4000", BASE_URL);
  }
  return product;
};

// -------------------- Schemas --------------------
const Product = mongoose.model("Product", {
  id: Number,
  name: String,
  image: String,
  category: String,
  new_price: Number,
  old_price: Number,
  date: { type: Date, default: Date.now },
  available: { type: Boolean, default: true }
});

const Users = mongoose.model("Users", {
  name: String,
  email: { type: String, unique: true },
  password: String,
  cartData: Object,
  date: { type: Date, default: Date.now }
});

// -------------------- Routes --------------------

app.post("/upload", upload.single('product'), (req, res) => {
  const imageUrl = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`;
  res.json({ success: 1, image_url: imageUrl });
});

app.post('/addproduct', async (req, res) => {
  try {
    const lastProduct = await Product.findOne().sort({ id: -1 });
    const newId = lastProduct ? lastProduct.id + 1 : 1;

    const product = new Product({
      id: newId,
      name: req.body.name,
      image: req.body.image,
      category: req.body.category,
      new_price: Number(req.body.new_price),
      old_price: Number(req.body.old_price),
      available: req.body.available !== undefined ? req.body.available : true,
      date: new Date()
    });

    await product.save();
    res.json({ success: true, name: req.body.name });
  } catch (err) {
    console.error("❌ Save Error:", err.message);
    res.status(400).json({ success: false, message: err.message });
  }
});

app.post('/removeproduct', async (req, res) => {
  await Product.findOneAndDelete({ id: req.body.id });
  res.json({ success: true, name: req.body.name });
});

app.get('/allproducts', async (req, res) => {
  const products = await Product.find({});
  res.send(products.map(fixImageURL));
});

app.get('/newcollections', async (req, res) => {
  const products = await Product.find({}).sort({ date: -1 }).limit(8);
  res.send(products.map(fixImageURL));
});

app.get('/popularinwomen', async (req, res) => {
  const products = await Product.find({ category: { $regex: new RegExp("women", "i") } }).limit(4);
  res.send(products.map(fixImageURL));
});

app.get('/relatedproducts/:category', async (req, res) => {
  try {
    const category = req.params.category;
    const products = await Product.find({ category: { $regex: new RegExp(category, "i") } }).limit(6);
    res.send(products.map(fixImageURL));
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

app.post('/signup', async (req, res) => {
  const existingUser = await Users.findOne({ email: req.body.email });
  if (existingUser) {
    return res.status(400).json({ success: false, errors: "User already exists" });
  }

  let cart = {};
  for (let i = 0; i < 300; i++) cart[i] = 0;

  const user = new Users({
    name: req.body.username,
    email: req.body.email,
    password: req.body.password,
    cartData: cart
  });

  await user.save();
  const token = jwt.sign({ user: { id: user.id } }, 'secret_ecom');
  res.json({ success: true, token });
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await Users.findOne({ email });

  if (!user || user.password !== password) {
    return res.json({ success: false, errors: "Invalid email or password" });
  }

  const token = jwt.sign({ user: { id: user.id } }, 'secret_ecom', { expiresIn: '1h' });
  res.json({ success: true, token });
});

const fetchuser = (req, res, next) => {
  const token = req.header('auth-token');
  if (!token) return res.status(401).json({ errors: "Token missing" });

  try {
    const data = jwt.verify(token, 'secret_ecom');
    req.user = data.user;
    next();
  } catch {
    res.status(401).json({ errors: "Invalid token" });
  }
};

app.post('/addtocart', fetchuser, async (req, res) => {
  const user = await Users.findById(req.user.id);
  user.cartData[req.body.itemId] += 1;
  await Users.findByIdAndUpdate(req.user.id, { cartData: user.cartData });
  res.send("Added");
});

app.get("/", (req, res) => {
  res.send("🚀 TONNIShop Backend is Running");
});

// -------------------- Start Server --------------------
app.listen(PORT, () => {
  console.log(`✅ Server Running on http://localhost:${PORT}`);
});
