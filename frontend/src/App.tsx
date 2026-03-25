import { Routes, Route } from 'react-router-dom';
import BookList from './components/BookList';
import CartPage from './components/CartPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<BookList />} />
      <Route path="/cart" element={<CartPage />} />
    </Routes>
  );
}

export default App;
