import React, { useEffect, useState, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { http } from '../https';
import { CartContext } from '../contexts/CartContext';
import { toast } from 'react-hot-toast';

const SearchResults = () => {
    const { search } = useLocation(); // Get the query from the URL
    const queryParams = new URLSearchParams(search);  // Parse the query string
    const query = queryParams.get('query');  // Get the 'query' parameter

    const [results, setResults] = useState([]);  // Store search results
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);

    // Add CartContext
    const { addToCart } = useContext(CartContext);

    console.log('SearchResults - Query:', query); // Debug log

    useEffect(() => {
        if (query) {
            setLoading(true);
            console.log('Fetching search results for:', query); // Debug log
            
            // Fetch the search results from the API using the http instance
            http.get(`/product/search?query=${query}`)
                .then(response => {
                    console.log('Search response:', response.data); // Debug log
                    if (response.data && response.data.length > 0) {
                        setResults(response.data);
                        setErrorMessage('');
                    } else {
                        setErrorMessage(`No results found for "${query}".`);
                        setResults([]);
                    }
                    setLoading(false);
                })
                .catch(error => {
                    console.error('Search error:', error); // Debug log
                    setErrorMessage('Error fetching search results.');
                    setLoading(false);
                });
        }
    }, [query]);  // Re-run the effect when query changes

    // Add to cart function with toast notification
    const handleAddToCart = (product) => {
        const cartItem = {
            productId: product.productId,  // Use productId instead of id
            name: product.productName,
            price: parseFloat(product.price),
            image: product.imageUrl,
            quantity: 1
        };
        
        addToCart(cartItem);
        toast.success(`${product.productName} added to cart!`, {
            duration: 3000,
            position: 'top-right',
        });
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Search Results for "{query}"</h1>
            
            {loading ? (
                <p>Loading...</p>
            ) : errorMessage ? (
                <p style={{ color: 'red' }}>{errorMessage}</p>
            ) : results.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', padding: '20px' }}>
                    {results.map((result, index) => (
                        <div key={index} style={{ 
                            border: '1px solid #ddd', 
                            borderRadius: '8px', 
                            padding: '16px', 
                            backgroundColor: '#fff',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}>
                            <h2 style={{ color: '#333', marginBottom: '10px' }}>{result.productName}</h2>
                            {result.imageUrl && (
                                <img 
                                    src={`http://localhost:5000${result.imageUrl}`} 
                                    alt={result.productName}
                                    style={{ 
                                        width: '100%', 
                                        height: '200px', 
                                        objectFit: 'cover', 
                                        borderRadius: '4px',
                                        marginBottom: '10px'
                                    }}
                                />
                            )}
                            <p style={{ color: '#666', marginBottom: '10px' }}>{result.productDescription}</p>
                            <p style={{ 
                                fontSize: '20px', 
                                fontWeight: 'bold', 
                                color: '#e74c3c', 
                                marginBottom: '15px' 
                            }}>
                                ${result.price}
                            </p>
                            <button 
                                style={{
                                    backgroundColor: '#3498db',
                                    color: 'white',
                                    border: 'none',
                                    padding: '10px 20px',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '16px',
                                    width: '100%'
                                }}
                                onClick={() => handleAddToCart(result)}
                                onMouseOver={(e) => e.target.style.backgroundColor = '#2980b9'}
                                onMouseOut={(e) => e.target.style.backgroundColor = '#3498db'}
                            >
                                Add to Cart
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <p>No search query provided</p>
            )}
        </div>
    );
};

export default SearchResults;
