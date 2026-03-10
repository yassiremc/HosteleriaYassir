import { useEffect, useState } from 'react';
import logoJoviat from './logo_joviat.webp';
import './App.css';

const FIREBASE_PROJECT_ID = 'hosteleriajoviat-94129';
const FIRESTORE_BASE_URL = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents`;

const ALUMNI_IMAGES = {
  tv50174LXEd82ddvWPSj: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&w=500&q=80',
  default: 'https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?auto=format&fit=crop&w=500&q=80'
};

const readFirestoreValue = (field) => {
  if (!field) {
    return '';
  }

  if (Object.prototype.hasOwnProperty.call(field, 'stringValue')) {
    return field.stringValue;
  }

  if (Object.prototype.hasOwnProperty.call(field, 'booleanValue')) {
    return field.booleanValue;
  }

  if (Object.prototype.hasOwnProperty.call(field, 'integerValue')) {
    return field.integerValue;
  }

  if (Object.prototype.hasOwnProperty.call(field, 'doubleValue')) {
    return field.doubleValue;
  }

  return '';
};

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [studentsError, setStudentsError] = useState('');

  useEffect(() => {
    const loadStudents = async () => {
      try {
        const relationResponse = await fetch(`${FIRESTORE_BASE_URL}/Rest-Alum`);
        if (!relationResponse.ok) {
          throw new Error('No relation docs');
        }

        const relationJson = await relationResponse.json();
        const relationDocs = relationJson.documents || [];

        const studentData = await Promise.all(
          relationDocs.map(async (docItem) => {
            const relationFields = docItem.fields || {};
            const alumniId = readFirestoreValue(relationFields.id_alumni);
            const role = readFirestoreValue(relationFields.rol) || 'Sense rol';

            let studentName = alumniId || 'Alumne sense nom';
            if (alumniId) {
              const alumniResponse = await fetch(`${FIRESTORE_BASE_URL}/Alumni/${alumniId}`);
              if (alumniResponse.ok) {
                const alumniJson = await alumniResponse.json();
                const alumniFields = alumniJson.fields || {};
                studentName =
                  readFirestoreValue(alumniFields.name) ||
                  readFirestoreValue(alumniFields.nom) ||
                  readFirestoreValue(alumniFields.Nombre) ||
                  readFirestoreValue(alumniFields.Name) ||
                  studentName;
              }
            }

            return {
              id: docItem.name,
              name: studentName,
              role,
              imageUrl: ALUMNI_IMAGES[alumniId] || ALUMNI_IMAGES.default
            };
          })
        );

        setStudents(studentData);
        setStudentsError('');
      } catch (error) {
        setStudentsError('No s’ha pogut carregar el llistat d’alumnes des de Firebase.');
      } finally {
        setLoadingStudents(false);
      }
    };

    loadStudents();
  }, []);

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
            <li><a href="#visualitzar-alumnes" onClick={closeSidebar}>Visualitzar Alumnes</a></li>
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
        <h1>Visualització de l’alumnat al restaurant</h1>
        <p>Consulta el rol actual dels alumnes segons la relació guardada a Firebase.</p>

        <section id="visualitzar-alumnes" className="students-section">
          <h2>Llistat d&apos;alumnes</h2>

          {loadingStudents && <p>Carregant alumnes...</p>}
          {!loadingStudents && studentsError && <p>{studentsError}</p>}

          {!loadingStudents && !studentsError && (
            <div className="students-grid">
              {students.map((student) => (
                <article key={student.id} className="student-card">
                  <img src={student.imageUrl} alt={`Foto de ${student.name}`} />
                  <div>
                    <h3>{student.name}</h3>
                    <p>Rol: {student.role}</p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
