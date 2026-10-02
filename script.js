const BUILT_IN_SONGS = [
  {
    "title": "Channa Mereya",
    "file": "1. Channa Mereya.mp3"
  },
  {
    "title": "Mann Mera",
    "file": "2. Mann Mera.mp3"
  },
  {
    "title": "Barsaat",
    "file": "3. Barsaat.mp3"
  },
  {
    "title": "Samjhawan",
    "file": "4. Samjhawan.mp3"
  },
  {
    "title": "Shayad",
    "file": "5. Shayad.mp3"
  },
  {
    "title": "Hawayein (From \"Jab Harry Met Sejal\")",
    "file": "6. Hawayein (From \"Jab Harry Met Sejal\").mp3"
  },
  {
    "title": "Raanjhanaa (From \"Raanjhanaa\")",
    "file": "7. Raanjhanaa (From \"Raanjhanaa\").mp3"
  },
  {
    "title": "Khamoshiyan",
    "file": "8. Khamoshiyan.mp3"
  },
  {
    "title": "Bairan",
    "file": "9. Bairan.mp3"
  },
  {
    "title": "Kaise Hua (From \"Kabir Singh\")",
    "file": "10. Kaise Hua (From \"Kabir Singh\").mp3"
  },
  {
    "title": "Vaaroon Forever - From “Mirzapur The Movie”",
    "file": "11. Vaaroon Forever - From “Mirzapur The Movie”.mp3"
  },
  {
    "title": "Khoobsurat (From \"Stree 2\")",
    "file": "12. Khoobsurat (From \"Stree 2\").mp3"
  },
  {
    "title": "Bekhayali (From \"Kabir Singh\")",
    "file": "13. Bekhayali (From \"Kabir Singh\").mp3"
  },
  {
    "title": "O Rangrez",
    "file": "14. O Rangrez.mp3"
  },
  {
    "title": "Bandhu 2.0 (From \"Cocktail 2\")",
    "file": "15. Bandhu 2.0 (From \"Cocktail 2\").mp3"
  },
  {
    "title": "Sooraj Dooba Hain",
    "file": "16. Sooraj Dooba Hain.mp3"
  },
  {
    "title": "Kabira",
    "file": "17. Kabira.mp3"
  },
  {
    "title": "Finding Her",
    "file": "18. Finding Her.mp3"
  },
  {
    "title": "Aashiq Tera",
    "file": "19. Aashiq Tera.mp3"
  },
  {
    "title": "Tujhe Kitna Chahne Lage (From \"Kabir Singh\")",
    "file": "20. Tujhe Kitna Chahne Lage (From \"Kabir Singh\").mp3"
  },
  {
    "title": "Ilahi",
    "file": "21. Ilahi.mp3"
  },
  {
    "title": "Raabta",
    "file": "22. Raabta.mp3"
  },
  {
    "title": "Ishq Hai",
    "file": "23. Ishq Hai.mp3"
  },
  {
    "title": "Dil Tu Jaan Tu",
    "file": "24. Dil Tu Jaan Tu.mp3"
  },
  {
    "title": "Tum Hi Ho",
    "file": "25. Tum Hi Ho.mp3"
  },
  {
    "title": "Kesariya (From \"Brahmastra\")",
    "file": "26. Kesariya (From \"Brahmastra\").mp3"
  },
  {
    "title": "Jugraafiya - From \"Super 30\"",
    "file": "27. Jugraafiya - From \"Super 30\".mp3"
  },
  {
    "title": "Arz Kiya Hai | Coke Studio Bharat",
    "file": "28. Arz Kiya Hai | Coke Studio Bharat.mp3"
  },
  {
    "title": "Bulleya",
    "file": "29. Bulleya.mp3"
  },
  {
    "title": "Rang Jo Lagyo",
    "file": "30. Rang Jo Lagyo.mp3"
  }
];;

const audio = document.getElementById('audio');
const songList = document.getElementById('songList');
const playBtn = document.getElementById('playBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const shuffleBtn = document.getElementById('shuffleBtn');
const shufflePlayer = document.getElementById('shufflePlayer');
const progress = document.getElementById('progress');
const volume = document.getElementById('volume');
const muteBtn = document.getElementById('muteBtn');
const search = document.getElementById('search');
const nowTitle = document.getElementById('nowTitle');
const nowSub = document.getElementById('nowSub');
const currentTime = document.getElementById('currentTime');
const duration = document.getElementById('duration');
const songCount = document.getElementById('songCount');
const resultText = document.getElementById('resultText');
const filePicker = document.getElementById('filePicker');

let addedSongs = [];
let songs = [];
let currentIndex = -1;
let shuffle = false;
let filteredIndices = [];
let lastVolume = 0.8;

const DB_NAME = 'MyPlaylistV2';
const STORE = 'songs';

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, {keyPath:'id'});
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function loadAddedSongs() {
  try {
    const db = await openDB();
    return await new Promise((resolve, reject) => {
      const req = db.transaction(STORE, 'readonly').objectStore(STORE).getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.warn('IndexedDB unavailable', e);
    return [];
  }
}

async function saveAddedSong(file) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const id = 'added-' + crypto.randomUUID();
    const item = {id, title: file.name.replace(/\.[^.]+$/, ''), fileName:file.name, blob:file};
    const req = db.transaction(STORE, 'readwrite').objectStore(STORE).put(item);
    req.onsuccess = () => resolve(item);
    req.onerror = () => reject(req.error);
  });
}

async function deleteAddedSong(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE, 'readwrite').objectStore(STORE).delete(id);
    req.onsuccess = resolve;
    req.onerror = () => reject(req.error);
  });
}

function rebuildSongs() {
  const removedBuiltIns = JSON.parse(localStorage.getItem('myPlaylistRemovedBuiltIns') || '[]');

  songs = [
    ...BUILT_IN_SONGS
      .filter(s => !removedBuiltIns.includes(s.file))
      .map(s => ({...s, builtIn:true})),
    ...addedSongs.map(s => ({title:s.title, fileName:s.fileName, blob:s.blob, id:s.id, added:true}))
  ];

  filteredIndices = songs.map((_, i) => i);
  songCount.textContent = songs.length;
}

function esc(s) {
  return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function getSrc(s) {
  if (s.added) return URL.createObjectURL(s.blob);
  return 'songs/' + encodeURIComponent(s.file).replace(/%2F/g, '/');
}

function renderList() {
  songList.innerHTML = '';
  filteredIndices.forEach((index, visibleIndex) => {
    const s = songs[index];
    const row = document.createElement('div');
    row.className = 'song-row' + (index === currentIndex ? ' playing' : '');
    row.dataset.index = index;
    row.innerHTML = `
      <span class="num">${String(visibleIndex + 1).padStart(2,'0')}</span>
      <div>
        <div class="row-title">${esc(s.title)}${s.added ? '<span class="added-badge">ADDED</span>' : ''}</div>
        <div class="row-sub">${s.added ? 'Your added song' : 'My Playlist'}</div>
      </div>
      <span class="row-sub album-col">${s.added ? 'Browser Library' : 'Offline • MP3'}</span>
      <span class="time" data-time="${index}">--:--</span>
      <button class="remove-song" title="Remove from playlist">×</button>
      <button class="row-play" title="Play">${index === currentIndex && !audio.paused ? '❚❚' : '▶'}</button>
    `;
    row.addEventListener('click', e => {
      if (e.target.closest('.remove-song')) return;
      if (!e.target.closest('.row-play')) playSong(index);
    });
    row.querySelector('.row-play').addEventListener('click', e => {
      e.stopPropagation();
      if (index === currentIndex) togglePlay(); else playSong(index);
    });
    const remove = row.querySelector('.remove-song');
    remove.addEventListener('click', async e => {
      e.stopPropagation();

      const message = s.added
        ? `Remove "${s.title}" from your added songs?`
        : `Remove "${s.title}" from this playlist?\\n\\nThe original bundled MP3 will not be deleted from your computer. It will only be hidden from this playlist.`;

      if (!confirm(message)) return;

      if (index === currentIndex) {
        audio.pause();
        audio.removeAttribute('src');
        audio.load();
        currentIndex = -1;
        nowTitle.textContent = 'Select a song';
        nowSub.textContent = 'My Playlist';
        currentTime.textContent = '0:00';
        duration.textContent = '0:00';
        progress.value = 0;
      }

      if (s.added) {
        await deleteAddedSong(s.id);
        addedSongs = await loadAddedSongs();
      } else {
        // Store removed built-in song IDs locally so they remain removed
        // after refreshing/reopening the offline website.
        const removed = JSON.parse(localStorage.getItem('myPlaylistRemovedBuiltIns') || '[]');
        if (!removed.includes(s.file)) {
          removed.push(s.file);
          localStorage.setItem('myPlaylistRemovedBuiltIns', JSON.stringify(removed));
        }
      }

      rebuildSongs();
      renderList();
      updateButtons();
    });
    songList.appendChild(row);

    const probe = new Audio();
    probe.preload = 'metadata';
    probe.src = getSrc(s);
    probe.addEventListener('loadedmetadata', () => {
      const el = document.querySelector(`[data-time="${index}"]`);
      if (el) el.textContent = fmt(probe.duration);
      if (s.added) URL.revokeObjectURL(probe.src);
    }, {once:true});
  });
  resultText.textContent = `${filteredIndices.length} song${filteredIndices.length === 1 ? '' : 's'} in your playlist`;
}

function setSource(index) {
  const s = songs[index];
  audio.src = getSrc(s);
  nowTitle.textContent = s.title;
  nowSub.textContent = s.added ? 'Added Song • Offline' : 'My Playlist • Offline';
  currentIndex = index;
  renderList();
}

async function playSong(index) {
  if (index < 0 || index >= songs.length) return;
  setSource(index);
  try { await audio.play(); } catch (err) {
    console.warn('Playback blocked or file could not be loaded:', err);
    nowSub.textContent = 'Could not play this file';
  }
  updateButtons();
}

function togglePlay() {
  if (currentIndex === -1) return playSong(0);
  if (audio.paused) audio.play().catch(()=>{}); else audio.pause();
  updateButtons();
}

function nextSong() {
  if (!songs.length) return;
  if (shuffle) {
    let n;
    do { n = Math.floor(Math.random() * songs.length); } while (songs.length > 1 && n === currentIndex);
    playSong(n);
  } else playSong((currentIndex + 1 + songs.length) % songs.length);
}

function prevSong() {
  if (audio.currentTime > 3) { audio.currentTime = 0; return; }
  playSong((currentIndex - 1 + songs.length) % songs.length);
}

function updateButtons() {
  playBtn.textContent = audio.paused ? '▶' : '❚❚';
  playBtn.title = audio.paused ? 'Play' : 'Pause';
  const row = document.querySelector(`.song-row[data-index="${currentIndex}"] .row-play`);
  if (row) row.textContent = audio.paused ? '▶' : '❚❚';
}

function fmt(sec) {
  if (!Number.isFinite(sec)) return '0:00';
  const m = Math.floor(sec / 60), s = Math.floor(sec % 60).toString().padStart(2,'0');
  return `${m}:${s}`;
}

function setShuffle() {
  shuffle = !shuffle;
  shuffleBtn.style.color = shuffle ? '#c084fc' : '';
  shufflePlayer.style.color = shuffle ? '#c084fc' : '';
}

async function handleAddSongs(files) {
  const mp3s = [...files].filter(f => f.type === 'audio/mpeg' || /\.mp3$/i.test(f.name));
  if (!mp3s.length) return alert('Please select MP3 audio files.');
  let added = 0;
  for (const file of mp3s) {
    try { await saveAddedSong(file); added++; } catch(e) { console.error(e); }
  }
  addedSongs = await loadAddedSongs();
  rebuildSongs(); renderList();
  alert(`${added} song${added === 1 ? '' : 's'} added to your playlist!`);
  filePicker.value = '';
}

playBtn.addEventListener('click', togglePlay);
nextBtn.addEventListener('click', nextSong);
prevBtn.addEventListener('click', prevSong);
shuffleBtn.addEventListener('click', setShuffle);
shufflePlayer.addEventListener('click', setShuffle);

document.getElementById('addSongsBtn').addEventListener('click', () => filePicker.click());
document.getElementById('addSongsTopBtn').addEventListener('click', () => filePicker.click());
filePicker.addEventListener('change', e => handleAddSongs(e.target.files));

audio.addEventListener('timeupdate', () => {
  currentTime.textContent = fmt(audio.currentTime);
  duration.textContent = fmt(audio.duration);
  progress.value = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
});
audio.addEventListener('loadedmetadata', () => duration.textContent = fmt(audio.duration));
audio.addEventListener('play', () => { updateButtons(); renderList(); });
audio.addEventListener('pause', () => { updateButtons(); renderList(); });
audio.addEventListener('ended', nextSong);

progress.addEventListener('input', () => {
  if (audio.duration) audio.currentTime = (progress.value / 100) * audio.duration;
});
volume.addEventListener('input', () => {
  audio.volume = Number(volume.value);
  audio.muted = false; lastVolume = audio.volume;
  muteBtn.textContent = audio.volume === 0 ? '🔇' : '🔊';
});
muteBtn.addEventListener('click', () => {
  audio.muted = !audio.muted;
  muteBtn.textContent = audio.muted ? '🔇' : '🔊';
  if (!audio.muted && audio.volume === 0) {
    audio.volume = lastVolume || .8; volume.value = audio.volume;
  }
});

search.addEventListener('input', () => {
  const q = search.value.trim().toLowerCase();
  filteredIndices = songs.map((s,i) => [s.title.toLowerCase(),i])
    .filter(([title]) => title.includes(q)).map(([,i]) => i);
  renderList();
});

document.getElementById('allSongsBtn').addEventListener('click', () => {
  search.value = ''; filteredIndices = songs.map((_,i)=>i); renderList();
});
document.getElementById('shuffleListBtn').addEventListener('click', () => {
  if (!shuffle) setShuffle();
  playSong(Math.floor(Math.random() * songs.length));
});
document.getElementById('themeBtn').addEventListener('click', () => document.body.classList.toggle('light'));

audio.volume = .8;

(async function init() {
  addedSongs = await loadAddedSongs();
  rebuildSongs();
  renderList();
})();
