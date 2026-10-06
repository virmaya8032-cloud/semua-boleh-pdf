import { spawn } from "child_process";
import { fileURLToPath } from "url";
import fs from "fs";
import { laluanOutput } from "../utils/files.js";

const script = fileURLToPath(new URL("../../scripts/pdf_tools.py", import.meta.url));
export async function pythonPdf(op, paths, opts = {}, extension = "pdf") {
  const output = laluanOutput(extension);
  try {
    await new Promise((resolve, reject) => {
      const child = spawn(process.env.PYTHON_BIN || "python3", [script], { shell: false });
      let stdout = "";
      const timer = setTimeout(() => { child.kill("SIGKILL"); reject(new Error("Pemprosesan terlalu lama. Cuba fail yang lebih kecil.")); }, 120000);
      child.stdout.on("data", (chunk) => { stdout += chunk; });
      child.stderr.on("data", () => {});
      child.stdin.on("error", () => {});
      child.on("error", (error) => { clearTimeout(timer); reject(new Error(error.code === "ENOENT" ? "Python belum dipasang. Deploy backend menggunakan Docker." : error.message)); });
      child.on("close", (code) => {
        clearTimeout(timer);
        let result;
        try { result = JSON.parse(stdout.trim().split("\n").pop()); } catch {}
        if (code === 0 && result?.ok && fs.existsSync(output)) resolve();
        else reject(new Error(result?.error || "Pemprosesan PDF gagal. Pastikan PyMuPDF dipasang melalui Docker."));
      });
      child.stdin.end(JSON.stringify({ op, paths, opts, output }));
    });
    return output;
  } catch (error) {
    fs.rmSync(output, { force: true });
    throw error;
  }
}
