// Shared utilities
function showToast(msg, type='success') {
  const t = document.createElement('div');
  t.style.cssText = `position:fixed;top:1rem;right:1rem;z-index:9999;background:${type==='success'?'#10b981':'#ef4444'};color:white;padding:0.75rem 1.25rem;border-radius:0.75rem;font-size:0.9rem;font-weight:600;box-shadow:0 4px 20px rgba(0,0,0,0.3);animation:slideIn 0.3s ease`;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

// Autocomplete
function initAutocomplete(inputId, listId, options) {
  const input = document.getElementById(inputId);
  const list = document.getElementById(listId);
  if(!input || !list) return;

  let selectedIndex = -1; // Track highlighted item

  function updateList(matches) {
    list.innerHTML = matches.map((o, i) =>
      `<div 
        class="autocomplete-item" 
        id="${listId}_item_${i}"
        onclick="selectOption('${inputId}','${listId}','${o}')"
        onmouseover="highlightItem('${listId}', ${i})"
      >${o}</div>`
    ).join('');
    list.style.display = matches.length ? 'block' : 'none';
    selectedIndex = -1; // Reset selection
  }

  input.addEventListener('input', () => {
    const q = input.value.toLowerCase();
    const matches = q ? options.filter(o => o.toLowerCase().includes(q)) : options;
    updateList(matches);
  });

input.addEventListener('click', () => {
  input.value = '';
  updateList(options);
});

  // ← Keyboard navigation
  input.addEventListener('keydown', (e) => {
    const items = list.querySelectorAll('.autocomplete-item');
    if(!items.length) return;

    if(e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
      highlightItem(listId, selectedIndex);
      // Scroll into view
      items[selectedIndex].scrollIntoView({ block: 'nearest' });
    }
    else if(e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIndex = Math.max(selectedIndex - 1, 0);
      highlightItem(listId, selectedIndex);
      items[selectedIndex].scrollIntoView({ block: 'nearest' });
    }
    else if(e.key === 'Enter') {
      e.preventDefault();
      if(selectedIndex >= 0 && items[selectedIndex]) {
        input.value = items[selectedIndex].textContent;
        list.style.display = 'none';
        selectedIndex = -1;
      }
    }
    else if(e.key === 'Escape') {
      list.style.display = 'none';
      selectedIndex = -1;
    }
  });

  document.addEventListener('click', e => {
    if(!input.contains(e.target) && !list.contains(e.target)) {
      list.style.display = 'none';
      selectedIndex = -1;
    }
  });
}

function highlightItem(listId, index) {
  // Remove highlight from all
  document.querySelectorAll(`#${listId} .autocomplete-item`).forEach(el => {
    el.style.background = '';
    el.style.color = '';
  });
  // Add highlight to selected
  const selected = document.getElementById(`${listId}_item_${index}`);
  if(selected) {
    selected.style.background = 'rgba(0,212,255,0.15)';
    selected.style.color = '#00d4ff';
  }
}

function selectOption(inputId, listId, val) {
  document.getElementById(inputId).value = val;
  document.getElementById(listId).style.display = 'none';
}

// Slider sync
function syncSlider(sliderId, valId) {
  const s = document.getElementById(sliderId);
  const v = document.getElementById(valId);
  if(!s || !v) return;
  v.textContent = s.value;
  s.addEventListener('input', () => v.textContent = s.value);
}
