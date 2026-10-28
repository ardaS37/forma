/* Notebook-style worked solutions. Stored steps are plain JSON; rendering uses
   the existing natural-math switch and never opens the solution automatically. */
(() => {
  const S=(title,body='',latex=null)=>({title,body,latex});
  const number=n=>globalThis.ExactMath?ExactMath.textNumber(n):String(n);
  const N=n=>globalThis.ExactMath?ExactMath.latexNumber(n):String(n);
  function tex(expression){try{return ExactMath.rewrite(globalThis.math.parse(String(expression).replace(/\bln\(/g,'log(')).toTex({parenthesis:'auto',implicit:'hide'}),true);}catch{return null;}}
  function pretty(e,variable='x'){const M=globalThis.PracticeMath;try{return ExactMath.rewrite(globalThis.math.simplify(M.ascii(e,variable).replace(/\bln\(/g,'log(')).toTex({parenthesis:'auto',implicit:'hide'}),true);}catch{return M.latex(e,variable);}}
  function final(value,label='Sonucu yazın'){return S(label,'Kesin değer bir kesirse kesir biçiminde korunur.',`=${N(value)}`);}
  function rule(e){
    const M=PracticeMath,a=e.a;
    if(e.op==='add')return['Toplam/fark kuralı',"(u+v)′=u′+v′"];
    if(e.op==='mul')return e.a.op==='c'||e.b.op==='c'?['Sabit çarpan kuralı',"(c*u)′=c*u′"]:['Çarpım kuralı',"(u*v)′=u′*v+u*v′"];
    if(e.op==='div')return['Bölüm kuralı',"(u/v)′=(u′*v−u*v′)/v²; v≠0"];
    if(e.op==='pow')return[a.op==='x'?'Kuvvet kuralı':'Dış kuvvet ve zincir kuralı',"(u^n)′=n*u^(n−1)*u′"];
    if(e.op==='vpow')return['Logaritmik türev',"(u^v)′=u^v*(v′*ln(u)+v*u′/u), u>0"];
    const names={sin:'Sinüs',cos:'Kosinüs',tan:'Tanjant',cot:'Kotanjant',sec:'Sekant',csc:'Kosekant',asin:'Arksinüs',acos:'Arkkosinüs',atan:'Arktanjant',acot:'Arkkotanjant',exp:'Üstel',ln:'Logaritma',lnabs:'Mutlak logaritma'};
    return[(names[e.op]||'Fonksiyon')+' ve zincir kuralı',"Önce dış fonksiyonun türevini alın, sonra iç fonksiyonun türeviyle çarpın."];
  }
  function trace(expression){
    const M=PracticeMath,steps=[],seen=new Set();
    function walk(e){if(!e||e.op==='c'||e.op==='x')return;const key=M.ascii(e);if(seen.has(key))return;seen.add(key);walk(e.a);walk(e.b);const [title,body]=rule(e);steps.push(S(title,body,`\\frac{d}{dx}\\left[${M.latex(e)}\\right]=${pretty(M.derivative(e))}`));}
    walk(expression);return steps;
  }
  function derivative(q,v){
    const M=PracticeMath,steps=[];
    if(v.kind==='partial'||v.kind==='total-differential'||v.kind==='multivariable-linearization'){
      const fx=globalThis.math.derivative(v.f,'x').toString(),fy=globalThis.math.derivative(v.f,'y').toString();
      steps.push(S('Diğer değişkeni sabit tutun','x’e göre türevde y, y’ye göre türevde x sabittir.',`f(x,y)=${tex(v.f)}`));
      steps.push(S('x yönünde kısmi türev','',`f_x=${tex(fx)}`),S('y yönünde kısmi türev','',`f_y=${tex(fy)}`));
      if(v.kind==='partial')steps.push(S('İstenen kısmi türevi yazın',v.axis==='xy'?'f_x ifadesinin y’ye göre türevini alın.':'',`f_{${v.axis}}=${tex(v.answerExpression)}`));
      else if(v.kind==='total-differential')steps.push(S('Diferansiyelleri birleştirin','',`df=\\left(${tex(fx)}\\right)dx+\\left(${tex(fy)}\\right)dy`));
      else steps.push(S('Artışları yerine koyun',`dx=${number(v.h)}, dy=${number(v.k)}; f(x+dx,y+dy)≈f+f_x dx+f_y dy.`,`f(${N(v.x+v.h)},${N(v.y+v.k)})\\approx ${N(v.answer)}`));
      return steps;
    }
    if(v.expression?.op){
      steps.push(S('Verilen fonksiyonu ve koşulları yazın','Paydaların sıfır olmaması, kök ve logaritmaların tanım koşulları korunur.',`f(x)=${M.latex(v.expression)}`));
      if(q.baseTemplate==='simplify-rational-square'){
        const a=q.parameters.a;steps.push(S('İçteki kesri sadeleştirin','x≠0 koşulu korunur.',`\\frac{x^2}{${a}x}=\\frac{x}{${a}}`),S('Dış kuvveti uygulayın','',`f(x)=\\left(\\frac{x}{${a}}\\right)^2=\\frac{x^2}{${a*a}}`),S('Kuvvet kuralıyla türev alın','',`f'(x)=\\frac{2x}{${a*a}}`));
      }else steps.push(...trace(v.expression));
      if(v.kind==='higher'){
        let e=M.derivative(v.expression);for(let n=2;n<=v.order;n++){e=M.derivative(e);steps.push(S(`${n}. türevi alın`,'Önceki türev ifadesine aynı kuralları yeniden uygulayın.',`f^{(${n})}(x)=${pretty(e)}`));}
      }else if(v.kind==='inverse-derivative')steps.push(S('Ters diferansiyel oranını alın','dy/dx≠0 olan dalda çalışın.',`\\frac{dx}{dy}=\\frac{1}{dy/dx}=${pretty(v.answer)}`));
      else if(v.notation==='differential')steps.push(S('dx ile çarpıp diferansiyeli yazın','',`dy=\\left(${pretty(v.answer)}\\right)dx`));
      else if(v.kind==='point')steps.push(S('İstenen noktayı yerine koyun','Önce türev, sonra yerine koyma yapılır.',`f'(${N(v.at)})=${N(v.value)}`));
      else if(v.kind==='tangent'||v.kind==='normal'){
        steps.push(S('Nokta ve eğimi hesaplayın',`f(a)≈${number(v.value)}; ${v.kind==='normal'?'normal eğimi −1/f′(a)':'teğet eğimi f′(a)'}.`),S('Doğru denklemini kurun','Kesin trigonometrik/üstel değerler korunur.',q.solutionLatex||`y-y_0=m(x-a)`));
      }else if(v.kind==='rates')steps.push(S('İvme için bir kez daha türev alın','',`a(t)=${pretty(v.acceleration)}`),S('Zamanı yerine koyun','Birimler: hız m/s, ivme m/s².',`v(${v.at})=${N(v.v)},\\quad a(${v.at})=${N(v.a)}`));
      else if(v.kind==='linearization')steps.push(S('Teğetin nokta ve eğimini bulun','',`f(${N(v.at)})=${N(v.value)},\\quad f'(${N(v.at)})=${N(v.slope)}`),S('Doğrusal modeli kurun','',`L(a+h)=f(a)+hf'(a)`),S('Küçük artışı uygulayın','Bu bir yaklaşık değerdir.',`f(${N(v.at+v.h)})\\approx ${N(v.answer)}`));
      else if(v.kind==='extrema'||v.kind==='monotonicity')steps.push(S('Kritik noktaları belirleyin','f′(x)=0 denklemini çözün ve aralıklardaki türev işaretlerini inceleyin.'),S('Artma/azalma ve ekstremumu yazın',q.solution));
      else if(!['higher','inverse-derivative'].includes(v.kind))steps.push(S('Son ifadeyi düzenleyin','Gereksiz parantezleri kaldırın; tanım koşullarını koruyun.',`f'(x)=${pretty(v.answer||M.derivative(v.expression))}`));
      return steps;
    }
    if(v.kind==='optimization'||v.kind==='optimization-loss'){
      const p=v.p;steps.push(S('Çevreden kenar ilişkisini kurun','İki kenarı x ve y seçin.',`2(x+y)=${2*p}\\;\\Rightarrow\\;y=${p}-x`),S('Alan fonksiyonunu kurun','Pozitif kenarlar için 0<x<'+p+'.',`A(x)=x(${p}-x)=${p}x-x^2`),S('Kritik noktayı bulun','',`A'(x)=${p}-2x=0\\;\\Rightarrow\\;x=${N(p/2)}`),S('Maksimumu doğrulayın','A″(x)=−2<0. Kenarlar eşit olur.',`A_{max}=${N(p*p/4)}`));if(v.h)steps.push(S('Optimal değerden sapmayı hesaplayın','',`\\Delta A=h^2=${N(v.answer)}`));return steps;
    }
    if(v.kind==='implicit'||v.kind==='implicit-linearization')return[S('y’yi x’e bağlı düşünün','y²’nin türevi 2y·dy/dx olur.'),S('İki tarafın türevini alın','',`2x+${2*v.k}y\\frac{dy}{dx}=0`),S('dy/dx ifadesini yalnız bırakın','y≠0 dalında.',`\\frac{dy}{dx}=-\\frac{x}{${v.k}y}`),...(v.answer!==undefined?[S('Doğrusal yaklaşımı uygulayın','',`y(${N(v.at+v.h)})\\approx ${N(v.answer)}`)]:[])];
    if(v.kind==='parametric'||v.kind==='parametric-linearization')return[S('Parametreye göre ayrı türev alın','',`\\frac{dx}{dt}=${pretty(M.derivative(v.x),'t')},\\quad\\frac{dy}{dt}=${pretty(M.derivative(v.y),'t')}`),S('Diferansiyel oranlarını bölün','dx/dt≠0.',`\\frac{dy}{dx}=\\frac{dy/dt}{dx/dt}`),S('Sonucu yazın',q.solution)];
    if(v.kind==='corner'||v.kind==='corner-linearization')return[S('Mutlak değeri iki tarafta açın',`x<${v.at}: f=−${v.scale}(x−${v.at}); x>${v.at}: f=${v.scale}(x−${v.at}).`),S('Tek taraflı türevleri karşılaştırın','',`f'_-=-${v.scale},\\quad f'_+=${v.scale}`),S('Türevlenebilirliği değerlendirin','Eğimler farklı; birleşme noktasında türev ve tek doğrusal yaklaşım yoktur.')];
    if(v.kind==='match'||v.kind==='matched-linearization')return[S('Süreklilik denklemini kurun','',`${v.scale*v.at*v.at}=${v.at}A+B`),S('Tek taraflı türevleri eşitleyin','',`A=${2*v.scale*v.at}`),S('Sabitleri bulun','',`A=${v.A},\\quad B=${v.B}`),...(v.answer!==undefined?[S('Doğrusal yaklaşım','',`f(a+h)\\approx ${N(v.answer)}`)]:[])];
    return null;
  }
  function integral(q,v){
    const M=PracticeMath;
    if(v.kind==='leibniz'||v.kind==='expression-transfer'){
      if(v.kind==='expression-transfer')return[S('Önce ilk türevi elde edin','İntegrale Leibniz kuralını uygulayın.'),S('Bir kez daha türev alın','',`H''(x)=${tex(v.expression)}`)];
      return[S('İntegrand ve sınırları ayırın',`f(x,t)=${v.integrand}; a(x)=${v.lower}; b(x)=${v.upper}.`),S('Sınır katkılarını hesaplayın','Üst sınır katkısından alt sınır katkısı çıkarılır.',`f(x,b)b'-f(x,a)a'=${tex(v.boundary)}`),S('İçerideki kısmi türevi alın','t’ye göre integre ederken x parametresine göre türev alınır.',`\\partial_x f=${tex(v.inside)}`),...(v.order===2?[S('İlk türevi birleştirin','Sınır katkıları ile iç kısmi türevin integralini toplayın.',`H'(x)=${tex(v.firstDerivative)}`),S('Bir kez daha türev alın','İlk türeve aynı türev kurallarını uygulayın.')]:[]),S('Leibniz terimlerini birleştirin','Süreklilik ve türevlenebilirlik koşulları sağlanan aralıkta.',`H^{(${v.order||1})}(x)=${tex(v.answerExpression)}`)];
    }
    if(['double','double-region','double-polar','triple'].includes(v.kind)){
      const steps=[S('Bölgeyi ve entegrasyon sırasını belirleyin',q.eq,q.eqLatex)];
      if(v.kind==='double-polar')steps.push(S('Kutupsal dönüşüm ve Jacobian','',`x=r\\cos\\theta,\\;y=r\\sin\\theta,\\;dA=r\\,dr\\,d\\theta`),S('İntegrandı ve sınırları dönüştürün','Jacobianın getirdiği r çarpanını unutmayın.',`I=\\int_0^{${N(v.angle)}}\\int_{${v.inner}}^{${v.A}}${v.coefficient}r^{${2*v.n+1}}\\,dr\\,d\\theta`));
      else if(v.kind==='double-region')steps.push(S('Bölgeyi ters sırada da yazın',`0≤y≤${v.A}, y≤x≤${v.A}.`),S('İç integrali alın','',`\\int_0^x ${v.coefficient}x^{${v.m}}y^{${v.n}}dy=\\frac{${v.coefficient}x^{${v.m+v.n+1}}}{${v.n+1}}`));
      else steps.push(S('En iç değişkene göre integral alın','Diğer değişkenleri sabit tutun; kuvvet kuralını uygulayın.'),S('Kalan değişkenlere sırayla geçin','Her aşamada iç değişkenin alt/üst sınırlarını yerleştirin.'));
      steps.push(S('Dış sınırları uygulayın','',`I=${N(v.value)}`));return steps;
    }
    if(v.kind==='variable-bound')return[S('Üst sınırı ayırın','',`u(x)=${M.latex(v.upper)}`),S('İntegrandda üst sınırı yerine koyun','',`f(u(x))=${M.latex(substitute(v.f,v.upper))}`),S('Üst sınırın türevini alın','',`u'(x)=${pretty(M.derivative(v.upper))}`),S('Temel teorem ve zincir kuralını birleştirin','İntegrandın ilgili aralıkta sürekli olması gerekir.',`H'(x)=${pretty(v.answer)}`)];
    if(v.f&&v.F){
      const primitive=v.kind==='initial'&&v.F.op==='add'?v.F.a:v.F,steps=[];
      if(v.differential)steps.push(S('Diferansiyeli dx cinsine çevirin','d(g(x))=g′(x)dx.',`d(${M.latex(v.differential)})=${pretty(M.derivative(v.differential))}\\,dx`));
      steps.push(S('Yöntemi seçin',q.requiredTopics.includes('parts')?'∫u dv=u·v−∫v du kuralını kullanın.':q.requiredTopics.includes('substitution')?'İç ifadeyi u seçin ve du ile dx arasındaki bağıntıyı yazın.':'Kuvvet ve temel asal fonksiyon kurallarını uygulayın.'),S('Asal fonksiyonu elde edin','',`F_0(x)=${pretty(primitive)}`));
      if(v.kind==='antiderivative')steps.push(S('Türev alarak kontrol edin','',`F_0'(x)=${pretty(M.derivative(v.F))}`),S('İntegrasyon sabitini ekleyin','',`\\int f(x)dx=${pretty(v.F)}+C`));
      else if(v.kind==='initial')steps.push(S('Başlangıç koşulunu kullanın',`F(${v.at})=${v.target}; C=F(${v.at})−F_0(${v.at}).`),S('Sabitin bulunduğu sonucu yazın','',`F(x)=${pretty(v.F)}`));
      else{
        const upper=M.evaluate(v.F,v.hi),lower=M.evaluate(v.F,v.lo);
        steps.push(S('Üst ve alt sınırları ayrı hesaplayın','',`F(${N(v.hi)})=${N(upper)},\\quad F(${N(v.lo)})=${N(lower)}`),S('Üst değerden alt değeri çıkarın','',`\\int_{${N(v.lo)}}^{${N(v.hi)}} f(x)dx=F(b)-F(a)`));
        if(v.kind==='volume')steps.push(S('Hacim çarpanını uygulayın','Disk/pul yöntemi için π ile çarpın.'));
        if(v.kind==='average')steps.push(S('Aralık uzunluğuna bölün',`b−a=${number(v.hi-v.lo)}.`));
        steps.push(final(v.value));
      }
      return steps;
    }
    if(v.kind==='fundamental')return[S('Üst sınırı belirleyin','',`u(x)=${M.latex(v.bound)}`),S('Temel teoremi uygulayın','F′(x)=f(u(x))*u′(x).'),S('İç türevle çarpın','',`F'(x)=${pretty(v.answer)}`)];
    if(v.kind==='numeric-transfer')return[S('Kesilmiş veya parametreli integrali yazın','Önce integralin parametreye bağlı kapalı ifadesini bulun.'),S('İstenen koşulu uygulayın',q.solution),final(v.answer)];
    if(v.kind==='divergence-scaling')return[S('Üst sınırı sonlu R seçin','Önce kesilmiş integrali hesaplayın.'),S('Pozitif sabit çarpanını ayırın','Sabit çarpanı ıraksamayı kaldırmaz.'),S('Limiti değerlendirin','Logaritmik terim +∞ büyür; integral ıraksar.')];
    if(v.kind==='improper')return[S('Tekil veya sonsuz sınırı geçici olarak kesin','Alt uç için ε>0, üst uç için sonlu R kullanın.'),S('Sonlu integralin asal fonksiyonunu değerlendirin',q.solution),S('Limit alın ve yakınsaklığı yazın',v.converges?'Limit sonludur.':'Limit sonlu değildir; integral ıraksar.',v.converges?`I=${N(v.value)}`:'I\\to+\\infty')];
    return null;
  }
  const substitute=(e,u)=>e.op==='x'?u:{...e,...(e.a?{a:substitute(e.a,u)}:{}),...(e.b?{b:substitute(e.b,u)}:{})};
  function limits(q,v){
    if(v.original){const baseSteps=limits({...q,verification:v.original},v.original);return[...baseSteps,S('Dış dönüşümü uygulayın',v.outer==='square'?'Tek taraflı limitlerin karelerini ayrı karşılaştırın.':`aL+b dönüşümünü uygulayın; a=${v.multiplier}, b=${v.shift}.`),S('Yeni sonucu yazın',q.solution)];}
    const steps=[S('Yaklaşım yönünü ve tanım koşulunu belirleyin',`x→${v.point=== 'inf'?'∞':v.point==='-inf'?'−∞':v.point}${v.side==='left'?'−':v.side==='right'?'+':''}.`)];
    steps.push(S('Belirsizliği veya sürekliliği değerlendirin',v.tr||'Sağ ve sol parçaları ayrı inceleyin.'));
    if(v.result==='parameter')steps.push(S('Sağ ve sol değeri eşitleyin','',`${v.coeff*v.point+v.constant}=k\\cdot${v.point}+${v.offset}`),S('Parametreyi çözün','',`k=${N(v.value)}`));
    else if(v.piecewise)steps.push(S('Tek taraflı limitleri hesaplayın','',`L_-=${N(v.left)},\\quad L_+=${N(v.right)}`),S('Karşılaştırın',v.result==='finite'?'İki değer eşittir; ortak değer limittir.':'Değerler farklı; iki taraflı limit yoktur.'));
    else if(v.result==='finite'||v.result==='fill')steps.push(S(v.result==='fill'?'Sürekli tamamlayan değeri seçin':'Sadeleşmiş ifadede yerine koyun','',`L=${N(v.value)}`));
    else if(v.result==='infinity')steps.push(S('İşaret ve büyüklüğü izleyin','Sonuç sonlu sayı değildir.',`L\\to${v.sign>0?'+':'-'}\\infty`));
    else steps.push(S('İki yaklaşımı karşılaştırın',v.oscillation?'Aynı noktaya giden iki dizide farklı görüntü limitleri vardır.':'Sağ ve sol limitler farklıdır; iki taraflı limit yoktur.'));
    return steps;
  }
  function trigonometry(q,v){
    if(v.kind==='paired'){
      return[S('I. durumu çözün','',tex(v.first.expression)),v.first.exactExpression?S('I. durumun sonucu','',tex(v.first.exactExpression)):final(v.first.answer,'I. durumun sonucu'),S('II. durumu çözün','',tex(v.second.expression)),v.second.exactExpression?S('II. durumun sonucu','',tex(v.second.exactExpression)):final(v.second.answer,'II. durumun sonucu'),S('İstenen farkı alın','',v.first.exactExpression&&v.second.exactExpression?tex(globalThis.math.simplify(`(${v.first.exactExpression})-(${v.second.exactExpression})`,{exactFractions:true,fractionsLimit:1e12}).toString()):`${N(v.first.answer)}-(${N(v.second.answer)})=${N(v.answer)}`)];
    }
    if(v.kind==='numeric'||v.kind==='identity-evaluation'){
      const topic=practiceTopic(q),steps=[S('Verilenleri ve açı birimini belirleyin',q.eq,q.eqLatex||null),S('Gerekli bağıntıyı seçin',topic?.formulas?.[0]?.expression||topic?.formula||'Esas değer aralığını ve bölge işaretini kullanın.')];
      if(v.kind==='identity-evaluation')steps.push(S('Açıyı yerine koyun',`x=${v.at}°.`));
      steps.push(S('Verileri bağıntıya yerleştirin','',tex(v.expression)),v.exactExpression?S('Kesin katsayıyı yazın','',tex(v.exactExpression)):final(v.answer));return steps;
    }
    if(['equation','square-equation','residual-equation','domain'].includes(v.kind)){
      const steps=[S('Çözüm aralığını ve tanım koşullarını yazın',`${v.lo??0}°≤x<${v.hi??360}°. Sağ uç dahil değildir.`)];
      if(v.kind==='domain')steps.push(S('Paydayı sıfıra eşitleyin','',`${v.op==='cos'?'\\cos':'\\sin'} x=0`));
      else if(v.kind==='square-equation')steps.push(S('İki işareti de alın','',`${v.op==='sin'?'\\sin':'\\cos'} x=\\pm ${N(v.target)}`));
      else if(v.kind==='residual-equation')steps.push(S('Çarpanlara ayırın',q.baseTemplate==='equation-double-sine'?'sinx*(2cosx−1)=0.':'(2cosx+1)(cosx−1)=0.'));
      else{
        const a=(v.op==='sin'?Math.asin(v.target):v.op==='cos'?Math.acos(v.target):Math.atan(v.target))*180/Math.PI;
        steps.push(S('Esas açıyı bulun','',`\\alpha\\approx ${N(a)}^{\\circ}`),S('Bütün çözüm ailelerini kurun',v.op==='sin'?'θ=α+360k veya θ=180°−α+360k.':v.op==='cos'?'θ=±α+360k.':'θ=α+180k.'),S('İç açıyı çözün',`${v.k}x+${number(v.phase)}°=θ. x=(θ−${number(v.phase)})/${v.k}.`));
      }
      steps.push(S('Aralıkta kalan çözümleri seçin','Tekrarlı kökleri bir kez yazın.',`\\{${v.roots.map(x=>N(x)+'^{\\circ}').join(',')}\\}`));return steps;
    }
    if(v.kind==='inequality')return[S('Sınır açılarını bulun','Önce eşitlik durumunu çözün.'),S('Aralıklardan test noktası seçin',q.solution.split('\nSonuç:')[0]),S('Açık/kapalı uçları koruyun','Tanım dışı kutuplar hiçbir zaman dahil edilmez.'),S('Çözüm kümesini yazın',v.intervals.map(([a,b,l,r])=>`${l?'[':'('}${a}°,${b}°${r?']':')'}`).join(' ∪ '))];
    if(v.kind==='undefined')return[S('Oranı sinüs ve kosinüsle yazın','tanθ=sinθ/cosθ.'),S('Paydayı hesaplayın','',tex(v.denominator)+'=0'),S('Tanım koşulunu uygulayın','Sıfıra bölme tanımsızdır.')];
    if(v.kind==='identity')return[S('Ortak tanım kümesini belirleyin','Paydaları sıfır yapan açıları dışlayın.'),S('Sol tarafı açın','Toplam/fark ve temel özdeşlikleri uygulayın.',tex(v.left)),S('Çarpanlara ayırıp düzenleyin',q.solution.split('\nSonuç:')[0]),S('Sağ tarafı elde edin','İşlemler ortak tanım kümesinde geçerlidir.',tex(v.right))];
    return null;
  }
  function practiceTopic(q){const bank=globalThis.PracticeBanks?.[q.program]||globalThis.TrigonometryBank;return bank?.topics.find(t=>t.id===q.topicId);}
  function build(q){
    const v=q.verification||{};
    if(v.kind==='review'){
      const inner=build({...q,verification:v.base,taskStyle:'base'});return[S('Öğrencinin iddiasını ayırın',v.claim),...inner,...(globalThis.LimitProofs?.reviewSteps(v)||[]),S('İddiayı değerlendirin',v.correct?'Önerilen sonuç doğrudur.':'Önerilen sonuç yanlıştır; yukarıdaki adımlar doğru sonucu verir.')];
    }
    const proof=globalThis.LimitProofs?.steps(q,v);if(proof)return proof;
    const advanced=globalThis.MultivariablePractice?.steps(q,v);if(advanced)return advanced;
    const graphical=globalThis.GraphPractice?.steps(q,v);if(graphical)return graphical;
    let result=q.program==='derivatives'?derivative(q,v):q.program==='integrals'?integral(q,v):q.program==='limits'?limits(q,v):trigonometry(q,v);
    if(!result?.length)result=[S('Verilenleri yazın',q.eq,q.eqLatex),S('Bağıntıyı uygulayın',q.solution),S('Sonucu kontrol edin','Tanım koşullarını ve birimleri doğrulayın.')];
    return result;
  }
  function render(node,q,enabled,language){
    node.replaceChildren();const steps=q.solutionSteps||build(q),list=document.createElement('ol');list.className='solution-steps';
    for(const [i,step]of steps.entries()){
      const item=document.createElement('li'),heading=document.createElement('h4');heading.textContent=(i+1)+(language==='en'?'. Step · ':'. adım · ')+step.title;item.append(heading);
      if(step.body){const body=document.createElement('p');QuestionMath.render(body,step.body,enabled);item.append(body);}
      if(step.latex){const equation=document.createElement('div');equation.className='solution-step-equation';QuestionMath.render(equation,step.body||step.latex,enabled,'\\displaystyle '+step.latex);item.append(equation);}
      list.append(item);
    }
    node.append(list);
  }
  function sanitize(q){let v=q.verification;while(v?.kind==='review')v=v.base;if(v?.kind==='optimization'){q.eq=`Çevre = ${2*v.p} birim`;q.eqLatex=`P=${2*v.p}`;}if(q.diagram&&/^graph-(sin|cos)-/.test(q.baseTemplate||q.template||'')){q.eq='Yatay eksen derece cinsindedir.';q.eqLatex=null;}}
  globalThis.SolutionSteps={build,render,tex,pretty,sanitize};
})();
