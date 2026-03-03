import { useState } from 'react';
import logoJoviat from './logo_joviat.webp';
import './App.css';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <button
          type="button"
          className="menu-button"
          onClick={toggleSidebar}
          aria-label={isSidebarOpen ? 'Cerrar menú lateral' : 'Abrir menú lateral'}
          aria-expanded={isSidebarOpen}
          aria-controls="main-sidebar"
        >
          <span />
          <span />
          <span />
        </button>

        <img src={logoJoviat} className="brand-logo" alt="logo_joviat" />
      </header>

      <aside id="main-sidebar" className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <nav>
          <h2>Menú</h2>
          <ul>
            <li><a href="#inicio">Inicio</a></li>
            <li><a href="#reservas">Reservas</a></li>
            <li><a href="#contacto">Contacto</a></li>
          </ul>
        </nav>
      </aside>

      <button
        type="button"
        className={`overlay ${isSidebarOpen ? 'show' : ''}`}
        onClick={closeSidebar}
        aria-label="Cerrar menú"
      />

      <main className="main-content" id="inicio">
        <h1>Encabezado y barra lateral responsive</h1>
        <p>Haz clic en el icono de menú para abrir y cerrar la barra lateral en móvil y PC.</p>
      </main>
    </div>
  );
}

export default App;
