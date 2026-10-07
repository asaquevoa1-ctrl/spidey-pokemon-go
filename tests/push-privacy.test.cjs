const test=require('node:test'),assert=require('node:assert/strict');
test('old notification metadata is removed without losing delivery keys or test cooldowns',async()=>{
  const {saveSubscription,minimizeStoredMetadata}=await import('../spidey-app/api/push/_store.js');
  const original=global.fetch,names=['UPSTASH_REDIS_REST_URL','UPSTASH_REDIS_REST_TOKEN'],saved=Object.fromEntries(names.map(n=>[n,process.env[n]]));
  const endpoint='https://fcm.googleapis.com/fcm/send/private-test';
  const old={subscription:{endpoint,keys:{p256dh:'example',auth:'example'}},id:'old',created_at:'2026-01-01',updated_at:'2026-01-02',last_test_at:'2026-10-05',device:{locale:'test',timezone:'test'},unneeded:'remove'};
  let record=old,receipt=null,writes=0,lists=0;
  try{
    process.env.UPSTASH_REDIS_REST_URL='https://test-store.invalid';process.env.UPSTASH_REDIS_REST_TOKEN='test';
    global.fetch=async(url,options)=>{const c=JSON.parse(options.body);let result=null;
      if(c[0]==='GET')result=c[1].includes(':sent:')?(receipt&&JSON.stringify(receipt)):JSON.stringify(record);
      if(c[0]==='SMEMBERS'){lists++;result=['subscription'];}
      if(c[0]==='SET'){if(c[1].includes(':sent:'))receipt=JSON.parse(c[2]);else{record=JSON.parse(c[2]);writes++;}}
      return {ok:true,json:async()=>({result})};};
    assert.equal(await minimizeStoredMetadata(),1);assert.equal(record.device,undefined);assert.equal(record.unneeded,undefined);
    assert.deepEqual(record.subscription,old.subscription);assert.equal(record.last_test_at,old.last_test_at);assert.equal(record.created_at,old.created_at);
    assert.equal(await minimizeStoredMetadata(),0);assert.equal(lists,1);
    await saveSubscription(record);assert.equal(writes,1);
  }finally{global.fetch=original;for(const n of names)if(saved[n]===undefined)delete process.env[n];else process.env[n]=saved[n];}
});
