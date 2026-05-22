import React, { useState, useEffect, useRef } from 'react';
import { TripPlan } from '../types';
import {
  Cloud,
  Check,
  Copy,
  RefreshCw,
  Power,
  Smartphone,
  Laptop,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Wifi,
  Users,
  MessageSquare,
  Plus,
  Trash2,
  History,
  CheckCircle2,
  User,
  Clock,
  RotateCcw,
  Monitor,
  CheckSquare
} from 'lucide-react';

interface PlanSyncManagerProps {
  currentPlan: TripPlan | null;
  onLoadSyncedPlan: (plan: TripPlan) => void;
  lang: 'zh' | 'en';
  t: any;
}

interface PeerDevice {
  name: string;
  lastSeen: string;
}

interface TravelNote {
  id: string;
  text: string;
  author: string;
  createdAt: string;
  color: string; // e.g. "yellow" | "blue" | "pink" | "green"
}

interface SyncSnapshot {
  id: string;
  timestamp: string;
  author: string;
  totalDays: number;
  totalBudget: number;
  tripPlan: TripPlan;
}

export default function PlanSyncManager({
  currentPlan,
  onLoadSyncedPlan,
  lang,
  t
}: PlanSyncManagerProps) {
  const [syncCode, setSyncCode] = useState<string>('');
  const [inputCode, setInputCode] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  
  // Real-time collaborative sync flags
  const [autoSyncEnabled, setAutoSyncEnabled] = useState<boolean>(false);
  const [livePollEnabled, setLivePollEnabled] = useState<boolean>(false);
  const [lastSyncedTime, setLastSyncedTime] = useState<string>('');
  const [lastSavedDigest, setLastSavedDigest] = useState<string>('');

  // Device context persistence
  const [deviceId, setDeviceId] = useState<string>('');
  const [deviceName, setDeviceName] = useState<string>('');
  const [isEditingDeviceName, setIsEditingDeviceName] = useState<boolean>(false);

  // Collaborative components states loaded from backend
  const [activePeers, setActivePeers] = useState<Record<string, PeerDevice>>({});
  const [notes, setNotes] = useState<TravelNote[]>([]);
  const [newNoteText, setNewNoteText] = useState<string>('');
  const [newNoteColor, setNewNoteColor] = useState<string>('yellow');
  const [historyTimeline, setHistoryTimeline] = useState<SyncSnapshot[]>([]);

  // Sub-tabs to organize the workspace beautifully on smaller layouts
  const [activeSubTab, setActiveSubTab] = useState<'status' | 'notes' | 'history'>('status');

  const pollIntervalRef = useRef<any>(null);

  // Auto-generate or read persistent unique device details
  useEffect(() => {
    let id = localStorage.getItem('trip_device_uuid');
    if (!id) {
      id = 'dev-' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('trip_device_uuid', id);
    }
    setDeviceId(id);

    let dName = localStorage.getItem('trip_device_name');
    if (!dName) {
      const ua = navigator.userAgent;
      const isMobile = /Mobi|Android/i.test(ua);
      const os = /Mac/i.test(ua) ? 'MacOS' : /Windows/i.test(ua) ? 'Win' : /Linux/i.test(ua) ? 'Linux' : /iPhone|iPad/i.test(ua) ? 'iOS' : 'Web';
      dName = `${isMobile ? (lang === 'zh' ? '移动端' : 'Mobile') : (lang === 'zh' ? '电脑端' : 'PC')} • ${os}`;
      localStorage.setItem('trip_device_name', dName);
    }
    setDeviceName(dName);
  }, [lang]);

  // Read saved sync configuration from localStorage on boot
  useEffect(() => {
    const savedCode = localStorage.getItem('trip_ai_sync_code');
    if (savedCode) {
      setSyncCode(savedCode.toUpperCase());
    }
    const savedAutoSync = localStorage.getItem('trip_ai_auto_sync') === 'true';
    setAutoSyncEnabled(savedAutoSync);
    const savedLivePoll = localStorage.getItem('trip_ai_live_poll') === 'true';
    setLivePollEnabled(savedLivePoll);
  }, []);

  // Update localStorage when sync state changes
  useEffect(() => {
    if (syncCode) {
      localStorage.setItem('trip_ai_sync_code', syncCode);
    } else {
      localStorage.removeItem('trip_ai_sync_code');
    }
  }, [syncCode]);

  useEffect(() => {
    localStorage.setItem('trip_ai_auto_sync', String(autoSyncEnabled));
  }, [autoSyncEnabled]);

  useEffect(() => {
    localStorage.setItem('trip_ai_live_poll', String(livePollEnabled));
  }, [livePollEnabled]);

  // Rename current device session
  const saveDeviceName = (newName: string) => {
    const cleanName = newName.trim();
    if (cleanName) {
      setDeviceName(cleanName);
      localStorage.setItem('trip_device_name', cleanName);
    }
    setIsEditingDeviceName(false);
    // Push the current presence change to cloud if linked
    if (syncCode) {
      handleForcePoll();
    }
  };

  // Handle plan hashing/digest to avoid posting identical plans repeatedly
  const getPlanDigest = (plan: TripPlan | null): string => {
    if (!plan) return '';
    return JSON.stringify({
      id: plan.id,
      days: plan.totalDays,
      budget: plan.totalBudget,
      destinationsCount: plan.selectedDestinations.length,
      cityPlansCount: plan.cityPlans.length,
      lastPoiId: plan.cityPlans?.[0]?.days?.[0]?.pois?.[0]?.id || ''
    });
  };

  // Auto-Sync Debouncer
  useEffect(() => {
    if (!autoSyncEnabled || !syncCode || !currentPlan) return;
    
    const currentDigest = getPlanDigest(currentPlan);
    if (currentDigest === lastSavedDigest) return;

    const timer = setTimeout(() => {
      handleAutoUpdate(currentPlan, currentDigest);
    }, 2500);

    return () => clearTimeout(timer);
  }, [currentPlan, syncCode, autoSyncEnabled]);

  // Real-time live poll fetcher
  useEffect(() => {
    if (livePollEnabled && syncCode) {
      // Trigger instant poll
      handleForcePoll();
      
      pollIntervalRef.current = setInterval(() => {
        handlePullUpdateQuiet();
      }, 7000);
    } else {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [livePollEnabled, syncCode]);

  // Silent check updates to facilitate collaborative real-time rendering
  const handlePullUpdateQuiet = async () => {
    if (!syncCode) return;
    try {
      const url = `/api/sync/load/${syncCode}?deviceId=${encodeURIComponent(deviceId)}&deviceName=${encodeURIComponent(deviceName)}`;
      const res = await fetch(url);
      if (!res.ok) return;
      const data = await res.json();
      
      if (data.success) {
        // Core states loading
        setActivePeers(data.peers || {});
        setNotes(data.notes || []);
        setHistoryTimeline(data.history || []);

        if (data.tripPlan) {
          const potentialNewPlan: TripPlan = data.tripPlan;
          const currentLocalDigest = getPlanDigest(currentPlan);
          const remoteDigest = getPlanDigest(potentialNewPlan);
          
          if (remoteDigest !== currentLocalDigest) {
            onLoadSyncedPlan(potentialNewPlan);
            setLastSavedDigest(remoteDigest);
            setLastSyncedTime(new Date().toLocaleTimeString());
          }
        }
      }
    } catch (e) {
      // quiet fail on background polling
    }
  };

  // Forced active poll to sync states instantly
  const handleForcePoll = async () => {
    if (!syncCode) return;
    setIsDownloading(true);
    try {
      const url = `/api/sync/load/${syncCode}?deviceId=${encodeURIComponent(deviceId)}&deviceName=${encodeURIComponent(deviceName)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok && data.success) {
        setActivePeers(data.peers || {});
        setNotes(data.notes || []);
        setHistoryTimeline(data.history || []);
        
        if (data.tripPlan) {
          onLoadSyncedPlan(data.tripPlan);
          setLastSavedDigest(getPlanDigest(data.tripPlan));
          setLastSyncedTime(new Date().toLocaleTimeString());
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsDownloading(false);
    }
  };

  const showMessage = (type: 'success' | 'error' | 'info', text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => {
      setStatusMessage(prev => prev?.text === text ? null : prev);
    }, 5000);
  };

  // Upload plan and yield a new 6-char sync code
  const handleGenerateSyncCode = async () => {
    if (!currentPlan) {
      showMessage('error', lang === 'zh' ? '请先在行程生成器中规划部分城市！' : 'Please plan some cities first.');
      return;
    }

    setIsUploading(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/sync/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripPlan: currentPlan,
          device: { id: deviceId, name: deviceName }
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Server rejected synchronization request');
      }

      setSyncCode(data.code.toUpperCase());
      const digest = getPlanDigest(currentPlan);
      setLastSavedDigest(digest);
      setLastSyncedTime(new Date().toLocaleTimeString());
      setActivePeers(data.peers || {});
      setNotes(data.notes || []);
      setHistoryTimeline(data.history || []);
      
      showMessage(
        'success',
        lang === 'zh'
          ? `🎉 联机云同步加入成功！动态短码: ${data.code}。您可在手机上输入此代码，实时共享编辑！`
          : `🎉 Live cloud sync initialized! Code: ${data.code}. Enter this on other devices to synergize!`
      );
    } catch (err: any) {
      showMessage('error', lang === 'zh' ? `连接失败: ${err.message}` : `Connection failed: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle auto modifications push back to the same cloud code
  const handleAutoUpdate = async (plan: TripPlan, digest: string) => {
    try {
      const res = await fetch(`/api/sync/update/${syncCode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripPlan: plan,
          device: { id: deviceId, name: deviceName }
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setLastSavedDigest(digest);
        setLastSyncedTime(new Date().toLocaleTimeString());
        setHistoryTimeline(data.history || []);
        setActivePeers(data.peers || {});
      }
    } catch (e) {
      console.warn('Auto sync fail-over active: ', e);
    }
  };

  // Explicit save action
  const handleForceSave = async () => {
    if (!syncCode || !currentPlan) return;
    setIsUploading(true);
    try {
      const digest = getPlanDigest(currentPlan);
      const res = await fetch(`/api/sync/update/${syncCode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripPlan: currentPlan,
          device: { id: deviceId, name: deviceName }
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Sync write failed');
      }
      setLastSavedDigest(digest);
      setLastSyncedTime(new Date().toLocaleTimeString());
      setHistoryTimeline(data.history || []);
      setActivePeers(data.peers || {});
      showMessage('success', lang === 'zh' ? '⭐ 行程方案及协同状态已强制覆盖保存至云端！' : '⭐ Plan successfully overwritten and saved to cloud!');
    } catch (err: any) {
      showMessage('error', err.message);
    } finally {
      setIsUploading(false);
    }
  };

  // Add a shared memo note to the whiteboard grid
  const handleAddTravelNote = async () => {
    const text = newNoteText.trim();
    if (!text) return;

    const newNote: TravelNote = {
      id: `note-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      text,
      author: deviceName,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      color: newNoteColor
    };

    const updatedNotes = [newNote, ...notes];
    setNewNoteText('');

    try {
      const res = await fetch(`/api/sync/update/${syncCode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes: updatedNotes,
          device: { id: deviceId, name: deviceName }
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setNotes(data.notes || updatedNotes);
        setActivePeers(data.peers || {});
      }
    } catch (e) {
      // Offline fallback state update
      setNotes(updatedNotes);
    }
  };

  // Delete/Resolve a travel Note
  const handleDeleteNote = async (noteIdToRemove: string) => {
    const updatedNotes = notes.filter(n => n.id !== noteIdToRemove);
    try {
      const res = await fetch(`/api/sync/update/${syncCode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes: updatedNotes,
          device: { id: deviceId, name: deviceName }
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setNotes(data.notes || updatedNotes);
        setActivePeers(data.peers || {});
      }
    } catch (e) {
      setNotes(updatedNotes);
    }
  };

  // Restore/Rollback to a historic checkpoint
  const handleRollbackToSnapshot = async (snap: SyncSnapshot) => {
    if (!snap || !snap.tripPlan) return;
    
    const confirmMsg = lang === 'zh' 
      ? `确定要将当前主行程回滚恢复到由【${snap.author}】在 ${new Date(snap.timestamp).toLocaleTimeString()} 保存的版本吗？`
      : `Are you sure you want to rollback the itinerary to version saved by [${snap.author}] at ${new Date(snap.timestamp).toLocaleTimeString()}?`;

    if (window.confirm(confirmMsg)) {
      onLoadSyncedPlan(snap.tripPlan);
      // Immediately push this restored plan to cloud as the main active layout
      setIsUploading(true);
      try {
        const res = await fetch(`/api/sync/update/${syncCode}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tripPlan: snap.tripPlan,
            device: { id: deviceId, name: `${deviceName} (🔄 Rollback)` }
          })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setLastSavedDigest(getPlanDigest(snap.tripPlan));
          setHistoryTimeline(data.history || []);
          setActivePeers(data.peers || {});
          showMessage('success', lang === 'zh' ? '✅ 时间舱穿越成功！已成功回退覆盖联机主行程！' : '✅ Time Capsule restored! Rollback active across all clients.');
        }
      } catch (err: any) {
        showMessage('error', err.message);
      } finally {
        setIsUploading(false);
      }
    }
  };

  // Pull down updates explicitly
  const handleLoadPlanByCode = async (codeToLoad?: string) => {
    const targetCode = (codeToLoad || inputCode).trim().toUpperCase();
    if (targetCode.length !== 6) {
      showMessage('error', lang === 'zh' ? '请输入完整的 6 位联机同步码。' : 'Please input a complete 6-character sync code.');
      return;
    }

    setIsDownloading(true);
    setStatusMessage(null);
    try {
      const url = `/api/sync/load/${targetCode}?deviceId=${encodeURIComponent(deviceId)}&deviceName=${encodeURIComponent(deviceName)}`;
      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok || !data.success || !data.tripPlan) {
        throw new Error(data.error || 'Failed to download travel plan.');
      }

      const plan: TripPlan = data.tripPlan;
      onLoadSyncedPlan(plan);
      setSyncCode(targetCode);
      const digest = getPlanDigest(plan);
      setLastSavedDigest(digest);
      setLastSyncedTime(new Date().toLocaleTimeString());
      setNotes(data.notes || []);
      setActivePeers(data.peers || {});
      setHistoryTimeline(data.history || []);

      showMessage(
        'success',
        lang === 'zh'
          ? `🌍 成功提取! [${targetCode}] 主联机行程已成功加载！现在可进行团队协作。`
          : `🌍 Success! Travel plan [${targetCode}] downloaded. Multi-device sync active.`
      );
      setInputCode('');
    } catch (err: any) {
      showMessage('error', err.message);
    } finally {
      setIsDownloading(false);
    }
  };

  // Disconnect active Sync link
  const handleDisconnectSync = () => {
    if (confirm(lang === 'zh' ? '退出联机将回归离线本地缓存，确定断开连接吗？' : 'Stop sync and return to offline local mode?')) {
      setSyncCode('');
      setAutoSyncEnabled(false);
      setLivePollEnabled(false);
      setLastSavedDigest('');
      setLastSyncedTime('');
      setNotes([]);
      setActivePeers({});
      setHistoryTimeline([]);
      showMessage('info', lang === 'zh' ? '已成功登出协同会话。' : 'Cloud sync disconnected.');
    }
  };

  const handleCopyCode = () => {
    if (!syncCode) return;
    navigator.clipboard.writeText(syncCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm font-sans space-y-5 relative overflow-hidden transition-all hover:shadow-md">
      {/* Dynamic light subtle neon glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/70 rounded-full blur-3xl -z-10 translate-x-12 -translate-y-12"></div>

      {/* Header section with Dynamic Status indicators */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-150 pb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-2xl ${syncCode ? 'bg-indigo-50 text-indigo-650' : 'bg-slate-100 text-slate-500'}`}>
            <Cloud className={`w-5.5 h-5.5 ${syncCode && autoSyncEnabled ? 'animate-bounce' : ''}`} />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-sm leading-snug">
              {lang === 'zh' ? '跨端联机云协同工作台' : 'Multi-Device Collaborative Studio'}
            </h4>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
              {lang === 'zh' ? '接入 Google Cloud Firestore 实时联机' : 'Google Cloud Firestore Co-Presence'}
            </p>
          </div>
        </div>

        {/* Live Status Pill badge + edit device name */}
        <div className="flex items-center gap-2">
          {isEditingDeviceName ? (
            <div className="flex items-center gap-1.5 animate-fadeIn">
              <input
                type="text"
                defaultValue={deviceName}
                onBlur={(e) => saveDeviceName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveDeviceName(e.currentTarget.value);
                }}
                className="bg-slate-100 px-2 py-0.5 text-xs rounded border border-indigo-200 outline-none font-bold text-indigo-700"
                autoFocus
              />
              <span className="text-[10px] text-slate-400">Enter</span>
            </div>
          ) : (
            <button
              onClick={() => setIsEditingDeviceName(true)}
              className="text-[10px] bg-slate-50 text-slate-500 border border-slate-200 hover:border-indigo-400 px-2 py-1 rounded-md font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1"
              title={lang === 'zh' ? '重命名本设备标识' : 'Rename active device tag'}
            >
              <Monitor className="w-3 h-3 text-indigo-550 shrink-0" />
              <span className="max-w-[80px] truncate">{deviceName}</span>
              <span className="text-slate-300">| ✏️</span>
            </button>
          )}

          {syncCode ? (
            <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200/50 text-[10px] font-bold px-2.5 py-1 rounded-full animate-fadeIn select-none shadow-sm shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{lang === 'zh' ? '联机云同步' : 'SYNCED'}</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 bg-slate-50 text-slate-500 border border-slate-200 text-[10px] font-bold px-2.5 py-1 rounded-full select-none shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
              <span>{lang === 'zh' ? '离线本地' : 'OFFLINE'}</span>
            </span>
          )}
        </div>
      </div>

      {/* Connection state banner */}
      {statusMessage && (
        <div className={`p-3.5 rounded-2xl border text-xs flex gap-2.5 font-medium leading-relaxed items-start animate-fadeIn shadow-sm ${
          statusMessage.type === 'success' ? 'bg-emerald-50/70 text-emerald-800 border-emerald-200' : 
          statusMessage.type === 'error' ? 'bg-rose-50/70 text-rose-800 border-rose-200' : 
          'bg-slate-50 text-slate-800 border-slate-200'
        }`}>
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="flex-1 text-[11px] font-sans font-medium">{statusMessage.text}</p>
        </div>
      )}

      {/* VIEW 1: UNLINKED STATE */}
      {!syncCode ? (
        <div className="space-y-4 animate-fadeIn">
          <p className="text-xs text-slate-500 leading-relaxed font-normal">
            {lang === 'zh'
              ? '想要在多端（手机、平板、其他电脑）实时编写方案，或授权好友一同合并规划？点击生成同步码一键创建专属联机云端数据库，即可享受秒级多城市路线协作。'
              : 'Edit and manage travel schedules instantly with family and devices. Generate an active 6-digit sync code, cloud-authoring live routes without any visual loss.'}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-1">
            {/* Action A: Publish Plan and get a Code */}
            <div className="md:col-span-6">
              <button
                type="button"
                onClick={handleGenerateSyncCode}
                disabled={isUploading || !currentPlan}
                className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer ${
                  isUploading
                    ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                    : !currentPlan
                    ? 'bg-slate-50 text-slate-350 border border-slate-200/50 cursor-not-allowed'
                    : 'bg-indigo-650 hover:bg-indigo-700 text-white shadow-indigo-650/10 hover:shadow-indigo-650/20 active:scale-98'
                }`}
              >
                {isUploading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin"></div>
                    <span>{lang === 'zh' ? '正在架设云通道...' : 'Creating capsule...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{lang === 'zh' ? '创建并开启联机模式' : 'Create Collaborative Link'}</span>
                  </>
                )}
              </button>
            </div>

            {/* Pivot separator link */}
            <div className="md:col-span-1 flex items-center justify-center font-bold text-xs text-slate-300 py-1 md:py-0 select-none">
              {lang === 'zh' ? '或' : 'OR'}
            </div>

            {/* Action B: Download using Code */}
            <div className="md:col-span-5 flex gap-2">
              <input
                type="text"
                placeholder={lang === 'zh' ? '输入6位精简码...' : '6-digit code'}
                maxLength={6}
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                className="flex-1 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white text-center font-mono font-black text-sm rounded-xl tracking-widest uppercase outline-none transition-all placeholder:font-sans placeholder:tracking-normal placeholder:text-slate-400 placeholder:font-normal"
              />
              <button
                type="button"
                disabled={isDownloading || inputCode.trim().length !== 6}
                onClick={() => handleLoadPlanByCode()}
                className={`w-12 h-11 border rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                  inputCode.trim().length === 6 && !isDownloading
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:scale-105 shadow-sm active:scale-95'
                    : 'border-slate-200 bg-slate-50/50 text-slate-350 cursor-not-allowed'
                }`}
                title={lang === 'zh' ? '加入云端方案' : 'Join Link'}
              >
                {isDownloading ? (
                  <div className="w-4.5 h-4.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <ArrowRight className="w-4.5 h-4.5" />
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* VIEW 2: LINKED STATE */
        <div className="space-y-4 animate-fadeIn">
          {/* Main Sync Code Presentation */}
          <div className="bg-slate-50 border border-slate-200 p-4.5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 relative overflow-hidden">
            <div className="space-y-1 text-center md:text-left">
              <span className="text-[10px] text-slate-450 uppercase tracking-widest font-bold">
                {lang === 'zh' ? '协同方案代码' : 'COLLABORATION SYNC CODE'}
              </span>
              <div className="flex items-center justify-center md:justify-start gap-1 font-mono text-2xl font-extrabold text-slate-800 select-all tracking-wider">
                <span>{syncCode.slice(0, 3)}</span>
                <span className="text-indigo-400 font-light">-</span>
                <span>{syncCode.slice(3, 6)}</span>
              </div>
            </div>

            {/* Quick action buttons on Code banner */}
            <div className="flex gap-2 w-full md:w-auto">
              <button
                type="button"
                onClick={handleCopyCode}
                className={`flex-1 md:flex-initial text-xs font-bold px-3.5 py-2.5 rounded-xl border flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm ${
                  isCopied
                    ? 'bg-emerald-50 border-emerald-250 text-emerald-700'
                    : 'bg-white border-slate-200 text-slate-705 hover:bg-slate-50 active:scale-95'
                }`}
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>{lang === 'zh' ? '已复制' : 'Copied'}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>{lang === 'zh' ? '复制分享码' : 'Copy'}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                disabled={isDownloading}
                onClick={handleForcePoll}
                className="flex-1 md:flex-initial bg-white border border-slate-200 hover:bg-slate-50 text-slate-705 text-xs font-bold px-3.5 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer disabled:opacity-50"
                title={lang === 'zh' ? '拉取云端最新数据' : 'Pull latest'}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isDownloading ? 'animate-spin' : ''}`} />
                <span>{lang === 'zh' ? '拉取云数据' : 'Fetch'}</span>
              </button>
            </div>
          </div>

          {/* Connected Peers list wall (Figma Presence feel on Top) */}
          {Object.keys(activePeers).length > 0 && (
            <div className="bg-indigo-50/30 border border-indigo-100 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 animate-fadeIn">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-650" />
                <h5 className="text-[11px] font-bold text-slate-700">
                  {lang === 'zh'
                    ? `当前在线设备 (${Object.keys(activePeers).length})`
                    : `Active Devices Connected (${Object.keys(activePeers).length})`}
                </h5>
              </div>
              
              <div className="flex -space-x-1.5 overflow-hidden">
                {(Object.entries(activePeers) as [string, PeerDevice][]).map(([id, peer], idx) => {
                  const initial = (peer.name || 'E').charAt(0).toUpperCase();
                  const colors = ['bg-pink-500', 'bg-indigo-500', 'bg-emerald-500', 'bg-purple-500', 'bg-amber-500'];
                  const selectedColor = colors[idx % colors.length];
                  const isSelf = id === deviceId;
                  
                  return (
                    <div
                      key={id}
                      className="group relative select-none"
                      title={`${peer.name} ${isSelf ? ' (本设备)' : ''}`}
                    >
                      <div className={`w-7 h-7 rounded-full ${selectedColor} border-2 border-white text-[10px] font-extrabold text-white flex items-center justify-center shadow-sm`}>
                        {initial}
                      </div>
                      
                      {/* Interactive Cursor tooltip hover text */}
                      <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 -translate-y-1.5 bg-slate-900 text-white text-[9px] font-bold px-2 py-1 rounded shadow-lg opacity-0 transition-opacity group-hover:opacity-100 z-30 whitespace-nowrap">
                        {peer.name} {isSelf && (lang === 'zh' ? ' (你)' : ' (You)')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SUB-TAB NAVIGATOR */}
          <div className="flex border-b border-slate-150">
            <button
              onClick={() => setActiveSubTab('status')}
              className={`flex-1 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-1.5 ${
                activeSubTab === 'status'
                  ? 'border-indigo-600 text-indigo-700 bg-indigo-50/20'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <CheckSquare className="w-4.5 h-4.5" />
              <span>{lang === 'zh' ? '自动与轮询' : 'Configuration'}</span>
            </button>
            <button
              onClick={() => setActiveSubTab('notes')}
              className={`flex-1 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-1.5 relative ${
                activeSubTab === 'notes'
                  ? 'border-indigo-600 text-indigo-700 bg-indigo-50/20'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <MessageSquare className="w-4.5 h-4.5" />
              <span>{lang === 'zh' ? '同伴备忘录' : 'Sticky Notes'}</span>
              {notes.length > 0 && (
                <span className="absolute top-1 right-2 w-4 h-4 bg-rose-500 text-white text-[9px] rounded-full flex items-center justify-center font-extrabold scale-90 animate-bounce">
                  {notes.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveSubTab('history')}
              className={`flex-1 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-1.5 ${
                activeSubTab === 'history'
                  ? 'border-indigo-600 text-indigo-700 bg-indigo-50/20'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <History className="w-4.5 h-4.5" />
              <span>{lang === 'zh' ? '时间舱回滚' : 'Time Machine'}</span>
              {historyTimeline.length > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
              )}
            </button>
          </div>

          {/* SUB-TAB CONTENTS */}
          
          {/* TAB 1: STATUS & AUTO CONFIGURATION */}
          {activeSubTab === 'status' && (
            <div className="space-y-3.5 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Control A: Auto Save / Multi-device writing */}
                <div className="bg-slate-50/50 border border-slate-150 p-4 rounded-2xl flex flex-col justify-between space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h5 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                        <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{lang === 'zh' ? '变更实时同步' : 'Auto Push'}</span>
                      </h5>
                      <p className="text-[10px] text-slate-450 leading-relaxed font-normal">
                        {lang === 'zh' ? '行程改动 2.5 秒内自动保存推送至云' : 'Debounces alterations & uploads.'}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={autoSyncEnabled}
                        onChange={(e) => setAutoSyncEnabled(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-650"></div>
                    </label>
                  </div>
                </div>

                {/* Control B: Live Polling / Multi-device collaborative viewing */}
                <div className="bg-slate-50/50 border border-slate-150 p-4 rounded-2xl flex flex-col justify-between space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h5 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                        <Laptop className="w-3.5 h-3.5 text-sky-600" />
                        <span>{lang === 'zh' ? '联机静默轮询' : 'Quiet Poll updates'}</span>
                      </h5>
                      <p className="text-[10px] text-slate-450 leading-relaxed font-normal">
                        {lang === 'zh' ? '每 7 秒自动静默拉取并覆盖他端更改' : 'Fetches potential outside modifications.'}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={livePollEnabled}
                        onChange={(e) => setLivePollEnabled(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-650"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 여행 메모장 Sticky Paper board */}
          {activeSubTab === 'notes' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Note creator bar */}
              <div className="bg-slate-50 border border-slate-200/50 p-3.5 rounded-2xl flex flex-col sm:flex-row gap-2.5">
                <input
                  type="text"
                  placeholder={lang === 'zh' ? '输入出行备忘留言 (如：“小李，火车票已订好了吗？”)...' : 'Write a collaborative sticky comment...'}
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddTravelNote();
                  }}
                  className="flex-1 bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs outline-none"
                />
                
                <div className="flex items-center justify-between gap-3 shrink-0">
                  {/* Sticky style color picker */}
                  <div className="flex gap-1.5">
                    {['yellow', 'blue', 'pink', 'green'].map((color) => {
                      const bgMap: Record<string, string> = {
                        yellow: 'bg-amber-100 border-amber-300',
                        blue: 'bg-sky-100 border-sky-300',
                        pink: 'bg-rose-100 border-rose-300',
                        green: 'bg-emerald-100 border-emerald-300'
                      };
                      return (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setNewNoteColor(color)}
                          className={`w-5 h-5 rounded-full border cursor-pointer select-none transition-all ${bgMap[color]} ${
                            newNoteColor === color ? 'ring-2 ring-indigo-550 scale-110' : 'opacity-70'
                          }`}
                          title={color}
                        />
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={handleAddTravelNote}
                    disabled={!newNoteText.trim()}
                    className={`px-3 py-2 text-[11px] font-bold rounded-xl flex items-center gap-1 shadow-sm transition-all cursor-pointer ${
                      newNoteText.trim()
                        ? 'bg-indigo-650 text-white hover:bg-indigo-700 hover:scale-103 active:scale-97'
                        : 'bg-slate-100 text-slate-350 cursor-not-allowed'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{lang === 'zh' ? '添加留言' : 'Submit'}</span>
                  </button>
                </div>
              </div>

              {/* Notes wall container Grid */}
              {notes.length === 0 ? (
                <div className="text-center py-7 text-slate-400 border border-dashed border-slate-200 rounded-2xl">
                  <p className="text-xs font-medium">💭 {lang === 'zh' ? '多端协同备忘录为空，开始写下留言并给同伴提供出游建议吧！' : 'Sticky board empty. Write a note to other devices!'}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {notes.map((note) => {
                    const bgStyle = 
                      note.color === 'blue' ? 'bg-sky-50 border-sky-150 text-sky-900 shadow-sky-100/50' :
                      note.color === 'pink' ? 'bg-rose-50 border-rose-150 text-rose-900 shadow-rose-100/50' :
                      note.color === 'green' ? 'bg-emerald-50 border-emerald-150 text-emerald-900 shadow-emerald-100/50' :
                      'bg-amber-50 border-amber-150 text-amber-900 shadow-amber-100/50';

                    return (
                      <div
                        key={note.id}
                        className={`p-4 border rounded-2xl relative group transition-all hover:-translate-y-0.5 hover:shadow-md flex flex-col justify-between min-h-[90px] ${bgStyle}`}
                      >
                        {/* Note texts */}
                        <p className="text-xs font-medium leading-relaxed font-sans pr-4 select-text">
                          {note.text}
                        </p>

                        <div className="flex items-center justify-between text-[10px] mt-4 pt-1.5 border-t border-slate-900/5 text-slate-500 font-bold">
                          <span className="truncate max-w-[100px] flex items-center gap-1 text-slate-600">
                            <User className="w-3 h-3 text-indigo-500 shrink-0" />
                            <span>{note.author}</span>
                          </span>
                          
                          <div className="flex items-center gap-1.5">
                            <span>{note.createdAt}</span>
                            <button
                              type="button"
                              onClick={() => handleDeleteNote(note.id)}
                              className="text-rose-500 hover:text-rose-700 opacity-60 hover:opacity-100 p-0.5 cursor-pointer rounded hover:bg-rose-100 transition-all ml-1.5"
                              title={lang === 'zh' ? '解决/删除留言' : 'Resolve note'}
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: TIMELINE snap rollbacks */}
          {activeSubTab === 'history' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>{lang === 'zh' ? '自动增量历史版本快照 (最多保留5个版次)' : 'Incremental Itinerary Snapshots (Max rolling 5)'}</span>
              </div>

              {historyTimeline.length === 0 ? (
                <div className="bg-slate-50 border border-slate-150 rounded-2xl p-6 text-center text-slate-400">
                  <p className="text-xs">🕒 {lang === 'zh' ? '暂无备份快照。当任何设备改动主路线行程时，云端会自动归档旧快照。' : 'No snapshots recorded. Editing dynamic routes generates rollback checkpoints automatically.'}</p>
                </div>
              ) : (
                <div className="relative pl-4 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-150 select-none">
                  {historyTimeline.map((snap) => {
                    return (
                      <div key={snap.id} className="relative group flex items-start gap-3.5">
                        {/* Timeline marker node dot */}
                        <div className="absolute left-[2.5px] -translate-x-[50%] w-2 h-2 rounded-full bg-indigo-500 border-2 border-white ring-4 ring-indigo-50 group-hover:bg-indigo-650 group-hover:scale-110 z-10"></div>
                        
                        {/* Snapshot card details */}
                        <div className="flex-1 bg-slate-50 border border-slate-150 p-4.5 rounded-2xl hover:bg-slate-100/60 transition-all flex flex-col sm:flex-row items-center justify-between gap-4.5">
                          <div className="space-y-1.5 text-center sm:text-left">
                            <div className="flex items-center justify-center sm:justify-start gap-1.5">
                              <span className="text-xs font-extrabold text-slate-800">
                                {snap.author}
                              </span>
                              <span className="text-[10px] bg-slate-205 text-slate-505 px-1.5 py-0.5 rounded font-bold">
                                {new Date(snap.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                              </span>
                            </div>
                            
                            <p className="text-[10px] text-slate-450 leading-normal font-semibold">
                              {lang === 'zh' 
                                ? `📊 跨城规格: ${snap.tripPlan.cityPlans?.length || 0}城市 • 日历长度: ${snap.totalDays}天 • 预估预算: $${snap.totalBudget} ${snap.tripPlan.cityPlans?.[0]?.cityNameEn ? 'USD' : 'CNY'}`
                                : `📊 Grid: ${snap.tripPlan.cityPlans?.length || 0} cities • ${snap.totalDays} days • Budget: $${snap.totalBudget}`}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRollbackToSnapshot(snap)}
                            className="w-full sm:w-auto bg-white border border-slate-250 hover:border-indigo-500 hover:bg-indigo-50 text-slate-705 hover:text-indigo-750 font-bold text-[10px] px-3.5 py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
                          >
                            <RotateCcw className="w-3 h-3 shrink-0" />
                            <span>{lang === 'zh' ? '回滚恢复' : 'Rollback'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Sync Stats Info & Decouple Trigger */}
          <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-450 pt-2 border-t border-slate-150 font-medium">
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1 text-[10px] text-slate-400 select-none">
                <Wifi className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>
                  {lastSyncedTime
                    ? (lang === 'zh' ? `最后同步时间: ${lastSyncedTime}` : `Last synced: ${lastSyncedTime}`)
                    : (lang === 'zh' ? '设备已准备就绪' : 'Collaborators ready')}
                </span>
              </span>
            </div>
            
            <div className="flex gap-4 mt-2.5 sm:mt-0">
              <button
                type="button"
                onClick={handleForceSave}
                className="text-indigo-650 hover:text-indigo-850 font-extrabold hover:underline cursor-pointer flex items-center gap-1 h-fit"
              >
                <span>💾</span>
                <span>{lang === 'zh' ? '强制保存并覆盖' : 'Force Overwrite'}</span>
              </button>

              <button
                type="button"
                onClick={handleDisconnectSync}
                className="text-rose-500 hover:text-rose-700 font-extrabold hover:underline flex items-center gap-1 cursor-pointer h-fit"
              >
                <Power className="w-3 h-3" />
                <span>{lang === 'zh' ? '断开联机模式' : 'Disconnect'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
