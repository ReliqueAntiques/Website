// src/components/Products.jsx
import React, { useEffect, useState } from 'react';
import { databases } from '../appwrite'; // Import from appwrite.js

const DATABASE_ID = 'your_database_id'; // Replace with your Appwrite database ID
const COLLECTION_ID = 'your_collection_id'; // Replace with your Appwrite collection ID

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID);
        setProducts(response.documents);
      } catch (err) {
        setError('Error fetching products');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h2>Products</h2>
      <div className="product-list">
        {products.map((product) => (
          <div key={product.$id} className="product">
            <img src={product.imageUrl} alt={product.name} />
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <p>Price: £{product.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Products;
