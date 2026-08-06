// Import eksplisit hanya ikon yang digunakan katalog alat.
// Ini mengelakkan kebergantungan membundel keseluruhan pustaka lucide-react.
import {
  Archive, ArrowDownUp, Code2, Combine, Crop, EyeOff, FileMinus, FileOutput,
  FileSpreadsheet, FileText, FileType, FormInput, Gauge, GitCompare, Hash,
  Image, ImagePlus, KeyRound, Lock, LockOpen, Minimize2, PenLine, PenSquare,
  Presentation, RotateCw, ScanLine, Scissors, Stamp, TextSearch, Type, Wrench,
} from "lucide-react";

export const IKON = {
  Archive, ArrowDownUp, Code2, Combine, Crop, EyeOff, FileMinus, FileOutput,
  FileSpreadsheet, FileText, FileType, FormInput, Gauge, GitCompare, Hash,
  Image, ImagePlus, KeyRound, Lock, LockOpen, Minimize2, PenLine, PenSquare,
  Presentation, RotateCw, ScanLine, Scissors, Stamp, TextSearch, Type, Wrench,
};

export function ikonAlat(nama) {
  return IKON[nama] || FileText;
}
