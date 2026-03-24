import { useEffect, useMemo, useState } from 'react';
import logoJoviat from './logo_joviat.webp';
import './App.css';

const FIREBASE_PROJECT_ID = 'hosteleriajoviat-94129';
const FIRESTORE_BASE_URL = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents`;

const ALUMNI_IMAGES_BY_NAME = {
  'elena gilbert': 'https://i.pinimg.com/736x/53/39/cc/5339ccdd5dfb6b834fac3711e943c9b0.jpg',
  'adriana martinez': 'https://i.pinimg.com/736x/4a/c6/32/4ac632b4e50f78a532be67f7977290db.jpg',
  'joel fernandez': 'https://preview.redd.it/damon-salvatore-v0-u895ej76t5oe1.jpeg?auto=webp&s=cfa26d2aeeb5e4ab226249197879bca094019625',
  default: 'https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?auto=format&fit=crop&w=500&q=80'
};

const DEFAULT_RESTAURANT_IMAGE_URL = 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=900&q=80';


const RESTAURANT_IMAGES_BY_NAME = {
  'restaurant japonès niwaka': 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=80',
  'braseria guns&food - ctpm': 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1200&q=80',
  'restaurant gretta gogó': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80'
};

const readFirestoreValue = (field) => {
  if (!field) return '';
  if (Object.prototype.hasOwnProperty.call(field, 'stringValue')) return field.stringValue;
  if (Object.prototype.hasOwnProperty.call(field, 'booleanValue')) return field.booleanValue;
  if (Object.prototype.hasOwnProperty.call(field, 'integerValue')) return field.integerValue;
  if (Object.prototype.hasOwnProperty.call(field, 'doubleValue')) return field.doubleValue;
  if (Object.prototype.hasOwnProperty.call(field, 'arrayValue')) {
    return (field.arrayValue.values || []).map(readFirestoreValue);
  }
  return '';
};

const parseLocation = (rawLocation) => {
  if (Array.isArray(rawLocation)) {
    const [lat, lng] = rawLocation;
    const parsedLat = Number(lat);
    const parsedLng = Number(lng);
    if (!Number.isNaN(parsedLat) && !Number.isNaN(parsedLng)) return { lat: parsedLat, lng: parsedLng };
  }

  if (typeof rawLocation === 'string') {
    const matches = rawLocation.match(/-?\d+(?:\.\d+)?/g);
    if (matches && matches.length >= 2) {
      const parsedLat = Number(matches[0]);
      const parsedLng = Number(matches[1]);
      if (!Number.isNaN(parsedLat) && !Number.isNaN(parsedLng)) return { lat: parsedLat, lng: parsedLng };
    }
  }

  return null;
};

const parseBoolean = (value) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value.toLowerCase() === 'true';
  return false;
};

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthMenuOpen, setIsAuthMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loggedInUser, setLoggedInUser] = useState('');
  const [activeSection, setActiveSection] = useState('restaurants');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [studentSearch, setStudentSearch] = useState('');
  const [restaurantSearch, setRestaurantSearch] = useState('');
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [studentsError, setStudentsError] = useState('');
  const [restaurants, setRestaurants] = useState([]);
  const [loadingRestaurants, setLoadingRestaurants] = useState(true);
  const [restaurantsError, setRestaurantsError] = useState('');
  const [adminStudentStatus, setAdminStudentStatus] = useState('Alumni (En actiu)');
  const [adminTrajectoryFilter, setAdminTrajectoryFilter] = useState('');
  const [adminTrajectories, setAdminTrajectories] = useState([
    { id: 1, restaurant: '', role: '', current: true }
  ]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [relationResponse, restaurantResponse] = await Promise.all([
          fetch(`${FIRESTORE_BASE_URL}/Rest-Alum`),
          fetch(`${FIRESTORE_BASE_URL}/Restaurant`)
        ]);

        if (!relationResponse.ok || !restaurantResponse.ok) {
          throw new Error('No data docs');
        }

        const relationJson = await relationResponse.json();
        const restaurantJson = await restaurantResponse.json();

        const relationDocs = relationJson.documents || [];
        const restaurantDocs = restaurantJson.documents || [];

        const restaurantMap = {};
        const restaurantData = restaurantDocs.map((docItem) => {
          const fields = docItem.fields || {};
          const id = docItem.name.split('/').pop();
          const name =
            readFirestoreValue(fields.Name) ||
            readFirestoreValue(fields.name) ||
            'Restaurant sense nom';
          const locationField = readFirestoreValue(fields.Location) || '';
          const coordinates = parseLocation(locationField);
          const specialty =
            readFirestoreValue(fields.specialty) ||
            readFirestoreValue(fields.especialidad) ||
            readFirestoreValue(fields.Specialty) ||
            'No disponible';
          const street =
            readFirestoreValue(fields.calle) ||
            readFirestoreValue(fields.street) ||
            readFirestoreValue(fields.address) ||
            (Array.isArray(locationField) ? locationField.join(', ') : String(locationField || 'No disponible'));

          const restaurantItem = {
            id,
            firestoreName: docItem.name,
            name,
            specialty,
            street,
            coordinates,
            imageUrl:
              RESTAURANT_IMAGES_BY_NAME[name.toLowerCase()] ||
              readFirestoreValue(fields.imageUrl) ||
              readFirestoreValue(fields.image_url) ||
              readFirestoreValue(fields.foto_url) ||
              readFirestoreValue(fields.url) ||
              DEFAULT_RESTAURANT_IMAGE_URL
          };

          restaurantMap[id] = restaurantItem;
          return restaurantItem;
        });

        setRestaurants(restaurantData);
        setRestaurantsError('');
        setLoadingRestaurants(false);

        const studentData = await Promise.all(
          relationDocs.map(async (docItem) => {
            const fields = docItem.fields || {};
            const alumniId = readFirestoreValue(fields.id_alumni);
            const role = readFirestoreValue(fields.rol) || 'Sense rol';
            const restaurantId =
              readFirestoreValue(fields.id_restaurant) ||
              readFirestoreValue(fields.id_restaurat) ||
              readFirestoreValue(fields.idRestaurant);
            const currentJob = parseBoolean(readFirestoreValue(fields.current_job));

            let firstName = '';
            let lastName = '';
            let fallbackName = alumniId || 'Alumne sense nom';

            if (alumniId) {
              const alumniResponse = await fetch(`${FIRESTORE_BASE_URL}/Alumni/${alumniId}`);
              if (alumniResponse.ok) {
                const alumniJson = await alumniResponse.json();
                const alumniFields = alumniJson.fields || {};
                firstName =
                  readFirestoreValue(alumniFields.name) ||
                  readFirestoreValue(alumniFields.nom) ||
                  readFirestoreValue(alumniFields.Nombre) ||
                  readFirestoreValue(alumniFields.Name) ||
                  '';
                lastName =
                  readFirestoreValue(alumniFields.lastName) ||
                  readFirestoreValue(alumniFields.lastname) ||
                  readFirestoreValue(alumniFields.surname) ||
                  readFirestoreValue(alumniFields.apellido) ||
                  readFirestoreValue(alumniFields.cognom) ||
                  '';
                fallbackName = [firstName, lastName].filter(Boolean).join(' ').trim() || firstName || fallbackName;
              }
            }

            const workplace = restaurantMap[restaurantId]?.name || 'No disponible';

            return {
              id: docItem.name,
              fullName: [firstName, lastName].filter(Boolean).join(' ').trim() || fallbackName,
              role,
              workplace,
              restaurantId,
              currentJob,
              imageUrl: ALUMNI_IMAGES_BY_NAME[fallbackName.toLowerCase()] || ALUMNI_IMAGES_BY_NAME.default
            };
          })
        );

        setStudents(studentData);
        setStudentsError('');
      } catch (error) {
        setStudentsError('No s’ha pogut carregar el llistat d’alumnes des de Firebase.');
        setRestaurantsError('No s’han pogut carregar els restaurants des de Firebase.');
      } finally {
        setLoadingStudents(false);
        setLoadingRestaurants(false);
      }
    };

    loadData();
  }, []);

  const filteredStudents = useMemo(() => {
    const term = studentSearch.trim().toLowerCase();
    if (!term) return students;

    return students.filter(
      (student) =>
        student.fullName.toLowerCase().includes(term) ||
        student.role.toLowerCase().includes(term) ||
        student.workplace.toLowerCase().includes(term)
    );
  }, [students, studentSearch]);

  const filteredRestaurants = useMemo(() => {
    const term = restaurantSearch.trim().toLowerCase();
    if (!term) return restaurants;

    return restaurants.filter(
      (restaurant) =>
        restaurant.name.toLowerCase().includes(term) ||
        restaurant.specialty.toLowerCase().includes(term) ||
        restaurant.street.toLowerCase().includes(term)
    );
  }, [restaurants, restaurantSearch]);

  const mapUrl = useMemo(() => {
    if (!filteredRestaurants.length) {
      return 'https://www.google.com/maps?q=Barcelona&z=13&output=embed';
    }

    const firstWithCoordinates = filteredRestaurants.find((restaurant) => restaurant.coordinates);
    if (firstWithCoordinates) {
      const { lat, lng } = firstWithCoordinates.coordinates;
      return `https://www.google.com/maps?q=${lat},${lng}&z=15&output=embed`;
    }

    return `https://www.google.com/maps?q=${encodeURIComponent(filteredRestaurants[0].name)}&z=15&output=embed`;
  }, [filteredRestaurants]);

  const studentsForSelectedRestaurant = useMemo(() => {
    if (!selectedRestaurant) return { current: [], past: [] };

    const matched = students.filter((student) => student.restaurantId === selectedRestaurant.id);
    return {
      current: matched.filter((student) => student.currentJob),
      past: matched.filter((student) => !student.currentJob)
    };
  }, [selectedRestaurant, students]);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const toggleAuthMenu = () => {
    setIsAuthMenuOpen((prev) => !prev);
    setLoginError('');
  };

  const handleLoginInput = (event) => {
    const { name, value } = event.target;
    setLoginForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = (event) => {
    event.preventDefault();
    const username = loginForm.username.trim();
    const password = loginForm.password.trim();

    if (!username || !password) {
      setLoginError('Introdueix usuari i contrasenya.');
      return;
    }

    setIsLoggedIn(true);
    setLoggedInUser(username);
    setLoginForm({ username: '', password: '' });
    setLoginError('');
    setIsAuthMenuOpen(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setLoggedInUser('');
    setLoginForm({ username: '', password: '' });
    setLoginError('');
    setIsAuthMenuOpen(false);
  };

  const selectSection = (section) => {
    setActiveSection(section);
    if (section !== 'students') setSelectedStudent(null);
    if (section !== 'restaurants') setSelectedRestaurant(null);
    setIsSidebarOpen(false);
  };

  const addTrajectory = () => {
    setAdminTrajectories((prev) => [
      ...prev,
      { id: Date.now(), restaurant: '', role: '', current: true }
    ]);
  };

  const removeTrajectory = (id) => {
    setAdminTrajectories((prev) => prev.filter((trajectory) => trajectory.id !== id));
  };

  const updateTrajectory = (id, field, value) => {
    setAdminTrajectories((prev) =>
      prev.map((trajectory) => (
        trajectory.id === id
          ? { ...trajectory, [field]: value }
          : trajectory
      ))
    );
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
        <div className="auth-menu-wrapper">
          <button
            type="button"
            className="auth-button"
            onClick={toggleAuthMenu}
            aria-expanded={isAuthMenuOpen}
            aria-controls="auth-menu"
          >
            {isLoggedIn ? `👤 ${loggedInUser}` : 'Log in'}
          </button>

          {isAuthMenuOpen && (
            <div id="auth-menu" className="auth-menu">
              {!isLoggedIn ? (
                <form className="auth-form" onSubmit={handleLogin}>
                  <label htmlFor="username">Usuari</label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    value={loginForm.username}
                    onChange={handleLoginInput}
                    placeholder="Introdueix el teu usuari"
                  />
                  <label htmlFor="password">Contrasenya</label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={loginForm.password}
                    onChange={handleLoginInput}
                    placeholder="Introdueix la contrasenya"
                  />
                  {loginError && <p className="auth-error">{loginError}</p>}
                  <button type="submit" className="auth-submit-button">Entrar</button>
                </form>
              ) : (
                <div className="auth-logged-in">
                  <p>Has iniciat sessió com <strong>{loggedInUser}</strong>.</p>
                  <button type="button" className="auth-logout-button" onClick={handleLogout}>
                    Log out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      <aside id="main-sidebar" className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <nav>
          <h2>Menú</h2>
          <ul>
            <li>
              <button type="button" className="menu-link" onClick={() => selectSection('restaurants')}>
                Visalitzar Restaurants
              </button>
            </li>
            <li>
              <button type="button" className="menu-link" onClick={() => selectSection('students')}>
                Visualitzar Alumnes
              </button>
            </li>
            <li>
              <button type="button" className="menu-link" onClick={() => selectSection('add-student')}>
                Afegir Alumne
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      <button
        type="button"
        className={`overlay ${isSidebarOpen ? 'show' : ''}`}
        onClick={() => setIsSidebarOpen(false)}
        aria-label="Cerrar menú"
      />

      <main className="main-content">
        {activeSection === 'restaurants' && (
          <section className="restaurants-section">
            <h2>Visualització de l’alumnat al restaurant</h2>
            <h3 className="restaurants-subtitle">Mapa de Google Maps</h3>
            <input
              type="search"
              className="search-input"
              placeholder="Buscar restaurant..."
              value={restaurantSearch}
              onChange={(event) => setRestaurantSearch(event.target.value)}
            />
            <div className="map-wrapper">
              <iframe
                title="Mapa de restaurants"
                src={mapUrl}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            <h3 className="restaurants-subtitle">Restaurants</h3>
            {loadingRestaurants && <p>Carregant restaurants...</p>}
            {!loadingRestaurants && restaurantsError && <p>{restaurantsError}</p>}

            {!loadingRestaurants && !restaurantsError && !selectedRestaurant && (
              <div className="restaurants-list">
                {filteredRestaurants.map((restaurant) => (
                  <article key={restaurant.id} className="restaurant-card restaurant-card-clickable">
                    <button
                      type="button"
                      className="restaurant-open-button"
                      onClick={() => setSelectedRestaurant(restaurant)}
                    >
                      <img src={restaurant.imageUrl} alt={`Foto de ${restaurant.name}`} />
                      <h4>{restaurant.name}</h4>
                    </button>
                  </article>
                ))}
              </div>
            )}

            {selectedRestaurant && (
              <article className="restaurant-profile-card">
                <button
                  type="button"
                  className="back-button"
                  onClick={() => setSelectedRestaurant(null)}
                >
                  ← Tornar al llistat
                </button>
                <img src={selectedRestaurant.imageUrl} alt={`Foto de ${selectedRestaurant.name}`} />
                <h3>Fitxa del restaurant</h3>
                <p><strong>Nom:</strong> {selectedRestaurant.name}</p>
                <p><strong>Especialitat:</strong> {selectedRestaurant.specialty}</p>
                <p><strong>Carrer:</strong> {selectedRestaurant.street}</p>

                <h4>Alumnes que hi treballen</h4>
                {studentsForSelectedRestaurant.current.length > 0 ? (
                  <ul>
                    {studentsForSelectedRestaurant.current.map((student) => (
                      <li key={`current-${student.id}`}>{student.fullName} ({student.role})</li>
                    ))}
                  </ul>
                ) : (
                  <p>No hi ha alumnes treballant actualment.</p>
                )}

                <h4>Alumnes que hi han treballat</h4>
                {studentsForSelectedRestaurant.past.length > 0 ? (
                  <ul>
                    {studentsForSelectedRestaurant.past.map((student) => (
                      <li key={`past-${student.id}`}>{student.fullName} ({student.role})</li>
                    ))}
                  </ul>
                ) : (
                  <p>No hi ha registres d’alumnes anteriors.</p>
                )}
              </article>
            )}
          </section>
        )}

        {activeSection === 'students' && (
          <section className="students-section">
            <h2>Llistat d&apos;alumnes</h2>
            <input
              type="search"
              className="search-input"
              placeholder="Buscar alumne o rol..."
              value={studentSearch}
              onChange={(event) => setStudentSearch(event.target.value)}
            />

            {loadingStudents && <p>Carregant alumnes...</p>}
            {!loadingStudents && studentsError && <p>{studentsError}</p>}

            {!loadingStudents && !studentsError && !selectedStudent && (
              <div className="students-grid">
                {filteredStudents.map((student) => (
                  <article key={student.id} className="student-card student-card-clickable">
                    <button
                      type="button"
                      className="student-open-button"
                      onClick={() => setSelectedStudent(student)}
                    >
                      <img src={student.imageUrl} alt={`Foto de ${student.fullName}`} />
                      <div>
                        <h3>{student.fullName}</h3>
                        <p>Rol: {student.role}</p>
                      </div>
                    </button>
                  </article>
                ))}
              </div>
            )}

            {selectedStudent && (
              <article className="student-profile-card">
                <button type="button" className="back-button" onClick={() => setSelectedStudent(null)}>
                  ← Tornar al llistat
                </button>
                <img src={selectedStudent.imageUrl} alt={`Foto de ${selectedStudent.fullName}`} />
                <h3>Fitxa personal</h3>
                <p><strong>Nom i cognoms:</strong> {selectedStudent.fullName}</p>
                <p><strong>On treballa:</strong> {selectedStudent.workplace}</p>
                <p><strong>Rol a la feina:</strong> {selectedStudent.role}</p>
              </article>
            )}
          </section>
        )}

        {activeSection === 'add-student' && (
          <section className="admin-page">
            <p className="admin-eyebrow">ADMINISTRACIO</p>
            <h1>Afegir Alumne</h1>
            <p className="admin-intro">
              Dona d&apos;alta un alumne nou, desa la seva foto a storage i relaciona&apos;l amb tants restaurants com calgui.
            </p>

            <div className="admin-top-grid">
              <article className="admin-panel photo-panel">
                <div className="upload-circle">
                  <span>+</span>
                </div>
                <h3>Pujar foto</h3>
                <p>Selecciona una imatge des del disc</p>

                <label htmlFor="student-status">Estat de l&apos;alumne</label>
                <select
                  id="student-status"
                  value={adminStudentStatus}
                  onChange={(event) => setAdminStudentStatus(event.target.value)}
                >
                  <option>Alumni (En actiu)</option>
                  <option>Alumni (No actiu)</option>
                </select>
              </article>

              <article className="admin-panel info-panel">
                <h3>Informacio primaria</h3>
                <label htmlFor="full-name">Nom complet</label>
                <input id="full-name" type="text" placeholder="Ex. Marc Ribas i Soler" />

                <div className="admin-two-columns">
                  <div>
                    <label htmlFor="email">Correu electronic</label>
                    <input id="email" type="email" placeholder="marc.ribas@exemple.cat" />
                  </div>
                  <div>
                    <label htmlFor="phone">Telefon de contacte</label>
                    <input id="phone" type="tel" placeholder="+34 600 000 000" />
                  </div>
                </div>

                <label htmlFor="linkedin">Perfil Linkedin</label>
                <input id="linkedin" type="text" placeholder="linkedin.com/in/usuari" />
              </article>
            </div>

            <article className="admin-panel trajectory-panel">
              <div className="trajectory-header">
                <div>
                  <p className="admin-eyebrow">TRAJECTORIA PROFESSIONAL</p>
                  <h2>Restaurants</h2>
                  <p>Selecciona restaurants existents, el rol i si hi treballa actualment.</p>
                </div>
                <button type="button" className="pill-button" onClick={addTrajectory}>
                  Afegir restaurant
                </button>
              </div>

              <label htmlFor="trajectory-filter">Filtrar restaurants pel nom</label>
              <input
                id="trajectory-filter"
                type="search"
                placeholder="Escriu el nom del restaurant"
                value={adminTrajectoryFilter}
                onChange={(event) => setAdminTrajectoryFilter(event.target.value)}
              />

              {adminTrajectories.map((trajectory, index) => (
                <div key={trajectory.id} className="trajectory-card">
                  <div className="trajectory-card-header">
                    <h3>Restaurant {index + 1}</h3>
                    {adminTrajectories.length > 1 && (
                      <button type="button" className="pill-button danger" onClick={() => removeTrajectory(trajectory.id)}>
                        Eliminar
                      </button>
                    )}
                  </div>

                  <label htmlFor={`restaurant-${trajectory.id}`}>Restaurant</label>
                  <select
                    id={`restaurant-${trajectory.id}`}
                    value={trajectory.restaurant}
                    onChange={(event) => updateTrajectory(trajectory.id, 'restaurant', event.target.value)}
                  >
                    <option value="">Selecciona un restaurant</option>
                    {filteredRestaurants.map((restaurant) => (
                      <option key={restaurant.id} value={restaurant.name}>{restaurant.name}</option>
                    ))}
                  </select>

                  <label htmlFor={`role-${trajectory.id}`}>Rol</label>
                  <input
                    id={`role-${trajectory.id}`}
                    type="text"
                    placeholder="Cap de sala, cuina, practiques..."
                    value={trajectory.role}
                    onChange={(event) => updateTrajectory(trajectory.id, 'role', event.target.value)}
                  />

                  <label className="checkbox-line" htmlFor={`current-${trajectory.id}`}>
                    <input
                      id={`current-${trajectory.id}`}
                      type="checkbox"
                      checked={trajectory.current}
                      onChange={(event) => updateTrajectory(trajectory.id, 'current', event.target.checked)}
                    />
                    Està treballant actualment en aquest restaurant
                  </label>
                </div>
              ))}
            </article>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
