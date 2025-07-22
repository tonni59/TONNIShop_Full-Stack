import React, { useEffect, useState } from "react";
import "./Popular.css";
import Item from "../Item/Item";

const Popular = () => {
  const [popularProducts, setPopularProducts] = useState([]);

  // 🔗 Direct Render backend URL
  const API = "https://tonnishop-backend-8fr7.onrender.com";

  useEffect(() => {
    const fetchPopular = async () => {
      try {
        const response = await fetch(`${API}/popularinwomen`);
        const data = await response.json();
        setPopularProducts(data);
        console.log("✅ Popular products fetched:", data);
      } catch (error) {
        console.error("❌ Failed to load popular products:", error);
      }
    };

    fetchPopular();
  }, []);

  return (
    <div className="popular">
      <h1>POPULAR IN WOMEN</h1>
      <hr />
      <div className="popular-item">
        {popularProducts.length > 0 ? (
          popularProducts.map((item, i) => (
            <Item
              key={i}
              id={item.id}
              name={item.name}
              image={item.image}
              new_price={item.new_price}
              old_price={item.old_price}
            />
          ))
        ) : (
          <p style={{ color: "gray", marginTop: "2rem" }}>
            No popular items found.
          </p>
        )}
      </div>
    </div>
  );
};

export default Popular;
