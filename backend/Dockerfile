# Backend "Semua Boleh PDF" — Node.js + alat pemprosesan PDF
FROM node:20-bookworm-slim

# Pasang semua binari sistem yang diperlukan oleh alat PDF.
#   ghostscript  -> mampat PDF
#   qpdf         -> gabung/pisah/putar/keselamatan/baiki
#   libreoffice  -> penukaran Office <-> PDF, HTML, PDF/A
#   poppler-utils-> PDF -> imej (pdftoppm)
#   ocrmypdf + tesseract (+ data bahasa) -> OCR
#   fonts        -> paparan teks yang betul semasa penukaran
RUN apt-get update && apt-get install -y --no-install-recommends \
    ghostscript \
    qpdf \
    libreoffice \
    libreoffice-writer \
    libreoffice-calc \
    libreoffice-impress \
    poppler-utils \
    ocrmypdf \
    tesseract-ocr \
    tesseract-ocr-msa \
    tesseract-ocr-eng \
    tesseract-ocr-ind \
    fonts-liberation \
    fonts-dejavu \
    ca-certificates \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Pasang kebergantungan Node dahulu (cache lapisan).
COPY package*.json ./
RUN npm install --omit=dev

# Salin kod sumber.
COPY . .

# Cipta direktori kerja.
RUN mkdir -p uploads outputs

ENV NODE_ENV=production
ENV PORT=4000
EXPOSE 4000

CMD ["node", "src/server.js"]
