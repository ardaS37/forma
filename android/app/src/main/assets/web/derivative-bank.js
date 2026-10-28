/* Offline, seeded derivative library. Expressions and answers share a serializable AST;
   every template declares all skills it uses, including skills inside compositions. */
(() => {
  'use strict';
  const topics = [
    ['polynomial','Polinom ve kuvvet','Polynomials and powers','x^n → n*x^(n-1)'],
    ['roots','Kök ve kesirli kuvvet','Roots and fractional powers','sqrt(x) → 1/(2*sqrt(x))'],
    ['negative','Negatif kuvvet','Negative powers','x^(-n) → -n*x^(-n-1)'],
    ['product','Çarpım kuralı','Product rule',"(u*v)′ = u′*v + u*v′"],
    ['quotient','Bölüm kuralı','Quotient rule',"(u/v)′ = (u′*v-u*v′)/v^2"],
    ['chain','Zincir kuralı','Chain rule',"f(g(x))′ = f′(g(x))*g′(x)"],
    ['trig','Trigonometrik fonksiyonlar','Trigonometric functions','sin(x) → cos(x); cos(x) → -sin(x)'],
    ['inverse','Ters trigonometrik fonksiyonlar','Inverse trigonometric functions','asin(x) → 1/sqrt(1-x^2); atan(x) → 1/(1+x^2)'],
    ['exponential','Üstel fonksiyonlar','Exponential functions','exp(x) → exp(x); a^x → a^x*ln(a)'],
    ['logarithm','Logaritmik fonksiyonlar','Logarithmic functions','ln(x) → 1/x; log_a(x) → 1/(x*ln(a))'],
    ['logdiff','Logaritmik türev','Logarithmic differentiation',"u(x)^v(x) → u^v*(v′*ln(u)+v*u′/u)"],
    ['second','İkinci türev','Second derivatives',"f″(x) = (f′(x))′"],
    ['higher','Yüksek mertebeden türev','Higher derivatives',"f″(x) = (f′(x))′"],
    ['point','Bir noktadaki türev','Derivative at a point',"f′(a): önce türev al, sonra x=a yaz."],
    ['tangent','Teğet ve normal','Tangent and normal',"y-f(a) = f′(a)*(x-a)"],
    ['definition','Tanımdan türev','Derivative from the definition',"f′(a) = lim_(h→0) (f(a+h)-f(a))/h"],
    ['implicit','Kapalı fonksiyon','Implicit differentiation',"F(x,y)=0 → y′ = -F_x/F_y; F_y ≠ 0"],
    ['parametric','Parametrik türev','Parametric derivatives',"dy/dx = (dy/dt)/(dx/dt); dx/dt ≠ 0"],
    ['piecewise','Mutlak değer ve türevlenebilirlik','Absolute value and differentiability',"Türev için süreklilik ve eşit tek taraflı türevler gerekir."],
    ['extrema','Artma, azalma ve ekstremum','Monotonicity and extrema',"f′>0: artan; f′<0: azalan."],
    ['leibniz','dy/dx ve dx/dy','Leibniz and inverse derivative notation',"dx/dy=1/(dy/dx); dy/dx≠0"],
    ['differential','Diferansiyel ve d(ax+b)','Differentials and d(ax+b)',"dy=f′(x)dx; d(ax+b)=a*dx"],
    ['partial','Kısmi türev','Partial derivatives',"∂f/∂x: diğer değişken sabit tutulur."],
    ['total','Toplam diferansiyel','Total differentials',"df=f_x dx+f_y dy"],
    ['rates','Değişim hızı ve optimizasyon','Rates and optimization',"Hız = konumun türevi; ivme = hızın türevi."]
  ].map(([id,label,en,formula])=>({id,label,en,formula}));
  const defaults = topics.map(t=>t.id);
  const normalize = value => Array.isArray(value) ? defaults.filter(id=>value.includes(id)) : defaults.slice();
  const C = value => ({op:'c',value}), X={op:'x'};
  const is = (a,n) => a.op==='c' && a.value===n;
  function add(a,b) { if(is(a,0))return b;if(is(b,0))return a;if(a.op==='c'&&b.op==='c')return C(a.value+b.value);return {op:'add',a,b}; }
  function mul(a,b) { if(is(a,0)||is(b,0))return C(0);if(is(a,1))return b;if(is(b,1))return a;if(a.op==='c'&&b.op==='c')return C(a.value*b.value);return {op:'mul',a,b}; }
  const neg = a=>mul(C(-1),a), sub=(a,b)=>add(a,neg(b));
  function div(a,b) {if(is(a,0))return C(0);if(is(b,1))return a;return {op:'div',a,b};}
  function pow(a,n) {if(n===0)return C(1);if(n===1)return a;return {op:'pow',a,n};}
  const fn = (op,a)=>({op,a}), variablePower=(a,b)=>({op:'vpow',a,b});
  function derivative(e) {
    const a=e.a,b=e.b,da=a&&derivative(a);
    switch(e.op) {
      case 'c': return C(0); case 'x': return C(1);
      case 'add': return add(da,derivative(b));
      case 'mul': return add(mul(da,b),mul(a,derivative(b)));
      case 'div': return div(sub(mul(da,b),mul(a,derivative(b))),pow(b,2));
      case 'pow': return mul(mul(C(e.n),pow(a,e.n-1)),da);
      case 'vpow': return mul(e,add(mul(derivative(b),fn('ln',a)),div(mul(b,da),a)));
      case 'sin': return mul(fn('cos',a),da);
      case 'cos': return neg(mul(fn('sin',a),da));
      case 'tan': return div(da,pow(fn('cos',a),2));
      case 'cot': return neg(div(da,pow(fn('sin',a),2)));
      case 'sec': return mul(mul(fn('sec',a),fn('tan',a)),da);
      case 'csc': return neg(mul(mul(fn('csc',a),fn('cot',a)),da));
      case 'asin': return div(da,pow(sub(C(1),pow(a,2)),.5));
      case 'acos': return neg(div(da,pow(sub(C(1),pow(a,2)),.5)));
      case 'atan': return div(da,add(C(1),pow(a,2)));
      case 'acot': return neg(div(da,add(C(1),pow(a,2))));
      case 'exp': return mul(e,da);
      case 'ln': case 'lnabs': return div(da,a);
      case 'abs': return div(mul(a,da),fn('abs',a));
      default: throw Error('Unsupported expression: '+e.op);
    }
  }
  function evaluate(e,x) {
    const a=e.a&&evaluate(e.a,x),b=e.b&&evaluate(e.b,x);
    switch(e.op) {
      case 'c':return e.value;case 'x':return x;case 'add':return a+b;case 'mul':return a*b;
      case 'div':return a/b;case 'pow':return a**e.n;case 'vpow':return a**b;
      case 'sin':case 'cos':case 'tan':case 'asin':case 'acos':case 'atan':case 'exp':return Math[e.op](a);
      case 'ln':return Math.log(a);case 'lnabs':return Math.log(Math.abs(a));case 'abs':return Math.abs(a);case 'cot':return 1/Math.tan(a);case 'sec':return 1/Math.cos(a);case 'csc':return 1/Math.sin(a);case 'acot':return Math.PI/2-Math.atan(a);
      default:throw Error('Unsupported expression: '+e.op);
    }
  }
  const num=n=>globalThis.ExactMath?ExactMath.asciiNumber(n):Number.isInteger(n)?String(n):n===.5?'1/2':n===-.5?'-1/2':String(n);
  function ascii(e,v='x') {
    const a=e.a&&ascii(e.a,v),b=e.b&&ascii(e.b,v);
    switch(e.op) {
      case 'c':return num(e.value);case 'x':return v;case 'add':return e.b.op==='c'&&e.b.value<0?`(${a} - ${num(-e.b.value)})`:`(${a} + ${b})`;case 'mul':return `(${a} * ${b})`;
      case 'div':return `(${a})/(${b})`;case 'pow':return `(${a})^(${num(e.n)})`;case 'vpow':return `(${a})^(${b})`;
      case 'lnabs':return `ln(abs(${a}))`;default:return `${e.op}(${a})`;
    }
  }
  function latex(e,v='x') {
    const a=e.a&&latex(e.a,v),b=e.b&&latex(e.b,v),group=(n,t)=>n.op==='add'?`\left(${t}\right)`:t;
    switch(e.op) {
      case 'c':return globalThis.ExactMath?ExactMath.latexNumber(e.value):num(e.value);case 'x':return v;
      case 'add':return e.b.op==='c'&&e.b.value<0?`${a}-${globalThis.ExactMath?ExactMath.latexNumber(-e.b.value):num(-e.b.value)}`:`${a}+${b}`;
      case 'mul':return is(e.a,-1)?`-${group(e.b,b)}`:e.a.op==='c'?`${a}\\,${group(e.b,b)}`:`${group(e.a,a)}\\cdot ${group(e.b,b)}`;
      case 'div':return `\\frac{${a}}{${b}}`;
      case 'pow':return e.n===.5?`\\sqrt{${a}}`:`${e.a.op==='x'?a:`\\left(${a}\\right)`}^{${globalThis.ExactMath?ExactMath.latexNumber(e.n):num(e.n)}}`;
      case 'vpow':return `\\left(${a}\\right)^{${b}}`;case 'exp':return `e^{${a}}`;
      case 'lnabs':return `\\ln\\left|${a}\\right|`;case 'abs':return `\\left|${a}\\right|`;
      case 'asin':case 'acos':case 'atan':case 'acot':return `\\operatorname{arc${e.op.slice(1)}}\\left(${a}\\right)`;
      default:return `\\${e.op}\\left(${a}\\right)`;
    }
  }
  const templates=[];
  function register(id,required,build,kind='differentiate') {templates.push({id,required,build,kind});}
  function generator(seed,index) {let a=(seed^Math.imul(index+1,0x9e3779b9))>>>0;return ()=>{a+=0x6D2B79F5;let t=Math.imul(a^a>>>15,1|a);t^=t+Math.imul(t^t>>>7,61|t);return ((t^t>>>14)>>>0)/4294967296;};}
  function context(random) {
    const int=(min,max)=>min+Math.floor(random()*(max-min+1)),a=int(2,7),b=int(1,8),n=int(2,6);
    const linear=add(mul(C(a),X),C(b)),positive=add(pow(X,2),C(b)),poly=add(add(mul(C(a),pow(X,n)),mul(C(b),X)),C(int(-9,9)));
    return {int,a,b,n,linear,positive,poly};
  }
  register('constant',['polynomial'],c=>C(c.int(-30,30)));
  register('linear',['polynomial'],c=>c.linear);
  register('monomial',['polynomial'],c=>mul(C(c.a),pow(X,c.n)));
  register('polynomial',['polynomial'],c=>c.poly);
  register('sparse-polynomial',['polynomial'],c=>sub(mul(C(c.a),pow(X,c.n+2)),mul(C(c.b),pow(X,2))));
  register('fractional-coefficient',['polynomial'],c=>add(mul(C(c.a/c.b),pow(X,c.n)),X));
  for(const n of [.5,1.5,2.5])register('root-'+n,['roots'],c=>mul(C(c.a),pow(X,n)));
  for(const n of [-1,-2,-3,-4])register('negative-'+n,['negative'],c=>mul(C(c.a),pow(X,n)));
  for(const op of ['sin','cos','tan','cot','sec','csc']) {
    register(op,['trig'],c=>mul(C(c.a),fn(op,X)));
    register(op+'-chain',['trig','chain'],c=>fn(op,c.linear));
    register(op+'-product',['trig','product','polynomial'],c=>mul(pow(X,c.n),fn(op,X)));
  }
  for(const op of ['asin','acos','atan','acot']) {
    register(op,['inverse'],c=>mul(C(c.a),fn(op,X)));
    register(op+'-chain',['inverse','chain'],c=>fn(op,mul(C(1/c.a),X)));
  }
  register('natural-exponential',['exponential'],c=>mul(C(c.a),fn('exp',X)));
  register('base-exponential',['exponential'],c=>variablePower(C(c.a),X));
  register('exponential-chain',['exponential','chain','polynomial'],c=>fn('exp',c.poly));
  register('base-exponential-chain',['exponential','chain'],c=>variablePower(C(c.a),c.linear));
  register('exponential-product',['exponential','product','polynomial'],c=>mul(c.poly,fn('exp',X)));
  register('natural-logarithm',['logarithm'],c=>mul(C(c.a),fn('ln',X)));
  register('base-logarithm',['logarithm'],c=>div(fn('ln',X),fn('ln',C(c.a))));
  register('logarithm-chain',['logarithm','chain','polynomial'],c=>fn('ln',c.positive));
  register('logarithm-product',['logarithm','product','polynomial'],c=>mul(pow(X,c.n),fn('ln',X)));
  register('power-chain',['polynomial','chain'],c=>pow(c.linear,c.n));
  register('power-nested',['polynomial','chain'],c=>pow(add(pow(c.linear,2),C(c.b)),c.n));
  register('root-chain',['roots','chain','polynomial'],c=>pow(c.positive,.5));
  register('negative-chain',['negative','chain','polynomial'],c=>pow(c.positive,-c.n));
  register('polynomial-product',['polynomial','product'],c=>mul(c.poly,c.linear));
  register('polynomial-quotient',['polynomial','quotient'],c=>div(c.poly,c.positive));
  register('root-quotient',['roots','quotient'],c=>div(pow(X,1.5),add(X,C(c.b))));
  register('trig-quotient',['trig','quotient'],c=>div(fn('sin',X),add(C(c.a),fn('cos',X))));
  register('exp-trig-product',['exponential','trig','product'],c=>mul(fn('exp',X),fn('sin',X)));
  register('log-trig-chain',['logarithm','trig','chain'],c=>fn('ln',add(C(c.a),fn('sin',X))));
  register('exp-trig-chain',['exponential','trig','chain'],c=>fn('exp',fn('sin',X)));
  register('trig-exp-chain',['exponential','trig','chain'],c=>fn('sin',fn('exp',X)));
  register('root-log-chain',['roots','logarithm','chain'],c=>pow(fn('ln',X),.5));
  register('nested-log',['logarithm','chain'],c=>fn('ln',fn('ln',X)));
  register('power-of-x',['logdiff','logarithm'],c=>variablePower(X,X));
  register('variable-power',['logdiff','logarithm','polynomial'],c=>variablePower(c.positive,X));
  register('trig-variable-power',['logdiff','logarithm','trig'],c=>variablePower(X,fn('sin',X)));
  for(const kind of ['point','tangent','normal','definition','second','higher']) {
    register(kind+'-polynomial',[kind==='normal'?'tangent':kind,'polynomial'],c=>c.poly,kind);
    if(kind!=='definition') {
      register(kind+'-trig',[kind==='normal'?'tangent':kind,'trig'],c=>mul(C(c.a),fn('sin',X)),kind);
      register(kind+'-exponential',[kind==='normal'?'tangent':kind,'exponential'],c=>mul(C(c.a),fn('exp',X)),kind);
    }
  }
  register('circle',['implicit'],c=>({radius:c.a}), 'implicit');
  register('ellipse',['implicit'],c=>({radius:c.a,coefficient:c.b}), 'implicit');
  register('parametric-polynomial',['parametric','polynomial'],c=>({x:mul(C(c.a),X),y:c.poly}), 'parametric');
  register('parametric-trig',['parametric','trig'],c=>({x:mul(C(c.a),fn('cos',X)),y:mul(C(c.b),fn('sin',X))}), 'parametric');
  register('absolute-corner',['piecewise'],c=>({at:c.b,scale:c.a}), 'piecewise');
  register('piecewise-match',['piecewise','polynomial'],c=>({at:c.b,scale:c.a}), 'match');
  register('quadratic-extrema',['extrema','polynomial'],c=>({at:c.b,scale:c.a,offset:c.int(-8,8)}), 'extrema');
  register('cubic-monotonicity',['extrema','polynomial'],c=>({at:c.b}), 'monotonicity');
  register('motion-rate',['rates','polynomial'],c=>c.poly,'rates');
  register('rectangle-optimization',['rates','polynomial','extrema'],c=>({halfPerimeter:c.a*4}), 'optimization');

  register('sine-power',['trig','chain','polynomial'],c=>pow(fn('sin',X),c.n));
  register('cosine-power',['trig','chain','polynomial'],c=>pow(fn('cos',X),c.n));
  register('negative-square-exponential',['exponential','chain','polynomial'],c=>fn('exp',mul(C(-c.a),pow(X,2))));
  register('logarithm-rational-product',['logarithm','quotient','polynomial'],c=>div(fn('ln',X),c.positive));
  register('inverse-rational-product',['inverse','quotient','polynomial'],c=>div(fn('atan',X),c.positive));
  register('nested-square-root',['roots','chain','polynomial'],c=>pow(pow(c.positive,.5),.5));
  register('log-exponential-composition',['exponential','logarithm','chain'],c=>fn('exp',add(fn('ln',X),X)));
  register('exponential-fraction',['exponential','quotient'],c=>div(fn('exp',X),add(C(c.a),fn('exp',X))));
  register('simplify-rational-square',['polynomial','quotient','chain'],c=>pow(div(pow(X,2),mul(C(c.a),X)),2));
  register('leibniz-polynomial',['leibniz','polynomial'],c=>c.poly,'leibniz');
  register('leibniz-chain',['leibniz','chain','polynomial'],c=>pow(c.linear,c.n),'leibniz');
  register('inverse-notation',['leibniz','polynomial'],c=>add(mul(C(c.a),pow(X,2)),C(c.b)),'inverse-notation');
  register('linear-differential',['differential'],c=>c.linear,'differential');
  register('quadratic-differential',['differential','polynomial'],c=>c.poly,'differential');
  register('chain-differential',['differential','chain','trig'],c=>fn('sin',c.linear),'differential');
  for(const axis of ['x','y','xy'])register('partial-'+axis,['partial','polynomial'],c=>({a:c.a,b:c.b,m:c.n,n:2,axis}),'partial');
  register('total-quadratic',['total','partial','polynomial'],c=>({a:c.a,b:c.b,k:c.n}),'total');
  for(const op of ['sin','cos','tan','cot'])register('quadratic-inner-'+op,['trig','chain','polynomial'],c=>fn(op,c.positive));
  register('sin-exp-inner',['trig','exponential','chain'],c=>fn('sin',fn('exp',c.linear)));
  register('cos-log-inner',['trig','logarithm','chain'],c=>fn('cos',fn('ln',c.positive)));
  register('log-sin-square',['logarithm','trig','chain','polynomial'],c=>fn('ln',add(C(c.a),pow(fn('sin',X),2))));
  register('root-cos-inner',['roots','trig','chain'],c=>pow(add(C(c.a),fn('cos',X)),.5));
  register('variable-base-sine-exponent',['logdiff','logarithm','trig','polynomial','chain'],c=>variablePower(c.positive,fn('sin',X)));
  register('variable-base-linear-exponent',['logdiff','logarithm','polynomial','chain'],c=>variablePower(c.positive,c.linear));
  register('exponential-base-variable-exponent',['logdiff','logarithm','exponential','chain'],c=>variablePower(add(C(c.a),fn('exp',X)),X));
  register('variable-logarithm-base',['logarithm','quotient','chain','polynomial'],c=>div(fn('ln',add(pow(X,2),C(c.b+2))),fn('ln',add(X,C(c.a)))));
  register('nested-trig-product',['trig','product','chain','polynomial'],c=>mul(fn('sin',c.positive),pow(c.linear,c.n)));
  register('nested-trig-quotient',['trig','quotient','chain','polynomial'],c=>div(fn('sin',c.positive),add(C(c.a),pow(fn('cos',X),2))));
  register('long-mixed-composition',['trig','exponential','logarithm','product','chain','polynomial'],c=>mul(fn('exp',fn('sin',c.positive)),fn('ln',add(C(c.a),pow(X,2)))));
  register('number-base-quadratic-exponent',['exponential','chain','polynomial'],c=>variablePower(C(c.a),c.positive));
  register('number-base-trig-exponent',['exponential','trig','chain'],c=>variablePower(C(c.a),fn('sin',X)));
  register('number-base-composite-log',['logarithm','chain','polynomial'],c=>div(fn('ln',c.positive),fn('ln',C(c.a))));
  const multivariableFamilies=[
    ['sine-product',['trig','chain'],c=>({f:'sin(x*y)',x:'y*cos(x*y)',y:'x*cos(x*y)',xx:'-y^2*sin(x*y)',xy:'cos(x*y)-x*y*sin(x*y)',yy:'-x^2*sin(x*y)'})],
    ['exponential-linear',['exponential','chain'],c=>({f:`exp(${c.a}*x+${c.b}*y)`,x:`${c.a}*exp(${c.a}*x+${c.b}*y)`,y:`${c.b}*exp(${c.a}*x+${c.b}*y)`,xx:`${c.a*c.a}*exp(${c.a}*x+${c.b}*y)`,xy:`${c.a*c.b}*exp(${c.a}*x+${c.b}*y)`,yy:`${c.b*c.b}*exp(${c.a}*x+${c.b}*y)`})],
    ['logarithm-radial',['logarithm','chain'],c=>{const u=`(x^2+y^2+${c.a})`;return{f:`log(${u})`,x:`2*x/${u}`,y:`2*y/${u}`,xx:`2/${u}-4*x^2/${u}^2`,xy:`-4*x*y/${u}^2`,yy:`2/${u}-4*y^2/${u}^2`};}],
    ['rational',['quotient'],c=>{const u=`(${c.a}+y)`;return{f:`x/${u}`,x:`1/${u}`,y:`-x/${u}^2`,xx:'0',xy:`-1/${u}^2`,yy:`2*x/${u}^3`};}],
    ['arctangent-product',['inverse','chain'],c=>{const u='(1+x^2*y^2)';return{f:'atan(x*y)',x:`y/${u}`,y:`x/${u}`,xx:`-2*x*y^3/${u}^2`,xy:`(1-x^2*y^2)/${u}^2`,yy:`-2*x^3*y/${u}^2`};}],
    ['root-radial',['roots','chain'],c=>{const u=`(x^2+y^2+${c.a})`;return{f:`sqrt(${u})`,x:`x/sqrt(${u})`,y:`y/sqrt(${u})`,xx:`1/sqrt(${u})-x^2/${u}^(3/2)`,xy:`-x*y/${u}^(3/2)`,yy:`1/sqrt(${u})-y^2/${u}^(3/2)`};}],
    ['variable-power',['logdiff','logarithm'],c=>({f:'x^y',x:'y*x^(y-1)',y:'x^y*log(x)',xx:'y*(y-1)*x^(y-2)',xy:'x^(y-1)*(1+y*log(x))',yy:'x^y*log(x)^2'})],
    ['mixed-product',['trig','exponential','product','chain'],c=>({f:'x^2*exp(y)+sin(x*y)',x:'2*x*exp(y)+y*cos(x*y)',y:'x^2*exp(y)+x*cos(x*y)',xx:'2*exp(y)-y^2*sin(x*y)',xy:'2*x*exp(y)+cos(x*y)-x*y*sin(x*y)',yy:'x^2*exp(y)-x^2*sin(x*y)'})]
  ];
  for(const[id,required,build]of multivariableFamilies)for(const axis of ['x','y','xx','xy','yy'])register(`partial-${id}-${axis}`,['partial',...required],c=>({...build(c),axis}),'partial-general');
  function available(selected) {const set=new Set(normalize(selected));return templates.filter(t=>t.required.every(id=>set.has(id)));}
  // Shuffle whole cycles so every eligible template appears before that cycle repeats.
  function choose(seed,index,pool) {
    const cycle=Math.floor(index/pool.length),random=generator(seed,cycle),order=pool.slice();
    for(let i=order.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[order[i],order[j]]=[order[j],order[i]];}
    return order[index%order.length];
  }
  function generate(seed,index,selected=defaults,forcedId=null) {
    const enabled=normalize(selected),pool=available(enabled);
    if(!pool.length)throw Error('Select at least one compatible derivative topic.');
    const template=(forcedId?pool.find(t=>t.id===forcedId):choose(seed,index,pool)),c=context(generator(seed,index+7919)),built=template.build(c),required=template.required;
    const label=id=>topics.find(t=>t.id===id)?.label||id;
    let expression=built,answer,eq,eqLatex,solutionLatex=null,text='Fonksiyonun x’e göre türevini bulun.',en='Differentiate the function with respect to x.',solution='',solutionEn='',verification;
    const at=c.int(1,3);
    if(['differentiate','second','higher','point','tangent','normal','definition','rates','leibniz','differential','inverse-notation'].includes(template.kind)) {
      answer=derivative(expression);eq=`f(x) = ${ascii(expression)}`;eqLatex=`f(x)=${latex(expression)}`;
      solution=`f′(x) = ${ascii(answer)}.`;solutionEn=solution;solutionLatex=`f'(x)=${latex(answer)}`;
      verification={kind:'derivative',expression,answer};
      if(template.kind==='differential'){text='Diferansiyeli bulun: dy ifadesini dx cinsinden yazın.';en='Find the differential dy in terms of dx.';solution=`dy = (${ascii(answer)}) dx.`;solutionEn=solution;solutionLatex=`dy=(${latex(answer)})\\,dx`;verification={kind:'derivative',expression,answer,notation:'differential'};}else if(template.kind==='leibniz'){text='dy/dx ifadesini bulun ve kullanılan diferansiyel oranını açıklayın.';en='Find dy/dx.';eq=eq.replace('f(x)','y');eqLatex=eqLatex.replace('f(x)','y');verification={kind:'derivative',expression,answer,notation:'dy/dx'};}else if(template.kind==='inverse-notation'){answer=div(C(1),answer);text='y(x) bağıntısında dx/dy ifadesini bulun; x>0 dalını kullanın.';en='Find dx/dy on the branch x>0.';eq=eq.replace('f(x)','y');eqLatex=eqLatex.replace('f(x)','y');solution=`dx/dy=1/(dy/dx)=${ascii(answer)}, x>0.`;solutionEn=solution;solutionLatex=`\\frac{dx}{dy}=${latex(answer)}`;verification={kind:'inverse-derivative',expression,answer};}else if(template.kind==='higher'||template.kind==='second') {
        const order=template.kind==='second'?2:c.int(3,4);for(let n=1;n<order;n++)answer=derivative(answer);
        text=`Fonksiyonun ${order}. türevini bulun.`;en=`Find derivative number ${order} of the function.`;
        solution+=` Ardışık türevlerle f^(${order})(x) = ${ascii(answer)}.`;solutionEn+=` Repeated differentiation: f^(${order})(x) = ${ascii(answer)}.`;
        solutionLatex=`f^{(${order})}(x)=${latex(answer)}`;verification={kind:'higher',expression,answer,order};
      } else if(template.kind==='point') {
        const value=evaluate(answer,at);text=`f′(${at}) değerini bulun.`;en=`Find f′(${at}).`;
        solution+=` x = ${at} yazılır: f′(${at}) ≈ ${Number(value.toFixed(6))}.`;solutionEn+=` Substitute x = ${at}: f′(${at}) ≈ ${Number(value.toFixed(6))}.`;
        solutionLatex=`f'(${at})=\\left.${latex(answer)}\\right|_{x=${at}}\\approx ${Number(value.toFixed(6))}`;
        verification={kind:'point',expression,answer,at,value};
       } else if(template.kind==='tangent'||template.kind==='normal') {
        const value=evaluate(expression,at),tangentSlope=evaluate(answer,at),normal=template.kind==='normal',slope=normal?-1/tangentSlope:tangentSlope;
        text=`x = ${at} noktasındaki ${normal?'normalin':'teğetin'} denklemini bulun.`;en=`Find the ${normal?'normal':'tangent'} line at x = ${at}.`;
        const exactValue=ascii(expression,String(at)),exactSlope=normal?`-1/(${ascii(answer,String(at))})`:ascii(answer,String(at));
        solution+=` f(${at}) = ${exactValue}; f′(${at}) = ${ascii(answer,String(at))}. ${normal?'Normal eğimi −1/f′(a). ':''}Denklem: y − (${exactValue}) = (${exactSlope}) * (x − ${at}).`;
        solutionEn+=` f(${at}) = ${exactValue}. ${normal?'Normal slope: -1/f′(a). ':''}Line: y - (${exactValue}) = (${exactSlope}) * (x - ${at}).`;
        const m=normal?`-\\frac{1}{${latex(answer,String(at))}}`:latex(answer,String(at));
        solutionLatex=`y-\\left(${latex(expression,String(at))}\\right)=\\left(${m}\\right)(x-${at})`;
        verification={kind:normal?'normal':'tangent',expression,answer,at,value,slope};
      } else if(template.kind==='definition') {
        text='Türev tanımını kullanarak f′(x) ifadesini bulun.';en='Find f′(x) using the limit definition.';
        solution=`f′(x) = lim_(h→0) (f(x+h)−f(x))/h. Kuvvetleri açıp sabit terimleri sadeleştirin; her terimde h çarpanını götürün. h→0 limitinde ${solution}`;
        solutionEn=`Expand (f(x+h)-f(x))/h, cancel h and let h tend to zero. ${solutionEn}`;
      } else if(template.kind==='rates') {
        text=`Konum s(t) (metre) ile veriliyor; t saniyedir. t = ${at} anındaki hızı ve ivmeyi bulun.`;en=`Position s(t) is in metres and t is in seconds. Find velocity and acceleration at t = ${at}.`;
        eq=`s(t) = ${ascii(expression,'t')}`;eqLatex=`s(t)=${latex(expression,'t')}`;
        const acceleration=derivative(answer),v=evaluate(answer,at),a=evaluate(acceleration,at);
        solution=`v(t) = ${ascii(answer,'t')}; a(t) = ${ascii(acceleration,'t')}. v(${at}) = ${v} m/s; a(${at}) = ${a} m/s^2.`;solutionEn=solution;
        solutionLatex=`v(${at})=${v}\\;\\mathrm{m/s},\\quad a(${at})=${a}\\;\\mathrm{m/s^2}`;
        verification={kind:'rates',expression,answer,acceleration,at,v,a};
      }
    } else if(template.kind==='partial-general') {
      const {f,axis}=built,answerExpression=built[axis];text=`f_${axis} kısmi türevini bulun. Diğer değişkeni sabit tutun; x>0, y>0 bölgesinde çalışın.`;en='Find the indicated partial derivative on x>0, y>0.';
      eq=`f(x,y)=${f}`;eqLatex='f(x,y)='+globalThis.math.parse(f).toTex({parenthesis:'auto',implicit:'hide'});
      solution=`Diğer değişkeni sabit tutarak çarpım, bölüm veya zincir kuralını uygulayın. f_${axis}=${answerExpression}.`;solutionEn=solution;verification={kind:'partial',f,answerExpression,axis,at:{x:1,y:2}};
    } else if(template.kind==='partial'||template.kind==='total') {
      const {a,b}=built,m=built.m||2,n=built.n||1;
      if(template.kind==='partial'){
        const axis=built.axis,f=`${a}*x^${m}*y^${n}+${b}*x`,answerExpression=axis==='x'?`${a*m}*x^${m-1}*y^${n}+${b}`:axis==='y'?`${a*n}*x^${m}*y^${n-1}`:`${a*m*n}*x^${m-1}*y^${n-1}`;
        text=axis==='xy'?'Karışık ikinci kısmi türevi f_xy bulun.':`f_${axis} kısmi türevini bulun; diğer değişkeni sabit kabul edin.`;en='Find the indicated partial derivative, treating the other variable as constant.';
        eq=`f(x,y)=${f}`;eqLatex=`f(x,y)=${a}x^{${m}}y^{${n}}+${b}x`;
        solution=`Diğer değişken sabit tutulur; kuvvet kuralı uygulanır. f_${axis}=${answerExpression}.`;solutionEn=solution;verification={kind:'partial',f,answerExpression,axis,at:{x:1,y:2}};
      }else{
        const k=built.k,f=`${a}*x^2+${b}*x*y+${k}*y^2`,dx=`${2*a}*x+${b}*y`,dy=`${b}*x+${2*k}*y`;
        text='f(x,y) fonksiyonunun toplam diferansiyelini bulun.';en='Find the total differential.';eq=`f(x,y)=${f}`;eqLatex=`f(x,y)=${a}x^2+${b}xy+${k}y^2`;
        solution=`df=f_x dx+f_y dy=(${dx})dx+(${dy})dy.`;solutionEn=solution;verification={kind:'total-differential',f,dx,dy,at:{x:1,y:2}};
      }
    } else if(template.kind==='implicit') {
      const k=built.coefficient||1,r=built.radius;expression=add(pow(X,2),C(r));answer=null;
      text='Kapalı verilen bağıntı için dy/dx ifadesini bulun.';en='Find dy/dx by implicit differentiation.';
      eq=`x^2 + ${k}*y^2 = ${r*r}`;eqLatex=`x^2+${k}y^2=${r*r}`;
      solution=`Her iki tarafın x’e göre türevi: 2*x + ${2*k}*y*y′ = 0. y′ = -x/(${k}*y), y ≠ 0. y = 0 noktalarında sonlu dy/dx yoktur.`;
      solutionEn=`Differentiate both sides: 2*x + ${2*k}*y*y′ = 0. y′ = -x/(${k}*y), y ≠ 0. At y = 0 there is no finite dy/dx.`;
      solutionLatex=`\\frac{dy}{dx}=-\\frac{x}{${k}y},\\quad y\\ne0`;verification={kind:'implicit',k,r};
    } else if(template.kind==='parametric') {
      expression=built.y;const dx=derivative(built.x),dy=derivative(built.y);answer=div(dy,dx);
      text='Parametrik eğri için dy/dx ifadesini bulun.';en='Find dy/dx for the parametric curve.';
      eq=`x(t) = ${ascii(built.x,'t')}; y(t) = ${ascii(built.y,'t')}`;eqLatex=`x(t)=${latex(built.x,'t')},\\quad y(t)=${latex(built.y,'t')}`;
      solution=`dx/dt = ${ascii(dx,'t')}; dy/dt = ${ascii(dy,'t')}. dy/dx = ${ascii(answer,'t')}, dx/dt ≠ 0.`;solutionEn=solution;
      solutionLatex=`\\frac{dy}{dx}=${latex(answer,'t')},\\quad \\frac{dx}{dt}\\ne0`;verification={kind:'parametric',x:built.x,y:built.y,answer};
    } else if(template.kind==='piecewise') {
      const {at,scale}=built;text=`x = ${at} noktasında fonksiyon türevlenebilir mi? Tek taraflı türevlerle açıklayın.`;en=`Is the function differentiable at x = ${at}? Use one-sided derivatives.`;
      eq=`f(x) = ${scale}*|x − ${at}|`;eqLatex=`f(x)=${scale}|x-${at}|`;
      solution=`Fonksiyon süreklidir. Soldan türev −${scale}, sağdan türev ${scale}. Eşit olmadıkları için bu noktada türev yoktur.`;
      solutionEn=`The function is continuous. The left derivative is -${scale}; the right derivative is ${scale}. They differ, so the derivative does not exist.`;verification={kind:'corner',at,scale};
    } else if(template.kind==='match') {
      const {at,scale}=built;text=`f’nin x = ${at} noktasında türevlenebilmesi için A ve B’yi bulun.`;en=`Find A and B so that f is differentiable at x = ${at}.`;
      eq=`f(x) = ${scale}*x^2 (x ≤ ${at}); A*x + B (x > ${at})`;
      eqLatex=`f(x)=\\begin{cases}${scale}x^2&x\\le${at}\\Ax+B&x>${at}\\end{cases}`;
      const A=2*scale*at,B=-scale*at*at;
      solution=`Türevlerin eşitliği A = ${A} verir. Süreklilikten ${scale*at*at} = ${at}*A + B, dolayısıyla B = ${B}.`;
      solutionEn=`Matching derivatives gives A = ${A}. Continuity gives B = ${B}.`;solutionLatex=`A=${A},\\quad B=${B}`;verification={kind:'match',at,scale,A,B};
    } else if(template.kind==='extrema') {
      const {at,scale,offset}=built;expression=add(mul(C(scale),pow(sub(X,C(at)),2)),C(offset));answer=derivative(expression);
      text='Artma ve azalma aralıklarını, yerel ekstremumu bulun.';en='Find intervals of monotonicity and the local extremum.';
      eq=`f(x) = ${ascii(expression)}`;eqLatex=`f(x)=${latex(expression)}`;
      solution=`f′(x) = ${2*scale}*(x − ${at}). (−∞, ${at}) aralığında azalan, (${at}, ∞) aralığında artan. Minimum: (${at}, ${offset}); maksimum yok.`;
      solutionEn=`Decreasing on (-∞, ${at}), increasing on (${at}, ∞). Minimum: (${at}, ${offset}); no maximum.`;verification={kind:'extrema',expression,answer,at,value:offset};
    } else if(template.kind==='monotonicity') {
      const b=built.at;expression=sub(pow(X,3),mul(C(3*b*b),X));answer=derivative(expression);
      text='Artma ve azalma aralıkları ile yerel maksimum ve minimum noktalarını bulun.';en='Find intervals of monotonicity and local extrema.';
      eq=`f(x) = ${ascii(expression)}`;eqLatex=`f(x)=${latex(expression)}`;
      solution=`f′(x) = 3*(x−${b})*(x+${b}). (−∞, −${b}) ve (${b}, ∞) aralıklarında artan; (−${b}, ${b}) aralığında azalan. Yerel maksimum (−${b}, ${2*b**3}); yerel minimum (${b}, ${-2*b**3}).`;
      solutionEn=`Increasing on (-∞, -${b}) and (${b}, ∞); decreasing on (-${b}, ${b}). Local maximum (-${b}, ${2*b**3}); local minimum (${b}, ${-2*b**3}).`;verification={kind:'monotonicity',expression,answer,b};
    } else if(template.kind==='optimization') {
      const p=built.halfPerimeter;text=`Çevresi ${2*p} birim olan bir dikdörtgenin alanını en büyük yapan kenarlarını türevle bulun.`;en=`Use derivatives to maximize the area of a rectangle with perimeter ${2*p}.`;
      eq=`Çevre = ${2*p} birim`;eqLatex=`P=${2*p}`;
      solution=`Kenarları x ve ${p}−x seçin; alan fonksiyonunu A(x)=x*(${p}−x) olarak kurun. A′(x) = ${p} − 2*x = 0 ⇒ x = ${p/2}. A″(x) = −2 < 0; bu nokta maksimumdur. Kenarlar ${p/2} ve ${p/2}, en büyük alan ${p*p/4} birim^2.`;
      solutionEn=`A′(x) = ${p}-2*x = 0 gives x = ${p/2}. A″ = -2 < 0. Both sides are ${p/2}; maximum area ${p*p/4}.`;verification={kind:'optimization',p,side:p/2,area:p*p/4};
    }
    const rules=required.map(label).join(' · '),rulesEn=required.map(id=>topics.find(t=>t.id===id).en).join(' · ');
    const conditions=required.includes('trig')?' Trigonometrik açılar radyandır.':'';
    const domain=template.kind==='differentiate'||template.kind==='higher'||template.kind==='second'?' Fonksiyonun ve istenen türevin tanımlı olduğu açık aralıklarda çalışın. Paydalar sıfırdan farklı olmalıdır.'+(required.includes('logarithm')?' Logaritma içleri pozitif olmalıdır.':''):'';
    const domainEn=template.kind==='differentiate'||template.kind==='higher'||template.kind==='second'?' Work on open intervals where the function and requested derivative exist. Denominators must be nonzero.'+(required.includes('logarithm')?' Logarithm arguments must be positive.':''):'';
    return {id:`derivatives-v1-${seed>>>0}-${index}`,generatorVersion:'derivatives-v1',program:'derivatives',educationMode:'university',topicId:required[0],subtopicId:template.id,template:template.id,index,scope:{program:'derivatives',topics:enabled},requiredTopics:required.slice(),parameters:{a:c.a,b:c.b,n:c.n},text:text+conditions,eq,eqLatex,solution:`${rules}\n${solution}${domain}`,solutionLatex,choices:[],correct:null,supportsChoices:false,responseType:'expression',difficultyProfile:{base:Math.min(4.5,1.2+required.length*.65+(['higher','implicit','parametric','match','optimization'].includes(template.kind)?.8:0)),steps:2+required.length},english:{text:en+(required.includes('trig')?' Angles are in radians.':''),solution:`${rulesEn}\n${solutionEn}${domainEn}`},verification};
  }
  globalThis.PracticeMath={C,X,add,mul,neg,sub,div,pow,fn,variablePower,derivative,evaluate,ascii,latex,generator,choose};
  globalThis.DerivativeBank={topics,defaults,normalize,available,generate,derivative,evaluate,ascii,latex,templates:templates.map(({id,required,kind})=>({id,required,kind})),version:1};
})();
