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
            <li><a href="#inicio" onClick={closeSidebar}>Inicio</a></li>
            <li><a href="#reservas" onClick={closeSidebar}>Reservas</a></li>
            <li><a href="#contacto" onClick={closeSidebar}>Contacto</a></li>
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
        <p>En móvil la barra lateral se oculta y se abre con el icono; en PC permanece visible.</p>
      </main>
    </div>
  );
}

export default App;
