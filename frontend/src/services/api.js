// Asas API: guna VITE_API_URL jika ditetapkan (produksi), jika tidak guna proksi /api.
const ASAS = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
const url = (laluan) => `${ASAS}/api${laluan}`;

function token() {
  return localStorage.getItem("sbp_token") || "";
}

async function urus(res) {
  const jenis = res.headers.get("content-type") || "";
  if (jenis.includes("application/json")) {
    const data = await res.json();
    if (!res.ok) throw new Error(data.ralat || "Ralat tidak diketahui.");
    return data;
  }
  if (!res.ok) throw new Error(`Ralat pelayan (${res.status}).`);
  return res;
}

export const api = {
  async get(laluan) {
    const res = await fetch(url(laluan), { headers: { Authorization: `Bearer ${token()}` } });
    return urus(res);
  },
  async post(laluan, body) {
    const res = await fetch(url(laluan), {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
      body: JSON.stringify(body || {}),
    });
    return urus(res);
  },
  async put(laluan, body) {
    const res = await fetch(url(laluan), {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
      body: JSON.stringify(body || {}),
    });
    return urus(res);
  },
  async patch(laluan, body) {
    const res = await fetch(url(laluan), {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
      body: JSON.stringify(body || {}),
    });
    return urus(res);
  },
  async del(laluan) {
    const res = await fetch(url(laluan), {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token()}` },
    });
    return urus(res);
  },
  // Muat naik fail dengan pemantauan kemajuan (guna XHR untuk progress).
  proses(slug, fail, pilihan, onProgress) {
    return new Promise((resolve, reject) => {
      const borang = new FormData();
      for (const f of fail) borang.append("files", f);
      for (const [k, v] of Object.entries(pilihan || {})) borang.append(k, v);

      const xhr = new XMLHttpRequest();
      xhr.open("POST", url(`/alat/proses/${slug}`));
      const t = token();
      if (t) xhr.setRequestHeader("Authorization", `Bearer ${t}`);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
      };
      xhr.onload = () => {
        try {
          const data = JSON.parse(xhr.responseText || "{}");
          if (xhr.status >= 200 && xhr.status < 300) resolve(data);
          else reject(new Error(data.ralat || `Ralat pelayan (${xhr.status}).`));
        } catch {
          reject(new Error("Respons pelayan tidak sah."));
        }
      };
      xhr.onerror = () => reject(new Error("Gagal menyambung ke pelayan."));
      xhr.send(borang);
    });
  },
  muatTurunUrl(laluan) {
    return url(laluan).replace("/api/api", "/api"); // laluan sudah termasuk /api
  },
  fullUrl(laluan) {
    return `${ASAS}${laluan}`;
  },
};
