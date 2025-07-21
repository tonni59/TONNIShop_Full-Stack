import React, { useEffect, useState } from "react";
import "./NewCollections.css";
import Item from "../Item/Item";

const NewCollections = () => {
  const [newCollections, setNewCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const API = process.env.REACT_APP_API_BASE;

  useEffect(() => {
    const fetchNewCollections = async () => {
      try {
        const res = await fetch(`${API}/newcollections`);
        const data = await res.json();
        setNewCollections(data);
        setError(false);
      } catch (err) {
        console.error("❌ Failed to fetch new collections:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchNewCollections();
  }, [API]);

  return (
    <div className="new-collections">
      <h1>NEW COLLECTIONS</h1>
      <hr />
      {loading && <p>Loading new collections...</p>}
      {error && <p style={{ color: "red" }}>Failed to load collections.</p>}
      <div className="collections">
        {newCollections.map((item) => (
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

export default NewCollections;
