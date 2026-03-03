import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '@/services/api';
import { Card, CardContent, Button, Badge } from '@/components/ui';
import { 
  LayoutDashboard, FileText, Settings, LogOut,
  RefreshCw, Loader2, Phone, Building2, User,
  Calendar, Download, Search, Eye, Camera, IdCard, X, MapPin,
  FileSpreadsheet
} from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const QueueHistory = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [queues, setQueues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState([]);
  const [photoModal, setPhotoModal] = useState({ show: false, photo: null, title: '' });
  
  // Filters
  const [filter, setFilter] = useState({
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    service_id: '',
    status: '',
    search: '',
  });

  useEffect(() => {
    const userData = localStorage.getItem('admin_user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchServices();
    fetchHistory();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await adminApi.getServices();
      setServices(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch services:', error);
    }
  };

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter.start_date) params.append('start_date', filter.start_date);
      if (filter.end_date) params.append('end_date', filter.end_date);
      if (filter.service_id) params.append('service_id', filter.service_id);
      if (filter.status) params.append('status', filter.status);
      if (filter.search) params.append('search', filter.search);

      const response = await adminApi.getQueueHistory(params.toString());
      setQueues(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch history:', error);
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

  const getStatusText = (status) => {
    switch (status) {
      case 'waiting': return 'Menunggu';
      case 'called': return 'Dipanggil';
      case 'done': return 'Selesai';
      case 'skipped': return 'Dilewati';
      default: return status;
    }
  };

  const exportToExcel = () => {
    if (queues.length === 0) return;

    const data = queues.map((q, i) => ({
      'No': i + 1,
      'Tanggal': q.queue_date,
      'Nomor Antrian': q.queue_number,
      'Kode Tiket': q.ticket_code,
      'Nama': q.visitor?.name || '-',
      'Instansi': q.visitor?.agency || '-',
      'Telepon': q.visitor?.phone || '-',
      'Layanan': q.service?.name || '-',
      'Status': getStatusText(q.status),
      'Loket': q.counter_number ? `Loket ${q.counter_number}` : '-',
      'Waktu Daftar': q.created_at,
      'Waktu Dipanggil': q.called_at || '-',
      'Waktu Selesai': q.finished_at || '-',
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Riwayat Antrian');
    
    // Auto-width columns
    const colWidths = Object.keys(data[0] || {}).map(key => ({
      wch: Math.max(key.length, ...data.map(row => String(row[key]).length)) + 2
    }));
    ws['!cols'] = colWidths;

    XLSX.writeFile(wb, `riwayat-antrian-${filter.start_date}-${filter.end_date}.xlsx`);
  };

  const exportToPDF = () => {
    if (queues.length === 0) return;

    const doc = new jsPDF('landscape');
    
    // Title
    doc.setFontSize(16);
    doc.text('Riwayat Antrian', 14, 15);
    doc.setFontSize(10);
    doc.text(`Periode: ${filter.start_date} s/d ${filter.end_date}`, 14, 22);
    
    // Table data
    const headers = [['No', 'Tanggal', 'No. Antrian', 'Kode Tiket', 'Nama', 'Instansi', 'Telepon', 'Layanan', 'Status', 'Loket', 'Waktu Daftar', 'Waktu Dipanggil', 'Waktu Selesai']];
    
    const rows = queues.map((q, i) => [
      i + 1,
      q.queue_date,
      q.queue_number,
      q.ticket_code,
      q.visitor?.name || '-',
      q.visitor?.agency || '-',
      q.visitor?.phone || '-',
      q.service?.name || '-',
      getStatusText(q.status),
      q.counter_number ? `Loket ${q.counter_number}` : '-',
      q.created_at,
      q.called_at || '-',
      q.finished_at || '-',
    ]);

    doc.autoTable({
      head: headers,
      body: rows,
      startY: 28,
      styles: { fontSize: 7, cellPadding: 1 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      columnStyles: {
        0: { cellWidth: 8 },
        1: { cellWidth: 20 },
        2: { cellWidth: 20 },
        3: { cellWidth: 22 },
        4: { cellWidth: 30 },
        5: { cellWidth: 30 },
        6: { cellWidth: 22 },
        7: { cellWidth: 25 },
        8: { cellWidth: 18 },
        9: { cellWidth: 15 },
        10: { cellWidth: 22 },
        11: { cellWidth: 22 },
        12: { cellWidth: 22 },
      },
    });

    doc.save(`riwayat-antrian-${filter.start_date}-${filter.end_date}.pdf`);
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
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg bg-primary text-primary-foreground"
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
            <h1 className="text-2xl font-bold">Riwayat Antrian</h1>
            <p className="text-muted-foreground">Lihat data antrian historis</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={fetchHistory}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button 
              onClick={exportToExcel} 
              disabled={queues.length === 0}
              className="bg-green-600 hover:bg-green-700"
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Export Excel
            </Button>
            <Button 
              onClick={exportToPDF} 
              disabled={queues.length === 0}
              className="bg-red-600 hover:bg-red-700"
            >
              <FileText className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Tanggal Mulai</label>
                <input
                  type="date"
                  value={filter.start_date}
                  onChange={(e) => setFilter({ ...filter, start_date: e.target.value })}
                  className="w-full bg-secondary border border-border rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Tanggal Akhir</label>
                <input
                  type="date"
                  value={filter.end_date}
                  onChange={(e) => setFilter({ ...filter, end_date: e.target.value })}
                  className="w-full bg-secondary border border-border rounded-md px-3 py-2"
                />
              </div>
              <div>
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
              <div>
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
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Cari</label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Nama/kode tiket..."
                    value={filter.search}
                    onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                    className="w-full bg-secondary border border-border rounded-md pl-10 pr-3 py-2"
                  />
                </div>
              </div>
              <div className="flex items-end">
                <Button onClick={fetchHistory} className="w-full">
                  Terapkan Filter
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{queues.length}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-400">{queues.filter(q => q.status === 'waiting').length}</p>
                <p className="text-sm text-muted-foreground">Menunggu</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-400">{queues.filter(q => q.status === 'called').length}</p>
                <p className="text-sm text-muted-foreground">Dipanggil</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-400">{queues.filter(q => q.status === 'done').length}</p>
                <p className="text-sm text-muted-foreground">Selesai</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-400">{queues.filter(q => q.status === 'skipped').length}</p>
                <p className="text-sm text-muted-foreground">Dilewati</p>
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
              <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
              <p className="text-muted-foreground">Tidak ada data riwayat untuk periode ini</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-secondary/50">
                      <th className="text-left py-3 px-4 text-sm font-medium">No. Antrian</th>
                      <th className="text-left py-3 px-4 text-sm font-medium">Tanggal</th>
                      <th className="text-left py-3 px-4 text-sm font-medium">Nama</th>
                      <th className="text-left py-3 px-4 text-sm font-medium">Instansi</th>
                      <th className="text-left py-3 px-4 text-sm font-medium">Layanan</th>
                      <th className="text-center py-3 px-4 text-sm font-medium">Status</th>
                      <th className="text-center py-3 px-4 text-sm font-medium">Loket</th>
                      <th className="text-center py-3 px-4 text-sm font-medium">Waktu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {queues.map((queue) => (
                      <tr key={queue.id} className="border-b border-border hover:bg-secondary/30">
                        <td className="py-3 px-4">
                          <span className="font-mono font-bold text-primary">{queue.queue_number}</span>
                        </td>
                        <td className="py-3 px-4 text-sm">{queue.queue_date}</td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium">{queue.visitor?.name}</p>
                            {queue.visitor?.phone && (
                              <p className="text-xs text-muted-foreground">{queue.visitor.phone}</p>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm">{queue.visitor?.agency || '-'}</td>
                        <td className="py-3 px-4 text-sm">{queue.service?.name}</td>
                        <td className="py-3 px-4 text-center">{getStatusBadge(queue.status)}</td>
                        <td className="py-3 px-4 text-center">
                          {queue.counter_number ? `Loket ${queue.counter_number}` : '-'}
                        </td>
                        <td className="py-3 px-4 text-center text-sm">
                          <div>
                            <p>Daftar: {queue.created_at}</p>
                            {queue.called_at && <p className="text-blue-400">Panggil: {queue.called_at}</p>}
                            {queue.finished_at && <p className="text-green-400">Selesai: {queue.finished_at}</p>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
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

export default QueueHistory;