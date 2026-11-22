/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';
import {
  Barcode,
  QrCode,
  Printer,
  Download,
  Copy,
  Sparkles,
  History,
  Tag,
  Settings,
  RefreshCw,
  Check,
  Trash2,
  Plus,
  Package,
  Layers,
  FileSpreadsheet,
  HelpCircle,
  ArrowRight,
  Maximize2,
  LayoutGrid,
  Shuffle
} from 'lucide-react';

interface SavedBarcode {
  id: string;
  type: string;
  value: string;
  title: string;
  price?: number;
  category?: string;
  createdAt: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'single' | 'bulk' | 'templates' | 'a4-print' | 'ai' | 'history'>('single');
  
  // Single Barcode State
  const [symbology, setSymbology] = useState<string>('CODE128');
  const [value, setValue] = useState<string>('885' + Math.floor(1000000000 + Math.random() * 9000000000));
  const [title, setTitle] = useState<string>('สินค้าพรีเมียม (Premium Item)');
  const [price, setPrice] = useState<string>('299');
  const [sku, setSku] = useState<string>('SKU-' + Math.floor(1000 + Math.random() * 9000));
  const [barWidth, setBarWidth] = useState<number>(2);
  const [barHeight, setBarHeight] = useState<number>(80);
  const [lineColor, setLineColor] = useState<string>('#0f172a');
  const [bgColor, setBgColor] = useState<string>('#ffffff');
  const [showText, setShowText] = useState<boolean>(true);
  const [fontSize, setFontSize] = useState<number>(14);
  const [margin, setMargin] = useState<number>(5);
  const [copied, setCopied] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  // A4 Sheet Layout State
  const [a4Cols, setA4Cols] = useState<number>(3);
  const [a4Rows, setA4Rows] = useState<number>(7);
  const [a4Quantity, setA4Quantity] = useState<number>(21);
  const [showCutLines, setShowCutLines] = useState<boolean>(true);

  // Bulk Generator State
  const [bulkPrefix, setBulkPrefix] = useState<string>('PROD-');
  const [bulkStart, setBulkStart] = useState<number>(1);
  const [bulkEnd, setBulkEnd] = useState<number>(10);
  const [bulkList, setBulkList] = useState<{ value: string; name: string; price: string }[]>([]);
  const [bulkInputText, setBulkInputText] = useState<string>('เสื้อยืดคอกลม ไซส์ M, 199\nกางเกงยีนส์, 790\nรองเท้าผ้าใบ, 1290');

  // AI Assistant State
  const [aiPrompt, setAiPrompt] = useState<string>('กาแฟออร์แกนิกคั่วเข้ม 250 กรัม สำหรับคาเฟ่');
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // History State
  const [history, setHistory] = useState<SavedBarcode[]>([]);

  // Refs for rendering
  const barcodeSvgRef = useRef<SVGSVGElement | null>(null);
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('barcodemaster_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const saveToHistory = (item: Omit<SavedBarcode, 'id' | 'createdAt'>) => {
    const newItem: SavedBarcode = {
      ...item,
      id: Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toLocaleString('th-TH')
    };
    const updated = [newItem, ...history.slice(0, 49)];
    setHistory(updated);
    localStorage.setItem('barcodemaster_history', JSON.stringify(updated));
  };

  // Function to randomize barcode value automatically based on symbology
  const handleRandomizeValue = () => {
    let randVal = '';
    if (symbology === 'EAN13') {
      // EAN-13 typically starts with 885 (Thailand) + 10 random digits
      const randomDigits = Math.floor(100000000 + Math.random() * 900000000);
      randVal = `885${randomDigits}`;
    } else if (symbology === 'UPC') {
      // UPC-A 12 digits
      randVal = String(Math.floor(100000000000 + Math.random() * 900000000000));
    } else if (symbology === 'CODE39') {
      randVal = 'CODE-' + Math.floor(10000 + Math.random() * 90000);
    } else if (symbology === 'QRCODE') {
      randVal = 'https://shop.example.com/item/' + Math.floor(100000 + Math.random() * 900000);
    } else {
      // CODE128
      randVal = 'BAR-' + Math.floor(10000000 + Math.random() * 90000000);
    }
    setValue(randVal);
    showToast('สุ่มรหัสบาร์โค้ดใหม่สำเร็จ: ' + randVal);
  };

  // Render barcode or QR
  useEffect(() => {
    if (symbology === 'QRCODE') {
      if (qrCanvasRef.current) {
        QRCode.toCanvas(
          qrCanvasRef.current,
          value || 'https://example.com',
          {
            width: barHeight * 1.8,
            margin: 2,
            color: {
              dark: lineColor,
              light: bgColor
            }
          },
          (error) => {
            if (error) console.error('QR Error:', error);
          }
        );
      }
    } else {
      if (barcodeSvgRef.current) {
        try {
          JsBarcode(barcodeSvgRef.current, value || '12345678', {
            format: symbology,
            width: barWidth,
            height: barHeight,
            displayValue: showText,
            lineColor: lineColor,
            background: bgColor,
            fontSize: fontSize,
            margin: margin
          });
        } catch (e) {
          console.error('Barcode generation error:', e);
        }
      }
    }
  }, [symbology, value, barWidth, barHeight, lineColor, bgColor, showText, fontSize, margin]);

  // Show notification toast
  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Download PNG
  const handleDownloadPNG = () => {
    if (symbology === 'QRCODE') {
      if (qrCanvasRef.current) {
        const url = qrCanvasRef.current.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `qrcode_${value}.png`;
        link.href = url;
        link.click();
        showToast('ดาวน์โหลดไฟล์ PNG สำเร็จ');
      }
    } else {
      if (barcodeSvgRef.current) {
        const svgElement = barcodeSvgRef.current;
        const svgString = new XMLSerializer().serializeToString(svgElement);
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const URL = window.URL || window.webkitURL || window;
        const blobURL = URL.createObjectURL(svgBlob);
        const image = new Image();
        image.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = image.width || 400;
          canvas.height = image.height || 200;
          const context = canvas.getContext('2d');
          if (context) {
            context.fillStyle = bgColor;
            context.fillRect(0, 0, canvas.width, canvas.height);
            context.drawImage(image, 0, 0);
            const png = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = `barcode_${value}.png`;
            link.href = png;
            link.click();
            showToast('ดาวน์โหลดไฟล์ PNG สำเร็จ');
          }
        };
        image.src = blobURL;
      }
    }
    saveToHistory({ type: symbology, value, title, price: Number(price) });
  };

  // Download SVG
  const handleDownloadSVG = () => {
    if (symbology === 'QRCODE') {
      showToast('QR Code แนะนำให้ดาวน์โหลดเป็นไฟล์ PNG');
      return;
    }
    if (barcodeSvgRef.current) {
      const svgElement = barcodeSvgRef.current;
      const svgString = new XMLSerializer().serializeToString(svgElement);
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `barcode_${value}.svg`;
      link.href = url;
      link.click();
      showToast('ดาวน์โหลดไฟล์ SVG สำเร็จ');
      saveToHistory({ type: symbology, value, title, price: Number(price) });
    }
  };

  // Copy Image
  const handleCopyClipboard = async () => {
    try {
      if (symbology === 'QRCODE' && qrCanvasRef.current) {
        qrCanvasRef.current.toBlob(async (blob) => {
          if (blob) {
            await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
            setCopied(true);
            showToast('คัดลอกรูปภาพไปยังคลิปบอร์ดแล้ว');
            setTimeout(() => setCopied(false), 2000);
          }
        });
      } else if (barcodeSvgRef.current) {
        const svgElement = barcodeSvgRef.current;
        const svgString = new XMLSerializer().serializeToString(svgElement);
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const URL = window.URL || window.webkitURL || window;
        const blobURL = URL.createObjectURL(svgBlob);
        const image = new Image();
        image.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = image.width || 400;
          canvas.height = image.height || 200;
          const context = canvas.getContext('2d');
          if (context) {
            context.fillStyle = bgColor;
            context.fillRect(0, 0, canvas.width, canvas.height);
            context.drawImage(image, 0, 0);
            canvas.toBlob(async (blob) => {
              if (blob) {
                await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
                setCopied(true);
                showToast('คัดลอกรูปภาพไปยังคลิปบอร์ดแล้ว');
                setTimeout(() => setCopied(false), 2000);
              }
            });
          }
        };
        image.src = blobURL;
      }
    } catch (err) {
      console.error(err);
      showToast('ไม่สามารถคัดลอกรูปภาพได้ในเบราว์เซอร์นี้');
    }
  };

  // Direct Print
  const handlePrint = () => {
    window.print();
  };

  // Generate Bulk List from Range
  const generateRangeBulk = () => {
    const list = [];
    for (let i = bulkStart; i <= bulkEnd; i++) {
      const paddedNum = String(i).padStart(3, '0');
      list.push({
        value: `${bulkPrefix}${Math.floor(1000 + Math.random() * 9000)}`,
        name: `สินค้าชุดที่ ${paddedNum}`,
        price: '199'
      });
    }
    setBulkList(list);
    showToast(`สร้างรายการบาร์โค้ดจำนวน ${list.length} รายการสำเร็จ`);
  };

  // Parse Bulk Text
  const parseTextBulk = () => {
    const lines = bulkInputText.split('\n');
    const list = lines.map((line, idx) => {
      const parts = line.split(',');
      const val = parts[0]?.trim() || `ITEM-${idx + 1}`;
      const prc = parts[1]?.trim() || '299';
      return {
        value: val,
        name: val,
        price: prc
      };
    }).filter(item => item.value);
    setBulkList(list);
    showToast(`แปลงข้อมูลบาร์โค้ดจำนวน ${list.length} รายการสำเร็จ`);
  };

  // AI Assistant Request
  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch('/api/ai/barcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'เกิดข้อผิดพลาด');
      
      setValue(data.skuOrCode);
      setTitle(data.productName);
      setPrice(String(data.price));
      setSymbology(data.symbology === 'QR' ? 'QRCODE' : (data.symbology || 'CODE128'));
      setActiveTab('single');
      showToast('AI สร้างข้อมูลบาร์โค้ดและสินค้าสำเร็จ!');
    } catch (err: any) {
      setAiError(err.message || 'ไม่สามารถติดต่อ AI ได้');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 text-sm font-medium animate-fade-in border border-slate-700 print:hidden">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Top Bar Contract (3 zones) */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between gap-8 sticky top-0 z-40 shadow-xs print:hidden">
        {/* Zone 1: Brand wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm">
            <Barcode className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900">BarcodeMaster Pro</h1>
            <p className="text-xs text-slate-500 hidden sm:block">ระบบสร้างและพิมพ์บาร์โค้ดมืออาชีพ</p>
          </div>
        </div>

        {/* Zone 2: Navigation links */}
        <nav className="hidden xl:flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('single')}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'single' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            สร้างบาร์โค้ดเดี่ยว
          </button>
          <button
            onClick={() => setActiveTab('a4-print')}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'a4-print' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5 text-blue-600" />
            จัดหน้า A4 & พิมพ์สติกเกอร์
          </button>
          <button
            onClick={() => setActiveTab('bulk')}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'bulk' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            สร้างจำนวนมาก (Bulk)
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'templates' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            เทมเพลตฉลากสินค้า
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'ai' ? 'bg-indigo-600 text-white shadow-xs' : 'text-indigo-600 hover:bg-indigo-50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            ผู้ช่วย AI
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'history' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ประวัติ
          </button>
        </nav>

        {/* Zone 3: Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-sm whitespace-nowrap shrink-0"
          >
            <Printer className="w-4 h-4" />
            พิมพ์ฉลาก (Print)
          </button>
        </div>
      </header>

      {/* Mobile Nav Subbar */}
      <div className="flex xl:hidden overflow-x-auto bg-white border-b border-slate-200 px-4 py-2 gap-2 scrollbar-none print:hidden">
        <button
          onClick={() => setActiveTab('single')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap ${
            activeTab === 'single' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
          }`}
        >
          สร้างเดี่ยว
        </button>
        <button
          onClick={() => setActiveTab('a4-print')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap flex items-center gap-1 ${
            activeTab === 'a4-print' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700'
          }`}
        >
          <LayoutGrid className="w-3 h-3" /> จัดหน้า A4
        </button>
        <button
          onClick={() => setActiveTab('bulk')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap ${
            activeTab === 'bulk' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
          }`}
        >
          สร้างจำนวนมาก
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap ${
            activeTab === 'templates' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
          }`}
        >
          เทมเพลต
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap flex items-center gap-1 ${
            activeTab === 'ai' ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-700'
          }`}
        >
          <Sparkles className="w-3 h-3" /> AI
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap ${
            activeTab === 'history' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
          }`}
        >
          ประวัติ
        </button>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 print:p-0 print:m-0 print:max-w-none">
        {/* ================= TAB 1: SINGLE BARCODE ================= */}
        {activeTab === 'single' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Controls */}
            <div className="lg:col-span-7 space-y-6 print:hidden">
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-slate-600" />
                    ตั้งค่าบาร์โค้ดและข้อมูลสินค้า
                  </h2>
                  <button
                    onClick={handleRandomizeValue}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-xl hover:bg-slate-800 transition-all shadow-sm"
                  >
                    <Shuffle className="w-3.5 h-3.5" /> สุ่มตัวเลขบาร์โค้ดอัตโนมัติ
                  </button>
                </div>

                {/* Symbology selection */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-700">รูปแบบบาร์โค้ด (Symbology)</label>
                  <select
                    value={symbology}
                    onChange={(e) => {
                      setSymbology(e.target.value);
                      // Auto generate matching format on symbology switch
                      setTimeout(() => handleRandomizeValue(), 50);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  >
                    <optgroup label="มาตรฐาน 1 มิติ (1D Barcodes)">
                      <option value="CODE128">Code 128 (รองรับตัวอักษรและตัวเลขทั่วไป)</option>
                      <option value="CODE39">Code 39 (มาตรฐานอุตสาหกรรม)</option>
                      <option value="EAN13">EAN-13 (รหัสสินค้าสากล 13 หลัก)</option>
                      <option value="UPC">UPC-A (รหัสสินค้า 12 หลัก)</option>
                      <option value="ITF14">ITF-14 (สำหรับกล่องบรรจุภัณฑ์/โลจิสติกส์)</option>
                      <option value="MSI">MSI (รหัสคลังสินค้า)</option>
                    </optgroup>
                    <optgroup label="มาตรฐาน 2 มิติ (2D Barcodes)">
                      <option value="QRCODE">QR Code (รองรับข้อความยาว, URL, ข้อมูล)</option>
                    </optgroup>
                  </select>
                </div>

                {/* Value Input */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-700">ข้อความหรือรหัสข้อมูลบาร์โค้ด (Value / Code)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      placeholder="เช่น 8851234567890"
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:ring-2 focus:ring-slate-900 focus:outline-none"
                    />
                    <button
                      onClick={handleRandomizeValue}
                      className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <Shuffle className="w-3.5 h-3.5" /> สุ่มรหัส
                    </button>
                  </div>
                </div>

                {/* Product Meta details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-700">ชื่อสินค้า / ป้ายหัวข้อ</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="เช่น กาแฟออร์แกนิก 250g"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-slate-900 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-700">ราคา (บาท) หรือข้อมูลเสริม</label>
                    <input
                      type="text"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="เช่น 299"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:ring-2 focus:ring-slate-900 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Styling Sliders */}
                <div className="border-t border-slate-100 pt-4 space-y-4">
                  <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">ปรับแต่งรูปแบบภาพ</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {symbology !== 'QRCODE' && (
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs text-slate-600">
                          <span>ความกว้างเส้น (Bar Width): {barWidth}px</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="4"
                          value={barWidth}
                          onChange={(e) => setBarWidth(Number(e.target.value))}
                          className="w-full accent-slate-900"
                        />
                      </div>
                    )}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs text-slate-600">
                        <span>ความสูง (Height): {barHeight}px</span>
                      </div>
                      <input
                        type="range"
                        min="40"
                        max="150"
                        value={barHeight}
                        onChange={(e) => setBarHeight(Number(e.target.value))}
                        className="w-full accent-slate-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-600">สีเส้น (Line)</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={lineColor}
                          onChange={(e) => setLineColor(e.target.value)}
                          className="w-8 h-8 rounded-lg border border-slate-300 cursor-pointer p-0"
                        />
                        <span className="text-xs font-mono">{lineColor}</span>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-600">พื้นหลัง (Background)</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={bgColor}
                          onChange={(e) => setBgColor(e.target.value)}
                          className="w-8 h-8 rounded-lg border border-slate-300 cursor-pointer p-0"
                        />
                        <span className="text-xs font-mono">{bgColor}</span>
                      </div>
                    </div>
                    {symbology !== 'QRCODE' && (
                      <div className="col-span-2 flex items-center pt-5">
                        <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={showText}
                            onChange={(e) => setShowText(e.target.checked)}
                            className="w-4 h-4 rounded border-slate-300 accent-slate-900"
                          />
                          แสดงตัวอักษรรหัสใต้บาร์โค้ด
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Live Preview & Action Buttons */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col items-center text-center space-y-6 sticky top-24 print:border-none print:shadow-none print:p-0">
                <div className="w-full flex items-center justify-between border-b border-slate-100 pb-3 print:hidden">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">ตัวอย่างป้ายสินค้าและบาร์โค้ด</span>
                  <span className="text-xs font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">{symbology}</span>
                </div>

                {/* Printable Label Card Mockup */}
                <div
                  className="w-full max-w-sm p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center space-y-4 print:shadow-none print:border-none print:w-full print:m-0"
                  style={{ backgroundColor: bgColor }}
                >
                  {title && <h3 className="text-base font-bold text-slate-900 truncate max-w-full">{title}</h3>}
                  
                  {/* Barcode / QR Container */}
                  <div className="p-2 bg-white rounded-xl shadow-2xs flex items-center justify-center overflow-x-auto w-full">
                    {symbology === 'QRCODE' ? (
                      <canvas ref={qrCanvasRef} />
                    ) : (
                      <svg ref={barcodeSvgRef} className="max-w-full" />
                    )}
                  </div>

                  {price && (
                    <div className="flex items-baseline gap-1 text-slate-900 pt-1">
                      <span className="text-xs font-medium text-slate-500">ราคา</span>
                      <span className="text-2xl font-extrabold tabular-nums tracking-tight text-emerald-600">{price}</span>
                      <span className="text-xs font-medium text-slate-500">บาท</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3 w-full print:hidden">
                  <button
                    onClick={handleDownloadPNG}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
                  >
                    <Download className="w-4 h-4" />
                    ดาวน์โหลด PNG
                  </button>
                  {symbology !== 'QRCODE' ? (
                    <button
                      onClick={handleDownloadSVG}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
                    >
                      <Download className="w-4 h-4" />
                      ดาวน์โหลด SVG
                    </button>
                  ) : (
                    <button
                      onClick={handleCopyClipboard}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
                    >
                      <Copy className="w-4 h-4" />
                      {copied ? 'คัดลอกแล้ว!' : 'คัดลอกภาพ'}
                    </button>
                  )}
                </div>

                <button
                  onClick={handlePrint}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-sm print:hidden"
                >
                  <Printer className="w-4 h-4" />
                  พิมพ์ออกเครื่องพิมพ์ (Direct Print)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: A4 SHEET LAYOUT & STICKER PRINT ================= */}
        {activeTab === 'a4-print' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6 print:hidden">
              <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                    <LayoutGrid className="w-4 h-4 text-blue-600" />
                    จัดหน้ากระดาษ A4 สำหรับพิมพ์สติกเกอร์หลายดวง
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">กำหนดรูปแบบตาราง คอลัมน์ แถว และจำนวนดวงที่ต้องการพิมพ์ลงบนกระดาษ A4</p>
                </div>
                <button
                  onClick={handleRandomizeValue}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 text-white text-xs font-medium rounded-xl hover:bg-slate-800 shadow-sm"
                >
                  <Shuffle className="w-3.5 h-3.5" /> สุ่มรหัสบาร์โค้ดใหม่
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700">รูปแบบตารางสำเร็จรูป</label>
                  <select
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '3x7') { setA4Cols(3); setA4Rows(7); setA4Quantity(21); }
                      else if (val === '4x10') { setA4Cols(4); setA4Rows(10); setA4Quantity(40); }
                      else if (val === '2x5') { setA4Cols(2); setA4Rows(5); setA4Quantity(10); }
                      else if (val === '5x12') { setA4Cols(5); setA4Rows(12); setA4Quantity(60); }
                    }}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs bg-white"
                  >
                    <option value="3x7">3 คอลัมน์ x 7 แถว (21 ดวง/แผ่น)</option>
                    <option value="4x10">4 คอลัมน์ x 10 แถว (40 ดวง/แผ่น)</option>
                    <option value="2x5">2 คอลัมน์ x 5 แถว (10 ดวง/แผ่น)</option>
                    <option value="5x12">5 คอลัมน์ x 12 แถว (60 ดวง/แผ่น - ป้ายราคาเล็ก)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700">จำนวนคอลัมน์ (Columns)</label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={a4Cols}
                    onChange={(e) => setA4Cols(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700">จำนวนแถว (Rows)</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={a4Rows}
                    onChange={(e) => setA4Rows(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700">จำนวนดวงที่ต้องการพิมพ์ (Total Qty)</label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={a4Quantity}
                    onChange={(e) => setA4Quantity(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showCutLines}
                    onChange={(e) => setShowCutLines(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 accent-blue-600"
                  />
                  แสดงเส้นประขอบตัดสติกเกอร์ (Cut Guidelines)
                </label>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                >
                  <Printer className="w-4 h-4" /> สั่งพิมพ์กระดาษ A4 ({a4Quantity} ดวง)
                </button>
              </div>
            </div>

            {/* A4 Sheet Visual Preview */}
            <div className="space-y-4">
              <div className="flex items-center justify-between print:hidden">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">ตัวอย่างหน้ากระดาษ A4 (A4 Grid Preview)</span>
                <span className="text-xs text-slate-500">รหัสปัจจุบัน: <code className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200">{value}</code></span>
              </div>

              <div className="bg-slate-200 p-4 sm:p-8 rounded-2xl flex justify-center overflow-x-auto print:p-0 print:bg-white">
                {/* A4 Paper Container (210mm x 297mm ratio approx 1:1.414) */}
                <div className="bg-white w-[210mm] min-h-[297mm] p-[10mm] shadow-2xl flex flex-col justify-start print:shadow-none print:w-full print:h-auto print:p-0">
                  <div
                    className="grid gap-2 w-full"
                    style={{
                      gridTemplateColumns: `repeat(${a4Cols}, minmax(0, 1fr))`
                    }}
                  >
                    {Array.from({ length: a4Quantity }).map((_, idx) => (
                      <div
                        key={idx}
                        className={`p-3 flex flex-col items-center justify-center text-center bg-white rounded-lg ${
                          showCutLines ? 'border border-dashed border-slate-300' : 'border border-slate-100'
                        } break-inside-avoid`}
                        style={{ minHeight: '32mm' }}
                      >
                        {title && <div className="text-[10px] font-bold text-slate-900 truncate w-full">{title}</div>}
                        <div className="my-1 flex items-center justify-center">
                          {symbology === 'QRCODE' ? (
                            <div className="w-12 h-12 bg-slate-900 text-white flex items-center justify-center text-[8px] font-mono">QR</div>
                          ) : (
                            <svg
                              ref={(el) => {
                                if (el) {
                                  try {
                                    JsBarcode(el, value, {
                                      format: symbology,
                                      width: 1.2,
                                      height: 35,
                                      displayValue: true,
                                      fontSize: 9,
                                      margin: 2
                                    });
                                  } catch (e) {}
                                }
                              }}
                            />
                          )}
                        </div>
                        {price && <div className="text-[10px] font-extrabold text-emerald-600">฿{price}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: BULK GENERATOR ================= */}
        {activeTab === 'bulk' && (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6 print:hidden">
              <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-slate-600" />
                    สร้างบาร์โค้ดจำนวนมาก (Bulk Generator)
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">สร้างรหัสบาร์โค้ดสุ่มต่อเนื่องตามช่วงตัวเลข หรือวางข้อมูลจากตาราง/CSV</p>
                </div>
                <button
                  onClick={generateRangeBulk}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 text-white text-xs font-medium rounded-xl hover:bg-slate-800 shadow-sm"
                >
                  <Shuffle className="w-3.5 h-3.5" /> สุ่มรหัสชุดใหม่ทั้งหมด
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Method A: Range */}
                <div className="space-y-4 p-5 bg-slate-50 rounded-xl border border-slate-200">
                  <h3 className="text-sm font-bold text-slate-900">วิธีที่ 1: สร้างตามช่วงตัวเลข (Range & Prefix)</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs text-slate-600">คำนำหน้า (Prefix)</label>
                      <input
                        type="text"
                        value={bulkPrefix}
                        onChange={(e) => setBulkPrefix(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-600">เริ่มต้น (Start)</label>
                      <input
                        type="number"
                        value={bulkStart}
                        onChange={(e) => setBulkStart(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-600">สิ้นสุด (End)</label>
                      <input
                        type="number"
                        value={bulkEnd}
                        onChange={(e) => setBulkEnd(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-mono"
                      />
                    </div>
                  </div>
                  <button
                    onClick={generateRangeBulk}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <Shuffle className="w-3.5 h-3.5" /> สุ่มและสร้างรายการช่วงตัวเลข
                  </button>
                </div>

                {/* Method B: Paste list */}
                <div className="space-y-4 p-5 bg-slate-50 rounded-xl border border-slate-200">
                  <h3 className="text-sm font-bold text-slate-900">วิธีที่ 2: วางข้อมูลข้อความ (Format: รหัส, ราคา)</h3>
                  <div className="space-y-1">
                    <textarea
                      rows={3}
                      value={bulkInputText}
                      onChange={(e) => setBulkInputText(e.target.value)}
                      placeholder="SKU001, 190\nSKU002, 250"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono"
                    />
                  </div>
                  <button
                    onClick={parseTextBulk}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
                  >
                    แปลงรายการจากข้อความ
                  </button>
                </div>
              </div>
            </div>

            {/* Bulk Results Grid */}
            {bulkList.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between print:hidden">
                  <h3 className="text-sm font-bold text-slate-900">รายการที่สร้างทั้งหมด ({bulkList.length} รายการ)</h3>
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 shadow-sm"
                  >
                    <Printer className="w-4 h-4" /> พิมพ์ฉลากทั้งหมด
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {bulkList.map((item, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col items-center text-center space-y-2 break-inside-avoid">
                      <span className="text-xs font-bold text-slate-700 truncate w-full">{item.name}</span>
                      <div className="bg-slate-50 p-2 rounded-lg w-full flex justify-center">
                        <svg
                          ref={(el) => {
                            if (el) {
                              try {
                                JsBarcode(el, item.value, {
                                  format: 'CODE128',
                                  width: 1.5,
                                  height: 50,
                                  displayValue: true,
                                  fontSize: 10,
                                  margin: 5
                                });
                              } catch (e) {}
                            }
                          }}
                        />
                      </div>
                      <div className="text-xs font-extrabold text-emerald-600">฿{item.price}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 4: TEMPLATES ================= */}
        {activeTab === 'templates' && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-4 print:hidden">
              <h2 className="text-base font-semibold text-slate-900">เทมเพลตฉลากสินค้าสำเร็จรูป (Ready-made Templates)</h2>
              <p className="text-xs text-slate-500 mt-1">เลือกรูปแบบฉลากมาตรฐานที่ใช้งานบ่อยในธุรกิจค้าปลีก คลังสินค้า และโลจิสติกส์</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Template 1: Retail Price Tag */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-400 transition-all">
                <div className="space-y-3">
                  <div className="inline-block px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-md">
                    ป้ายราคาค้าปลีก (Retail Tag)
                  </div>
                  <h3 className="font-bold text-lg text-slate-900">สินค้าอุปโภคบริโภคทั่วไป</h3>
                  <p className="text-xs text-slate-500">เหมาะสำหรับติดชั้นวางสินค้าในซูเปอร์มาร์เก็ตหรือร้านสะดวกซื้อ</p>
                  <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-center space-y-2">
                    <div className="text-sm font-bold text-slate-800">เครื่องดื่มชาเขียวมัทฉะ 500มล.</div>
                    <div className="text-2xl font-extrabold text-emerald-600">฿ 45.00</div>
                    <div className="text-xs font-mono text-slate-500">BAR: 885912345001</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setValue('885912345001');
                    setTitle('ชาเขียวมัทฉะ 500มล.');
                    setPrice('45');
                    setActiveTab('single');
                    showToast('โหลดเทมเพลตป้ายราคาสำเร็จ');
                  }}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors print:hidden"
                >
                  เลือกใช้งานเทมเพลตนี้
                </button>
              </div>

              {/* Template 2: Asset Tag */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-400 transition-all">
                <div className="space-y-3">
                  <div className="inline-block px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-md">
                    ป้ายทรัพย์สินองค์กร (Asset Tag)
                  </div>
                  <h3 className="font-bold text-lg text-slate-900">ครุภัณฑ์และอุปกรณ์ไอที</h3>
                  <p className="text-xs text-slate-500">ติดสินทรัพย์บริษัท แล็ปท็อป โต๊ะทำงาน เครื่องจักร</p>
                  <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-center space-y-2">
                    <div className="text-xs font-bold text-slate-700">ASSET ID: AST-2026-9912</div>
                    <div className="text-xs text-slate-500">ฝ่ายเทคโนโลยีสารสนเทศ</div>
                    <div className="text-xs font-mono text-slate-400">Code 39 Format</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setValue('AST-2026-9912');
                    setTitle('ASSET: โน้ตบุ๊กองค์กร');
                    setPrice('');
                    setSymbology('CODE39');
                    setActiveTab('single');
                    showToast('โหลดเทมเพลตป้ายทรัพย์สินสำเร็จ');
                  }}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors print:hidden"
                >
                  เลือกใช้งานเทมเพลตนี้
                </button>
              </div>

              {/* Template 3: Shipping QR Label */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-400 transition-all">
                <div className="space-y-3">
                  <div className="inline-block px-2.5 py-1 bg-purple-50 text-purple-700 text-xs font-semibold rounded-md">
                    ป้ายพัสดุ / ขนส่ง (Logistics)
                  </div>
                  <h3 className="font-bold text-lg text-slate-900">QR Code ข้อมูลจัดส่ง</h3>
                  <p className="text-xs text-slate-500">สำหรับสแกนติดตามพัสดุและข้อมูลคำสั่งซื้ออีคอมเมิร์ซ</p>
                  <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-center space-y-2">
                    <div className="text-xs font-bold text-slate-800">ORDER #TH-998271</div>
                    <div className="text-xs text-slate-500">ปลายทาง: กรุงเทพมหานคร</div>
                    <div className="text-xs font-mono text-purple-600">QR Code Standard</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setValue('https://track.example.com/shipment/TH-998271');
                    setTitle('พัสดุ #TH-998271');
                    setPrice('');
                    setSymbology('QRCODE');
                    setActiveTab('single');
                    showToast('โหลดเทมเพลต QR ขนส่งสำเร็จ');
                  }}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors print:hidden"
                >
                  เลือกใช้งานเทมเพลตนี้
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 5: AI ASSISTANT ================= */}
        {activeTab === 'ai' && (
          <div className="max-w-2xl mx-auto space-y-6 print:hidden">
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-3xl p-8 shadow-xl space-y-6 relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-medium text-indigo-200">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
                  Gemini AI Barcode Assistant
                </div>
                <h2 className="text-2xl font-bold tracking-tight">ให้ AI ช่วยออกแบบบาร์โค้ดและข้อมูลสินค้า</h2>
                <p className="text-sm text-indigo-200/80">พิมพ์ชื่อสินค้าหรือรายละเอียดสั้นๆ ระบบจะคำนวณรหัส SKU ชื่อสินค้า ราคา และเลือกรูปแบบบาร์โค้ดที่เหมาะสมที่สุดให้ทันที</p>
              </div>

              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-indigo-200">รายละเอียดสินค้าหรือโจทย์ของคุณ</label>
                  <textarea
                    rows={3}
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="เช่น กาแฟออร์แกนิกคั่วเข้ม 250 กรัม สำหรับคาเฟ่..."
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-indigo-300/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 backdrop-blur-md"
                  />
                </div>

                {aiError && (
                  <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-xs text-red-200">
                    {aiError}
                  </div>
                )}

                <button
                  onClick={handleAIGenerate}
                  disabled={aiLoading}
                  className="w-full py-3.5 bg-white text-slate-900 hover:bg-indigo-50 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {aiLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> กำลังให้ AI ประมวลผล...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-indigo-600" /> สร้างบาร์โค้ดด้วย AI ทันที
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 6: HISTORY ================= */}
        {activeTab === 'history' && (
          <div className="space-y-6 print:hidden">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-base font-semibold text-slate-900">ประวัติการสร้างบาร์โค้ด</h2>
                <p className="text-xs text-slate-500 mt-0.5">รายการบาร์โค้ดที่คุณเคยดาวน์โหลดหรือสร้างไว้ในเครื่องนี้</p>
              </div>
              {history.length > 0 && (
                <button
                  onClick={() => {
                    localStorage.removeItem('barcodemaster_history');
                    setHistory([]);
                    showToast('ล้างประวัติทั้งหมดแล้ว');
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> ล้างประวัติ
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="text-center py-16 space-y-3 bg-white rounded-2xl border border-slate-200">
                <History className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-sm font-medium text-slate-600">ยังไม่มีประวัติการสร้างบาร์โค้ด</p>
                <p className="text-xs text-slate-400">เมื่อคุณดาวน์โหลดหรือบันทึกบาร์โค้ด จะปรากฏที่นี่</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="divide-y divide-slate-100">
                  {history.map((item) => (
                    <div key={item.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900">{item.title || item.value}</span>
                          <span className="text-xs px-2 py-0.5 bg-slate-100 font-mono rounded text-slate-600">{item.type}</span>
                        </div>
                        <div className="text-xs font-mono text-slate-500">รหัส: {item.value} {item.price ? `| ราคา: ฿${item.price}` : ''}</div>
                        <div className="text-xs text-slate-400">{item.createdAt}</div>
                      </div>
                      <button
                        onClick={() => {
                          setValue(item.value);
                          setTitle(item.title);
                          setSymbology(item.type);
                          if (item.price) setPrice(String(item.price));
                          setActiveTab('single');
                          showToast('โหลดข้อมูลบาร์โค้ดลงในตัวแก้ไขแล้ว');
                        }}
                        className="px-3.5 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 transition-colors"
                      >
                        ใช้งานอีกครั้ง
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 px-6 text-center text-xs text-slate-500 print:hidden">
        <p>© 2026 BarcodeMaster Pro. Professional Barcode & QR Code Suite.</p>
      </footer>
    </div>
  );
}
