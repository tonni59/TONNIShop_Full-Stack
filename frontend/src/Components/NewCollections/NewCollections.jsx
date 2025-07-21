import React, { useState, useEffect } from "react";
import './NewCollections.css';
import Item from '../Item/Item';

const NewCollections = () => {
    const [newCollection, setNewCollection] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchNewCollections = async () => {
            try {
                const res = await fetch(`${process.env.REACT_APP_API_URL}/newcollections`);

                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }

                const data = await res.json();
                console.log("✅ New collections fetched:", data);
                setNewCollection(data);
            } catch (err) {
                console.error("❌ Failed to fetch new collections:", err);
                setError("Failed to load collections.");
            } finally {
                setLoading(false);
            }
        };

        fetchNewCollections();
    }, []);

    return (
        <div className="new-collections">
            <h1>NEW COLLECTIONS</h1>
            <hr />

            {loading && <p>Loading collections...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <div className="collections">
                {!loading && newCollection.length === 0 && !error && (
                    <p>No new collections found.</p>
                )}

                {newCollection.map((item, i) =>
                    item && item.image ? (
                        <Item
                            key={item.id || i}
                            id={item.id}
                            name={item.name}
                            image={item.image}
                            new_price={item.new_price}
                            old_price={item.old_price}
                        />
                    ) : (
                        <p key={i} style={{ color: "red" }}>
                            Skipping invalid product (missing image or data).
                        </p>
                    )
                )}
            </div>
        </div>
    );
};

export default NewCollections;
