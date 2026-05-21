import { useEffect, useMemo, useRef, useState } from 'react';
import './App.css';

const FIREBASE_PROJECT_ID = 'hosteleriajoviat-94129';
const FIRESTORE_BASE_URL = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents`;
const ADMIN_EMAIL = 'evergara@joviat.cat';
const ADMIN_PASSWORDS = ['Joviat 1234', 'Joviat1234'];

const ALUMNI_IMAGES_BY_NAME = {
  'elena gilbert': 'https://i.pinimg.com/736x/53/39/cc/5339ccdd5dfb6b834fac3711e943c9b0.jpg',
  'adriana martinez': 'https://i.pinimg.com/736x/4a/c6/32/4ac632b4e50f78a532be67f7977290db.jpg',
  'joel fernandez': 'https://preview.redd.it/damon-salvatore-v0-u895ej76t5oe1.jpeg?auto=webp&s=cfa26d2aeeb5e4ab226249197879bca094019625',
  default: ''
};

const WHITE_AVATAR_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='512' height='512' viewBox='0 0 512 512'%3E%3Crect width='512' height='512' fill='%230f172a'/%3E%3Ccircle cx='256' cy='188' r='92' fill='%23ffffff'/%3E%3Cpath d='M96 452c0-88 72-160 160-160s160 72 160 160' fill='%23ffffff'/%3E%3C/svg%3E";

const DEFAULT_RESTAURANT_IMAGE_URL = WHITE_AVATAR_IMAGE;
const HOME_HERO_IMAGE = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1800&q=80';

const TRANSLATIONS = {
  ca: {
    login: 'LOGIN',
    logout: 'LOGOUT',
    menuHome: 'Inici',
    menuRestaurants: 'Restaurants',
    menuStudents: 'Alumnes',
    menuAddStudent: 'Afegir Alumne',
    menuAddRestaurant: 'Afegir Restaurant',
    menuManageEntries: 'Gestionar altes',
    heroEyebrow: 'CICLE FORMATIU HOTELERIA',
    heroTitle: 'Descobreix fins on arriba la xarxa de la Joviat',
    exploreRestaurants: 'EXPLORAR RESTAURANTS',
    exploreStudents: 'EXPLORAR ALUMNES',
    restaurantsTitle: 'Visualització de l’alumnat al restaurant',
    mapTitle: 'Mapa de Google Maps',
    searchRestaurant: 'Buscar restaurant...',
    studentsTitle: "Llistat d'alumnes",
    searchStudent: 'Buscar alumne o rol...',
    username: 'Usuari',
    password: 'Contrasenya',
    enter: 'Entrar',
    requestAccess: 'Sol·licitar accés',
    mapMode: 'Mode mapa',
    listMode: 'Mode llistat'
  },
  es: {
    login: 'INICIAR SESIÓN',
    logout: 'CERRAR SESIÓN',
    menuHome: 'Inicio',
    menuRestaurants: 'Restaurantes',
    menuStudents: 'Alumnos',
    menuAddStudent: 'Añadir Alumno',
    menuAddRestaurant: 'Añadir Restaurante',
    menuManageEntries: 'Gestionar altas',
    heroEyebrow: 'CICLO FORMATIVO HOSTELERÍA',
    heroTitle: 'Descubre hasta dónde llega la red de Joviat',
    exploreRestaurants: 'EXPLORAR RESTAURANTES',
    exploreStudents: 'EXPLORAR ALUMNOS',
    restaurantsTitle: 'Visualización del alumnado en el restaurante',
    mapTitle: 'Mapa de Google Maps',
    searchRestaurant: 'Buscar restaurante...',
    studentsTitle: 'Listado de alumnos',
    searchStudent: 'Buscar alumno o rol...',
    username: 'Usuario',
    password: 'Contraseña',
    enter: 'Entrar',
    requestAccess: 'Solicitar acceso',
    mapMode: 'Modo mapa',
    listMode: 'Modo listado'
  },
  en: {
    login: 'LOGIN',
    logout: 'LOGOUT',
    menuHome: 'Home',
    menuRestaurants: 'Restaurants',
    menuStudents: 'Students',
    menuAddStudent: 'Add Student',
    menuAddRestaurant: 'Add Restaurant',
    menuManageEntries: 'Manage Entries',
    heroEyebrow: 'HOSPITALITY PROGRAM',
    heroTitle: 'Discover how far the Joviat network reaches',
    exploreRestaurants: 'EXPLORE RESTAURANTS',
    exploreStudents: 'EXPLORE STUDENTS',
    restaurantsTitle: 'Student presence by restaurant',
    mapTitle: 'Google Maps',
    searchRestaurant: 'Search restaurant...',
    studentsTitle: 'Student list',
    searchStudent: 'Search student or role...',
    username: 'Username',
    password: 'Password',
    enter: 'Sign in',
    requestAccess: 'Request access',
    mapMode: 'Map mode',
    listMode: 'List mode'
  }
};


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
  if (Object.prototype.hasOwnProperty.call(field, 'mapValue')) {
    const mapped = {};
    const mapFields = field.mapValue.fields || {};
    Object.entries(mapFields).forEach(([key, value]) => {
      mapped[key] = readFirestoreValue(value);
    });
    return mapped;
  }
  if (Object.prototype.hasOwnProperty.call(field, 'geoPointValue')) {
    const point = field.geoPointValue || {};
    return { lat: Number(point.latitude), lng: Number(point.longitude) };
  }
  return '';
};

const parseLocation = (rawLocation) => {
  if (rawLocation && typeof rawLocation === 'object' && !Array.isArray(rawLocation)) {
    const latCandidates = [rawLocation.lat, rawLocation.latitude, rawLocation.Latitude, rawLocation.Lat];
    const lngCandidates = [rawLocation.lng, rawLocation.longitude, rawLocation.Longitude, rawLocation.Lng, rawLocation.lon, rawLocation.long];
    const parsedLat = Number(latCandidates.find((value) => value !== undefined && value !== null));
    const parsedLng = Number(lngCandidates.find((value) => value !== undefined && value !== null));
    if (!Number.isNaN(parsedLat) && !Number.isNaN(parsedLng)) return { lat: parsedLat, lng: parsedLng };
  }

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

const normalizeLinkedinUrl = (value) => {
  if (!value || value === 'No disponible') return '';
  if (value.startsWith('http://') || value.startsWith('https://')) return value;
  return `https://${value}`;
};

const fileToDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result || ''));
  reader.onerror = () => reject(new Error('No s’ha pogut llegir la imatge'));
  reader.readAsDataURL(file);
});

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAuthMenuOpen, setIsAuthMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loggedInUser, setLoggedInUser] = useState('');
  const [activeSection, setActiveSection] = useState('home');
  const [activeLanguage, setActiveLanguage] = useState('ca');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isEditingStudent, setIsEditingStudent] = useState(false);
  const [studentEditForm, setStudentEditForm] = useState({ fullName: '', studies: '', promotionYear: '', email: '', phone: '', linkedin: '', instagram: '' });
  const [studentProfileMessage, setStudentProfileMessage] = useState('');
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [studentSearch, setStudentSearch] = useState('');
  const [studentEmploymentFilter, setStudentEmploymentFilter] = useState('all');
  const [studentPromotionYearFilter, setStudentPromotionYearFilter] = useState('all');
  const [selectedStudyFilters, setSelectedStudyFilters] = useState([]);
  const [selectedProfileFilters, setSelectedProfileFilters] = useState([]);
  const [isStudiesFilterOpen, setIsStudiesFilterOpen] = useState(true);
  const [isProfileFilterOpen, setIsProfileFilterOpen] = useState(true);
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
  const [adminPhotoPreview, setAdminPhotoPreview] = useState('');
  const [adminForm, setAdminForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    linkedin: '',
    instagram: '',
    bio: '',
    password: '',
    promotionYear: '',
    studies: []
  });
  const [isStudiesOpenAddStudent, setIsStudiesOpenAddStudent] = useState(true);
  const [saveStudentError, setSaveStudentError] = useState('');
  const [saveStudentSuccess, setSaveStudentSuccess] = useState('');
  const fileInputRef = useRef(null);
  const profilePhotoInputRef = useRef(null);
  const [profilePhotoStatus, setProfilePhotoStatus] = useState('');
  const restaurantPhotoInputRef = useRef(null);
  const [restaurantForm, setRestaurantForm] = useState({
    name: '',
    specialty: '',
    street: '',
    email: '',
    phone: '',
    web: '',
    googleMapsUrl: '',
    latitude: '',
    longitude: '',
    rating: '',
    businessStatus: '',
    placeId: ''
  });
  const [placesResults, setPlacesResults] = useState([]);
  const [selectedPlaceIndex, setSelectedPlaceIndex] = useState('');
  const [restaurantPhotoPreview, setRestaurantPhotoPreview] = useState('');
  const [saveRestaurantError, setSaveRestaurantError] = useState('');
  const [saveRestaurantSuccess, setSaveRestaurantSuccess] = useState('');
  const [studentProfileSourceRestaurantId, setStudentProfileSourceRestaurantId] = useState(null);
  const [pendingAdminSection, setPendingAdminSection] = useState('');
  const [manageEntriesTab, setManageEntriesTab] = useState('users');
  const [pendingUserRequests, setPendingUserRequests] = useState([
    { id: 'req-user-1', name: 'Sandra Jo Solà', email: 'sjo@joviat.cat' }
  ]);
  const [pendingVenueRequests, setPendingVenueRequests] = useState([]);
  const [manageModal, setManageModal] = useState(null);
  const [showRequestAccess, setShowRequestAccess] = useState(false);
  const [accessRequestForm, setAccessRequestForm] = useState({ email: '', fullName: '' });
  const [accessRequestMessage, setAccessRequestMessage] = useState('');
  const [restaurantViewMode, setRestaurantViewMode] = useState('map');
  const [restaurantPage, setRestaurantPage] = useState(1);
  const [isEditingRestaurant, setIsEditingRestaurant] = useState(false);
  const [restaurantProfileMessage, setRestaurantProfileMessage] = useState('');
  const [editingRestaurantId, setEditingRestaurantId] = useState('');
  const mapContainerRef = useRef(null);
  const leafletMapRef = useRef(null);
  const leafletMarkersRef = useRef([]);
  const t = (key) => TRANSLATIONS[activeLanguage]?.[key] || TRANSLATIONS.ca[key] || key;

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
          const locationField =
            readFirestoreValue(fields.Location) ||
            readFirestoreValue(fields.location) ||
            readFirestoreValue(fields.coordinates) ||
            readFirestoreValue(fields.Coordinates) ||
            '';
          const fallbackCoordinates = parseLocation({
            lat: readFirestoreValue(fields.lat) || readFirestoreValue(fields.latitude),
            lng: readFirestoreValue(fields.lng) || readFirestoreValue(fields.longitude)
          });
          const coordinates = parseLocation(locationField) || fallbackCoordinates;
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
            email:
              readFirestoreValue(fields.email) ||
              readFirestoreValue(fields.correu) ||
              'No disponible',
            phone:
              readFirestoreValue(fields.phone) ||
              readFirestoreValue(fields.telefon) ||
              readFirestoreValue(fields.telefono) ||
              'No disponible',
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
            let alumniFields = {};

            if (alumniId) {
              const alumniResponse = await fetch(`${FIRESTORE_BASE_URL}/Alumni/${alumniId}`);
              if (alumniResponse.ok) {
                const alumniJson = await alumniResponse.json();
                alumniFields = alumniJson.fields || {};
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
              alumniId,
              fullName: [firstName, lastName].filter(Boolean).join(' ').trim() || fallbackName,
              role,
              workplace,
              restaurantId,
              currentJob,
              imageUrl:
                readFirestoreValue(alumniFields?.imageUrl) ||
                readFirestoreValue(alumniFields?.image_url) ||
                ALUMNI_IMAGES_BY_NAME[fallbackName.toLowerCase()] ||
                ALUMNI_IMAGES_BY_NAME.default ||
                WHITE_AVATAR_IMAGE,
              email:
                readFirestoreValue(alumniFields?.email) ||
                readFirestoreValue(alumniFields?.correu) ||
                readFirestoreValue(alumniFields?.mail) ||
                'No disponible',
              phone:
                readFirestoreValue(alumniFields?.phone) ||
                readFirestoreValue(alumniFields?.telefon) ||
                readFirestoreValue(alumniFields?.telefono) ||
                'No disponible',
              linkedin:
                readFirestoreValue(alumniFields?.linkedin) ||
                readFirestoreValue(alumniFields?.linkedIn) ||
                readFirestoreValue(alumniFields?.linkedin_url) ||
                'No disponible',
              instagram:
                readFirestoreValue(alumniFields?.instagram) ||
                readFirestoreValue(alumniFields?.insta) ||
                'No disponible',
              studies:
                readFirestoreValue(alumniFields?.studies) ||
                readFirestoreValue(alumniFields?.estudis) ||
                readFirestoreValue(alumniFields?.study) ||
                'Estudis no informats',
              promotionYear:
                readFirestoreValue(alumniFields?.promotionYear) ||
                readFirestoreValue(alumniFields?.promocio) ||
                ''
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

  useEffect(() => () => {
    if (adminPhotoPreview.startsWith('blob:')) {
      URL.revokeObjectURL(adminPhotoPreview);
    }
  }, [adminPhotoPreview]);

  useEffect(() => {
    setProfilePhotoStatus('');
  }, [selectedStudent?.id]);

  const filteredStudents = useMemo(() => {
    const term = studentSearch.trim().toLowerCase();
    return students.filter((student) => {
      const matchesSearch = !term
        || student.fullName.toLowerCase().includes(term)
        || student.role.toLowerCase().includes(term)
        || student.workplace.toLowerCase().includes(term);

      const isCurrent = parseBoolean(student.currentJob);
      const matchesEmployment = studentEmploymentFilter === 'all'
        || (studentEmploymentFilter === 'current' && isCurrent)
        || (studentEmploymentFilter === 'past' && !isCurrent);

      const studentYear = Number(String(student.promotionYear || '').trim());
      const matchesPromotionYear = studentPromotionYearFilter === 'all'
        || (!Number.isNaN(studentYear) && studentYear === Number(studentPromotionYearFilter));

      const studentStudiesText = String(student.studies || student.study || student.cycle || '').toLowerCase();
      const studentProfileText = String(student.role || '').toLowerCase();
      const matchesStudies = selectedStudyFilters.length === 0
        || selectedStudyFilters.some((study) => studentStudiesText.includes(study.toLowerCase()));
      const matchesProfiles = selectedProfileFilters.length === 0
        || selectedProfileFilters.some((profile) => studentProfileText.includes(profile.toLowerCase()));

      return matchesSearch && matchesEmployment && matchesPromotionYear && matchesStudies && matchesProfiles;
    });
  }, [students, studentSearch, studentEmploymentFilter, studentPromotionYearFilter, selectedStudyFilters, selectedProfileFilters]);

  const promotionYearOptions = useMemo(() => {
    const detected = students
      .map((student) => Number(String(student.promotionYear || '').trim()))
      .filter((year) => !Number.isNaN(year));
    const currentYear = new Date().getFullYear();
    const fallbackYears = Array.from({ length: 18 }, (_, idx) => currentYear - idx);
    return Array.from(new Set([...detected, ...fallbackYears])).sort((a, b) => b - a);
  }, [students]);

  const studyOptions = useMemo(() => {
    const defaults = [
      'CFGM Cuina i gastronomia i Serveis en restauració',
      'CFGM Pastisseria, forneria i confiteria',
      'CFGS Direcció de cuina',
      'Programa Intensiu de Cuina Catalana',
      'Diploma de Sommelier',
      'FP Hoteleria'
    ];
    return defaults;
  }, []);

  const profileOptions = useMemo(() => ([
    'Restaurador/a o Propietari/a',
    'Professional de Sala',
    'Professional de Cuina',
    'Professional de Pastisseria i/o Forneria',
    'Direcció-Gerència',
    'Docència'
  ]), []);

  const toggleStudentFilter = (value, setter) => {
    setter((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]));
  };

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

    const allPinsQuery = filteredRestaurants
      .map((restaurant) => (
        restaurant.coordinates
          ? `${restaurant.coordinates.lat},${restaurant.coordinates.lng}`
          : restaurant.name
      ))
      .join('|');
    return `https://www.google.com/maps?q=${encodeURIComponent(allPinsQuery)}&z=13&output=embed`;
  }, [filteredRestaurants]);

  const restaurantProfileMapUrl = useMemo(() => {
    if (!selectedRestaurant) return '';
    if (selectedRestaurant.coordinates) {
      const { lat, lng } = selectedRestaurant.coordinates;
      return `https://www.google.com/maps?q=${lat},${lng}&z=16&output=embed`;
    }
    return `https://www.google.com/maps?q=${encodeURIComponent(selectedRestaurant.name)}&z=16&output=embed`;
  }, [selectedRestaurant]);

  const restaurantEditPreviewMapUrl = useMemo(() => {
    const lat = Number(String(restaurantForm.latitude || '').trim());
    const lng = Number(String(restaurantForm.longitude || '').trim());
    if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
      return `https://www.google.com/maps?q=${lat},${lng}&z=17&output=embed`;
    }

    const streetQuery = (restaurantForm.street || '').trim();
    const nameQuery = (restaurantForm.name || '').trim();

    if (selectedRestaurant?.coordinates) {
      const { lat, lng } = selectedRestaurant.coordinates;
      return `https://www.google.com/maps?q=${lat},${lng}&z=17&output=embed`;
    }

    if (streetQuery) {
      return `https://www.google.com/maps?q=${encodeURIComponent(streetQuery)}&z=17&output=embed`;
    }

    if (nameQuery) {
      return `https://www.google.com/maps?q=${encodeURIComponent(nameQuery)}&z=17&output=embed`;
    }

    return 'https://www.google.com/maps?q=Barcelona&z=13&output=embed';
  }, [isEditingRestaurant, restaurantForm.street, restaurantForm.name, restaurantForm.latitude, restaurantForm.longitude, selectedRestaurant]);

  const restaurantsForSelectedStudent = useMemo(() => {
    if (!selectedStudent) return [];

    const relatedRows = students.filter((student) => {
      if (selectedStudent.alumniId && student.alumniId) {
        return student.alumniId === selectedStudent.alumniId;
      }
      return student.id === selectedStudent.id;
    });

    const uniqueByRestaurant = new Map();
    relatedRows.forEach((item) => {
      if (!item.restaurantId && !item.workplace) return;
      const key = item.restaurantId || item.workplace;
      uniqueByRestaurant.set(key, {
        restaurantId: item.restaurantId,
        workplace: item.workplace,
        role: item.role,
        currentJob: item.currentJob
      });
    });
    return Array.from(uniqueByRestaurant.values());
  }, [selectedStudent, students]);

  const studentsForSelectedRestaurant = useMemo(() => {
    if (!selectedRestaurant) return { current: [], past: [] };

    const matched = students.filter((student) => student.restaurantId === selectedRestaurant.id);
    return {
      current: matched.filter((student) => student.currentJob),
      past: matched.filter((student) => !student.currentJob)
    };
  }, [selectedRestaurant, students]);

  const getRestaurantImageById = (restaurantId) => {
    if (!restaurantId) return WHITE_AVATAR_IMAGE;
    const restaurant = restaurants.find((item) => item.id === restaurantId);
    return restaurant?.imageUrl || WHITE_AVATAR_IMAGE;
  };

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

    const normalizedUsername = username.toLowerCase();
    const isConfiguredAdminLogin =
      (normalizedUsername === 'admin' || normalizedUsername === ADMIN_EMAIL) &&
      ADMIN_PASSWORDS.includes(password);
    const isAdminAlias = normalizedUsername === 'admin' || normalizedUsername === ADMIN_EMAIL;

    if (isAdminAlias && !isConfiguredAdminLogin) {
      setLoginError('Contrasenya d’admin incorrecta.');
      return;
    }

    setIsLoggedIn(true);
    setIsAdmin(isConfiguredAdminLogin);
    setLoggedInUser(username);
    setLoginForm({ username: '', password: '' });
    setLoginError('');
    setIsAuthMenuOpen(false);
  };

  const handleLogout = () => {
    const shouldLogout = window.confirm('Vols tancar la sessió ara?');
    if (!shouldLogout) return;
    setIsLoggedIn(false);
    setIsAdmin(false);
    setLoggedInUser('');
    if (['add-student', 'add-restaurant', 'manage-entries', 'admin-lock'].includes(activeSection)) {
      setActiveSection('restaurants');
    }
    setLoginForm({ username: '', password: '' });
    setLoginError('');
    setIsAuthMenuOpen(false);
  };

  const selectSection = (section) => {
    const adminSections = ['add-student', 'add-restaurant', 'manage-entries'];
    if (adminSections.includes(section) && !(isLoggedIn && isAdmin)) {
      setPendingAdminSection(section);
      setActiveSection('admin-lock');
      setIsSidebarOpen(false);
      return;
    }

    setActiveSection(section);
    setPendingAdminSection('');
    if (['students', 'restaurants', 'add-student', 'add-restaurant', 'manage-entries'].includes(section)) {
      setSelectedStudent(null);
      setSelectedRestaurant(null);
    }
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

  const openPhotoPicker = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const nextPreview = URL.createObjectURL(file);
    setAdminPhotoPreview((prevPreview) => {
      if (prevPreview.startsWith('blob:')) {
        URL.revokeObjectURL(prevPreview);
      }
      return nextPreview;
    });
  };

  const handleAdminInputChange = (event) => {
    const { name, value } = event.target;
    setAdminForm((prev) => ({ ...prev, [name]: value }));
  };

  const addStudentStudyOptions = [
    'CFGM Cuina i gastronomia i Serveis en restauració',
    'CFGM Pastisseria, forneria i confiteria',
    'CFGS Direcció de cuina',
    'Programa Intensiu de Cuina Catalana',
    'Diploma de Sommelier',
    'Advanced Sommelier Postgraduate Degree',
    'FP Hoteleria',
    'Diplomatura de Turisme'
  ];

  const promotionYearFormOptions = ['Actualment estudiant', ...Array.from({ length: 18 }, (_, i) => String(new Date().getFullYear() - i))];

  const handleSaveStudent = async () => {
    const fullName = adminForm.fullName.trim();
    const email = adminForm.email.trim();
    const hasValidTrajectory = adminTrajectories.some(
      (trajectory) => trajectory.restaurant.trim() && trajectory.role.trim()
    );

    if (!fullName || !email || !hasValidTrajectory) {
      setSaveStudentSuccess('');
      setSaveStudentError('Per guardar cal omplir: nom complet, correu electrònic i almenys un restaurant amb rol.');
      return;
    }

    const validTrajectories = adminTrajectories.filter(
      (trajectory) => trajectory.restaurant.trim() && trajectory.role.trim()
    );
    const firstTrajectory = validTrajectories[0];
    const matchedRestaurant = restaurants.find((restaurant) => restaurant.name === firstTrajectory.restaurant);
    const [firstName, ...restNames] = fullName.split(' ');
    const lastName = restNames.join(' ').trim();
    const alumniId = `alumni_${Date.now()}`;

    try {
      const alumniPayload = {
        fields: {
          name: { stringValue: firstName || fullName },
          lastName: { stringValue: lastName },
          email: { stringValue: email },
          phone: { stringValue: adminForm.phone.trim() || '' },
          linkedin: { stringValue: adminForm.linkedin.trim() || '' },
          instagram: { stringValue: adminForm.instagram.trim() || '' },
          bio: { stringValue: adminForm.bio.trim() || '' },
          promotionYear: { stringValue: adminForm.promotionYear.trim() || '' },
          studies: { stringValue: adminForm.studies.join(' · ') },
          password: { stringValue: adminForm.password.trim() || '' }
        }
      };

      const alumniResponse = await fetch(`${FIRESTORE_BASE_URL}/Alumni?documentId=${encodeURIComponent(alumniId)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alumniPayload)
      });

      if (!alumniResponse.ok) {
        throw new Error('No s’ha pogut guardar l’alumne a Firebase');
      }

      await Promise.all(
        validTrajectories.map(async (trajectory, index) => {
          const restaurant = restaurants.find((item) => item.name === trajectory.restaurant.trim());
          const relationPayload = {
            fields: {
              id_alumni: { stringValue: alumniId },
              id_restaurant: { stringValue: restaurant?.id || '' },
              rol: { stringValue: trajectory.role.trim() },
              current_job: { booleanValue: Boolean(trajectory.current) }
            }
          };

          const relationResponse = await fetch(
            `${FIRESTORE_BASE_URL}/Rest-Alum?documentId=${encodeURIComponent(`manual_${Date.now()}_${index}`)}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(relationPayload)
            }
          );

          if (!relationResponse.ok) {
            throw new Error('No s’ha pogut guardar la relació alumne-restaurant a Firebase');
          }
        })
      );

      const newStudent = {
        id: `manual-${Date.now()}`,
        alumniId,
        fullName,
        role: firstTrajectory.role.trim(),
        workplace: firstTrajectory.restaurant.trim(),
        restaurantId: matchedRestaurant?.id || '',
        currentJob: Boolean(firstTrajectory.current),
        imageUrl: adminPhotoPreview || WHITE_AVATAR_IMAGE,
        email: adminForm.email.trim(),
        phone: adminForm.phone.trim() || 'No disponible',
        linkedin: adminForm.linkedin.trim() || 'No disponible',
        instagram: adminForm.instagram.trim() || 'No disponible',
        studies: adminForm.studies.join(' · ') || 'Estudis no informats',
        promotionYear: adminForm.promotionYear || ''
      };

      setStudents((prev) => [newStudent, ...prev]);
      openStudentProfile(newStudent);
      setSaveStudentError('');
      setSaveStudentSuccess('Alumne guardat correctament a Firebase.');

      setAdminForm({ fullName: '', email: '', phone: '', linkedin: '', instagram: '', bio: '', password: '', promotionYear: '', studies: [] });
      setAdminStudentStatus('Alumni (En actiu)');
      setAdminTrajectoryFilter('');
      setAdminTrajectories([{ id: 1, restaurant: '', role: '', current: true }]);
      setAdminPhotoPreview('');
    } catch (error) {
      setSaveStudentSuccess('');
      setSaveStudentError('No s’ha pogut guardar a Firebase. Revisa la connexió/permisos i torna-ho a provar.');
    }
  };

  const openProfilePhotoPicker = () => {
    profilePhotoInputRef.current?.click();
  };

  const handleProfilePhotoChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !selectedStudent) return;

    try {
      const imageDataUrl = await fileToDataUrl(file);

      if (selectedStudent.alumniId) {
        const patchPayload = {
          fields: {
            imageUrl: { stringValue: imageDataUrl }
          }
        };
        const patchResponse = await fetch(
          `${FIRESTORE_BASE_URL}/Alumni/${encodeURIComponent(selectedStudent.alumniId)}?updateMask.fieldPaths=imageUrl`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(patchPayload)
          }
        );

        if (!patchResponse.ok) {
          throw new Error('No s’ha pogut actualitzar la foto a Firebase');
        }
      }

      setStudents((prev) =>
        prev.map((student) => (
          student.id === selectedStudent.id
            ? { ...student, imageUrl: imageDataUrl }
            : student
        ))
      );
      setSelectedStudent((prev) => (prev ? { ...prev, imageUrl: imageDataUrl } : prev));
      setProfilePhotoStatus('Foto actualitzada correctament.');
    } catch (error) {
      setProfilePhotoStatus('No s’ha pogut actualitzar la foto.');
    }
  };

  const openRestaurantPhotoPicker = () => {
    restaurantPhotoInputRef.current?.click();
  };

  const handleRestaurantPhotoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const imageDataUrl = await fileToDataUrl(file);
      setRestaurantPhotoPreview(imageDataUrl);
    } catch (error) {
      setSaveRestaurantError('No s’ha pogut carregar la imatge del restaurant.');
    }
  };

  const handleRestaurantInputChange = (event) => {
    const { name, value } = event.target;
    setRestaurantForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearchPlaces = async () => {
    const query = (restaurantForm.name || '').trim();
    if (!query) return;
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(query)}&limit=8`);
      const data = await response.json();
      const mapped = (Array.isArray(data) ? data : []).map((item) => ({
        name: item.name || query,
        displayName: item.display_name || query,
        latitude: item.lat || '',
        longitude: item.lon || '',
        placeId: item.place_id ? String(item.place_id) : ''
      }));
      setPlacesResults(mapped);
      setSelectedPlaceIndex('');
    } catch (error) {
      setPlacesResults([]);
    }
  };

  const handleAutocompletePlace = () => {
    if (!placesResults.length) return;
    const place = selectedPlaceIndex !== '' ? placesResults[Number(selectedPlaceIndex)] : placesResults[0];
    if (!place) return;
    setRestaurantForm((prev) => ({
      ...prev,
      name: prev.name || place.name,
      street: place.displayName || prev.street,
      latitude: String(place.latitude || prev.latitude || ''),
      longitude: String(place.longitude || prev.longitude || ''),
      placeId: place.placeId || prev.placeId,
      googleMapsUrl: `https://maps.google.com/?q=${encodeURIComponent(place.displayName || prev.name || '')}`
    }));
  };

  const handleSaveRestaurant = async () => {
    const name = restaurantForm.name.trim();
    const specialty = restaurantForm.specialty.trim();
    const street = restaurantForm.street.trim();
    const email = (restaurantForm.email || '').trim();
    const phone = (restaurantForm.phone || '').trim();
    const web = (restaurantForm.web || '').trim();
    const googleMapsUrl = (restaurantForm.googleMapsUrl || '').trim();
    const latitude = Number(String(restaurantForm.latitude || '').trim());
    const longitude = Number(String(restaurantForm.longitude || '').trim());
    const rating = (restaurantForm.rating || '').trim();
    const businessStatus = (restaurantForm.businessStatus || '').trim();
    const placeId = (restaurantForm.placeId || '').trim();

    if (!name || !street) {
      setSaveRestaurantSuccess('');
      setSaveRestaurantError('Per guardar el restaurant cal omplir nom i carrer.');
      return;
    }

    const isEditMode = Boolean(editingRestaurantId);
    const restaurantId = isEditMode ? editingRestaurantId : `restaurant_${Date.now()}`;
    const payload = {
      fields: {
        Name: { stringValue: name },
        specialty: { stringValue: specialty || 'No disponible' },
        street: { stringValue: street },
        email: { stringValue: email },
        phone: { stringValue: phone },
        imageUrl: { stringValue: restaurantPhotoPreview || WHITE_AVATAR_IMAGE },
        web: { stringValue: web },
        googleMapsUrl: { stringValue: googleMapsUrl },
        rating: { stringValue: rating },
        businessStatus: { stringValue: businessStatus },
        placeId: { stringValue: placeId },
        latitude: { stringValue: Number.isNaN(latitude) ? '' : String(latitude) },
        longitude: { stringValue: Number.isNaN(longitude) ? '' : String(longitude) }
      }
    };

    try {
      const endpoint = isEditMode
        ? `${FIRESTORE_BASE_URL}/Restaurant/${encodeURIComponent(restaurantId)}?updateMask.fieldPaths=Name&updateMask.fieldPaths=specialty&updateMask.fieldPaths=street&updateMask.fieldPaths=email&updateMask.fieldPaths=phone&updateMask.fieldPaths=imageUrl&updateMask.fieldPaths=web&updateMask.fieldPaths=googleMapsUrl&updateMask.fieldPaths=rating&updateMask.fieldPaths=businessStatus&updateMask.fieldPaths=placeId&updateMask.fieldPaths=latitude&updateMask.fieldPaths=longitude`
        : `${FIRESTORE_BASE_URL}/Restaurant?documentId=${encodeURIComponent(restaurantId)}`;

      const response = await fetch(endpoint, {
        method: isEditMode ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('No s’ha pogut guardar el restaurant');
      }

      const newRestaurant = {
        id: restaurantId,
        firestoreName: `${FIRESTORE_BASE_URL}/Restaurant/${restaurantId}`,
        name,
        specialty: specialty || 'No disponible',
        street,
        email: email || 'No disponible',
        phone: phone || 'No disponible',
        coordinates: !Number.isNaN(latitude) && !Number.isNaN(longitude) ? { lat: latitude, lng: longitude } : null,
        imageUrl: restaurantPhotoPreview || WHITE_AVATAR_IMAGE
      };

      setRestaurants((prev) => (
        isEditMode
          ? prev.map((restaurant) => (restaurant.id === restaurantId ? newRestaurant : restaurant))
          : [newRestaurant, ...prev]
      ));
      openRestaurantProfile(newRestaurant.id);
      setSaveRestaurantError('');
      setSaveRestaurantSuccess(isEditMode ? 'Restaurant actualitzat correctament a Firebase.' : 'Restaurant guardat correctament a Firebase.');
      setRestaurantForm({ name: '', specialty: '', street: '', email: '', phone: '', web: '', googleMapsUrl: '', latitude: '', longitude: '', rating: '', businessStatus: '', placeId: '' });
      setRestaurantPhotoPreview('');
      setEditingRestaurantId('');
      setIsEditingRestaurant(false);
    } catch (error) {
      setSaveRestaurantSuccess('');
      setSaveRestaurantError('No s’ha pogut guardar el restaurant a Firebase.');
    }
  };

  const openStudentProfile = (student) => {
    setStudentProfileSourceRestaurantId(null);
    setActiveSection('student-profile');
    setSelectedStudent(student);
    setIsEditingStudent(false);
    setStudentProfileMessage('');
    setSelectedRestaurant(null);
    setIsSidebarOpen(false);
  };

  const openStudentProfileFromRestaurant = (student, restaurantId) => {
    setStudentProfileSourceRestaurantId(restaurantId || null);
    setActiveSection('student-profile');
    setSelectedStudent(student);
    setIsEditingStudent(false);
    setStudentProfileMessage('');
    setSelectedRestaurant(null);
    setIsSidebarOpen(false);
  };

  const openRestaurantProfile = (restaurantId) => {
    const restaurantMatch = restaurants.find((restaurant) => restaurant.id === restaurantId);
    if (!restaurantMatch) return;

    setActiveSection('restaurant-profile');
    setSelectedRestaurant(restaurantMatch);
    setSelectedStudent(null);
    setStudentProfileSourceRestaurantId(null);
    setIsEditingRestaurant(false);
    setIsSidebarOpen(false);
  };


  const startRestaurantEdit = () => {
    if (!selectedRestaurant) return;
    setEditingRestaurantId(selectedRestaurant.id);
    setRestaurantForm({
      name: selectedRestaurant.name || '',
      specialty: selectedRestaurant.specialty === 'No disponible' ? '' : selectedRestaurant.specialty || '',
      street: typeof selectedRestaurant.street === 'string'
        ? selectedRestaurant.street
        : Array.isArray(selectedRestaurant.street)
          ? selectedRestaurant.street.join(', ')
          : String(selectedRestaurant.street || ''),
      email: selectedRestaurant.email === 'No disponible' ? '' : selectedRestaurant.email || '',
      phone: selectedRestaurant.phone === 'No disponible' ? '' : selectedRestaurant.phone || '',
      web: selectedRestaurant.web === 'No disponible' ? '' : selectedRestaurant.web || '',
      googleMapsUrl: selectedRestaurant.googleMapsUrl || '',
      latitude: selectedRestaurant.coordinates?.lat ? String(selectedRestaurant.coordinates.lat) : '',
      longitude: selectedRestaurant.coordinates?.lng ? String(selectedRestaurant.coordinates.lng) : '',
      rating: selectedRestaurant.rating || '',
      businessStatus: selectedRestaurant.businessStatus || '',
      placeId: selectedRestaurant.placeId || ''
    });
    setRestaurantPhotoPreview(selectedRestaurant.imageUrl || '');
    setRestaurantProfileMessage('');
    setIsEditingRestaurant(true);
    selectSection('add-restaurant');
  };

  const handleDeleteRestaurant = async () => {
    if (!selectedRestaurant) return;

    const confirmed = window.confirm(`Vols eliminar ${selectedRestaurant.name}? Aquesta acció no es pot desfer.`);
    if (!confirmed) return;

    try {
      const response = await fetch(`${FIRESTORE_BASE_URL}/Restaurant/${encodeURIComponent(selectedRestaurant.id)}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('No s’ha pogut eliminar el restaurant.');

      setRestaurants((prev) => prev.filter((restaurant) => restaurant.id !== selectedRestaurant.id));
      setSelectedRestaurant(null);
      setIsEditingRestaurant(false);
      setEditingRestaurantId('');
      setRestaurantProfileMessage('');
      selectSection('restaurants');
    } catch (error) {
      setRestaurantProfileMessage('No s’ha pogut eliminar el restaurant.');
    }
  };

  const handleBackFromStudentProfile = () => {
    if (studentProfileSourceRestaurantId) {
      openRestaurantProfile(studentProfileSourceRestaurantId);
      return;
    }
    selectSection('students');
  };

  const startStudentEdit = () => {
    if (!selectedStudent) return;
    setStudentEditForm({
      fullName: selectedStudent.fullName || '',
      studies: selectedStudent.studies || '',
      promotionYear: selectedStudent.promotionYear || '',
      email: selectedStudent.email === 'No disponible' ? '' : selectedStudent.email || '',
      phone: selectedStudent.phone === 'No disponible' ? '' : selectedStudent.phone || '',
      linkedin: selectedStudent.linkedin === 'No disponible' ? '' : selectedStudent.linkedin || '',
      instagram: selectedStudent.instagram === 'No disponible' ? '' : selectedStudent.instagram || ''
    });
    setIsEditingStudent(true);
    setStudentProfileMessage('');
  };

  const handleStudentEditInputChange = (event) => {
    const { name, value } = event.target;
    setStudentEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveStudentEdit = async () => {
    if (!selectedStudent) return;
    const alumniId = selectedStudent.alumniId;
    if (!alumniId) {
      setStudentProfileMessage('No s’ha trobat l’identificador d’alumni.');
      return;
    }

    const [firstName, ...lastParts] = studentEditForm.fullName.trim().split(' ');
    const lastName = lastParts.join(' ').trim();
    const payload = {
      fields: {
        name: { stringValue: firstName || '' },
        lastName: { stringValue: lastName || '' },
        email: { stringValue: studentEditForm.email.trim() },
        phone: { stringValue: studentEditForm.phone.trim() },
        linkedin: { stringValue: studentEditForm.linkedin.trim() },
        instagram: { stringValue: studentEditForm.instagram.trim() },
        studies: { stringValue: studentEditForm.studies.trim() },
        promotionYear: { stringValue: studentEditForm.promotionYear.trim() }
      }
    };

    try {
      const response = await fetch(`${FIRESTORE_BASE_URL}/Alumni/${encodeURIComponent(alumniId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error('No update');

      const updated = {
        ...selectedStudent,
        fullName: studentEditForm.fullName.trim() || selectedStudent.fullName,
        email: studentEditForm.email.trim() || 'No disponible',
        phone: studentEditForm.phone.trim() || 'No disponible',
        linkedin: studentEditForm.linkedin.trim() || 'No disponible',
        instagram: studentEditForm.instagram.trim() || 'No disponible',
        studies: studentEditForm.studies.trim() || 'Estudis no informats',
        promotionYear: studentEditForm.promotionYear.trim()
      };

      setStudents((prev) => prev.map((item) => (item.alumniId === alumniId ? { ...item, ...updated } : item)));
      setSelectedStudent(updated);
      setIsEditingStudent(false);
      setStudentProfileMessage('Alumni actualitzat correctament.');
    } catch (error) {
      setStudentProfileMessage('No s’ha pogut actualitzar l’alumni.');
    }
  };

  const handleDeleteStudent = async () => {
    if (!selectedStudent?.alumniId) return;
    if (!window.confirm(`Vols eliminar ${selectedStudent.fullName}?`)) return;
    try {
      const response = await fetch(`${FIRESTORE_BASE_URL}/Alumni/${encodeURIComponent(selectedStudent.alumniId)}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('No delete');
      setStudents((prev) => prev.filter((item) => item.alumniId !== selectedStudent.alumniId));
      setSelectedStudent(null);
      selectSection('students');
    } catch (error) {
      setStudentProfileMessage('No s’ha pogut eliminar l’alumni.');
    }
  };

  useEffect(() => {
    const loadLeaflet = async () => {
      if (!mapContainerRef.current || activeSection !== 'restaurants') return;

      if (!document.querySelector("link[data-leaflet='true']")) {
        const leafletCss = document.createElement('link');
        leafletCss.rel = 'stylesheet';
        leafletCss.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        leafletCss.dataset.leaflet = 'true';
        document.head.appendChild(leafletCss);
      }

      if (!window.L) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.async = true;
          script.onload = resolve;
          script.onerror = reject;
          document.body.appendChild(script);
        });
      }

      if (!leafletMapRef.current && window.L) {
        leafletMapRef.current = window.L.map(mapContainerRef.current).setView([41.8, 1.9], 8);
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(leafletMapRef.current);
      }

      if (!leafletMapRef.current) return;

      setTimeout(() => {
        leafletMapRef.current?.invalidateSize();
      }, 0);

      leafletMarkersRef.current.forEach((marker) => marker.remove());
      leafletMarkersRef.current = [];

      const restaurantsWithCoordinates = filteredRestaurants.filter((restaurant) => restaurant.coordinates);

      restaurantsWithCoordinates.forEach((restaurant) => {
        if (!restaurant.coordinates) return;
        const marker = window.L.marker([restaurant.coordinates.lat, restaurant.coordinates.lng]).addTo(leafletMapRef.current);
        marker.bindPopup(`
          <div class="restaurant-map-popup">
            <button class="map-popup-close" type="button" onclick="this.closest('.leaflet-popup').querySelector('.leaflet-popup-close-button')?.click()">×</button>
            <img src="${restaurant.imageUrl || WHITE_AVATAR_IMAGE}" alt="Foto de ${restaurant.name}" />
            <div class="popup-chip">RESTAURANT</div>
            <h4>${restaurant.name}</h4>
            <p>📍 ${restaurant.street || 'No disponible'}</p>
            <p>${students.filter((student) => student.restaurantId === restaurant.id).length} alumni associats</p>
            <button class="map-popup-details" data-restaurant-id="${restaurant.id}">VEURE DETALLS</button>
          </div>
        `);
        marker.on('popupopen', () => {
          const button = document.querySelector(`.map-popup-details[data-restaurant-id="${restaurant.id}"]`);
          if (button) {
            button.addEventListener('click', () => openRestaurantProfile(restaurant.id), { once: true });
          }
        });
        leafletMarkersRef.current.push(marker);
      });

      if (restaurantsWithCoordinates.length > 0) {
        const bounds = window.L.latLngBounds(
          restaurantsWithCoordinates.map((restaurant) => [restaurant.coordinates.lat, restaurant.coordinates.lng])
        );
        leafletMapRef.current.fitBounds(bounds.pad(0.2));
      } else {
        leafletMapRef.current.setView([41.8, 1.9], 8);
      }
    };

    loadLeaflet();
  }, [activeSection, filteredRestaurants, students, restaurantViewMode]);

  useEffect(() => {
    setRestaurantPage(1);
  }, [restaurantSearch]);

  const RESTAURANTS_PER_PAGE = 6;
  const paginatedRestaurants = useMemo(() => {
    const start = (restaurantPage - 1) * RESTAURANTS_PER_PAGE;
    return filteredRestaurants.slice(start, start + RESTAURANTS_PER_PAGE);
  }, [filteredRestaurants, restaurantPage]);
  const totalRestaurantPages = Math.max(1, Math.ceil(filteredRestaurants.length / RESTAURANTS_PER_PAGE));

  const openManageActionModal = (type, request) => {
    setManageModal({ type, request });
  };

  const closeManageModal = () => {
    setManageModal(null);
  };

  const confirmManageAction = () => {
    if (!manageModal) return;
    if (manageModal.type === 'accept-user' || manageModal.type === 'cancel-user') {
      setPendingUserRequests((prev) => prev.filter((item) => item.id !== manageModal.request.id));
    }
    if (manageModal.type === 'accept-venue' || manageModal.type === 'cancel-venue') {
      setPendingVenueRequests((prev) => prev.filter((item) => item.id !== manageModal.request.id));
    }
    setManageModal(null);
  };

  const handleAccessRequestInput = (event) => {
    const { name, value } = event.target;
    setAccessRequestForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRequestAccess = (event) => {
    event.preventDefault();
    const email = accessRequestForm.email.trim().toLowerCase();
    const fullName = accessRequestForm.fullName.trim();
    if (!email || !fullName) {
      setAccessRequestMessage('Cal omplir correu i nom i cognoms.');
      return;
    }
    const alreadyUser = students.some((st) => (st.email || '').toLowerCase() === email) || email === ADMIN_EMAIL;
    const alreadyPending = pendingUserRequests.some((req) => req.email.toLowerCase() === email);
    if (alreadyUser) {
      setAccessRequestMessage('Aquest correu ja està donat d’alta.');
      return;
    }
    if (alreadyPending) {
      setAccessRequestMessage('Aquest correu ja ha sol·licitat accés.');
      return;
    }
    const newRequest = { id: `req-user-${Date.now()}`, name: fullName, email };
    setPendingUserRequests((prev) => [newRequest, ...prev]);
    setAccessRequestMessage('Sol·licitud enviada correctament.');
    setAccessRequestForm({ email: '', fullName: '' });
  };

  return (
    <div className={`app-shell ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <header className="topbar">
        <button type="button" className="topbar-brand" onClick={() => selectSection('home')}>JOVIAT</button>
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
        <div className="auth-menu-wrapper">
          <button
            type="button"
            className="auth-button"
            onClick={toggleAuthMenu}
            aria-expanded={isAuthMenuOpen}
            aria-controls="auth-menu"
          >
            {isLoggedIn ? (
              <span className="auth-button-logged">
                {!isAdmin && <img src={selectedStudent?.imageUrl || WHITE_AVATAR_IMAGE} alt="Avatar usuari" />}
                <strong>{isAdmin ? 'LOGOUT' : loggedInUser}</strong>
                {!isAdmin && <small>{loggedInUser}</small>}
              </span>
            ) : (
              t('login')
            )}
          </button>

          {isAuthMenuOpen && (
            <div id="auth-menu" className="auth-menu">
              {!isLoggedIn ? (
                <form className="auth-form" onSubmit={handleLogin}>
                  <label htmlFor="username">{t('username')}</label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    value={loginForm.username}
                    onChange={handleLoginInput}
                    placeholder="Introdueix el teu usuari"
                  />
                  <label htmlFor="password">{t('password')}</label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={loginForm.password}
                    onChange={handleLoginInput}
                    placeholder="Introdueix la contrasenya"
                  />
                  {loginError && <p className="auth-error">{loginError}</p>}
                  <button type="submit" className="auth-submit-button">{t('enter')}</button>
                  <button type="button" className="auth-submit-button" onClick={() => setShowRequestAccess((prev) => !prev)}>{t('requestAccess')}</button>
                  {showRequestAccess && (
                    <div className="request-access-panel">
                      <input name="email" type="email" placeholder="Email" value={accessRequestForm.email} onChange={handleAccessRequestInput} />
                      <input name="fullName" type="text" placeholder="Nom i cognoms" value={accessRequestForm.fullName} onChange={handleAccessRequestInput} />
                      <button type="button" className="auth-submit-button" onClick={handleRequestAccess}>{t('requestAccess')}</button>
                      {accessRequestMessage && <p className="auth-error">{accessRequestMessage}</p>}
                    </div>
                  )}
                </form>
              ) : (
                <div className="auth-logged-in">
                  <p>Has iniciat sessió com <strong>{loggedInUser}</strong>.</p>
                  <button type="button" className="auth-logout-button" onClick={handleLogout}>{t('logout')}</button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      <aside id="main-sidebar" className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <nav>
          <div className="sidebar-brand">
            <p>ALUMNI NETWORK</p>
            <div className="language-switch">
              {['ca', 'es', 'en'].map((lang) => (
                <button
                  key={lang}
                  type="button"
                  className={`language-pill ${activeLanguage === lang ? 'active' : ''}`}
                  onClick={() => setActiveLanguage(lang)}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <ul>
            <li>
              <button type="button" className="menu-link" onClick={() => selectSection('home')}>
                {t('menuHome')}
              </button>
            </li>
            <li>
              <button type="button" className="menu-link" onClick={() => selectSection('restaurants')}>
                {t('menuRestaurants')}
              </button>
            </li>
            <li>
              <button type="button" className="menu-link" onClick={() => selectSection('students')}>
                {t('menuStudents')}
              </button>
            </li>
            {isLoggedIn && isAdmin && (
              <>
                <li>
                  <button type="button" className="menu-link" onClick={() => selectSection('add-student')}>
                    {t('menuAddStudent')}
                  </button>
                </li>
                <li>
                  <button type="button" className="menu-link" onClick={() => selectSection('add-restaurant')}>
                    {t('menuAddRestaurant')}
                  </button>
                </li>
                <li>
                  <button type="button" className="menu-link" onClick={() => selectSection('manage-entries')}>
                    {t('menuManageEntries')}
                  </button>
                </li>
              </>
            )}
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
        {activeSection === 'home' && (
          <section className="home-section">
            <div className="home-hero" style={{ backgroundImage: `linear-gradient(rgba(5,5,5,0.65), rgba(5,5,5,0.45)), url(${HOME_HERO_IMAGE})` }}>
              <div className="home-hero-content">
                <p>{t('heroEyebrow')}</p>
                <h1>{t('heroTitle')}</h1>
                <button
                  type="button"
                  className="register-hero-button"
                  onClick={() => {
                    setIsAuthMenuOpen(true);
                    setShowRequestAccess(true);
                  }}
                >
                  REGISTRA'T
                </button>
                <div className="home-cta-row">
                  <button type="button" onClick={() => selectSection('restaurants')}>{t('exploreRestaurants')}</button>
                  <button type="button" onClick={() => selectSection('students')}>{t('exploreStudents')}</button>
                </div>
              </div>
            </div>
          </section>
        )}

        {activeSection === 'restaurants' && (
          <section className="restaurants-section">
            <h2>{t('restaurantsTitle')}</h2>
            <h3 className="restaurants-subtitle">{t('mapTitle')}</h3>
            <input
              type="search"
              className="search-input"
              placeholder={t('searchRestaurant')}
              value={restaurantSearch}
              onChange={(event) => setRestaurantSearch(event.target.value)}
            />
            <div className="view-toggle">
              <button type="button" className={`language-pill ${restaurantViewMode === 'map' ? 'active' : ''}`} onClick={() => setRestaurantViewMode('map')}>{t('mapMode')}</button>
              <button type="button" className={`language-pill ${restaurantViewMode === 'list' ? 'active' : ''}`} onClick={() => setRestaurantViewMode('list')}>{t('listMode')}</button>
            </div>
            {restaurantViewMode === 'map' && (
              <div className="map-wrapper">
                <div ref={mapContainerRef} className="leaflet-map-canvas" aria-label="Mapa de restaurants" />
              </div>
            )}

            <h3 className="restaurants-subtitle">Restaurants</h3>
            {loadingRestaurants && <p>Carregant restaurants...</p>}
            {!loadingRestaurants && restaurantsError && <p>{restaurantsError}</p>}

            {!loadingRestaurants && !restaurantsError && !selectedRestaurant && (
              <div className="restaurants-list restaurants-list-reference">
                {filteredRestaurants.map((restaurant) => (
                  <article key={restaurant.id} className="restaurant-card restaurant-card-clickable">
                    <button
                      type="button"
                      className="restaurant-open-button"
                      onClick={() => openRestaurantProfile(restaurant.id)}
                    >
                      <img
                        src={restaurant.imageUrl || WHITE_AVATAR_IMAGE}
                        alt={`Foto de ${restaurant.name}`}
                        onError={(event) => {
                          event.currentTarget.src = WHITE_AVATAR_IMAGE;
                        }}
                      />
                      <div className="restaurant-card-body">
                        <span className="restaurant-chip">{restaurant.specialty || 'Restaurant'}</span>
                        <h4>{restaurant.name}</h4>
                        <p>📍 {restaurant.street || 'Adreça no disponible'}</p>
                        <p>{students.filter((student) => student.restaurantId === restaurant.id).length} Alumnis associats</p>
                        <span className="restaurant-details-cta"><span className="inline-icon">◉</span> VEURE DETALLS</span>
                      </div>
                    </button>
                  </article>
                ))}
              </div>
            )}
            {restaurantViewMode === 'list' && totalRestaurantPages > 1 && (
              <div className="pagination">
                <button type="button" disabled={restaurantPage <= 1} onClick={() => setRestaurantPage((p) => Math.max(1, p - 1))}>‹</button>
                <span>{restaurantPage} / {totalRestaurantPages}</span>
                <button type="button" disabled={restaurantPage >= totalRestaurantPages} onClick={() => setRestaurantPage((p) => Math.min(totalRestaurantPages, p + 1))}>›</button>
              </div>
            )}

          </section>
        )}

        {activeSection === 'students' && (
          <section className="students-section">
            <h2 className="students-title">🧑‍🍳 Llistat d&apos;Alumnis</h2>
            <div className="students-search-wrap">
              <label htmlFor="students-search-input" className="students-search-label">
                CERCAR ALUMNIS <span>(mostrant {filteredStudents.length} de {students.length})</span>
              </label>
              <div className="students-search-row">
                <input
                  id="students-search-input"
                  type="search"
                  className="search-input students-search-input"
                  placeholder="Escriu el nom de l&apos;Alumni"
                  value={studentSearch}
                  onChange={(event) => setStudentSearch(event.target.value)}
                />
                <span className="students-filter-icon" aria-hidden="true">🎚️</span>
              </div>
            </div>

            <article className="students-filters-card">
              <button type="button" className="students-filter-collapse-btn" onClick={() => setIsStudiesFilterOpen((prev) => !prev)}>
                <span className="students-filter-block-title">ESTUDIS CURSATS A LA JOVIAT</span>
                <span aria-hidden="true">{isStudiesFilterOpen ? '⌃' : '⌄'}</span>
              </button>
              {isStudiesFilterOpen && (
                <div className="students-chip-grid">
                  <button type="button" className="students-filter-chip action" onClick={() => setSelectedStudyFilters(studyOptions)}>
                    Seleccionar tots els estudis
                  </button>
                  {studyOptions.map((study) => (
                    <button
                      key={study}
                      type="button"
                      className={`students-filter-chip ${selectedStudyFilters.includes(study) ? 'active' : ''}`}
                      onClick={() => toggleStudentFilter(study, setSelectedStudyFilters)}
                    >
                      ☑ {study}
                    </button>
                  ))}
                </div>
              )}
              <div className="students-filter-inline">
                <div>
                  <label htmlFor="students-employment-filter" className="students-filter-label">SITUACIÓ LABORAL</label>
                  <select id="students-employment-filter" value={studentEmploymentFilter} onChange={(event) => setStudentEmploymentFilter(event.target.value)}>
                    <option value="all">Qualsevol situació</option>
                    <option value="current">Treballen actualment</option>
                    <option value="past">No treballen actualment</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="students-year-filter" className="students-filter-label">ANY DE PROMOCIÓ</label>
                  <select id="students-year-filter" value={studentPromotionYearFilter} onChange={(event) => setStudentPromotionYearFilter(event.target.value)}>
                    <option value="all">Qualsevol any</option>
                    {promotionYearOptions.map((year) => <option key={year} value={year}>{year}</option>)}
                  </select>
                </div>
              </div>
              <button type="button" className="students-filter-collapse-btn" onClick={() => setIsProfileFilterOpen((prev) => !prev)}>
                <span className="students-filter-block-title">PERFIL PROFESSIONAL</span>
                <span aria-hidden="true">{isProfileFilterOpen ? '⌃' : '⌄'}</span>
              </button>
              {isProfileFilterOpen && (
                <div className="students-chip-grid">
                  <button type="button" className="students-filter-chip action" onClick={() => setSelectedProfileFilters(profileOptions)}>
                    Seleccionar tots els perfils professionals
                  </button>
                  <button type="button" className="students-filter-chip action" onClick={() => setSelectedProfileFilters([])}>
                    Treure tots els perfils professionals
                  </button>
                  {profileOptions.map((profile) => (
                    <button
                      key={profile}
                      type="button"
                      className={`students-filter-chip ${selectedProfileFilters.includes(profile) ? 'active' : ''}`}
                      onClick={() => toggleStudentFilter(profile, setSelectedProfileFilters)}
                    >
                      ☐ {profile}
                    </button>
                  ))}
                </div>
              )}
            </article>

            {loadingStudents && <p>Carregant alumnes...</p>}
            {!loadingStudents && studentsError && <p>{studentsError}</p>}

            {!loadingStudents && !studentsError && !selectedStudent && (
              <div className="students-grid">
                {filteredStudents.map((student) => (
                  <article key={student.id} className="student-card student-card-clickable">
                    <button
                      type="button"
                      className="student-open-button"
                      onClick={() => openStudentProfile(student)}
                    >
                      <img
                        src={student.imageUrl || WHITE_AVATAR_IMAGE}
                        alt={`Foto de ${student.fullName}`}
                        onError={(event) => {
                          event.currentTarget.src = WHITE_AVATAR_IMAGE;
                        }}
                      />
                      <div className="student-card-body">
                        <h3>{student.fullName}</h3>
                        <p>• {student.studies || 'Estudis no informats'}</p>
                        {student.role && <p>• {student.role}</p>}
                        {student.promotionYear && <p className="student-card-promo">Promoció {student.promotionYear}</p>}
                        <p className="student-card-assoc">🏫 {students.filter((item) => item.alumniId === student.alumniId).length || 1} establiments associats</p>
                        <span className="student-card-cta">VEURE DETALLS</span>
                      </div>
                    </button>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {activeSection === 'restaurant-profile' && selectedRestaurant && (
          <section className="restaurants-section">
            <article className="restaurant-profile-card restaurant-profile-reference">
              <button type="button" className="back-button" onClick={() => selectSection('restaurants')}>
                ← Tornar al llistat
              </button>
              <div className="restaurant-profile-header">
                <img
                  className="restaurant-hero-image"
                  src={selectedRestaurant.imageUrl || WHITE_AVATAR_IMAGE}
                  alt={`Foto de ${selectedRestaurant.name}`}
                  onError={(event) => {
                    event.currentTarget.src = WHITE_AVATAR_IMAGE;
                  }}
                />
                <div>
                  <h3>Fitxa d&apos;establiment</h3>
                  <h2>{selectedRestaurant.name}</h2>
                  <p><span className="inline-icon">📍</span> {selectedRestaurant.street}</p>
                  <div className="restaurant-action-row">
                    <button type="button" className="pill-button" onClick={startRestaurantEdit}>✎ Editar</button>
                    <button type="button" className="pill-button danger" onClick={handleDeleteRestaurant}>🗑 Eliminar</button>
                  </div>
                  {restaurantProfileMessage && <p className="restaurant-profile-message">{restaurantProfileMessage}</p>}
                </div>
              </div>
              <div className="restaurant-info-grid">
                <div><strong>Categoria</strong><p>{selectedRestaurant.specialty}</p></div>
                <div><strong>Phone</strong><p>{selectedRestaurant.phone || 'No disponible'}</p></div>
                <div><strong>Email</strong><p>{selectedRestaurant.email || 'No disponible'}</p></div>
                <div><strong>Web</strong><p>No disponible</p></div>
              </div>
              <div className="map-wrapper">
                <iframe title="Mapa de la fitxa del restaurant" src={restaurantProfileMapUrl} loading="lazy" />
              </div>
              <h4>Alumnes que hi treballen</h4>
              {studentsForSelectedRestaurant.current.length > 0 ? (
                <ul>
                  {studentsForSelectedRestaurant.current.map((student) => (
                    <li key={`current-${student.id}`} className="profile-linked-item">
                      <img
                        className="profile-linked-thumb"
                        src={student.imageUrl || WHITE_AVATAR_IMAGE}
                        alt={`Foto de ${student.fullName}`}
                        onError={(event) => {
                          event.currentTarget.src = WHITE_AVATAR_IMAGE;
                        }}
                      />
                      <button
                        type="button"
                        className="profile-link-button"
                        onClick={() => openStudentProfileFromRestaurant(student, selectedRestaurant.id)}
                      >
                        Veure fitxa de l&apos;alumne: {student.fullName} ({student.role})
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No hi ha alumnes treballant actualment.</p>
              )}
              <h4>Alumnes que hi han treballat</h4>
              {studentsForSelectedRestaurant.past.length > 0 ? (
                <ul>
                  {studentsForSelectedRestaurant.past.map((student) => (
                    <li key={`past-${student.id}`} className="profile-linked-item">
                      <img
                        className="profile-linked-thumb"
                        src={student.imageUrl || WHITE_AVATAR_IMAGE}
                        alt={`Foto de ${student.fullName}`}
                        onError={(event) => {
                          event.currentTarget.src = WHITE_AVATAR_IMAGE;
                        }}
                      />
                      <button
                        type="button"
                        className="profile-link-button"
                        onClick={() => openStudentProfileFromRestaurant(student, selectedRestaurant.id)}
                      >
                        Veure fitxa de l&apos;alumne: {student.fullName} ({student.role})
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No hi ha registres d’alumnes anteriors.</p>
              )}
            </article>
          </section>
        )}

        {activeSection === 'student-profile' && selectedStudent && (
          <section className="students-section">
            <article className="student-profile-card student-profile-reference">
              <button type="button" className="back-button" onClick={handleBackFromStudentProfile}>
                ← Tornar al llistat
              </button>
              <div className="student-profile-header">
                <img
                  className="student-hero-image"
                  src={selectedStudent.imageUrl || WHITE_AVATAR_IMAGE}
                  alt={`Foto de ${selectedStudent.fullName}`}
                  onError={(event) => {
                    event.currentTarget.src = WHITE_AVATAR_IMAGE;
                  }}
                />
                <div>
                  <h3>Fitxa d&apos;Alumni</h3>
                  <h2>{selectedStudent.fullName}</h2>
                  <p><strong>Estudis realitzats a la Joviat:</strong></p>
                  <p>• {selectedStudent.studies || 'Estudis no informats'}</p>
                  {selectedStudent.role && <p>• {selectedStudent.role}</p>}
                  {selectedStudent.promotionYear && <p><strong>Promoció {selectedStudent.promotionYear}</strong></p>}
                  <div className="restaurant-action-row">
                    {isEditingStudent ? (
                      <>
                        <button type="button" className="pill-button" onClick={handleSaveStudentEdit}>💾 Desar</button>
                        <button type="button" className="pill-button" onClick={() => setIsEditingStudent(false)}>↩ Cancel·lar</button>
                      </>
                    ) : (
                      <>
                        <button type="button" className="pill-button" onClick={startStudentEdit}>✎ Editar</button>
                        <button type="button" className="pill-button danger" onClick={handleDeleteStudent}>🗑 Eliminar</button>
                      </>
                    )}
                  </div>
                  <button type="button" className="profile-link-button" onClick={openProfilePhotoPicker}>
                    Canviar foto de perfil
                  </button>
                </div>
              </div>
              <input
                ref={profilePhotoInputRef}
                type="file"
                accept="image/*"
                className="hidden-file-input"
                onChange={handleProfilePhotoChange}
              />
              {profilePhotoStatus && <p>{profilePhotoStatus}</p>}
              {studentProfileMessage && <p className="restaurant-profile-message">{studentProfileMessage}</p>}
              {isEditingStudent && (
                <section className="student-contact-grid">
                  <div><strong>Nom complet</strong><input name="fullName" value={studentEditForm.fullName} onChange={handleStudentEditInputChange} /></div>
                  <div><strong>Estudis</strong><input name="studies" value={studentEditForm.studies} onChange={handleStudentEditInputChange} /></div>
                  <div><strong>Promoció</strong><input name="promotionYear" value={studentEditForm.promotionYear} onChange={handleStudentEditInputChange} /></div>
                  <div><strong>Email</strong><input name="email" value={studentEditForm.email} onChange={handleStudentEditInputChange} /></div>
                  <div><strong>Phone</strong><input name="phone" value={studentEditForm.phone} onChange={handleStudentEditInputChange} /></div>
                  <div><strong>LinkedIn</strong><input name="linkedin" value={studentEditForm.linkedin} onChange={handleStudentEditInputChange} /></div>
                  <div><strong>Instagram</strong><input name="instagram" value={studentEditForm.instagram} onChange={handleStudentEditInputChange} /></div>
                </section>
              )}
              <section className="student-contact-grid">
                <div><strong>Email</strong><p>{selectedStudent.email !== 'No disponible' ? <a href={`mailto:${selectedStudent.email}`}>{selectedStudent.email}</a> : 'No disponible'}</p></div>
                <div><strong>Phone</strong><p>{selectedStudent.phone !== 'No disponible' ? <a href={`tel:${selectedStudent.phone}`}>{selectedStudent.phone}</a> : 'No disponible'}</p></div>
                <div><strong>LinkedIn</strong><p>{selectedStudent.linkedin !== 'No disponible' ? <a href={normalizeLinkedinUrl(selectedStudent.linkedin)} target="_blank" rel="noreferrer">{selectedStudent.linkedin}</a> : 'No disponible'}</p></div>
                <div><strong>Instagram</strong><p>{selectedStudent.instagram !== 'No disponible' ? <a href={`https://instagram.com/${String(selectedStudent.instagram).replace('@', '')}`} target="_blank" rel="noreferrer">{selectedStudent.instagram}</a> : 'No disponible'}</p></div>
              </section>
              <h4>Restaurants on treballa o ha treballat</h4>
              {restaurantsForSelectedStudent.length > 0 ? (
                <ul>
                  {restaurantsForSelectedStudent.map((restaurantItem) => (
                    <li key={`${restaurantItem.restaurantId}-${restaurantItem.workplace}`} className="profile-linked-item">
                      {restaurantItem.restaurantId ? (
                        <>
                          <img
                            className="profile-linked-thumb"
                            src={getRestaurantImageById(restaurantItem.restaurantId)}
                            alt={`Foto de ${restaurantItem.workplace}`}
                            onError={(event) => {
                              event.currentTarget.src = WHITE_AVATAR_IMAGE;
                            }}
                          />
                          <button
                            type="button"
                            className="profile-link-button"
                            onClick={() => openRestaurantProfile(restaurantItem.restaurantId)}
                          >
                            {restaurantItem.workplace} · {restaurantItem.role} {restaurantItem.currentJob ? '(Actual)' : '(Anterior)'}
                          </button>
                        </>
                      ) : (
                        <span>{restaurantItem.workplace} · {restaurantItem.role} {restaurantItem.currentJob ? '(Actual)' : '(Anterior)'}</span>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No hi ha restaurants vinculats.</p>
              )}
              {selectedStudent.restaurantId && (
                <div className="profile-linked-item profile-linked-item-standalone">
                  <img
                    className="profile-linked-thumb"
                    src={getRestaurantImageById(selectedStudent.restaurantId)}
                    alt="Foto del restaurant"
                    onError={(event) => {
                      event.currentTarget.src = WHITE_AVATAR_IMAGE;
                    }}
                  />
                  <button
                    type="button"
                    className="profile-link-button"
                    onClick={() => openRestaurantProfile(selectedStudent.restaurantId)}
                  >
                    Veure fitxa del restaurant
                  </button>
                </div>
              )}
            </article>
          </section>
        )}

        {activeSection === 'add-student' && (
          <section className="admin-page restaurant-edit-page">
            <p className="admin-eyebrow">ADMINISTRACIO</p>
            <h1>Afegir Alumni</h1>
            <p className="admin-intro">
              Els camps marcats amb * corresponen al correu electrònic i la contrasenya; són obligatoris.
            </p>

            <div className="admin-top-grid">
              <article className="admin-panel photo-panel">
                <button type="button" className="upload-circle upload-circle-button" onClick={openPhotoPicker}>
                  {adminPhotoPreview ? (
                    <img src={adminPhotoPreview} alt="Previsualització de l'alumne" className="upload-preview-image" />
                  ) : (
                    <span>+</span>
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden-file-input"
                  onChange={handlePhotoUpload}
                />
                <h3>PUJAR FOTO</h3>
                <p>{adminPhotoPreview ? 'Clica per canviar la imatge' : 'Puja una imatge'}</p>

                <label>Estudis cursats a la Joviat *</label>
                <button type="button" className="students-filter-collapse-btn" onClick={() => setIsStudiesOpenAddStudent((p) => !p)}>
                  <span>{adminForm.studies.length ? `${adminForm.studies.length} seleccionats` : 'Selecciona els estudis'}</span><span>{isStudiesOpenAddStudent ? '⌃' : '⌄'}</span>
                </button>
                {isStudiesOpenAddStudent && (
                  <div className="students-chip-grid">
                    {addStudentStudyOptions.map((study) => (
                      <button key={study} type="button" className={`students-filter-chip ${adminForm.studies.includes(study) ? 'active' : ''}`} onClick={() => setAdminForm((prev) => ({ ...prev, studies: prev.studies.includes(study) ? prev.studies.filter((s) => s !== study) : [...prev.studies, study] }))}>
                        ☐ {study}
                      </button>
                    ))}
                  </div>
                )}
              </article>

              <article className="admin-panel info-panel">
                <h3>Informació primària</h3>
                <label htmlFor="full-name">Nom complet</label>
                <input
                  id="full-name"
                  name="fullName"
                  type="text"
                  placeholder="Ex. Marc Ribas i Soler"
                  value={adminForm.fullName}
                  onChange={handleAdminInputChange}
                />

                <div className="admin-two-columns">
                  <div>
                    <label htmlFor="email">Correu electrònic *</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="marc.ribas@exemple.cat"
                      value={adminForm.email}
                      onChange={handleAdminInputChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="password">Contrasenya *</label>
                    <input id="password" name="password" type="password" placeholder="********" value={adminForm.password} onChange={handleAdminInputChange} />
                  </div>
                </div>

                <div className="admin-two-columns">
                  <div>
                    <label htmlFor="phone">Telèfon de contacte</label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+34 600 000 000"
                      value={adminForm.phone}
                      onChange={handleAdminInputChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="promotionYear">Any de promoció</label>
                    <select id="promotionYear" name="promotionYear" value={adminForm.promotionYear} onChange={handleAdminInputChange}>
                      <option value="">Qualsevol any</option>
                      {promotionYearFormOptions.map((year) => <option key={year} value={year}>{year}</option>)}
                    </select>
                  </div>
                </div>

                <label htmlFor="bio">Bio</label>
                <textarea id="bio" name="bio" placeholder="Escriu una breu presentació de l'Alumni" value={adminForm.bio} onChange={handleAdminInputChange} rows={4} />
                <label htmlFor="linkedin">Perfil Linkedin</label>
                <input
                  id="linkedin"
                  name="linkedin"
                  type="text"
                  placeholder="linkedin.com/in/usuari"
                  value={adminForm.linkedin}
                  onChange={handleAdminInputChange}
                />
                <label htmlFor="instagram">Perfil d&apos;Instagram</label>
                <input id="instagram" name="instagram" type="text" placeholder="@usuari o instagram.com/usuari" value={adminForm.instagram} onChange={handleAdminInputChange} />
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

            <div className="save-student-row">
              <button type="button" className="pill-button save-student-button" onClick={handleSaveStudent}>
                Guardar alumne
              </button>
              {saveStudentError && <p className="save-student-error">{saveStudentError}</p>}
              {saveStudentSuccess && <p className="save-student-success">{saveStudentSuccess}</p>}
            </div>
          </section>
        )}

        {activeSection === 'add-restaurant' && (
          <section className="admin-page restaurant-edit-page">
            <p className="admin-eyebrow">ADMINISTRACIO</p>
            <h1>{isEditingRestaurant ? 'Editar Establiment' : 'Afegir Establiment'}</h1>
            <p className="admin-intro">Cerca l&apos;establiment a Google Places, selecciona&apos;l del llistat i importa la seva informació per omplir la fitxa automàticament abans de desar-la a Firestore.</p>

            <article className="admin-panel places-panel">
              <h3>Cerca a Google Places</h3>
              <p>Escriu el nom de l&apos;establiment i recupera els resultats disponibles.</p>
              <label htmlFor="places-name">Nom de l&apos;establiment</label>
              <div className="places-search-row">
                <input id="places-name" type="text" value={restaurantForm.name} name="name" onChange={handleRestaurantInputChange} placeholder="Ex. Disfrutar Barcelona" />
                <button type="button" className="manage-btn accept" onClick={handleSearchPlaces}>Buscar</button>
              </div>
              <label htmlFor="places-results">Resultats</label>
              <div className="places-search-row">
                <select id="places-results" value={selectedPlaceIndex} onChange={(event) => setSelectedPlaceIndex(event.target.value)}>
                  <option value="">Encara no hi ha resultats</option>
                  {placesResults.map((item, index) => <option key={`${item.placeId}-${index}`} value={index}>{item.displayName}</option>)}
                </select>
                <button type="button" className="manage-btn cancel" onClick={handleAutocompletePlace}>Autocompletar</button>
              </div>
            </article>

            <div className="admin-top-grid restaurant-edit-form-grid">
              <article className="admin-panel info-panel">
                <h3>Dades de l&apos;establiment</h3>
                <p className="edit-panel-helper">Revisa els camps importants i completa manualment el que Google no proporcioni.</p>
                <label htmlFor="restaurant-name">Nom</label>
                <input
                  id="restaurant-name"
                  name="name"
                  type="text"
                  placeholder="Ex. Restaurant Nova Brasa"
                  value={restaurantForm.name}
                  onChange={handleRestaurantInputChange}
                />

                <label htmlFor="restaurant-specialty">Categoria</label>
                <input
                  id="restaurant-specialty"
                  name="specialty"
                  type="text"
                  placeholder="Ex. Cuina mediterrània"
                  value={restaurantForm.specialty}
                  onChange={handleRestaurantInputChange}
                />

                <label htmlFor="restaurant-street">Adreça</label>
                <input
                  id="restaurant-street"
                  name="street"
                  type="text"
                  placeholder="Ex. Carrer Major 15, Manresa"
                  value={restaurantForm.street}
                  onChange={handleRestaurantInputChange}
                />

                <div className="restaurant-edit-two-columns">
                  <div>
                    <label htmlFor="restaurant-phone">Phone</label>
                    <input
                      id="restaurant-phone"
                      name="phone"
                      type="text"
                      placeholder="+34 600 000 000"
                      value={restaurantForm.phone || ''}
                      onChange={handleRestaurantInputChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="restaurant-email">Email</label>
                    <input
                      id="restaurant-email"
                      name="email"
                      type="email"
                      placeholder="contacte@restaurant.com"
                      value={restaurantForm.email || ''}
                      onChange={handleRestaurantInputChange}
                    />
                  </div>
                </div>
                <div className="restaurant-edit-two-columns">
                  <div>
                    <label htmlFor="restaurant-web">Web</label>
                    <input id="restaurant-web" name="web" type="text" placeholder="https://restaurant.com" value={restaurantForm.web || ''} onChange={handleRestaurantInputChange} />
                  </div>
                  <div>
                    <label htmlFor="restaurant-map-url">Google Maps URL</label>
                    <input id="restaurant-map-url" name="googleMapsUrl" type="text" placeholder="https://maps.google.com/..." value={restaurantForm.googleMapsUrl || ''} onChange={handleRestaurantInputChange} />
                  </div>
                </div>
                <div className="restaurant-edit-two-columns">
                  <div>
                    <label htmlFor="restaurant-lat">Latitud</label>
                    <input id="restaurant-lat" name="latitude" type="text" placeholder="41.390000" value={restaurantForm.latitude || ''} onChange={handleRestaurantInputChange} />
                  </div>
                  <div>
                    <label htmlFor="restaurant-lng">Longitud</label>
                    <input id="restaurant-lng" name="longitude" type="text" placeholder="2.150000" value={restaurantForm.longitude || ''} onChange={handleRestaurantInputChange} />
                  </div>
                </div>
                <div className="restaurant-edit-two-columns">
                  <div>
                    <label htmlFor="restaurant-rating">Rating</label>
                    <input id="restaurant-rating" name="rating" type="text" placeholder="4.8" value={restaurantForm.rating || ''} onChange={handleRestaurantInputChange} />
                  </div>
                  <div>
                    <label htmlFor="restaurant-business-status">Estat del negoci</label>
                    <input id="restaurant-business-status" name="businessStatus" type="text" placeholder="OPERATIONAL" value={restaurantForm.businessStatus || ''} onChange={handleRestaurantInputChange} />
                  </div>
                </div>

                <>
                    <label htmlFor="restaurant-photo-url">Foto URL</label>
                    <input
                      id="restaurant-photo-url"
                      name="imageUrl"
                      type="text"
                      placeholder="https://..."
                      value={restaurantPhotoPreview || ''}
                      onChange={(event) => setRestaurantPhotoPreview(event.target.value)}
                    />
                    <label htmlFor="restaurant-place-id">Google Place ID</label>
                    <input id="restaurant-place-id" type="text" placeholder="ChIJ..." />
                    <div className="restaurant-edit-preview-grid">
                      <article>
                        <h4>Previsualització de foto</h4>
                        <img src={restaurantPhotoPreview || WHITE_AVATAR_IMAGE} alt="Previsualització de foto del restaurant" />
                      </article>
                      <article>
                        <h4>Previsualització del mapa</h4>
                        <iframe title="Previsualització del mapa" src={restaurantEditPreviewMapUrl} loading="lazy" />
                      </article>
                    </div>
                </>
              </article>
            </div>

            <div className="save-student-row">
              <button type="button" className="pill-button save-student-button" onClick={handleSaveRestaurant}>
                {isEditingRestaurant ? 'Desar canvis' : 'Guardar restaurant'}
              </button>
              {saveRestaurantError && <p className="save-student-error">{saveRestaurantError}</p>}
              {saveRestaurantSuccess && <p className="save-student-success">{saveRestaurantSuccess}</p>}
            </div>
          </section>
        )}

        {activeSection === 'manage-entries' && (
          <section className="admin-page">
            <p className="admin-eyebrow">ADMINISTRACIO</p>
            <h1>Gestionar altes</h1>
            <p className="admin-intro">Revisa les sol·licituds pendents i decideix si vols donar d&apos;alta l&apos;usuari o cancel·lar-la.</p>

            <article className="manage-entries-panel">
              <div className="manage-entries-toggle" role="tablist" aria-label="Visualització d'altes">
                <button
                  type="button"
                  className={`manage-entries-tab ${manageEntriesTab === 'users' ? 'active' : ''}`}
                  onClick={() => setManageEntriesTab('users')}
                >
                  VISUALITZAR ALTES USUARIS
                </button>
                <button
                  type="button"
                  className={`manage-entries-tab ${manageEntriesTab === 'venues' ? 'active' : ''}`}
                  onClick={() => setManageEntriesTab('venues')}
                >
                  VISUALITZAR ALTES ESTABLIMENTS
                </button>
              </div>

              {manageEntriesTab === 'users' && (
                <>
                  {pendingUserRequests.length > 0 ? (
                    pendingUserRequests.map((request) => (
                      <article key={request.id} className="manage-entry-card">
                        <div>
                          <h3>{request.name}</h3>
                          <p>{request.email}</p>
                        </div>
                        <div className="manage-entry-actions">
                          <button type="button" className="manage-btn accept" onClick={() => openManageActionModal('accept-user', request)}>Acceptar</button>
                          <button type="button" className="manage-btn cancel" onClick={() => openManageActionModal('cancel-user', request)}>Cancelar</button>
                        </div>
                      </article>
                    ))
                  ) : (
                    <p className="manage-empty">No hi ha cap petició d&apos;usuari pendent.</p>
                  )}
                </>
              )}

              {manageEntriesTab === 'venues' && (
                <>
                  {pendingVenueRequests.length > 0 ? (
                    pendingVenueRequests.map((request) => (
                      <article key={request.id} className="manage-entry-card">
                        <div>
                          <h3>{request.name}</h3>
                          <p>{request.email}</p>
                        </div>
                        <div className="manage-entry-actions">
                          <button type="button" className="manage-btn accept" onClick={() => openManageActionModal('accept-venue', request)}>Acceptar</button>
                          <button type="button" className="manage-btn cancel" onClick={() => openManageActionModal('cancel-venue', request)}>Cancelar</button>
                        </div>
                      </article>
                    ))
                  ) : (
                    <p className="manage-empty">No hi ha cap petició d&apos;establiment pendent.</p>
                  )}
                </>
              )}
            </article>

            {manageModal && (
              <div className="manage-modal-backdrop" role="presentation">
                <article className="manage-modal" role="dialog" aria-modal="true">
                  <h3>{manageModal.type.includes('accept') ? 'Confirmar alta' : 'Confirmar cancel·lacio de peticio'}</h3>
                  <p>
                    {manageModal.type.includes('accept')
                      ? `Estas segur que vols donar d'alta a ${manageModal.request.name}?`
                      : `Estas segur que vols cancel·lar la peticio d'alta de ${manageModal.request.name}?`}
                  </p>
                  <div className="manage-modal-actions">
                    <button type="button" className="manage-btn cancel" onClick={closeManageModal}>No</button>
                    <button type="button" className="manage-btn accept" onClick={confirmManageAction}>
                      {manageModal.type.includes('accept') ? 'Si' : 'Cancel·lar peticio'}
                    </button>
                  </div>
                </article>
              </div>
            )}
          </section>
        )}

        {activeSection === 'admin-lock' && (
          <section className="admin-page">
            <p className="admin-eyebrow">ADMINISTRACIO</p>
            <h1>Accés restringit</h1>
            <p className="admin-intro">
              Per accedir a <strong>{pendingAdminSection || 'aquesta secció'}</strong> has de fer login amb un usuari admin.
            </p>
            <button
              type="button"
              className="pill-button"
              onClick={() => setIsAuthMenuOpen(true)}
            >
              Obrir login
            </button>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
