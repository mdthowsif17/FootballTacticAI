// ===================== MATCH TRACKER =====================

function getTrackerHTML() {
  return `
<div class="tracker-wrapper">
  <!-- Setup Screen -->
  <div id="trackerSetup">
    <div class="text-center mb-4 pt-2">
      <div style="font-size:2.5rem">⚽</div>
      <h4 class="text-white fw-bold mt-2">Match Tracker Setup</h4>
      <p class="text-muted small">Set match duration to begin live tracking</p>
    </div>
    <div class="row justify-content-center">
      <div class="col-12 col-sm-8 col-md-6">
        <div class="section-card">
          <label class="form-label">Match Duration (minutes)</label>
          <input type="number" id="matchDuration" class="dark-input w-100 mb-3" value="" min="10" max="90" placeholder="e.g. 90">
          <div id="halfDisplay" style="background:rgba(0,212,255,0.05);border:1px solid var(--border);border-radius:0.75rem;padding:1rem;margin-bottom:1.25rem;display:none">
            <div class="row text-center g-2">
              <div class="col-6"><div class="text-muted small">First Half</div><div class="text-cyan fw-bold" id="half1Label">45 min</div></div>
              <div class="col-6"><div class="text-muted small">Second Half</div><div class="text-cyan fw-bold" id="half2Label">45 min</div></div>
            </div>
          </div>
          <button class="submit-btn" onclick="startMatch()"><i class="fas fa-play me-2"></i>Start Match</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Live Tracker -->
<div id="trackerLive" style="display:none">
  <div class="row g-2">

    <!-- LEFT COL -->
    <div class="col-6">

      <!-- 1. Possession -->
      <div class="tracker-section mb-2">
        <h6><i class="fas fa-circle me-1" style="color:var(--cyan)"></i>Possession</h6>
        <div class="d-flex justify-content-between mb-1" style="font-size:0.75rem">
          <span>Us <span class="text-cyan fw-bold" id="ourPossDisplay">0%</span></span>
          <span>Them <span style="color:var(--pink)" class="fw-bold" id="oppPossDisplay">0%</span></span>
        </div>
        <div class="poss-bar mb-1"><div class="poss-fill-our" id="possBar" style="width:0%"></div></div>
        <div class="event-btns mb-1">
          <button class="btn-our" onclick="setPossession('our')" style="font-size:0.72rem;padding:0.4rem"><i class="fas fa-circle me-1"></i>We</button>
          <button class="btn-opp" onclick="setPossession('opp')" style="font-size:0.72rem;padding:0.4rem"><i class="fas fa-circle me-1"></i>They</button>
        </div>
        <button class="btn-undo" onclick="undoPossession()"><i class="fas fa-undo me-1"></i>Undo</button>
      </div>

      <!-- 2. Shots | 3. SoT side by side -->
      <div class="row g-2 mb-2">
        <div class="col-6">
          <div class="tracker-section h-100">
            <h6><i class="fas fa-bullseye me-1" style="color:var(--cyan)"></i>Shots</h6>
            <div class="d-flex justify-content-between mb-1">
              <span class="text-cyan fw-bold" style="font-size:1rem" id="ourShotsDisplay">0</span>
              <span style="color:var(--pink);font-weight:700;font-size:1rem" id="oppShotsDisplay">0</span>
            </div>
            <div class="event-btns mb-1">
              <button class="btn-our" onclick="addEvent('ourShots','ourShotsDisplay')" style="font-size:0.7rem;padding:0.35rem"><i class="fas fa-futbol"></i> We</button>
              <button class="btn-opp" onclick="addEvent('oppShots','oppShotsDisplay')" style="font-size:0.7rem;padding:0.35rem"><i class="fas fa-futbol"></i> They</button>
            </div>
            <button class="btn-undo" onclick="undoEvent('ourShots','oppShots','ourShotsDisplay','oppShotsDisplay','shots')"><i class="fas fa-undo me-1"></i>Undo</button>
          </div>
        </div>
        <div class="col-6">
          <div class="tracker-section h-100">
            <h6><i class="fas fa-crosshairs me-1" style="color:var(--cyan)"></i>SoT</h6>
            <div class="d-flex justify-content-between mb-1">
              <span class="text-cyan fw-bold" style="font-size:1rem" id="ourSotDisplay">0</span>
              <span style="color:var(--pink);font-weight:700;font-size:1rem" id="oppSotDisplay">0</span>
            </div>
            <div class="event-btns mb-1">
              <button class="btn-our" onclick="addEvent('ourSot','ourSotDisplay')" style="font-size:0.7rem;padding:0.35rem"><i class="fas fa-crosshairs"></i> We</button>
              <button class="btn-opp" onclick="addEvent('oppSot','oppSotDisplay')" style="font-size:0.7rem;padding:0.35rem"><i class="fas fa-crosshairs"></i> They</button>
            </div>
            <button class="btn-undo" onclick="undoEvent('ourSot','oppSot','ourSotDisplay','oppSotDisplay','sot')"><i class="fas fa-undo me-1"></i>Undo</button>
          </div>
        </div>
      </div>

      <!-- 4. Goals -->
      <div class="tracker-section">
        <h6><i class="fas fa-trophy me-1" style="color:var(--orange)"></i>Goals</h6>
        <div class="d-flex justify-content-between mb-1">
          <span class="text-cyan fw-bold" style="font-size:1rem" id="ourGoalsDisplay">0</span>
          <span style="color:var(--pink);font-weight:700;font-size:1rem" id="oppGoalsDisplay">0</span>
        </div>
        <div class="event-btns mb-1">
          <button class="btn-our" onclick="addGoal('our')" style="font-size:0.72rem;padding:0.4rem">⚽ We</button>
          <button class="btn-opp" onclick="addGoal('opp')" style="font-size:0.72rem;padding:0.4rem">⚽ They</button>
        </div>
        <button class="btn-undo" onclick="undoGoal()"><i class="fas fa-undo me-1"></i>Undo</button>
      </div>

    </div>

    <!-- RIGHT COL -->
    <div class="col-6">

      <!-- 5. Timer | 6. Live Score side by side -->
      <div class="row g-2 mb-2">
        <div class="col-6">
          <div class="tracker-timer" style="padding:0.5rem">
            <div class="timer-label" id="halfLabel" style="font-size:0.65rem">FIRST HALF</div>
            <div class="timer-display" id="timerDisplay" style="font-size:1.4rem;letter-spacing:1px">00:00</div>
            <div class="text-muted" id="timerMax" style="font-size:0.6rem">/ 00:00</div>
            <div class="d-flex gap-1 justify-content-center mt-1 flex-wrap">
              <button class="btn btn-sm" style="background:rgba(16,185,129,0.15);border:1px solid rgba(16,185,129,0.3);color:#10b981;border-radius:0.5rem;font-size:0.6rem;padding:0.15rem 0.35rem" onclick="addExtraTime()">
                <i class="fas fa-plus"></i> Extra
              </button>
              <button class="btn btn-sm" id="halfEndBtn" style="background:rgba(245,158,11,0.15);border:1px solid rgba(245,158,11,0.3);color:#f59e0b;border-radius:0.5rem;font-size:0.6rem;padding:0.15rem 0.35rem;display:none" onclick="endHalf()">End</button>
            </div>
          </div>
        </div>
        <div class="col-6">
          <div class="tracker-timer" style="padding:0.5rem">
            <div class="timer-label mb-1" style="font-size:0.65rem">LIVE SCORE</div>
            <div class="d-flex justify-content-center align-items-center gap-1">
              <div class="text-center">
                <div class="text-muted" style="font-size:0.6rem">US</div>
                <div style="font-size:1.4rem;font-weight:900;color:var(--cyan)" id="scoreOur">0</div>
              </div>
              <div style="color:#94a3b8;font-size:1rem">:</div>
              <div class="text-center">
                <div class="text-muted" style="font-size:0.6rem">THEM</div>
                <div style="font-size:1.4rem;font-weight:900;color:var(--pink)" id="scoreOpp">0</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 7. Live Stats -->
      <div class="tracker-section">
        <h6><i class="fas fa-chart-bar me-1" style="color:var(--cyan)"></i>Live Statistics</h6>
        <div class="row g-1 mb-2">
          <div class="col-6 text-center">
            <div style="font-size:0.6rem;color:var(--text-muted)">Our Possession</div>
            <div style="font-size:0.9rem;font-weight:800;color:var(--cyan)" id="statOurPoss">0%</div>
          </div>
          <div class="col-6 text-center">
            <div style="font-size:0.6rem;color:var(--text-muted)">Opp Possession</div>
            <div style="font-size:0.9rem;font-weight:800;color:var(--pink)" id="statOppPoss">0%</div>
          </div>
          <div class="col-6 text-center">
            <div style="font-size:0.6rem;color:var(--text-muted)">Our Shots</div>
            <div style="font-size:0.9rem;font-weight:800;color:var(--cyan)" id="statOurShots">0</div>
          </div>
          <div class="col-6 text-center">
            <div style="font-size:0.6rem;color:var(--text-muted)">Opp Shots</div>
            <div style="font-size:0.9rem;font-weight:800;color:var(--pink)" id="statOppShots">0</div>
          </div>
          <div class="col-6 text-center">
            <div style="font-size:0.6rem;color:var(--text-muted)">Our SoT</div>
            <div style="font-size:0.9rem;font-weight:800;color:var(--cyan)" id="statOurSot">0</div>
          </div>
          <div class="col-6 text-center">
            <div style="font-size:0.6rem;color:var(--text-muted)">Opp SoT</div>
            <div style="font-size:0.9rem;font-weight:800;color:var(--pink)" id="statOppSot">0</div>
          </div>
          <div class="col-6 text-center">
            <div style="font-size:0.6rem;color:var(--text-muted)">Our Goals</div>
            <div style="font-size:0.9rem;font-weight:800;color:var(--cyan)" id="statOurGoals">0</div>
          </div>
          <div class="col-6 text-center">
            <div style="font-size:0.6rem;color:var(--text-muted)">Opp Goals</div>
            <div style="font-size:0.9rem;font-weight:800;color:var(--pink)" id="statOppGoals">0</div>
          </div>
        </div>

        <!-- Save + Transfer -->
        <button class="btn-undo w-100 mb-2" style="font-size:0.75rem" onclick="saveTrackerHistory()"><i class="fas fa-save me-1"></i>Save Stats</button>
        <div id="transferBtns" style="display:none">
          <div class="text-center text-muted mb-1" style="font-size:0.7rem">Transfer to:</div>
          <div class="d-flex gap-1">
            <button class="btn-our flex-fill" style="font-size:0.7rem" onclick="transferStats('11s')">11s</button>
            <button class="btn-our flex-fill" style="font-size:0.7rem" onclick="transferStats('7s')">7s</button>
            <button class="btn-our flex-fill" style="font-size:0.7rem" onclick="transferStats('5s')">5s</button>
          </div>
        </div>
      </div>

    </div>
  </div>
</div>

    
  <!-- Half Complete Screen -->
  <div id="trackerHalfEnd" style="display:none">
    <div class="text-center py-4">
      <div style="font-size:3rem">🏁</div>
      <h4 class="text-white fw-bold mt-2" id="halfEndTitle">First Half Completed!</h4>
      <p class="text-muted">Final Statistics</p>
    </div>
    <div class="row justify-content-center">
      <div class="col-12 col-sm-10 col-md-8">
        <div class="section-card">
          <div class="stat-grid mb-3">
            <div class="stat-box"><div class="s-label">Our Possession</div><div class="s-val our" id="finalOurPoss">0%</div></div>
            <div class="stat-box"><div class="s-label">Opp Possession</div><div class="s-val opp" id="finalOppPoss">0%</div></div>
            <div class="stat-box"><div class="s-label">Our Shots</div><div class="s-val our" id="finalOurShots">0</div></div>
            <div class="stat-box"><div class="s-label">Opp Shots</div><div class="s-val opp" id="finalOppShots">0</div></div>
            <div class="stat-box"><div class="s-label">Our SoT</div><div class="s-val our" id="finalOurSot">0</div></div>
            <div class="stat-box"><div class="s-label">Opp SoT</div><div class="s-val opp" id="finalOppSot">0</div></div>
            <div class="stat-box"><div class="s-label">Our Goals</div><div class="s-val our" id="finalOurGoals">0</div></div>
            <div class="stat-box"><div class="s-label">Opp Goals</div><div class="s-val opp" id="finalOppGoals">0</div></div>
          </div>
          <div class="text-center mb-3">
            <p class="text-muted small mb-2">Transfer stats to tactical analysis:</p>
            <div class="d-flex gap-2 justify-content-center flex-wrap">
              <button class="btn-our px-3" style="border-radius:0.5rem" onclick="transferStats('11s')">11-a-Side →</button>
              <button class="btn-our px-3" style="border-radius:0.5rem" onclick="transferStats('7s')">7-a-Side →</button>
              <button class="btn-our px-3" style="border-radius:0.5rem" onclick="transferStats('5s')">5-a-Side →</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>`;
}

// ===== TRACKER STATE =====
let trackerState = {
  running: false,
  matchDuration: 90,
  halfDuration: 45,
  extraTime: 0,
  timerInterval: null,
  elapsedSeconds: 0,
  currentHalf: 1,

  // Possession
  currentPossTeam: null,
  possStartTime: 0,
  ourPossTime: 0,
  oppPossTime: 0,
  possHistory: [],

  // Stats
  ourShots: 0, oppShots: 0,
  ourSot: 0, oppSot: 0,
  ourGoals: 0, oppGoals: 0,

  // Undo stacks
  shotsHistory: [],
  sotHistory: [],
  goalHistory: [],
};

function initTracker() {
  const durInput = document.getElementById('matchDuration');
  if (durInput) {
    durInput.addEventListener('input', () => {
      let d = parseInt(durInput.value);

      // Max 90 min limit


      if (!d || d <= 0) {
        document.getElementById('halfDisplay').style.display = 'none';
        return;
      }

      const totalSecs = d * 60;
      const halfSecs = totalSecs / 2;
      const mins = Math.floor(halfSecs / 60);
      const secs = halfSecs % 60;
      const halfLabel = secs > 0 ? `${mins}:${String(secs).padStart(2, '0')} min` : `${mins} min`;

      document.getElementById('half1Label').textContent = halfLabel;
      document.getElementById('half2Label').textContent = halfLabel;
      document.getElementById('halfDisplay').style.display = 'block';
    });
  }
}

function startMatch() {
  const dur = parseInt(document.getElementById('matchDuration').value);

  if (!dur || dur <= 0 || dur > 90) {
    alert('Enter the Valid match duration!');
    document.getElementById('matchDuration').value = '';
    document.getElementById('halfDisplay').style.display = 'none';
    return;
  }

  const totalSecs = dur * 60;
  const halfSecs = totalSecs / 2;

  trackerState.matchDuration = dur;
  trackerState.halfDuration = halfSecs / 60;
  trackerState.halfDurationSecs = halfSecs;
  trackerState.extraTime = 0;
  trackerState.elapsedSeconds = 0;
  trackerState.running = true;
  trackerState.currentHalf = 1;
  trackerState.currentPossTeam = null;
  trackerState.ourPossTime = 0;
  trackerState.oppPossTime = 0;
  trackerState.ourShots = 0;
  trackerState.oppShots = 0;
  trackerState.ourSot = 0;
  trackerState.oppSot = 0;
  trackerState.ourGoals = 0;
  trackerState.oppGoals = 0;
  trackerState.possHistory = [];
  trackerState.shotsHistory = [];
  trackerState.sotHistory = [];
  trackerState.goalHistory = [];

  document.getElementById('trackerSetup').style.display = 'none';
  document.getElementById('trackerLive').style.display = 'block';
  document.getElementById('halfLabel').textContent = 'FIRST HALF';
  updateTimerMax();

  if (trackerState.timerInterval) clearInterval(trackerState.timerInterval);
  trackerState.timerInterval = setInterval(tickTimer, 1000);
}

function tickTimer() {
  if (!trackerState.running) return;
  trackerState.elapsedSeconds++;

  if (trackerState.currentPossTeam) {
    updatePossessionDisplay();
  }

  const totalSecs = trackerState.halfDurationSecs + (trackerState.extraTime * 60);

  document.getElementById('timerDisplay').textContent = formatTime(trackerState.elapsedSeconds);

  if (trackerState.elapsedSeconds >= totalSecs) {
    clearInterval(trackerState.timerInterval);
    trackerState.running = false;
    finishPossession();
    showHalfEnd();
  }
}

function formatTime(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function updateTimerMax() {
  const totalSecs = trackerState.halfDurationSecs + (trackerState.extraTime * 60);
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  document.getElementById('timerMax').textContent = `/ ${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function addExtraTime() {
  const options = [1, 2, 3, 4, 5];
  const choice = prompt('Add extra minutes (1-5):', '3');
  const mins = parseInt(choice);
  if (mins && mins > 0 && mins <= 10) {
    trackerState.extraTime += mins;
    updateTimerMax();
    document.getElementById('halfEndBtn').style.display = 'inline-block';
  }
}

function endHalf() {
  if (confirm('End this half now?')) {
    clearInterval(trackerState.timerInterval);
    trackerState.running = false;
    finishPossession();
    showHalfEnd();
  }
}

function finishPossession() {
  if (trackerState.currentPossTeam) {
    const dur = trackerState.elapsedSeconds - trackerState.possStartTime;
    if (trackerState.currentPossTeam === 'our') trackerState.ourPossTime += dur;
    else trackerState.oppPossTime += dur;
    trackerState.currentPossTeam = null;
  }
}

function setPossession(team) {
  if (!trackerState.running) return;
  const now = trackerState.elapsedSeconds;

  // Save to undo history
  trackerState.possHistory.push({
    team: trackerState.currentPossTeam,
    startTime: trackerState.possStartTime,
    ourPossTime: trackerState.ourPossTime,
    oppPossTime: trackerState.oppPossTime,
    elapsed: now
  });

  if (trackerState.currentPossTeam) {
    const dur = now - trackerState.possStartTime;
    if (trackerState.currentPossTeam === 'our') trackerState.ourPossTime += dur;
    else trackerState.oppPossTime += dur;
  }

  trackerState.currentPossTeam = team;
  trackerState.possStartTime = now;
  updatePossessionDisplay();
}

function undoPossession() {
  if (trackerState.possHistory.length === 0) return;
  const prev = trackerState.possHistory.pop();
  trackerState.currentPossTeam = prev.team;
  trackerState.possStartTime = prev.startTime;
  trackerState.ourPossTime = prev.ourPossTime;
  trackerState.oppPossTime = prev.oppPossTime;
  updatePossessionDisplay();
}

function updatePossessionDisplay() {
  let ourT = trackerState.ourPossTime;
  let oppT = trackerState.oppPossTime;

  // Add current live time
  if (trackerState.currentPossTeam && trackerState.running) {
    const liveDur = trackerState.elapsedSeconds - trackerState.possStartTime;
    if (trackerState.currentPossTeam === 'our') ourT += liveDur;
    else oppT += liveDur;
  }

  const total = ourT + oppT;
  const ourPct = total > 0 ? Math.round((ourT / total) * 100) : 0;
  const oppPct = 100 - ourPct;

  if (document.getElementById('ourPossDisplay')) {
    document.getElementById('ourPossDisplay').textContent = ourPct + '%';
    document.getElementById('oppPossDisplay').textContent = oppPct + '%';
    document.getElementById('possBar').style.width = ourPct + '%';
    document.getElementById('statOurPoss').textContent = ourPct + '%';
    document.getElementById('statOppPoss').textContent = oppPct + '%';
  }
}

function addEvent(statKey, displayId) {
  if (!trackerState.running) { showToast('Match not running', 'error'); return; }
  trackerState[statKey]++;
  document.getElementById(displayId).textContent = trackerState[statKey];

  const map = {
    ourShots: 'statOurShots', oppShots: 'statOppShots',
    ourSot: 'statOurSot', oppSot: 'statOppSot'
  };
  if (map[statKey]) document.getElementById(map[statKey]).textContent = trackerState[statKey];

  const histKey = statKey.includes('Shots') ? 'shotsHistory' : 'sotHistory';
  trackerState[histKey].push(statKey);

  // SoT click panna Shots um auto add
  if (statKey === 'ourSot') {
    trackerState.ourShots++;
    trackerState.shotsHistory.push('ourShots');
    document.getElementById('ourShotsDisplay').textContent = trackerState.ourShots;
    document.getElementById('statOurShots').textContent = trackerState.ourShots;
  } else if (statKey === 'oppSot') {
    trackerState.oppShots++;
    trackerState.shotsHistory.push('oppShots');
    document.getElementById('oppShotsDisplay').textContent = trackerState.oppShots;
    document.getElementById('statOppShots').textContent = trackerState.oppShots;
  }
}

function undoEvent(ourKey, oppKey, ourDisplay, oppDisplay, type) {
  const histKey = type === 'shots' ? 'shotsHistory' : 'sotHistory';
  const hist = trackerState[histKey];
  if (!hist.length) return;

  const last = hist.pop();

  if (last === ourKey && trackerState[ourKey] > 0) {
    trackerState[ourKey]--;
    document.getElementById(ourDisplay).textContent = trackerState[ourKey];
    // SoT undo panna Shots um minus
    if (type === 'sot' && trackerState.ourShots > 0) {
      trackerState.ourShots--;
      document.getElementById('ourShotsDisplay').textContent = trackerState.ourShots;
      document.getElementById('statOurShots').textContent = trackerState.ourShots;
    }
  } 
   else if (last === oppKey && trackerState[oppKey] > 0) {
    trackerState[oppKey]--;
    document.getElementById(oppDisplay).textContent = trackerState[oppKey];
    // SoT undo panna Shots um minus
    if (type === 'sot' && trackerState.oppShots > 0) {
      trackerState.oppShots--;
      document.getElementById('oppShotsDisplay').textContent = trackerState.oppShots;
      document.getElementById('statOppShots').textContent = trackerState.oppShots;
    }
  }

  const mapOur = { ourShots: 'statOurShots', ourSot: 'statOurSot' };
  const mapOpp = { oppShots: 'statOppShots', oppSot: 'statOppSot' };
  if (mapOur[ourKey]) document.getElementById(mapOur[ourKey]).textContent = trackerState[ourKey];
  if (mapOpp[oppKey]) document.getElementById(mapOpp[oppKey]).textContent = trackerState[oppKey];
}

function addGoal(team) {
  if (!trackerState.running) return;

  // Goal + SoT + Shots ellam add aagum
  if (team === 'our') {
    trackerState.ourGoals++;
    trackerState.ourSot++;
    trackerState.ourShots++;
    trackerState.goalHistory.push('our');
    trackerState.sotHistory.push('ourSot');
    trackerState.shotsHistory.push('ourShots');
  } else {
    trackerState.oppGoals++;
    trackerState.oppSot++;
    trackerState.oppShots++;
    trackerState.goalHistory.push('opp');
    trackerState.sotHistory.push('oppSot');
    trackerState.shotsHistory.push('oppShots');
  }

  // Update all displays
  document.getElementById('ourGoalsDisplay').textContent = trackerState.ourGoals;
  document.getElementById('oppGoalsDisplay').textContent = trackerState.oppGoals;
  document.getElementById('scoreOur').textContent = trackerState.ourGoals;
  document.getElementById('scoreOpp').textContent = trackerState.oppGoals;
  document.getElementById('statOurGoals').textContent = trackerState.ourGoals;
  document.getElementById('statOppGoals').textContent = trackerState.oppGoals;
  document.getElementById('ourSotDisplay').textContent = trackerState.ourSot;
  document.getElementById('oppSotDisplay').textContent = trackerState.oppSot;
  document.getElementById('statOurSot').textContent = trackerState.ourSot;
  document.getElementById('statOppSot').textContent = trackerState.oppSot;
  document.getElementById('ourShotsDisplay').textContent = trackerState.ourShots;
  document.getElementById('oppShotsDisplay').textContent = trackerState.oppShots;
  document.getElementById('statOurShots').textContent = trackerState.ourShots;
  document.getElementById('statOppShots').textContent = trackerState.oppShots;
}

function undoGoal() {
  if (!trackerState.goalHistory.length) return;
  const last = trackerState.goalHistory.pop();

  if (last === 'our') {
    if (trackerState.ourGoals > 0) trackerState.ourGoals--;
    if (trackerState.ourSot > 0) trackerState.ourSot--;
    if (trackerState.ourShots > 0) trackerState.ourShots--;
  } else {
    if (trackerState.oppGoals > 0) trackerState.oppGoals--;
    if (trackerState.oppSot > 0) trackerState.oppSot--;
    if (trackerState.oppShots > 0) trackerState.oppShots--;
  }

  document.getElementById('ourGoalsDisplay').textContent = trackerState.ourGoals;
  document.getElementById('oppGoalsDisplay').textContent = trackerState.oppGoals;
  document.getElementById('scoreOur').textContent = trackerState.ourGoals;
  document.getElementById('scoreOpp').textContent = trackerState.oppGoals;
  document.getElementById('statOurGoals').textContent = trackerState.ourGoals;
  document.getElementById('statOppGoals').textContent = trackerState.oppGoals;
  document.getElementById('ourSotDisplay').textContent = trackerState.ourSot;
  document.getElementById('oppSotDisplay').textContent = trackerState.oppSot;
  document.getElementById('statOurSot').textContent = trackerState.ourSot;
  document.getElementById('statOppSot').textContent = trackerState.oppSot;
  document.getElementById('ourShotsDisplay').textContent = trackerState.ourShots;
  document.getElementById('oppShotsDisplay').textContent = trackerState.oppShots;
  document.getElementById('statOurShots').textContent = trackerState.ourShots;
  document.getElementById('statOppShots').textContent = trackerState.oppShots;
}

function getFinalStats() {
  let ourT = trackerState.ourPossTime;
  let oppT = trackerState.oppPossTime;
  const total = ourT + oppT;
  const ourPct = total > 0 ? Math.round((ourT / total) * 100) : 0;
  return {
    our_possession_percentage: ourPct,
    opp_possession_percentage: 100 - ourPct,
    our_shot: trackerState.ourShots,
    opp_shot: trackerState.oppShots,
    our_shot_on_target: trackerState.ourSot,
    opp_shot_on_target: trackerState.oppSot,
    our_goal: trackerState.ourGoals,
    opp_goal: trackerState.oppGoals,
  };
}

function showHalfEnd() {
  document.getElementById('trackerLive').style.display = 'none';
  document.getElementById('trackerHalfEnd').style.display = 'block';

  const stats = getFinalStats();
  document.getElementById('finalOurPoss').textContent = stats.our_possession_percentage + '%';
  document.getElementById('finalOppPoss').textContent = stats.opp_possession_percentage + '%';
  document.getElementById('finalOurShots').textContent = stats.our_shot;
  document.getElementById('finalOppShots').textContent = stats.opp_shot;
  document.getElementById('finalOurSot').textContent = stats.our_shot_on_target;
  document.getElementById('finalOppSot').textContent = stats.opp_shot_on_target;
  document.getElementById('finalOurGoals').textContent = stats.our_goal;
  document.getElementById('finalOppGoals').textContent = stats.opp_goal;
  // Edit section add pannu
document.getElementById('trackerHalfEnd').innerHTML += `
<div class="section-card mt-3" id="editSection" style="display:none">
  <h6 style="color:var(--cyan)">✏️ Edit Statistics</h6>
  <div class="row g-2">
    <div class="col-6">
      <label class="form-label">Our Possession %</label>
      <input type="number" id="edit_our_poss" class="dark-input w-100" min="0" max="100" onkeydown="restrictNumericInput(event)">
    </div>
    <div class="col-6">
      <label class="form-label">Opp Possession %</label>
      <input type="number" id="edit_opp_poss" class="dark-input w-100" min="0" max="100" onkeydown="restrictNumericInput(event)">
    </div>
    <div class="col-6">
      <label class="form-label">Our Shots</label>
      <input type="number" id="edit_our_shot" class="dark-input w-100" min="0" max="30" onkeydown="restrictNumericInput(event)">
    </div>
    <div class="col-6">
      <label class="form-label">Opp Shots</label>
      <input type="number" id="edit_opp_shot" class="dark-input w-100" min="0" max="30" onkeydown="restrictNumericInput(event)">
    </div>
    <div class="col-6">
      <label class="form-label">Our SoT</label>
      <input type="number" id="edit_our_sot" class="dark-input w-100" min="0" max="25" onkeydown="restrictNumericInput(event)">
    </div>
    <div class="col-6">
      <label class="form-label">Opp SoT</label>
      <input type="number" id="edit_opp_sot" class="dark-input w-100" min="0" max="25" onkeydown="restrictNumericInput(event)">
    </div>
    <div class="col-6">
      <label class="form-label">Our Goals</label>
      <input type="number" id="edit_our_goal" class="dark-input w-100" min="0" max="20" onkeydown="restrictNumericInput(event)">
    </div>
    <div class="col-6">
      <label class="form-label">Opp Goals</label>
      <input type="number" id="edit_opp_goal" class="dark-input w-100" min="0" max="20" onkeydown="restrictNumericInput(event)">
    </div>
  </div>
  <div class="d-flex gap-2 mt-3">
    <button class="btn-our flex-fill" onclick="confirmEdit()">✅ Confirm Changes</button>
    <button class="btn-undo flex-fill" onclick="cancelEdit()">❌ Cancel</button>
  </div>
</div>
<div class="text-center mt-2">
  <button class="btn-undo px-4" onclick="openEditSection()">✏️ Edit Stats</button>
</div>
`;

  // Show transfer buttons in live panel too
  const tb = document.getElementById('transferBtns');
  if (tb) tb.style.display = 'block';

  // Save history
  saveTrackerHistory();
}

async function saveTrackerHistory() {
  const stats = getFinalStats();
  await fetch('/api/save_tracker', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(stats)
  });
  showToast('Stats saved to history!');
}

function transferStats(matchType) {
  // Edited stats irundha adha use pannu, illa original use pannu
  const stats = window._editedStats || getFinalStats();
  sessionStorage.setItem('tracker_stats', JSON.stringify(stats));
  const modal = bootstrap.Modal.getInstance(document.getElementById('trackerModal'));
  if(modal) modal.hide();
  window.location.href = `/input/${matchType}`;
}
function restrictNumericInput(event) {
  const invalidKeys = ['e', 'E', '+', '-'];
  if (invalidKeys.includes(event.key)) {
    event.preventDefault();
  }
}

function parseNumberInput(id) {
  const input = document.getElementById(id);
  if (!input) return NaN;
  const value = String(input.value).trim();
  return value === '' ? NaN : parseInt(value, 10);
}

function openEditSection() {
  const stats = getFinalStats();
  const setValue = (id, value) => {
    const input = document.getElementById(id);
    if (input) input.value = value;
  };

  setValue('edit_our_poss', stats.our_possession_percentage);
  setValue('edit_opp_poss', stats.opp_possession_percentage);
  setValue('edit_our_shot', stats.our_shot);
  setValue('edit_opp_shot', stats.opp_shot);
  setValue('edit_our_sot', stats.our_shot_on_target);
  setValue('edit_opp_sot', stats.opp_shot_on_target);
  setValue('edit_our_goal', stats.our_goal);
  setValue('edit_opp_goal', stats.opp_goal);

  const section = document.getElementById('editSection');
  if (section) {
    section.style.display = 'block';
  }
}

function cancelEdit() {
  document.getElementById('editSection').style.display = 'none';
}

function confirmEdit() {
  const ourPoss = parseNumberInput('edit_our_poss');
  const oppPoss = parseNumberInput('edit_opp_poss');
  const ourShot = parseNumberInput('edit_our_shot');
  const oppShot = parseNumberInput('edit_opp_shot');
  const ourSot = parseNumberInput('edit_our_sot');
  const oppSot = parseNumberInput('edit_opp_sot');
  const ourGoal = parseNumberInput('edit_our_goal');
  const oppGoal = parseNumberInput('edit_opp_goal');

  if (Number.isNaN(ourPoss) || Number.isNaN(oppPoss)) {
    alert('Enter valid possession values before confirming.');
    return;
  }

  if (ourPoss + oppPoss !== 100) {
    alert('Possession % total must be 100!');
    return;
  }

  if ([ourShot, oppShot, ourSot, oppSot, ourGoal, oppGoal].some(Number.isNaN)) {
    alert('Enter valid numeric values for shots, SoT and goals.');
    return;
  }

  if (ourShot < 0 || ourShot > 30 || oppShot < 0 || oppShot > 30) {
    alert('Shots must be between 0 and 30 for both teams.');
    return;
  }

  if (ourSot < 0 || ourSot > 25 || oppSot < 0 || oppSot > 25) {
    alert('Shots on target must be between 0 and 25 for both teams.');
    return;
  }

  if (ourGoal < 0 || ourGoal > 20 || oppGoal < 0 || oppGoal > 20) {
    alert('Goals must be between 0 and 20 for both teams.');
    return;
  }

  const confirmed = confirm('Do you really want to change these statistics?');
  if(!confirmed) return;

  // Override tracker state with edited values
  window._editedStats = {
    our_possession_percentage: ourPoss,
    opp_possession_percentage: oppPoss,
    our_shot: ourShot,
    opp_shot: oppShot,
    our_shot_on_target: ourSot,
    opp_shot_on_target: oppSot,
    our_goal: ourGoal,
    opp_goal: oppGoal,
  };

  // Update display
  document.getElementById('finalOurPoss').textContent = ourPoss + '%';
  document.getElementById('finalOppPoss').textContent = oppPoss + '%';
  document.getElementById('finalOurShots').textContent = window._editedStats.our_shot;
  document.getElementById('finalOppShots').textContent = window._editedStats.opp_shot;
  document.getElementById('finalOurSot').textContent = window._editedStats.our_shot_on_target;
  document.getElementById('finalOppSot').textContent = window._editedStats.opp_shot_on_target;
  document.getElementById('finalOurGoals').textContent = window._editedStats.our_goal;
  document.getElementById('finalOppGoals').textContent = window._editedStats.opp_goal;

  document.getElementById('editSection').style.display = 'none';
  showToast('Stats updated successfully!');
}