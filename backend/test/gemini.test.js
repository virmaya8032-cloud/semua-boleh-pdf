import test from 'node:test';
import assert from 'node:assert/strict';
import {geminiAnswer} from '../src/services/aiPdf.js';
import {env} from '../src/config/env.js';
const answer={bahagian:[{teks:'Ringkasan',rujukan:[]}]};
const response=(finishReason='STOP',parts=[{text:JSON.stringify(answer)}])=>({candidates:[{finishReason,content:{parts}}]});
const schema={type:'OBJECT',properties:{bahagian:{type:'ARRAY'}}};
test('Gemini errors and response validation',async t=>{
 const fetch=global.fetch,key=env.GEMINI_API_KEY,model=env.GEMINI_MODEL;env.GEMINI_API_KEY='mock-key';env.GEMINI_MODEL='gemini-2.5-flash-lite';
 try{
  await t.test('one Google call, key in header, no fallback and no thought text',async()=>{let count=0;global.fetch=async(url,req)=>{count++;assert.ok(!url.includes('mock-key'));assert.equal(req.headers['x-goog-api-key'],'mock-key');assert.equal(JSON.parse(req.body).generationConfig.maxOutputTokens,8000);return {ok:true,json:async()=>response('STOP',[{thought:true,text:'private reasoning'},{text:JSON.stringify(answer)}])};};assert.deepEqual(await geminiAnswer('source',schema),answer);assert.equal(count,1);});
  for(const [status,pattern] of [[429,/Kuota Gemini/],[403,/Kunci Gemini/],[404,/Model Gemini/],[503,/503/]])await t.test('HTTP '+status,async()=>{let count=0;global.fetch=async()=>{count++;return {ok:false,status};};await assert.rejects(geminiAnswer('source',schema),pattern);assert.equal(count,1);});
  await t.test('truncated JSON never becomes success',async()=>{global.fetch=async()=>({ok:true,json:async()=>response('MAX_TOKENS')});await assert.rejects(geminiAnswer('source',schema),/tidak lengkap/);});
  await t.test('blocked content',async()=>{global.fetch=async()=>({ok:true,json:async()=>({promptFeedback:{blockReason:'SAFETY'}})});await assert.rejects(geminiAnswer('source',schema),/kandungan/);});
  await t.test('invalid JSON and malformed references',async()=>{for(const value of ['bad','null','{"bahagian":[{"teks":"x","rujukan":[null]}]}']){global.fetch=async()=>({ok:true,json:async()=>response('STOP',[{text:value}])});await assert.rejects(geminiAnswer('source',schema),/tidak dapat dibaca|Format jawapan/);}});
  await t.test('network failure is useful and does not expose key',async()=>{global.fetch=async()=>{throw new TypeError('mock-key');};await assert.rejects(geminiAnswer('source',schema),/Gagal menyambung ke Gemini/);});
  await t.test('invalid model rejected before request',async()=>{env.GEMINI_MODEL='../other';global.fetch=()=>assert.fail('must not fetch');await assert.rejects(geminiAnswer('source',schema),/MODEL tidak sah/);});
 }finally{global.fetch=fetch;env.GEMINI_API_KEY=key;env.GEMINI_MODEL=model;}
});
