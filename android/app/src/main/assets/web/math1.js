(function(){
const catalog=[{"id":"foundations","label":"Kümeler ve reel sayılar","subs":[["set-union","Kümelerde işlemler"],["absolute-value","Mutlak değer"],["quadratic-roots","Denklemler ve eşitsizlikler"]],"formulas":[["Birleşimin eleman sayısı","|A ∪ B| = |A| + |B| − |A ∩ B|","Sonlu kümeler için."],["Mutlak değer eşitsizliği","|x − a| < r ⇔ a − r < x < a + r","r > 0; aralığın uzunluğu 2r."],["İkinci derece denklem","x₁ + x₂ = −b/a, x₁x₂ = c/a","ax² + bx + c = 0, a ≠ 0."]]},{"id":"functions","label":"Fonksiyonlar","subs":[["composition","Bileşke fonksiyon"],["inverse","Ters fonksiyon"],["domain","Tanım kümesi"]],"formulas":[["Bileşke","(f ∘ g)(x) = f(g(x))","g(x), f'nin tanım kümesinde olmalı."],["Doğrusal fonksiyonun tersi","f(x) = ax + b ⇒ f⁻¹(x) = (x − b)/a","a ≠ 0."],["Tanım kümesi","√u(x): u(x) ≥ 0; ln u(x): u(x) > 0","Rasyonel fonksiyonda payda sıfır olamaz."]]},{"id":"exp-log","label":"Üstel ve logaritmik fonksiyonlar","subs":[["logarithms","Logaritma kuralları"],["exponential-equations","Üstel denklemler"],["log-equations","Logaritmik denklemler"]],"formulas":[["Logaritma","logₐ b = c ⇔ aᶜ = b","a > 0, a ≠ 1, b > 0."],["Logaritma kuralları","ln(uv) = ln u + ln v; ln(uᵏ) = k ln u","u, v > 0."],["Taban değiştirme","logₐ b = ln b / ln a","a > 0, a ≠ 1, b > 0."]]},{"id":"trig","label":"Trigonometri","subs":[["identities","Temel özdeşlikler"],["half-angle","Yarım açı formülleri"],["double-angle","Çift açı formülleri"],["equations","Trigonometrik denklemler"]],"formulas":[["Temel özdeşlik","sin²x + cos²x = 1; tan x = sin x / cos x","Tanjant için cos x ≠ 0."],["Yarım açı","sin²(x/2) = (1 − cos x)/2","Karekökün işareti x/2'nin bölgesine bağlıdır."],["Yarım açı","cos²(x/2) = (1 + cos x)/2","Karekökün işareti x/2'nin bölgesine bağlıdır."],["Çift açı","sin 2x = 2sin x cos x; cos 2x = cos²x − sin²x","Açılar radyan veya aynı birimde olmalı."],["Trigonometrik denklemler","sin x = 0 ⇒ x = kπ; cos x = 0 ⇒ x = π/2 + kπ","k ∈ ℤ."],["Dördüncü kuvvet","sin⁴x + cos⁴x = 1 − ½sin²2x","sin²x + cos²x = 1."]]},{"id":"limits","label":"Limit ve süreklilik","subs":[["polynomial-limits","Bir noktada limit"],["rational-limits","Belirsizlik ve sonsuzda limit"],["standard-limits","Temel trigonometrik limitler"],["continuity","Süreklilik"]],"formulas":[["Polinomlarda limit","limₓ→ₐ P(x) = P(a)","Polinomlar her reel sayıda süreklidir."],["Temel limit","limₓ→₀ sin x / x = 1","Açı radyan cinsindedir."],["Temel limit","limₓ→₀ (1 − cos x) / x² = 1/2","Açı radyan cinsindedir."],["Sonsuzda rasyonel limit","limₓ→∞ (axⁿ + …)/(bxⁿ + …) = a/b","Pay ve paydanın derecesi eşit, b ≠ 0."],["Süreklilik","limₓ→ₐ f(x) = f(a)","İki taraflı limit var olmalı ve fonksiyon değeriyle eşit olmalı."]]},{"id":"derivatives","label":"Türev","subs":[["power-rule","Türev kuralları"],["chain-rule","Zincir kuralı"],["product-quotient","Çarpım ve bölüm kuralı"],["implicit-derivative","Kapalı fonksiyon türevi"]],"formulas":[["Kuvvet kuralı","d(xⁿ)/dx = n xⁿ⁻¹","İfadenin tanımlı olduğu noktalarda."],["Zincir kuralı","(f(g(x)))′ = f′(g(x)) · g′(x)","İç ve dış fonksiyon türevlenebilir olmalı."],["Çarpım ve bölüm","(uv)′ = u′v + uv′; (u/v)′ = (u′v − uv′)/v²","Bölüm için v ≠ 0."],["Temel türevler","(sin x)′ = cos x; (eˣ)′ = eˣ; (ln x)′ = 1/x","Trigonometrik türevlerde radyan; ln x için x > 0."],["Kapalı türev","F(x,y) = 0 ⇒ y′ = −Fₓ/Fᵧ","Fᵧ ≠ 0 ve gerekli türevler var olmalı."]]},{"id":"applications","label":"Türevin uygulamaları","subs":[["tangent","Teğet ve normal"],["extrema","Ekstremum ve optimizasyon"],["mean-value","Ortalama değer teoremi"],["related-rates","Bağlı değişim hızları"]],"formulas":[["Teğet doğrusu","y − f(a) = f′(a)(x − a)","f, a noktasında türevlenebilir."],["Kritik nokta","f′(a) = 0; f″(a) > 0 ⇒ yerel minimum","f″(a) < 0 ⇒ yerel maksimum; test şartları sağlanmalı."],["Ortalama değer teoremi","f′(c) = [f(b) − f(a)]/(b − a)","f, [a,b]'de sürekli, (a,b)'de türevlenebilir."],["Bağlı değişim","dV/dt = (dV/dr) · dr/dt","Örneğin kürede V = 4πr³/3."]]},{"id":"integrals","label":"İntegrale giriş","subs":[["antiderivative","Belirsiz integral"],["definite-integral","Belirli integral"],["substitution","Değişken değiştirme"],["area","Eğriler arasında alan"]],"formulas":[["Kuvvet integrali","∫ xⁿ dx = xⁿ⁺¹/(n + 1) + C","n ≠ −1; ∫ 1/x dx = ln|x| + C."],["Temel teorem","∫ₐᵇ f(x) dx = F(b) − F(a)","f sürekli ve F′ = f olmalı."],["Değişken değiştirme","∫ f(g(x))g′(x) dx = ∫ f(u) du","u = g(x); belirli integralde sınırlar da değiştirilir."],["İki eğri arasında alan","A = ∫ₐᵇ [üst eğri − alt eğri] dx","Kesişim noktalarında gerekirse aralık parçalanır."]]}];
const legacy=UniversityQuestions.generate;
const mixed={id:'mixed',label:'Konudan karma'};
const topics=[{id:'general',label:'Genel karma sınav',ready:true},...catalog.map(topic=>({id:topic.id,label:topic.label,ready:true}))];
const subtopicsFor=id=>[mixed,...(catalog.find(topic=>topic.id===id)?.subs||[]).map(([id,label])=>({id,label}))];
const gcd=(a,b)=>b?gcd(b,a%b):Math.abs(a);
function fraction(a,b=1){if(b<0){a=-a;b=-b;}const d=gcd(a,b);return b/d===1?String(a/d):`${a/d}/${b/d}`;}
const superscript=n=>String(n).split('').map(c=>'⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(c)]).join('');
const power=(x,n)=>n===1?x:`${x}${superscript(n)}`;
function generate(subject,seed,index,selection={topic:'general',subtopic:'mixed'},count=4){
 if(subject!=='Matematik'||!Number.isSafeInteger(index)||index<0)throw Error('Bu konu hazırlanıyor.');
 const general=selection.topic==='general',topic=general?catalog[index%catalog.length]:catalog.find(topic=>topic.id===selection.topic);
 if(!topic)throw Error('Bu konu hazırlanıyor.');
 const position=general?Math.floor(index/catalog.length):index;
 const type=general||selection.subtopic==='mixed'?topic.subs[position%topic.subs.length][0]:selection.subtopic;
 if(!topic.subs.some(sub=>sub[0]===type))throw Error('Bu alt konu hazırlanıyor.');
 if(topic.id==='trig'){
  const q=legacy(subject,seed,index,{topic:'trig',subtopic:type},count);
  q.scope={...selection};q.program='general-math-1';
  if(general)q.id=`u2-${seed>>>0}-${index}-${topic.id}-${type}`;
  return q;
 }
 let state=(seed^Math.imul(index+1,2654435761))>>>0;
 const random=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};
 const integer=(a,b)=>a+Math.floor(random()*(b-a+1));
 let q={id:`u2-${seed>>>0}-${index}-${topic.id}-${type}`,generatorVersion:1,program:'general-math-1',educationMode:'university',subject,index,template:type,scope:{...selection},topicId:topic.id,subtopicId:type,diagram:'',answerUnit:''};
 let answer='';
 function set(parameters,num,den,tr,en,eq,trSolution,enSolution){
  answer=fraction(num,den);q.parameters=parameters;q.answerValue=num/den;q.answerExpression=answer;
  q.text=tr;q.eq=eq;q.solution=trSolution;q.english={text:en,solution:enSolution};
 }
 let a=integer(1,5),b=integer(1,6),c=integer(1,5),n=integer(2,4),x=integer(1,3);
 switch(type){
 case 'set-union':{
  const left=integer(8,25),right=integer(8,25),overlap=integer(1,Math.min(left,right)-1),result=left+right-overlap;
  set({left,right,overlap},result,1,`|A| = ${left}, |B| = ${right}, |A ∩ B| = ${overlap}. A ∪ B kümesinin eleman sayısı kaçtır?`,`|A| = ${left}, |B| = ${right}, |A ∩ B| = ${overlap}. How many elements are in A ∪ B?`,`|A ∪ B| = ?`,`Birleşimde ortak elemanlar iki kez sayılmaz: ${left} + ${right} − ${overlap} = ${result}.`,`Subtract the overlap counted twice: ${left} + ${right} − ${overlap} = ${result}.`);break;}
 case 'absolute-value':{
  const center=integer(-9,9),radius=integer(2,12),result=2*radius;
  set({center,radius},result,1,`|x − (${center})| < ${radius} eşitsizliğinin çözüm aralığının uzunluğu kaçtır?`,`What is the length of the solution interval of |x − (${center})| < ${radius}?`,`|x − (${center})| < ${radius}`,`${center-radius} < x < ${center+radius}. Uzunluk: (${center+radius}) − (${center-radius}) = ${result}.`,`${center-radius} < x < ${center+radius}. Length: (${center+radius}) − (${center-radius}) = ${result}.`);break;}
 case 'quadratic-roots':{
  const r=integer(-8,8),s=integer(-8,8),sum=r+s,product=r*s;
  set({r,s,sum,product},product,1,`x² − (${sum})x + (${product}) = 0 denkleminin köklerinin çarpımı kaçtır?`,`What is the product of the roots of x² − (${sum})x + (${product}) = 0?`,`x² − (${sum})x + (${product}) = 0`,`Vieta bağıntısı: x₁x₂ = sabit terim / x² katsayısı = ${product}/1 = ${product}.`,`By Vieta's formula: x₁x₂ = constant / leading coefficient = ${product}/1 = ${product}.`);break;}
 case 'composition':{
  const inside=b*x+c,result=a*inside*inside;
  set({a,b,c,x},result,1,`f(x) = ${a}x² ve g(x) = ${b}x + ${c}. (f ∘ g)(${x}) kaçtır?`,`f(x) = ${a}x² and g(x) = ${b}x + ${c}. Find (f ∘ g)(${x}).`,`(f ∘ g)(${x}) = ?`,`Önce g(${x}) = ${inside}. Ardından f(${inside}) = ${a} × ${inside}² = ${result}.`,`First g(${x}) = ${inside}. Then f(${inside}) = ${a} × ${inside}² = ${result}.`);break;}
 case 'inverse':{
  const target=a*x+b;
  set({a,b,x,target},x,1,`f(x) = ${a}x + ${b} ise f⁻¹(${target}) kaçtır?`,`If f(x) = ${a}x + ${b}, find f⁻¹(${target}).`,`f⁻¹(${target}) = ?`,`a = ${a} ≠ 0 olduğundan f⁻¹(y) = (y − ${b})/${a}. (${target} − ${b})/${a} = ${x}.`,`Since a = ${a} ≠ 0, f⁻¹(y) = (y − ${b})/${a}. (${target} − ${b})/${a} = ${x}.`);break;}
 case 'domain':{
  const boundary=integer(-9,9),kind=random()<.5?'sqrt':'rational';
  set({boundary,kind},boundary,1,kind==='sqrt'?`f(x) = √(x − (${boundary})) fonksiyonunun reel tanım kümesinin en küçük elemanı kaçtır?`:`f(x) = 1/(x − (${boundary})) fonksiyonunun reel tanım kümesinden çıkarılması gereken sayı kaçtır?`,kind==='sqrt'?`What is the smallest real number in the domain of f(x) = √(x − (${boundary}))?`:`Which real number must be excluded from the domain of f(x) = 1/(x − (${boundary}))?`,kind==='sqrt'?`f(x) = √(x − (${boundary}))`:`f(x) = 1/(x − (${boundary}))`,kind==='sqrt'?`Karekök içinde x − (${boundary}) ≥ 0 olmalı. Tanım kümesi [${boundary}, ∞); en küçük eleman ${boundary}.`:`Payda sıfır olamaz. x − (${boundary}) = 0 için x = ${boundary}; bu sayı çıkarılır.`,kind==='sqrt'?`The radicand must satisfy x − (${boundary}) ≥ 0. The domain is [${boundary}, ∞); its minimum is ${boundary}.`:`The denominator cannot be zero. x − (${boundary}) = 0 at x = ${boundary}; exclude this number.`);break;}
 case 'logarithms':{
  const base=integer(2,5),exponent=integer(2,6),value=base**exponent;
  set({base,exponent,value},exponent,1,`log_${base}(${value}) kaçtır?`,`Find log_${base}(${value}).`,`log_${base}(${value}) = ?`,`${base}${superscript(exponent)} = ${value} olduğundan log_${base}(${value}) = ${exponent}.`,`Since ${base}${superscript(exponent)} = ${value}, log_${base}(${value}) = ${exponent}.`);break;}
 case 'exponential-equations':{
  const base=integer(2,5),result=integer(1,5),target=a*result+b;
  set({base,a,b,target},result,1,`${base}^(${a}x + ${b}) = ${base}^${target} denklemini sağlayan x kaçtır?`,`Solve ${base}^(${a}x + ${b}) = ${base}^${target} for x.`,`${base}^(${a}x + ${b}) = ${base}^${target}`,`Taban ${base} > 0 ve 1'den farklıdır; üsler eşittir. ${a}x + ${b} = ${target}, x = (${target} − ${b})/${a} = ${result}.`,`The base ${base} is positive and not 1, so the exponents are equal. ${a}x + ${b} = ${target}, x = (${target} − ${b})/${a} = ${result}.`);break;}
 case 'log-equations':{
  const shift=integer(-6,6),value=integer(2,12),result=shift+value;
  set({shift,value},result,1,`ln(x − (${shift})) = ln(${value}) denkleminin reel çözümü kaçtır?`,`Find the real solution of ln(x − (${shift})) = ln(${value}).`,`ln(x − (${shift})) = ln(${value})`,`Tanım şartı x > ${shift}. ln birebir olduğundan x − (${shift}) = ${value}; x = ${result}. Bu değer tanım şartını sağlar.`,`The domain requires x > ${shift}. Since ln is one-to-one, x − (${shift}) = ${value}; x = ${result}, which satisfies the domain condition.`);break;}
 case 'polynomial-limits':{
  const result=a*x*x+b*x+c;
  set({a,b,c,x},result,1,`x → ${x} iken ${a}x² + ${b}x + ${c} ifadesinin limiti kaçtır?`,`Find the limit of ${a}x² + ${b}x + ${c} as x → ${x}.`,`limₓ→${x} (${a}x² + ${b}x + ${c})`,`Polinom sürekli olduğundan yerine koy: ${a} × ${x}² + ${b} × ${x} + ${c} = ${result}.`,`Polynomials are continuous; substitute: ${a} × ${x}² + ${b} × ${x} + ${c} = ${result}.`);break;}
 case 'rational-limits':{
  const kind=random()<.5?'removable':'infinity';
  if(kind==='removable')set({kind,a,b},2*a*b,1,`x → ${a} iken ${b}(x² − ${a*a})/(x − ${a}) ifadesinin limiti kaçtır?`,`Find the limit of ${b}(x² − ${a*a})/(x − ${a}) as x → ${a}.`,`limₓ→${a} ${b}(x² − ${a*a})/(x − ${a})`,`x ≠ ${a} için (x² − ${a*a}) = (x − ${a})(x + ${a}). Sadeleştir: ${b}(x + ${a}); limit ${b} × ${2*a} = ${2*a*b}.`,`For x ≠ ${a}, factor (x² − ${a*a}) = (x − ${a})(x + ${a}). Cancel to get ${b}(x + ${a}); the limit is ${2*a*b}.`);
  else set({kind,a,b,c},a,b,`x → ∞ iken (${a}x² + ${c})/(${b}x² + 1) ifadesinin limiti kaçtır?`,`Find the limit of (${a}x² + ${c})/(${b}x² + 1) as x → ∞.`,`limₓ→∞ (${a}x² + ${c})/(${b}x² + 1)`,`Payı ve paydayı x²'ye böl: (${a} + ${c}/x²)/(${b} + 1/x²). Küçük terimler sıfıra gider; sonuç ${fraction(a,b)}.`,`Divide numerator and denominator by x²: (${a} + ${c}/x²)/(${b} + 1/x²). The smaller terms approach zero; the result is ${fraction(a,b)}.`);break;}
 case 'standard-limits':{
  const kind=random()<.5?'sin':'cos',num=kind==='sin'?a:a*a,den=kind==='sin'?b:2;
  set({kind,a,b},num,den,`Açılar radyan cinsinden. x → 0 iken ${kind==='sin'?`sin(${a}x)/(${b}x)`:`(1 − cos(${a}x))/x²`} ifadesinin limiti kaçtır?`,`Angles are in radians. Find the limit of ${kind==='sin'?`sin(${a}x)/(${b}x)`:`(1 − cos(${a}x))/x²`} as x → 0.`,kind==='sin'?`limₓ→₀ sin(${a}x)/(${b}x)`:`limₓ→₀ (1 − cos(${a}x))/x²`,kind==='sin'?`sin(${a}x)/(${a}x) → 1. Dış katsayı ${a}/${b}; sonuç ${fraction(num,den)}.`:`u = ${a}x. (1 − cos u)/u² → 1/2; dış katsayı ${a}². Sonuç ${fraction(num,den)}.`,kind==='sin'?`sin(${a}x)/(${a}x) → 1. The remaining factor is ${a}/${b}; the result is ${fraction(num,den)}.`:`Let u = ${a}x. (1 − cos u)/u² → 1/2; the remaining factor is ${a}². Result: ${fraction(num,den)}.`);break;}
 case 'continuity':{
  const result=a*x+b;
  set({a,b,x},result,1,`f(x) = ${a}x + ${b} (x ≠ ${x}), f(${x}) = k. f'nin x = ${x} noktasında sürekli olması için k kaç olmalı?`,`f(x) = ${a}x + ${b} for x ≠ ${x}, and f(${x}) = k. Find k so that f is continuous at x = ${x}.`,`limₓ→${x} f(x) = f(${x})`,`İki taraflı limit ${a} × ${x} + ${b} = ${result}. Fonksiyonun bu noktadaki değeri aynı olmalı: k = ${result}.`,`The two-sided limit is ${a} × ${x} + ${b} = ${result}. The function value must equal it: k = ${result}.`);break;}
 case 'power-rule':{
  const result=a*n*x**(n-1)+b;
  set({a,b,n,x},result,1,`f(x) = ${a}${power('x',n)} + ${b}x. f′(${x}) kaçtır?`,`f(x) = ${a}${power('x',n)} + ${b}x. Find f′(${x}).`,`f′(${x}) = ?`,`Kuvvet kuralı: f′(x) = ${a*n}${power('x',n-1)} + ${b}. f′(${x}) = ${result}.`,`Power rule: f′(x) = ${a*n}${power('x',n-1)} + ${b}. f′(${x}) = ${result}.`);break;}
 case 'chain-rule':{
  const result=n*a*(a*x+b)**(n-1);
  set({a,b,n,x},result,1,`f(x) = (${a}x + ${b})${superscript(n)}. f′(${x}) kaçtır?`,`f(x) = (${a}x + ${b})${superscript(n)}. Find f′(${x}).`,`f′(${x}) = ?`,`Zincir kuralı: f′(x) = ${n}(${a}x + ${b})${superscript(n-1)} × ${a}. x = ${x} için ${result}.`,`Chain rule: f′(x) = ${n}(${a}x + ${b})${superscript(n-1)} × ${a}. At x = ${x}, the result is ${result}.`);break;}
 case 'product-quotient':{
  const kind=random()<.5?'product':'quotient';
  if(kind==='product'){const result=a*(x*x+c)+(a*x+b)*2*x;set({kind,a,b,c,x},result,1,`f(x) = (${a}x + ${b})(x² + ${c}). f′(${x}) kaçtır?`,`f(x) = (${a}x + ${b})(x² + ${c}). Find f′(${x}).`,`f′(${x}) = ?`,`Çarpım kuralı: f′(x) = ${a}(x² + ${c}) + (${a}x + ${b})·2x. x = ${x} için ${result}.`,`Product rule: f′(x) = ${a}(x² + ${c}) + (${a}x + ${b})·2x. At x = ${x}, this is ${result}.`);}
  else{const numerator=a*c-b,denominator=(x+c)**2;set({kind,a,b,c,x},numerator,denominator,`f(x) = (${a}x + ${b})/(x + ${c}). f′(${x}) kaçtır?`,`f(x) = (${a}x + ${b})/(x + ${c}). Find f′(${x}).`,`f′(${x}) = ?`,`Bölüm kuralı: f′(x) = [${a}(x + ${c}) − (${a}x + ${b})]/(x + ${c})² = (${numerator})/(x + ${c})². Sonuç ${fraction(numerator,denominator)}; payda sıfır değildir.`,`Quotient rule: f′(x) = [${a}(x + ${c}) − (${a}x + ${b})]/(x + ${c})² = (${numerator})/(x + ${c})². Result: ${fraction(numerator,denominator)}; the denominator is nonzero.`);}break;}
 case 'implicit-derivative':{
  const triples=[[3,4,5],[5,12,13],[8,15,17]],triple=triples[integer(0,2)],scale=integer(1,4),px=triple[0]*scale,py=triple[1]*scale,r=triple[2]*scale;
  set({px,py,r},-px,py,`x² + y² = ${r*r} eğrisinin (${px}, ${py}) noktasındaki dy/dx değeri kaçtır?`,`Find dy/dx on x² + y² = ${r*r} at (${px}, ${py}).`,`2x + 2y·y′ = 0`,`Kapalı türev: 2x + 2y·y′ = 0 ⇒ y′ = −x/y. y = ${py} ≠ 0; sonuç −${px}/${py} = ${fraction(-px,py)}.`,`Implicit differentiation gives 2x + 2y·y′ = 0 ⇒ y′ = −x/y. Since y = ${py} ≠ 0, the result is ${fraction(-px,py)}.`);break;}
 case 'tangent':{
  const target=x+integer(1,3),at=a*x*x+b,slope=2*a*x,result=at+slope*(target-x);
  set({a,b,x,target},result,1,`f(x) = ${a}x² + ${b} eğrisine x = ${x} noktasında çizilen teğetin x = ${target} noktasındaki y değeri kaçtır?`,`For f(x) = ${a}x² + ${b}, find the y-value at x = ${target} on the tangent drawn at x = ${x}.`,`y − f(${x}) = f′(${x})(x − ${x})`,`f(${x}) = ${at}, f′(${x}) = ${slope}. Teğet: y − ${at} = ${slope}(x − ${x}). x = ${target} için y = ${result}.`,`f(${x}) = ${at}, f′(${x}) = ${slope}. The tangent is y − ${at} = ${slope}(x − ${x}). At x = ${target}, y = ${result}.`);break;}
 case 'extrema':{
  const center=integer(-6,6),offset=integer(-9,9),kind=random()<.5?'point':'value',result=kind==='point'?center:offset;
  set({a,center,offset,kind},result,1,`f(x) = ${a}(x − (${center}))² + (${offset}) fonksiyonunun ${kind==='point'?'minimuma ulaştığı x değeri':'minimum değeri'} kaçtır?`,`For f(x) = ${a}(x − (${center}))² + (${offset}), find ${kind==='point'?'the x-value at the minimum':'the minimum value'}.`,`f′(x) = ${2*a}(x − (${center}))`,`f′(x) = 0 ⇒ x = ${center}. f″(x) = ${2*a} > 0. Minimum noktası x = ${center}, minimum değer f(${center}) = ${offset}; istenen ${result}.`,`f′(x) = 0 ⇒ x = ${center}. f″(x) = ${2*a} > 0. The minimum occurs at x = ${center}, with value ${offset}; the requested answer is ${result}.`);break;}
 case 'mean-value':{
  const left=integer(-4,4),right=left+integer(2,8);
  set({left,right},left+right,2,`f(x) = x² için [${left}, ${right}] aralığında ortalama değer teoremini sağlayan c kaçtır?`,`For f(x) = x² on [${left}, ${right}], find c given by the mean value theorem.`,`f′(c) = [f(${right}) − f(${left})]/(${right} − (${left}))`,`Polinom sürekli ve türevlenebilirdir. Sekant eğimi = (${right}² − (${left})²)/(${right} − (${left})) = ${left+right}. f′(c) = 2c ⇒ c = ${fraction(left+right,2)}; c aralığın içindedir.`,`This polynomial is continuous and differentiable. The secant slope is (${right}² − (${left})²)/(${right} − (${left})) = ${left+right}. f′(c) = 2c, so c = ${fraction(left+right,2)}, inside the interval.`);break;}
 case 'related-rates':{
  const radius=integer(2,8),rate=integer(1,4),result=4*radius*radius*rate;
  set({radius,rate},result,1,`Bir kürenin yarıçapı ${rate} cm/s hızla artıyor. r = ${radius} cm iken hacmin artış hızı Kπ cm³/s olduğuna göre K kaçtır?`,`A sphere's radius increases at ${rate} cm/s. At r = ${radius} cm, its volume increases at Kπ cm³/s. Find K.`,`V = 4πr³/3`,`dV/dt = 4πr²·dr/dt = 4π × ${radius}² × ${rate} = ${result}π cm³/s. Dolayısıyla K = ${result}.`,`dV/dt = 4πr²·dr/dt = 4π × ${radius}² × ${rate} = ${result}π cm³/s. Therefore K = ${result}.`);break;}
 case 'antiderivative':{
  const numerator=a*x**(n+1),denominator=n+1;
  set({a,n,x},numerator,denominator,`F′(x) = ${a}${power('x',n)} ve F(0) = 0. F(${x}) kaçtır?`,`F′(x) = ${a}${power('x',n)} and F(0) = 0. Find F(${x}).`,`F(${x}) = ?`,`İntegral: F(x) = ${a}${power('x',n+1)}/${n+1} + C. F(0) = 0 ⇒ C = 0. F(${x}) = ${fraction(numerator,denominator)}.`,`Integrate: F(x) = ${a}${power('x',n+1)}/${n+1} + C. F(0) = 0 gives C = 0. F(${x}) = ${fraction(numerator,denominator)}.`);break;}
 case 'definite-integral':{
  const left=integer(0,2),right=left+integer(1,3),num=a*(right**(n+1)-left**(n+1)),den=n+1;
  set({a,n,left,right},num,den,`${left} ile ${right} arasında ${a}${power('x',n)} fonksiyonunun belirli integrali kaçtır?`,`Evaluate the definite integral of ${a}${power('x',n)} from ${left} to ${right}.`,`∫[${left}, ${right}] ${a}${power('x',n)} dx`,`Bir ilkel fonksiyon F(x) = ${a}${power('x',n+1)}/${n+1}. F(${right}) − F(${left}) = ${a}(${right}${superscript(n+1)} − ${left}${superscript(n+1)})/${n+1} = ${fraction(num,den)}.`,`An antiderivative is F(x) = ${a}${power('x',n+1)}/${n+1}. F(${right}) − F(${left}) = ${a}(${right}${superscript(n+1)} − ${left}${superscript(n+1)})/${n+1} = ${fraction(num,den)}.`);break;}
 case 'substitution':{
  n=integer(1,2);x=integer(1,2);const upper=a*x*x+b,num=upper**(n+1)-b**(n+1),den=n+1;
  set({a,b,n,x},num,den,`0 ile ${x} arasında ${2*a}x(${a}x² + ${b})${superscript(n)} ifadesinin integrali kaçtır?`,`Integrate ${2*a}x(${a}x² + ${b})${superscript(n)} from 0 to ${x}.`,`∫[0, ${x}] ${2*a}x(${a}x² + ${b})${superscript(n)} dx`,`u = ${a}x² + ${b}, du = ${2*a}x dx. Yeni sınırlar ${b} ve ${upper}. ∫u${superscript(n)} du = u${superscript(n+1)}/${n+1}; sonuç (${upper}${superscript(n+1)} − ${b}${superscript(n+1)})/${n+1} = ${fraction(num,den)}.`,`Set u = ${a}x² + ${b}, du = ${2*a}x dx. The new bounds are ${b} and ${upper}. Integrate u${superscript(n)} to get u${superscript(n+1)}/${n+1}; result: ${fraction(num,den)}.`);break;}
 case 'area':{
  const bound=integer(2,7),num=bound**3;
  set({bound},num,6,`y = ${bound}x ve y = x² eğrileri arasında kalan sonlu bölgenin alanı kaç birimkaredir?`,`Find the area of the bounded region between y = ${bound}x and y = x².`,`A = ∫[0, ${bound}] (${bound}x − x²) dx`,`Kesişimler: x² = ${bound}x ⇒ x = 0, ${bound}. Bu aralıkta doğru üsttedir. A = [${bound}x²/2 − x³/3]₀^${bound} = ${bound}³/6 = ${fraction(num,6)}.`,`Intersections: x² = ${bound}x gives x = 0, ${bound}. The line lies above the parabola on this interval. A = [${bound}x²/2 − x³/3]₀^${bound} = ${bound}³/6 = ${fraction(num,6)}.`);break;}
 default:throw Error('Bu alt konu hazırlanıyor.');
 }
 return QuestionEngine.withChoiceCount({...q,choices:[answer],correct:0,choiceBank:[answer]},count);
}
const formulasFor=id=>id==='general'?catalog.flatMap(topic=>topic.formulas.map(([title,equation,note])=>[topic.label+' · '+title,equation,note])):(catalog.find(topic=>topic.id===id)?.formulas||[]);
UniversityQuestions.topics.Matematik=topics;
UniversityQuestions.subtopics=[mixed,...catalog.flatMap(topic=>subtopicsFor(topic.id).slice(1))];
UniversityQuestions.subtopicsFor=subtopicsFor;
UniversityQuestions.generate=generate;
UniversityQuestions.topicLabel=id=>topics.find(topic=>topic.id===id)?.label||'Genel Matematik 1';
UniversityQuestions.subtopicLabel=id=>UniversityQuestions.subtopics.find(sub=>sub.id===id)?.label||mixed.label;
globalThis.Math1Bank={catalog,topics,subtopicsFor,formulasFor,generate};
})();
