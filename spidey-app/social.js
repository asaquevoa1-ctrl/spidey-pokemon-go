import { createIdentity, envelope, encryptMessage, decryptMessage, identityStore, validMessage } from './social-crypto.js';
const root = document.getElementById('socialRoot'), dialog = document.getElementById('eventDialog'), detail = document.getElementById('eventDetail');
const esc = s => String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const COUNTRIES = {BR:'Brasil',US:'Estados Unidos',JP:'Japão',PT:'Portugal',ES:'Espanha',DE:'Alemanha',FR:'França',GB:'Reino Unido',TW:'Taiwan',OTHER:'Outro país'};
const INTERESTS = {pvp:'PvP',raids:'Reides',gifts:'Presentes',fly:'FLY',stamps:'Selos'};
const ERRORS = {invalid_profile:'Confira o apelido, o país e o código de Treinador.',consent_required:'Leia o aviso e marque a opção para criar seu perfil.',
  unauthorized:'Não foi possível confirmar o acesso deste aparelho.',invalid_key:'Não foi possível confirmar a chave deste perfil.',peer_unavailable:'Este jogador está indisponível ou o código não foi encontrado.',
  invalid_code:'Use o código Spidey completo, começando por SPID-.',recipient_only:'Só quem recebeu o pedido pode aceitar.',connection_required:'O chat abre depois que o pedido for aceito.',
  slow_down:'Você fez muitas ações seguidas. Aguarde um minuto.',request_already_used:'A ação já foi enviada. Atualize para conferir.',profile_expired:'Renove seu perfil para continuar.',
  profile_deleted:'Este perfil foi apagado. Crie outro para continuar.',social_not_configured:'Amigos ainda está indisponível. Tente novamente mais tarde.',request_cooldown:'Aguarde um dia antes de repetir este pedido.',
  registration_busy:'Não foi possível criar novos perfis agora. Tente mais tarde.',connection_limit:'Um dos perfis já chegou ao limite de 50 conexões.',message_text_invalid:'Escreva até 1.000 caracteres, sem links.',network:'Não foi possível conectar. Confira a conexão e tente novamente.'};
let identity, current, busy = false, poll, chatPeer, messageVersion = '';
const toast = error => window.showToast(ERRORS[error.message] || ERRORS.network);
async function api(action,data = {}) {
  if (!navigator.onLine) throw Error('network');
  const response = await fetch('api/social',{method:'POST',credentials:'same-origin',cache:'no-store',headers:{'Content-Type':'application/json'},
    body:JSON.stringify(await envelope(identity,action,data)),signal:AbortSignal.timeout(15000)});
  const result = await response.json(); if(!response.ok)throw Error(result.error || 'network');return result;
}
const countryOptions = value => Object.entries(COUNTRIES).map(([id,name])=>`<option value="${id}" ${id===value?'selected':''}>${name}</option>`).join('');
function profileForm(edit = false) {
  const p = current?.profile || {};
  root.innerHTML=`<section class="social-card social-onboarding"><span class="eyebrow">${edit?'MEU PERFIL':'JOGUE EM COMPANHIA'}</span><h2>${edit?'Seu jeito de jogar':'Encontre seu próximo parceiro'}</h2><p>Combine reides, presentes e batalhas usando só um apelido.</p>
  <form id="socialProfileForm" class="social-form"><label>Apelido<input name="nickname" id="socialNickname" minlength="2" maxlength="24" required autocomplete="off" value="${esc(p.nickname || '')}" placeholder="Como você quer aparecer"></label>
  <div class="social-form-row"><label>País<select name="country">${countryOptions(p.country || 'BR')}</select></label><label>Estado ou região <small>Opcional</small><input name="region" maxlength="40" autocomplete="off" value="${esc(p.region || '')}" placeholder="Sem endereço ou coordenadas"></label></div>
  <label>Código de Treinador <small>Opcional · só para amigos aceitos</small><input name="trainer_code" inputmode="numeric" maxlength="14" value="${esc(p.trainer_code || '')}" placeholder="12 números do Pokémon GO" autocomplete="off"></label>
  <fieldset><legend>Você procura</legend><div class="social-interests">${Object.entries(INTERESTS).map(([id,name])=>`<label><input type="checkbox" name="interests" value="${id}" ${p.interests?.includes(id)?'checked':''}>${name}</label>`).join('')}</div></fieldset>
  <label class="social-check"><input type="checkbox" name="discoverable" ${p.discoverable?'checked':''}>Aparecer na busca de jogadores do Spidey</label>
  <div class="social-privacy-note"><strong>Você escolhe participar.</strong><p>Guardamos seu apelido, país, região e interesses escolhidos, conexões e mensagens criptografadas. O código de Treinador é opcional e só aparece para amigos aceitos. Seu perfil aparece na busca apenas se você marcar a opção acima.</p><p>A chave privada fica neste navegador. Limpar os dados do site ou trocar de aparelho perde o acesso a este perfil. Não há recuperação por e-mail nesta versão. A conversa guarda as últimas 60 mensagens dos últimos 30 dias.</p></div>
  ${edit?'':'<label class="social-check"><input type="checkbox" name="consent" required>Li o aviso e quero criar meu perfil opcional.</label>'}
  <div class="social-actions"><button class="primary-btn" type="submit">${edit?'Salvar perfil':'Criar meu perfil'}</button>${edit?'<button class="ghost-btn" type="button" data-social="home">Cancelar</button>':''}</div><p id="socialFormStatus" class="microcopy" role="status"></p></form></section>`;
  document.getElementById('socialProfileForm').addEventListener('submit',async event=>{
    event.preventDefault();if(busy)return; busy=true;
    const form=event.currentTarget, data=new FormData(form), status=document.getElementById('socialFormStatus'), button=form.querySelector('button[type=submit]');
    button.disabled=true;status.textContent='Salvando seu perfil…';
    try {
      if(!identity){identity=await createIdentity();await identityStore(identity);}
      const fields={nickname:data.get('nickname'),country:data.get('country'),region:data.get('region'),trainer_code:data.get('trainer_code'),interests:data.getAll('interests'),discoverable:data.has('discoverable')};
      current=await api(edit?'update':'register',{...fields,...(!edit?{consent:data.has('consent'),signing_key:identity.signing_key,encryption_key:identity.encryption_key}:{})});
      renderHome();window.showToast(edit?'Perfil atualizado.':'Seu perfil está pronto.');
    } catch(error){status.textContent=ERRORS[error.message] || ERRORS.network;button.disabled=false;}finally{busy=false;}
  });
}
function personCard(profile,actions = '') {
  return `<article class="social-person"><div class="social-avatar" aria-hidden="true">${esc(profile.nickname.slice(0,1).toUpperCase())}</div><div class="social-person-copy"><h3>${esc(profile.nickname)}</h3><p>${esc([COUNTRIES[profile.country],profile.region].filter(Boolean).join(' · '))}</p><div class="social-tags">${profile.interests.map(id=>`<span>${esc(INTERESTS[id])}</span>`).join('')}</div></div>${actions?`<div class="social-person-actions">${actions}</div>`:''}</article>`;
}
const actionButton = (action,label,peer='',klass='ghost-btn')=>`<button class="${klass}" type="button" data-social="${action}" ${peer?`data-peer="${esc(peer)}"`:''}>${label}</button>`;
function renderHome() {
  const p=current.profile, connections=current.connections || [], incoming=connections.filter(c=>!c.blocked&&c.status==='pending'&&c.requested_by!==p.id), friends=connections.filter(c=>!c.blocked&&c.status==='accepted');
  root.innerHTML=`<section class="social-card social-own"><span class="eyebrow">SEU PERFIL SPIDEY</span><h2>Olá, ${esc(p.nickname)}</h2><p>${p.active?'Pronto para encontrar parceiros.':'Seu perfil está pausado ou venceu. Renove para continuar.'}</p><div class="social-code"><code>${esc(p.code)}</code>${actionButton('copy','Copiar código')}</div><p class="microcopy">Compartilhe este código com quem você quer adicionar. Ele é diferente do código de Treinador.</p><div class="social-actions">${actionButton('edit','Editar perfil')}${actionButton('renew',p.active?'Renovar por 30 dias':'Reativar perfil')}</div><p class="microcopy">${p.discoverable?'Seu perfil aparece na busca.':'Seu perfil está fora da busca.'} Válido até ${new Date(p.expires_at).toLocaleDateString('pt-BR')}.</p></section>
  <section class="social-card"><div class="section-head"><div><span class="eyebrow">CONEXÕES</span><h2>Seus amigos <span class="social-count">${friends.length}</span></h2></div>${actionButton('refresh','Atualizar')}</div>
  ${incoming.length?'<h3>Pedidos recebidos</h3>'+incoming.map(c=>personCard(c.profile,actionButton('accept','Aceitar',c.profile.id,'primary-btn')+actionButton('reject','Recusar',c.profile.id))).join(''):''}
  ${friends.map(c=>personCard(c.profile,actionButton('chat','Conversar',c.profile.id,'primary-btn')+actionButton('block','Bloquear',c.profile.id))).join('') || '<p class="social-empty">Seu próximo parceiro está a um convite de distância.</p>'}
  ${connections.filter(c=>!c.blocked&&c.status==='pending'&&c.requested_by===p.id).map(c=>personCard(c.profile,'<span class="microcopy">Pedido enviado · aguardando aceite</span>')).join('')}
  <form id="socialInviteForm" class="social-invite"><label for="socialInviteCode">Adicionar pelo código Spidey</label><div><input id="socialInviteCode" placeholder="SPID-…" maxlength="21" required autocomplete="off"><button class="primary-btn">Enviar pedido</button></div><p class="microcopy">O chat abre quando o outro jogador aceitar.</p></form></section>
  <section class="social-card"><span class="eyebrow">ENCONTRE SUA TURMA</span><h2>Procurar jogadores</h2><form id="socialSearchForm" class="social-search"><label>Apelido<input name="query" type="search" maxlength="40" placeholder="Buscar pelo apelido" autocomplete="off"></label><div class="social-form-row"><label>País<select name="country"><option value="">Todos</option>${countryOptions('')}</select></label><label>Interesse<select name="interest"><option value="">Todos</option>${Object.entries(INTERESTS).map(([id,name])=>`<option value="${id}">${name}</option>`).join('')}</select></label></div><button class="secondary-btn">Buscar jogadores</button></form><div id="socialSearchResults" class="social-results" aria-live="polite"><p class="microcopy">Só aparecem jogadores que escolheram participar da busca.</p></div></section>
  ${connections.some(c=>c.blocked)?'<details class="social-card"><summary>Jogadores bloqueados</summary>'+connections.filter(c=>c.blocked).map(c=>personCard(c.profile,actionButton('unblock','Desbloquear',c.profile.id))).join('')+'</details>':''}
  <details class="social-card"><summary>Privacidade e controle do perfil</summary><p>Pause para sair da busca e interromper as conversas. Você pode reativar neste aparelho.</p>${actionButton('deactivate','Pausar perfil')}<p>Apagar remove seu perfil e o histórico das suas conversas no servidor. Essa ação não tem recuperação.</p>${actionButton('remove','Apagar meu perfil')}</details>`;
  document.getElementById('socialInviteForm').addEventListener('submit',event=>{event.preventDefault();run('request',{code:document.getElementById('socialInviteCode').value});});
  document.getElementById('socialSearchForm').addEventListener('submit',async event=>{
    event.preventDefault();const form=new FormData(event.currentTarget), results=document.getElementById('socialSearchResults');results.textContent='Procurando jogadores…';
    try{const data=await api('search',Object.fromEntries(form));results.innerHTML=data.profiles.map(p=>personCard(p,actionButton('request','Adicionar',p.id,'primary-btn'))).join('') || '<p>Ninguém encontrado. Tente outro filtro ou envie um código.</p>';}catch(error){results.textContent=ERRORS[error.message] || ERRORS.network;}
  });
}
async function run(action,data={}) {
  if(busy)return;busy=true;root.setAttribute('aria-busy','true');
  try{current=await api(action,data);renderHome();window.showToast(action==='request'?'Pedido enviado.':action==='accept'?'Agora vocês podem conversar.':'Pronto.');}
  catch(error){toast(error);}finally{busy=false;root.removeAttribute('aria-busy');}
}
async function load() {
  if(busy || !root)return;
  try {
    identity ||= await identityStore();
    if(!identity){profileForm();return;}
    current=await api('state');renderHome();
  } catch(error){
    if(['profile_missing','profile_deleted'].includes(error.message)){if(error.message==='profile_deleted'){await identityStore(null);identity=null;}profileForm();}
    else{root.innerHTML='<section class="social-card"><h2>Não foi possível abrir Amigos</h2><p>Confira a conexão e tente novamente. Seus eventos e times continuam disponíveis.</p>'+actionButton('refresh','Tentar novamente')+'</section>';toast(error);}
  }
}
async function renderMessages(messages,peer) {
  const list=detail.querySelector('#socialMessageList');if(!list)return;
  const version=messages.map(m=>m.id).join(',');if(version===messageVersion)return;messageVersion=version;
  const decoded=await Promise.all(messages.map(async m=>{try{return {...m,text:await decryptMessage(identity,peer,m)};}catch{return {...m,text:'Não foi possível abrir esta mensagem.'};}}));
  if(!list.isConnected)return;
  list.innerHTML=decoded.map(m=>`<div class="social-bubble ${m.from===identity.id?'own':''}"><p>${esc(m.text)}</p><time>${new Date(m.at).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}</time></div>`).join('') || '<p class="social-empty">Diga oi e combine sua próxima jogada.</p>';
  list.scrollTop=list.scrollHeight;
}
async function refreshChat() {
  if(!chatPeer || !dialog.open || !detail.querySelector('#socialChat') || document.hidden || !navigator.onLine || busy)return;
  try{const data=await api('messages',{peer:chatPeer.id});await renderMessages(data.messages,chatPeer);detail.querySelector('#socialChatStatus').textContent='Atualização automática enquanto esta conversa estiver aberta.';}
  catch(error){detail.querySelector('#socialChatStatus').textContent=ERRORS[error.message] || ERRORS.network;}
}
async function openChat(peer) {
  try {
    const data=await api('messages',{peer:peer.id});chatPeer=data.peer;messageVersion='initial';clearInterval(poll);
    window.beginAppDialog();detail.className='';for(const key of Object.keys(detail.dataset))delete detail.dataset[key];
    detail.innerHTML=`<div class="detail-body social-chat" id="socialChat"><span class="eyebrow">CONVERSA PRIVADA</span><h2>${esc(peer.nickname)}</h2><p class="microcopy">Mensagens criptografadas entre estes dois perfis. A chave fica no aparelho.</p>${data.peer.trainer_code?`<p>Código de Treinador: <code>${esc(data.peer.trainer_code)}</code></p>`:''}<div class="social-message-list" id="socialMessageList" aria-label="Mensagens"></div>
    <div class="social-quick">${['Vamos fazer uma reide?','Quer treinar PvP?','Vamos trocar presentes?'].map(t=>`<button type="button" class="ghost-btn" data-quick="${esc(t)}">${t}</button>`).join('')}</div>
    <form id="socialMessageForm"><label for="socialMessageText">Sua mensagem</label><textarea id="socialMessageText" maxlength="1000" rows="3" placeholder="Escreva sua mensagem, sem links" required></textarea><button class="primary-btn" type="submit">Enviar mensagem</button></form><p class="microcopy" id="socialChatStatus" role="status">As últimas 60 mensagens dos últimos 30 dias ficam disponíveis.</p>
    <details class="social-chat-control"><summary>Bloquear ou denunciar</summary><p>Bloquear impede mensagens nos dois sentidos. A denúncia registra o motivo e bloqueia o jogador; não envia o texto da conversa.</p><label>Motivo<select id="socialReportReason"><option value="abuse">Abuso ou assédio</option><option value="spam">Spam</option><option value="unsafe">Conteúdo perigoso</option></select></label><div class="social-actions"><button type="button" class="ghost-btn" id="socialReport">Denunciar e bloquear</button><button type="button" class="ghost-btn" id="socialChatBlock">Bloquear jogador</button></div><p class="microcopy">A denúncia fica registrada para revisão. Não existe atendimento em tempo real.</p></details></div>`;
    window.showAppDialog();await renderMessages(data.messages,chatPeer);
    detail.querySelectorAll('[data-quick]').forEach(b=>b.addEventListener('click',()=>{detail.querySelector('#socialMessageText').value=b.dataset.quick;detail.querySelector('#socialMessageText').focus();}));
    detail.querySelector('#socialMessageForm').addEventListener('submit',async event=>{
      event.preventDefault();if(busy)return;const text=detail.querySelector('#socialMessageText'),status=detail.querySelector('#socialChatStatus'),button=event.currentTarget.querySelector('button');
      if(!validMessage(text.value)){status.textContent=ERRORS.message_text_invalid;return;}busy=true;button.disabled=true;status.textContent='Enviando…';
      try{const sent=await api('send',await encryptMessage(identity,chatPeer,text.value));text.value='';await renderMessages(sent.messages,chatPeer);status.textContent='Mensagem enviada.';}
      catch(error){status.textContent=ERRORS[error.message] || ERRORS.network;}finally{busy=false;button.disabled=false;}
    });
    for(const [id,action] of [['socialReport','report'],['socialChatBlock','block']])detail.querySelector('#'+id).addEventListener('click',async()=>{
      try{current=await api(action,{peer:chatPeer.id,...(action==='report'?{reason:detail.querySelector('#socialReportReason').value}:{})});dialog.close();renderHome();window.showToast(action==='report'?'Denúncia registrada e jogador bloqueado.':'Jogador bloqueado.');}catch(error){toast(error);}
    });
    poll=setInterval(refreshChat,15000);
  }catch(error){toast(error);}
}
root?.addEventListener('click',async event=>{
  const button=event.target.closest('[data-social]');if(!button || busy)return;const action=button.dataset.social,peer=button.dataset.peer;
  if(action==='home'){renderHome();return;}if(action==='edit'){profileForm(true);return;}if(action==='refresh'){await load();return;}
  if(action==='copy'){try{await navigator.clipboard.writeText(current.profile.code);window.showToast('Código Spidey copiado.');}catch{window.showToast('Seu código está acima. Você pode selecioná-lo para copiar.');}return;}
  if(action==='chat'){const connection=current.connections.find(c=>c.profile.id===peer);if(connection)await openChat(connection.profile);return;}
  if(action==='remove'){
    window.beginAppDialog();detail.className='';detail.innerHTML='<div class="detail-body"><h2>Apagar perfil e conversas?</h2><p>Isso remove seu perfil e o histórico das suas conversas no servidor. Não é possível recuperar o acesso depois.</p><button id="socialConfirmRemove" class="primary-btn">Sim, apagar meu perfil e conversas</button></div>';window.showAppDialog();
    detail.querySelector('#socialConfirmRemove').addEventListener('click',async()=>{try{await api('remove');await identityStore(null);identity=null;current=null;dialog.close();profileForm();window.showToast('Perfil removido.');}catch(error){toast(error);}});return;
  }
  await run(action,peer?{peer}:{});
});
dialog?.addEventListener('close',()=>{clearInterval(poll);chatPeer=null;});
window.addEventListener('online',()=>{if(!document.getElementById('friendsView')?.hidden)load();refreshChat();});
window.SpideySocial=Object.freeze({load});
if (!document.getElementById('friendsView')?.hidden) load();
