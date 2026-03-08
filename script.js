const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');

function setMenuState(isOpen) {
  sidebar.classList.toggle('open', isOpen);
  overlay.hidden = !isOpen;
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  sidebar.setAttribute('aria-hidden', String(!isOpen));
}

menuToggle.addEventListener('click', () => {
  const isOpen = !sidebar.classList.contains('open');
  setMenuState(isOpen);
});

overlay.addEventListener('click', () => setMenuState(false));

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && sidebar.classList.contains('open')) {
    setMenuState(false);
  }
});
