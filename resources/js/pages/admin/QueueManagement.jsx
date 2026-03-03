import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '@/services/api';
import { Card, CardContent, Button, Select, Badge } from '@/components/ui';
import { speakQueueNumber } from '@/lib/utils';
import { 
  LayoutDashboard, FileText, Settings, LogOut,
  RefreshCw, Loader2, Phone, Building2, User,
  Play, Check, SkipBack, RotateCcw, MapPin, 
  Camera, IdCard, X, Eye, Calendar
} from 'lucide-react';

const QueueManagement = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [queues, setQueues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [filter, setFilter] = useState({ status: '', service_id: '' });
  const [services, setServices] = useState([]);
  const [counters, setCounters] = useState([]);
  const [selectedCounter, setSelectedCounter] = useState(1);
  const [photoModal, setPhotoModal] = useState({ show: false, photo: null, title: '' });

  useEffect(() => {
    const userData = localStorage.getItem('admin_user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchQueues();
    fetchServices();
    fetchCounters();
  }, [filter]);

  const fetchQueues = async () => {
    try {
      const params = {};
      if (filter.status) params.status = filter.status;
      if (filter.service_id) params.service_id = filter.service_id;
      
      const response = await adminApi.getQueues(params);
      setQueues(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch queues:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await adminApi.getServices();
      setServices(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch services:', error);
    }
  };

  const fetchCounters = async () => {
    try {
      const response = await adminApi.getCounters();
      setCounters(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch counters:', error);
    }
  };

  const handleCall = async (queueId) => {
    setActionLoading(queueId);
    try {
      const response = await adminApi.callQueue(queueId, selectedCounter);
      if (response.data.success) {
        const queue = queues.find(q => q.id === queueId);
        const counter = counters.find(c => c.number === selectedCounter);
        if (queue) {
          speakQueueNumber(queue.queue_number, selectedCounter, counter?.name);
        }
        fetchQueues();
      }
    } catch (error) {
      console.error('Failed to call queue:', error);
      alert('Gagal memanggil antrian');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDone = async (queueId) => {
    setActionLoading(queueId);
    try {
      const response = await adminApi.doneQueue(queueId);
      if (response.data.success) {
        fetchQueues();
      }
    } catch (error) {
      console.error('Failed to done queue:', error);
      alert('Gagal menyelesaikan antrian');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSkip = async (queueId) => {
    setActionLoading(queueId);
    try {
      const response = await adminApi.skipQueue(queueId);
      if (response.data.success) {
        fetchQueues();
      }
    } catch (error) {
      console.error('Failed to skip queue:', error);
      alert('Gagal melewatkan antrian');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRecall = async (queueId) => {
    setActionLoading(queueId);
    try {
      const response = await adminApi.recallQueue(queueId);
      if (response.data.success) {
        fetchQueues();
      }
    } catch (error) {
      console.error('Failed to recall queue:', error);
      alert('Gagal recall antrian');
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogout = async () => {
    try {
      await adminApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    navigate('/admin/login');
  };

  const openPhotoModal = (photo, title) => {
    setPhotoModal({ show: true, photo, title });
  };

  const closePhotoModal = () => {
    setPhotoModal({ show: false, photo: null, title: '' });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'waiting': return <Badge variant="waiting">Menunggu</Badge>;
      case 'called': return <Badge variant="called">Dipanggil</Badge>;
      case 'done': return <Badge variant="done">Selesai</Badge>;
      case 'skipped': return <Badge variant="skipped">Dilewati</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-card border-r border-border p-4 flex flex-col">
        {/* Logo Header */}
        <div className="mb-6">
          <div className="flex items-center justify-center gap-3 mb-2">
            <img src="/assets/logo1-kkp.png.png" alt="KKP" className="h-10 object-contain" />
            <img src="/assets/logo2-bppmhkp.png" alt="BPPMHKP" className="h-10 object-contain" />
          </div>
          <h1 className="text-lg font-bold text-center">Smart Queue</h1>
          <p className="text-xs text-muted-foreground text-center">Admin Panel</p>
        </div>

        <nav className="space-y-2 flex-1">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-secondary transition-colors"
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </button>
          <button
            onClick={() => navigate('/admin/queue')}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg bg-primary text-primary-foreground"
          >
            <FileText className="w-5 h-5" />
            Antrian
          </button>
          <button
            onClick={() => navigate('/admin/history')}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-secondary transition-colors"
          >
            <Calendar className="w-5 h-5" />
            Riwayat
          </button>
          <button
            onClick={() => navigate('/admin/services')}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-secondary transition-colors"
          >
            <Settings className="w-5 h-5" />
            Layanan
          </button>
        </nav>

        <div className="mt-auto">
          <div className="border-t border-border pt-4 mb-4">
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">Kelola Antrian</h1>
            <p className="text-muted-foreground">Kelola antrian hari ini</p>
          </div>
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Loket:</span>
              <select
                value={selectedCounter}
                onChange={(e) => setSelectedCounter(Number(e.target.value))}
                className="bg-secondary border border-border rounded-md px-3 py-1"
              >
                {counters.length > 0 ? (
                  counters.map(counter => (
                    <option key={counter.id} value={counter.number}>
                      Loket {counter.number}
                    </option>
                  ))
                ) : (
                  [1, 2, 3, 4, 5].map(n => (
                    <option key={n} value={n}>Loket {n}</option>
                  ))
                )}
              </select>
            </div>
            <Button variant="outline" onClick={fetchQueues}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-sm text-muted-foreground mb-1 block">Status</label>
                <select
                  value={filter.status}
                  onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                  className="w-full bg-secondary border border-border rounded-md px-3 py-2"
                >
                  <option value="">Semua</option>
                  <option value="waiting">Menunggu</option>
                  <option value="called">Dipanggil</option>
                  <option value="done">Selesai</option>
                  <option value="skipped">Dilewati</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="text-sm text-muted-foreground mb-1 block">Layanan</label>
                <select
                  value={filter.service_id}
                  onChange={(e) => setFilter({ ...filter, service_id: e.target.value })}
                  className="w-full bg-secondary border border-border rounded-md px-3 py-2"
                >
                  <option value="">Semua Layanan</option>
                  {services.map(service => (
                    <option key={service.id} value={service.id}>
                      {service.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Queue List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : queues.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
              <p className="text-muted-foreground">Tidak ada data antrian</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {queues.map((queue) => (
              <Card key={queue.id} className="overflow-hidden">
                <div className="flex flex-col lg:flex-row">
                  {/* Queue Number */}
                  <div className="bg-primary text-primary-foreground flex items-center justify-center px-6 py-4 lg:min-w-[120px]">
                    <span className="text-2xl font-bold">{queue.queue_number}</span>
                  </div>

                  {/* Queue Info */}
                  <CardContent className="flex-1 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Visitor Info */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="font-semibold">{queue.visitor?.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Building2 className="w-3 h-3" />
                          <span>{queue.visitor?.agency || '-'}</span>
                        </div>
                        {queue.visitor?.phone && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="w-3 h-3" />
                            <span>{queue.visitor.phone}</span>
                          </div>
                        )}
                        {queue.visitor?.alamat && (
                          <div className="flex items-start gap-2 text-sm text-muted-foreground">
                            <MapPin className="w-3 h-3 mt-0.5" />
                            <span className="line-clamp-2">{queue.visitor.alamat}</span>
                          </div>
                        )}
                      </div>

                      {/* Purpose & Service */}
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-muted-foreground">Keperluan</p>
                          <p className="text-sm">{queue.visitor?.purpose}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Layanan</p>
                          <p className="text-sm font-medium text-primary">{queue.service?.name}</p>
                        </div>
                        {queue.visitor?.location_lat && queue.visitor?.location_lng && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            <span className="font-mono">
                              {parseFloat(queue.visitor.location_lat).toFixed(4)}, {parseFloat(queue.visitor.location_lng).toFixed(4)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Photos & Status */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          {getStatusBadge(queue.status)}
                          {queue.counter_number && (
                            <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                              Loket {queue.counter_number}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {/* Photo Selfie */}
                          {queue.visitor?.photo ? (
                            <button
                              onClick={() => openPhotoModal(queue.visitor.photo, 'Foto Selfie')}
                              className="flex items-center gap-1 text-xs text-primary hover:underline"
                            >
                              <Camera className="w-3 h-3" />
                              Lihat Foto Selfie
                            </button>
                          ) : (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Camera className="w-3 h-3" />
                              Tidak ada foto
                            </span>
                          )}
                          
                          {/* Identity Photo */}
                          {queue.visitor?.identity_photo && (
                            <button
                              onClick={() => openPhotoModal(queue.visitor.identity_photo, 'Foto Tanda Pengenal')}
                              className="flex items-center gap-1 text-xs text-primary hover:underline"
                            >
                              <IdCard className="w-3 h-3" />
                              Lihat KTP
                            </button>
                          )}
                        </div>
                        
                        <p className="text-xs text-muted-foreground">
                          Daftar: {queue.created_at}
                        </p>
                      </div>
                    </div>
                  </CardContent>

                  {/* Actions */}
                  <div className="flex items-center gap-2 p-4 border-t lg:border-t-0 lg:border-l border-border">
                    {(queue.status === 'waiting' || queue.status === 'called') && (
                      <Button
                        onClick={() => handleCall(queue.id)}
                        disabled={actionLoading === queue.id}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {actionLoading === queue.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-1" />
                            Panggil
                          </>
                        )}
                      </Button>
                    )}
                    {queue.status === 'called' && (
                      <>
                        <Button
                          onClick={() => handleDone(queue.id)}
                          disabled={actionLoading === queue.id}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {actionLoading === queue.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Check className="w-4 h-4 mr-1" />
                              Selesai
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={() => handleSkip(queue.id)}
                          disabled={actionLoading === queue.id}
                          variant="warning"
                        >
                          <SkipBack className="w-4 h-4 mr-1" />
                          Lewati
                        </Button>
                      </>
                    )}
                    {queue.status === 'skipped' && (
                      <Button
                        onClick={() => handleRecall(queue.id)}
                        disabled={actionLoading === queue.id}
                        variant="outline"
                      >
                        {actionLoading === queue.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <RotateCcw className="w-4 h-4 mr-1" />
                            Recall
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Photo Modal */}
      {photoModal.show && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">{photoModal.title}</h3>
                <Button variant="outline" size="icon" onClick={closePhotoModal}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              {photoModal.photo ? (
                <img 
                  src={photoModal.photo} 
                  alt={photoModal.title}
                  className="w-full max-h-[70vh] object-contain rounded-lg"
                />
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  Tidak ada foto
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default QueueManagement;