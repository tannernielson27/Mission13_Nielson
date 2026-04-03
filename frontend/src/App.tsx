import { Routes, Route } from 'react-router-dom';
import BookList from './components/BookList';
import CartPage from './components/CartPage';
import AdminBooks from './components/AdminBooks';

function App() {
  return (
    <Routes>
      <Route path="/" element={<BookList />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/adminbooks" element={<AdminBooks />} />
    </Routes>
  );
}

export default App;
