// Tema
const themeToggle = document.getElementById('themeToggle');
themeToggle?.addEventListener('click', () => {
  const isLight = document.documentElement.classList.toggle('light');
  themeToggle.textContent = isLight ? '🌞' : '🌓';
});

// Stato simulazione
let simInterval = null;

const hrvEl = document.getElementById('hrv');
const gsrEl = document.getElementById('gsr');
const tempEl = document.getElementById('temp');

const emotionStateEl = document.getElementById('emotionState');
const stressBar = document.getElementById('stressBar');
const calmBar = document.getElementById('calmBar');
const joyBar = document.getElementById('joyBar');
const adviceBox = document.getElementById('adviceBox');
const eventLog = document.getElementById('eventLog');

const startSimBtn = document.getElementById('startSim');
const stopSimBtn = document.getElementById('stopSim');
const safeModeBtn = document.getElementById('safeMode');

function logEvent(message) {
  const li = document.createElement('li');
  const t = new Date();
  li.innerHTML = `<span class="time">${t.toLocaleTimeString()}</span>${message}`;
  eventLog.prepend(li);
}

// Generazione dati fake
function generateSensorData() {
  // Intervalli fittizi
  const hrv = Math.round(40 + Math.random() * 60);     // ms
  const gsr = +(0.5 + Math.random() * 4.5).toFixed(2); // uS
  const temp = +(35.8 + Math.random() * 2.0).toFixed(1); // °C
  return { hrv, gsr, temp };
}

// Stima stato emotivo semplice
function estimateEmotion({ hrv, gsr, temp }) {
  // Logica dimostrativa: maggiore GSR -> potenziale stress; maggiore HRV -> calma
  const stress = Math.min(100, Math.round((gsr / 5) * 100));
  const calm = Math.min(100, Math.round((hrv / 100) * 100));
  // Gioia: variazione random moderata con bias verso calma
  const joy = Math.min(100, Math.round((calm * 0.6) + Math.random() * 40));

  let label = 'Neutrale';
  if (stress > 60 && calm < 40) label = 'Stress';
  else if (calm > 60 && stress < 40) label = 'Calma';
  else if (joy > 65 && stress < 50) label = 'Gioia';

  return { stress, calm, joy, label };
}

function updateUI(sensor, emotion) {
  hrvEl.textContent = `${sensor.hrv} ms`;
  gsrEl.textContent = `${sensor.gsr} uS`;
  tempEl.textContent = `${sensor.temp} °C`;

  stressBar.style.width = `${emotion.stress}%`;
  calmBar.style.width = `${emotion.calm}%`;
  joyBar.style.width = `${emotion.joy}%`;

  emotionStateEl.textContent = emotion.label;
  emotionStateEl.style.background =
    emotion.label === 'Stress' ? '#3a0f12' :
    emotion.label === 'Calma' ? '#133a2a' :
    emotion.label === 'Gioia' ? '#2b2a13' : '#273158';

  adviceBox.textContent = (() => {
    switch (emotion.label) {
      case 'Stress':
        return 'Sembra che tu stia vivendo tensione. Fai una pausa breve: respira, idratazione e un cambio di contesto.';
      case 'Calma':
        return 'Ottimo equilibrio. Puoi consolidare questa calma con una breve passeggiata o stretching leggero.';
      case 'Gioia':
        return 'Stato positivo. Nota cosa lo favorisce: musica, socialità, routine—così potrai riattivarlo in futuro.';
      default:
        return 'Stato neutro. Osserva come varia nel tempo e costruisci micro-abitudini di cura.';
    }
  })();
}

function maybeTriggerAlerts(emotion) {
  // Semplice dimostrazione di alert
  if (emotion.label === 'Stress' && emotion.stress > 75) {
    logEvent('Alert: stress elevato rilevato. Protocolli di protezione disponibili.');
  }
  if (emotion.label === 'Calma' && emotion.calm > 80) {
    logEvent('Nota: livello di calma stabile. Nessun intervento richiesto.');
  }
}

function startSimulation() {
  if (simInterval) return;
  logEvent('Simulazione avviata.');
  simInterval = setInterval(() => {
    const sensor = generateSensorData();
    const emotion = estimateEmotion(sensor);
    updateUI(sensor, emotion);
    maybeTriggerAlerts(emotion);
  }, 1200);
}

function stopSimulation() {
  if (!simInterval) return;
  clearInterval(simInterval);
  simInterval = null;
  logEvent('Simulazione fermata.');
}

function enterSafeMode() {
  // Dimostrazione: safe mode attiva blocco alert e suggerimenti calmanti
  logEvent('Safe mode attivato: riduzione stimoli, suggerimenti calmanti.');
  adviceBox.textContent = 'Safe mode: silenzia notifiche non essenziali, respira 4-4-4 per 60 secondi, idratazione.';
  emotionStateEl.textContent = 'Safe mode';
  emotionStateEl.style.background = '#133a2a';
  stressBar.style.width = '10%';
  calmBar.style.width = '70%';
  joyBar.style.width = '40%';
}

startSimBtn?.addEventListener('click', startSimulation);
stopSimBtn?.addEventListener('click', stopSimulation);
safeModeBtn?.addEventListener('click', enterSafeMode);

// Journaling
const journalForm = document.getElementById('journalForm');
const journalText = document.getElementById('journalText');
const journalList = document.getElementById('journalList');

journalForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = (journalText.value || '').trim();
  if (!text) return;
  const li = document.createElement('li');
  const t = new Date();
  li.textContent = `${t.toLocaleString()} — ${text}`;
  journalList.prepend(li);
  journalText.value = '';
  logEvent('Nota di journaling salvata.');
});

// Accessibilità: focus visibile su tab
(function () {
  let usingMouse = false;
  document.addEventListener('mousedown', () => { usingMouse = true; });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      usingMouse = false;
      document.body.classList.add('show-focus');
    }
  });
  document.addEventListener('mousemove', () => {
    if (usingMouse) document.body.classList.remove('show-focus');
  });
})();

// --- Registrazione vocale ---
const recordBtn = document.getElementById('recordVoice');
let mediaRecorder;
let audioChunks = [];

async function initRecorder() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) audioChunks.push(event.data);
    };

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      audioChunks = [];
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.controls = true;

      // Mostra nel log eventi
      const li = document.createElement('li');
      li.innerHTML = `<span class="time">${new Date().toLocaleTimeString()}</span> Registrazione completata.`;
      eventLog.prepend(li);

      // Aggiunge player audio
      eventLog.prepend(audio);
    };
  } catch (err) {
    logEvent('Errore nell\'accesso al microfono: ' + err.message);
  }
}

recordBtn?.addEventListener('click', async () => {
  if (!mediaRecorder) await initRecorder();

  if (mediaRecorder.state === 'inactive') {
    mediaRecorder.start();
    recordBtn.classList.add('recording');
    recordBtn.textContent = '⏹️ Ferma registrazione';
    logEvent('Registrazione vocale avviata.');
  } else if (mediaRecorder.state === 'recording') {
    mediaRecorder.stop();
    recordBtn.classList.remove('recording');
    recordBtn.textContent = '🎙️ Registra voce';
    logEvent('Registrazione vocale fermata.');
  }
});