import React, { useState } from "react";
import './AddProduct.css';
import upload_area from '../../assets/upload_area.png';

const AddProduct = () => {
    const [image, setImage] = useState(null);
    const [productDetails, setProductDetails] = useState({
        name: "",
        image: "",
        category: "women",
        new_price: "",
        old_price: ""
    });

    const imageHandler = (e) => {
        setImage(e.target.files[0]);
    };

    const changeHandler = (e) => {
        setProductDetails({
            ...productDetails,
            [e.target.name]: e.target.value
        });
    };

    const Add_Product = async () => {
        try {
            // Step 1: Upload Image
            let formData = new FormData();
            formData.append('product', image);

            const imageUploadResponse = await fetch('http://localhost:4000/upload', {
                method: 'POST',
                body: formData,
            });

            const imageData = await imageUploadResponse.json();

            if (!imageData.success) {
                alert("Image upload failed");
                return;
            }

            // Step 2: Set image URL and send full product data
            const product = {
                ...productDetails,
                image: imageData.image_url,
                new_price: Number(productDetails.new_price),
                old_price: Number(productDetails.old_price),
            };

            const addProductResponse = await fetch('http://localhost:4000/addproduct', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify(product),
            });

            const result = await addProductResponse.json();

            if (result.success) {
                alert("✅ Product Added Successfully");
                setProductDetails({
                    name: "",
                    image: "",
                    category: "women",
                    new_price: "",
                    old_price: ""
                });
                setImage(null);
            } else {
                alert("❌ Failed to add product");
            }
        } catch (err) {
            console.error("Error adding product:", err);
            alert("❌ An error occurred while adding the product.");
        }
    };

    return (
        <div className="add-product">
            <div className="addproduct-itemfield">
                <p>Product title</p>
                <input
                    value={productDetails.name}
                    onChange={changeHandler}
                    type="text"
                    name="name"
                    placeholder="Type here"
                />
            </div>
            <div className="addproduct-price">
                <div className="addproduct-itemfield">
                    <p>Price</p>
                    <input
                        value={productDetails.old_price}
                        onChange={changeHandler}
                        type="number"
                        name="old_price"
                        placeholder="Old price"
                    />
                </div>
                <div className="addproduct-itemfield">
                    <p>Offer Price</p>
                    <input
                        value={productDetails.new_price}
                        onChange={changeHandler}
                        type="number"
                        name="new_price"
                        placeholder="Offer price"
                    />
                </div>
            </div>
            <div className="addproduct-itemfield">
                <p>Product Category</p>
                <select
                    value={productDetails.category}
                    onChange={changeHandler}
                    name="category"
                    className="add-product-selector"
                >
                    <option value="women">Women</option>
                    <option value="men">Men</option>
                    <option value="kid">Kid</option>
                </select>
            </div>
            <div className="addproduct-itemfield">
                <label htmlFor="file-input">
                    <img
                        src={image ? URL.createObjectURL(image) : upload_area}
                        alt="Upload thumbnail"
                        className="addproduct-thumbnail-img"
                    />
                </label>
                <input
                    type="file"
                    name="image"
                    id="file-input"
                    onChange={imageHandler}
                    hidden
                />
            </div>
            <button onClick={Add_Product} className="addproduct-btn">
                ADD
            </button>
        </div>
    );
};

export default AddProduct;
