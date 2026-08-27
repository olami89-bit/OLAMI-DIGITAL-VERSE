// ===== Menu toggle =====
const menuBtn = document.getElementById('menuBtn');
const nav = document.getElementById('nav');

menuBtn.addEventListener('click', () => {
  menuBtn.classList.toggle('open');
  nav.classList.toggle('open');
});

// Close nav on link click
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    menuBtn.classList.remove('open');
    nav.classList.remove('open');
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    if (link.getAttribute('href').startsWith('#')) {
      link.classList.add('active');
    }
  });
});

// ===== Lightbox =====
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxTitle = document.getElementById('lightboxTitle');
const lightboxClose = document.getElementById('lightboxClose');

function openLightbox(src, title) {
  lightboxImg.src = src;
  lightboxTitle.textContent = title || '';
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}

lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});

// Gallery click (delegation)
document.getElementById('galleryGrid').addEventListener('click', (e) => {
  const item = e.target.closest('.gallery-item');
  if (!item || item.classList.contains('hidden')) return;
  const img = item.querySelector('img');
  const title = item.dataset.title || '';
  openLightbox(img.src, title);
});

// ===== Category Filters =====
const filterBtns = document.querySelectorAll('.filter-btn');
const galleryItems = () => document.querySelectorAll('.gallery-item');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;

    galleryItems().forEach(item => {
      if (filter === 'all' || item.dataset.category === filter) {
        item.classList.remove('hidden');
      } else {
        item.classList.add('hidden');
      }
    });
  });
});

// ===== Upload =====
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const uploadForm = document.getElementById('uploadForm');
const previewImg = document.getElementById('previewImg');
const photoTitle = document.getElementById('photoTitle');
const photoCategory = document.getElementById('photoCategory');
const cancelBtn = document.getElementById('cancelBtn');
const addBtn = document.getElementById('addBtn');
const galleryGrid = document.getElementById('galleryGrid');

let currentFileData = null;

const categoryLabels = {
  photo: 'Photo Edit',
  flyer: 'Flyer',
  banner: 'Banner',
  id: 'ID Card',
  wedding: 'Wedding'
};

dropZone.addEventListener('click', () => fileInput.click());

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if (file) handleFile(file);
});

fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];
  if (file) handleFile(file);
});

function handleFile(file) {
  if (!file.type.startsWith('image/')) {
    alert('Please choose an image file.');
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    alert('Image must be under 5MB.');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    currentFileData = e.target.result;
    previewImg.src = currentFileData;
    dropZone.style.display = 'none';
    uploadForm.style.display = 'block';
    photoTitle.value = '';
    photoTitle.focus();
  };
  reader.readAsDataURL(file);
}

cancelBtn.addEventListener('click', resetUpload);

addBtn.addEventListener('click', () => {
  if (!currentFileData) return;

  const title = photoTitle.value.trim() || 'Untitled Design';
  const category = photoCategory.value;
  const label = categoryLabels[category] || 'Design';

  const item = document.createElement('div');
  item.className = 'gallery-item';
  item.dataset.title = title;
  item.dataset.category = category;
  item.innerHTML = `
    <img src="${currentFileData}" alt="${title}" loading="lazy">
    <div class="gallery-overlay">
      <span class="cat-tag">${label}</span>
      <span>${title}</span>
    </div>
  `;
  galleryGrid.prepend(item);

  saveToStorage(title, currentFileData, category);
  resetUpload();
  document.getElementById('gallery').scrollIntoView({ behavior: 'smooth' });

  // Reset filter to All so new item is visible
  filterBtns.forEach(b => b.classList.remove('active'));
  document.querySelector('[data-filter="all"]').classList.add('active');
  galleryItems().forEach(i => i.classList.remove('hidden'));
});

function resetUpload() {
  currentFileData = null;
  fileInput.value = '';
  dropZone.style.display = 'block';
  uploadForm.style.display = 'none';
  previewImg.src = '';
}

// ===== LocalStorage =====
const STORAGE_KEY = 'olami_digital_verse_gallery';

function saveToStorage(title, dataUrl, category) {
  try {
    const items = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    items.unshift({ title, dataUrl, category, id: Date.now() });
    if (items.length > 20) items.pop();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.warn('Could not save to localStorage', e);
  }
}

function loadFromStorage() {
  try {
    const items = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    items.reverse().forEach(({ title, dataUrl, category }) => {
      const label = categoryLabels[category] || 'Design';
      const item = document.createElement('div');
      item.className = 'gallery-item';
      item.dataset.title = title;
      item.dataset.category = category || 'photo';
      item.innerHTML = `
        <img src="${dataUrl}" alt="${title}" loading="lazy">
        <div class="gallery-overlay">
          <span class="cat-tag">${label}</span>
          <span>${title}</span>
        </div>
      `;
      galleryGrid.prepend(item);
    });
  } catch (e) {
    console.warn('Could not load from localStorage', e);
  }
}

loadFromStorage();
