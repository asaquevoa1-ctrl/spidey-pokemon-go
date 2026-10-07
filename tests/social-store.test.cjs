const test=require('node:test'),assert=require('node:assert/strict');
test('private Blob updates use the metadata ETag and preserve an intervening writer despite HTTP representation tags',async()=>{
 const {blobStore}=await import('../spidey-app/api/social/store.js'),{BlobPreconditionFailedError}=await import('@vercel/blob');
 let value={messages:['earlier']},version=1,heads=0,puts=0;
 const sdk={head:async()=>{heads++;const etag=`"version-${version}"`;if(heads===1){value.messages.push('other writer');version++;}return {etag};},
 get:async(path,options)=>{assert.equal(options.access,'private');assert.equal(options.useCache,false);return {stream:new Response(JSON.stringify(value)).body,blob:{etag:'W/"delivery-tag"'}};},
 put:async(path,raw,options)=>{puts++;assert.equal(options.access,'private');assert.equal(options.allowOverwrite,true);assert.notEqual(options.ifMatch,'W/"delivery-tag"');if(options.ifMatch!==`"version-${version}"`)throw new BlobPreconditionFailedError();value=JSON.parse(raw);version++;}};
 const result=await blobStore(sdk).mutate('pairs/test',p=>{p.messages.push('my message');return p;});
 assert.deepEqual(result.messages,['earlier','other writer','my message']);assert.equal(puts,2);assert.equal(heads,2);
});
test('private Blob creation rejects a raced creation then safely retries the existing document',async()=>{
 const {blobStore}=await import('../spidey-app/api/social/store.js'),{BlobNotFoundError}=await import('@vercel/blob');
 let value=null,version=0,puts=0;
 const sdk={head:async()=>{if(!value)throw new BlobNotFoundError();return {etag:`"v${version}"`};},get:async()=>({stream:new Response(JSON.stringify(value)).body,blob:{etag:'delivery'}}),
 put:async(path,raw,options)=>{puts++;if(puts===1){assert.equal(options.allowOverwrite,false);value={count:1};version=1;throw Error('This blob already exists');}assert.equal(options.ifMatch,'"v1"');value=JSON.parse(raw);version++;}};
 const result=await blobStore(sdk).mutate('directory',p=>({count:(p?.count || 0)+1}));assert.equal(result.count,2);assert.equal(puts,2);
});
