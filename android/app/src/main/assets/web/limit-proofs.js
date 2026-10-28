/* Constructive limit certificates and proofs. Every graphical squeeze states
   its inequalities on a punctured neighbourhood; a sampled picture alone is
   never treated as a proof. */
(() => {
  'use strict';
  const T=f=>math.parse(String(f).replace(/\bx-\(-(\d+)\)/g,'x+$1')).toTex({parenthesis:'auto',implicit:'hide'}),N=n=>ExactMath.latexNumber(n),F=n=>ExactMath.textNumber(n),S=(title,body='',latex=null)=>({title,body,latex});
  const kinds=new Set(['epsilon-delta','limit-proof','squeeze-graph']);
  const entries=[],add=(id,required,build)=>entries.push({id,required,build});
  const delta=(v,epsilon)=>math.evaluate(v.deltaExpression,{epsilon}),at=(f,x)=>math.evaluate(f,{x});
  function certificate(c,type){
    const p=c.point,k=c.k,L=c.L,h=`(x-(${p}))`;let v={kind:'epsilon-delta',type,point:p,L,side:'both',epsilon:c.epsilon,power:1,constant:1,radius:null,task:'construct'};
    if(type==='linear'){v.f=`${k}*${h}+${L}`;v.constant=k;}
    if(type==='constant'){v.f=String(L);v.constant=0;v.deltaExpression='1';}
    if(type==='absolute'){v.f=`${L}+${k}*abs(${h})`;v.constant=k;}
    if(type==='square'){v.L=k*p*p+c.L;v.f=`${k}*x^2+${c.L}`;v.constant=k*(2*Math.abs(p)+1);v.radius=1;}
    if(type==='cube'||type==='fourth'){v.power=type==='cube'?3:4;v.constant=k;v.f=`${L}+${k}*${h}^${v.power}`;}
    if(type==='reciprocal'){v.pole=p;v.distance=c.distance;v.point=p+c.distance;v.L=k/c.distance;v.f=`${k}/(x-(${p}))`;v.constant=2*k/c.distance**2;v.radius=c.distance/2;}
    if(type==='cancellation'){v.f=`(x^2-(${p})^2)/(x-(${p}))`;v.L=2*p;}
    if(type==='root-positive'){v.point=c.distance**2;v.L=c.distance;v.f='sqrt(x)';v.constant=1/c.distance;v.radius=v.point/2;}
    if(type==='root-zero'){v.point=0;v.L=0;v.side='right';v.f='sqrt(x)';v.power=.5;}
    if(type==='sine'){v.f=`${L}+sin(${k}*${h})`;v.constant=k;}
    if(type==='oscillating'){v.f=`${L}+${k}*${h}^2*sin(${c.frequency}/${h})`;v.constant=k;v.power=2;}
    if(!v.deltaExpression){const raw=`(epsilon/(${v.constant}))^(1/(${v.power}))`;v.deltaExpression=v.radius===null?raw:`min(${v.radius},${raw})`;}
    v.delta=delta(v,v.epsilon);return v;
  }
  function epsilonQuestion(v){
    let text=v.task==='numeric'?`ε=${F(v.epsilon)} için uygun bir δ>0 bulun ve tanımı kullanarak doğrulayın.`:v.task==='compare'?`ε₁=${F(v.epsilon)}, ε₂=${F(v.secondEpsilon)} için iki δ seçin. Hangi toleransın en az onun kadar dar bir komşuluk gerektirdiğini ispatlayın.`:'Her ε>0 için uygun bir δ(ε)>0 seçerek limiti epsilon–delta tanımından ispatlayın.';
    text+=(v.side==='right'?' Yalnız x>0 tarafından yaklaşılır.':'');
    return{text,eq:`lim_(x→${v.point}${v.side==='right'?'+':''}) ${v.f}=${F(v.L)}`,eqLatex:`\\lim_{x\\to ${N(v.point)}${v.side==='right'?'^+':''}}${T(v.f)}=${N(v.L)}`,verification:v,solution:`δ(ε)=${v.deltaExpression}. ${epsilonReason(v)} Her 0<|x-a|<δ için |f(x)−L|<ε; δ yalnız ε ve sabit verilere bağlıdır.`};
  }
  function epsilonReason(v){if(v.type==='constant')return'Fonksiyon ile limitin farkı sıfır; her pozitif δ uygundur.';if(v.type==='square')return`|x−a|<1 ile |x+a|≤2|a|+1≤${F(v.constant/Number(v.f.match(/^\d+/)?.[0]||1))}. Çarpanlara ayırarak farkı sınırlandırın.`;if(v.type==='reciprocal')return`|x−a|<${F(v.radius)} ile |x−kutup|>${F(v.distance/2)}. Payda sıfıra yaklaşmaz.`;if(v.type==='root-positive')return`x>${F(v.point/2)}>0; eşlenikle |√x−√a|=|x−a|/(√x+√a)≤|x−a|/√a.`;if(v.type==='cancellation')return'x≠a olduğundan farkların kareleri sadeleşir: f(x)=x+a.';if(v.type==='sine')return'Radyan ölçüsünde |sin u|≤|u| eşitsizliğini kullanın.';if(v.type==='oscillating')return'|sin u|≤1 olduğundan salınımlı çarpan mutlak değerde en fazla 1’dir.';return'Mutlak farkı |x−a| kuvvetiyle sınırlandırın.';}
  for(const type of ['linear','constant','absolute','square','cube','fourth','reciprocal','cancellation','root-positive','root-zero','sine','oscillating'])add('epsilon-delta-'+type,['epsilon-delta',...(type==='sine'||type==='oscillating'?['trig']:[])],c=>epsilonQuestion(certificate(c,type)));
  const proofRows={
    uniqueness:['Sonlu limitin tekliği','Aynı f fonksiyonunun x→a için iki sonlu limiti L ve M olduğunu varsayın. L=M olması gerektiğini epsilon–delta ile ispatlayın.','L=M'],
    sum:['Toplam kuralı','f(x)→L ve g(x)→M varsayımlarıyla toplamın limitini epsilon–delta tanımından ispatlayın.','lim(f+g)=L+M'],
    scalar:['Sabit çarpan kuralı','f(x)→L ve c sabit. c*f(x)→c*L önermesini ispatlayın; c=0 durumunu ayrıca ele alın.','lim(c*f)=c*L'],
    product:['Çarpım kuralı','f(x)→L, g(x)→M. Çarpımın limitini ispatlayın; önce f’nin a civarında sınırlı olduğunu gösterin.','lim(f*g)=L*M'],
    bounded:['Sınırlı çarpan','f(x)→0 ve delinmiş bir komşulukta |g(x)|≤B, B>0 olsun. f(x)*g(x)→0 sonucunu ispatlayın.','lim(f*g)=0'],
    squeeze:['Sıkıştırma teoremi','a’nın delinmiş bir komşuluğunda g≤f≤h ve g(x)→L, h(x)→L. f(x)→L sonucunu epsilon–delta tanımından ispatlayın.','g≤f≤h ⇒ lim f=L'],
    sign:['Limit yokluğunu tanımdan ispat','f(x)=(x−a)/|x−a| fonksiyonunun x→a için hiçbir sonlu limiti olamayacağını epsilon–delta tanımının değiliyle ispatlayın.','f(x)=(x−a)/|x−a|'],
    sequences:['İki diziyle limit yokluğu','f(x)=sin(k/(x−a)), k>0 için a’ya yaklaşan iki açık dizi kurarak iki taraflı limitin olmadığını ispatlayın.','f(x)=sin(k/(x−a))'],
    converse:['Ters önermeyi inceleme','f(x)*g(x)→0 ve g(x)→0 olması, f’nin sonlu limitinin varlığını gerektirir mi? İspatlayın veya bir karşı örnek kurun.','lim(f*g)=0; lim g=0']
  };
  for(const[type,[title,text,eq]]of Object.entries(proofRows))add('limit-proof-'+type,['proofs',...(['sign','sequences','converse'].includes(type)?[]:['epsilon-delta']),...(['sequences','converse'].includes(type)?['trig']:[]),...(['squeeze','converse'].includes(type)?['squeeze']:[])],c=>({text:text+(type==='converse'?' Bütün limitler x→0 içindir.':type==='sign'||type==='sequences'?` Bu soruda a=${c.point}${type==='sequences'?', k='+c.k:''}.`:' Fonksiyonlar a’nın ortak delinmiş bir komşuluğunda tanımlı ve bütün limitler x→a içindir.'),eq,eqLatex:null,solution:title+'; nicelik sırasını koruyun ve her δ’nın ε’den sonra, x’ten önce seçildiğini gösterin.',verification:{kind:'limit-proof',type,point:c.point,L:c.L,M:c.L+c.k,B:c.k,k:c.k,task:'prove'}}));
  function graphData(c,type){
    const p=c.point,L=c.L,k=c.k,h=`(x-(${p}))`,v={kind:'squeeze-graph',type,point:p,L,k,side:'both',task:'limit',hasLimit:type!=='insufficient',localRadius:1};
    if(type==='quadratic'){v.lower=`${L}-${k}*${h}^2`;v.upper=`${L}+${k}*${h}^2`;v.middle=`${L}+${k}*${h}^2*sin(${c.frequency}/${h})`;}
    if(type==='wedge'){v.lower=`${L}-${k}*abs(${h})`;v.upper=`${L}+${k}*abs(${h})`;v.middle=`${L}+${k}*${h}*sin(${c.frequency}/${h})`;}
    if(type==='one-sided'){v.side='right';v.lower=`${L}-${k}*${h}`;v.upper=`${L}+${k}*sqrt(${h})`;v.middle=`${L}+${k}*${h}/2*sin(1/${h})`;}
    if(type==='sinc'){v.point=0;v.L=1;v.localRadius=1;v.lower='cos(x)';v.upper='1';v.middle='sin(x)/x';}
    if(type==='infinity'){v.point='inf';v.lower=`${L}-${k}/x`;v.upper=`${L}+${k}/x`;v.middle=`${L}+${k}*sin(x)/x`;}
    if(type==='insufficient'){v.lower=`${L-1}-${k}*${h}^2`;v.upper=`${L+1}+${k}*${h}^2`;v.lowerLimit=L-1;v.upperLimit=L+1;}
    if(type==='asymmetric'){v.lower=`${L}-${k}*${h}^2`;v.upper=`${L}+${k+1}*${h}^2`;v.middle=`${L}+${k}*${h}^2*sin(1/${h})`;}
    return v;
  }
  function graphQuestion(v){
    const inf=v.point==='inf',p=inf?0:v.point,domain=inf?[1,18]:v.side==='right'?[p,p+1]:[p-1,p+1],curves=[v.lower,v.upper,...(v.middle?[v.middle]:[])],samples=curves.flatMap(f=>Array.from({length:101},(_,i)=>{try{return at(f,domain[0]+(domain[1]-domain[0])*i/100);}catch{return NaN;}})).filter(Number.isFinite),range=[Math.min(0,...samples)-.3,Math.max(0,...samples)+.3];
    let diagram=GraphPractice.plot({domain,range,curves,xlabel:'x',ylabel:'y',xticks:inf?[1,4,7,10,13,16]:v.side==='right'?[p,p+.25,p+.5,p+.75,p+1]:[p-1,p-.5,p,p+.5,p+1],caption:'Düz çizgi g, uzun kesikli h; varsa noktalı çizgi örnek f. Zarf eşitsizliği bütün verilen aralıkta geçerlidir.'}).replace('class="practice-graph"','class="practice-graph squeeze-graph"');
    const condition=inf?'x≥1':`0<|x−(${p})|<1${v.side==='right'?', x>'+p:''}`;
    let text=v.type==='insufficient'?'Bu grafik ve zarf bilgisi f’nin limitini tek başına belirler mi? Sıkıştırma teoreminin hangi koşulunu kontrol etmeniz gerektiğini açıklayıp iki uyumlu karşı örnek verin.':'Grafik ve verilen zarf eşitsizliklerini kullanarak sıkıştırma teoremiyle f’nin limitini ispatlayın. Sonucu yalnız çizimin görünüşüne dayandırmayın.';
    if(v.task==='width')text='Alt ve üst zarf arasındaki farkın limitini bulun. Bu farkın davranışı sıkıştırma teoremi açısından ne söyler?';
    text+=' Varsayım aralığı: '+condition+'.';
    return{text,eq:`g(x)=${v.lower}; h(x)=${v.upper}; g(x)≤f(x)≤h(x); ${condition}`,eqLatex:`\\begin{aligned}g(x)&=${T(v.lower)}\\\\h(x)&=${T(v.upper)}\\\\g(x)&\\le f(x)\\le h(x)\\end{aligned}`,diagram,questionType:'graph',verification:v,solution:v.hasLimit?`İki zarfın limiti ${F(v.L)}. Aynı delinmiş komşulukta eşitsizlik geçerli; sıkıştırmayla f’nin limiti ${F(v.L)}.`:`Alt limit ${F(v.lowerLimit)}, üst limit ${F(v.upperLimit)}; ortak limit yok. Bu, f’nin limitinin olmadığı anlamına gelmez. Örneğin f₁=${F(v.L-.5)}, f₂=${F(v.L+.5)} iki uyumlu farklı limit verir. Ayrıca f₃(x)=L+(x−a)/|x−a| aynı zarflara uyar fakat iki taraflı limiti yoktur.`};
  }
  for(const type of ['quadratic','wedge','one-sided','sinc','infinity','insufficient','asymmetric'])add('squeeze-graph-'+type,['graph-squeeze','squeeze',...(type==='sinc'?['trig']:[]),...(type==='infinity'?['infinity']:[]),...(type==='insufficient'?['absolute','onesided']:[])],c=>graphQuestion(graphData(c,type)));
  const bank=LimitBank,base=bank.generate,original=bank.templates.slice();
  bank.topics.push({id:'epsilon-delta',label:'Epsilon–delta tanımı',en:'Epsilon–delta definition',formula:'∀ε>0 ∃δ>0: 0<|x−a|<δ ⇒ |f(x)−L|<ε'}, {id:'proofs',label:'Limit ispatları ve karşı örnekler',en:'Limit proofs and counterexamples',formula:'Nicelik sırası: ε, ardından δ, ardından x.'},{id:'graph-squeeze',label:'Grafikli sıkıştırma',en:'Graphical squeeze theorem',formula:'g≤f≤h, lim g=lim h=L ⇒ lim f=L'});
  bank.defaults.push('epsilon-delta','proofs','graph-squeeze');const all=[...original,...entries],normalize=value=>Array.isArray(value)?bank.defaults.filter(id=>value.includes(id)):bank.defaults.slice(),available=value=>{const set=new Set(normalize(value));return all.filter(t=>t.required.every(id=>set.has(id)));};bank.normalize=normalize;bank.available=available;bank.templates=all.map(({id,required})=>({id,required}));
  bank.generate=(seed,index,selected=bank.defaults,forcedId=null)=>{const enabled=normalize(selected),pool=available(enabled);if(!pool.length)throw Error('Select compatible limit topics.');const t=forcedId?pool.find(t=>t.id===forcedId):PracticeMath.choose(seed,index,pool);if(!t)throw Error('Unknown proof template '+forcedId);if(!t.build)return base(seed,index,enabled,t.id);const random=PracticeMath.generator(seed,index+66173),int=(a,b)=>a+Math.floor(random()*(b-a+1)),pick=a=>a[int(0,a.length-1)],c={point:int(-2,2),L:int(-3,3),k:int(2,5),frequency:int(1,4),distance:int(1,4),epsilon:pick([.1,.25,.5])},q=t.build(c);return{id:`limit-proof-${seed>>>0}-${index}`,generatorVersion:'limit-proofs-v1',program:'limits',educationMode:'university',topicId:t.required[0],subtopicId:t.id,template:t.id,index,scope:{program:'limits',topics:enabled},requiredTopics:t.required.slice(),parameters:c,...q,diagram:q.diagram||'',solutionLatex:null,choices:[],correct:null,supportsChoices:false,responseType:'expression',difficultyProfile:{base:4,steps:5},english:{text:q.text,solution:q.solution}};};
  function transfer(q,style){const v=q.verification;if(!kinds.has(v.kind))return null;let next;
    if(v.kind==='epsilon-delta'){const w={...v,task:style==='affine'?'numeric':'compare',...(style==='square'?{secondEpsilon:v.epsilon/4,secondDelta:delta(v,v.epsilon/4)}:{})};next=epsilonQuestion(w);}
    if(v.kind==='limit-proof'){const w={...v,task:style==='affine'?'quantifiers':'point-value'};next={...q,text:q.text+(style==='affine'?' Her δ seçiminin nicelik sırasını ve x’ten bağımsızlığını ayrıca gerekçelendirin.':' f(a) nokta değeri değiştirilirse sonucun ve ispatın etkilenip etkilenmeyeceğini ayrıca açıklayın.'),verification:w};}
    if(v.kind==='squeeze-graph'){const w={...v};if(style==='affine'){for(const key of ['lower','upper','middle'])if(w[key])w[key]=`(${w[key]})+2`;w.L+=2;if(!w.hasLimit){w.lowerLimit+=2;w.upperLimit+=2;}w.shift=2;}else{w.task='width';}next=graphQuestion(w);}
    return{...q,...next,solutionLatex:null,english:{text:next.text,solution:next.solution||q.solution}};
  }
  function audit(v,correct){if(!kinds.has(v.kind))return null;
    if(v.kind==='epsilon-delta'){
      if(correct)return{candidate:{deltaExpression:v.deltaExpression,valid:true},claim:`Her ε>0 için δ(ε)=${v.deltaExpression.replace(/epsilon/g,'ε')} seçimi yeterlidir.`};
      if(v.type==='constant')return{candidate:{deltaExpression:'0',valid:false},claim:'δ=0 seçimi epsilon–delta tanımını sağlar.'};
      const offset=v.side==='right'?.5:.37,counterX=v.point+offset,error=Math.abs(at(v.f,counterX)-v.L),epsilon=error/2;return{candidate:{deltaExpression:'1',valid:false,counterX,epsilon,error},claim:`Her ε>0 için δ=1 seçmek yeterlidir. Özellikle ε=${F(epsilon)} için de geçerlidir.`};
    }
    const claim=v.kind==='squeeze-graph'?(correct?(v.hasLimit?'Zarfların ortak limiti f’nin limitidir.':'Bu zarf bilgisi tek başına f’nin limitini belirlemez.'):(v.hasLimit?'Grafik salınımlıysa, zarf aralığı sıfıra inse bile f’nin limiti olamaz.':'Zarfların limitleri farklı olduğu için f’nin limiti kesinlikle yoktur.')):correct?'Yukarıdaki önerme/karşı örnek, delinmiş komşuluklarda ve gerekli nicelik sırasıyla geçerlidir.':'f(a) değerini değiştirmek x→a limitini her zaman değiştirir.';
    return{candidate:{valid:correct},claim};
  }
  function epsilonSteps(v){const H=v.point===0?'x':v.point<0?'x+'+N(-v.point):'x-'+N(v.point);const steps=[S('Tanımdaki nicelik sırasını yazın','ε>0 keyfi seçilir. δ, ε’ye ve sabit verilere bağlı seçilir; x’e bağlı seçilemez.',`0<|${H}|<\\delta\\quad\\Longrightarrow\\quad|f(x)-${N(v.L)}|<\\varepsilon`),S('Mutlak farkı kontrol edin',epsilonReason(v),v.constant===0?'|f(x)-L|=0':`|f(x)-L|\\le ${N(v.constant)}|${H}|^{${N(v.power)}}`),S('Pozitif bir δ seçin','Bu seçim tek olası seçim değildir; daha küçük pozitif δ da yeterlidir.',`\\delta(\\varepsilon)=${math.simplify(v.deltaExpression).toTex({parenthesis:'auto',implicit:'hide'}).replace(/\\epsilon\b/g,'\\varepsilon')}`)];
    if(v.task==='numeric'||v.task==='compare')steps.push(S('Verilen toleransı yerine koyun','',`\\varepsilon=${N(v.epsilon)},\\quad\\delta=${N(delta(v,v.epsilon))}`));if(v.task==='compare')steps.push(S('İkinci toleransla karşılaştırın','Bu seçimin δ değeri ε arttıkça azalmaz; bazı durumlarda iki seçim eşit olabilir.',`\\varepsilon_2=${N(v.secondEpsilon)},\\quad\\delta_2=${N(v.secondDelta)}\\le\\delta_1`));
    steps.push(S('Delinmiş komşuluğu kullanın',v.side==='right'?'0<x<δ alınır; kökün gerçek tanım kümesi korunur.':'0<|x−a|<δ alınır. Varsa ek yarıçap/payda koşulu da bu δ seçimiyle sağlanır.',v.constant===0?'0<\\varepsilon':`|f(x)-L|<\\varepsilon`),S('İspatı tamamlayın','Her ε>0 için pozitif bir δ bulundu. Fonksiyonun a noktasındaki değeri bu argümanda kullanılmadı.',`\\lim_{x\\to ${N(v.point)}${v.side==='right'?'^+':''}}f(x)=${N(v.L)}`));return steps;}
  function proofSteps(v){let s=[];
    if(v.type==='uniqueness')s=[S('Aksini varsayın','L≠M olsun; aynı fonksiyonun iki limiti olduğu varsayılsın.'),S('Ayrık hata bütçesi seçin','',`\\varepsilon=\\frac{|L-M|}{3}>0`),S('İki komşuluğun ortak kısmını alın','δ=min(δ_L,δ_M). Her iki yakınlık aynı x için sağlanır; örneğin x=a+δ/2.'),S('Üçgen eşitsizliğiyle çelişki kurun','',`|L-M|\\le|L-f(x)|+|f(x)-M|<2\\varepsilon=\\frac{2|L-M|}{3}`),S('Sonucu çıkarın','Pozitif bir sayı kendisinin 2/3’ünden küçük olamaz. Dolayısıyla L=M.')];
    if(v.type==='sum')s=[S('Hata bütçesini ikiye ayırın','f ve g için ayrı ayrı ε/2 toleransı kullanın.'),S('Ortak δ seçin','δ=min(δ_f(ε/2),δ_g(ε/2)).'),S('Üçgen eşitsizliğini uygulayın','',`|(f+g)-(L+M)|\\le|f-L|+|g-M|<\\frac{\\varepsilon}{2}+\\frac{\\varepsilon}{2}=\\varepsilon`),S('Limiti yazın','İki komşuluk koşulu aynı anda sağlanır.',`\\lim(f+g)=L+M`)];
    if(v.type==='scalar')s=[S('Sıfır katsayıyı ayırın','c=0 ise fark sıfırdır ve her pozitif δ çalışır.'),S('Sıfırdan farklı katsayı için tolerans seçin','f’nin limit tanımını ε/|c| toleransıyla kullanın.'),S('Mutlak farkı sınırlandırın','',`|cf-cL|=|c||f-L|<|c|\\frac{\\varepsilon}{|c|}=\\varepsilon`),S('Sonucu çıkarın','Her sabit c için çarpan kuralı geçerlidir.')];
    if(v.type==='product')s=[S('Çarpımı iki hataya ayırın','',`fg-LM=f(g-M)+M(f-L)`),S('Önce f’yi yerel olarak sınırlayın','|f−L|<1 sağlayan bir komşulukta |f|<|L|+1.'),S('Ortak δ seçin','δ=min(δ_f(1), δ_f(ε/[2(|M|+1)]), δ_g(ε/[2(|L|+1)])).'),S('Her hata terimini sınırlandırın','',`|fg-LM|\\le |f||g-M|+|M||f-L|<\\frac{\\varepsilon}{2}+\\frac{|M|\\varepsilon}{2(|M|+1)}<\\varepsilon`),S('Çarpım kuralını tamamlayın','L veya M sıfır olduğunda da paydalardaki +1 nedeniyle seçim geçerlidir.')];
    if(v.type==='bounded')s=[S('Sınırlılık komşuluğunu sabitleyin','|g(x)|≤B sağlayan yarıçapı ρ>0 alın.'),S('f için tolerans seçin','f→0 tanımında ε/B kullanıp δ=min(ρ,δ_f(ε/B)) seçin.'),S('Çarpımı sınırlandırın','',`|fg|\\le B|f|<B\\frac{\\varepsilon}{B}=\\varepsilon`),S('Sonucu çıkarın','g’nin limitinin olması gerekmez; yerel sınırlılık yeterlidir.')];
    if(v.type==='squeeze')s=[S('Eşitsizliğin geçerli olduğu komşuluğu sabitleyin','g≤f≤h için yarıçap ρ>0 olsun.'),S('Zarflar için ayrı δ seçin','δ=min(ρ,δ_g(ε),δ_h(ε)).'),S('Aynı x için iki sınırı birleştirin','',`L-\\varepsilon<g(x)\\le f(x)\\le h(x)<L+\\varepsilon`),S('Mutlak fark biçimine geçin','',`|f(x)-L|<\\varepsilon`),S('Teoremi tamamlayın','Eşitsizlik grafikte birkaç örnek noktada değil, bütün delinmiş komşulukta geçerlidir.')];
    if(v.type==='sign')s=[S('Her aday L’yi ele alın','ε₀=1 seçin; bu seçim L’den bile bağımsızdır.'),S('Her δ>0 için iki yakın nokta kurun','x_+=a+δ/2 ve x_−=a−δ/2. Her ikisi de 0<|x−a|<δ koşulunu sağlar.'),S('Fonksiyon değerlerini hesaplayın','',`f(x_+)=1,\\quad f(x_-)=-1`),S('İki hatanın da küçük olamayacağını gösterin','',`2=|1-(-1)|\\le |1-L|+|-1-L|`),S('Tanımın değiliyle bitirin','İki hata da 1’den küçük olamaz. Her δ için en az bir hata ≥ε₀; hiçbir L limit olamaz.')];
    if(v.type==='sequences'||v.type==='converse'){
      const a=v.type==='converse'?0:v.point,k=v.type==='converse'?1:v.k;
      s=[S('Aynı noktaya giden iki dizi kurun','n pozitif tamsayı; her iki dizi de yaklaşım noktasından farklıdır.',`x_n=${N(a)}+\\frac{${k}}{2\\pi n+\\pi/2},\\quad y_n=${N(a)}+\\frac{${k}}{2\\pi n+3\\pi/2}`),S('Görüntü dizilerini hesaplayın','',`f(x_n)=1,\\quad f(y_n)=-1`),S('Dizisel limit ölçütünü kullanın','Aynı a noktasına giden dizilerin görüntüleri farklı limitlere gittiği için f’nin limiti yoktur.')];
      if(v.type==='converse')s.unshift(S('Karşı örneği seçin','f(x)=sin(1/x), g(x)=x; x≠0. |f(x)g(x)|≤|x| olduğundan çarpım→0 ve g→0.'));}
    if(v.task==='quantifiers')s.push(S('Nicelik sırasını kontrol edin','Önce ε, sonra δ, sonra bütün uygun x’ler. δ seçimi x’e bağlı değildir.'));if(v.task==='point-value')s.push(S('Nokta değerini tartışın','0<|x−a| koşulu x=a’yı dışlar; yalnız f(a)’nın değiştirilmesi sonuca etki etmez.'));return s;
  }
  function steps(q,v){if(!kinds.has(v.kind))return null;if(v.kind==='epsilon-delta')return epsilonSteps(v);if(v.kind==='limit-proof')return proofSteps(v);
    const s=[S('Grafiği ve verilen eşitsizliği birlikte okuyun','Zarf eşitsizliği bütün belirtilen delinmiş komşulukta varsayılmıştır.',`g(x)\\le f(x)\\le h(x)`),S('Alt ve üst zarfların limitlerini ayrı bulun','',`\\lim g=${N(v.hasLimit?v.L:v.lowerLimit)},\\quad\\lim h=${N(v.hasLimit?v.L:v.upperLimit)}`)];
    if(v.task==='width')s.push(S('Zarf aralığının genişliğini inceleyin','',`\\lim(h-g)=${N(v.hasLimit?0:v.upperLimit-v.lowerLimit)}`));
    if(v.hasLimit)s.push(S('Sıkıştırma koşullarını kontrol edin','Zarflar aynı L’ye gider ve aradaki eşitsizlik aynı komşulukta geçerlidir.'),S('Limiti sonuçlandırın','f(a) değeri ve salınımın sıklığı sonucu değiştirmez.',`\\lim_{x\\to ${v.point==='inf'?'\\infty':N(v.point)}${v.side==='right'?'^+':''}}f(x)=${N(v.L)}`));
    else s.push(S('Eksik koşulu belirleyin','Zarfların limitleri farklıdır. Bu veri, f’nin limitinin varlığını veya yokluğunu tek başına kanıtlamaz.'),S('İki uyumlu örnek kurun','İki sabit fonksiyon da bütün zarf koşullarını sağlar fakat limitleri farklıdır.',`f_1(x)=${N(v.L-.5)},\\quad f_2(x)=${N(v.L+.5)}`),S('Limitin varlığının da zorunlu olmadığını gösterin','Aynı zarfları sağlayan bu fonksiyonun soldan ve sağdan limitleri L−1 ve L+1’dir.',`f_3(x)=${N(v.L)}+\\frac{x-(${N(v.point)})}{|x-(${N(v.point)})|}`));return s;
  }
  function reviewSteps(r){if(r.correct||r.base.kind!=='epsilon-delta')return[];const c=r.candidate;if(r.base.type==='constant')return[S('δ koşulunu kontrol edin','Tanım δ>0 ister; δ=0 bu koşulu sağlamaz.')];return[S('Önerilen δ=1 için karşı örnek kurun','Bu x, 0<|x−a|<1 içindedir.',`x_0=${N(c.counterX)},\\quad\\varepsilon_0\\approx ${N(c.epsilon)}`),S('Hatanın toleransı aştığını gösterin','Bu tek karşı örnek, her ε için yeterlilik iddiasını çürütür.',`|f(x_0)-L|\\approx ${N(c.error)}>\\varepsilon_0`)];}
  globalThis.LimitProofs={kinds,delta,transfer,audit,steps,reviewSteps};
})();
