const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const path = require("path");
const cors = require("cors");
const fs = require("fs");
require("dotenv").config(); // Load .env variables

const app = express();
const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/ecommerce";

// Middleware
app.use(express.json());
app.use(cors());

// Ensure upload folder exists
const uploadPath = path.join(__dirname, "upload/images");
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}

// MongoDB Connection
mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.error("❌ MongoDB Error:", err));

// Image storage config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'upload/images');
    },
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage });

// Serve static image files
app.use('/images', express.static(path.join(__dirname, 'upload/images')));

// Image Upload Endpoint
app.post("/upload", upload.single('product'), (req, res) => {
    const imageUrl = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`;
    res.json({
        success: 1,
        image_url: imageUrl
    });
});

// Product Schema
const Product = mongoose.model("Product", {
    id: { type: Number, required: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    category: { type: String, required: true },
    new_price: { type: Number, required: true },
    old_price: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    available: { type: Boolean, default: true }
});

// Add Product
app.post('/addproduct', async (req, res) => {
    try {
        let lastProduct = await Product.findOne().sort({ id: -1 });
        let newId = lastProduct ? lastProduct.id + 1 : 1;

        const product = new Product({
            id: newId,
            name: req.body.name,
            image: req.body.image,
            category: req.body.category,
            new_price: Number(req.body.new_price),
            old_price: Number(req.body.old_price)
        });

        await product.save();
        res.json({ success: true, name: req.body.name });
    } catch (err) {
        console.error("❌ Save Error:", err.message);
        res.status(400).json({ success: false, message: err.message });
    }
});

// Delete Product
app.post('/removeproduct', async (req, res) => {
    await Product.findOneAndDelete({ id: req.body.id });
    res.json({ success: true, name: req.body.name });
});

// Get All Products
app.get('/allproducts', async (req, res) => {
    const products = await Product.find({});
    res.send(products);
});

// Get New Collections
app.get('/newcollections', async (req, res) => {
    const products = await Product.find({}).sort({ date: -1 }).limit(8);
    res.send(products);
});

// Get Popular in Women
app.get('/popularinwomen', async (req, res) => {
    const products = await Product.find({ category: "women" }).limit(4);
    res.send(products);
});

// Related Products
app.get('/relatedproducts/:category', async (req, res) => {
    try {
        const category = req.params.category.toLowerCase();
        const products = await Product.find({ category }).limit(6);
        res.send(products);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// User Schema
const Users = mongoose.model('Users', {
    name: String,
    email: { type: String, unique: true },
    password: String,
    cartData: Object,
    date: { type: Date, default: Date.now }
});

// Signup
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

// Login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await Users.findOne({ email });

    if (!user || user.password !== password) {
        return res.json({ success: false, errors: "Invalid email or password" });
    }

    const token = jwt.sign({ user: { id: user.id } }, 'secret_ecom', { expiresIn: '1h' });
    res.json({ success: true, token });
});

// Middleware for protected routes
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

// Add to Cart
app.post('/addtocart', fetchuser, async (req, res) => {
    const user = await Users.findById(req.user.id);
    user.cartData[req.body.itemId] += 1;
    await Users.findByIdAndUpdate(req.user.id, { cartData: user.cartData });
    res.send("Added");
});

// Root route
app.get("/", (req, res) => {
    res.send("🚀 Express App is Running");
});

// Start Server
app.listen(PORT, () => {
    console.log(`✅ Server Running on http://localhost:${PORT}`);
});
