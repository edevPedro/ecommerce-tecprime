import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { Layout } from './components/Layout';
import { PrivateRoute } from './components/PrivateRoute';
import { ScrollToTop } from './components/ScrollToTop';
import { Login } from './pages/Login';
import { Catalog } from './pages/Catalog';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { OrderDetails } from './pages/OrderDetails';
import { ProductDetails } from './pages/ProductDetails';
import { OrderProcessing } from './pages/OrderProcessing';
import { MyPurchases } from './pages/MyPurchases';
import { Logs } from './pages/Logs';

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/logs" element={<Logs />} />
            <Route element={<Layout />}>
              <Route path="/" element={<Catalog />} />
              <Route path="/products/:id" element={<ProductDetails />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/my-purchases" element={<PrivateRoute><MyPurchases /></PrivateRoute>} />
              <Route
                path="/checkout"
                element={
                  <PrivateRoute>
                    <Checkout />
                  </PrivateRoute>
                }
              />
              <Route
                path="/order-processing"
                element={
                  <PrivateRoute>
                    <OrderProcessing />
                  </PrivateRoute>
                }
              />
              <Route
                path="/orders/:id"
                element={
                  <PrivateRoute>
                    <OrderDetails />
                  </PrivateRoute>
                }
              />
            </Route>
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
