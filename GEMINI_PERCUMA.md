# Aktifkan AI PDF dengan Gemini Free Tier

1. Buka https://aistudio.google.com/api-keys dan log masuk akaun Google. Cipta API key untuk projek **Free Tier**. Semak tier pada dashboard; projek dengan billing berbayar boleh dikenakan caj. Jangan aktifkan billing berbayar jika anda mahu kekal percuma.
2. Salin kod dalam ZIP ke repository projek anda, commit dan push. Deploy semula backend dan frontend.
3. Pada Render, buka servis **backend** → Environment. Isi:

| Key | Value |
| --- | --- |
| GEMINI_API_KEY | API key daripada Google AI Studio |
| GEMINI_MODEL | gemini-2.5-flash-lite |
| AI_ALLOW_PUBLIC | false |

4. Simpan tetapan dan deploy semula backend. Jika menjalankan pada komputer, isi dalam `backend/.env` dan restart backend.
5. Log masuk ke website, buka **AI untuk PDF**, pilih fail, tugas dan bahasa. Tandakan persetujuan sebelum proses.

Key hanya pada backend. Jangan letak dalam GitHub, frontend, `VITE_*` atau mesej chat. Tetapan OPENAI_API_KEY dan OPENAI_MODEL lama tidak lagi digunakan.

Model mempunyai kuota percuma yang terhad mengikut projek. Apabila kuota habis, app memaparkan mesej dan tidak beralih kepada model atau penyedia berbayar secara automatik. Percuma ini merujuk penggunaan API pada Free Tier sahaja; hosting backend mempunyai pelan sendiri.

Google menyatakan kandungan pada Free Tier boleh digunakan untuk menambah baik produknya. Jangan gunakan dokumen sulit, peribadi atau sensitif dalam pelan ini. AI masih boleh tersilap; semak jawapan dan petikan sumber.

Rujukan rasmi (disemak 8 Oktober 2026):
- https://ai.google.dev/gemini-api/docs/pricing
- https://ai.google.dev/gemini-api/docs/api-key
- https://ai.google.dev/api/generate-content

Kod telah diuji dengan respons Gemini simulasi; panggilan langsung memerlukan key anda. Model dan kuota tertakluk pada perubahan Google.
