import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '@/services/api';
import { Card, CardContent, Button } from '@/components/ui';
import { 
  Users, UserCheck, Clock, CheckCircle, 
  LayoutDashboard, FileText, Settings, LogOut,
  RefreshCw, Loader2, Calendar
} from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [serviceStats, setServiceStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('admin_user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await adminApi.getStats();
      setStats(response.data.data.total);
      setServiceStats(response.data.data.by_service);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
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

  const statCards = [
    { label: 'Total Hari Ini', key: 'total', color: 'text-blue-400', icon: Users },
    { label: 'Menunggu', key: 'waiting', color: 'text-yellow-400', icon: Clock },
    { label: 'Dipanggil', key: 'called', color: 'text-orange-400', icon: UserCheck },
    { label: 'Selesai', key: 'done', color: 'text-green-400', icon: CheckCircle },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

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
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg bg-primary text-primary-foreground"
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
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Statistik antrian hari ini</p>
          </div>
          <Button variant="outline" onClick={fetchStats}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.key}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className={`text-3xl font-bold ${stat.color}`}>
                        {stats?.[stat.key] || 0}
                      </p>
                    </div>
                    <Icon className={`w-10 h-10 ${stat.color} opacity-50`} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Service Stats */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">Statistik per Layanan</h2>
            {serviceStats && serviceStats.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4">Layanan</th>
                      <th className="text-center py-3 px-4">Menunggu</th>
                      <th className="text-center py-3 px-4">Dipanggil</th>
                      <th className="text-center py-3 px-4">Selesai</th>
                    </tr>
                  </thead>
                  <tbody>
                    {serviceStats.map((service) => (
                      <tr key={service.id} className="border-b border-border">
                        <td className="py-3 px-4">
                          <span className="font-mono text-primary mr-2">{service.prefix}</span>
                          {service.name}
                        </td>
                        <td className="text-center py-3 px-4">
                          <span className="text-yellow-400 font-semibold">{service.waiting}</span>
                        </td>
                        <td className="text-center py-3 px-4">
                          <span className="text-blue-400 font-semibold">{service.called}</span>
                        </td>
                        <td className="text-center py-3 px-4">
                          <span className="text-green-400 font-semibold">{service.done}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Tidak ada data layanan
              </p>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => navigate('/admin/queue')}>
            <CardContent className="p-6 text-center">
              <FileText className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="font-semibold">Kelola Antrian</h3>
              <p className="text-sm text-muted-foreground">Panggil, selesaikan, atau lewati antrian</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => navigate('/display')}>
            <CardContent className="p-6 text-center">
              <LayoutDashboard className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="font-semibold">Lihat Display</h3>
              <p className="text-sm text-muted-foreground">Buka tampilan display publik</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;