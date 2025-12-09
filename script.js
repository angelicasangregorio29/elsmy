// Tema
const themeToggle = document.getElementById('themeToggle');
themeToggle?.addEventListener('click', () => {
  const isLight = document.documentElement.classList.toggle('light');
  themeToggle.textContent = isLight ? '🌞' : '🌓';
});

// Stato simulazione
let simInterval = null;
let isSimulationRunning = false;
let isRecordingRunning = false;
let emotionalHistory = [];
let simStartTime = null;

const hrvEl = document.getElementById('hrv');
const gsrEl = document.getElementById('gsr');
const tempEl = document.getElementById('temp');

const emotionStateEl = document.getElementById('emotionState');
const stressBar = document.getElementById('stressBar');
const calmBar = document.getElementById('calmBar');
const joyBar = document.getElementById('joyBar');
const adviceBox = document.getElementById('adviceBox');
const eventLog = document.getElementById('eventLog');
const emotionLevelEl = document.getElementById('emotionLevel');
const finalResultEl = document.getElementById('finalResult');

const startSimAndRecordBtn = document.getElementById('startSimAndRecord');
const stopSimAndRecordBtn = document.getElementById('stopSimAndRecord');
const safeModeBtn = document.getElementById('safeMode');
const recordVoiceBtn = document.getElementById('recordVoice');

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
  isSimulationRunning = true;
  emotionalHistory = [];
  simStartTime = Date.now();
  finalResultEl.textContent = 'Risultato finale: —';
  logEvent('Simulazione avviata.');
  simInterval = setInterval(() => {
    const sensor = generateSensorData();
    const emotion = estimateEmotion(sensor);
    updateUI(sensor, emotion);
    maybeTriggerAlerts(emotion);
    
    // Update emotion level display
    emotionLevelEl.textContent = `Livello emotivo: ${emotion.label} (Stress: ${emotion.stress}% | Calma: ${emotion.calm}% | Gioia: ${emotion.joy}%)`;
    
    // Store emotional state in history
    emotionalHistory.push({
      timestamp: Date.now() - simStartTime,
      emotion: emotion.label,
      stress: emotion.stress,
      calm: emotion.calm,
      joy: emotion.joy
    });
  }, 1200);
}

function stopSimulation() {
  if (!simInterval) return;
  clearInterval(simInterval);
  simInterval = null;
  isSimulationRunning = false;
  
  // Generate and show final summary
  if (emotionalHistory.length > 0) {
    const summary = generateEmotionalSummary();
    logEvent(`<strong>Riepilogo simulazione:</strong> ${summary}`);
    finalResultEl.textContent = `Risultato finale: ${summary}`;
  }
  
  emotionLevelEl.textContent = 'Livello emotivo: —';
  logEvent('Simulazione fermata.');
}

function generateEmotionalSummary() {
  if (emotionalHistory.length === 0) return 'Nessun dato disponibile.';
  
  const avgStress = Math.round(emotionalHistory.reduce((sum, h) => sum + h.stress, 0) / emotionalHistory.length);
  const avgCalm = Math.round(emotionalHistory.reduce((sum, h) => sum + h.calm, 0) / emotionalHistory.length);
  const avgJoy = Math.round(emotionalHistory.reduce((sum, h) => sum + h.joy, 0) / emotionalHistory.length);
  
  const emotionCounts = {};
  emotionalHistory.forEach(h => {
    emotionCounts[h.emotion] = (emotionCounts[h.emotion] || 0) + 1;
  });
  
  const dominantEmotion = Object.keys(emotionCounts).reduce((a, b) =>
    emotionCounts[a] > emotionCounts[b] ? a : b
  );
  
  const duration = emotionalHistory[emotionalHistory.length - 1].timestamp;
  const durationFormatted = formatDuration(Math.round(duration / 1000));
  
  return `Durata: ${durationFormatted} | Stress: ${avgStress}% | Calma: ${avgCalm}% | Gioia: ${avgJoy}% | Stato dominante: ${dominantEmotion}`;
}

function updateUnifiedButtonUI() {
  if (isSimulationRunning || isRecordingRunning) {
    startSimAndRecordBtn.style.display = 'none';
    stopSimAndRecordBtn.style.display = 'inline-flex';
  } else {
    startSimAndRecordBtn.style.display = 'inline-flex';
    stopSimAndRecordBtn.style.display = 'none';
  }
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

startSimAndRecordBtn?.addEventListener('click', async () => {
  if (!mediaRecorder) await initRecorder();
  
  // Avvia simulazione
  startSimulation();
  
  // Avvia registrazione
  if (mediaRecorder && mediaRecorder.state === 'inactive') {
    audioChunks = [];
    mediaRecorder.start();
    isRecordingRunning = true;
    recordingStart = Date.now();
    stopSimAndRecordBtn.classList.add('recording');
    recordingTimer = setInterval(() => {
      const elapsed = Math.round((Date.now() - recordingStart) / 1000);
      stopSimAndRecordBtn.textContent = `⏹️ Ferma (${formatDuration(elapsed)})`;
    }, 500);
    logEvent('Simulazione e registrazione vocale avviate.');
  }
  
  updateUnifiedButtonUI();
});

stopSimAndRecordBtn?.addEventListener('click', () => {
  // Ferma simulazione
  stopSimulation();
  
  // Ferma registrazione
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.stop();
    isRecordingRunning = false;
    stopSimAndRecordBtn.classList.remove('recording');
    if (recordingTimer) clearInterval(recordingTimer);
    recordingTimer = null;
    stopSimAndRecordBtn.textContent = '⏹️ Ferma';
    logEvent('Simulazione e registrazione fermati.');
  }
  
  updateUnifiedButtonUI();
});

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
let mediaRecorder;
let audioChunks = [];
let recordingStart = null;
let recordingTimer = null;

function formatDuration(sec) {
  const s = Math.floor(sec % 60).toString().padStart(2, '0');
  const m = Math.floor(sec / 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

async function initRecorder() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    logEvent('Registrazione non supportata dal browser.');
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) audioChunks.push(event.data);
    };

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      audioChunks = [];
      const audioUrl = URL.createObjectURL(audioBlob);
      const filename = `elsmy-recording-${Date.now()}.webm`;
      const durationSec = recordingStart ? Math.round((Date.now() - recordingStart) / 1000) : 0;

      // store recording in memory
      const recObj = { blob: audioBlob, url: audioUrl, filename, durationSec, serverUrl: null };
      recordings.unshift(recObj);
      renderRecordings();

      // Log in event log
      logEvent('Registrazione completata.');

      // Try upload to server
      try {
        const form = new FormData();
        form.append('file', audioBlob, filename);
        const res = await fetch('/upload', { method: 'POST', body: form });
        if (res.ok) {
          const data = await res.json().catch(() => ({}));
          if (data && data.url) {
            recObj.serverUrl = data.url;
            renderRecordings();
            logEvent('Registrazione salvata sul server: ' + data.url);
          } else {
            logEvent('Registrazione salvata sul server.');
          }
        } else {
          logEvent('Upload non riuscito: server ha risposto con codice ' + res.status + '.');
        }
      } catch (err) {
        logEvent('Upload fallito (nessun endpoint attivo o errore di rete).');
      }

      // Try inference (Hugging Face / SpeechBrain microservice)
      try {
        const form2 = new FormData();
        form2.append('file', audioBlob, filename);
        // Adjust URL if your inference service runs on another host/port
        const inferRes = await fetch('http://localhost:5001/infer', { method: 'POST', body: form2 });
        if (inferRes.ok) {
          const inferData = await inferRes.json().catch(() => ({}));
          if (inferData && inferData.results) {
            recObj.inference = inferData.results; // store results on the recording
            renderRecordings();
            // update live emotion level with top result
            if (inferData.results.length > 0) {
              const top = inferData.results[0];
              emotionLevelEl.textContent = `Livello emotivo (voice): ${top.label} (${Math.round(top.score*100)}%)`;
              logEvent('Inference vocale: ' + top.label + ' (' + Math.round(top.score*100) + '%)');
            }
          }
        } else {
          logEvent('Inference non riuscita: server ha risposto con codice ' + inferRes.status + '.');
        }
      } catch (err) {
        logEvent('Inference fallita (servizio locale non avviato?): ' + err.message);
      }

      // cleanup
      recordingStart = null;
      if (recordingTimer) { clearInterval(recordingTimer); recordingTimer = null; }
    };
  } catch (err) {
    logEvent('Errore nell\'accesso al microfono: ' + err.message);
  }
}

// recordings array and UI management
const recordings = [];
const recordingsListEl = document.getElementById('recordingsList');
const saveAllBtn = document.getElementById('saveAllRecordings');

function renderRecordings() {
  if (!recordingsListEl) return;
  recordingsListEl.innerHTML = '';
  recordings.forEach((r, idx) => {
    const li = document.createElement('li');
    li.className = 'recording-item';

    const left = document.createElement('div');
    left.style.display = 'flex';
    left.style.alignItems = 'center';

    const audio = document.createElement('audio');
    audio.src = r.url;
    audio.controls = true;
    left.appendChild(audio);

    const meta = document.createElement('div');
    meta.className = 'recording-meta';
    meta.textContent = `Durata: ${formatDuration(r.durationSec)}`;
    left.appendChild(meta);

    li.appendChild(left);

    const actions = document.createElement('div');
    actions.style.display = 'flex';
    actions.style.gap = '8px';
    actions.style.marginLeft = '12px';

    const download = document.createElement('a');
    download.href = r.url;
    download.download = r.filename;
    download.textContent = 'Download';
    download.className = 'btn btn-secondary';
    actions.appendChild(download);

    const del = document.createElement('button');
    del.className = 'btn btn-danger';
    del.textContent = 'Elimina';
    del.addEventListener('click', () => deleteRecording(idx));
    actions.appendChild(del);

    if (r.serverUrl) {
      const serverLink = document.createElement('a');
      serverLink.href = r.serverUrl;
      serverLink.target = '_blank';
      serverLink.textContent = 'Salvato';
      serverLink.className = 'btn btn-ghost';
      actions.appendChild(serverLink);
    }
    if (r.inference && r.inference.length) {
      const inf = r.inference[0];
      const infSpan = document.createElement('span');
      infSpan.className = 'recording-inference';
      infSpan.textContent = `${inf.label} (${Math.round(inf.score*100)}%)`;
      infSpan.style.marginLeft = '8px';
      infSpan.style.color = 'var(--primary)';
      actions.appendChild(infSpan);
    }

    li.appendChild(actions);
    recordingsListEl.appendChild(li);
  });
}

function deleteRecording(index) {
  if (index < 0 || index >= recordings.length) return;
  const filename = recordings[index].filename;
  showModal(
    'Eliminare questa registrazione?',
    `Eliminerai "${filename}" localmente. Questa azione non può essere annullata.`,
    () => {
      const rec = recordings[index];
      try { URL.revokeObjectURL(rec.url); } catch (e) {}
      recordings.splice(index, 1);
      renderRecordings();
      logEvent('Registrazione eliminata.');
    }
  );
}

// Modal for confirmations
const modal = document.getElementById('confirmModal');
const modalTitle = document.getElementById('modalTitle');
const modalMessage = document.getElementById('modalMessage');
const modalCancel = document.getElementById('modalCancel');
const modalConfirm = document.getElementById('modalConfirm');
let pendingAction = null;

function showModal(title, message, onConfirm) {
  modalTitle.textContent = title;
  modalMessage.textContent = message;
  pendingAction = onConfirm;
  modal.classList.remove('hidden');
}

function hideModal() {
  modal.classList.add('hidden');
  pendingAction = null;
}

modalCancel?.addEventListener('click', hideModal);
modal?.addEventListener('click', (e) => {
  if (e.target === modal) hideModal();
});

modalConfirm?.addEventListener('click', () => {
  if (pendingAction) pendingAction();
  hideModal();
});

const deleteAllBtn = document.getElementById('deleteAllRecordings');
deleteAllBtn?.addEventListener('click', () => {
  if (!recordings.length) { logEvent('Nessuna registrazione da eliminare.'); return; }
  showModal(
    'Eliminare tutte le registrazioni?',
    `Stai per eliminare ${recordings.length} registrazione(i) localmente. Questa azione non può essere annullata.`,
    () => {
      recordings.forEach(r => {
        try { URL.revokeObjectURL(r.url); } catch (e) {}
      });
      recordings.length = 0;
      renderRecordings();
      logEvent('Tutte le registrazioni sono state eliminate.');
    }
  );
});

saveAllBtn?.addEventListener('click', async () => {
  if (!recordings.length) { logEvent('Nessuna registrazione da scaricare.'); return; }
  if (typeof JSZip === 'undefined' || typeof saveAs === 'undefined') {
    logEvent('JSZip o FileSaver non disponibili.');
    return;
  }

  const zip = new JSZip();
  recordings.forEach((r, i) => {
    zip.file(r.filename, r.blob);
  });
  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, `elsmy-recordings-${Date.now()}.zip`);
  logEvent('Pacchetto registrazioni scaricato.');
});

// Standalone voice record button
recordVoiceBtn?.addEventListener('click', async () => {
  if (!mediaRecorder) await initRecorder();

  if (!mediaRecorder) return;

  if (mediaRecorder.state === 'inactive') {
    audioChunks = [];
    mediaRecorder.start();
    recordVoiceBtn.classList.add('recording');
    recordingStart = Date.now();
    recordingTimer = setInterval(() => {
      const elapsed = Math.round((Date.now() - recordingStart) / 1000);
      recordVoiceBtn.textContent = `⏹️ ${formatDuration(elapsed)} — Ferma`;
    }, 500);
    logEvent('Registrazione vocale avviata.');
  } else if (mediaRecorder.state === 'recording') {
    mediaRecorder.stop();
    recordVoiceBtn.classList.remove('recording');
    if (recordingTimer) clearInterval(recordingTimer);
    recordingTimer = null;
    recordVoiceBtn.textContent = '🎙️ Registra voce';
    logEvent('Registrazione vocale fermata.');
  }
});