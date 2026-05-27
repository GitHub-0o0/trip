/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { UploadCloud, Image, Sparkles, RefreshCw, Check, ArrowRight, X, Compass, Route } from 'lucide-react';
import { CitySelection, CustomLlmConfig } from '../types';

interface ImagePlannerProps {
  lang: 'zh' | 'en';
  onImport: (departureId: string, destinations: CitySelection[]) => void;
  customLlmConfig: CustomLlmConfig;
}

interface ParsedImageTrip {
  departureCity: string | null;
  destinations: { cityId: string; cityName?: string; cityNameEn?: string; days: number }[];
  explanation: string;
  photoSummary: string;
}

export default function ImagePlanner({
  lang,
  onImport,
  customLlmConfig
}: ImagePlannerProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState<'idle' | 'ocr' | 'deepseek' | 'success' | 'error'>('idle');
  const [errorText, setErrorText] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<ParsedImageTrip | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileProcess = async (file: File) => {
    setIsProcessing(true);
    setProcessStep('ocr');
    setErrorText(null);
    setParsedData(null);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const result = reader.result as string;
          const base64Data = result.split(',')[1];
          
          setProcessStep('deepseek');

          const response = await fetch('/api/plan/parse-image-itinerary', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileData: base64Data,
              mimeType: file.type || 'image/jpeg',
              customLlm: customLlmConfig
            })
          });

          const data = await response.json();
          if (!response.ok || !data.success) {
            throw new Error(data.error || 'Failed to analyze image with the DeepSeek pipeline.');
          }

          setParsedData(data.data);
          setProcessStep('success');
        } catch (innerErr: any) {
          console.error(innerErr);
          setErrorText(innerErr.message || 'Image processing failed');
          setProcessStep('error');
        } finally {
          setIsProcessing(false);
        }
      };

      reader.onerror = () => {
        setErrorText('FileReader failed to capture binary.');
        setProcessStep('error');
        setIsProcessing(false);
      };

      reader.readAsDataURL(file);
    } catch (err: any) {
      setErrorText(err.message || 'Unknown file processing error');
      setProcessStep('error');
      setIsProcessing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (isProcessing) return;

    const files = Array.from(e.dataTransfer.files) as File[];
    const imgFile = files.find(f => f.type.startsWith('image/'));
    if (imgFile) {
      await handleFileProcess(imgFile);
    } else {
      setErrorText(lang === 'zh' ? '请上传支持的图片文件。' : 'Please upload a supported image file.');
      setProcessStep('error');
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await handleFileProcess(e.target.files[0]);
    }
  };

  const executeImport = () => {
    if (!parsedData) return;
    
    // Normalize destinations mapping
    const normalizedDestinations: CitySelection[] = parsedData.destinations.map(d => ({
      cityId: d.cityId.toLowerCase().trim().replace(/\s+/g, '_'),
      days: d.days || 2
    }));

    const departureId = parsedData.departureCity 
      ? parsedData.departureCity.toLowerCase().trim().replace(/\s+/g, '_')
      : 'beijing';

    onImport(departureId, normalizedDestinations);
  };

  return (
    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-4 font-sans select-none relative overflow-hidden">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200/50">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
            <Image className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-xs">
              {lang === 'zh' ? '上传照片/手记智能规划' : 'Travel Photo AI Planner'}
            </h4>
            <p className="text-[10px] text-slate-450">
              {lang === 'zh' ? '上传风景、路牌、发票或手写笔记，由 DeepSeek 自动生成推荐航线' : 'Upload postcards, notes or landmarks. DeepSeek maps stops instantly'}
            </p>
          </div>
        </div>
        <span className="text-[9px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shrink-0">
          <Sparkles className="w-2.5 h-2.5 animate-pulse text-indigo-600" /> DeepSeek Inside
        </span>
      </div>

      {processStep === 'idle' || processStep === 'error' ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-indigo-500 bg-indigo-50/60 scale-[0.99] shadow-inner'
              : 'border-slate-250 bg-white hover:border-slate-350 hover:bg-slate-50/50'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*"
            className="hidden"
          />
          <div className="space-y-2.5">
            <UploadCloud className="w-7 h-7 text-indigo-500 mx-auto transition-transform" />
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-700">
                {lang === 'zh' ? '拖拽或点击上传旅行相关图片' : 'Drag or click to upload your travel photo'}
              </p>
              <p className="text-[10px] text-slate-400 max-w-xs mx-auto leading-relaxed">
                {lang === 'zh' 
                  ? '支持风景照、景点海报、游记笔记截图、机票行程单。AI 整合视觉线索定制日程' 
                  : 'Supports landmarks, travel posters, logs or tickets. AI reverse-engineers paths.'}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {/* Loading states with Step tracking */}
      {isProcessing && (
        <div className="bg-white border border-slate-100 rounded-xl p-5 text-center flex flex-col items-center justify-center space-y-3.5 shadow-sm">
          <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin" />
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-800">
              {processStep === 'ocr' 
                ? (lang === 'zh' ? '第一步：Gemini 多模态视觉扫描中...' : 'Step 1: Gemini multimodal visual scanning...')
                : (lang === 'zh' ? '第二步：DeepSeek 大模型智能归一与日程反推中...' : 'Step 2: DeepSeek compiling perfect matching itinerary stops...')}
            </p>
            <p className="text-[10px] text-slate-400 max-w-xs leading-relaxed">
              {processStep === 'ocr'
                ? (lang === 'zh' ? '正在提取图片中的风景线索、目的地汉字与坐标关联...' : 'Extracting visual landmarks, texts, and geographic hints...')
                : (lang === 'zh' ? '正在连接 DeepSeek-Chat，依据大文旅要素融合生成完美推荐线路。这通常需要几秒钟...' : 'Querying DeepSeek V3/R1 core models to construct detailed plan stop recommendations...')}
            </p>
          </div>
        </div>
      )}

      {/* Error state */}
      {processStep === 'error' && errorText && (
        <div className="bg-rose-50 border border-rose-150 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-rose-700">
          <span className="text-sm">⚠️</span>
          <div className="space-y-1">
            <p className="font-bold">{lang === 'zh' ? '解析失败' : 'Failed to parse'}</p>
            <p className="opacity-90 font-medium leading-relaxed">{errorText}</p>
          </div>
        </div>
      )}

      {/* Structured results view */}
      {processStep === 'success' && parsedData && (
        <div className="bg-white border border-slate-200/60 rounded-xl p-4.5 space-y-4 shadow-sm animate-fade-in relative">
          <button 
            onClick={() => setProcessStep('idle')} 
            className="absolute top-3.5 right-3.5 p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all"
            title="Clear"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs bg-emerald-50/70 border border-emerald-100/50 px-2.5 py-1 rounded-lg w-fit">
              <Check className="w-3.5 h-3.5" />
              <span>{lang === 'zh' ? 'DeepSeek 线路计算完成！' : 'DeepSeek Route Plan Prepared!'}</span>
            </div>

            {parsedData.photoSummary && (
              <p className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-100 px-3 py-2 rounded-xl italic">
                “{parsedData.photoSummary}”
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs pt-1.5 border-t border-slate-100">
              <div className="space-y-1">
                <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  {lang === 'zh' ? '出发口岸' : 'Starting Port'}
                </span>
                <span className="font-bold text-slate-800 flex items-center gap-1.5 capitalize text-sm">
                  📍 {parsedData.departureCity ? parsedData.departureCity : (lang === 'zh' ? '北京 (默认)' : 'Beijing (Default)')}
                </span>
              </div>

              <div className="space-y-1">
                <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  {lang === 'zh' ? '推荐目的地顺序' : 'Recommended Path'}
                </span>
                <div className="flex flex-wrap items-center gap-1 pt-0.5">
                  {parsedData.destinations && parsedData.destinations.length > 0 ? (
                    parsedData.destinations.map((dest, idx) => (
                      <React.Fragment key={dest.cityId}>
                        <span className="font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-1 rounded-lg capitalize">
                          {dest.cityName || (lang === 'zh' ? dest.cityId : dest.cityId)} ({dest.days}{lang === 'zh' ? '天' : 'd'})
                        </span>
                        {idx < parsedData.destinations.length - 1 && (
                          <ArrowRight className="w-3 h-3 text-slate-450" />
                        )}
                      </React.Fragment>
                    ))
                  ) : (
                    <span className="text-slate-400 font-medium">{lang === 'zh' ? '无提取出的目的地' : 'No destination stops found'}</span>
                  )}
                </div>
              </div>
            </div>

            {parsedData.explanation && (
              <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-550 leading-relaxed font-medium">
                <strong className="block text-slate-750 mb-0.5 font-bold">{lang === 'zh' ? '🌱 DeepSeek 文旅大模型分析及建议：' : '🌱 DeepSeek Travel Recommendations:'}</strong>
                <p>{parsedData.explanation}</p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={executeImport}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-sans text-xs font-bold py-3 rounded-xl transition-all shadow-md shadow-indigo-650/10 cursor-pointer"
          >
            <Route className="w-4 h-4" />
            <span>{lang === 'zh' ? '⚡️ 一键把推荐的城市装入我的旅途中' : '⚡️ Populate Recommended Cities immediately'}</span>
          </button>
        </div>
      )}
    </div>
  );
}
