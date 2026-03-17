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

    if (!Number.isNaN(parsedLat) && !Number.isNaN(parsedLng)) {
      return { lat: parsedLat, lng: parsedLng };
    }
  }

  if (typeof rawLocation === 'string') {
    const matches = rawLocation.match(/-?\d+(?:\.\d+)?/g);
    if (matches && matches.length >= 2) {
      const parsedLat = Number(matches[0]);
      const parsedLng = Number(matches[1]);
      if (!Number.isNaN(parsedLat) && !Number.isNaN(parsedLng)) {
        return { lat: parsedLat, lng: parsedLng };
      }
    }
  }

  return null;
};

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('restaurants');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentSearch, setStudentSearch] = useState('');
  const [restaurantSearch, setRestaurantSearch] = useState('');
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [studentsError, setStudentsError] = useState('');
  const [restaurants, setRestaurants] = useState([]);
  const [loadingRestaurants, setLoadingRestaurants] = useState(true);
  const [restaurantsError, setRestaurantsError] = useState('');

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
            const restaurantId =
              readFirestoreValue(relationFields.id_restaurant) ||
              readFirestoreValue(relationFields.id_restaurat) ||
              readFirestoreValue(relationFields.idRestaurant);

            let studentFirstName = '';
            let studentLastName = '';
            let studentDisplayName = alumniId || 'Alumne sense nom';

            if (alumniId) {
              const alumniResponse = await fetch(`${FIRESTORE_BASE_URL}/Alumni/${alumniId}`);
              if (alumniResponse.ok) {
                const alumniJson = await alumniResponse.json();
                const alumniFields = alumniJson.fields || {};

                studentFirstName =
                  readFirestoreValue(alumniFields.name) ||
                  readFirestoreValue(alumniFields.nom) ||
                  readFirestoreValue(alumniFields.Nombre) ||
                  readFirestoreValue(alumniFields.Name) ||
                  '';

                studentLastName =
                  readFirestoreValue(alumniFields.lastName) ||
                  readFirestoreValue(alumniFields.lastname) ||
                  readFirestoreValue(alumniFields.surname) ||
                  readFirestoreValue(alumniFields.apellido) ||
                  readFirestoreValue(alumniFields.cognom) ||
                  '';

                studentDisplayName = [studentFirstName, studentLastName].filter(Boolean).join(' ').trim() || studentFirstName || studentDisplayName;
              }
            }

            let workplace = 'No disponible';
            if (restaurantId) {
              const restaurantResponse = await fetch(`${FIRESTORE_BASE_URL}/Restaurant/${restaurantId}`);
              if (restaurantResponse.ok) {
                const restaurantJson = await restaurantResponse.json();
                const restaurantFields = restaurantJson.fields || {};
                workplace =
                  readFirestoreValue(restaurantFields.Name) ||
                  readFirestoreValue(restaurantFields.name) ||
                  workplace;
              }
            }

            return {
              id: docItem.name,
              name: studentFirstName || studentDisplayName,
              lastName: studentLastName,
              fullName: [studentFirstName, studentLastName].filter(Boolean).join(' ').trim() || studentDisplayName,
              role,
              workplace,
              imageUrl: ALUMNI_IMAGES_BY_NAME[studentDisplayName.toLowerCase()] || ALUMNI_IMAGES_BY_NAME.default
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

    const loadRestaurants = async () => {
      try {
        const restaurantResponse = await fetch(`${FIRESTORE_BASE_URL}/Restaurant`);
        if (!restaurantResponse.ok) {
          throw new Error('No restaurant docs');
        }

        const restaurantJson = await restaurantResponse.json();
        const restaurantDocs = restaurantJson.documents || [];

        const restaurantData = restaurantDocs.map((docItem) => {
          const fields = docItem.fields || {};
          const name =
            readFirestoreValue(fields.Name) ||
            readFirestoreValue(fields.name) ||
            'Restaurant sense nom';
          const locationField = readFirestoreValue(fields.Location) || 'Sense adreça';
          const coordinates = parseLocation(locationField);

          return {
            id: docItem.name,
            name,
            coordinates,
            imageUrl:
              readFirestoreValue(fields.imageUrl) ||
              readFirestoreValue(fields.image_url) ||
              readFirestoreValue(fields.foto_url) ||
              readFirestoreValue(fields.url) ||
              DEFAULT_RESTAURANT_IMAGE_URL
          };
        });

        setRestaurants(restaurantData);
        setRestaurantsError('');
      } catch (error) {
        setRestaurantsError('No s’han pogut carregar els restaurants des de Firebase.');
      } finally {
        setLoadingRestaurants(false);
      }
    };

    loadStudents();
    loadRestaurants();
  }, []);

  const filteredStudents = useMemo(() => {
    const term = studentSearch.trim().toLowerCase();
    if (!term) {
      return students;
    }

    return students.filter(
      (student) =>
        student.fullName.toLowerCase().includes(term) ||
        student.role.toLowerCase().includes(term) ||
        student.workplace.toLowerCase().includes(term)
    );
  }, [students, studentSearch]);

  const filteredRestaurants = useMemo(() => {
    const term = restaurantSearch.trim().toLowerCase();
    if (!term) {
      return restaurants;
    }

    return restaurants.filter((restaurant) => restaurant.name.toLowerCase().includes(term));
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

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const selectSection = (section) => {
    setActiveSection(section);
    if (section !== 'students') {
      setSelectedStudent(null);
    }
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
            <li>
              <button
                type="button"
                className="menu-link"
                onClick={() => selectSection('restaurants')}
              >
                Visalitzar Restaurants
              </button>
            </li>
            <li>
              <button
                type="button"
                className="menu-link"
                onClick={() => selectSection('students')}
              >
                Visualitzar Alumnes
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
            {!loadingRestaurants && !restaurantsError && (
              <div className="restaurants-list">
                {filteredRestaurants.map((restaurant) => (
                  <article key={restaurant.id} className="restaurant-card">
                    <img src={restaurant.imageUrl} alt={`Foto de ${restaurant.name}`} />
                    <h4>{restaurant.name}</h4>
                  </article>
                ))}
              </div>
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
                <button
                  type="button"
                  className="back-button"
                  onClick={() => setSelectedStudent(null)}
                >
                  ← Tornar al llistat
                </button>
                <img src={selectedStudent.imageUrl} alt={`Foto de ${selectedStudent.fullName}`} />
                <h3>Ficha personal</h3>
                <p><strong>Nombre y apellido:</strong> {selectedStudent.fullName}</p>
                <p><strong>Dónde trabaja:</strong> {selectedStudent.workplace}</p>
                <p><strong>Rol en el trabajo:</strong> {selectedStudent.role}</p>
              </article>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
