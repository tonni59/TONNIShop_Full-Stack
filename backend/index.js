const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const path = require("path");
const cors = require("cors");
const fs = require("fs");

const app = express();
const port = 4000;

// Middleware
app.use(express.json());
app.use(cors());

// Ensure upload folder exists
const uploadPath = path.join(__dirname, "upload/images");
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}

// MongoDB Connection
mongoose.connect("mongodb+srv://fahmidaahmedt:tonni1234@cluster0.m0l0pvn.mongodb.net/e-commerce")
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

// Serve image files
app.use('/images', express.static(path.join(__dirname, 'upload/images')));

// Image Upload Endpoint
app.post("/upload", upload.single('product'), (req, res) => {
    res.json({
        success: 1,
        image_url: `http://localhost:${port}/images/${req.file.filename}`
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

// Add Product Endpoint
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
        console.log("✅ Product Saved to MongoDB");

        res.json({ success: true, name: req.body.name });

    } catch (err) {
        console.error("❌ Error while saving product:", err.message);
        res.status(400).json({ success: false, message: err.message });
    }
});

// Delete Product Endpoint
app.post('/removeproduct', async (req, res) => {
    await Product.findOneAndDelete({ id: req.body.id });
    console.log("🗑️ Product Removed");
    res.json({ success: true, name: req.body.name });
});


// Get All Products
app.get('/allproducts', async (req, res) => {
    const products = await Product.find({});
    res.send(products);
});

// Get New Collection
app.get('/newcollections', async (req, res) => {
    const products = await Product.find({}).sort({ date: -1 }).limit(8);
    console.log("📦 New Collections Fetched");
    res.send(products);
});

// Get Popular in Women
app.get('/popularinwomen', async (req, res) => {
    const products = await Product.find({ category: "women" }).limit(4);
    res.send(products);
});

// Get related products by category
app.get('/relatedproducts/:category', async (req, res) => {
    try {
        const category = req.params.category.toLowerCase(); // ensure lowercase
        const products = await Product.find({ category }).limit(6);
        res.send(products);
    } catch (err) {
        console.error("❌ Error fetching related products:", err.message);
        res.status(500).send({ error: err.message });
    }
});




// User Schema
const Users = mongoose.model('Users', {
    name: { type: String },
    email: { type: String, unique: true },
    password: { type: String },
    cartData: { type: Object },
    date: { type: Date, default: Date.now }
});

// Signup Endpoint
app.post('/signup', async (req, res) => {
    const existingUser = await Users.findOne({ email: req.body.email });
    if (existingUser) {
        return res.status(400).json({ success: false, errors: "User with this email already exists" });
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

// Login Endpoint
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await Users.findOne({ email });

    if (!user || user.password !== password) {
        return res.json({ success: false, errors: "Invalid email or password" });
    }

    const token = jwt.sign({ user: { id: user.id } }, 'secret_ecom', { expiresIn: '1h' });
    res.json({ success: true, token });
});

// Auth Middleware
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

// Root
app.get("/", (req, res) => {
    res.send("🚀 Express App is Running");
});

// Start Server
app.listen(port, () => console.log(`✅ Server Running on http://localhost:${port}`));
