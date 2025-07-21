import React, { useEffect, useState } from "react";
import "./Popular.css";
import Item from "../Item/Item"; // ✅ Make sure this path is correct

const Popular = () => {
  const [popularProducts, setPopularProducts] = useState([]);
  const API = process.env.REACT_APP_API_BASE;

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
  }, [API]);

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
