/* Limit, derivative, and integral shell; Forma's notebook and native pen path stay unchanged. */
(() => {
  'use strict';
  Object.assign(translations,{'Türev':'Derivatives','Konular':'Topics','Hangi türev konularını biliyorum?':'Which derivative topics do I know?','Seçtiğin konulardan karışık sorular gelir. Seçmediğin konular karma sorulara da girmez.':'Mixed questions use only selected topics, including inside composed expressions.','Tümünü seç':'Select all','Seçimi temizle':'Clear selection','Uygula':'Apply','İptal':'Cancel','En az bir uygun konu seç. Kural ve uygulama soruları için Polinom ve kuvvet konusunu da açabilirsin.':'Select at least one compatible topic. Enable Polynomials and powers for rule and application questions.','konu seçili':'topics selected','soru şablonu':'question templates','Konu seçimini değiştir':'Change topic selection','Konu seçimi kaydedilemedi.':'Could not save topic selection.','Kaydedilmiş sorular kendi konu seçimleriyle açılır.':'Saved questions reopen with their original topic selection.'});
  for(const bank of Object.values(PracticeBanks))for(const topic of bank.topics)translations[topic.label]=topic.en;
  Object.assign(translations,{'Konu grubu ayracı':'Topic group separator','Limit':'Limits','İntegral':'Integrals','Ana menü':'Main menu','Hangi limit konularını biliyorum?':'Which limit topics do I know?','Hangi integral konularını biliyorum?':'Which integral topics do I know?','En az bir uygun konu seç. Bazı kurallar ve uygulamalar için ilgili temel fonksiyon konularını da seçmelisin.':'Select compatible topics. Some rules and applications also require the relevant basic function topics.'});
  const toolbar=document.createElement('button');
  toolbar.id='derivative-topics-tool';toolbar.className='tool';
  toolbar.setAttribute('aria-haspopup','dialog');toolbar.setAttribute('aria-controls','derivative-topics-dialog');
  toolbar.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 5 1 1 2-2m-3 8 1 1 2-2m-3 8 1 1 2-2M10 5h11M10 12h11M10 19h11"/></svg>';
  $('widgets-open').before(toolbar);
  const dialog=document.createElement('dialog');dialog.id='derivative-topics-dialog';dialog.className='derivative-topics-dialog';
  dialog.setAttribute('aria-labelledby','derivative-topics-title');
  dialog.innerHTML=`<form id="derivative-topics-form"><div class="modal-heading"><h2 id="derivative-topics-title"></h2><button type="button" class="tool" id="derivative-topics-close" aria-label="Kapat">${icon('close')}</button></div><p class="derivative-topics-description"></p><div class="derivative-topic-actions"><button type="button" id="derivative-select-all"></button><button type="button" id="derivative-select-none"></button></div><div id="derivative-topic-list" class="derivative-topic-list"></div><p id="derivative-topic-status" role="status" aria-live="polite"></p><p id="derivative-topic-error" role="alert" hidden></p><div class="derivative-topic-footer"><button type="button" id="derivative-topics-cancel"></button><button type="submit" id="derivative-topics-apply" class="primary"></button></div></form>`;
  document.body.append(dialog);
  let draft=[];
  function refreshStatus() {
    const count=practiceBank().available(draft).length;
    $('derivative-topic-status').textContent=`${draft.length} ${t('konu seçili')} · ${count} ${t('soru şablonu')}`;
    $('derivative-topics-apply').disabled=!count;
    $('derivative-topic-error').hidden=!!count;
    $('derivative-topic-error').textContent=t('En az bir uygun konu seç. Bazı kurallar ve uygulamalar için ilgili temel fonksiyon konularını da seçmelisin.');
  }
  function renderList() {
    const list=$('derivative-topic-list');list.replaceChildren();
    for(const [index,group] of practiceBank().topicGroups.entries()) {
      if(index){const divider=document.createElement('hr');divider.className='topic-level-divider';divider.setAttribute('aria-label',t('Konu grubu ayracı'));list.append(divider);}
      for(const topic of group.topics) {
      const label=document.createElement('label');label.className='derivative-topic-option';
      label.dataset.level=group.level;
      const input=document.createElement('input');input.type='checkbox';input.value=topic.id;input.checked=draft.includes(topic.id);
      input.name='topics';input.id='derivative-topic-'+topic.id;
      const text=document.createElement('span');text.textContent=t(topic.label);
      label.append(input,text);list.append(label);
      }
    }
    refreshStatus();
  }
  function refresh() {
    toolbar.title=t('Konu seçimini değiştir');toolbar.setAttribute('aria-label',t('Konular'));
    $('practice-screen-name').textContent=({limits:'Limit Al',derivatives:'Türev Al',integrals:'İntegral Al'})[universitySelection.program];
    $('derivative-topics-title').textContent=t(({limits:'Hangi limit konularını biliyorum?',derivatives:'Hangi türev konularını biliyorum?',integrals:'Hangi integral konularını biliyorum?'})[universitySelection.program]);
    dialog.querySelector('.derivative-topics-description').textContent=t('Seçtiğin konulardan karışık sorular gelir. Seçmediğin konular karma sorulara da girmez.');
    for(const [id,label] of [['derivative-select-all','Tümünü seç'],['derivative-select-none','Seçimi temizle'],['derivative-topics-cancel','İptal'],['derivative-topics-apply','Uygula']])$(id).textContent=t(label);
    if(dialog.open)renderList();
    $('derivative-current-topic').textContent=selectedTopicLabel()+' · '+questionTopicLabel();
    if($('practice-menu'))for(const button of $('practice-menu').querySelectorAll('[data-practice-mode]'))button.textContent=t(PracticeLabels[button.dataset.practiceMode]);
  }
  toolbar.onclick=()=>{
    settleDrawing();closePenPalette(false);closeEraserPalette(false);window.closeRulerPalette?.();
    if(widgetExplorerOpen)toggleWidgetExplorer(false,false);
    draft=universitySelection.topics.slice();refresh();renderList();dialog.showModal();
  };
  for(const id of ['derivative-topics-close','derivative-topics-cancel'])$(id).onclick=()=>dialog.close();
  dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
  $('derivative-topic-list').addEventListener('change',event=>{
    const input=event.target;if(input.type!=='checkbox')return;
    draft=practiceBank().normalize(input.checked?[...draft,input.value]:draft.filter(id=>id!==input.value));refreshStatus();
  });
  $('derivative-select-all').onclick=()=>{draft=practiceBank().defaults.slice();renderList();};
  $('derivative-select-none').onclick=()=>{draft=[];renderList();};
  $('derivative-topics-form').onsubmit=event=>{
    event.preventDefault();if(!practiceBank().available(draft).length)return;
    if(draft.join(',')===universitySelection.topics.join(',')){dialog.close();return;}
    settleDrawing();clearTimeout(saveTimeout);if(!save())return;
    const selection={program:universitySelection.program,topics:practiceBank().normalize(draft)};
    try{localStorage.setItem('forma-university-selection',JSON.stringify(selection));}catch{toast('Konu seçimi kaydedilemedi.');return;}
    window.ModuleWorkspace?.suspend();closeAllFloatingWindows();universitySelection=selection;storeUniversitySelection();
    selectGeneratedQuestion(streamFor(streamScope()).cursor);loadQuestion();dialog.close();refresh();
  };
  dialog.addEventListener('close',()=>toolbar.focus());
  const heading=document.createElement('div');heading.className='derivative-heading';
  heading.innerHTML='<span><span id="practice-screen-name">Türev Al</span><span class="brand-period">.</span></span><small id="derivative-current-topic"></small>';
  document.querySelector('.question-top').before(heading);
  const originalRender=renderQuestionContent;
  renderQuestionContent=function(...args){originalRender(...args);refresh();};
  const originalLanguage=applyLanguage;
  applyLanguage=function(...args){originalLanguage(...args);refresh();};
  // Hide course-selection settings; references remain in the DOM for shared handlers.
  for(const selector of ['[data-education-choice]','[data-question-choice]']) {
    const control=document.querySelector(selector);control?.closest('.setting-section')?.setAttribute('hidden','');
  }
  const oldHomeNav=$('home-nav');oldHomeNav.onclick=()=>enter();
  $('back').onclick=$('workspace-back').onclick=home;
  $('workspace-back').innerHTML=icon('arrow');
  $('workspace-back').title=t('Ana menü');$('workspace-back').setAttribute('aria-label',t('Ana menü'));
  const oldNotes=$('notes-nav').onclick;
  $('notes-nav').onclick=()=>{oldNotes();$('home-nav').hidden=false;};
  const menu=document.createElement('main');menu.id='practice-menu';menu.className='practice-menu';menu.hidden=true;
  menu.innerHTML='<svg class="turev-logo" viewBox="0 0 108 108" role="img" aria-label="Kavis K. logosu"><rect width="108" height="108" rx="18"/><path class="logo-letter" d="M26 32H37V50L53 32H67L47 53L69 76H54L37 57V76H26Z"/><path class="logo-dot" d="M80 67A4 4 0 1 1 80 75A4 4 0 1 1 80 67"/></svg><h1>Kavis<span class="brand-period">.</span></h1><div class="practice-mode-buttons"><button data-practice-mode="limits">Limit</button><button data-practice-mode="derivatives">Türev</button><button data-practice-mode="integrals">İntegral</button></div>';
  document.body.append(menu);
  function showMenu(){
    $('workspace').hidden=true;$('notes-page').hidden=true;$('home').hidden=true;menu.hidden=false;setScreen('practice-menu');refresh();window.scrollTo(0,0);
  }
  function openMode(mode){
    if(!Object.hasOwn(PracticeBanks,mode))return;
    storeUniversitySelection();universitySelection=normalizeUniversitySelection(programSelections[mode]||{program:mode});storeUniversitySelection();
    settings.educationMode='university';settings.questionMode='open';subject='Matematik';
    selectGeneratedQuestion(streamFor(streamScope()).cursor);enter();refresh();
  }
  menu.addEventListener('click',event=>{const button=event.target.closest('[data-practice-mode]');if(button)openMode(button.dataset.practiceMode);});
  window.TurevUI={refresh,showMenu,openMode};
  // Keep startup deliberately small: exactly the three practice choices.
  showMenu();refresh();
})();
