#!/usr/bin/env node
/* Confirma com HTTP REAL que as cinco imagens locais foram publicadas no GitHub Pages.
   Execute DEPOIS de actions/deploy-pages@v4, jamais confundir com testes de main. */
'use strict';
const { setTimeout: pause }=require('node:timers/promises');
const BASE='https://asaquevoa1-ctrl.github.io/spidey-pokemon-go/spidey-app/';
const PREFIX='assets/events/wild-area/official-local-20261102/';
const FILES=[
  'machamp-jacket.webp',
  'safari-ball.webp',
  'solid-as-steel.webp',
  'daring-as-dragons.webp',
  'mighty-latias-latios.webp'
];
async function request(url){
  let error;
  for(let attempt=1;attempt<=4;attempt++){
    try {
      const response=await fetch(url+'?spidey-http-qa=20261102-local1', {
        signal:AbortSignal.timeout(15000),
        cache:'no-store',
        redirect:'follow'
      });
      if(!response.ok)throw Error('HTTP '+response.status);
      return response;
    }catch(ex){error=ex;if(attempt<4)await pause(2000*attempt);}
  }
  throw Error(url+' '+String(error));
}
(async()=>{
  const index=await(await request(BASE)).text();
  if(!index.includes('wildAreaMexicoView'))throw Error('Guia não encontrado no HTML público');
  if(!index.includes('wild-area-mexico-20261102.js?v=20261102-local1')){
    throw Error('HTML público ainda é uma versão antiga do Wild Area');
  }
  for(const name of FILES){
    const rel=PREFIX+name;
    if(!index.includes('src="'+rel+'"') && name!=='machamp-jacket.webp'){
      throw Error('HTML público sem referência local: '+rel);
    }
    const res=await request(BASE+rel);
    const contentType=(res.headers.get('content-type')||'').toLowerCase();
    const bytes=Buffer.from(await res.arrayBuffer());
    if(!contentType.includes('image/webp'))throw Error(rel+' conteúdo errado: '+contentType);
    if(bytes.length<4000||bytes.toString('ascii',0,4)!=='RIFF'||bytes.toString('ascii',8,12)!=='WEBP'){
      throw Error(rel+' não contém imagem WebP válida');
    }
    process.stdout.write('HTTP 200 WebP '+name+' '+bytes.length+' bytes\n');
  }
  const homeJS=await(await request(BASE+'wild-area-mexico-20261102.js')).text();
  if(!homeJS.includes(PREFIX+'machamp-jacket.webp')){
    throw Error('Destaque da Home ainda aponta para imagem externa');
  }
  process.stdout.write('PASSOU: 5/5 imagens locais no site público + Home e HTML atualizados.\n');
})().catch(err=>{console.error('FALHA HTTP WILD AREA:',err);process.exitCode=1;});
