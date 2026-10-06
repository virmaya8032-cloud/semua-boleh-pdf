"""Structured text extraction and escaped side-by-side comparison reports."""
import difflib
from html import escape
import fitz

def ordered_text(page):
    # Keep physical lines and paragraph blocks; split distant column fragments.
    groups={}
    for bi,block in enumerate(page.get_text('rawdict',flags=fitz.TEXTFLAGS_RAWDICT & ~fitz.TEXT_PRESERVE_IMAGES)['blocks']):
        for line in block.get('lines',[]):
            spans=line.get('spans',[])
            if not spans:continue
            pieces=[];current='';rect=None;last=None
            for span in spans:
                for char in span.get('chars',[]):
                    box=fitz.Rect(char['bbox'])
                    split=(last and box.x0-last.x1>max(24,span['size']*2)) or (char['c'].isspace() and box.width>max(24,span['size']*2))
                    if split and current.strip():
                        pieces.append((current.strip(),rect));current='';rect=None
                    if char['c'].isspace() and box.width>max(24,span['size']*2):last=box;continue
                    current+=char['c'];rect=box if rect is None else rect|box;last=box
            if current.strip():pieces.append((current.strip(),rect))
            for ci,(value,box) in enumerate(pieces):
                candidates=[key for key,entry in groups.items() if key[0]==bi and abs(entry['anchor']-box.x0)<24]
                key=min(candidates,key=lambda key:abs(groups[key]['anchor']-box.x0)) if candidates else (bi,len(groups))
                if key not in groups:groups[key]={'rect':box,'lines':[],'anchor':box.x0}
                groups[key]['rect']|=box;groups[key]['lines'].append(value)
    blocks=list(groups.values())
    def gap(items,axis):
        ranges=sorted((b['rect'][axis],b['rect'][axis+2]) for b in items)
        best=None;end=ranges[0][1]
        for start,stop in ranges[1:]:
            if start-end>12 and (best is None or start-end>best[0]):best=(start-end,(start+end)/2)
            end=max(end,stop)
        return best
    def arrange(items):
        if len(items)<2:return items
        vertical=gap(items,0)
        if vertical:
            split=vertical[1];left=[b for b in items if b['rect'].x1<split];right=[b for b in items if b['rect'].x0>split]
            if left and right:return arrange(left)+arrange(right)
        horizontal=gap(items,1)
        if horizontal:
            split=horizontal[1];top=[b for b in items if b['rect'].y1<split];bottom=[b for b in items if b['rect'].y0>split]
            if top and bottom:return arrange(top)+arrange(bottom)
        return sorted(items,key=lambda b:(round(b['rect'].y0/4),b['rect'].x0))
    return ['\n'.join(b['lines']) for b in arrange(blocks)] if blocks else []

def plain_report(doc):
    pages=[ordered_text(page) for page in doc]
    if not any(pages):raise ValueError('Tiada teks boleh diekstrak. Jalankan OCR pada PDF imbasan dahulu.')
    return '\n\n'.join(f'===== HALAMAN {i+1} =====\n\n'+('\n\n'.join(blocks) if blocks else '[Tiada teks pada halaman ini]') for i,blocks in enumerate(pages))+'\n'

def inline_diff(left,right):
    a,b=left.split(),right.split();x,y=[],[]
    for tag,i,j,k,l in difflib.SequenceMatcher(None,a,b,autojunk=False).get_opcodes():
        aa=escape(' '.join(a[i:j]));bb=escape(' '.join(b[k:l]))
        x.append(f'<del>{aa}</del>' if tag in ('replace','delete') else aa)
        y.append(f'<ins>{bb}</ins>' if tag in ('replace','insert') else bb)
    return ' '.join(x),' '.join(y)

def comparison_report(first,second):
    pages=[];changed=0;has_text=False
    for page in range(max(len(first),len(second))):
        a=ordered_text(first[page]) if page<len(first) else []
        b=ordered_text(second[page]) if page<len(second) else []
        has_text=has_text or bool(a or b);rows=[];same=[]
        for tag,i,j,k,l in difflib.SequenceMatcher(None,a,b,autojunk=False).get_opcodes():
            if tag=='equal':same.extend(a[i:j]);continue
            for n in range(max(j-i,l-k)):
                left=a[i+n] if i+n<j else '';right=b[k+n] if k+n<l else ''
                old,new=inline_diff(left,right);changed+=1
                rows.append(f'<tr><td>{old or "<em>Tiada teks</em>"}</td><td>{new or "<em>Tiada teks</em>"}</td></tr>')
        if rows:body='<table><thead><tr><th>PDF asal</th><th>PDF kedua</th></tr></thead><tbody>'+''.join(rows)+'</tbody></table>'
        else:body='<p class="same">Tiada perubahan teks pada halaman ini.</p>'
        if same:body+='<details><summary>Teks yang sama</summary><pre>'+escape('\n\n'.join(same))+'</pre></details>'
        pages.append(f'<section><h2>Halaman {page+1}</h2>{body}</section>')
    if not has_text:raise ValueError('Kedua-dua PDF tiada teks boleh dibandingkan. Jalankan OCR dahulu.')
    return '''<!doctype html><html lang="ms"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Perbandingan PDF</title><style>
body{font:15px/1.6 Arial,sans-serif;background:#f3f5f8;color:#1f2937;margin:0;padding:24px}main{max-width:1100px;margin:auto}header,section{background:white;padding:24px;border-radius:12px;margin-bottom:16px}h1{margin:0;font-size:26px}h2{font-size:18px}table{width:100%;table-layout:fixed;border-collapse:collapse}th{text-align:left;background:#eef2f7}td,th{padding:16px;vertical-align:top;border:1px solid #dce1e8;overflow-wrap:anywhere;white-space:pre-wrap}del{background:#fee2e2;color:#991b1b;text-decoration:none}ins{background:#dcfce7;color:#166534;text-decoration:none}pre{white-space:pre-wrap;overflow-wrap:anywhere;font:inherit}.same{color:#64748b}summary{cursor:pointer}@media print{body{background:white;padding:0}section{break-inside:avoid}}</style><main><header><h1>Perbandingan teks PDF</h1><p>'''+f'{changed} bahagian berubah · PDF asal: {len(first)} halaman · PDF kedua: {len(second)} halaman'+'''</p><p><del>Merah: dibuang / asal</del> · <ins>Hijau: ditambah / baharu</ins></p><p class="same">Perbandingan teks mengikut halaman. Gambar dan perubahan rupa tidak dibandingkan. Semak turutan bagi dokumen berbilang lajur.</p></header>'''+''.join(pages)+'</main></html>'
