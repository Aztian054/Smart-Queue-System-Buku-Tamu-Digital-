import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Label } from '@/components/ui';
import { 
  LayoutDashboard, FileText, Settings, LogOut,
  RefreshCw, Loader2, Plus, Pencil, Trash2, X, Check,
  Building2, Hash, Calendar
} from 'lucide-react';

const ServiceManagement = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [services, setServices] = useState([]);
  const [counters, setCounters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showCounterModal, setShowCounterModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [editingCounter, setEditingCounter] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [serviceForm, setServiceForm] = useState({
    name: '',
    prefix: '',
    description: '',
    active: true,
  });

  const [counterForm, setCounterForm] = useState({
    name: '',
    number: '',
    service_id: '',
    active: true,
  });

  useEffect(() => {
    const userData = localStorage.getItem('admin_user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [servicesRes, countersRes] = await Promise.all([
        adminApi.getServices(),
        adminApi.getCounters(),
      ]);
      setServices(servicesRes.data.data || []);
      setCounters(countersRes.data.data || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
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

  // Service CRUD
  const openServiceModal = (service = null) => {
    if (service) {
      setEditingService(service);
      setServiceForm({
        name: service.name,
        prefix: service.prefix,
        description: service.description || '',
        active: service.active,
      });
    } else {
      setEditingService(null);
      setServiceForm({ name: '', prefix: '', description: '', active: true });
    }
    setShowServiceModal(true);
  };

  const handleSaveService = async () => {
    setSubmitLoading(true);
    try {
      if (editingService) {
        await adminApi.updateService(editingService.id, serviceForm);
      } else {
        await adminApi.createService(serviceForm);
      }
      setShowServiceModal(false);
      fetchData();
    } catch (error) {
      console.error('Failed to save service:', error);
      alert('Gagal menyimpan layanan');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteService = async (id) => {
    if (!confirm('Yakin ingin menghapus layanan ini?')) return;
    try {
      await adminApi.deleteService(id);
      fetchData();
    } catch (error) {
      console.error('Failed to delete service:', error);
      alert('Gagal menghapus layanan');
    }
  };

  // Counter CRUD
  const openCounterModal = (counter = null) => {
    if (counter) {
      setEditingCounter(counter);
      setCounterForm({
        name: counter.name,
        number: counter.number,
        service_id: counter.service_id || '',
        active: counter.active,
      });
    } else {
      setEditingCounter(null);
      setCounterForm({ name: '', number: '', service_id: '', active: true });
    }
    setShowCounterModal(true);
  };

  const handleSaveCounter = async () => {
    setSubmitLoading(true);
    try {
      if (editingCounter) {
        await adminApi.updateCounter(editingCounter.id, counterForm);
      } else {
        await adminApi.createCounter(counterForm);
      }
      setShowCounterModal(false);
      fetchData();
    } catch (error) {
      console.error('Failed to save counter:', error);
      alert('Gagal menyimpan loket');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteCounter = async (id) => {
    if (!confirm('Yakin ingin menghapus loket ini?')) return;
    try {
      await adminApi.deleteCounter(id);
      fetchData();
    } catch (error) {
      console.error('Failed to delete counter:', error);
      alert('Gagal menghapus loket');
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
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-secondary transition-colors"
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
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg bg-primary text-primary-foreground"
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
            <h1 className="text-2xl font-bold">Kelola Layanan</h1>
            <p className="text-muted-foreground">Kelola layanan dan loket</p>
          </div>
          <Button variant="outline" onClick={fetchData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Services Section */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Daftar Layanan</h2>
                <Button onClick={() => openServiceModal()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Layanan
                </Button>
              </div>

              <div className="space-y-3">
                {services.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center text-muted-foreground">
                      Belum ada layanan
                    </CardContent>
                  </Card>
                ) : (
                  services.map((service) => (
                    <Card key={service.id} className={!service.active ? 'opacity-60' : ''}>
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                            <span className="font-mono font-bold text-primary">{service.prefix}</span>
                          </div>
                          <div>
                            <p className="font-semibold">{service.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {service.description || 'Tidak ada deskripsi'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => openServiceModal(service)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-destructive"
                            onClick={() => handleDeleteService(service.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>

            {/* Counters Section */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Daftar Loket</h2>
                <Button onClick={() => openCounterModal()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Loket
                </Button>
              </div>

              <div className="space-y-3">
                {counters.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center text-muted-foreground">
                      Belum ada loket
                    </CardContent>
                  </Card>
                ) : (
                  counters.map((counter) => (
                    <Card key={counter.id} className={!counter.active ? 'opacity-60' : ''}>
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center">
                            <span className="font-bold text-lg">{counter.number}</span>
                          </div>
                          <div>
                            <p className="font-semibold">{counter.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {counter.service?.name || 'Semua Layanan'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => openCounterModal(counter)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-destructive"
                            onClick={() => handleDeleteCounter(counter.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Service Modal */}
      {showServiceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>{editingService ? 'Edit Layanan' : 'Tambah Layanan'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Nama Layanan</Label>
                <Input
                  value={serviceForm.name}
                  onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                  placeholder="contoh: Laboratorium"
                />
              </div>
              <div className="space-y-2">
                <Label>Prefix (Huruf Kode)</Label>
                <Input
                  value={serviceForm.prefix}
                  onChange={(e) => setServiceForm({ ...serviceForm, prefix: e.target.value.toUpperCase() })}
                  placeholder="contoh: LAB"
                  maxLength={5}
                />
              </div>
              <div className="space-y-2">
                <Label>Deskripsi</Label>
                <Input
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                  placeholder="Deskripsi layanan (opsional)"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={serviceForm.active}
                  onChange={(e) => setServiceForm({ ...serviceForm, active: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="active">Aktif</Label>
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowServiceModal(false)}>
                  <X className="w-4 h-4 mr-2" />
                  Batal
                </Button>
                <Button className="flex-1" onClick={handleSaveService} disabled={submitLoading}>
                  {submitLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Simpan
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Counter Modal */}
      {showCounterModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>{editingCounter ? 'Edit Loket' : 'Tambah Loket'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Nama Loket</Label>
                <Input
                  value={counterForm.name}
                  onChange={(e) => setCounterForm({ ...counterForm, name: e.target.value })}
                  placeholder="contoh: Loket Pendaftaran"
                />
              </div>
              <div className="space-y-2">
                <Label>Nomor Loket</Label>
                <Input
                  type="number"
                  value={counterForm.number}
                  onChange={(e) => setCounterForm({ ...counterForm, number: e.target.value })}
                  placeholder="contoh: 1"
                />
              </div>
              <div className="space-y-2">
                <Label>Layanan (Opsional)</Label>
                <select
                  value={counterForm.service_id}
                  onChange={(e) => setCounterForm({ ...counterForm, service_id: e.target.value })}
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
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="counterActive"
                  checked={counterForm.active}
                  onChange={(e) => setCounterForm({ ...counterForm, active: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="counterActive">Aktif</Label>
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowCounterModal(false)}>
                  <X className="w-4 h-4 mr-2" />
                  Batal
                </Button>
                <Button className="flex-1" onClick={handleSaveCounter} disabled={submitLoading}>
                  {submitLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Simpan
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ServiceManagement;