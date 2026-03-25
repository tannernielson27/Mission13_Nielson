import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function CartPage() {
  const { items, removeFromCart, totalPrice, totalQuantity, returnPage, returnCategory } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = `Cart (${totalQuantity}) | Bookstore`;
  }, [totalQuantity]);

  // Build the return URL with the saved page and category filter
  function handleContinueShopping() {
    const params = new URLSearchParams();
    params.set('page', String(returnPage));
    if (returnCategory) params.set('category', returnCategory);
    navigate(`/?${params.toString()}`);
  }

  return (
    <div className="container py-4">
      <div className="row">
        <div className="col">
          <h1 className="mb-4">Your Cart</h1>

          {items.length === 0 ? (
            <p className="text-muted">Your cart is empty.</p>
          ) : (
            <table className="table table-bordered table-hover">
              <thead className="table-dark">
                <tr>
                  <th>Title</th>
                  <th className="text-center">Qty</th>
                  <th className="text-end">Unit Price</th>
                  <th className="text-end">Subtotal</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.bookId}>
                    <td>{item.title}</td>
                    <td className="text-center">{item.quantity}</td>
                    <td className="text-end">${item.price.toFixed(2)}</td>
                    <td className="text-end">${(item.price * item.quantity).toFixed(2)}</td>
                    <td className="text-center">
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => removeFromCart(item.bookId)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="fw-bold">
                  <td colSpan={2}>
                    Total items: {totalQuantity}
                  </td>
                  <td className="text-end">Total:</td>
                  <td className="text-end">${totalPrice.toFixed(2)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          )}

          <button className="btn btn-primary" onClick={handleContinueShopping}>
            &larr; Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}
