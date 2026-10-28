/* Recover small exact ratios only at floating-point precision, never by rounding
   an arbitrary irrational to a convenient fraction. */
(() => {
  function ratio(x,max=10000){
    if(!Number.isFinite(x))return null;
    const sign=x<0?-1:1,target=Math.abs(x),tol=Number.EPSILON*64*Math.max(1,target);
    let z=target,p0=0,p1=1,q0=1,q1=0;
    for(let i=0;i<24;i++){
      const a=Math.floor(z),p=a*p1+p0,q=a*q1+q0;if(q>max||!Number.isSafeInteger(p))break;
      if(Math.abs(p/q-target)<=tol)return{p:sign*p,q};
      const remainder=z-a;if(remainder===0)break;
      [p0,p1,q0,q1]=[p1,p,q1,q];z=1/remainder;
    }
    return null;
  }
  function exact(x){
    const r=ratio(x);if(r)return{...r,kind:r.q===1?'integer':'fraction'};
    const p=ratio(x/Math.PI,360);if(p&&Math.abs(p.p)<=720)return{...p,kind:'pi'};
    for(const k of [2,3,5,6,7,10,11,13,14,15,17,19,21,26,29,34,37,41,53,61,73,97]){
      const r=ratio(x/Math.sqrt(k),512);if(r&&Math.abs(r.p)<=512)return{...r,k,kind:'radical'};
    }
    return null;
  }
  function textNumber(x){
    const e=exact(x);if(!e)return Number.isFinite(x)?String(Number(x.toPrecision(9))):String(x);
    const top=e.kind==='pi'?(e.p===1?'π':e.p===-1?'−π':e.p+'π'):e.kind==='radical'?(e.p===1?'√'+e.k:e.p===-1?'−√'+e.k:e.p+'√'+e.k):String(e.p);
    return e.q===1?top:`${top}/${e.q}`;
  }
  function asciiNumber(x){return textNumber(x).replace(/−/g,'-').replace(/π/g,'pi').replace(/√(\d+)/g,'sqrt($1)');}
  function latexNumber(x){
    const e=exact(x);if(!e)return Number.isFinite(x)?String(Number(x.toPrecision(9))):String(x);
    let top=e.kind==='pi'?(Math.abs(e.p)===1?'\\pi':Math.abs(e.p)+'\\pi'):e.kind==='radical'?(Math.abs(e.p)===1?'':Math.abs(e.p))+`\\sqrt{${e.k}}`:String(Math.abs(e.p));
    return (e.p<0?'-':'')+(e.q===1?top:`\\frac{${top}}{${e.q}}`);
  }
  function rewrite(source,latex=false){source=String(source);if(!latex)source=source.replace(/\b(sin|cos|tan|cot|sec|csc|sinh|cosh|tanh)\^(\d+)([xyαβθ])/g,'$1($3)^$2').replace(/\b(sin|cos|tan|cot|sec|csc|sinh|cosh|tanh)(\d*)([xyαβθ])/g,'$1($2$3)');return source.replace(/-?\d+\.\d+(?:e[+-]?\d+)?/gi,(token,offset,whole)=>{
    const n=Number(token),e=exact(n);if(!e)return token;
    if(latex)return latexNumber(n);
    const result=asciiNumber(n),before=whole.slice(0,offset).trimEnd().at(-1),after=whole.slice(offset+token.length).trimStart()[0];
    return e.q!==1&&(before==='/'||before==='^'||/[a-zα-ω(]/i.test(after||''))?`(${result})`:result;
  });}
  globalThis.ExactMath={ratio,exact,textNumber,asciiNumber,latexNumber,rewrite};
})();
