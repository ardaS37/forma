/* Multivariable calculus: explicit domains, vector tasks and parameter-valued
   primitives. All generated data and worked steps remain serializable. */
(() => {
  'use strict';
  const E=(f,p)=>math.evaluate(f,p),D=(f,x)=>math.derivative(f,x).toString();
  const T=f=>math.parse(String(f)).toTex({parenthesis:'auto',implicit:'hide'});
  const N=n=>ExactMath.latexNumber(n),F=n=>ExactMath.textNumber(n);
  const vector=a=>'\\left('+a.join(',\\;')+'\\right)';
  const matrix=a=>'\\begin{pmatrix}'+a.map(row=>row.join('&')).join('\\\\')+'\\end{pmatrix}';
  const sub=(f,p)=>math.parse(f).transform(n=>n.isSymbolNode&&Object.hasOwn(p,n.name)?math.parse(String(p[n.name])):n).toString();
  const norm=a=>Math.hypot(...a),dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
  const kinds=new Set(['gradient','gradient-point','gradient-linearization','directional','steepest','steepest-min','hessian','hessian-invariants','multivariable-chain','chain-approx','jacobian','jacobian-increment','parameter-integral','parameter-initial','iterated-general']);
  const families=[
    ['quadratic',['polynomial'],c=>`${c.a}*x^2+${c.b}*x*y+${c.b+2}*y^2`],
    ['sine-product',['trig','chain'],c=>'sin(x*y)'],
    ['exponential',['exponential','chain'],c=>'exp(x+y)'],
    ['logarithm',['logarithm','chain'],c=>`log(x^2+y^2+${c.a})`],
    ['rational',['quotient'],c=>`x/(${c.a}+y)`],
    ['arctangent',['inverse','chain'],c=>'atan(x*y)'],
    ['root',['roots','chain'],c=>`sqrt(x^2+y^2+${c.a})`],
    ['variable-power',['logdiff','logarithm'],c=>'x^y'],
    ['three-polynomial',['polynomial'],c=>`${c.a}*x*y+y*z+x*z^2`],
    ['three-exponential',['exponential','chain'],c=>'exp(x+y+z)'],
    ['three-radial',['roots','chain'],c=>`sqrt(x^2+y^2+z^2+${c.a})`]
  ];
  function scalar(c,make,id){const f=make(c),variables=id.startsWith('three-')?['x','y','z']:['x','y'],partials=variables.map(x=>D(f,x)),at={x:1,y:2,...(variables.length===3?{z:1}:{})},values=partials.map(p=>E(p,at));return{f,variables,partials,at,values,value:E(f,at)};}
  function derivativeTask(c,make,id,kind){
    const v={kind,...scalar(c,make,id)},args=v.variables.join(','),at=v.variables.map(x=>v.at[x]);let text,answer;
    if(kind==='gradient'){text='Gradyan vektörünü bulun. Her bileşende yalnız ilgili değişkene göre türev alın.';answer='∇f = '+v.partials.join(', ');}
    if(kind==='directional'){
      v.direction=v.variables.length===3?[2,-1,2]:[3,4];const length=norm(v.direction);v.unit=v.direction.map(x=>x/length);v.answer=dot(v.values,v.unit);
      text=`P=(${at}) noktasında v=(${v.direction}) yönündeki yönlü türevi bulun. Verilen yön vektörünü önce birimleştirin.`;answer=`u=v/|v|; D_u f(P)=∇f(P)·u=${F(v.answer)}.`;
    }
    if(kind==='steepest'){v.rate=norm(v.values);v.unit=v.values.map(x=>x/v.rate);text=`P=(${at}) noktasında en hızlı artış yönünü ve bu yöndeki değişim hızını bulun.`;answer=`En hızlı artış yönü ∇f/|∇f|; en büyük yönlü türev |∇f|=${F(v.rate)}.`;}
    if(kind==='hessian'){v.hessian=v.partials.map(p=>v.variables.map(x=>D(p,x)));v.matrix=v.hessian.map(row=>row.map(p=>E(p,v.at)));text=`Hessian matrisini bulun; ardından P=(${at}) noktasında değerlendirin.`;answer='İkinci kısmi türevleri satır/sütun sırasını koruyarak matrise yerleştirin.';}
    if(kind==='multivariable-chain'){
      v.path={x:'1+t',y:'2+t^2',...(v.variables.length===3?{z:'1+2*t'}:{})};v.pathDerivatives=v.variables.map(x=>D(v.path[x],'t'));v.along=v.partials.map(p=>sub(p,v.path));v.expression=v.along.map((p,i)=>`(${p})*(${v.pathDerivatives[i]})`).join('+');v.t=.5;v.answer=E(v.expression,{t:v.t});v.composite=sub(v.f,v.path);
      text=`H(t)=f(${v.variables.map(x=>v.path[x]).join(',')}) için zincir kuralıyla H′(t) ve H′(${F(v.t)}) bulun.`;answer=`H′=${v.expression}; H′(${F(v.t)})=${F(v.answer)}.`;
    }
    return{text,eq:`f(${args})=${v.f}; ${v.variables.map(x=>x+'>0').join(', ')}`,eqLatex:`f(${args})=${T(v.f)},\\quad ${v.variables.map(x=>x+'>0').join(',')}`,solution:answer,verification:v};
  }
  function jacobianTask(c,three){const variables=three?['x','y','z']:['x','y'],functions=three?['x*y','x*z',`${c.a}*y^2+z`]:[`${c.a}*x^2+y`,'x*y'],at={x:1,y:2,...(three?{z:1}:{})},jacobian=functions.map(f=>variables.map(x=>D(f,x))),values=jacobian.map(row=>row.map(p=>E(p,at)));return{text:'Vektör değerli fonksiyonun Jacobi matrisini bulun. Satırlar çıktı, sütunlar girdi sırasını izlesin.',eq:`G(${variables})=(${functions})`,eqLatex:`G(${variables})=${vector(functions.map(T))}`,solution:'J_ij=∂G_i/∂x_j.',verification:{kind:'jacobian',variables,functions,jacobian,at,values}};}
  const primitives=[
    ['polynomial',['power'],c=>({f:`${c.a}*x^${c.n}*y^2+${c.b}*y`,x:`${c.a}*x^${c.n+1}*y^2/${c.n+1}+${c.b}*x*y`,y:`${c.a}*x^${c.n}*y^3/3+${c.b}*y^2/2`})],
    ['sine',['trig','substitution'],c=>({f:`sin(${c.a}*x+${c.b}*y)`,x:`-cos(${c.a}*x+${c.b}*y)/${c.a}`,y:`-cos(${c.a}*x+${c.b}*y)/${c.b}`})],
    ['exponential',['exponential','substitution'],c=>({f:`exp(${c.a}*x+${c.b}*y)`,x:`exp(${c.a}*x+${c.b}*y)/${c.a}`,y:`exp(${c.a}*x+${c.b}*y)/${c.b}`})],
    ['log-radial',['logarithm','substitution'],c=>({f:`x*y/(x^2+y^2+${c.a})`,x:`y*log(x^2+y^2+${c.a})/2`,y:`x*log(x^2+y^2+${c.a})/2`})],
    ['mixed',['exponential','power'],c=>({f:`(x^2+${c.a})*exp(y)`,x:`(x^3/3+${c.a}*x)*exp(y)`,y:`(x^2+${c.a})*exp(y)`})],
    ['product',['trig','power'],c=>({f:'y*cos(x)',x:'y*sin(x)',y:'y^2*cos(x)/2'})],
    ['inverse',['inverse','power'],c=>({f:'x/(1+y^2)',x:'x^2/(2*(1+y^2))',y:'x*atan(y)'})],
    ['logarithm',['logarithm','parts'],c=>({f:'log(x)*y',x:'(x*log(x)-x)*y',y:'log(x)*y^2/2'})]
  ];
  function primitiveTask(c,make,axis){const p=make(c),other=axis==='x'?'y':'x',v={kind:'parameter-integral',f:p.f,F:p[axis],axis,other};return{text:`${axis} değişkenine göre belirsiz integral alın; ${other} sabit parametredir. x>0, y>0 bölgesinde çalışın. İntegrasyon sabitinin hangi değişkene bağlı olabileceğini belirtin.`,eq:`∫(${v.f})d${axis}`,eqLatex:`\\int ${T(v.f)}\\,d${axis}`,solution:`${v.F}+C(${other}). ∂F/∂${axis}=f; C(${other}) bu türevde sıfır verir.`,verification:v};}
  const regions=[
    ['exponential',['double-rect','exponential'],c=>({f:'exp(x+y)',bounds:[[0,1],[0,2]],inner:'exp(x)*(exp(2)-1)',value:'(exp(1)-1)*(exp(2)-1)'})],
    ['sine-sum',['double-rect','trig'],c=>({f:'sin(x+y)',bounds:[[0,1],[0,1]],inner:'cos(x)-cos(x+1)',value:'2*sin(1)-sin(2)'})],
    ['coupled-exponential',['double-rect','exponential','substitution'],c=>({f:'(1+x*y)*exp(x*y)',bounds:[[0,1],[0,2]],inner:'2*exp(2*x)',value:'exp(2)-1'})],
    ['rational',['double-rect','inverse'],c=>({f:'1/((1+x^2)*(1+y^2))',bounds:[[0,1],[0,1]],inner:'atan(1)/(1+x^2)',value:'pi^2/16'})],
    ['polynomial-trig',['double-rect','trig','power'],c=>({f:`${c.a}*x^2*cos(y)`,bounds:[[0,2],[0,1]],inner:`${c.a}*x^2*sin(1)`,value:`${c.a}*8*sin(1)/3`})],
    ['triangle-sine',['double-region','trig'],c=>({f:'sin(x+y)',bounds:[[0,1],[0,'x']],inner:'cos(x)-cos(2*x)',value:'sin(1)-sin(2)/2',triangle:true})],
    ['triple-exponential',['triple','exponential'],c=>({f:'exp(x+y+z)',bounds:[[0,1],[0,1],[0,1]],inner:'exp(x+y)*(exp(1)-1)',middle:'exp(x)*(exp(1)-1)^2',value:'(exp(1)-1)^3'})]
  ];
  function iteratedTask(c,make){const p=make(c),variables=p.bounds.length===3?['x','y','z']:['x','y'];const v={kind:'iterated-general',...p,variables,answer:E(p.value,{})};return{text:'Çok değişkenli fonksiyonun katlı integralini hesaplayın; her aşamada diğer değişkenleri sabit tutun.',eq:`f(${variables})=${p.f}; ${p.bounds.map(([a,b],i)=>`${a}≤${variables[i]}≤${b}`).join(', ')}`,eqLatex:integralTex(v),solution:`İç integral: ${p.inner}. ${p.middle?'Sonraki integral: '+p.middle+'. ':''}Sonuç: ${p.value}.`,verification:v};}
  function integralTex(v){const axes=v.reverse?v.variables.slice().reverse():v.variables,bounds=v.reverse?(v.triangle?[[0,1],['y',1]]:v.bounds.slice().reverse()):v.bounds;return axes.map((x,i)=>`\\int_{${T(bounds[i][0])}}^{${T(bounds[i][1])}}`).join('')+T(v.f)+axes.slice().reverse().map(x=>'\\,d'+x).join('');}
  function extend(bank,extraTopics,entries){
    const baseGenerate=bank.generate,baseTemplates=bank.templates.slice();bank.topics.push(...extraTopics.map(([id,label,en,formula])=>({id,label,en,formula})));bank.defaults.push(...extraTopics.map(t=>t[0]));bank.normalize=value=>Array.isArray(value)?bank.defaults.filter(id=>value.includes(id)):bank.defaults.slice();
    const all=[...baseTemplates,...entries];bank.templates=all.map(({id,required})=>({id,required}));const available=selected=>{const enabled=new Set(bank.normalize(selected));return all.filter(t=>t.required.every(id=>enabled.has(id)));};bank.available=available;
    bank.generate=(seed,index,selected=bank.defaults,forcedId=null)=>{const enabled=bank.normalize(selected),pool=available(enabled);if(!pool.length)throw Error('Select compatible topics.');const item=forcedId?pool.find(t=>t.id===forcedId):PracticeMath.choose(seed,index,pool);if(!item)throw Error('Unknown template '+forcedId);if(!item.build)return baseGenerate(seed,index,enabled,item.id);
      const random=PracticeMath.generator(seed,index+43991),int=(a,b)=>a+Math.floor(random()*(b-a+1)),c={a:int(2,5),b:int(1,4),n:int(2,4)},q=item.build(c),mode=bank===DerivativeBank?'derivatives':'integrals';return{id:`${mode}-multivariable-${seed>>>0}-${index}`,generatorVersion:'multivariable-v1',program:mode,educationMode:'university',topicId:item.required[0],subtopicId:item.id,template:item.id,index,scope:{program:mode,topics:enabled},requiredTopics:item.required.slice(),parameters:c,...q,solutionLatex:null,diagram:'',choices:[],correct:null,supportsChoices:false,responseType:'expression',difficultyProfile:{base:3.8,steps:4},english:{text:q.text,solution:q.solution}};
    };
  }
  const derivatives=[];for(const[id,required,make]of families)for(const[kind,topic]of [['gradient','gradient'],['directional','directional'],['steepest','directional'],['hessian','hessian'],['multivariable-chain','multivariable-chain']])derivatives.push({id:`${kind}-${id}`,required:[topic,'partial',...required],build:c=>derivativeTask(c,make,id,kind)});
  for(const three of [false,true])derivatives.push({id:'jacobian-'+(three?'three':'two'),required:['multivariable-chain','partial','polynomial'],build:c=>jacobianTask(c,three)});
  extend(DerivativeBank,[['gradient','Gradyan vektörü','Gradient vector','∇f=(f_x,f_y,f_z)'],['directional','Yönlü türev ve en hızlı artış','Directional derivatives and steepest ascent','D_u f=∇f·u; |u|=1'],['hessian','Hessian ve ikinci kısmi türevler','Hessian and second partial derivatives','H_ij=∂²f/(∂x_i ∂x_j)'],['multivariable-chain','Çok değişkenli zincir ve Jacobi','Multivariable chain rule and Jacobians','d(f∘r)/dt=∇f(r(t))·r′(t); J_ij=∂G_i/∂x_j']],derivatives);
  const integrals=[];for(const[id,required,make]of primitives)for(const axis of ['x','y'])integrals.push({id:`parameter-integral-${id}-${axis}`,required:['multivariable-integral',...required],build:c=>primitiveTask(c,make,axis)});for(const[id,required,make]of regions)integrals.push({id:'iterated-general-'+id,required,build:c=>iteratedTask(c,make)});
  extend(IntegralBank,[['multivariable-integral','Çok değişkenli: parametreli belirsiz integral','Multivariable antiderivatives with parameters','∫f(x,y)dx=F(x,y)+C(y)']],integrals);
  function transfer(q){const v=q.verification;if(!kinds.has(v.kind))return null;const w=structuredClone(v);let text,solution;
    if(v.kind==='gradient'){w.kind='gradient-point';text=`P=(${v.variables.map(x=>v.at[x])}) noktasındaki gradyan vektörünü bulun.`;solution='Önce bileşenleri türevleyin, sonra noktayı yerine koyun: '+v.values.map(F).join(', ');}
    else if(v.kind==='directional'){w.kind='gradient-linearization';w.increments=v.variables.map((x,i)=>(i+1)/100);w.answer=v.value+dot(v.values,w.increments);text=`P=(${v.variables.map(x=>v.at[x])}) noktasını kullanarak f(P+h) için toplam diferansiyelle doğrusal yaklaşım bulun; h=(${w.increments.map(F)}).`;solution=`f(P+h)≈f(P)+∇f(P)·h≈${F(w.answer)}.`;}
    else if(v.kind==='steepest'){w.kind='steepest-min';w.answer=-v.rate;text=`P=(${v.variables.map(x=>v.at[x])}) noktasında en hızlı azalış yönü ve en küçük yönlü türev nedir?`;solution=`En hızlı azalış yönü −∇f/|∇f|; en küçük yönlü türev −|∇f|=${F(w.answer)}.`;}
    else if(v.kind==='hessian'){w.kind='hessian-invariants';w.trace=v.matrix.reduce((s,row,i)=>s+row[i],0);w.frobenius=norm(v.matrix.flat());text=`P=(${v.variables.map(x=>v.at[x])}) noktasındaki Hessian matrisinin izini ve Frobenius normunu bulun.`;solution=`tr(H)=${F(w.trace)}; |H|_F=sqrt(ΣH_ij²)=${F(w.frobenius)}.`;}
    else if(v.kind==='multivariable-chain'){w.kind='chain-approx';w.h=.01;w.value=E(v.composite,{t:v.t});w.approx=w.value+w.h*v.answer;text=`H(t)=f(${v.variables.map(x=>v.path[x])}) için t=${F(v.t)} noktasında zincir kuralını kullanıp H(${F(v.t+w.h)}) değerini doğrusal yaklaşımla bulun.`;solution=`H(t+h)≈H(t)+hH′(t)≈${F(w.approx)}.`;}
    else if(v.kind==='jacobian'){w.kind='jacobian-increment';w.increments=v.variables.map((x,i)=>(i+1)/100);w.answer=v.values.map(row=>dot(row,w.increments));text=`P=(${v.variables.map(x=>v.at[x])}) noktasında h=(${w.increments.map(F)}) artışı için çıktıdaki yaklaşık değişimi Jacobi matrisiyle bulun.`;solution='ΔG≈J(P)h=('+w.answer.map(F).join(', ')+').';}
    else if(v.kind==='parameter-integral'){w.kind='parameter-initial';w.anchor=1;w.answerExpression=`(${v.F})-(${sub(v.F,{[v.axis]:1})})`;text=`∂u/∂${v.axis}=f(x,y) ve u(${v.axis}=1,${v.other})=0 koşulunu sağlayan u fonksiyonunu bulun. x>0, y>0.`;q.eq=`f(x,y)=${v.f}`;q.eqLatex='f(x,y)='+T(v.f);solution=`İntegrasyon sabiti ${v.other} değişkenine bağlıdır. u=${w.answerExpression}.`;}
    else if(v.kind==='iterated-general'){w.reverse=true;text='Aynı bölgeyi koruyarak integralin sırasını ters çevirin; ardından değerini hesaplayın.';solution=`Bölgeyi yeni sırada yazın. Değişkenler üzerindeki kısmi integraller tamamlandığında sonuç yine ${v.value}.`;q.eqLatex=integralTex(w);}
    else throw Error('Missing multivariable transfer '+v.kind);
    return{...q,text,solution,solutionLatex:null,english:{text,solution},verification:w};
  }
  function audit(v,correct){if(!kinds.has(v.kind))return null;let candidate,claim;
    if(v.kind==='gradient'){candidate=v.partials.slice();if(!correct)candidate[0]='('+candidate[0]+')+1';claim='∇f=('+candidate.join(', ')+')';}
    else if(v.kind==='parameter-integral'){candidate=correct?v.F:`(${v.F})+${v.axis}`;claim=`∫f d${v.axis}=${candidate}+C(${v.other})`;}
    else if(v.kind==='jacobian'||v.kind==='hessian'){candidate=structuredClone(v.kind==='jacobian'?v.jacobian:v.hessian);if(!correct)candidate[0][0]='('+candidate[0][0]+')+1';claim='Önerilen matris satırları: '+candidate.map(row=>'('+row.join(', ')+')').join('; ');}
    else{candidate=(v.kind==='steepest'?v.rate:v.answer)+(correct?0:1);claim='İstenen hız/değer ≈'+F(candidate);}
    return{candidate,claim};
  }
  const S=(title,body='',latex=null)=>({title,body,latex});
  function steps(q,v){if(!kinds.has(v.kind))return null;
    if(v.kind==='parameter-integral'||v.kind==='parameter-initial'){
      const steps=[S('Sabit parametreyi belirleyin',`${v.axis} değişir; ${v.other} sabit kabul edilir. Bu nedenle integral sabiti C(${v.other}) olabilir.`,q.eqLatex),S('Seçilen değişkene göre integral alın','',`F_0(x,y)=${T(v.F)}`),S('Kısmi türev alarak kontrol edin','',`\\frac{\\partial F_0}{\\partial ${v.axis}}=${T(v.f)}`)];
      if(v.kind==='parameter-initial')steps.push(S('Başlangıç koşulunu uygulayın',`u(${v.axis}=1,${v.other})=0.`,`C(${v.other})=-\\left(${T(sub(v.F,{[v.axis]:1}))}\\right)`),S('Koşulu sağlayan fonksiyonu yazın','',`u(x,y)=${T(v.answerExpression)}`));
      else steps.push(S('Parametreye bağlı sabiti ekleyin','',`\\int f(x,y)\\,d${v.axis}=${T(v.F)}+C(${v.other})`));return steps;
    }
    if(v.kind==='iterated-general'){const order=v.reverse?v.variables.slice().reverse():v.variables;const steps=[S('Bölgeyi ve sırayı yazın','İçten dışa integral sırası: '+order.slice().reverse().join(', ')+'.',integralTex(v))];if(v.reverse)steps.push(S('Aynı bölgeyi yeni sınırlarla tanımlayın',v.triangle?'0≤y≤1, y≤x≤1.':'Dikdörtgen/kutu bölgesinde bağımsız sınırlar değişkenlerle birlikte yer değiştirir.'),S('Fubini ile ilk sıradan doğrulayın','Aynı sürekli fonksiyon ve aynı bölge iki sırada aynı değeri verir.',integralTex({...v,reverse:false})));
      steps.push(S('İç integrali alın','Diğer değişkenleri sabit tutun.',`I_1=${T(v.inner)}`));if(v.middle)steps.push(S('İkinci değişkeni integre edin','',`I_2=${T(v.middle)}`));steps.push(S('Dış integrali ve sınırları uygulayın','',`I=${T(v.value)}`),S('Sonucu yazın','',`I\\approx ${N(v.answer)}`));return steps;
    }
    if(v.kind==='jacobian'||v.kind==='jacobian-increment'){const steps=[S('Girdi ve çıktı sırasını belirleyin','Sütunlar '+v.variables.join(', ')+' sırasındadır.',q.eqLatex),...v.functions.map((f,i)=>S(`${i+1}. çıktının kısmi türevlerini alın`,'',`\\nabla G_{${i+1}}=${vector(v.jacobian[i].map(T))}`)),S('Satırları Jacobi matrisinde birleştirin','',`J_G=${matrix(v.jacobian.map(row=>row.map(T)))}`)];if(v.kind==='jacobian-increment')steps.push(S('Noktayı ve küçük artışı yerleştirin','Birinci mertebe yaklaşım; eşitlik yaklaşık olarak geçerlidir.',`\\Delta G\\approx J_G(P)h=${vector(v.answer.map(N))}`));return steps;}
    const steps=[S('Değişkenleri ve tanım bölgesini yazın','Verilen pozitif değişkenler bölgesinde çalışın.',`f(${v.variables})=${T(v.f)}`),...v.partials.map((p,i)=>S(`${v.variables[i]} değişkenine göre kısmi türev alın`,'Diğer değişkenleri sabit tutun.',`f_{${v.variables[i]}}=${T(p)}`)),S('Gradyan bileşenlerini birleştirin','',`\\nabla f=${vector(v.partials.map(T))}`)];
    if(v.kind!=='gradient')steps.push(S('İstenen noktayı yerine koyun','',`\\nabla f(P)\\approx ${vector(v.values.map(N))}`));
    if(v.kind==='directional')steps.push(S('Yön vektörünü birimleştirin','',`u=\\frac{v}{\\lVert v\\rVert}=${vector(v.unit.map(N))}`),S('Skaler çarpımı hesaplayın','',`D_u f(P)=\\nabla f(P)\\cdot u\\approx ${N(v.answer)}`));
    if(['steepest','steepest-min'].includes(v.kind)){const sign=v.kind==='steepest'?1:-1;steps.push(S('Gradyanın uzunluğunu bulun','',`\\lVert\\nabla f(P)\\rVert\\approx ${N(v.rate)}`),S(sign===1?'En hızlı artış yönünü yazın':'En hızlı azalış yönünü yazın',sign===1?'Gradyan yönü en hızlı artış yönüdür.':'Gradyanın ters yönü en hızlı azalış yönüdür.',`u\\approx ${vector(v.unit.map(x=>N(sign*x)))},\\quad D_u f(P)\\approx ${N(sign*v.rate)}`));}
    if(v.kind==='gradient-linearization')steps.push(S('Toplam diferansiyelle artışı bulun','',`df=\\nabla f(P)\\cdot h`),S('Birinci mertebe yaklaşımı yazın','',`f(P+h)\\approx f(P)+df\\approx ${N(v.answer)}`));
    if(v.kind==='hessian'||v.kind==='hessian-invariants'){steps.push(...v.hessian.map((row,i)=>S(`${v.variables[i]} türevinin ikinci türevlerini alın`,'Sütun sırası '+v.variables.join(', ')+'.',vector(row.map(T)))),S('Hessian matrisini oluşturun','',`H_f=${matrix(v.hessian.map(row=>row.map(T)))}`),S('Noktadaki matrisi hesaplayın','',`H_f(P)\\approx ${matrix(v.matrix.map(row=>row.map(N)))}`));if(v.kind==='hessian-invariants')steps.push(S('İzi ve Frobenius normunu hesaplayın','İz köşegen toplamı, Frobenius normu tüm elemanların kare toplamının kareköküdür.',`\\mathrm{tr}(H)\\approx ${N(v.trace)},\\quad\\lVert H\\rVert_F\\approx ${N(v.frobenius)}`));}
    if(v.kind==='multivariable-chain'||v.kind==='chain-approx')steps.push(S('İç fonksiyonların türevlerini alın','',vector(v.pathDerivatives.map(T))),S('Çok değişkenli zincir kuralını uygulayın','Kısmi türevleri yol üzerinde değerlendirip iç türevlerle çarpın ve toplayın.',`H'(t)=${T(v.expression)}`),S('Parametre değerini yerleştirin','',`H'(${N(v.t)})\\approx ${N(v.answer)}`));if(v.kind==='chain-approx')steps.push(S('Doğrusal yaklaşımı uygulayın','',`H(t+h)\\approx H(t)+hH'(t)\\approx ${N(v.approx)}`));
    return steps;
  }
  globalThis.MultivariablePractice={kinds,transfer,audit,steps};
})();
