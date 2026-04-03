import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

const emptyForm: Omit<Book, 'bookId'> = {
  title: '',
  author: '',
  publisher: '',
  isbn: '',
  classification: '',
  category: '',
  numPages: 0,
  price: 0,
};

export default function AdminBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<Omit<Book, 'bookId'>>(emptyForm);
  const navigate = useNavigate();

  function fetchBooks() {
    fetch('/api/books?pageSize=1000')
      .then(res => res.json())
      .then(data => setBooks(data.books));
  }

  useEffect(() => {
    fetchBooks();
  }, []);

  function handleEdit(book: Book) {
    setEditingId(book.bookId);
    setForm({
      title: book.title,
      author: book.author,
      publisher: book.publisher,
      isbn: book.isbn,
      classification: book.classification,
      category: book.category,
      numPages: book.numPages,
      price: book.price,
    });
    setShowForm(true);
  }

  function handleDelete(id: number) {
    if (!confirm('Delete this book?')) return;
    fetch(`/api/books/${id}`, { method: 'DELETE' }).then(() => fetchBooks());
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (editingId !== null) {
      fetch(`/api/books/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId: editingId, ...form }),
      }).then(() => {
        fetchBooks();
        resetForm();
      });
    } else {
      fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId: 0, ...form }),
      }).then(() => {
        fetchBooks();
        resetForm();
      });
    }
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'numPages' || name === 'price' ? Number(value) : value,
    }));
  }

  return (
    <div className="container py-4">
      <div className="row align-items-center mb-3">
        <div className="col">
          <h1 className="mb-0">Admin — Manage Books</h1>
        </div>
        <div className="col-auto d-flex gap-2">
          <button
            className="btn btn-success"
            onClick={() => { resetForm(); setShowForm(true); }}
          >
            Add New Book
          </button>
          <button className="btn btn-outline-secondary" onClick={() => navigate('/')}>
            Back to Store
          </button>
        </div>
      </div>

      {showForm && (
        <div className="card mb-4">
          <div className="card-header">
            <strong>{editingId !== null ? 'Edit Book' : 'Add New Book'}</strong>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row g-2">
                {(
                  [
                    { label: 'Title', name: 'title', type: 'text' },
                    { label: 'Author', name: 'author', type: 'text' },
                    { label: 'Publisher', name: 'publisher', type: 'text' },
                    { label: 'ISBN', name: 'isbn', type: 'text' },
                    { label: 'Classification', name: 'classification', type: 'text' },
                    { label: 'Category', name: 'category', type: 'text' },
                    { label: 'Pages', name: 'numPages', type: 'number' },
                    { label: 'Price', name: 'price', type: 'number' },
                  ] as const
                ).map(({ label, name, type }) => (
                  <div className="col-md-3" key={name}>
                    <label className="form-label">{label}</label>
                    <input
                      className="form-control form-control-sm"
                      type={type}
                      name={name}
                      value={form[name]}
                      onChange={handleChange}
                      step={name === 'price' ? '0.01' : undefined}
                      required
                    />
                  </div>
                ))}
              </div>
              <div className="mt-3 d-flex gap-2">
                <button type="submit" className="btn btn-primary btn-sm">
                  {editingId !== null ? 'Save Changes' : 'Add Book'}
                </button>
                <button type="button" className="btn btn-outline-secondary btn-sm" onClick={resetForm}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
            <th>Actions</th>
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
                <div className="d-flex gap-1">
                  <button
                    className="btn btn-sm btn-warning"
                    onClick={() => handleEdit(book)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(book.bookId)}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
