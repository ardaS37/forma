/* Browsable university placeholders, isolated from existing mathematics banks. */
(() => {
  const programs = [];
  function add(subject, id, label, description, rows) {
    programs.push({subject, id, label, description, placeholder: true, topics: rows.map(([key, name, ...subs]) => ({
      id: `${id}-${key}`, label: name, placeholder: true,
      subtopics: subs.map((label, i) => ({id: `${id}-${key}-${i+1}`, label, placeholder: true}))
    }))});
  }
  add('Fizik','physics-1','Fizik 1','Mekanik ve termodinamiğe giriş',[
    ['units','Ölçme ve vektörler','Birimler ve boyut analizi','Ölçüm ve hata','Vektör işlemleri'],
    ['motion','Kinematik','Bir boyutta hareket','İki boyutta hareket','Atış hareketi','Bağıl hareket'],
    ['forces','Newton yasaları','Kuvvet ve serbest cisim diyagramı','Newton yasaları ve uygulamaları','Sürtünme','Dairesel hareket'],
    ['energy','İş ve enerji','İş ve güç','Kinetik ve potansiyel enerji','Enerjinin korunumu'],
    ['momentum','Momentum ve çarpışmalar','İtme ve momentum','Momentumun korunumu','Esnek ve esnek olmayan çarpışmalar','Kütle merkezi'],
    ['rotation','Dönme ve denge','Açısal hareket','Tork ve eylemsizlik momenti','Açısal momentum','Statik denge'],
    ['gravity','Kütle çekimi','Evrensel çekim yasası','Yörüngeler ve Kepler yasaları','Çekim potansiyel enerjisi'],
    ['fluids','Akışkanlar','Basınç ve kaldırma kuvveti','Süreklilik denklemi','Bernoulli ilkesi'],
    ['thermal','Isı ve termodinamik','Sıcaklık ve genleşme','Isı ve kalorimetri','İdeal gazlar','Termodinamiğin temel yasaları']
  ]);
  add('Fizik','physics-2','Fizik 2','Elektrik ve manyetizma',[
    ['charge','Elektrik yükü ve alan','Coulomb yasası','Elektrik alan','Elektrik akısı ve Gauss yasası'],
    ['potential','Elektrik potansiyeli','Potansiyel ve potansiyel enerji','Eşpotansiyel yüzeyler','Alan ve potansiyel ilişkisi'],
    ['capacitors','Kapasitörler ve dielektrikler','Kapasitans','Kapasitör bağlantıları','Dielektrikler ve depolanan enerji'],
    ['circuits','Akım ve doğru akım devreleri','Akım, direnç ve Ohm yasası','Kirchhoff yasaları','RC devreleri','Elektriksel güç'],
    ['magnetism','Manyetik alan','Lorentz kuvveti','Biot–Savart yasası','Ampère yasası','Manyetik alanda hareket'],
    ['induction','Elektromanyetik indüksiyon','Faraday yasası','Lenz yasası','Özindüksiyon ve indüktörler','RL devreleri'],
    ['ac','Alternatif akım','Sinüzoidal akım ve gerilim','Empedans ve RLC devreleri','Rezonans','Transformatörler'],
    ['maxwell','Elektromanyetik dalgalar','Maxwell denklemlerine giriş','Elektromanyetik spektrum','Dalgalarda enerji taşınımı']
  ]);
  add('Fizik','physics-3','Fizik 3','Dalgalar, optik ve modern fizik',[
    ['oscillation','Titreşimler','Basit harmonik hareket','Sönümlü titreşim','Zorlanmış titreşim ve rezonans'],
    ['waves','Mekanik dalgalar ve ses','Dalga denklemi ve yayılma','Süperpozisyon ve duran dalgalar','Ses ve Doppler etkisi'],
    ['optics','Geometrik optik','Yansıma ve kırılma','Aynalar','Mercekler','Optik araçlar'],
    ['wave-optics','Dalga optiği','Girişim','Kırınım','Polarizasyon'],
    ['relativity','Özel görelilik','Görelilik ilkeleri','Zaman genişlemesi ve uzunluk büzülmesi','Enerji ve momentum'],
    ['quantum','Kuantum fiziğine giriş','Siyah cisim ışıması','Fotoelektrik etki','Dalga-parçacık ikiliği','Belirsizlik ilkesi'],
    ['atomic','Atom ve nükleer fizik','Atom modelleri ve spektrumlar','Çekirdek yapısı','Radyoaktivite','Fisyon ve füzyon'],
    ['solid','Katıhal fiziğine giriş','Kristal yapılar','Enerji bantları','Yarı iletkenler']
  ]);
  add('Kimya','chemistry-1','Genel Kimya 1','Atomlar, bağlar ve kimyasal hesaplamalar',[
    ['matter','Madde ve ölçme','Maddenin sınıflandırılması','Birimler ve anlamlı rakamlar','Fiziksel ve kimyasal değişimler'],
    ['atom','Atom yapısı','Atomun temel parçacıkları','İzotoplar ve atom kütlesi','Kuantum sayıları','Elektron dizilimi'],
    ['periodic','Periyodik sistem','Periyodik tablo','Atom ve iyon yarıçapı','İyonlaşma enerjisi ve elektronegatiflik'],
    ['stoichiometry','Mol ve stokiyometri','Mol kavramı','Kimyasal formüller','Denklem denkleştirme','Sınırlayıcı bileşen ve verim'],
    ['bonding','Kimyasal bağlar','İyonik ve kovalent bağ','Lewis yapıları','Molekül geometrisi','Hibritleşme ve bağ kuramları'],
    ['gases','Gazlar','Gaz yasaları','İdeal gaz denklemi','Kinetik teori','Gerçek gazlar'],
    ['thermo','Termokimya','Isı ve entalpi','Kalorimetri','Hess yasası','Oluşum entalpileri'],
    ['phases','Maddenin halleri','Moleküller arası etkileşimler','Sıvılar ve katılar','Faz diyagramları']
  ]);
  add('Kimya','chemistry-2','Genel Kimya 2','Çözeltiler, denge ve tepkimeler',[
    ['solutions','Çözeltiler','Derişim birimleri','Çözünürlük','Koligatif özellikler'],
    ['kinetics','Kimyasal kinetik','Tepkime hızı','Hız yasaları','Aktivasyon enerjisi','Tepkime mekanizmaları'],
    ['equilibrium','Kimyasal denge','Denge sabiti','Denge hesaplamaları','Le Chatelier ilkesi'],
    ['acids','Asitler ve bazlar','Asit-baz kuramları','pH ve pOH','Zayıf asit ve baz dengeleri','Tamponlar ve titrasyonlar'],
    ['solubility','Çözünürlük dengeleri','Çözünürlük çarpımı','Ortak iyon etkisi','Çökelme dengeleri'],
    ['thermodynamics','Kimyasal termodinamik','Entropi','Gibbs serbest enerjisi','Kendiliğindenlik ve denge'],
    ['electrochemistry','Elektrokimya','Yükseltgenme ve indirgenme','Galvanik hücreler','Nernst denklemi','Elektroliz']
  ]);
  add('Kimya','organic-chemistry','Organik Kimya','Karbon bileşikleri ve tepkimeleri',[
    ['structure','Yapı ve adlandırma','Fonksiyonel gruplar','Organik bileşiklerin adlandırılması','İzomerlik ve stereokimya'],
    ['hydrocarbons','Hidrokarbonlar','Alkanlar ve sikloalkanlar','Alkenler ve alkinler','Aromatik bileşikler'],
    ['reactions','Organik tepkimeler','Yer değiştirme','Eliminasyon','Katılma','Tepkime mekanizmaları'],
    ['functional','Fonksiyonel gruplar','Alkoller, fenoller ve eterler','Aldehitler ve ketonlar','Karboksilik asitler ve türevleri','Aminler'],
    ['spectroscopy','Yapı tayini','IR spektroskopisi','NMR spektroskopisi','Kütle spektrometrisi'],
    ['biomolecules','Biyomoleküller ve polimerler','Karbonhidratlar','Amino asitler ve proteinler','Lipitler','Polimerler']
  ]);
  add('Kimya','analytical-chemistry','Analitik Kimya','Bileşenlerin tanınması ve miktar tayini',[
    ['analysis','Analize giriş','Örnekleme ve numune hazırlama','Hata ve istatistik','Kalibrasyon'],
    ['classical','Klasik analiz','Gravimetrik analiz','Asit-baz titrasyonları','Kompleksometrik titrasyonlar','Redoks ve çöktürme titrasyonları'],
    ['separation','Ayırma yöntemleri','Ekstraksiyon','Kromatografiye giriş','Gaz ve sıvı kromatografisi'],
    ['instrumental','Enstrümantal analiz','UV–Vis spektroskopisi','Atomik spektroskopi','Elektroanalitik yöntemler','Yöntem doğrulama']
  ]);
  add('Kimya','physical-chemistry','Fizikokimya','Kimyasal sistemlerin fiziksel temelleri',[
    ['thermodynamics','Termodinamik','Termodinamik yasaları','Kimyasal potansiyel','Faz dengeleri'],
    ['kinetics','Kinetik','Hız denklemleri','Tepkime mekanizmaları','Kataliz'],
    ['quantum','Kuantum kimyası','Kuantum mekaniğinin temelleri','Atomik ve moleküler orbitaller','Moleküler spektroskopi'],
    ['statistical','İstatistiksel termodinamik','Mikro durumlar ve dağılımlar','Bölüşüm fonksiyonları','Termodinamik büyüklükler'],
    ['surface','Yüzey ve elektrokimya','Adsorpsiyon','Yüzey gerilimi ve kolloidler','Elektrot süreçleri']
  ]);
  add('Kimya','inorganic-chemistry','Anorganik Kimya','Elementler ve koordinasyon bileşikleri',[
    ['elements','Elementler kimyası','Ana grup elementleri','Geçiş metalleri','Lantanitler ve aktinitler'],
    ['bonding','Yapı ve bağlanma','Simetriye giriş','Katıların yapısı','Moleküler orbital yaklaşımı'],
    ['coordination','Koordinasyon kimyası','Komplekslerin adlandırılması','Koordinasyon geometrileri','Kristal alan kuramı','Komplekslerde izomerlik'],
    ['applications','Anorganik kimya uygulamaları','Organometalik bileşikler','Biyoanorganik kimya','Anorganik malzemeler']
  ]);
  const KEY='forma-science-selection-v1';
  let selections={};
  try { const saved=JSON.parse(localStorage.getItem(KEY)||'{}'); if(saved&&typeof saved==='object'&&!Array.isArray(saved))selections=saved; } catch {}
  function programsFor(subject){return programs.filter(program=>program.subject===subject);}
  function selectionFor(subject){
    const saved=selections[subject]||{},program=programsFor(subject).find(p=>p.id===saved.program)||programsFor(subject)[0];
    const topic=program.topics.find(t=>t.id===saved.topic)||program.topics[0];
    const subtopic=topic.subtopics.find(s=>s.id===saved.subtopic)||topic.subtopics[0];
    return {program,topic,subtopic};
  }
  function select(subject,level,id){
    const current=selectionFor(subject),next={program:current.program.id,topic:current.topic.id,subtopic:current.subtopic.id};
    next[level]=id;
    if(level==='program'){delete next.topic;delete next.subtopic;}else if(level==='topic')delete next.subtopic;
    selections[subject]=next;
    const normalized=selectionFor(subject);
    selections[subject]={program:normalized.program.id,topic:normalized.topic.id,subtopic:normalized.subtopic.id};
    try{localStorage.setItem(KEY,JSON.stringify(selections));}catch{}
  }
  function render(subject){
    const {program,topic,subtopic}=selectionFor(subject);
    $('education-badge').textContent=t('Üniversite modu')+' · '+t(program.label);
    $('university-program').hidden=false;
    $('university-program-options').innerHTML=programsFor(subject).map(p=>`<button data-science-program="${p.id}" aria-pressed="${p.id===program.id}">${t(p.label)}</button>`).join('');
    $('topics').innerHTML=program.topics.map(p=>`<button class="topic ${p.id===topic.id?'active':''}" data-science-topic="${p.id}" aria-pressed="${p.id===topic.id}"><span>${t(p.label)}</span><span class="soon">${t('yakında')}</span></button>`).join('');
    $('university-subtopics').hidden=false;
    $('university-subtopic-options').innerHTML=topic.subtopics.map(p=>`<button data-science-subtopic="${p.id}" aria-pressed="${p.id===subtopic.id}">${t(p.label)}</button>`).join('');
    $('university-status').hidden=false;
    $('university-status').textContent=t('Bu dersin konu başlıkları taslak olarak eklendi. Sorular ve çözümler hazırlanıyor.');
    $('session-subject').textContent=t(subject).toLocaleUpperCase(I18n.locale());
    $('session-topic').textContent=t(program.label);
    $('session-subtopic').hidden=false;
    $('session-subtopic').textContent=t(topic.label)+' · '+t(subtopic.label);
    $('start').disabled=true;
  }
  Object.assign(translations,{
    'Fizik 1':'Physics 1','Fizik 2':'Physics 2','Fizik 3':'Physics 3',
    'Genel Kimya 1':'General Chemistry 1','Genel Kimya 2':'General Chemistry 2',
    'Organik Kimya':'Organic Chemistry','Analitik Kimya':'Analytical Chemistry','Fizikokimya':'Physical Chemistry','Anorganik Kimya':'Inorganic Chemistry',
    'Bu dersin konu başlıkları taslak olarak eklendi. Sorular ve çözümler hazırlanıyor.':'The topic outline is a draft. Questions and solutions are being prepared.'
  });
  globalThis.ScienceCatalog={programs,programsFor,selectionFor,select,render};
})();
