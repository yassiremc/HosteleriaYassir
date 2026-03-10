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

test('muestra visualitzar alumnes y el llistat de alumnes', () => {
  render(<App />);

  expect(screen.getByRole('heading', { name: /visualitzar alumnes/i })).toBeInTheDocument();
  expect(screen.getByRole('list', { name: /llistat d'alumnes/i })).toBeInTheDocument();
  expect(screen.getByText(/rol: cap de sala/i)).toBeInTheDocument();
});
