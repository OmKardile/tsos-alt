import React from 'react';
import {
  Monitor,
  Smartphone,
  Printer,
  Download,
  CheckCircle2,
  ExternalLink,
  X,
  HardDrive,
  ShieldCheck,
  Cpu,
} from 'lucide-react';
import { useTsosStore } from '../../lib/store';

interface HardwareDownloadsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HardwareDownloadsModal: React.FC<HardwareDownloadsModalProps> = ({ isOpen, onClose }) => {
  const { printerConfig } = useTsosStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-[#E9E0D6] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-[#1C1917] via-[#292524] to-[#1C1917] text-white flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F97316] text-white flex items-center justify-center shadow-md">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-[#F97316] uppercase tracking-wider">
                TSOS Hardware Hub & Native Clients
              </div>
              <h2 className="text-base font-bold text-white mt-0.5">
                Download Standalone Installers & Drivers
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
          {/* Windows Desktop Client */}
          <div className="p-4 rounded-2xl border border-[#E9E0D6] bg-[#FFF9F2] hover:bg-[#FFF1E6] transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0078D4] text-white flex items-center justify-center shrink-0 shadow-xs">
                <Monitor className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-[#1C1917]">
                    TSOS Windows Desktop POS (.exe)
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#E0F2FE] text-[#0369A1]">
                    v2.4 LTS (x64)
                  </span>
                </div>
                <p className="text-xs text-[#57534E] mt-1">
                  Native Windows .NET 9 client with hardware COM/USB thermal printer driver, cash drawer kick pulse, and dual-screen customer display support.
                </p>
                <div className="flex items-center gap-3 text-[11px] text-[#78716C] mt-2">
                  <span>Size: 42 MB</span>
                  <span>•</span>
                  <span>Windows 10 / 11 64-bit</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                alert('Downloading TSOS_Terminal_Desktop_v2.4_x64_Setup.exe...');
              }}
              className="px-4 py-2 rounded-xl bg-[#1C1917] hover:bg-black text-white font-bold text-xs flex items-center gap-2 shrink-0 shadow-xs transition-colors"
            >
              <Download className="w-4 h-4 text-[#F97316]" />
              <span>Download (.exe)</span>
            </button>
          </div>

          {/* Android POS & Waiter Terminal */}
          <div className="p-4 rounded-2xl border border-[#E9E0D6] bg-[#FFF9F2] hover:bg-[#FFF1E6] transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#3DDC84] text-[#0F5132] flex items-center justify-center shrink-0 shadow-xs">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-[#1C1917]">
                    TSOS Android Waiter & POS APK
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#DCFCE7] text-[#15803D]">
                    v2.4 (ARM64)
                  </span>
                </div>
                <p className="text-xs text-[#57534E] mt-1">
                  Kotlin & Jetpack Compose handheld client for Sunmi V2/P2, Pax A920, and Android waiter tablets with built-in camera barcode scanner.
                </p>
                <div className="flex items-center gap-3 text-[11px] text-[#78716C] mt-2">
                  <span>Size: 18 MB</span>
                  <span>•</span>
                  <span>Android 9.0+</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                alert('Downloading TSOS_Android_Handheld_v2.4.apk...');
              }}
              className="px-4 py-2 rounded-xl bg-[#1C1917] hover:bg-black text-white font-bold text-xs flex items-center gap-2 shrink-0 shadow-xs transition-colors"
            >
              <Download className="w-4 h-4 text-[#3DDC84]" />
              <span>Download APK</span>
            </button>
          </div>

          {/* Thermal Printer Driver & Setup */}
          <div className="p-4 rounded-2xl border border-[#E9E0D6] bg-white">
            <div className="flex items-center gap-2 font-bold text-xs text-[#1C1917] mb-2">
              <Printer className="w-4 h-4 text-[#F97316]" />
              <span>Thermal ESC/POS Hardware Configuration</span>
            </div>
            <p className="text-xs text-[#57534E] mb-3">
              TSOS prints directly to 58mm / 80mm ESC/POS thermal printers via WebUSB, WebBluetooth, or Windows Raw Print Spooler with zero driver installation required on Chrome/Edge.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-[#FFF9F2] border border-[#E9E0D6]">
                <div className="text-[10px] text-[#A8A29E] uppercase font-bold">Paper Width</div>
                <div className="font-mono font-bold text-[#1C1917] mt-0.5">{printerConfig.paper_width}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FFF9F2] border border-[#E9E0D6]">
                <div className="text-[10px] text-[#A8A29E] uppercase font-bold">Interface</div>
                <div className="font-mono font-bold text-[#1C1917] mt-0.5 capitalize">{printerConfig.connection_type}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FFF9F2] border border-[#E9E0D6] col-span-2 sm:col-span-1">
                <div className="text-[10px] text-[#A8A29E] uppercase font-bold">Cash Drawer</div>
                <div className="font-mono font-bold text-[#15803D] mt-0.5">RJ11 Pulse Ready</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#FFF9F2] border-t border-[#E9E0D6] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-[#57534E]">
            <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
            <span>Digital signatures verified for commercial point-of-sale terminals.</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#E9E0D6] hover:bg-[#D6D3D1] text-[#1C1917] font-semibold text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
