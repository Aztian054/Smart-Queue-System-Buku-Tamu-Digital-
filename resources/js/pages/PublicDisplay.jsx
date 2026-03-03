import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { publicApi } from '@/services/api';
import { speakQueueNumber } from '@/lib/utils';
import { Volume2, VolumeX, Users, Clock, RefreshCw, ArrowLeft, LogOut, AlertCircle, WifiOff } from 'lucide-react';

const PublicDisplay = () => {
  const navigate = useNavigate();
  const [displayData, setDisplayData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Use useRef for lastQueueId to avoid circular dependency in useCallback
  const lastQueueIdRef = useRef(null);
  const soundEnabledRef = useRef(soundEnabled);
  
  // Keep soundEnabledRef in sync
  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);
  
  // Check if admin is logged in
  const isAdmin = localStorage.getItem('admin_token');
  
  // Logout admin
  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    navigate('/admin/login');
  };

  // Listen for fullscreen changes - MUST be before any conditional returns
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Fetch display data - stable callback without lastQueueId dependency
  const fetchDisplayData = useCallback(async () => {
    try {
      setError(null);
      const response = await publicApi.getDisplayData();
      const data = response.data.data;
      
      // Check if there's a new called queue using ref
      if (data.current && data.current.queue_id !== lastQueueIdRef.current) {
        if (lastQueueIdRef.current !== null && soundEnabledRef.current) {
          // Play voice announcement
          speakQueueNumber(data.current.queue_number, data.current.counter_number, data.current.counter_name);
        }
        lastQueueIdRef.current = data.current.queue_id;
      }
      
      setDisplayData(data);
    } catch (error) {
      console.error('Failed to fetch display data:', error);
      setError('Gagal mengambil data dari server. Pastikan server berjalan.');
    } finally {
      setLoading(false);
    }
  }, []); // No dependencies that change during render

  // Polling every 5 seconds
  useEffect(() => {
    fetchDisplayData();
    const interval = setInterval(fetchDisplayData, 5000);
    return () => clearInterval(interval);
  }, [fetchDisplayData]);

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Toggle sound
  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
    if (!soundEnabled) {
      // Test sound when enabling
      speakQueueNumber('', '');
    }
  };

  // Get current time
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <RefreshCw className="w-12 h-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Memuat data...</p>
      </div>
    );
  }

  // Error state with UI
  if (error && !displayData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <WifiOff className="w-16 h-16 mx-auto mb-4 text-destructive" />
          <h2 className="text-2xl font-bold mb-2">Koneksi Gagal</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <button
            onClick={fetchDisplayData}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg mx-auto hover:bg-primary/90 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  const { current, next_waiting, stats } = displayData || {};

  return (
    <div 
      className="min-h-screen bg-background text-foreground p-6 md:p-10 relative"
      style={{
        backgroundImage: 'url(/assets/BG1.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/70" />
      
      {/* Content wrapper - relative z-10 to appear above overlay */}
      <div className="relative z-10">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">SMART QUEUE SYSTEM</h1>
            <p className="text-muted-foreground text-lg">Sistem Antrian Terintegrasi</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-2xl font-mono">
                {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </p>
              <p className="text-muted-foreground">
                {currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
        </header>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Queue - Main Display */}
        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-2xl p-8 min-h-[400px] flex flex-col justify-center items-center">
            <p className="text-xl text-muted-foreground mb-4 uppercase tracking-wider">
              Nomor Antrian Dipanggil
            </p>
            
            {current ? (
              <>
                {/* Queue Number */}
                <div className="queue-display">
                  <p className="text-[120px] md:text-[180px] font-bold text-primary leading-none">
                    {current.queue_number}
                  </p>
                </div>
                
                {/* Counter */}
                <div className="mt-6 bg-primary/20 rounded-xl px-12 py-6">
                  <p className="text-2xl text-muted-foreground mb-2">SILAKAN MENUJU</p>
                  <p className="text-5xl md:text-6xl font-bold text-primary">
                    LOKET {current.counter_number}
                  </p>
                </div>

                {/* Service Name */}
                <p className="mt-6 text-xl text-muted-foreground">
                  {current.service_name}
                </p>
              </>
            ) : (
              <div className="text-center">
                <p className="text-6xl md:text-8xl font-bold text-muted-foreground/30">
                  ---
                </p>
                <p className="text-2xl text-muted-foreground mt-6">
                  Menunggu panggilan
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Statistik Hari Ini
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-secondary rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-yellow-400">{stats?.waiting || 0}</p>
                <p className="text-sm text-muted-foreground">Menunggu</p>
              </div>
              <div className="bg-secondary rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-green-400">{stats?.done || 0}</p>
                <p className="text-sm text-muted-foreground">Selesai</p>
              </div>
              <div className="bg-secondary rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-blue-400">{stats?.called || 0}</p>
                <p className="text-sm text-muted-foreground">Dipanggil</p>
              </div>
              <div className="bg-secondary rounded-lg p-4 text-center">
                <p className="text-3xl font-bold">{stats?.total || 0}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </div>

          {/* Next Queues */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-4">Antrian Selanjutnya</h3>
            {next_waiting && next_waiting.length > 0 ? (
              <div className="space-y-3">
                {next_waiting.map((queue, index) => (
                  <div 
                    key={queue.queue_id}
                    className="flex items-center justify-between bg-secondary rounded-lg p-3"
                  >
                    <span className="text-2xl font-mono font-bold">{queue.queue_number}</span>
                    <span className="text-sm text-muted-foreground">{queue.service_name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                Tidak ada antrian
              </p>
            )}
          </div>

          {/* Controls */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-4">Kontrol</h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={toggleSound}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  soundEnabled ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                }`}
              >
                {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                {soundEnabled ? 'Suara Aktif' : 'Suara Mati'}
              </button>
              <button
                onClick={toggleFullscreen}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
              >
                {isFullscreen ? 'Keluar Fullscreen' : 'Fullscreen'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Running Text */}
      <div className="mt-6 bg-secondary rounded-lg py-3 px-4 overflow-hidden">
        <div className="animate-marquee whitespace-nowrap">
          <span className="text-muted-foreground mx-4">
            • Harap menunggu dengan tertib • Nomor antrian akan dipanggil secara berurutan • 
            Pastikan Anda berada di area tunggu • Terima kasih atas kesabaran Anda •
          </span>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-6 text-center text-muted-foreground text-sm">
        <p>Sistem Antrian Digital © 2026 • Powered by Smart Queue System</p>
      </footer>
      </div>

      {/* Admin Navigation - Bottom Left, Hidden in fullscreen */}
      {isAdmin && !isFullscreen && (
        <div className="fixed bottom-4 left-4 z-50 flex gap-2">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg hover:bg-secondary transition-colors shadow-lg"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Dashboard
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors shadow-lg"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      )}

      {/* Custom CSS for marquee */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default PublicDisplay;