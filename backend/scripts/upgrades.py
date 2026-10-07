"""Additional document operations; no shell and no external document services."""
import io,json,re,os,zipfile,csv,math
import fitz
from PIL import Image,ImageOps
from pdf_tools import opened,save,number,text,replacement_font,color_value
from text_reports import ordered_text
OPS={'urus-halaman','scan-kamera','tandatangan-telus','cari-ganti','pratonton-ganti','automasi','ai-context','word-layout'}

def parse(opts,key,default):
 try:return json.loads(opts.get(key,json.dumps(default)))
 except (ValueError,TypeError):raise ValueError(f'Tetapan {key} tidak sah.')

def safe_name(value):
 return re.sub(r'[^\w .()-]+','-',str(value),flags=re.UNICODE).strip(' .-')[:90] or 'dokumen'

def matches(doc,opts):
 needle=text(opts,'cari',required=True)
 if len(needle)>300 or '\n' in needle:raise ValueError('Cari teks satu baris, maksimum 300 aksara.')
 pattern=re.compile((r'(?<!\w)' if opts.get('seluruh')=='ya' else '')+re.escape(needle)+(r'(?!\w)' if opts.get('seluruh')=='ya' else ''),0 if opts.get('huruf')=='ya' else re.I)
 result=[]
 for page in doc:
  for block in page.get_text('rawdict',flags=fitz.TEXTFLAGS_RAWDICT & ~fitz.TEXT_PRESERVE_IMAGES)['blocks']:
   for line in block.get('lines',[]):
    if line.get('wmode',0) or abs(line.get('dir',(1,0))[0]-1)>.001:continue
    chars=[(char,span) for span in line['spans'] for char in span.get('chars',[])]
    content=''.join(char['c'] for char,span in chars)
    for hit in pattern.finditer(content):
     group=chars[hit.start():hit.end()];rect=fitz.Rect(group[0][0]['bbox'])
     for char,span in group:rect|=fitz.Rect(char['bbox'])
     result.append({'page':page.number,'rect':rect,'chars':group,'origin':group[0][0]['origin'],'span':group[0][1],'asal':hit.group(),'baris':content})
     if len(result)>1000:raise ValueError('Lebih 1000 padanan. Gunakan carian yang lebih khusus.')
 return result

def reference(page,label):
 paragraphs=ordered_text(page)
 lines=[line.strip() for para in paragraphs for line in para.splitlines() if line.strip()]
 if label:
  for line in lines:
   at=line.lower().find(label.lower())
   if at>=0:
    value=line[at+len(label):].lstrip(' :#-').strip()
    if value:return value
  return None
 return lines[0] if lines else None

def load_image(path):
 im=Image.open(path)
 if im.width*im.height>25000000:
  im.close();raise ValueError('Gambar terlalu besar. Kecilkan kepada maksimum 25 megapiksel.')
 return ImageOps.exif_transpose(im)

def scan_image(path,opts,corners=None):
 import cv2,numpy as np
 im=load_image(path).convert('RGB');im.thumbnail((2400,3200))
 a=np.array(im);h,w=a.shape[:2]
 points=None
 if corners:
  if not isinstance(corners,list) or len(corners)!=4:raise ValueError('Tandakan empat penjuru mengikut urutan.')
  points=np.array([[number(p,'x',0,0,100)*w/100,number(p,'y',0,0,100)*h/100] for p in corners],dtype=np.float32)
 elif opts.get('auto_tepi','ya')=='ya':
  gray=cv2.cvtColor(a,cv2.COLOR_RGB2GRAY);edges=cv2.Canny(cv2.GaussianBlur(gray,(5,5),0),40,130)
  contours,_=cv2.findContours(edges,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_SIMPLE)
  for contour in sorted(contours,key=cv2.contourArea,reverse=True)[:10]:
   poly=cv2.approxPolyDP(contour,.025*cv2.arcLength(contour,True),True)
   if len(poly)==4 and cv2.isContourConvex(poly) and cv2.contourArea(poly)>w*h*.2:
    p=poly.reshape(4,2).astype(np.float32);s=p.sum(axis=1);diff=np.diff(p,axis=1).ravel()
    points=np.array([p[s.argmin()],p[diff.argmin()],p[s.argmax()],p[diff.argmax()]],dtype=np.float32);break
 if points is not None:
  contour=points.reshape(-1,1,2)
  if not cv2.isContourConvex(contour) or abs(cv2.contourArea(contour))<w*h*.01:raise ValueError('Penjuru bersilang atau kawasan terlalu kecil. Pilih atas kiri, atas kanan, bawah kanan, bawah kiri.')
  tl,tr,br,bl=points;ow=int(max(np.linalg.norm(tr-tl),np.linalg.norm(br-bl)));oh=int(max(np.linalg.norm(bl-tl),np.linalg.norm(br-tr)))
  matrix=cv2.getPerspectiveTransform(points,np.float32([[0,0],[ow-1,0],[ow-1,oh-1],[0,oh-1]]));a=cv2.warpPerspective(a,matrix,(ow,oh),borderValue=(255,255,255))
 if opts.get('bersih','warna')=='bw':
  gray=cv2.cvtColor(a,cv2.COLOR_RGB2GRAY);a=cv2.adaptiveThreshold(gray,255,cv2.ADAPTIVE_THRESH_GAUSSIAN_C,cv2.THRESH_BINARY,35,12)
 elif opts.get('bersih')=='cerah':a=np.minimum(a.astype(np.float32)*1.12+8,255).astype(np.uint8)
 image=Image.fromarray(a);data=io.BytesIO();image.save(data,format='JPEG',quality=90);return data.getvalue(),image.size

def run(op,paths,opts,output):
 if op=='tandatangan-telus':
  import numpy as np
  im=load_image(paths[0]).convert('RGBA');im.thumbnail((2000,2000));threshold=number(opts,'ambang',220,100,250)
  array=np.array(im);brightness=array[:,:,:3].min(axis=2).astype(np.float32)
  opacity=np.clip((threshold-brightness)/max(1,threshold-80),0,1)
  array[:,:,3]=(array[:,:,3].astype(np.float32)*opacity).astype(np.uint8)
  Image.fromarray(array).save(output,'PNG');return
 if op=='scan-kamera':
  if len(paths)>30:raise ValueError('Maksimum 30 gambar.')
  corners=parse(opts,'penjuru',{});doc=fitz.open()
  try:
   for i,path in enumerate(paths):
    data,(w,h)=scan_image(path,opts,corners.get(str(i)))
    pw,ph=(595.276,841.89) if h>=w else (841.89,595.276)
    page=doc.new_page(width=pw,height=ph);page.insert_image(page.rect,stream=data,keep_proportion=True)
   save(doc,output)
  finally:doc.close()
  return
 if op=='urus-halaman':
  plan=parse(opts,'susunan_halaman',[])
  if not plan or len(plan)>1000:raise ValueError('Pilih 1 hingga 1000 halaman.')
  docs=[];out=fitz.open()
  try:
   docs=[opened(p) for p in paths]
   for item in plan:
    source=int(number(item,'fail',0,0,len(docs)-1));page=int(number(item,'halaman',1,1,len(docs[source])))-1
    angle=int(number(item,'putaran',0,0,270))
    if angle%90:raise ValueError('Putaran mesti gandaan 90 darjah.')
    out.insert_pdf(docs[source],from_page=page,to_page=page)
    out[-1].set_rotation((docs[source][page].rotation+angle)%360)
   save(out,output)
  finally:
   out.close()
   for doc in docs:doc.close()
  return
 if op=='word-layout':
  from pdf2docx import Converter
  with opened(paths[0]) as doc:
   if not any(p.get_text().strip() for p in doc):raise ValueError('PDF imbasan perlu OCR sebelum tukar kepada Word.')
  converter=Converter(paths[0])
  try:converter.convert(output,multi_processing=False)
  finally:converter.close()
  return
 if op=='automasi':
  label=text(opts,'label');mode=opts.get('cara','nama');names=parse(opts,'nama_asal',[])
  report=[]
  with zipfile.ZipFile(output,'w',zipfile.ZIP_DEFLATED) as archive:
   for fi,path in enumerate(paths):
    with opened(path) as doc:
     if mode=='nama':
      value=reference(doc[0],label)
      if not value:raise ValueError(f'Rujukan tidak ditemui pada fail {fi+1}. Jalankan OCR atau ubah label.')
      name=f'{fi+1:03d}-{safe_name(value)}.pdf';archive.writestr(name,doc.tobytes(garbage=4,deflate=True));report.append([names[fi] if fi<len(names) else f'Fail {fi+1}',name,'1-'+str(len(doc))])
     elif mode=='pisah':
      groups=[];current=None
      for page in doc:
       value=reference(page,label)
       if value is None:
        if current is None:raise ValueError(f'Rujukan tiada pada halaman {page.number+1}.')
        value=current
       if value!=current:groups.append([value,[]]);current=value
       groups[-1][1].append(page.number)
      for gi,(value,indices) in enumerate(groups):
       part=fitz.open()
       try:
        for n in indices:part.insert_pdf(doc,from_page=n,to_page=n)
        name=f'{fi+1:03d}-{gi+1:03d}-{safe_name(value)}.pdf';archive.writestr(name,part.tobytes(garbage=4,deflate=True));report.append([names[fi] if fi<len(names) else f'Fail {fi+1}',name,','.join(str(n+1) for n in indices)])
       finally:part.close()
     elif mode=='lampiran':
      result=fitz.open()
      try:
       page=result.new_page();heading=f"{text(opts,'tajuk','LAMPIRAN')} {fi+1}";page.insert_text((60,100),heading,fontsize=24)
       page.insert_textbox(fitz.Rect(60,130,520,260),safe_name(names[fi] if fi<len(names) else f'Dokumen {fi+1}'),fontsize=14)
       result.insert_pdf(doc);name=f'{fi+1:03d}-lampiran.pdf';archive.writestr(name,result.tobytes(garbage=4,deflate=True));report.append([names[fi] if fi<len(names) else f'Fail {fi+1}',name,'Semua + muka pemisah'])
      finally:result.close()
     else:raise ValueError('Cara automasi tidak sah.')
   data=io.StringIO();writer=csv.writer(data);writer.writerow(['Fail asal','Fail hasil','Halaman']);writer.writerows([["'"+str(v) if str(v).startswith(('=','+','-','@')) else v for v in row] for row in report]);archive.writestr('senarai-hasil.csv',data.getvalue().encode('utf-8-sig'))
  return
 with opened(paths[0]) as doc:
  if op=='ai-context':
   if len(doc)>300:raise ValueError('AI menyokong maksimum 300 halaman. Ekstrak bahagian diperlukan dahulu.')
   requested=text(opts,'halaman');indices=list(range(len(doc)))
   if requested:
    indices=[]
    for part in requested.split(','):
     if not re.fullmatch(r'\s*\d+(?:\s*-\s*\d+)?\s*',part):raise ValueError('Julat halaman tidak sah.')
     values=[int(v) for v in part.split('-')];start,end=values[0],values[-1]
     if not 1<=start<=end<=len(doc):raise ValueError('Julat halaman di luar dokumen.')
     indices.extend(range(start-1,end))
    indices=sorted(set(indices))
   pages=[{'halaman':i+1,'teks':'\n\n'.join(ordered_text(doc[i]))} for i in indices]
   with open(output,'w',encoding='utf-8') as f:json.dump({'pages':pages},f,ensure_ascii=False)
  elif op in ('cari-ganti','pratonton-ganti'):
   found=matches(doc,opts)
   if op=='pratonton-ganti':
    with open(output,'w',encoding='utf-8') as f:json.dump({'jumlah':len(found),'padanan':[{'halaman':m['page']+1,'asal':m['asal'],'baris':m['baris']} for m in found]},f,ensure_ascii=False)
    return
   if not found:raise ValueError('Tiada padanan. Semak carian atau jalankan OCR dahulu.')
   for hit in found:
    hidden=[fitz.Rect(span['bbox']) for span in doc[hit['page']].get_texttrace() if span['type']==3]
    if any(rect.intersects(hit['rect']) for rect in hidden):raise ValueError('Padanan berada dalam teks OCR tersembunyi di atas gambar. Gunakan Edit PDF untuk mengubah rupa perkataan pada imbasan.')
   value=text(opts,'ganti');replacements=[]
   if '\n' in value:raise ValueError('Gantian mesti satu baris.')
   for hit in found:
    span=hit['span'];fontname,font=replacement_font({'font':span['font'],'bold':bool(span['flags']&16),'italic':bool(span['flags']&2)},opts,value)
    size=min(span['size'],hit['rect'].width/max(.01,font.text_length(value,fontsize=1))) if value else span['size']
    if value and size<4:raise ValueError('Gantian terlalu panjang. Gunakan editor untuk melaras ruang.')
    page=doc[hit['page']]
    for char,span in hit['chars']:
     if not char['c'].strip():continue
     box=fitz.Rect(char['bbox']);cy=char['origin'][1]-span['size']*.3
     page.add_redact_annot(fitz.Rect(box.x0+.01,cy-span['size']*.08,box.x1-.01,cy+span['size']*.08),fill=False,cross_out=False)
    replacements.append((hit['page'],hit['origin'],value,size,fontname,span['color']))
   for page in doc:page.apply_redactions(images=0,graphics=0,text=0)
   for page,origin,value,size,fontname,color in replacements:
    if value:doc[page].insert_text(origin,value,fontsize=size,fontname=fontname,color=((color>>16&255)/255,(color>>8&255)/255,(color&255)/255))
   save(doc,output)
  else:raise ValueError('Operasi baharu tidak sah.')
