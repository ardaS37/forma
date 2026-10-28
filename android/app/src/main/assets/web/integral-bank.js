/* Parameterized exact antiderivatives; no network or answer guessing. */
(() => {
  'use strict';
  const M=PracticeMath,{C,X,add,mul,sub,div,pow,fn,variablePower,derivative,evaluate,ascii,latex}=M;
  const topics=[
    ['power','Sabit, polinom ve kuvvet','Constants, polynomials and powers','∫x^n dx = x^(n+1)/(n+1) + C; n ≠ −1'],
    ['roots','Kök ve kesirli kuvvet','Roots and fractional powers','∫sqrt(x) dx = (2/3)*x^(3/2) + C'],
    ['reciprocal','Negatif kuvvet','Negative powers','∫x^(-n) dx = x^(1−n)/(1−n) + C; n ≠ 1'],
    ['trig','Trigonometrik integraller','Trigonometric integrals','∫cos(x) dx = sin(x) + C'],
    ['inverse','Ters trigonometrik biçimler','Inverse trigonometric forms','∫1/(1+x^2) dx = atan(x) + C'],
    ['exponential','Üstel fonksiyonlar','Exponential functions','∫exp(a*x) dx = exp(a*x)/a + C; a ≠ 0'],
    ['logarithm','Logaritmik integraller','Logarithmic integrals','∫ln(x) dx = x*ln(x) − x + C; x > 0'],
    ['substitution','Değişken değiştirme','Substitution','∫f(g(x))*g′(x) dx = F(g(x)) + C'],
    ['parts','Kısmi integrasyon','Integration by parts','∫u dv = u*v − ∫v du'],
    ['rational','Rasyonel ve basit kesirler','Rational functions and partial fractions','Basit kesirlere ayırıp terim terim integral alın.'],
    ['trigpowers','Trigonometrik kuvvetler','Trigonometric powers','sin^2(x) = (1−cos(2*x))/2'],
    ['definite','Belirli integral','Definite integrals','∫_a^b f(x) dx = F(b) − F(a)'],
    ['area','Alan ve iki eğri arası','Area and area between curves','Alan = ∫(üst eğri − alt eğri) dx'],
    ['volume','Dönel cisim hacmi','Solids of revolution','V = π*∫(dış yarıçap^2 − iç yarıçap^2) dx'],
    ['average','Ortalama değer','Average value','f_ort = (1/(b−a))*∫_a^b f(x) dx'],
    ['improper','Uygunsuz integral','Improper integrals','Sonsuz sınır veya tekillik için ayrı limit alın.'],
    ['fundamental','Analizin temel teoremi','Fundamental theorem of calculus','(∫_a^g(x) f(t) dt)′ = f(g(x))*g′(x)'],
    ['initial','Başlangıç koşullu integral','Antiderivatives with initial conditions','F′ = f ve F(a)=b ile C sabitini bulun.']
  ].map(([id,label,en,formula])=>({id,label,en,formula}));
  const defaults=topics.map(t=>t.id),normalize=value=>Array.isArray(value)?defaults.filter(id=>value.includes(id)):defaults.slice(),templates=[];
  const register=(id,required,build,kind='indefinite')=>templates.push({id,required,build,kind});
  const scale=(a,f)=>mul(C(a),f),linear=(a,b)=>add(scale(a,X),C(b));
  function substitute(e,u){if(e.op==='x')return u;return {...e,...(e.a?{a:substitute(e.a,u)}:{}),...(e.b?{b:substitute(e.b,u)}:{})};}
  const base=[];
  function basic(id,required,build){base.push({id,required,build});register(id,required,build);}
  basic('constant',['power'],c=>({f:C(c.a),F:scale(c.a,X)}));
  basic('monomial',['power'],c=>({f:scale(c.a,pow(X,c.n)),F:scale(c.a/(c.n+1),pow(X,c.n+1))}));
  basic('polynomial',['power'],c=>({f:add(scale(c.a,pow(X,2)),add(scale(c.b,X),C(c.k))),F:add(scale(c.a/3,pow(X,3)),add(scale(c.b/2,pow(X,2)),scale(c.k,X)))}));
  basic('fraction-coefficient',['power'],c=>({f:scale(c.a/c.b,pow(X,c.n)),F:scale(c.a/(c.b*(c.n+1)),pow(X,c.n+1))}));
  for(const n of [.5,1.5,2.5])basic('root-'+n,['roots'],c=>({f:scale(c.a,pow(X,n)),F:scale(c.a/(n+1),pow(X,n+1)),bounds:[1,2]}));
  for(const n of [-2,-3,-4])basic('negative-'+n,['reciprocal'],c=>({f:scale(c.a,pow(X,n)),F:scale(c.a/(n+1),pow(X,n+1)),bounds:[1,2]}));
  basic('reciprocal',['reciprocal','logarithm'],c=>({f:div(C(c.a),X),F:scale(c.a,fn('lnabs',X)),bounds:[1,2]}));
  basic('sine',['trig'],c=>({f:scale(c.a,fn('sin',X)),F:scale(-c.a,fn('cos',X))}));
  basic('cosine',['trig'],c=>({f:scale(c.a,fn('cos',X)),F:scale(c.a,fn('sin',X))}));
  basic('sec-squared',['trig'],c=>({f:scale(c.a,pow(fn('sec',X),2)),F:scale(c.a,fn('tan',X)),bounds:[0,.5]}));
  basic('csc-squared',['trig'],c=>({f:scale(c.a,pow(fn('csc',X),2)),F:scale(-c.a,fn('cot',X)),bounds:[.5,1]}));
  basic('sec-tan',['trig'],c=>({f:scale(c.a,mul(fn('sec',X),fn('tan',X))),F:scale(c.a,fn('sec',X)),bounds:[0,.5]}));
  basic('csc-cot',['trig'],c=>({f:scale(c.a,mul(fn('csc',X),fn('cot',X))),F:scale(-c.a,fn('csc',X)),bounds:[.5,1]}));
  basic('tangent',['trig','logarithm'],c=>({f:fn('tan',X),F:scale(-1,fn('lnabs',fn('cos',X))),bounds:[0,.5]}));
  basic('cotangent',['trig','logarithm'],c=>({f:fn('cot',X),F:fn('lnabs',fn('sin',X)),bounds:[.5,1]}));
  basic('arctan',['inverse'],c=>({f:div(C(1),add(C(1),pow(X,2))),F:fn('atan',X)}));
  basic('arcsin',['inverse','roots'],c=>({f:div(C(1),pow(sub(C(1),pow(X,2)),.5)),F:fn('asin',X),bounds:[0,.5]}));
  basic('natural-exponential',['exponential'],c=>({f:scale(c.a,fn('exp',X)),F:scale(c.a,fn('exp',X))}));
  basic('base-exponential',['exponential'],c=>({f:variablePower(C(c.a),X),F:div(variablePower(C(c.a),X),fn('ln',C(c.a)))}));
  basic('logarithm',['logarithm','parts'],c=>({f:fn('ln',X),F:sub(mul(X,fn('ln',X)),X),bounds:[1,2]}));
  basic('log-over-x',['logarithm','reciprocal','substitution'],c=>({f:div(fn('ln',X),X),F:scale(.5,pow(fn('ln',X),2)),bounds:[1,2]}));
  for(const n of [2,3,4])register('linear-power-'+n,['power','substitution'],c=>({f:pow(c.u,n),F:scale(1/(c.a*(n+1)),pow(c.u,n+1))}));
  register('linear-root',['roots','substitution'],c=>({f:pow(c.u,.5),F:scale(2/(3*c.a),pow(c.u,1.5)),bounds:[1,2]}));
  register('linear-reciprocal',['rational','logarithm','substitution'],c=>({f:div(C(1),c.u),F:scale(1/c.a,fn('lnabs',c.u)),bounds:[1,2]}));
  register('quadratic-log',['rational','logarithm','substitution'],c=>({f:div(scale(2,X),c.positive),F:fn('ln',c.positive)}));
  for(const op of ['sin','cos','exp'])register('linear-'+op,[op==='exp'?'exponential':'trig','substitution'],c=>({f:fn(op,c.u),F:scale((op==='sin'?-1:1)/c.a,fn(op==='sin'?'cos':op==='cos'?'sin':'exp',c.u))}));
  register('nested-exponential',['exponential','power','substitution'],c=>({f:mul(scale(2,X),fn('exp',pow(X,2))),F:fn('exp',pow(X,2))}));
  register('nested-sine',['trig','power','substitution'],c=>({f:mul(scale(2,X),fn('cos',pow(X,2))),F:fn('sin',pow(X,2))}));
  register('nested-root',['roots','power','substitution'],c=>({f:mul(X,pow(c.positive,.5)),F:scale(1/3,pow(c.positive,1.5))}));
  register('arctan-scale',['inverse','substitution'],c=>({f:div(C(1),add(C(c.a*c.a),pow(X,2))),F:scale(1/c.a,fn('atan',scale(1/c.a,X)))}));
  register('arcsin-scale',['inverse','roots','substitution'],c=>({f:div(C(1),pow(sub(C(c.a*c.a),pow(X,2)),.5)),F:fn('asin',scale(1/c.a,X)),bounds:[0,.5]}));
  register('parts-exponential',['parts','exponential','power'],c=>({f:mul(X,fn('exp',scale(c.a,X))),F:mul(fn('exp',scale(c.a,X)),sub(scale(1/c.a,X),C(1/(c.a*c.a))))}));
  register('parts-sine',['parts','trig','power'],c=>({f:mul(X,fn('sin',X)),F:sub(fn('sin',X),mul(X,fn('cos',X)))}));
  register('parts-cosine',['parts','trig','power'],c=>({f:mul(X,fn('cos',X)),F:add(mul(X,fn('sin',X)),fn('cos',X))}));
  register('parts-log',['parts','logarithm','power'],c=>({f:mul(X,fn('ln',X)),F:sub(scale(.5,mul(pow(X,2),fn('ln',X))),scale(.25,pow(X,2))),bounds:[1,2]}));
  register('parts-log-squared',['parts','logarithm'],c=>({f:pow(fn('ln',X),2),F:mul(X,add(sub(pow(fn('ln',X),2),scale(2,fn('ln',X))),C(2))),bounds:[1,2]}));
  register('parts-quadratic-exponential',['parts','exponential','power'],c=>({f:mul(pow(X,2),fn('exp',X)),F:mul(fn('exp',X),add(sub(pow(X,2),scale(2,X)),C(2)))}));
  register('partial-fractions',['rational','logarithm'],c=>({f:div(C(1),mul(X,add(X,C(c.a)))),F:scale(1/c.a,sub(fn('lnabs',X),fn('lnabs',add(X,C(c.a))))),bounds:[1,2]}));
  register('rational-division',['rational','power','logarithm'],c=>({f:div(pow(X,2),add(X,C(c.a))),F:add(sub(scale(.5,pow(X,2)),scale(c.a,X)),scale(c.a*c.a,fn('lnabs',add(X,C(c.a))))),bounds:[1,2]}));
  register('sine-squared',['trig','trigpowers'],c=>({f:pow(fn('sin',X),2),F:sub(scale(.5,X),scale(.25,fn('sin',scale(2,X))))}));
  register('cosine-squared',['trig','trigpowers'],c=>({f:pow(fn('cos',X),2),F:add(scale(.5,X),scale(.25,fn('sin',scale(2,X))))}));
  register('sin-cos-product',['trig','trigpowers','substitution'],c=>({f:mul(fn('sin',X),fn('cos',X)),F:scale(.5,pow(fn('sin',X),2))}));
  for(const b of base.filter(b=>!b.id.startsWith('csc')&&!['tangent','cotangent','log-over-x'].includes(b.id)))register('definite-'+b.id,['definite',...b.required],b.build,'definite');
  register('positive-area',['area','power'],c=>({f:add(scale(c.a,pow(X,2)),C(c.b)),F:add(scale(c.a/3,pow(X,3)),scale(c.b,X)),bounds:[0,c.k]}),'area');
  register('between-curves',['area','power'],c=>({f:sub(add(C(c.a),scale(c.b,X)),pow(X,2)),F:sub(add(scale(c.a,X),scale(c.b/2,pow(X,2))),scale(1/3,pow(X,3))),bounds:[0,1],upper:add(C(c.a),scale(c.b,X)),lower:pow(X,2)}),'area');
  register('disk-volume',['volume','power'],c=>({f:pow(X,2),F:scale(1/3,pow(X,3)),bounds:[0,c.a],curve:X}),'volume');
  register('washer-volume',['volume','power'],c=>({f:sub(pow(add(X,C(c.b)),2),pow(X,2)),F:add(scale(c.b,pow(X,2)),scale(c.b*c.b,X)),bounds:[0,c.a],curve:add(X,C(c.b)),inner:X}),'volume');
  for(const id of ['monomial','sine','natural-exponential']){const b=base.find(t=>t.id===id);register('average-'+id,['average',...b.required],b.build,'average');}
  register('p-tail',['improper','reciprocal'],c=>({p:c.n,a:c.a}),'tail');
  register('p-divergent',['improper','reciprocal','logarithm'],c=>({p:1,a:c.a}),'tail');
  register('exp-tail',['improper','exponential'],c=>({a:c.a}),'exptail');
  register('root-singularity',['improper','roots'],c=>({a:c.a}),'rootsingularity');
  register('singular-divergent',['improper','reciprocal'],c=>({a:c.a}),'singular');
  register('fundamental-polynomial',['fundamental','power'],c=>({f:pow(X,c.n),F:scale(1/(c.n+1),pow(X,c.n+1)),bound:c.u}),'fundamental');
  register('fundamental-sine',['fundamental','trig'],c=>({f:fn('sin',X),F:scale(-1,fn('cos',X)),bound:pow(X,2)}),'fundamental');
  for(const id of ['polynomial','cosine','natural-exponential']){const b=base.find(t=>t.id===id);register('initial-'+id,['initial',...b.required],b.build,'initial');}
  function available(selected){const set=new Set(normalize(selected));return templates.filter(t=>t.required.every(id=>set.has(id)));}
  function generate(seed,index,selected=defaults){
    const enabled=normalize(selected),pool=available(enabled);if(!pool.length)throw Error('Select compatible integral topics.');
    const template=M.choose(seed,index,pool),random=M.generator(seed,index+2341),int=(a,b)=>a+Math.floor(random()*(b-a+1));
    const c={a:int(2,6),b:int(1,6),n:int(2,5),k:int(1,4)};c.u=linear(c.a,c.b);c.positive=add(pow(X,2),C(c.b));
    const q=template.build(c),f=q.f,F=q.F,[lo,hi]=q.bounds||[0,1],required=template.required;
    let text='Belirsiz integrali bulun. İntegrasyon sabitini unutmayın.',en='Find the indefinite integral, including the constant of integration.',eq=f?`∫ ${ascii(f)} dx`:'',eqLatex=f?`\\int ${latex(f)}\\,dx`:'',solution='',solutionEn='',solutionLatex=null,verification;
    if(template.kind==='indefinite'){
      solution=`Bir asal fonksiyon: ${ascii(F)}. Sonuç: ${ascii(F)} + C. Türev alarak integrandı geri elde edebilirsiniz.`;
      solutionEn=`An antiderivative is ${ascii(F)}. Answer: ${ascii(F)} + C. Differentiate to check.`;
      solutionLatex=`${latex(F)}+C`;verification={kind:'antiderivative',f,F};
    }else if(['definite','area','volume','average'].includes(template.kind)){
      const delta=sub(substitute(F,C(hi)),substitute(F,C(lo))),raw=evaluate(delta,0),factor=template.kind==='volume'?Math.PI:template.kind==='average'?1/(hi-lo):1,value=raw*factor;
      text=template.kind==='area'?(q.upper?'Verilen iki eğri arasında, belirtilen aralıktaki alanı bulun.':'Eğri ile x ekseni arasında, belirtilen aralıktaki alanı bulun.'):template.kind==='volume'?'Belirtilen aralıkta verilen eğri bölgesini x ekseni etrafında döndürün; hacmi bulun.':template.kind==='average'?'Fonksiyonun belirtilen aralıktaki ortalama değerini bulun.':'Belirli integrali hesaplayın.';
      en=template.kind==='area'?'Find the area of the indicated region.':template.kind==='volume'?'Find the volume when the indicated region is revolved around the x axis.':template.kind==='average'?'Find the average value on the indicated interval.':'Evaluate the definite integral.';
      eq=`∫_(${lo})^(${hi}) ${ascii(f)} dx`;
      eqLatex=`\\int_{${lo}}^{${hi}}${latex(f)}\\,dx`;
      if(template.kind==='area'){eq=q.upper?`üst: ${ascii(q.upper)}; alt: ${ascii(q.lower)}; ${lo} ≤ x ≤ ${hi}`:`y = ${ascii(f)}; ${lo} ≤ x ≤ ${hi}`;eqLatex=q.upper?`y_1=${latex(q.upper)},\\;y_2=${latex(q.lower)},\\;${lo}\\le x\\le${hi}`:`y=${latex(f)},\\;${lo}\\le x\\le${hi}`;}
      if(template.kind==='volume'){eq=`dış: y = ${ascii(q.curve)}; iç: y = ${q.inner?ascii(q.inner):'0'}; ${lo} ≤ x ≤ ${hi}`;eqLatex=`R(x)=${latex(q.curve)},\\;r(x)=${q.inner?latex(q.inner):'0'},\\;${lo}\\le x\\le${hi}`;}
      if(template.kind==='average'){eq=`f(x) = ${ascii(f)}; ${lo} ≤ x ≤ ${hi}`;eqLatex=`f(x)=${latex(f)},\\;${lo}\\le x\\le${hi}`;}
      solution=`F(x) = ${ascii(F)}. F(${hi}) − F(${lo}) = ${ascii(delta)}. ${template.kind==='volume'?'Disk/pul yöntemiyle π ile çarpılır. ':template.kind==='average'?`${hi-lo} aralık uzunluğuna bölünür. `:''}Sonuç ≈ ${Number(value.toFixed(6))}.`;
      solutionEn=`F(x) = ${ascii(F)}. Evaluate F(${hi}) − F(${lo})${template.kind==='volume'?' and multiply by π':template.kind==='average'?` and divide by ${hi-lo}`:''}. Result ≈ ${Number(value.toFixed(6))}.`;
      solutionLatex=`${template.kind==='volume'?'\\pi\\cdot ':template.kind==='average'?`\\frac{1}{${hi-lo}}\\cdot `:''}\\left(${latex(delta)}\\right)\\approx ${Number(value.toFixed(6))}`;
      verification={kind:template.kind,f,F,lo,hi,factor,value,...(q.upper?{upper:q.upper,lower:q.lower}:{}),...(q.curve?{curve:q.curve,inner:q.inner||C(0)}:{})};
    }else if(template.kind==='initial'){
      const at=1,target=c.k,answer=add(F,sub(C(target),substitute(F,C(at))));
      text=`F′(x) = f(x) ve F(${at}) = ${target}. F(x)’i bulun.`;en=`F′(x) = f(x) and F(${at}) = ${target}. Find F(x).`;
      eq=`f(x) = ${ascii(f)}`;eqLatex=`f(x)=${latex(f)}`;
      solution=`Önce ${ascii(F)} + C bulunur. F(${at}) = ${target} koşulunu uygulayın. F(x) = ${ascii(answer)}.`;solutionEn=`Use the initial value to determine C. F(x) = ${ascii(answer)}.`;solutionLatex=`F(x)=${latex(answer)}`;verification={kind:'initial',f,F:answer,at,target};
    }else if(template.kind==='fundamental'){
      const answer=mul(substitute(f,q.bound),derivative(q.bound)),exactPrimitive=sub(substitute(F,q.bound),substitute(F,C(0)));
      text='F′(x) ifadesini, integrali açmadan temel teorem ile bulun.';en='Find F′(x) using the fundamental theorem, without evaluating the integral.';
      eq=`F(x) = ∫_0^(${ascii(q.bound)}) ${ascii(f,'t')} dt`;eqLatex=`F(x)=\\int_0^{${latex(q.bound)}}${latex(f,'t')}\\,dt`;
      solution=`Üst sınırın türeviyle integrandın üst sınırdaki değeri çarpılır. F′(x) = ${ascii(answer)}.`;solutionEn=`Multiply the integrand at the upper bound by the derivative of that bound. F′(x) = ${ascii(answer)}.`;solutionLatex=`F'(x)=${latex(answer)}`;verification={kind:'fundamental',f,exactPrimitive,answer,bound:q.bound};
    }else{
      let value=null,converges=true;
      if(template.kind==='tail'){
        converges=q.p>1;value=converges?q.a/(q.p-1):null;eq=`∫_1^∞ ${q.a}/x^${q.p} dx`;eqLatex=`\\int_1^\\infty\\frac{${q.a}}{x^{${q.p}}}\\,dx`;
        solution=converges?`p = ${q.p} > 1. Üst sınırı R yapıp R→∞ limiti alınır; x^(1−p) sıfıra gider. Sonuç ${q.a}/(${q.p}−1) = ${value}.`:`Üst sınırı R yapınca ${q.a}*ln(R) elde edilir. R→∞ iken +∞; integral ıraksar.`;
        solutionEn=converges?`p = ${q.p} > 1. The endpoint term vanishes at infinity; the integral is ${q.a}/(${q.p}-1) = ${value}.`:'The logarithmic endpoint grows without bound, so the integral diverges.';
      }else if(template.kind==='exptail'){
        value=1/q.a;eq=`∫_0^∞ exp(−${q.a}*x) dx`;eqLatex=`\\int_0^\\infty e^{-${q.a}x}\\,dx`;solution=`Asal fonksiyon −exp(−${q.a}*x)/${q.a}. Üst sınır sonsuza giderken üstel terim sıfıra gider; sonuç 1/${q.a}.`;solutionEn=`The exponential endpoint vanishes at infinity. The integral equals 1/${q.a}.`;
      }else if(template.kind==='rootsingularity'){
        value=2*Math.sqrt(q.a);eq=`∫_0^${q.a} 1/sqrt(x) dx`;eqLatex=`\\int_0^{${q.a}}\\frac{1}{\\sqrt{x}}\\,dx`;solution=`Alt sınırı ε > 0 alın. [2*sqrt(x)]_ε^${q.a} için ε→0+ limiti vardır. Sonuç 2*sqrt(${q.a}).`;solutionEn=`Replace zero by ε > 0. The limit of 2*sqrt(${q.a})−2*sqrt(ε) is 2*sqrt(${q.a}).`;
      }else{
        converges=false;eq=`∫_0^${q.a} 1/x^2 dx`;eqLatex=`\\int_0^{${q.a}}\\frac{1}{x^2}\\,dx`;solution=`Alt sınırı ε > 0 yapınca 1/ε − 1/${q.a} bulunur. ε→0+ iken +∞; integral ıraksar.`;solutionEn='The lower-endpoint term 1/ε tends to positive infinity, so the integral diverges.';
      }
      text='Uygunsuz integralin yakınsaklığını inceleyin; yakınsaksa değerini bulun.';en='Determine whether the improper integral converges; if so, evaluate it.';
      solutionLatex=converges?`I\\approx ${Number(value.toFixed(6))}`:'I\\to+\\infty';verification={kind:'improper',type:template.kind,...q,value,converges};
    }
    const rules=required.map(id=>topics.find(t=>t.id===id).label).join(' · '),rulesEn=required.map(id=>topics.find(t=>t.id===id).en).join(' · ');
    return {id:`integrals-v1-${seed>>>0}-${index}`,generatorVersion:'integrals-v1',program:'integrals',educationMode:'university',topicId:required[0],subtopicId:template.id,template:template.id,index,scope:{program:'integrals',topics:enabled},requiredTopics:required,parameters:c,text:text+(required.includes('trig')?' Açılar radyandır.':''),eq,eqLatex,solution:`${rules}\n${solution}${template.kind==='indefinite'?' İntegrandın ve asal fonksiyonun tanımlı olduğu her açık aralıkta geçerlidir.':''}`,solutionLatex,choices:[],correct:null,supportsChoices:false,responseType:'expression',difficultyProfile:{base:Math.min(4.5,1.4+required.length*.6),steps:required.length+2},english:{text:en+(required.includes('trig')?' Angles are in radians.':''),solution:`${rulesEn}\n${solutionEn}`},verification};
  }
  globalThis.IntegralBank={topics,defaults,normalize,available,generate,templates:templates.map(({id,required,kind})=>({id,required,kind})),version:1};
})();
