/* Distinct task forms over the same mathematical families: solve, transfer, and
   audit a proposed solution. Limit transfer has two different outer functions. */
(() => {
  'use strict';
  function random(seed,index){let a=(seed^Math.imul(index+1,0x9e3779b9))>>>0;return()=>{a+=0x6D2B79F5;let t=Math.imul(a^a>>>15,1|a);t^=t+Math.imul(t^t>>>7,61|t);return((t^t>>>14)>>>0)/4294967296;};}
  function choose(seed,index,pool){const list=pool.slice(),r=random(seed,Math.floor(index/pool.length));for(let i=list.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[list[i],list[j]]=[list[j],list[i]];}return list[index%list.length];}
  const fmt=n=>globalThis.ExactMath?ExactMath.textNumber(n):String(Number(n.toFixed(8))),clone=x=>JSON.parse(JSON.stringify(x));
  const substitute=(e,u)=>e.op==='x'?u:{...e,...(e.a?{a:substitute(e.a,u)}:{}),...(e.b?{b:substitute(e.b,u)}:{})};
  function audit(q,correct){
    const v=q.verification,M=globalThis.PracticeMath,delta=correct?0:1;
    let claim,candidate=null;
    const extra=globalThis.GraphPractice?.audit(v,correct)||globalThis.MultivariablePractice?.audit(v,correct);
    if(extra){candidate=extra.candidate;claim=extra.claim;}else if(['derivative','higher','parametric','inverse-derivative'].includes(v.kind)){
      candidate=correct?v.answer:M.add(v.answer,M.C(1));claim=`${v.kind==='parametric'?'dy/dx':'İstenen türev'} = ${M.ascii(candidate)}`;
    }else if(['antiderivative','initial'].includes(v.kind)){
      candidate=correct?v.F:M.add(v.F,M.X);claim=`F(x) = ${M.ascii(candidate)}${v.kind==='antiderivative'?' + C':''}`;
    }else if(v.kind==='fundamental'){
      candidate=correct?v.answer:M.add(v.answer,M.C(1));claim=`F′(x) = ${M.ascii(candidate)}`;
    }else if(v.kind==='numeric-transfer'){candidate=v.answer+delta;claim=`Sonuç ≈${fmt(candidate)}`;}else if(['double','double-region','double-polar','triple'].includes(v.kind)){candidate=v.value+delta;claim=`İntegralin değeri ≈${fmt(candidate)}`;}else if(v.kind==='partial'||v.kind==='leibniz'){candidate=correct?v.answerExpression:`(${v.answerExpression})+1`;claim=`İstenen türev = ${candidate}`;}else if(v.kind==='total-differential'){candidate={dx:correct?v.dx:`(${v.dx})+1`,dy:v.dy};claim=`df=(${candidate.dx})dx+(${candidate.dy})dy`;}else if(['point','definite','area','volume','average'].includes(v.kind)){
      candidate=v.value+delta;claim=`Sonuç ≈ ${fmt(candidate)}`;
    }else if(v.kind==='tangent'||v.kind==='normal'){
      candidate=v.slope+delta;claim=`y − (${fmt(v.value)}) = (${fmt(candidate)})*(x − ${v.at})`;
    }else if(v.kind==='rates'){
      candidate=v.a+delta;claim=`v(${v.at})=${v.v}; a(${v.at})=${candidate}`;
    }else if(v.kind==='implicit'){
      claim=`y′ = −x/(${v.k}*y)${correct?'':' + 1'}, y ≠ 0`;
    }else if(v.kind==='corner'){
      claim=correct?'Birleşme noktasında türev yoktur.':'Birleşme noktasındaki türev sıfırdır.';
    }else if(v.kind==='match'){
      candidate={A:v.A+delta,B:v.B};claim=`A=${candidate.A}, B=${candidate.B}`;
    }else if(v.kind==='extrema'){
      candidate={at:v.at+delta,value:v.value};claim=`Minimum noktası (${candidate.at}, ${v.value})`;
    }else if(v.kind==='monotonicity'){
      claim=correct?`Yerel maksimum x=−${v.b}, yerel minimum x=${v.b}.`:`Yerel minimum x=−${v.b}, yerel maksimum x=${v.b}.`;
    }else if(v.kind==='optimization'){
      candidate=v.area+delta;claim=`En büyük alan ${candidate}.`;
    }else if(v.kind==='improper'){
      candidate=correct?v.converges:!v.converges;claim=candidate?'İntegral yakınsaktır.':'İntegral ıraksaktır.';
    }else if(v.result){
      if(['finite','fill','parameter'].includes(v.result)){candidate=v.value+delta;claim=`${v.result==='parameter'?'Parametre':v.result==='fill'?'Süreklilik değeri':'Limit'} ≈ ${fmt(candidate)}`;}
      else if(v.result==='infinity'){candidate=correct?v.sign:-v.sign;claim=`Limit ${candidate>0?'+∞':'−∞'}.`;}
      else claim=correct?'İki taraflı limit yoktur.':'İki taraflı limit sıfırdır.';
    }else if(v.kind==='numeric'){
      candidate=v.answer+delta;claim=v.exactExpression?`Sonuç = (${v.exactExpression})${delta?'+1':''}`:`Sonuç ≈ ${fmt(candidate)}`;
    }else if(['equation','square-equation','residual-equation','domain'].includes(v.kind)){
      candidate=v.roots.slice();if(!correct)candidate[0]+=7;
      claim=`Çözüm kümesi: {${candidate.map(fmt).join(', ')}}`;
    }else if(v.kind==='inequality'){
      candidate=clone(v.intervals);if(!correct)candidate[0][0]+=1;
      claim=candidate.map(([a,b,l,r])=>`${l?'[':'('}${a},${b}${r?']':')'}`).join(' ∪ ');
    }else if(v.kind==='identity'){
      candidate=correct?v.right:`(${v.right})+1`;claim=`${v.left} = ${candidate}`;
    }else if(v.kind==='undefined')claim=correct?'İfade tanımsızdır.':'İfade tanımlıdır ve değeri sıfırdır.';
    else throw Error('Missing review form: '+JSON.stringify(v));
    const previous=q.solution,english=q.english.solution;
    q.text+='\nBir öğrencinin önerdiği sonucu inceleyin: '+claim+'\nDoğru mu? Gerekçelendirin ve hata varsa düzeltin.';
    q.english.text+='\nReview this proposed answer: '+claim+'\nIs it correct? Justify and correct any error.';
    q.solution=(correct?'Önerilen sonuç doğrudur.':'Önerilen sonuç yanlıştır. Doğru işlem aşağıdadır.')+'\n'+previous;
    q.english.solution=(correct?'The proposed answer is correct.':'The proposed answer is incorrect. The correct calculation follows.')+'\n'+english;
    q.verification={kind:'review',correct,candidate,claim,base:v};return q;
  }
  function derivativeTransfer(q,seed,index){
    const graph=globalThis.GraphPractice?.transfer(q);if(graph)return graph;
    const multivariable=globalThis.MultivariablePractice?.transfer(q);if(multivariable)return multivariable;
    const M=PracticeMath,{C,X,add,mul,derivative,evaluate,ascii,latex}=M,v=q.verification,h=.01*((index%3)+1);
    let expression=v.expression,at=1,value,slope,answer,verification;
    if(v.kind==='partial'||v.kind==='total-differential'){const f=v.f,px=globalThis.math.derivative(f,'x').toString(),py=globalThis.math.derivative(f,'y').toString(),x=1,y=2,k=.02,value=globalThis.math.evaluate(f,{x,y}),dx=globalThis.math.evaluate(px,{x,y}),dy=globalThis.math.evaluate(py,{x,y});answer=value+h*dx+k*dy;q.text=`Verilen iki değişkenli fonksiyon için (1,2) noktasında toplam diferansiyelle f(1+${h},2+${k}) yaklaşımını bulun.`;q.english.text=q.text;q.solution=`f(1,2)=${value}; f_x=${px}; f_y=${py}. Yaklaşık değer f+f_x*h+f_y*k=${fmt(answer)}.`;q.english.solution=q.solution;q.solutionLatex=null;q.verification={kind:'multivariable-linearization',f,x,y,h,k,answer};return q;}else if(expression&&expression.op){
      const d=derivative(expression);for(const p of [1,.5,2,.2,3]){const f=evaluate(expression,p),s=evaluate(d,p);if(Number.isFinite(f)&&Number.isFinite(s)){at=p;value=f;slope=s;break;}}
      if(value===undefined)throw Error('No regular linearization point '+q.template);
      answer=value+h*slope;verification={kind:'linearization',expression,at,h,value,slope,answer};
      q.eq=`f(x) = ${ascii(expression)}`;q.eqLatex=`f(x)=${latex(expression)}`;
    }else if(v.kind==='implicit'){
      at=v.r/2;value=Math.sqrt((v.r*v.r-at*at)/v.k);slope=-at/(v.k*value);answer=value+h*slope;
      verification={kind:'implicit-linearization',r:v.r,k:v.k,at,h,value,slope,answer};
    }else if(v.kind==='parametric'){
      const t=.5,dx=evaluate(derivative(v.x),t);at=evaluate(v.x,t);value=evaluate(v.y,t);slope=evaluate(derivative(v.y),t)/dx;answer=value+h*slope;
      verification={kind:'parametric-linearization',x:v.x,y:v.y,t,at,h,value,slope,answer};
    }else if(v.kind==='corner'){
      q.text='Verilen mutlak değer fonksiyonunun birleşme noktasında türeve dayalı tek bir doğrusal yaklaşımı var mı? Tek taraflı eğimleri kullanın.';
      q.english.text='Does this absolute-value function have a single derivative-based linearization at its corner? Use the one-sided slopes.';
      q.solution=`Soldan eğim −${v.scale}, sağdan eğim ${v.scale}. Eğimler farklı; türeve dayalı tek doğrusal yaklaşım yoktur.`;q.english.solution='The one-sided slopes differ, so no single derivative-based linearization exists.';
      q.verification={kind:'corner-linearization',base:v};q.solutionLatex=null;return q;
    }else if(v.kind==='match'){
      at=v.at;value=v.scale*at*at;slope=v.A;answer=value+h*slope;verification={kind:'matched-linearization',...v,h,value,slope,answer};
      q.text=`Önce A ve B’yi türevlenebilirlikten belirleyin. Ardından f(${fmt(at+h)}) için doğrusal yaklaşım bulun.`;
    }else if(v.kind==='optimization'){
      q.text=`En büyük alanı veren kareden sapıp kenarları ${v.side}−${h} ve ${v.side}+${h} seçersek alan kaç birim² azalır?`;
      q.english.text=`Starting from the optimal square, change its sides to ${v.side}−${h} and ${v.side}+${h}. How much area is lost?`;
      answer=h*h;q.solution=`(${v.side}−h)(${v.side}+h)=${v.area}−h². Alan kaybı h²=${fmt(answer)}.`;q.english.solution=`The area becomes ${v.area}−h², so the loss is h²=${fmt(answer)}.`;
      q.solutionLatex=`\\Delta A=${h}^{2}=${fmt(answer)}`;q.verification={kind:'optimization-loss',p:v.p,side:v.side,h,answer};return q;
    }else throw Error('No derivative transfer '+v.kind);
    q.text=`Verilen eğrinin ${v.kind==='parametric'?'t=0,5 parametre değerindeki noktasında':`x=${fmt(at)} noktasında`} teğetini kullanarak x=${fmt(at+h)} için y değerini yaklaşık bulun. ${v.kind==='implicit'?'Pozitif y dalını kullanın.':''}`;
    if(v.kind==='match')q.text=`Önce A ve B’yi türevlenebilirlikten belirleyin. Ardından f(${fmt(at+h)}) için doğrusal yaklaşım bulun.`;
    q.english.text=`Use the tangent at x=${fmt(at)} to approximate the ordinate at x=${fmt(at+h)}.${v.kind==='implicit'?' Use the positive-y branch.':''}`;
    q.solution=`Önce nokta ve eğim bulunur: y₀≈${fmt(value)}, m≈${fmt(slope)}.\nL(x)=y₀+m*(x−x₀). h=${h} için L(x₀+h)≈${fmt(answer)}.`;
    q.english.solution=`Find the ordinate and slope: y₀≈${fmt(value)}, m≈${fmt(slope)}. Then L(x₀+h)=y₀+m*h≈${fmt(answer)}.`;
    q.solutionLatex=`L(${fmt(at+h)})\\approx ${fmt(value)}+${h}\\cdot(${fmt(slope)})\\approx ${fmt(answer)}`;q.verification=verification;return q;
  }
  function integralTransfer(q,index){
    const graph=globalThis.GraphPractice?.transfer(q);if(graph)return graph;
    const multivariable=globalThis.MultivariablePractice?.transfer(q);if(multivariable)return multivariable;
    const M=PracticeMath,{C,X,add,mul,derivative,evaluate,ascii,latex}=M,v=q.verification,a=2+index%3,b=1;
    if(v.kind==='numeric-transfer'&&v.family==='advanced-leibniz'){const answer=2*v.answer;q.text='Verilen integralin iki katını parametreye göre diferansiyelleme yöntemiyle hesaplayın.';q.english.text=q.text;q.solution=`Önce I değeri bulunur; iki katı 2I=${fmt(answer)}.`;q.english.solution=q.solution;q.verification={kind:'numeric-transfer',expression:`2*(${v.expression})`,answer,base:v};return q;}
    if(v.kind==='leibniz'){const answerExpression=globalThis.math.derivative(v.answerExpression,'x').toString();q.text=`Verilen H fonksiyonunun ${(v.order||1)+1}. türevini, Leibniz kuralını uyguladıktan sonra bir kez daha türev alarak bulun.`;q.english.text=q.text;q.solution=`Önce H′=${v.answerExpression}. Bir kez daha türev alınır: H″=${answerExpression}.`;q.english.solution=q.solution;q.solutionLatex=null;q.verification={kind:'expression-transfer',expression:answerExpression,sourceExpression:v.closed,order:(v.order||1)+1};return q;}
    if(v.f){
      const upper=add(mul(C(a),X),C(b)),answer=mul(substitute(v.f,upper),C(a));
      q.text='Üst sınırı değişken olan H fonksiyonunun türevini temel teorem ve zincir kuralıyla bulun. İntegrandın ilgili aralıkta sürekli olduğu yerde çalışın. Limit ve türev bilgisi temel kabul edilir.';
      q.english.text='Find H′ using the fundamental theorem and the chain rule. Prior knowledge of limits and derivatives is assumed.';
      q.eq=`H(x)=∫_1^(${ascii(upper)}) ${ascii(v.f,'t')} dt`;q.eqLatex=`H(x)=\\int_1^{${latex(upper)}}${latex(v.f,'t')}\\,dt`;
      // A positive reference endpoint must belong to the integrand's domain.
      let lo=1;for(const p of [1,.5,2,.2,3])if(Number.isFinite(evaluate(v.f,p))){lo=p;break;}
      q.eq=`H(x)=∫_${lo}^(${ascii(upper)}) ${ascii(v.f,'t')} dt`;q.eqLatex=`H(x)=\\int_{${lo}}^{${latex(upper)}}${latex(v.f,'t')}\\,dt`;
      q.solution=`Önce üst sınır u(x)=${ascii(upper)} ve u′(x)=${a} belirlenir.\nTemel teorem: H′(x)=f(u(x))*u′(x).\nH′(x)=${ascii(answer)}. İntegrandın ilgili aralıkta sürekli olduğu x değerlerinde geçerlidir.`;
      q.english.solution=`Set u(x)=${ascii(upper)}. The fundamental theorem gives H′(x)=f(u(x))*u′(x)=${ascii(answer)}, wherever the integrand is continuous on the integration interval.`;
      q.solutionLatex=`H'(x)=${latex(answer)}`;q.verification={kind:'variable-bound',f:v.f,upper,answer,lo};q.diagram='';return q;
    }
    let answer,expr;
    if(['double','double-region','double-polar','triple'].includes(v.kind)){answer=v.scaleCoeff*v.powerA*v.A**(v.powerA-1);expr=`(${v.scaleCoeff})*${v.powerA}*${v.A}^(${v.powerA}-1)`;q.text=`Bölgenin A ile gösterilen üst sınırı değişsin. Önce integrali A cinsinden yazın, sonra A=${v.A} için dI/dA değerini bulun.`;q.eq+='; A değişken üst sınırdır.';q.eqLatex=null;q.solution=`I(A)=${v.scaleCoeff}*A^${v.powerA}+sabit. dI/dA=${v.scaleCoeff*v.powerA}*A^${v.powerA-1}; A=${v.A} için ${fmt(answer)}.`;q.english.text=q.text;q.english.solution=q.solution;q.solutionLatex=null;q.verification={kind:'numeric-transfer',expression:expr,answer,base:v};return q;}
    if(v.type==='tail'&&v.converges){const tolerance=.01;answer=(v.a/((v.p-1)*tolerance))**(1/(v.p-1));expr=`(${v.a}/((${v.p}-1)*${tolerance}))^(1/(${v.p}-1))`;q.text=`∫_R^∞ ${v.a}/x^${v.p} dx ≤ ${tolerance} olması için en küçük R>0 değerini bulun.`;q.solution=`Kuyruk integrali ${v.a}/((${v.p}−1)*R^(${v.p}−1)). Eşitlik sınırı R≈${fmt(answer)} verir.`;}
    else if(v.type==='exptail'){const tolerance=.01;answer=-Math.log(v.a*tolerance)/v.a;expr=`-log(${v.a}*${tolerance})/${v.a}`;q.text=`∫_R^∞ exp(−${v.a}x) dx ≤ ${tolerance} olması için en küçük R≥0 değerini bulun.`;q.solution=`Kuyruk exp(−aR)/a. Üstel eşitsizlikten R=−ln(a*ε)/a≈${fmt(answer)}.`;}
    else if(v.type==='rootsingularity'){const target=v.a;answer=(target/2)**2;expr=`(${target}/2)^2`;q.text=`∫_0^b 1/sqrt(x) dx = ${target} olması için b>0 değerini bulun.`;q.solution=`Uygunsuz integral 2sqrt(b) değerine yakınsar. 2sqrt(b)=${target} ⇒ b=${fmt(answer)}.`;}
    else if(v.type==='singular'){const eps=.01;answer=1/eps-1/v.a;expr=`1/${eps}-1/${v.a}`;q.text=`Tekilliği kesip ∫_${eps}^${v.a} 1/x² dx değerini bulun. Sonra ε→0+ olduğunda ne olacağını açıklayın.`;q.solution=`[−1/x]_ε^a=1/ε−1/a≈${fmt(answer)}. ε→0+ iken değer +∞ büyür.`;}
    else{q.text='Pozitif bir sabitle çarpmak bu uygunsuz integrali yakınsak hale getirebilir mi? Kesilmiş integralin limitini inceleyin.';q.english.text='Can multiplication by a positive constant make this improper integral converge? Examine the truncated-integral limit.';q.solution='Hayır. Pozitif sabit çarpanı sınırsız büyüyen logaritmik terimi ortadan kaldırmaz; integral ıraksar.';q.english.solution='No. A positive scalar does not remove logarithmic divergence.';q.verification={kind:'divergence-scaling',base:v};q.solutionLatex=null;return q;}
    q.eq=q.text;q.eqLatex=null;q.english.text=q.text;q.english.solution=q.solution;q.solutionLatex=null;q.verification={kind:'numeric-transfer',expression:expr,answer,base:v};return q;
  }
  function limitTransfer(q,style,index){
    const M=PracticeMath,{C,add,mul,pow,ascii,latex}=M,v=clone(q.verification),a=2+index%3,b=1;
    const transform=e=>style==='affine'?add(mul(C(a),e),C(b)):pow(e,2),value=n=>style==='affine'?a*n+b:n*n;
    if(v.result==='parameter'){
      const delta=style==='affine'?a:a+1;v.offset+=delta;v.value=(v.coeff*v.point+v.constant-v.offset)/v.point;
      q.eq=`f(x)=${v.coeff}x+${v.constant} (x≤${v.point}); kx+${v.offset} (x>${v.point})`;q.eqLatex=`f(x)=\\begin{cases}${v.coeff}x+${v.constant}&x\\le${v.point}\\\\kx+${v.offset}&x>${v.point}\\end{cases}`;
      q.text=`Verilen yeni parçalı fonksiyon x=${v.point} noktasında sürekli olsun. k’yi bulun.`;q.solution=`Sol ve sağ değeri eşitleyin: ${v.coeff*v.point+v.constant}=k*${v.point}+${v.offset}. k≈${fmt(v.value)}.`;
    }else{
      if(v.f)v.f=transform(v.f);
      if(v.piecewise){v.piecewise.left=transform(v.piecewise.left);v.piecewise.right=transform(v.piecewise.right);v.piecewise.at=value(v.piecewise.at);v.left=value(v.left);v.right=value(v.right);}
      if(['finite','fill'].includes(v.result))v.value=value(v.value);
      else if(v.result==='infinity'&&style==='square')v.sign=1;
      else if(v.result==='dne'&&style==='square'){
        if(v.left==='-inf'&&v.right==='inf'){v.result='infinity';v.sign=1;}
        else if(v.left!==null&&v.right!==null){if(!v.piecewise){v.left=value(v.left);v.right=value(v.right);}if(v.left===v.right){v.result='finite';v.value=v.left;}}
      }else if(v.result==='dne'&&style==='affine'&&!v.piecewise){if(typeof v.left==='number')v.left=value(v.left);if(typeof v.right==='number')v.right=value(v.right);}
      const point=typeof v.point==='string'?(v.point==='inf'?'∞':'−∞'):v.point,side=v.side==='right'?'+':v.side==='left'?'−':'';
      q.text=v.result==='fill'?`Verilen g fonksiyonunu x=${v.point} noktasında sürekli tamamlamak için g(${v.point}) ne seçilmeli?`:'Dönüştürülmüş fonksiyonun limitini bulun; iki tarafı gerektiğinde ayrı inceleyin.';
      q.eq=v.f?`lim_(x→${point}${side}) ${ascii(v.f)}`:`g(x): solda ${ascii(v.piecewise.left)}, sağda ${ascii(v.piecewise.right)}; x→${point}`;
      q.eqLatex=v.f?`\\lim_{x\\to ${typeof v.point==='string'?(v.point==='inf'?'\\infty':'-\\infty'):v.point}${side?`^{${side==='−'?'-':'+'}}`:''}}${latex(v.f)}`:null;
      const answer=v.result==='finite'||v.result==='fill'?`≈${fmt(v.value)}`:v.result==='infinity'?(v.sign>0?'+∞':'−∞'):'iki taraflı limit yoktur';
      q.solution=`Önce temel fonksiyonun yaklaşım davranışı bulunur. ${style==='affine'?`g=a*f+b için sonlu limitte aL+b=${a}L+${b} kullanılır; a>0 olduğundan sonsuzların yönü korunur.`:'Kare alma sürekli bir dönüşümdür; tek taraflı değerlerin kareleri karşılaştırılır.'}\nSonuç: ${answer}.`;
      if(v.oscillation)q.solution=style==='square'?'sin²(a/x) için a/(π/2+2πn) dizisinde değer 1, a/(πn) dizisinde 0 olur. İki dizi de sıfıra gittiği halde sonuçlar farklıdır; limit yoktur.':`İki yaklaşım dizisinde sin(a/x) değerleri 1 ve −1 olur. Dönüşümden sonra ${a+b} ve ${-a+b}; farklı olduklarından limit yoktur.`;
    }
    v.original=clone(q.verification);v.outer=style;v.multiplier=a;v.shift=b;q.solutionLatex=null;q.english.text=q.text;q.english.solution=q.solution;q.verification=v;return q;
  }
  function trigTransfer(q,other){
    const graph=globalThis.GraphPractice?.transfer(q);if(graph)return graph;
    const v=q.verification;
    if(v.kind==='numeric'){
      const w=other.verification,answer=v.answer-w.answer;
      q.text='İki bağımsız durumu çözün. I. durumun sayısal sonucundan II. durumun sonucunu çıkarın.\nI: '+q.text+'\nII: '+other.text;
      q.eq='I: '+q.eq+'\nII: '+other.eq;q.eqLatex=null;q.diagram+=other.diagram||'';
      q.solution=`I. durum:\n${q.solution}\nII. durum:\n${other.solution}\nİstenen fark ≈ ${fmt(answer)}.`;q.english.text=q.text;q.english.solution=q.solution;q.solutionLatex=null;q.verification={kind:'paired',first:v,second:w,answer};return q;
    }
    if(['equation','square-equation','residual-equation','domain'].includes(v.kind)){
      const roots=[...v.roots.map(x=>x-360),...v.roots].sort((a,b)=>a-b);
      q.text=`Aynı ${v.kind==='domain'?'tanım dışı noktaları':'denklemin bütün çözümlerini'} −360°≤x<360° aralığında bulun.`;
      q.solution=`Temel 0°≤x<360° çözümleri bir tam tur sola da taşınır. Sağ uç hariç tutulur.\n{${roots.map(fmt).join('°, ')}°}`;q.english.text=q.text;q.english.solution=q.solution;
      q.verification={...v,roots,lo:-360,hi:360,...(v.expectedCount?{expectedCount:v.expectedCount*2}:{})};return q;
    }
    if(v.kind==='inequality'){
      const intervals=[...v.intervals.map(([a,b,l,r])=>[a-360,b-360,l,r]),...v.intervals];
      q.text='Verilen eşitsizliği −360°≤x<360° aralığında çözün; açık/kapalı uçları koruyun.';
      q.solution='Çözüm yaylarını bir tam tur sola da taşıyın.\n'+intervals.map(([a,b,l,r])=>`${l?'[':'('}${a}, ${b}${r?']':')'}`).join(' ∪ ');
      q.english.text=q.text;q.english.solution=q.solution;q.verification={...v,intervals,lo:-360,hi:360};return q;
    }
    if(v.kind==='identity'){
      const at=17,expression=`(${v.left})+(${v.right})`,answer=globalThis.math.evaluate(expression,{x:at});
      q.text='Verilen özdeşlikte x=17° için sol taraf ile sağ tarafın toplamını bulun. Tanım koşullarını kontrol edin.';
      q.solution=`Özdeşliğin iki tarafı da aynı değeri verir. x=17° yerleştirilir; toplam ≈${fmt(answer)}.`;
      q.english.text=q.text;q.english.solution=q.solution;q.verification={kind:'identity-evaluation',expression,at,answer,base:v};return q;
    }
    if(v.kind==='undefined'){
      q.text='Verilen tanjant ifadesinin paydasını ayrı hesaplayın. Tanımsızlığın hangi paydadan geldiğini belirtin.';q.solution='Payda cos90°=0. Sıfıra bölme tanımsızdır.';q.english.text=q.text;q.english.solution=q.solution;q.verification={kind:'numeric',expression:v.denominator,answer:0};return q;
    }
    throw Error('Missing trig transfer '+v.kind);
  }
  function expand(bank,mode){
    const baseGenerate=bank.generate,baseAvailable=bank.available,baseTemplates=bank.templates.slice(),styles=mode==='limits'?['base','affine','square','review']:['base','linked','review'];
    const entries=styles.flatMap(style=>baseTemplates.map(base=>({id:`${base.id}--${style}`,baseId:base.id,style,required:[...new Set([...base.required,...(style==='linked'&&mode==='derivatives'?['point','tangent']:style==='linked'&&mode==='integrals'?['fundamental']:[])])]})));
    bank.baseTemplates=baseTemplates;bank.generateBase=baseGenerate;bank.availableBase=baseAvailable;
    bank.templates=entries.map(({id,required,baseId,style})=>({id,required,baseId,style}));
    bank.available=selected=>{const set=new Set(bank.normalize(selected));return entries.filter(e=>e.required.every(id=>set.has(id)));};
    bank.generate=(seed,index,selected=bank.defaults)=>{
      const enabled=bank.normalize(selected),pool=bank.available(enabled);if(!pool.length)throw Error('Select compatible topics.');
      const entry=choose(seed,index,pool);let q=baseGenerate(seed,index,enabled,entry.baseId);q.baseTemplate=entry.baseId;
      if(entry.style==='review')q=audit(q,((seed^index)&1)===0);
      else if(entry.style==='linked'){
        if(mode==='derivatives')q=derivativeTransfer(q,seed,index);
        else if(mode==='integrals')q=integralTransfer(q,index);
        else q=trigTransfer(q,baseGenerate(seed^0xa11ce,index+104729,enabled,entry.baseId));
      }else if(entry.style!=='base')q=limitTransfer(q,entry.style,index);
      q.template=entry.id;q.subtopicId=entry.id;q.requiredTopics=entry.required.slice();q.taskStyle=entry.style;q.scope={program:mode,topics:enabled};return q;
    };
  }
  for(const [mode,name]of [['limits','LimitBank'],['derivatives','DerivativeBank'],['integrals','IntegralBank'],['trigonometry','TrigonometryBank']])if(globalThis[name])expand(globalThis[name],mode);
})();
