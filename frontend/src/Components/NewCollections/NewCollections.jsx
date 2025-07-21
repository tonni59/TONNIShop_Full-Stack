import React, { useState, useEffect } from "react";
import './NewCollections.css';
import Item from '../Item/Item';

const NewCollections = () => {
    const [new_collection, setNew_collection] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchNewCollections = async () => {
            try {
                const res = await fetch("http://localhost:4000/newcollections");

                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }

                const data = await res.json();
                console.log("Fetched new collections:", data);
                setNew_collection(data);
            } catch (err) {
                console.error("Failed to fetch new collections:", err);
                setError(true);
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
            {error && <p>Failed to load collections. Please check your backend.</p>}

            <div className="collections">
                {!loading && new_collection.length === 0 && !error && (
                    <p>No new collections found.</p>
                )}

                {new_collection.map((item, i) => (
                    item && item.image ? (
                        <Item
                            key={i}
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
                ))}
            </div>
        </div>
    );
};

export default NewCollections;
