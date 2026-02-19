import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Checkout } from './Checkout';
import { CartProvider } from '../contexts/CartContext';
import { AuthProvider } from '../contexts/AuthContext';
import { vi, describe, it, expect } from 'vitest';
import api from '../services/api';

// Mock API
vi.mock('../services/api', () => ({
  default: {
    post: vi.fn(),
  },
}));

// Mock AuthContext
const mockUseAuth = vi.fn();
vi.mock('../contexts/AuthContext', async () => {
  const actual = await vi.importActual('../contexts/AuthContext');
  return {
    ...actual,
    useAuth: () => mockUseAuth(),
  };
});

// Mock CartContext
const mockUseCart = vi.fn();
vi.mock('../contexts/CartContext', async () => {
  const actual = await vi.importActual('../contexts/CartContext');
  return {
    ...actual,
    useCart: () => mockUseCart(),
  };
});


describe('Checkout Page', () => {
  it('renders the checkout form when user is logged in and cart is not empty', () => {
    mockUseAuth.mockReturnValue({
      user: { username: 'Test User', email: 'test@example.com' },
      login: vi.fn(),
      logout: vi.fn(),
    });

    mockUseCart.mockReturnValue({
      state: {
        items: [{ id: 1, nome: 'Test Product', preco: 100, quantity: 1 }],
        total: 100,
      },
      dispatch: vi.fn(),
    });

    render(
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <Checkout />
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByText('Secure Checkout')).toBeInTheDocument();

    // Use uppercase placeholders to match component
    expect(screen.getByPlaceholderText('JOHN DOE')).toHaveValue('Test User');
    expect(screen.getByPlaceholderText('JOHN@EXAMPLE.COM')).toHaveValue('test@example.com');
  });

  it('submits the form successfully', async () => {
    const mockDispatch = vi.fn();
    mockUseAuth.mockReturnValue({
      user: { username: 'Test User', email: 'test@example.com' },
    });
    mockUseCart.mockReturnValue({
      state: {
        items: [{ id: 1, nome: 'Test Product', preco: 100, quantity: 1 }],
        total: 100,
      },
      dispatch: mockDispatch,
    });
    
    // Mock the API post call
    (api.post as any).mockResolvedValue({ data: { id: 123 } });

    render(
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <Checkout />
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    );

    // Fill address - using the uppercase placeholder from Checkout.tsx
    const addressInput = screen.getByPlaceholderText('123 MAIN ST, APT 4B');
    fireEvent.change(addressInput, {
      target: { value: '123 Test St' },
    });

    // Submit - using the uppercase button text from Checkout.tsx
    const submitButton = screen.getByRole('button', { name: /CONFIRM ORDER/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      // Check if API was called with correct data
      // Note: The mock auth context returns 'Test User', so that's what we expect in the payload
      expect(api.post).toHaveBeenCalledWith('/orders', expect.objectContaining({
        nome: 'Test User',
        email: 'test@example.com',
        endereco: '123 Test St',
        produtos: expect.arrayContaining([
            expect.objectContaining({
                productId: 1,
                quantity: 1
            })
        ])
      }));
    });

    expect(mockDispatch).toHaveBeenCalledWith({ type: 'CLEAR_CART' });
  });
});
