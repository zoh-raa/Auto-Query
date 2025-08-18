import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CartContext } from '../contexts/CartContext';
import toast from 'react-hot-toast';

const BrandPage = () => {
  const { brandName } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const fetchBrandProducts = async () => {
      try {
        const res = await fetch(`http://localhost:3001/product/search?query=${brandName}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setProducts(data);
        } else if (data && data.length) {
          setProducts(data);
        } else if (data && data.products) {
          setProducts(data.products);
        } else {
          setProducts([]);
        }
      } catch (err) {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBrandProducts();
  }, [brandName]);

  const handleProductClick = (product) => {
    navigate(`/product/${product.productId}`);
  };

  const handleAddToCart = (product, event) => {
    event.stopPropagation();
    addToCart({
      productId: product.productId,
      name: product.productName,
      // Ensure price is a number
      price: Number(product.price),
      image: product.imageUrl, // for CartPage compatibility
      imageUrl: product.imageUrl,
      quantity: 1
    });
    toast.success(`${product.productName} added to cart!`, {
      duration: 3000,
      icon: '🛒'
    });
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Products for {brandName}</h1>
      {products.length === 0 ? (
        <p>No products found for this brand.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {products.map((product) => (
            <div key={product.productId} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '16px', backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', cursor: 'pointer' }} onClick={() => handleProductClick(product)}>
              <h2 style={{ color: '#333', marginBottom: '10px' }}>{product.productName}</h2>
              <img
                src={
                  product.imageUrl
                    ? product.imageUrl.startsWith('/images/')
                      ? product.imageUrl
                      : `http://localhost:3001/images/${product.imageUrl}`
                    : '/images/no-image.png'
                }
                alt={product.productName}
                style={{ width: '100%', height: '200px', objectFit: 'contain', borderRadius: '4px', marginBottom: '10px' }}
              />
              <p>{product.productDescription}</p>
              <p style={{ color: 'red', fontWeight: 'bold' }}>${product.price}</p>
              <button onClick={(e) => handleAddToCart(product, e)} style={{ width: '100%', padding: '10px', backgroundColor: '#2196f3', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BrandPage;
