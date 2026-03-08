import { fireEvent, render, screen } from '@testing-library/react';
import App from './App';

test('abre la barra lateral al hacer click en el icono del menú', () => {
  render(<App />);

  const menuButton = screen.getByRole('button', { name: /abrir menú lateral/i });
  fireEvent.click(menuButton);

  const sidebarTitle = screen.getByRole('heading', { name: /menú/i });
  expect(sidebarTitle).toBeInTheDocument();
  expect(menuButton).toHaveAttribute('aria-expanded', 'true');
});
