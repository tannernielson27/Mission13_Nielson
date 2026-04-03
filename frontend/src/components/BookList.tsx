// Bootstrap extras:
//   Badge   – cart item-count badge on the "View Cart" button (line ~90)
//   Toast   – confirmation toast shown when a book is added to the cart (line ~55)

import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Toast } from 'bootstrap';
import { useCart } from '../context/CartContext';

type Book = {
  bookId: number;
  title: string;
  author: string;
  publisher: string;
  isbn: string;
  classification: string;
  category: string;
  numPages: number;
  price: number;
};

export default function BookList() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read initial state from URL query params so "Continue Shopping" restores position
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Page and category are derived from URL params
  const page = parseInt(searchParams.get('page') ?? '1', 10);
  const category = searchParams.get('category') ?? '';

  const totalPages = Math.ceil(total / pageSize);

  const { addToCart, totalQuantity, totalPrice, setReturnLocation } = useCart();
  const navigate = useNavigate();

  // Toast ref for "Added to cart" confirmation
  const toastRef = useRef<HTMLDivElement>(null);
  const [lastAdded, setLastAdded] = useState('');

  // Update tab title based on active category filter
  useEffect(() => {
    document.title = category ? `${category} Books | Bookstore` : 'Browse Books | Bookstore';
  }, [category]);

  // Fetch distinct categories once on mount
  useEffect(() => {
    fetch('/api/books/categories')
      .then(res => res.json())
      .then(setCategories);
  }, []);

  // Fetch books whenever page, pageSize, sortOrder, or category changes
  useEffect(() => {
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
      sortOrder,
      ...(category ? { category } : {}),
    });
    fetch(`/api/books?${params}`)
      .then(res => res.json())
      .then(data => {
        setBooks(data.books);
        setTotal(data.total);
      });
  }, [page, pageSize, sortOrder, category]);

  function setPage(newPage: number) {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('page', String(newPage));
      return next;
    });
  }

  function setCategory(newCategory: string) {
    // Reset to page 1 when filter changes
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('page', '1');
      if (newCategory) next.set('category', newCategory);
      else next.delete('category');
      return next;
    });
  }

  function handleAddToCart(book: Book) {
    addToCart({ bookId: book.bookId, title: book.title, price: book.price });
    setLastAdded(book.title);
    // Save current page + category so "Continue Shopping" restores them
    setReturnLocation(page, category);

    // Show Bootstrap Toast
    if (toastRef.current) {
      const toast = Toast.getOrCreateInstance(toastRef.current, { delay: 2500 });
      toast.show();
    }
  }

  function handleViewCart() {
    setReturnLocation(page, category);
    navigate('/cart');
  }

  return (
    <div className="container py-4">
      {/* Bootstrap Toast – "Added to cart" confirmation */}
      <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1100 }}>
        <div ref={toastRef} className="toast align-items-center text-bg-success border-0" role="alert">
          <div className="d-flex">
            <div className="toast-body">
              <strong>{lastAdded}</strong> added to cart!
            </div>
            <button type="button" className="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" />
          </div>
        </div>
      </div>

      <div className="row align-items-center mb-3">
        <div className="col">
          <h1 className="mb-0">Bookstore</h1>
        </div>
        <div className="col-auto d-flex gap-2">
          <button className="btn btn-outline-secondary" onClick={() => navigate('/adminbooks')}>
            Admin
          </button>
          {/* Bootstrap Badge – item count on cart button */}
          <button className="btn btn-outline-primary position-relative" onClick={handleViewCart}>
            View Cart
            {totalQuantity > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                {totalQuantity}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Cart summary */}
      {totalQuantity > 0 && (
        <div className="alert alert-info d-flex justify-content-between align-items-center py-2 mb-3">
          <span>Cart: <strong>{totalQuantity}</strong> item{totalQuantity !== 1 ? 's' : ''}</span>
          <span>Total: <strong>${totalPrice.toFixed(2)}</strong></span>
        </div>
      )}

      {/* Controls row */}
      <div className="row g-2 mb-3">
        <div className="col-auto">
          <label className="col-form-label">Category:</label>
        </div>
        <div className="col-auto">
          <select
            className="form-select form-select-sm"
            value={category}
            onChange={e => setCategory(e.target.value)}
          >
            <option value="">All</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="col-auto ms-3">
          <label className="col-form-label">Sort:</label>
        </div>
        <div className="col-auto">
          <select
            className="form-select form-select-sm"
            value={sortOrder}
            onChange={e => {
              setSortOrder(e.target.value as 'asc' | 'desc');
              setPage(1);
            }}
          >
            <option value="asc">A → Z</option>
            <option value="desc">Z → A</option>
          </select>
        </div>
        <div className="col-auto ms-3">
          <label className="col-form-label">Per page:</label>
        </div>
        <div className="col-auto">
          <select
            className="form-select form-select-sm"
            value={pageSize}
            onChange={e => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
          </select>
        </div>
      </div>

      {/* Book table */}
      <div className="row">
        <div className="col">
          <table className="table table-bordered table-hover">
            <thead className="table-dark">
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Publisher</th>
                <th>ISBN</th>
                <th>Classification</th>
                <th>Category</th>
                <th>Pages</th>
                <th>Price</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {books.map(book => (
                <tr key={book.bookId}>
                  <td>{book.title}</td>
                  <td>{book.author}</td>
                  <td>{book.publisher}</td>
                  <td>{book.isbn}</td>
                  <td>{book.classification}</td>
                  <td>{book.category}</td>
                  <td>{book.numPages}</td>
                  <td>${book.price.toFixed(2)}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-success"
                      onClick={() => handleAddToCart(book)}
                    >
                      Add to Cart
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="row">
        <div className="col d-flex align-items-center gap-2">
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => setPage(Math.max(page - 1, 1))}
            disabled={page === 1}
          >
            Previous
          </button>
          <span>Page {page} of {totalPages || 1}</span>
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => setPage(Math.min(page + 1, totalPages))}
            disabled={page >= totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
