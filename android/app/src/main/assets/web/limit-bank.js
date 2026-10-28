/* Explicit limit families with one-sided and divergent outcomes kept distinct. */
(() => {
  'use strict';
  const M=PracticeMath,{C,X,add,mul,sub,div,pow,fn,variablePower,evaluate,ascii,latex}=M;
  const topics=[
    ['direct','Doğrudan yerine koyma','Direct substitution','Sürekli fonksiyonlarda lim_(x→a) f(x) = f(a).'],
    ['polynomial','Polinom limitleri','Polynomial limits','Polinomlar her gerçek noktada süreklidir.'],
    ['rational','Rasyonel fonksiyonlar','Rational functions','Paydanın limiti sıfır değilse limitler bölünür.'],
    ['factorization','Çarpanlara ayırma ve sadeleştirme','Factoring and cancellation','x^2−a^2 = (x−a)*(x+a)'],
    ['radical','Köklü ifadeler ve eşlenik','Radicals and conjugates','sqrt(u)−sqrt(v) = (u−v)/(sqrt(u)+sqrt(v))'],
    ['infinity','Sonsuzda limit','Limits at infinity','Rasyonel ifadelerde en yüksek kuvvetleri karşılaştırın.'],
    ['trig','Trigonometrik limitler','Trigonometric limits','lim_(x→0) sin(x)/x = 1; radyan'],
    ['exponential','Üstel limitler','Exponential limits','lim_(x→0) (exp(x)−1)/x = 1'],
    ['logarithm','Logaritmik limitler','Logarithmic limits','lim_(x→0) ln(1+x)/x = 1'],
    ['onesided','Sağdan ve soldan limit','One-sided limits','İki taraflı limit için sağ ve sol limit aynı olmalıdır.'],
    ['absolute','Mutlak değer','Absolute values','|x| = x (x≥0); |x| = −x (x<0)'],
    ['piecewise','Parçalı fonksiyonlar','Piecewise functions','Sağ ve sol parçanın limitlerini ayrı hesaplayın.'],
    ['continuity','Süreklilik ve parametre','Continuity and parameters','Süreklilik: sol limit = sağ limit = f(a).'],
    ['squeeze','Sıkıştırma ve salınım','Squeeze theorem and oscillation','|sin(x)|≤1 ile sınırlandırın; farklı alt diziler limiti engeller.'],
    ['standard','1^∞ biçimi ve standart limit','Indeterminate powers and standard limits','lim_(x→∞) (1+a/x)^(b*x) = exp(a*b)'],
    ['infinite','Sonsuz limit sonuçları','Infinite limit results','Limit sonucu +∞ veya −∞ olabilir.'],
    ['trig-standard','Özel trigonometrik limitler','Special trigonometric limits','sin(x)/x → 1; (1−cos(x))/x^2 → 1/2'],
    ['exp-standard','Özel üstel limitler','Special exponential limits','(exp(x)−1)/x → 1'],
    ['log-standard','Özel logaritmik limitler','Special logarithmic limits','ln(1+x)/x → 1'],
    ['inverse','Ters trigonometrik limitler','Inverse trigonometric limits','atan(x)/x → 1'],
    ['lhopital','L’Hôpital ve yüksek mertebe','L’Hôpital and higher-order limits','Yalnız 0/0 veya ∞/∞ biçiminde ve teorem koşullarıyla pay/payda türevleri alınır.']
  ].map(([id,label,en,formula])=>({id,label,en,formula}));
  const defaults=topics.map(t=>t.id),normalize=value=>Array.isArray(value)?defaults.filter(id=>value.includes(id)):defaults.slice(),templates=[];
  const scale=(a,f)=>mul(C(a),f),lin=(a,b)=>add(scale(a,X),C(b));
  const register=(id,required,build)=>templates.push({id,required,build});
  const finite=(f,point,value,tr,en,side='both')=>({f,point,value,result:'finite',tr,en,side});
  const infinite=(f,point,sign,tr,en,side='both')=>({f,point,sign,result:'infinity',tr,en,side});
  for(let n=1;n<=5;n++)register('polynomial-'+n,['direct','polynomial'],c=>finite(add(scale(c.a,pow(X,n)),C(c.b)),c.s,c.a*c.s**n+c.b,'Polinom süreklidir; x yerine yaklaşım noktası yazılır.','A polynomial is continuous, so substitute the limiting point.'));
  register('rational-direct',['direct','rational'],c=>finite(div(lin(c.a,c.b),add(pow(X,2),C(c.b))),c.s,(c.a*c.s+c.b)/(c.s*c.s+c.b),'Paydanın değeri pozitif; doğrudan yerine koyulur.','The denominator is positive, so substitute directly.'));
  register('linear-ratio',['direct','rational'],c=>finite(div(lin(c.a,c.b),lin(c.b,c.a)),c.s,(c.a*c.s+c.b)/(c.b*c.s+c.a),'Payda sıfır değildir; pay ve paydanın limitleri bölünür.','The denominator is nonzero, so take the ratio of the limits.'));
  for(let n=2;n<=6;n++)register('power-cancellation-'+n,['factorization','polynomial'],c=>finite(div(sub(pow(X,n),C(c.s**n)),sub(X,C(c.s))),c.s,n*c.s**(n-1),`x^${n} − ${c.s}^${n} ifadesinden x − ${c.s} çarpanı ayrılır. Kalan ${n} terimin her biri ${c.s}^${n-1} değerine gider.`,`Factor x-${c.s} from the difference of powers. The remaining ${n} terms each tend to ${c.s**(n-1)}.`));
  register('cubic-over-quadratic',['factorization','rational'],c=>finite(div(sub(pow(X,3),C(c.s**3)),sub(pow(X,2),C(c.s**2))),c.s,3*c.s/2,'Ortak x−a çarpanı sadeleşir; (x²+ax+a²)/(x+a) kalır.','Cancel x-a, leaving (x²+ax+a²)/(x+a).'));
  register('quadratic-factor',['factorization','rational'],c=>finite(div(add(sub(pow(X,2),scale(c.s+c.a,X)),C(c.s*c.a)),sub(X,C(c.s))),c.s,c.s-c.a,'Pay (x−a)(x−b) biçiminde çarpanlara ayrılır; sıfır yapan ortak çarpan sadeleşir.','Factor the quadratic and cancel the common vanishing factor.'));
  register('radical-zero',['radical'],c=>finite(div(sub(pow(add(X,C(c.s*c.s)),.5),C(c.s)),X),0,1/(2*c.s),'Eşlenikle çarpınca 1/(sqrt(x+a²)+a) kalır.','Multiply by the conjugate, leaving 1/(sqrt(x+a²)+a).'));
  register('radical-shift',['radical'],c=>finite(div(sub(pow(X,.5),C(c.s)),sub(X,C(c.s*c.s))),c.s*c.s,1/(2*c.s),'x−a² = (sqrt(x)−a)(sqrt(x)+a) ile sadeleştirin.','Use x-a²=(sqrt(x)-a)(sqrt(x)+a) and cancel.'));
  register('two-radicals',['radical'],c=>finite(div(sub(pow(add(scale(c.a,X),C(c.s*c.s)),.5),C(c.s)),X),0,c.a/(2*c.s),'Eşlenikle genişletin; paydaki x çarpanını sadeleştirin.','Multiply by the conjugate and cancel x.'));
  register('radical-infinity',['radical','infinity'],c=>finite(sub(pow(add(pow(X,2),scale(c.a,X)),.5),X),'inf',c.a/2,'Eşlenikle çarpıp paydayı x’e bölün: a/(sqrt(1+a/x)+1) → a/2.','Rationalize and divide by x: a/(sqrt(1+a/x)+1) tends to a/2.'));
  register('radical-negative-infinity',['radical','infinity'],c=>infinite(sub(pow(add(pow(X,2),C(c.a)),.5),X),'-inf',1,'Negatif x için sqrt(x²+a) yaklaşık −x olur; fark yaklaşık −2x olup +∞ gider.','For negative x, the square root behaves like -x, so the difference grows like -2x.'));
  for(const direction of ['inf','-inf']){
    register('equal-degrees-'+direction,['rational','infinity'],c=>finite(div(add(scale(c.a,pow(X,2)),C(c.b)),add(scale(c.b,pow(X,2)),C(c.a))),direction,c.a/c.b,'Pay ve paydayı x²’ye bölün; alt dereceli terimler sıfıra gider.','Divide numerator and denominator by x²; lower-order terms vanish.'));
    register('lower-degree-'+direction,['rational','infinity'],c=>finite(div(lin(c.a,c.b),add(pow(X,2),C(c.a))),direction,0,'Payın derecesi paydadan küçüktür; en büyük paydaya göre ölçekleyince sıfır kalır.','The numerator has lower degree, so the ratio tends to zero.'));
    register('higher-degree-'+direction,['rational','infinity'],c=>infinite(div(add(scale(c.a,pow(X,3)),C(c.b)),add(pow(X,2),C(c.a))),direction,direction==='inf'?1:-1,'En büyük kuvvetlerin oranı a*x gibi davranır; işareti yaklaşım yönü belirler.','The ratio behaves like a*x; the direction determines its sign.'));
  }
  register('sin-over-x',['trig','trig-standard'],c=>finite(div(fn('sin',scale(c.a,X)),X),0,c.a,'u=a*x dönüşümü ve sin(u)/u → 1 kullanılır.','Set u=a*x and use sin(u)/u → 1.'));
  register('tan-over-x',['trig','trig-standard'],c=>finite(div(fn('tan',scale(c.a,X)),X),0,c.a,'tan(u)/u = (sin(u)/u)/cos(u) → 1.','Use tan(u)/u=(sin(u)/u)/cos(u) → 1.'));
  register('sin-over-sin',['trig','trig-standard'],c=>finite(div(fn('sin',scale(c.a,X)),fn('sin',scale(c.b,X))),0,c.a/c.b,'Her sinüs kendi iç açısına bölünüp standart limite indirgenir.','Divide each sine by its argument and use the standard limit.'));
  register('one-minus-cos',['trig','trig-standard'],c=>finite(div(sub(C(1),fn('cos',scale(c.a,X))),pow(X,2)),0,c.a*c.a/2,'1−cos(u)=2*sin²(u/2) özdeşliğiyle standart sinüs limiti uygulanır.','Use 1-cos(u)=2*sin²(u/2) and the sine limit.'));
  register('sin-linear-shift',['trig','trig-standard'],c=>finite(div(fn('sin',scale(c.a,sub(X,C(c.s)))),sub(X,C(c.s))),c.s,c.a,'u = x−a dönüşümüyle sin(k*u)/u biçimine geçilir.','Set u=x-a to obtain sin(k*u)/u.'));
  register('cos-direct',['trig','direct'],c=>finite(fn('cos',scale(c.a,X)),0,1,'Kosinüs sıfırda süreklidir.','Cosine is continuous at zero.'));
  register('sin-infinity-over-x',['trig','squeeze','infinity'],c=>finite(div(fn('sin',scale(c.a,X)),X),'inf',0,'Mutlak değer 1/x ile sınırlıdır; sıkıştırma teoremi limitin sıfır olduğunu verir.','The absolute value is bounded by 1/x, so the squeeze theorem gives zero.'));
  register('exp-zero',['exponential','exp-standard'],c=>finite(div(sub(fn('exp',scale(c.a,X)),C(1)),X),0,c.a,'u=a*x ile (exp(u)−1)/u → 1 kullanılır.','Set u=a*x and use (exp(u)-1)/u → 1.'));
  register('base-exp-zero',['exponential','exp-standard'],c=>finite(div(sub(variablePower(C(c.a),X),C(1)),X),0,Math.log(c.a),'a^x=exp(x*ln(a)) yazılır; standart üstel limit uygulanır.','Write a^x=exp(x*ln(a)) and use the exponential limit.'));
  register('exp-direct',['exponential','direct'],c=>finite(fn('exp',lin(c.a,c.b)),0,Math.exp(c.b),'Üstel fonksiyon süreklidir; doğrudan yerine koyulur.','The exponential is continuous; substitute directly.'));
  register('exp-decay',['exponential','infinity'],c=>finite(fn('exp',scale(-c.a,X)),'inf',0,'Pozitif a için −a*x → −∞; üstel fonksiyon sıfıra gider.','For positive a, -a*x tends to negative infinity and the exponential tends to zero.'));
  register('exp-growth',['exponential','infinity'],c=>infinite(fn('exp',scale(c.a,X)),'inf',1,'Pozitif katsayılı üstel fonksiyon sınırsız büyür.','The exponential with positive coefficient grows without bound.'));
  register('exp-ratio',['exponential','infinity'],c=>finite(div(fn('exp',scale(c.a,X)),fn('exp',scale(c.a+1,X))),'inf',0,'Üstel ifadeleri birleştirince exp(−x) kalır.','Combine the powers to obtain exp(-x).'));
  register('log-standard',['logarithm','log-standard'],c=>finite(div(fn('ln',add(C(1),scale(c.a,X))),X),0,c.a,'u=a*x ile ln(1+u)/u → 1 kullanılır.','Set u=a*x and use ln(1+u)/u → 1.'));
  register('log-direct',['logarithm','direct'],c=>finite(fn('ln',add(X,C(c.a))),0,Math.log(c.a),'Logaritmanın içi pozitif; süreklilik kullanılır.','The logarithm argument is positive, so use continuity.'));
  register('log-infinity',['logarithm','infinity'],c=>infinite(fn('ln',X),'inf',1,'Doğal logaritma yavaş da olsa sınırsız büyür.','The natural logarithm grows without bound.'));
  register('log-zero',['logarithm','onesided','infinite'],c=>infinite(fn('ln',X),0,-1,'x pozitif taraftan sıfıra giderken doğal logaritma −∞ gider.','As positive x tends to zero, its logarithm tends to negative infinity.','right'));
  register('x-log-x',['logarithm','lhopital','onesided'],c=>finite(mul(X,fn('ln',X)),0,0,'ln(x)/(1/x) biçiminde −∞/∞ durumu vardır. Türevlerin oranı −x → 0 olur.','Write ln(x)/(1/x), an infinite-over-infinite form. The derivative ratio is -x → 0.','right'));
  register('log-over-x',['logarithm','lhopital','infinity'],c=>finite(div(fn('ln',X),X),'inf',0,'∞/∞ biçiminde L’Hôpital uygulanır; türevlerin oranı 1/x → 0.','Apply L’Hôpital to the infinity-over-infinity form: the derivative ratio is 1/x → 0.'));
  for(const [side,sign] of [['left',-1],['right',1]]){
    register('pole-'+side,['onesided','rational','infinite'],c=>infinite(div(C(c.a),sub(X,C(c.s))),c.s,sign,'Pay pozitiftir; payda seçilen taraftan sıfıra yaklaşır. Paydanın işareti sonsuz limitin işaretidir.','The positive numerator is divided by a denominator approaching zero with the indicated sign.',side));
    register('squared-pole-'+side,['onesided','rational','infinite'],c=>infinite(div(C(c.a),pow(sub(X,C(c.s)),2)),c.s,1,'Payda iki tarafta da pozitif ve sıfıra gider; oran +∞ büyür.','The denominator is positive and tends to zero, so the ratio tends to positive infinity.',side));
    register('absolute-ratio-'+side,['absolute','onesided'],c=>finite(div(fn('abs',sub(X,C(c.s))),sub(X,C(c.s))),c.s,sign,'Mutlak değeri yaklaşım yönündeki işaretle açın.','Expand the absolute value using the sign on the indicated side.',side));
  }
  register('pole-two-sided',['onesided','rational','infinite'],c=>({f:div(C(c.a),sub(X,C(c.s))),point:c.s,result:'dne',side:'both',left:-Infinity,right:Infinity,tr:'Soldan −∞, sağdan +∞. Tek bir iki taraflı limit yoktur.',en:'The left limit is -∞ and the right limit is +∞. The two-sided limit does not exist.'}));
  register('absolute-two-sided',['absolute','onesided'],c=>({f:div(fn('abs',sub(X,C(c.s))),sub(X,C(c.s))),point:c.s,result:'dne',side:'both',left:-1,right:1,tr:'Soldan −1, sağdan +1. Farklı oldukları için iki taraflı limit yoktur.',en:'The left limit is -1 and the right limit is +1, so the two-sided limit does not exist.'}));
  register('absolute-at-zero',['absolute','direct'],c=>finite(fn('abs',scale(c.a,X)),0,0,'Mutlak değer süreklidir; sağ ve sol limit sıfırdır.','Absolute value is continuous; both one-sided limits are zero.'));
  for(const direction of ['inf','-inf'])register('absolute-at-'+direction,['absolute','infinity'],c=>finite(div(fn('abs',X),X),direction,direction==='inf'?1:-1,'Sonsuza gidilen tarafta x’in işareti sabittir; mutlak değeri bu işarete göre açın.','Expand the absolute value using the eventual sign of x.'));
  for(const kind of ['matching','jump','point-value'])register('piecewise-'+kind,['piecewise'],c=>{
    const left=lin(c.a,c.b),leftLimit=c.a*c.s+c.b,offset=kind==='jump'?c.k:0,right=lin(c.a+1,c.b-c.s+offset),rightLimit=leftLimit+offset;
    return {point:c.s,side:'both',piecewise:{left,right,at:kind==='point-value'?leftLimit+c.k:leftLimit},left:leftLimit,right:rightLimit,value:offset?null:leftLimit,result:offset?'dne':'finite',tr:offset?'Sağ ve sol parçalardaki limitler farklıdır; iki taraflı limit yoktur.':'Sağ ve sol limitler eşittir. Noktadaki fonksiyon değeri limitin değerini değiştirmez.',en:offset?'The one-sided limits differ, so the two-sided limit does not exist.':'The one-sided limits agree. The function value at the point does not affect the limit.'};
  });
  register('continuity-parameter',['continuity','piecewise'],c=>({point:c.s,side:'both',result:'parameter',value:(c.a*c.s+c.b-c.k)/c.s,coeff:c.a,constant:c.b,offset:c.k,tr:'Süreklilik için iki parçanın yaklaşım noktasındaki değerleri eşitlenir.',en:'For continuity, equate the two branch values at the joining point.'}));
  register('removable-value',['continuity','factorization'],c=>({f:div(sub(pow(X,2),C(c.s*c.s)),sub(X,C(c.s))),point:c.s,side:'both',result:'fill',value:2*c.s,tr:'x≠a için ifade x+a olur; limiti 2a’dır. Süreklilik için nokta değeri bu limite eşit seçilir.',en:'Away from x=a, the expression is x+a and its limit is 2a. Fill the point with this limit.'}));
  register('squeeze-square',['squeeze','trig'],c=>finite(mul(pow(X,2),fn('sin',div(C(c.a),X))),0,0,'Mutlak değer x² ile sınırlıdır. −x² ≤ f(x) ≤ x² ve her iki sınır sıfıra gider.','The function lies between -x² and x², so the squeeze theorem gives zero.'));
  register('squeeze-linear',['squeeze','trig','absolute'],c=>finite(mul(fn('abs',X),fn('cos',div(C(c.a),X))),0,0,'|f(x)| ≤ |x| ve |x| → 0.','The absolute value is bounded by |x|, which tends to zero.'));
  register('oscillation-zero',['squeeze','trig'],c=>({f:fn('sin',div(C(c.a),X)),point:0,side:'both',result:'dne',oscillation:c.a,tr:'x_n=a/(π/2+2πn) için değer 1; y_n=a/(3π/2+2πn) için −1. Her iki dizi sıfıra gider, değerler farklı kalır; limit yoktur.',en:'Along x_n=a/(π/2+2πn) the value is 1; along y_n=a/(3π/2+2πn) it is -1. Both approach zero, so no limit exists.'}));
  register('standard-power-zero',['standard','exponential'],c=>finite(variablePower(add(C(1),scale(c.a,X)),div(C(c.b),X)),0,Math.exp(c.a*c.b),'u=a*x dönüşümüyle standart (1+u)^(1/u) → e limiti uygulanır; dış kuvvet a*b olur.','Use u=a*x and the standard limit (1+u)^(1/u) → e, then raise to the power a*b.'));
  register('standard-power-infinity',['standard','exponential','infinity'],c=>finite(variablePower(add(C(1),div(C(c.a),X)),scale(c.b,X)),'inf',Math.exp(c.a*c.b),'u=a/x ile u→0 ve standart üstel limit kullanılır.','Set u=a/x and use the standard exponential limit.'));
  register('standard-negative-power',['standard','exponential','infinity'],c=>finite(variablePower(sub(C(1),div(C(c.a),X)),scale(c.b,X)),'inf',Math.exp(-c.a*c.b),'x yeterince büyükken taban pozitiftir. Standart limitte a yerine −a kullanılır.','The base is positive for sufficiently large x. Apply the standard limit with -a.'));
  register('higher-exp',['lhopital','exponential'],c=>finite(div(sub(sub(fn('exp',scale(c.a,X)),C(1)),scale(c.a,X)),pow(X,2)),0,c.a*c.a/2,'0/0 biçimi iki kez sürer. İki L’Hôpital adımından sonra a²*exp(a*x)/2 → a²/2.','Apply L’Hôpital twice to obtain a²*exp(a*x)/2 → a²/2.'));
  register('higher-log',['lhopital','logarithm'],c=>finite(div(sub(fn('ln',add(C(1),scale(c.a,X))),scale(c.a,X)),pow(X,2)),0,-c.a*c.a/2,'0/0 biçiminde iki L’Hôpital adımıyla −a²/(2*(1+a*x)²) → −a²/2.','Two applications of L’Hôpital give -a²/(2*(1+a*x)²) → -a²/2.'));
  register('higher-sine',['lhopital','trig'],c=>finite(div(sub(fn('sin',scale(c.a,X)),scale(c.a,X)),pow(X,3)),0,-(c.a**3)/6,'0/0 biçimi korunarak üç kez türev alınır; −a³*cos(a*x)/6 → −a³/6.','Apply L’Hôpital three times to obtain -a³*cos(a*x)/6 → -a³/6.'));
  register('exponential-ratio-zero',['exponential','exp-standard'],c=>finite(div(sub(fn('exp',scale(c.a,X)),C(1)),sub(fn('exp',scale(c.b,X)),C(1))),0,c.a/c.b,'Payı ve paydayı x ile ölçekleyip standart üstel limiti uygulayın.','Divide both numerator and denominator by x and use the exponential limit.'));
  register('logarithmic-ratio-zero',['logarithm','log-standard'],c=>finite(div(fn('ln',add(C(1),scale(c.a,X))),fn('ln',add(C(1),scale(c.b,X)))),0,c.a/c.b,'Her iki logaritmayı x ile ölçekleyip standart limite indirgeyin.','Scale both logarithms by x.'));
  register('radical-second-order',['radical'],c=>finite(div(sub(pow(add(pow(X,2),C(c.a*c.a)),.5),C(c.a)),pow(X,2)),0,1/(2*c.a),'Eşlenikle çarpınca 1/(sqrt(x²+a²)+a) kalır.','Rationalize the numerator.'));
  register('logarithm-scale-infinity',['logarithm','infinity'],c=>finite(div(fn('ln',scale(c.a,X)),fn('ln',X)),'inf',1,'ln(a*x)=ln(a)+ln(x); sabit/ln(x) sıfıra gider.','Split the numerator into ln(a)+ln(x).'));
  register('binomial-difference',['factorization','polynomial'],c=>finite(div(sub(pow(add(C(1),X),c.k),C(1)),X),0,c.k,'Binom açılımında sabitler götürülür; x ile bölününce kalan sabit katsayı n olur.','Expand and cancel the common x factor.'));
  register('inverse-tangent-zero',['inverse'],c=>finite(div(fn('atan',scale(c.a,X)),X),0,c.a,'u=a*x dönüşümüyle atan(u)/u → 1 standart limiti uygulanır.','Set u=a*x and use atan(u)/u → 1.'));
  function available(selected){const set=new Set(normalize(selected));return templates.filter(t=>t.required.every(id=>set.has(id)));}
  function generate(seed,index,selected=defaults,forcedId=null){
    const enabled=normalize(selected),pool=available(enabled);if(!pool.length)throw Error('Select compatible limit topics.');
    const template=(forcedId?pool.find(t=>t.id===forcedId):M.choose(seed,index,pool)),random=M.generator(seed,index+1733),int=(a,b)=>a+Math.floor(random()*(b-a+1)),c={a:int(2,5),b:int(1,4),s:int(1,4),k:int(1,5)};
    const q=template.build(c),required=template.required,infinitePoint=typeof q.point==='string',point=infinitePoint?(q.point==='inf'?'∞':'−∞'):String(q.point),side=q.side==='left'?'−':q.side==='right'?'+':'',latexPoint=infinitePoint?(q.point==='inf'?'\\infty':'-\\infty'):`${q.point}${side?`^{${side==='−'?'-':'+'}}`:''}`;
    let text='Limiti bulun; limit yoksa nedenini belirtin.',en='Find the limit, or explain why it does not exist.',eq=`lim_(x→${point}${side}) ${q.f?ascii(q.f):'f(x)'}`,eqLatex=`\\lim_{x\\to${latexPoint}}${q.f?latex(q.f):'f(x)'}`,solution=q.tr,solutionEn=q.en,solutionLatex=null;
    if(q.piecewise){
      eq+=`; f(x) = ${ascii(q.piecewise.left)} (x < ${q.point}); ${q.piecewise.at} (x = ${q.point}); ${ascii(q.piecewise.right)} (x > ${q.point})`;
      eqLatex+=`,\\quad f(x)=\\begin{cases}${latex(q.piecewise.left)}&x<${q.point}\\\\${q.piecewise.at}&x=${q.point}\\\\${latex(q.piecewise.right)}&x>${q.point}\\end{cases}`;
    }
    if(q.result==='parameter'){
      text=`f’nin x = ${q.point} noktasında sürekli olması için k’yi bulun.`;en=`Find k so that f is continuous at x = ${q.point}.`;
      eq=`f(x) = ${q.coeff}*x+${q.constant} (x ≤ ${q.point}); k*x+${q.offset} (x > ${q.point})`;
      eqLatex=`f(x)=\\begin{cases}${q.coeff}x+${q.constant}&x\\le${q.point}\\\\kx+${q.offset}&x>${q.point}\\end{cases}`;
      solution+=` ${q.coeff}*${q.point}+${q.constant} = k*${q.point}+${q.offset}. k = (${q.coeff*q.point+q.constant-q.offset})/${q.point}.`;
      solutionEn+=` k = (${q.coeff*q.point+q.constant-q.offset})/${q.point}.`;solutionLatex=`k=\\frac{${q.coeff*q.point+q.constant-q.offset}}{${q.point}}`;
    }else if(q.result==='fill'){
      text=`Verilen ifade x ≠ ${q.point} için tanımlı. Fonksiyonun bu noktada sürekli olması için f(${q.point}) ne seçilmelidir?`;en=`The expression is defined for x ≠ ${q.point}. Choose f(${q.point}) to make it continuous.`;
      solutionLatex=`f(${q.point})=${q.value}`;
    }else if(q.result==='finite'){
      solution+=` Limit ≈ ${Number(q.value.toPrecision(10))}.`;solutionEn+=` Limit ≈ ${Number(q.value.toPrecision(10))}.`;solutionLatex=`L\\approx ${Number(q.value.toPrecision(10))}`;
    }else if(q.result==='infinity'){
      solution+=` Limit ${q.sign>0?'+∞':'−∞'}.`;solutionEn+=` Limit ${q.sign>0?'+∞':'−∞'}.`;solutionLatex=`L\\to${q.sign>0?'+':'-'}\\infty`;
    }
    const rules=required.map(id=>topics.find(t=>t.id===id).label).join(' · '),rulesEn=required.map(id=>topics.find(t=>t.id===id).en).join(' · ');
    // Infinity is serialized explicitly rather than lost as JSON null.
    const verification={...q,left:q.left===Infinity?'inf':q.left===-Infinity?'-inf':q.left??null,right:q.right===Infinity?'inf':q.right===-Infinity?'-inf':q.right??null};
    return {id:`limits-v1-${seed>>>0}-${index}`,generatorVersion:'limits-v1',program:'limits',educationMode:'university',topicId:required[0],subtopicId:template.id,template:template.id,index,scope:{program:'limits',topics:enabled},requiredTopics:required,parameters:c,text:text+(required.includes('trig')?' Açılar radyandır.':''),eq,eqLatex,solution:`${rules}\n${solution}`,solutionLatex,choices:[],correct:null,supportsChoices:false,responseType:'expression',difficultyProfile:{base:Math.min(4.5,1.2+required.length*.65),steps:required.length+2},english:{text:en+(required.includes('trig')?' Angles are in radians.':''),solution:`${rulesEn}\n${solutionEn}`},verification};
  }
  globalThis.LimitBank={topics,defaults,normalize,available,generate,templates:templates.map(({id,required})=>({id,required})),version:1};
})();
