import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { publicApi } from '@/services/api';
import { Button, Card, CardContent } from '@/components/ui';
import { Ticket, Clock, User, Building2, FileText, Download, Home, Loader2, MapPin, Phone, IdCard, Settings } from 'lucide-react';

const TicketDisplay = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const response = await publicApi.getTicket(id);
        setTicket(response.data.data);
      } catch (err) {
        console.error('Failed to fetch ticket:', err);
        setError('Tiket tidak ditemukan');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTicket();
    }
  }, [id]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'waiting': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'called': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'done': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'skipped': return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Memuat tiket...</p>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-8">
          <div className="text-destructive mb-4">
            <Ticket className="w-16 h-16 mx-auto opacity-50" />
          </div>
          <h2 className="text-xl font-bold mb-2">Tiket Tidak Ditemukan</h2>
          <p className="text-muted-foreground mb-6">{error || 'Tiket yang Anda cari tidak tersedia'}</p>
          <Button onClick={() => navigate('/')}>
            <Home className="w-4 h-4 mr-2" />
            Kembali ke Beranda
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-md mx-auto">
        {/* Admin Login Button - Top Right */}
        <div className="flex justify-end mb-4 print-hidden">
          <button
            onClick={() => navigate('/admin/login')}
            className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 text-muted-foreground rounded-lg transition-colors text-sm"
          >
            <Settings className="w-4 h-4" />
            Admin
          </button>
        </div>

        {/* Success Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 mb-4">
            <Ticket className="w-8 h-8 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Pendaftaran Berhasil!</h1>
          <p className="text-muted-foreground mt-2">Simpan tiket ini sebagai bukti pendaftaran</p>
        </div>

        {/* Ticket Card */}
        <Card className="overflow-hidden">
          {/* Queue Number Header */}
          <div className="bg-primary text-primary-foreground text-center py-8">
            <p className="text-sm opacity-80 mb-2">NOMOR ANTRIAN</p>
            <p className="text-6xl font-bold tracking-wider">{ticket.queue_number}</p>
          </div>

          <CardContent className="p-6 space-y-6">
            {/* Status Badge */}
            <div className="flex justify-center">
              <span className={`px-4 py-2 rounded-full border ${getStatusColor(ticket.status)}`}>
                {getStatusText(ticket.status)}
              </span>
            </div>

            {/* Ticket Info */}
            <div className="space-y-4">
              {/* Ticket Code */}
              <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                <Ticket className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Kode Tiket</p>
                  <p className="font-mono font-semibold">{ticket.ticket_code}</p>
                </div>
              </div>

              {/* Service */}
              <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                <Building2 className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Tujuan Layanan</p>
                  <p className="font-semibold">{ticket.service?.name}</p>
                </div>
              </div>

              {/* Name */}
              <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                <User className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Nama Lengkap</p>
                  <p className="font-semibold">{ticket.visitor?.name}</p>
                </div>
              </div>

              {/* Agency */}
              <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                <Building2 className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Instansi / Perusahaan</p>
                  <p className="font-semibold">{ticket.visitor?.agency || '-'}</p>
                </div>
              </div>

              {/* Alamat */}
              {ticket.visitor?.alamat && (
                <div className="flex items-start gap-3 p-3 bg-secondary rounded-lg">
                  <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Alamat</p>
                    <p className="text-sm">{ticket.visitor.alamat}</p>
                  </div>
                </div>
              )}

              {/* Phone */}
              {ticket.visitor?.phone && (
                <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                  <Phone className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Nomor HP / WhatsApp</p>
                    <p className="font-semibold">{ticket.visitor.phone}</p>
                  </div>
                </div>
              )}

              {/* Purpose */}
              <div className="flex items-start gap-3 p-3 bg-secondary rounded-lg">
                <FileText className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Keperluan</p>
                  <p className="text-sm">{ticket.visitor?.purpose}</p>
                </div>
              </div>

              {/* Location */}
              {ticket.visitor?.location_lat && ticket.visitor?.location_lng && (
                <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Koordinat Lokasi</p>
                    <p className="font-mono text-sm">
                      {parseFloat(ticket.visitor.location_lat).toFixed(6)}, {parseFloat(ticket.visitor.location_lng).toFixed(6)}
                    </p>
                  </div>
                </div>
              )}

              {/* Date & Time */}
              <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Waktu Pendaftaran</p>
                  <p className="font-semibold">{ticket.created_at}</p>
                </div>
              </div>
            </div>

            {/* Counter Info (if called) */}
            {ticket.status === 'called' && ticket.counter_number && (
              <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4 text-center">
                <p className="text-blue-400 text-sm mb-1">SILAKAN MENUJU</p>
                <p className="text-3xl font-bold text-blue-400">LOKET {ticket.counter_number}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 print-hidden">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => window.print()}
              >
                <Download className="w-4 h-4 mr-2" />
                Cetak
              </Button>
              <Button 
                className="flex-1"
                onClick={() => navigate('/')}
              >
                <Home className="w-4 h-4 mr-2" />
                Beranda
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-secondary rounded-lg print-hidden">
          <h3 className="font-semibold mb-2">Petunjuk:</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Simpan kode tiket Anda untuk referensi</li>
            <li>• Pantau layar display untuk nomor antrian Anda</li>
            <li>• Tunggu hingga nomor Anda dipanggil</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TicketDisplay;