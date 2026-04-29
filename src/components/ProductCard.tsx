import { type Product } from '../types';
import './ProductCard.css';

interface ProductCardProps {
  product: Product;
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
}

export default function ProductCard({ product, quantity, onAdd, onRemove }: ProductCardProps) {
  return (
    <div className="product-card">
      <div className="image-container">
        <img src={product.image} alt={product.title} className="product-image" loading="lazy" />
        {quantity > 0 && <div className="badge">{quantity}</div>}
      </div>
      <div className="product-info">
        <h3 className="product-title" title={product.title}>{product.title}</h3>
        <p className="product-category">{product.category}</p>
        <div className="product-footer">
          <span className="product-price">${product.price.toFixed(2)}</span>
          {quantity === 0 ? (
            <button className="add-button" onClick={onAdd}>Add</button>
          ) : (
            <div className="quantity-controls">
              <button className="qty-button" onClick={onRemove}>-</button>
              <span className="qty-value">{quantity}</span>
              <button className="qty-button" onClick={onAdd}>+</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
