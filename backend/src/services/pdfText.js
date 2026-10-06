import fs from 'node:fs';
import {pythonPdf} from './pythonPdf.js';
export async function ekstrakTeks(input){
 const output=await pythonPdf('teks-kemas',[input],{},'txt');
 try{return fs.readFileSync(output);}finally{fs.rmSync(output,{force:true});}
}
