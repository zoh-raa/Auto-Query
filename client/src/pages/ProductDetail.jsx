
import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { http } from '../https';
import { CartContext } from '../contexts/CartContext';

const ProductDetail = () => {
	const { productId } = useParams();
	const [product, setProduct] = useState(null);
	const [quantity, setQuantity] = useState(1);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const { addToCart } = useContext(CartContext);

	useEffect(() => {
		const fetchProduct = async () => {
			try {
				setLoading(true);
				const res = await http.get(`/product/${productId}`);
				setProduct(res.data.product || res.data); // support both {product: {...}} and {...}
				setError(null);
			} catch (err) {
				setError('Product not found.');
			} finally {
				setLoading(false);
			}
		};
		fetchProduct();
	}, [productId]);

	const handleAddToCart = () => {
		if (product) {
			addToCart({ ...product, quantity });
		}
	};

	if (loading) return <div>Loading...</div>;
	if (error) return <div style={{ color: 'red' }}>{error}</div>;
	if (!product) return null;

		// Bundle display logic
		const isYamahaBundle = product.productId === '101' || product.productNumber === 'BUNDLE-YAM-101';
		const isHondaBundle = product.productId === '102' || product.productNumber === 'BUNDLE-HON-102';

		if (isYamahaBundle || isHondaBundle) {
			const bundleParts = isYamahaBundle
				? [
					{ img: '/images/part4.png', name: 'Oil Filter' },
					{ img: '/images/part5.jpg', name: 'Frame' },
					{ img: '/images/part6.jpeg', name: 'Brake Pad' },
					{ img: '/images/part7.jpeg', name: 'Spark Plug' },
				]
				: [
					{ img: '/images/part8.png', name: 'Honda Front Fender CB125F' },
					{ img: '/images/part9.png', name: 'Gearshift Drum CB125F' },
					{ img: '/images/part10.png', name: 'L Crankcase Cover' },
					{ img: '/images/part11.jpeg', name: 'Air Filter' },
				];
			return (
				<div className="product-detail-container" style={{
					maxWidth: 600,
					margin: '48px auto',
					padding: 32,
					borderRadius: 16,
					background: '#fff',
					boxShadow: '0 8px 32px rgba(0,0,0,0.10), 0 1.5px 6px rgba(0,0,0,0.08)',
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
				}}>
					<h1 style={{ fontSize: 28, fontWeight: 700, color: '#222', marginBottom: 12, textAlign: 'center' }}>{product.productName || product.name}</h1>
					<p style={{ fontSize: 18, color: '#555', marginBottom: 18, textAlign: 'center' }}>{product.productDescription || product.description}</p>
					<div style={{ display: 'flex', gap: 24, marginBottom: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
						{bundleParts.map((part, idx) => (
							<div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 120 }}>
								<img src={part.img} alt={part.name} style={{ width: 90, height: 90, objectFit: 'contain', borderRadius: 8, marginBottom: 8, boxShadow: '0 1px 6px rgba(0,0,0,0.10)' }} />
								<span style={{ fontSize: 15, color: '#444', textAlign: 'center' }}>{part.name}</span>
							</div>
						))}
					</div>
					<div style={{
						fontWeight: 700,
						fontSize: 24,
						color: '#d32f2f',
						marginBottom: 18,
						letterSpacing: 1
					}}>
						SGD {Number(product.price).toFixed(2)}
					</div>
					<div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
						<label htmlFor="quantity" style={{ fontWeight: 500, marginRight: 8 }}>Quantity:</label>
						<input
							id="quantity"
							type="number"
							min={1}
							value={quantity}
							onChange={e => setQuantity(Math.max(1, Number(e.target.value)))}
							style={{
								width: 70,
								padding: 6,
								border: '1px solid #bbb',
								borderRadius: 6,
								fontSize: 16,
								textAlign: 'center',
								outline: 'none',
								marginLeft: 4
							}}
						/>
					</div>
					<button
						onClick={handleAddToCart}
						style={{
							padding: '12px 36px',
							background: 'linear-gradient(90deg, #1976d2 0%, #2196f3 100%)',
							color: '#fff',
							border: 'none',
							borderRadius: 8,
							fontSize: 18,
							fontWeight: 600,
							cursor: 'pointer',
							boxShadow: '0 2px 8px rgba(25, 118, 210, 0.10)',
							transition: 'background 0.2s',
						}}
						onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(90deg, #1565c0 0%, #1976d2 100%)'}
						onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(90deg, #1976d2 0%, #2196f3 100%)'}
					>
						Add Bundle to Cart
					</button>
				</div>
			);
		}

		// ...existing code for normal product detail...
		return (
			<div className="product-detail-container" style={{
				maxWidth: 500,
				margin: '48px auto',
				padding: 32,
				borderRadius: 16,
				background: '#fff',
				boxShadow: '0 8px 32px rgba(0,0,0,0.10), 0 1.5px 6px rgba(0,0,0,0.08)',
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
			}}>
				<img
					src={
						product.imageUrl
							? product.imageUrl.startsWith('/images/')
								? product.imageUrl
								: `http://localhost:3001/images/${product.imageUrl}`
							: product.image || '/images/no-image.png'
					}
					alt={product.productName || product.name}
					style={{
						width: '100%',
						maxWidth: 340,
						maxHeight: 340,
						objectFit: 'contain',
						borderRadius: 12,
						marginBottom: 24,
						boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
					}}
				/>
				<h1 style={{ fontSize: 28, fontWeight: 700, color: '#222', marginBottom: 12, textAlign: 'center' }}>{product.productName || product.name}</h1>
				<p style={{ fontSize: 18, color: '#555', marginBottom: 18, textAlign: 'center' }}>{product.description || product.productDescription}</p>
				<div style={{
					fontWeight: 700,
					fontSize: 24,
					color: '#d32f2f',
					marginBottom: 18,
					letterSpacing: 1
				}}>
					SGD {Number(product.price).toFixed(2)}
				</div>
				<div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
					<label htmlFor="quantity" style={{ fontWeight: 500, marginRight: 8 }}>Quantity:</label>
					<input
						id="quantity"
						type="number"
						min={1}
						value={quantity}
						onChange={e => setQuantity(Math.max(1, Number(e.target.value)))}
						style={{
							width: 70,
							padding: 6,
							border: '1px solid #bbb',
							borderRadius: 6,
							fontSize: 16,
							textAlign: 'center',
							outline: 'none',
							marginLeft: 4
						}}
					/>
				</div>
				<button
					onClick={handleAddToCart}
					style={{
						padding: '12px 36px',
						background: 'linear-gradient(90deg, #1976d2 0%, #2196f3 100%)',
						color: '#fff',
						border: 'none',
						borderRadius: 8,
						fontSize: 18,
						fontWeight: 600,
						cursor: 'pointer',
						boxShadow: '0 2px 8px rgba(25, 118, 210, 0.10)',
						transition: 'background 0.2s',
					}}
					onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(90deg, #1565c0 0%, #1976d2 100%)'}
					onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(90deg, #1976d2 0%, #2196f3 100%)'}
				>
					Add to Cart
				</button>
			</div>
		);
};

export default ProductDetail;
