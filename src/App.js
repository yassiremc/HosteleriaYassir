import { useState } from 'react';
import logoJoviat from './logo_joviat.webp';
import './App.css';

const alumnesFirebase = [
  {
    id: 'alumne-1',
    nom: 'Aina Soler',
    rol: 'Cap de sala',
    imatgeUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=320&q=80',
  },
  {
    id: 'alumne-2',
    nom: 'Marc Vidal',
    rol: 'Cuiner de partida',
    imatgeUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=320&q=80',
  },
  {
    id: 'alumne-3',
    nom: 'Laia Roca',
    rol: 'Pastissera',
    imatgeUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=320&q=80',
  },
  {
    id: 'alumne-4',
    nom: 'Pol Ferrer',
    rol: 'Sommelier',
    imatgeUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=320&q=80',
  },
];

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
            <li><a href="#visualitzar-alumnes">Visualitzar Alumnes</a></li>
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

        <section id="visualitzar-alumnes" className="students-section">
          <h2>Visualitzar Alumnes</h2>
          <p>Llistat d&apos;alumnes (dades de Firebase) amb el seu rol al restaurant.</p>

          <ul className="students-list" aria-label="Llistat d'alumnes">
            {alumnesFirebase.map((alumne) => (
              <li key={alumne.id} className="student-card">
                <img src={alumne.imatgeUrl} alt={alumne.nom} />
                <div>
                  <h3>{alumne.nom}</h3>
                  <p>Rol: {alumne.rol}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}

export default App;
