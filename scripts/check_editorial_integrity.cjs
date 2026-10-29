'use strict';
// Editorial publication gate used by 'node --test tests/*.test.cjs' on every PR.
// Does not alter the approved images or the public catalog.
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
const read=(p)=>fs.readFileSync(path.join(ROOT,p),'utf8');
const file=(x)=>String(x||'').split('?')[0].replace(/^\.\//,'');
const localDay=(event)=>String(event?.schedule?.start_date||
  event?.schedule?.start_local||event?.schedule?.start_brazil||'').slice(0,10);
function loadMaster(text){
  const prefix='const master = ';
  const from=text.indexOf(prefix);
  const to=text.indexOf('\n};',from);
  if(from<0||to<0)throw Error('Cadastro de artes aprovadas não encontrado no formato canônico');
  return JSON.parse(text.slice(from+prefix.length,to+2));
}
function sources(){
  return {
    events:JSON.parse(read('spidey-app/data/events.json')).events,
    local:JSON.parse(read('spidey-app/data/local-events.json')).events,
    master:loadMaster(read('spidey-app/premium-approved-master.js')),
    policy:JSON.parse(read('config/spidey-art-date-scopes.json'))
  };
}
function validate({events,local,master,policy}){
  const errors=[];
  const issue=(code,id,detail)=>errors.push({code,id,detail});
  const allEvents=new Map((events||[]).map(e=>[e.id,e]));
  const allLocal=new Map((local||[]).map(e=>[e.id,e]));
  const scopes=(policy?.scoped_posters||[]);
  for(const rule of scopes){
    const asset=file(rule.file);
    if(!asset||!Array.isArray(rule.allowed_event_ids)||!rule.allowed_event_ids.length){
      issue('POLICY_INVALID',rule.file||'?','Arquivo e IDs permitidos obrigatórios');
      continue;
    }
    const allowed=new Set(rule.allowed_event_ids);
    for(const id of allowed){
      const event=allEvents.get(id)||allLocal.get(id);
      if(!event){issue('POLICY_EVENT_MISSING',id,'Escopo cita evento inexistente');continue;}
      const schedule=event.schedule||{};
      const days=[schedule.start_date,schedule.end_date,schedule.start_local,schedule.end_local]
        .filter(Boolean).map(value=>String(value).slice(0,10));
      if(!days.length||days.some(day=>day<rule.start_date||day>rule.end_date))
        issue('POLICY_DATE_MISMATCH',id,'Pôster datado '+rule.start_date+'–'+rule.end_date+' versus datas locais '+(days.join(', ')||'ausentes'));
    }
    for(const [id,entry] of Object.entries(master||{})){
      if(file(entry?.file)===asset&&!allowed.has(id))
        issue('ART_OTHER_EVENT',id,'Pôster restrito '+asset+' foi aprovado para outro evento');
    }
    for(const e of [...(events||[]),...(local||[])]){
      for(const target of [e.art?.url,e.art?.file,e.poster?.url,e.poster?.file]){
        if(file(target)===asset&&!allowed.has(e.id))
          issue('ART_OTHER_EVENT',e.id,'Catálogo vincula pôster restrito de outra data: '+asset);
      }
    }
  }
  const internalCopy=/a arte premium existente permanece preservada|arte premium preservada|(?:nota|texto) de curadoria interna|(?:nota|aviso) interno de aprova[cç][aã]o/iu;
  for(const e of [...(events||[]),...(local||[])]){
    if(!e?.id)continue;
    if(e.presentation?.hide_poster_until_corrected===true&&(e.art?.url||e.art?.file))
      issue('HIDDEN_ART_VISIBLE',e.id,'Evento bloqueado ainda tem art.url no catálogo');
    if(e.artApproved===true&&!master?.[e.id])
      issue('UNREGISTERED_LOCAL_ART',e.id,'Evento local marca artApproved sem cadastro Premium');
    const publicFields=[e.title,e.summary,e.description,e.note,e.news?.title,e.news?.summary,...(Array.isArray(e.notes)?e.notes:[])];
    if(publicFields.some(v=>typeof v==='string'&&internalCopy.test(v)))
      issue('INTERNAL_COPY',e.id,'Nota interna de aprovação/curadoria presente em texto público');
  }
  return errors;
}
if(require.main===module){
  const errors=validate(sources());
  for(const e of errors)console.error('EDITORIAL_BLOCK '+e.code+' ['+e.id+'] '+e.detail);
  if(errors.length)process.exitCode=1;
  else console.log('EDITORIAL_OK · escopos de arte, catálogo e textos públicos verificados');
}
module.exports={file,localDay,loadMaster,sources,validate};
