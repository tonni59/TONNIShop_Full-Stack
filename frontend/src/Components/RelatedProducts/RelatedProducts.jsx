import React, { useEffect, useState } from "react";
import "./RelatedProducts.css";
import Item from "../Item/Item";

const RelatedProducts = ({ category, excludeId }) => {
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // 🔗 Direct Render backend URL
  const API = "https://tonnishop-backend-8fr7.onrender.com";

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!category) return;

      try {
        const res = await fetch(`${API}/relatedproducts/${category.toLowerCase()}`);
        const data = await res.json();

        const filtered = excludeId
          ? data.filter((product) => product.id !== excludeId)
          : data;

        setRelatedProducts(filtered);
        setError(false);
      } catch (err) {
        console.error("❌ Related products fetch error:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [category, excludeId]);

  return (
    <div className="relatedproducts">
      <h1>Related Products</h1>
      <hr />
      {loading && <p>Loading related products...</p>}
      {error && <p>❌ Failed to load related products.</p>}

      <div className="relatedproducts-item">
        {!loading && !error && relatedProducts.length === 0 && (
          <p>No related products found.</p>
        )}
        {relatedProducts.map((item) => (
          <Item
            key={item.id}
            id={item.id}
            name={item.name}
            image={item.image}
            new_price={item.new_price}
            old_price={item.old_price}
          />
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;
