/* Session identity owns the question stream; individual legacy notes remain readable. */
(()=>{
const KEY='forma-study-sessions-v1';let data={sessions:{},byScope:{}},active=null;
try{const saved=JSON.parse(localStorage.getItem(KEY)||'{}');if(saved.sessions&&saved.byScope)data=saved;}catch{}
const persist=()=>{try{localStorage.setItem(KEY,JSON.stringify(data));return true;}catch{return false;}};
function create(scope,metadata){const random=new Uint32Array(1);crypto.getRandomValues(random);const id='study-'+crypto.randomUUID(),session={id,scope,...structuredClone(metadata),stream:{seed:random[0],cursor:0},questionKeys:[],created:new Date().toISOString(),updated:new Date().toISOString(),modules:null};data.sessions[id]=session;data.byScope[scope]=id;active=id;persist();return session;}
function resolve(scope,metadata){let session=data.sessions[data.byScope[scope]];if(!session?.stream||!Array.isArray(session.questionKeys))session=create(scope,metadata);active=session.id;return session;}
function select(id){const session=data.sessions[id];if(!session)return null;active=id;data.byScope[session.scope]=id;persist();return session;}
function remove(id){const session=data.sessions[id];if(data.byScope[session?.scope]===id)delete data.byScope[session.scope];delete data.sessions[id];if(active===id)active=null;persist();}
globalThis.StudySessions={create,resolve,select,remove,persist,restore:session=>{data.sessions[session.id]=structuredClone(session);return select(session.id);},current:()=>data.sessions[active]||null,pause:()=>active=null,get:id=>data.sessions[id]||null,inspect:()=>structuredClone(data)};
})();
