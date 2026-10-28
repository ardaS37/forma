/* Derivative-only shell; Forma's notebook and native pen path stay unchanged. */
(() => {
  'use strict';
  Object.assign(translations,{'Türev':'Derivatives','Konular':'Topics','Hangi türev konularını biliyorum?':'Which derivative topics do I know?','Seçtiğin konulardan karışık sorular gelir. Seçmediğin konular karma sorulara da girmez.':'Mixed questions use only selected topics, including inside composed expressions.','Tümünü seç':'Select all','Seçimi temizle':'Clear selection','Uygula':'Apply','İptal':'Cancel','En az bir uygun konu seç. Kural ve uygulama soruları için Polinom ve kuvvet konusunu da açabilirsin.':'Select at least one compatible topic. Enable Polynomials and powers for rule and application questions.','konu seçili':'topics selected','soru şablonu':'question templates','Konu seçimini değiştir':'Change topic selection','Konu seçimi kaydedilemedi.':'Could not save topic selection.','Kaydedilmiş sorular kendi konu seçimleriyle açılır.':'Saved questions reopen with their original topic selection.'});
  for(const topic of DerivativeBank.topics)translations[topic.label]=topic.en;
  const toolbar=document.createElement('button');
  toolbar.id='derivative-topics-tool';toolbar.className='tool derivative-topics-tool';
  toolbar.setAttribute('aria-haspopup','dialog');toolbar.setAttribute('aria-controls','derivative-topics-dialog');
  toolbar.innerHTML=icon('settings')+'<span></span>';
  $('widgets-open').before(toolbar);
  const dialog=document.createElement('dialog');dialog.id='derivative-topics-dialog';dialog.className='derivative-topics-dialog';
  dialog.setAttribute('aria-labelledby','derivative-topics-title');
  dialog.innerHTML=`<form id="derivative-topics-form"><div class="modal-heading"><h2 id="derivative-topics-title"></h2><button type="button" class="tool" id="derivative-topics-close" aria-label="Kapat">${icon('close')}</button></div><p class="derivative-topics-description"></p><div class="derivative-topic-actions"><button type="button" id="derivative-select-all"></button><button type="button" id="derivative-select-none"></button></div><div id="derivative-topic-list" class="derivative-topic-list"></div><p id="derivative-topic-status" role="status" aria-live="polite"></p><p id="derivative-topic-error" role="alert" hidden></p><div class="derivative-topic-footer"><button type="button" id="derivative-topics-cancel"></button><button type="submit" id="derivative-topics-apply" class="primary"></button></div></form>`;
  document.body.append(dialog);
  let draft=[];
  function refreshStatus() {
    const count=DerivativeBank.available(draft).length;
    $('derivative-topic-status').textContent=`${draft.length} ${t('konu seçili')} · ${count} ${t('soru şablonu')}`;
    $('derivative-topics-apply').disabled=!count;
    $('derivative-topic-error').hidden=!!count;
    $('derivative-topic-error').textContent=t('En az bir uygun konu seç. Kural ve uygulama soruları için Polinom ve kuvvet konusunu da açabilirsin.');
  }
  function renderList() {
    const list=$('derivative-topic-list');list.replaceChildren();
    for(const topic of DerivativeBank.topics) {
      const label=document.createElement('label');label.className='derivative-topic-option';
      const input=document.createElement('input');input.type='checkbox';input.value=topic.id;input.checked=draft.includes(topic.id);
      input.name='topics';input.id='derivative-topic-'+topic.id;
      const text=document.createElement('span');text.textContent=t(topic.label);
      label.append(input,text);list.append(label);
    }
    refreshStatus();
  }
  function refresh() {
    toolbar.title=t('Konu seçimini değiştir');toolbar.setAttribute('aria-label',t('Konular'));
    toolbar.querySelector('span').textContent=t('Konular');
    $('derivative-topics-title').textContent=t('Hangi türev konularını biliyorum?');
    dialog.querySelector('.derivative-topics-description').textContent=t('Seçtiğin konulardan karışık sorular gelir. Seçmediğin konular karma sorulara da girmez.');
    for(const [id,label] of [['derivative-select-all','Tümünü seç'],['derivative-select-none','Seçimi temizle'],['derivative-topics-cancel','İptal'],['derivative-topics-apply','Uygula']])$(id).textContent=t(label);
    if(dialog.open)renderList();
    $('derivative-current-topic').textContent=questionTopicLabel();
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
    draft=DerivativeBank.normalize(input.checked?[...draft,input.value]:draft.filter(id=>id!==input.value));refreshStatus();
  });
  $('derivative-select-all').onclick=()=>{draft=DerivativeBank.defaults.slice();renderList();};
  $('derivative-select-none').onclick=()=>{draft=[];renderList();};
  $('derivative-topics-form').onsubmit=event=>{
    event.preventDefault();if(!DerivativeBank.available(draft).length)return;
    if(draft.join(',')===universitySelection.topics.join(',')){dialog.close();return;}
    settleDrawing();clearTimeout(saveTimeout);if(!save())return;
    const selection={program:'derivatives',topics:DerivativeBank.normalize(draft)};
    try{localStorage.setItem('forma-university-selection',JSON.stringify(selection));}catch{toast('Konu seçimi kaydedilemedi.');return;}
    window.ModuleWorkspace?.suspend();closeAllFloatingWindows();universitySelection=selection;storeUniversitySelection();
    selectGeneratedQuestion(streamFor(streamScope()).cursor);loadQuestion();dialog.close();refresh();
  };
  dialog.addEventListener('close',()=>toolbar.focus());
  const heading=document.createElement('div');heading.className='derivative-heading';
  heading.innerHTML='<span>Türev Al<span class="brand-period">.</span></span><small id="derivative-current-topic"></small>';
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
  $('back').onclick=$('workspace-back').onclick=()=>enter();
  const oldNotes=$('notes-nav').onclick;
  $('notes-nav').onclick=()=>{oldNotes();$('home-nav').hidden=false;};
  window.TurevUI={refresh};
  // Resume this selection's last question and its ink immediately, without a home menu.
  enter();refresh();
})();
