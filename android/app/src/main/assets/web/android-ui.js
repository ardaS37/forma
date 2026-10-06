/* Android notebook controls. Existing saved strokes and notes retain their format. */
(() => {
  document.addEventListener('contextmenu', event => event.preventDefault());
  document.addEventListener('selectstart', event => {
    if (!event.target.closest('input,textarea,math-field')) event.preventDefault();
  });

  const styles = ['normal', 'dashed', 'arrow', 'double-arrow'];
  if (!styles.includes(brushState.rulerStyle)) brushState.rulerStyle = 'normal';
  const panel = document.createElement('section');
  panel.id = 'ruler-palette';
  panel.className = 'pen-palette ruler-palette';
  panel.hidden = true;
  panel.setAttribute('aria-label', 'Cetvel seçenekleri');
  panel.innerHTML = `<div class="pen-palette-heading"><span>Cetvel seçenekleri</span><button class="tool" id="ruler-close" aria-label="Kapat">${icon('close')}</button></div>
    <div class="ruler-options">${[['normal','Normal','M4 12h32'],['dashed','Kesikli','M4 12h7m5 0h7m5 0h8'],['arrow','Ok uçlu','M4 12h32m-8-7 8 7-8 7'],['double-arrow','Çift ok uçlu','M4 12h32M12 5l-8 7 8 7m16-14 8 7-8 7']].map(([id,label,path]) => `<button data-ruler-style="${id}"><svg viewBox="0 0 40 24"><path d="${path}"/></svg><span>${label}</span></button>`).join('')}</div>
    <button id="ruler-disable" class="ruler-disable">Cetveli kapat · Serbest çiz</button>`;
  $('pen-palette').after(panel);
  $('ruler-tool').setAttribute('aria-controls', panel.id);
  $('ruler-tool').setAttribute('aria-expanded', 'false');
  window.closeRulerPalette = () => {
    panel.hidden = true;
    $('ruler-tool').setAttribute('aria-expanded', 'false');
  };
  function refreshRuler() {
    panel.querySelectorAll('[data-ruler-style]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.rulerStyle === brushState.rulerStyle)));
    $('ruler-tool').setAttribute('aria-pressed', String(rulerEnabled));
  }
  $('ruler-tool').onclick = () => {
    if (!panel.hidden) { closeRulerPalette(); return; }
    closePenPalette(false); closeEraserPalette(false);
    rulerEnabled = true; selectTool('pen'); refreshRuler();
    panel.hidden = false;
    $('ruler-tool').setAttribute('aria-expanded', 'true');
  };
  $('ruler-close').onclick = closeRulerPalette;
  $('ruler-disable').onclick = () => { rulerEnabled = false; refreshRuler(); closeRulerPalette(); };
  panel.addEventListener('click', event => {
    const button = event.target.closest('[data-ruler-style]');
    if (!button) return;
    brushState.rulerStyle = button.dataset.rulerStyle;
    saveBrushState(); refreshRuler();
  });
  document.addEventListener('pointerdown', event => {
    if (!event.target.closest('#ruler-palette,#ruler-tool')) closeRulerPalette();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !panel.hidden) { closeRulerPalette(); event.stopImmediatePropagation(); }
  }, true);

  $('ink-colors').addEventListener('click', event => {
    const button = event.target.closest('[data-remove-color]');
    if (!button) return;
    event.stopPropagation();
    brushState.customColors = brushState.customColors.filter(value => value !== button.dataset.removeColor);
    saveBrushState(); renderBrushControls();
  });

  function moveNote(key, folderId) {
    const entry = database[key];
    if (!entry || !isSavedStudy(entry) || (folderId && !noteFolders.some(folder => folder.id === folderId))) return false;
    if (folderOf(entry) === folderId) return false;
    const previous = entry.folderId;
    if (folderId) entry.folderId = folderId; else delete entry.folderId;
    if (!persist()) {
      if (previous === undefined) delete entry.folderId; else entry.folderId = previous;
      return false;
    }
    renderNotes(); toast('Kayıt taşındı.'); return true;
  }
  window.moveNoteToFolder = moveNote;
  const hint = document.createElement('p');
  hint.className = 'folder-drag-hint';
  hint.textContent = 'Kayıtları taşıma simgesinden tutup bir klasöre bırak.';
  $('folder-filters').before(hint);
  const live = document.createElement('div');
  live.className = 'drag-announcement'; live.setAttribute('role', 'status');
  $('notes-page').append(live);
  let drag = null, ghost = null, target = null, frame = null, suppressClick = false;
  function clearTarget() { target?.classList.remove('drop-target'); target = null; }
  function tick() {
    if (!drag) return;
    const speed = drag.y > innerHeight - 60 ? 12 : drag.y < 90 ? -12 : 0;
    if (speed) window.scrollBy(0, speed);
    const strip = $('folder-filters'), bounds = strip.getBoundingClientRect();
    if (drag.y >= bounds.top && drag.y <= bounds.bottom) {
      if (drag.x > bounds.right - 30) strip.scrollLeft += 8;
      else if (drag.x < bounds.left + 30) strip.scrollLeft -= 8;
    }
    clearTarget();
    const hit = document.elementFromPoint(drag.x, drag.y)?.closest('[data-folder-filter]');
    if (hit && hit.dataset.folderFilter !== 'all') { target = hit; hit.classList.add('drop-target'); }
    frame = requestAnimationFrame(tick);
  }
  $('notes-list').addEventListener('pointerdown', event => {
    const handle = event.target.closest('.note-drag-handle');
    if (!handle || drag || event.button !== 0) return;
    event.preventDefault();
    handle.setPointerCapture(event.pointerId);
    const card = handle.closest('.note-card');
    drag = {id: event.pointerId, key: handle.dataset.noteKey, x: event.clientX, y: event.clientY, startX: event.clientX, startY: event.clientY, card, moved: false};
  });
  document.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.id) return;
    drag.x = event.clientX; drag.y = event.clientY;
    if (!drag.moved && Math.hypot(drag.x - drag.startX, drag.y - drag.startY) < 7) return;
    event.preventDefault();
    if (!drag.moved) {
      drag.moved = true; drag.card.classList.add('note-dragging');
      ghost = document.createElement('div'); ghost.className = 'note-drag-ghost';
      ghost.textContent = drag.card.querySelector('.saved-note strong')?.textContent || 'Kayıt';
      document.body.append(ghost); tick();
      live.textContent = 'Kaydı bir klasöre bırak.';
    }
    ghost.style.left = `${drag.x + 12}px`; ghost.style.top = `${drag.y + 12}px`;
  }, {passive: false});
  function finish(event, cancelled = false) {
    if (!drag || (event.pointerId !== undefined && event.pointerId !== drag.id)) return;
    const current = drag;
    if (Number.isFinite(event.clientX)) { current.x = event.clientX; current.y = event.clientY; }
    const hit = document.elementFromPoint(current.x, current.y)?.closest('[data-folder-filter]');
    const folder = hit?.dataset.folderFilter;
    drag = null; cancelAnimationFrame(frame); ghost?.remove(); ghost = null;
    current.card.classList.remove('note-dragging'); clearTarget();
    suppressClick = current.moved;
    setTimeout(() => { suppressClick = false; }, 350);
    if (!cancelled && current.moved && folder && folder !== 'all') {
      const moved = moveNote(current.key, folder === 'unfiled' ? '' : folder);
      live.textContent = moved ? 'Kayıt taşındı.' : 'Kayıt aynı klasörde kaldı.';
    } else live.textContent = current.moved ? 'Taşıma iptal edildi.' : '';
  }
  document.addEventListener('pointerup', event => finish(event));
  document.addEventListener('pointercancel', event => finish(event, true));
  document.addEventListener('lostpointercapture', event => finish(event, true));
  window.addEventListener('blur', () => finish({}, true));
  document.addEventListener('click', event => {
    if (suppressClick) { event.preventDefault(); event.stopImmediatePropagation(); }
  }, true);
})();

(() => {if(!window.FormaAndroid?.setLauncherAccent)return;const note=document.createElement('p');note.className='launcher-accent-note';note.textContent='Telefon simgesi de seçili renk tonunu izler. Özel renkte en yakın hazır ton kullanılır. Değişiklik ana ekrana döndüğünde görünür.';document.querySelector('.accent-options').after(note);})();
