// AIoT Depression Early Risk & Subtype Monitoring Dashboard Controller

document.addEventListener('DOMContentLoaded', () => {
  // Navigation Tab Switching
  const navItems = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('.tab-section');
  const pageTitle = document.getElementById('pageTitle');

  const titles = {
    overview: 'Live Overview & Depression Subtype Diagnosis',
    subtypes: 'Depression Subtype Phenotypes & Biomarker Profiling',
    sensors: 'Multi-Sensor Raw Telemetry (ESP32 Stream)',
    risk: 'Explainable AI (XAI) & Discriminant Feature Analysis',
    bench: 'Interactive Subtype Diagnosis Simulator',
    alerts: 'Clinical & Operational Alerts'
  };

  // Mobile Drawer Toggle Setup
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const sidebar = document.querySelector('.sidebar');
  let backdrop = document.querySelector('.sidebar-backdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.className = 'sidebar-backdrop';
    document.body.appendChild(backdrop);
  }

  const toggleMobileMenu = () => {
    sidebar.classList.toggle('mobile-open');
    backdrop.classList.toggle('active');
  };

  const closeMobileMenu = () => {
    sidebar.classList.remove('mobile-open');
    backdrop.classList.remove('active');
  };

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', toggleMobileMenu);
  }
  backdrop.addEventListener('click', closeMobileMenu);

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const tab = item.getAttribute('data-tab');

      navItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');

      sections.forEach(s => s.classList.remove('active'));
      const activeSec = document.getElementById(`section-${tab}`);
      if (activeSec) activeSec.classList.add('active');

      if (pageTitle && titles[tab]) {
        pageTitle.innerText = titles[tab];
      }

      // Close mobile drawer after selecting a tab
      closeMobileMenu();
    });
  });

  // Init Charts
  initLiveVitalsChart();
  initSensorDetailCharts();
  initSHAPChart();
  initRiskHistoryChart();
  initRadarChart();

  // Setup Bench Sliders & Scenarios
  setupBenchControls();

  // Simulation Pulse Button
  const btnSim = document.getElementById('btnSimulate');
  if (btnSim) {
    btnSim.addEventListener('click', () => {
      triggerPulseAnimation();
    });
  }

  // Periodic Live Data Generator to make dashboard feel alive
  setInterval(simulateLiveFluctuations, 2500);
});

// Chart Instances
let liveChartInstance = null;
let radarChartInstance = null;

function initLiveVitalsChart() {
  const ctx = document.getElementById('liveVitalsChart');
  if (!ctx) return;

  const labels = ['10s ago', '8s ago', '6s ago', '4s ago', '2s ago', 'Now'];
  const hrData = [72, 73, 71, 74, 73, 72];
  const spo2Data = [98, 98.2, 98, 98.5, 98.3, 98.4];

  liveChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Heart Rate (BPM)',
          data: hrData,
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          fill: true,
          tension: 0.35,
          yAxisID: 'y'
        },
        {
          label: 'SpO2 (%)',
          data: spo2Data,
          borderColor: '#38bdf8',
          backgroundColor: 'transparent',
          borderDash: [4, 4],
          tension: 0.2,
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: { color: '#64748b' }
        },
        y: {
          type: 'linear',
          position: 'left',
          min: 50,
          max: 120,
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: { color: '#ef4444' }
        },
        y1: {
          type: 'linear',
          position: 'right',
          min: 88,
          max: 100,
          grid: { display: false },
          ticks: { color: '#38bdf8' }
        }
      }
    }
  });
}

function initRadarChart() {
  const ctx = document.getElementById('radarChart');
  if (!ctx) return;

  radarChartInstance = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: [
        'Motor Deceleration',
        'Autonomic Rigidity (Low HRV)',
        'Tachycardia / Hyperarousal',
        'Hypersomnia / Extended Inactivity',
        'Circadian Phase Delay',
        'Respiratory Irregularity'
      ],
      datasets: [
        {
          label: 'Current Patient Signature',
          data: [85, 80, 25, 40, 65, 30],
          backgroundColor: 'rgba(239, 68, 68, 0.25)',
          borderColor: '#ef4444',
          pointBackgroundColor: '#ef4444',
          pointBorderColor: '#fff',
          borderWidth: 2
        },
        {
          label: 'Healthy Reference Baseline',
          data: [15, 10, 20, 15, 15, 15],
          backgroundColor: 'rgba(16, 185, 129, 0.15)',
          borderColor: '#10b981',
          pointBackgroundColor: '#10b981',
          borderWidth: 1.5,
          borderDash: [3, 3]
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: '#f8fafc', font: { size: 12 } }
        }
      },
      scales: {
        r: {
          angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
          grid: { color: 'rgba(255, 255, 255, 0.08)' },
          pointLabels: { color: '#94a3b8', font: { size: 11 } },
          ticks: { backdropColor: 'transparent', color: '#64748b' },
          min: 0,
          max: 100
        }
      }
    }
  });
}

function initSensorDetailCharts() {
  const cMAX = document.getElementById('chartMAX');
  if (cMAX) {
    new Chart(cMAX, {
      type: 'line',
      data: {
        labels: ['1', '2', '3', '4', '5', '6', '7', '8'],
        datasets: [{
          data: [71, 72, 75, 73, 74, 72, 73, 74],
          borderColor: '#ef4444',
          borderWidth: 2,
          tension: 0.4,
          pointRadius: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { x: { display: false }, y: { display: false } }
      }
    });
  }

  const cMPU = document.getElementById('chartMPU');
  if (cMPU) {
    new Chart(cMPU, {
      type: 'bar',
      data: {
        labels: ['X', 'Y', 'Z', 'Mag'],
        datasets: [{
          data: [0.15, 0.42, 9.81, 9.85],
          backgroundColor: ['#a855f7', '#c084fc', '#e9d5ff', '#7c3aed'],
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: '#94a3b8' }, grid: { display: false } },
          y: { ticks: { color: '#64748b' }, grid: { color: 'rgba(255, 255, 255, 0.05)' } }
        }
      }
    });
  }

  const cGas = document.getElementById('chartGas');
  if (cGas) {
    new Chart(cGas, {
      type: 'line',
      data: {
        labels: ['10m', '8m', '6m', '4m', '2m', 'Now'],
        datasets: [
          {
            label: 'MQ5',
            data: [260, 270, 265, 275, 280, 278],
            borderColor: '#10b981',
            tension: 0.3
          },
          {
            label: 'MQ135',
            data: [310, 315, 320, 318, 325, 320],
            borderColor: '#38bdf8',
            tension: 0.3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: '#64748b' }, grid: { display: false } },
          y: { ticks: { color: '#64748b' }, grid: { color: 'rgba(255, 255, 255, 0.05)' } }
        }
      }
    });
  }
}

function initSHAPChart() {
  const ctx = document.getElementById('shapChart');
  if (!ctx) return;

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: [
        'Motor Deceleration (MPU6050) -> MDD',
        'Tremors & Sympathetic Drive -> Anxious',
        'Hypersomnia Episode -> Atypical',
        'Blunted Vagal HRV Recovery -> Melancholia',
        'Circadian Phase Shifting -> SAD'
      ],
      datasets: [{
        label: 'SHAP Contribution to Subtype Attribution',
        data: [+0.38, +0.24, +0.18, +0.15, +0.12],
        backgroundColor: ['#ef4444', '#f59e0b', '#8b5cf6', '#dc2626', '#38bdf8'],
        borderRadius: 6
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => `+${ctx.raw} Discriminant Power`
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: { color: '#94a3b8' }
        },
        y: {
          ticks: { color: '#f8fafc', font: { size: 12 } },
          grid: { display: false }
        }
      }
    }
  });
}

function initRiskHistoryChart() {
  const ctx = document.getElementById('riskHistoryChart');
  if (!ctx) return;

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'],
      datasets: [
        {
          label: 'MDD Severity Score',
          data: [20, 25, 45, 58, 62, 60, 62],
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          fill: true,
          tension: 0.3
        },
        {
          label: 'Anxious Distress Index',
          data: [35, 42, 38, 30, 25, 20, 24],
          borderColor: '#f59e0b',
          tension: 0.3
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: '#94a3b8' } }
      },
      scales: {
        x: {
          ticks: { color: '#94a3b8' },
          grid: { color: 'rgba(255, 255, 255, 0.05)' }
        },
        y: {
          min: 0,
          max: 100,
          ticks: { color: '#94a3b8' },
          grid: { color: 'rgba(255, 255, 255, 0.05)' }
        }
      }
    }
  });
}

// -------------------------------------------------------------
// SUBTYPE CLASSIFIER & BENCH LOGIC
// -------------------------------------------------------------
const SUBTYPE_DEFINITIONS = {
  healthy: {
    name: 'Euthymic (Healthy / No Significant Depression)',
    title: 'Primary Diagnosis: No Clinical Depression Detected (Euthymia)',
    severity: 'BASELINE HEALTHY',
    confidence: '95% Confidence',
    badgeClass: 'pill-low',
    score: 18,
    desc: 'Physiological patterns, circadian autonomic variation, and movement kinetics are balanced within healthy population norms.',
    markers: [
      '<i class="fa-solid fa-check"></i> Normal Psychomotor Activity',
      '<i class="fa-solid fa-heart"></i> Resilient Heart Rate Variability',
      '<i class="fa-solid fa-sun"></i> Synchronized Circadian Cycle'
    ],
    probs: { mdd: 8, anxious: 10, atypical: 4, sad: 2 },
    recommendation: 'All biomarkers are in optimal zones. Maintain active physical exercise, standard hydration, and consistent circadian light cycles.'
  },
  mdd: {
    name: 'Major Depressive Disorder (Psychomotor Retardation)',
    title: 'Primary Diagnosis: MDD with Melancholic / Vegetative Deceleration',
    severity: 'HIGH RISK • CLINICALLY SIGNIFICANT',
    confidence: '92% Confidence',
    badgeClass: 'pill-high',
    score: 78,
    desc: 'Marked by vegetative motor slowing, blunted autonomic variability (suppressed RMSSD/HRV), and prolonged sedentary immobility.',
    markers: [
      '<i class="fa-solid fa-chart-line-down"></i> Severe Motor Retardation (-74%)',
      '<i class="fa-solid fa-heart-crack"></i> Autonomic Rigidity (Low HRV)',
      '<i class="fa-solid fa-bed"></i> Inactivity Bouts >8h Daytime'
    ],
    probs: { mdd: 76, anxious: 14, atypical: 6, sad: 4 },
    recommendation: 'Targeted Protocol: Structured behavioral activation therapy, mandatory morning outdoor light prompts, and clinician psychiatric evaluation.'
  },
  anxious: {
    name: 'Anxious Depression (Agitated Phenotype)',
    title: 'Primary Diagnosis: Depression with Prominent Anxious Distress',
    severity: 'HIGH RISK • ACUTE DISTRESS',
    confidence: '88% Confidence',
    badgeClass: 'pill-high',
    score: 69,
    desc: 'Characterized by autonomic sympathetic overdrive (resting tachycardia), motor micro-tremors, physical agitation, and erratic SpO2/breathing dynamics.',
    markers: [
      '<i class="fa-solid fa-bolt"></i> Resting Tachycardia (>95 BPM)',
      '<i class="fa-solid fa-wave-square"></i> Agitated Micro-Tremors (MPU6050)',
      '<i class="fa-solid fa-lungs"></i> Rapid Shallow Respiration Patterns'
    ],
    probs: { mdd: 18, anxious: 72, atypical: 6, sad: 4 },
    recommendation: 'Targeted Protocol: Somatic regulation exercises (slow 4-7-8 resonance breathing), anxiolytic mindfulness intervention, and stress de-escalation.'
  },
  atypical: {
    name: 'Atypical Depression (Hypersomnic / Leaden Paralysis)',
    title: 'Primary Diagnosis: Depressive Episode with Atypical Features',
    severity: 'MODERATE RISK • CHRONIC PATTERN',
    confidence: '84% Confidence',
    badgeClass: 'pill-mod',
    score: 58,
    desc: 'Dominated by hypersomnia, physical leaden sensation, prolonged periods in bed, but with occasional reactive movement bursts.',
    markers: [
      '<i class="fa-solid fa-moon"></i> Hypersomnia / Prolonged Bed Rest (>11h)',
      '<i class="fa-solid fa-weight-hanging"></i> Leaden Physical Inertia',
      '<i class="fa-solid fa-battery-quarter"></i> Blunted Morning Autonomic Rise'
    ],
    probs: { mdd: 20, anxious: 12, atypical: 62, sad: 6 },
    recommendation: 'Targeted Protocol: Strict sleep-hygiene scheduling, light therapy at awakening, and low-impact gradual morning physical tasks.'
  },
  sad: {
    name: 'Seasonal Affective Disorder (Circadian Phase Delayed)',
    title: 'Primary Diagnosis: Major Depression with Seasonal Pattern (SAD)',
    severity: 'MODERATE RISK • ENVIRONMENTAL CO-FACTOR',
    confidence: '82% Confidence',
    badgeClass: 'pill-mod',
    score: 52,
    desc: 'Photoperiod circadian desynchronization characterized by waking delays, sluggish morning metabolism, and extended indoor confinement.',
    markers: [
      '<i class="fa-solid fa-cloud-sun"></i> 2.8h Delayed Morning Activity Onset',
      '<i class="fa-solid fa-house"></i> Heavy Indoor Confinement (MQ135 Data)',
      '<i class="fa-solid fa-clock"></i> Phase-Delayed Heart Rate Dip'
    ],
    probs: { mdd: 15, anxious: 10, atypical: 15, sad: 60 },
    recommendation: 'Targeted Protocol: 10,000 Lux bright light phototherapy (30 min upon waking) and scheduled outdoor walk routines.'
  }
};

function classifySubtype(hr, spo2, act, tremor) {
  if (act >= 6 && hr <= 85 && hr >= 60 && tremor <= 2) {
    return 'healthy';
  }
  if (hr >= 92 && tremor >= 4) {
    return 'anxious';
  }
  if (act <= 2 && tremor <= 2 && hr <= 76) {
    return 'mdd';
  }
  if (act <= 3 && hr >= 70 && hr <= 88) {
    return 'atypical';
  }
  return 'sad';
}

function applySubtypeToUI(typeKey) {
  const data = SUBTYPE_DEFINITIONS[typeKey] || SUBTYPE_DEFINITIONS.mdd;

  // Banner
  const badgeName = document.getElementById('subtypeBadgeName');
  const confPill = document.getElementById('subtypeConfidence');
  const sevBadge = document.getElementById('subtypeSeverity');
  const title = document.getElementById('subtypeTitle');
  const desc = document.getElementById('subtypeDescription');
  const markers = document.getElementById('subtypeMarkers');

  if (badgeName) badgeName.innerText = data.name;
  if (confPill) confPill.innerText = data.confidence;
  if (sevBadge) sevBadge.innerText = data.severity;
  if (title) title.innerText = data.title;
  if (desc) desc.innerText = data.desc;
  if (markers) {
    markers.innerHTML = data.markers.map(m => `<span class="marker-chip">${m}</span>`).join('');
  }

  // Mini KPI Header
  const miniSub = document.getElementById('valSubtypeMini');
  const miniConf = document.getElementById('valConfidenceMini');
  if (miniSub) miniSub.innerText = data.name.split(' ')[0] + ' ' + (data.name.split(' ')[1] || '');
  if (miniConf) miniConf.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${data.confidence}`;

  // Gauge & Overall Risk
  const riskNum = document.getElementById('riskScoreNumber');
  const gaugeProg = document.getElementById('gaugeProgress');
  const riskBadge = document.getElementById('riskLevelBadge');
  const recText = document.getElementById('recommendationText');

  if (riskNum) riskNum.innerText = `${data.score}%`;
  if (gaugeProg) {
    gaugeProg.setAttribute('stroke-dasharray', `${data.score}, 100`);
    gaugeProg.style.stroke = data.score < 35 ? '#10b981' : (data.score < 65 ? '#f59e0b' : '#ef4444');
  }
  if (riskBadge) {
    riskBadge.innerText = data.score < 35 ? 'LOW RISK' : (data.score < 65 ? 'MODERATE RISK' : 'HIGH RISK');
    riskBadge.className = `status-pill ${data.badgeClass}`;
  }
  if (recText) recText.innerText = data.recommendation;

  // Subtype Probability Bars
  const pMDD = document.getElementById('probMDD');
  const pAnx = document.getElementById('probAnxious');
  const pAtyp = document.getElementById('probAtypical');
  const pSAD = document.getElementById('probSAD');

  const fMDD = document.getElementById('fillMDD');
  const fAnx = document.getElementById('fillAnxious');
  const fAtyp = document.getElementById('fillAtypical');
  const fSAD = document.getElementById('fillSAD');

  if (pMDD && fMDD) { pMDD.innerText = `${data.probs.mdd}%`; fMDD.style.width = `${data.probs.mdd}%`; }
  if (pAnx && fAnx) { pAnx.innerText = `${data.probs.anxious}%`; fAnx.style.width = `${data.probs.anxious}%`; }
  if (pAtyp && fAtyp) { pAtyp.innerText = `${data.probs.atypical}%`; fAtyp.style.width = `${data.probs.atypical}%`; }
  if (pSAD && fSAD) { pSAD.innerText = `${data.probs.sad}%`; fSAD.style.width = `${data.probs.sad}%`; }

  // Catalog Match Indicators
  ['MDD', 'Anxious', 'Atypical', 'SAD'].forEach(key => {
    const el = document.getElementById(`match${key}`);
    if (el) {
      const isCurrent = key.toLowerCase() === typeKey.toLowerCase();
      el.innerText = isCurrent ? 'Current Match: PRIMARY (High)' : 'Current Match: Low';
      el.style.color = isCurrent ? '#ef4444' : '#64748b';
    }
  });

  // Simulator Box
  const simName = document.getElementById('simOutputName');
  const simTrigger = document.getElementById('simOutputTrigger');
  const simAction = document.getElementById('simOutputAction');
  const simBadge = document.getElementById('simOutputBadge');

  if (simName) simName.innerText = data.name;
  if (simTrigger) simTrigger.innerText = data.desc;
  if (simAction) simAction.innerText = data.recommendation;
  if (simBadge) {
    simBadge.innerText = data.name.toUpperCase();
    simBadge.className = `status-pill ${data.badgeClass}`;
  }

  // Update Radar Chart if available
  if (radarChartInstance) {
    let radarValues = [85, 80, 25, 40, 65, 30];
    if (typeKey === 'anxious') radarValues = [20, 45, 95, 20, 40, 85];
    else if (typeKey === 'atypical') radarValues = [65, 50, 20, 95, 60, 30];
    else if (typeKey === 'sad') radarValues = [50, 45, 25, 55, 95, 35];
    else if (typeKey === 'healthy') radarValues = [15, 10, 20, 15, 15, 15];

    radarChartInstance.data.datasets[0].data = radarValues;
    radarChartInstance.update();
  }
}

function setupBenchControls() {
  const sliderHR = document.getElementById('sliderHR');
  const sliderSpo2 = document.getElementById('sliderSpo2');
  const sliderActivity = document.getElementById('sliderActivity');
  const sliderTremor = document.getElementById('sliderTremor');

  const lblHR = document.getElementById('labelHR');
  const lblSpo2 = document.getElementById('labelSpo2');
  const lblAct = document.getElementById('labelActivity');
  const lblTremor = document.getElementById('labelTremor');

  const onSliderChange = () => {
    const hr = parseInt(sliderHR.value);
    const spo2 = parseInt(sliderSpo2.value);
    const act = parseInt(sliderActivity.value);
    const tremor = parseInt(sliderTremor.value);

    lblHR.innerText = `${hr} BPM`;
    lblSpo2.innerText = `${spo2} %`;
    lblAct.innerText = `${act} / 10`;
    lblTremor.innerText = `${tremor} / 10`;

    // Dynamic Classify
    const predictedType = classifySubtype(hr, spo2, act, tremor);
    applySubtypeToUI(predictedType);
  };

  [sliderHR, sliderSpo2, sliderActivity, sliderTremor].forEach(slider => {
    if (slider) slider.addEventListener('input', onSliderChange);
  });

  // Presets
  const presetBtns = document.querySelectorAll('.btn-preset');
  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      presetBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const preset = btn.getAttribute('data-preset');
      if (preset === 'healthy') {
        sliderHR.value = 72;
        sliderSpo2.value = 98;
        sliderActivity.value = 7;
        sliderTremor.value = 1;
      } else if (preset === 'mdd') {
        sliderHR.value = 65;
        sliderSpo2.value = 97;
        sliderActivity.value = 1;
        sliderTremor.value = 1;
      } else if (preset === 'anxious') {
        sliderHR.value = 104;
        sliderSpo2.value = 95;
        sliderActivity.value = 4;
        sliderTremor.value = 8;
      } else if (preset === 'atypical') {
        sliderHR.value = 72;
        sliderSpo2.value = 97;
        sliderActivity.value = 2;
        sliderTremor.value = 2;
      } else if (preset === 'sad') {
        sliderHR.value = 68;
        sliderSpo2.value = 96;
        sliderActivity.value = 3;
        sliderTremor.value = 2;
      }

      onSliderChange();
      applySubtypeToUI(preset);
    });
  });

  // Default to MDD presentation on load
  applySubtypeToUI('mdd');
}

function simulateLiveFluctuations() {
  if (!liveChartInstance) return;

  const vHR = document.getElementById('valHeartRate');
  const vSpO2 = document.getElementById('valSpo2');

  const randomHR = Math.floor(70 + (Math.random() * 6 - 3));
  const randomSpO2 = (98 + (Math.random() * 0.8 - 0.4)).toFixed(1);

  if (vHR) vHR.innerHTML = `${randomHR} <small>BPM</small>`;
  if (vSpO2) vSpO2.innerHTML = `${randomSpO2} <small>%</small>`;

  const dataHR = liveChartInstance.data.datasets[0].data;
  const dataSpO2 = liveChartInstance.data.datasets[1].data;

  dataHR.shift();
  dataHR.push(randomHR);

  dataSpO2.shift();
  dataSpO2.push(parseFloat(randomSpO2));

  liveChartInstance.update('none');
}

function triggerPulseAnimation() {
  const vHR = document.getElementById('valHeartRate');
  if (vHR) {
    vHR.style.transform = 'scale(1.15)';
    vHR.style.color = '#f87171';
    setTimeout(() => {
      vHR.style.transform = 'scale(1)';
      vHR.style.color = '';
    }, 400);
  }
}
