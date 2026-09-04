import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  ArrowRight,
  BookOpen,
  ClipboardList,
  HelpCircle,
  Award
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardSubtitle, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { CalendarEvent, CalendarEventType } from '../../types/calendar';
import { calendarService } from '../../services/calendarService';
import { KAMUS_UI } from '../../constants/dictionary';

export interface KalenderPageProps {
  onNavigate: (path: string) => void;
}

export const KalenderPage: React.FC<KalenderPageProps> = ({ onNavigate }) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [filterType, setFilterType] = useState<string>('SEMUA');

  useEffect(() => {
    setEvents(calendarService.getAllEvents());
  }, []);

  const filteredEvents = events.filter((e) => {
    if (filterType === 'SEMUA') return true;
    return e.type === filterType;
  });

  const getEventIcon = (type: CalendarEventType) => {
    switch (type) {
      case 'JADWAL_KULIAH': return <BookOpen size={16} color="var(--color-primary-700)" />;
      case 'BATAS_TUGAS': return <ClipboardList size={16} color="#7c3aed" />;
      case 'KUIS_DARING': return <HelpCircle size={16} color="#2563eb" />;
      case 'AGENDA_AKADEMIK': return <Award size={16} color="#d97706" />;
    }
  };

  const getBadgeVariant = (type: CalendarEventType): 'primary' | 'success' | 'warning' | 'danger' | 'default' => {
    switch (type) {
      case 'JADWAL_KULIAH': return 'primary';
      case 'BATAS_TUGAS': return 'warning';
      case 'KUIS_DARING': return 'primary';
      case 'AGENDA_AKADEMIK': return 'success';
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1>Kalender Akademik & Agenda Perkuliahan</h1>
          <p>Jadwal perkuliahan terpadu, batas waktu pengumpulan tugas, kuis daring, dan agenda resmi kampus</p>
        </div>

        <Badge variant="primary" style={{ padding: '6px 14px', fontSize: 'var(--text-xs)' }}>
          {events.length} Agenda Terjadwal
        </Badge>
      </div>

      {/* Filter Category Tabs */}
      <div className="flex gap-2 flex-wrap">
        <Button 
          variant={filterType === 'SEMUA' ? 'primary' : 'secondary'} 
          size="sm" 
          onClick={() => setFilterType('SEMUA')}
        >
          Semua Agenda ({events.length})
        </Button>
        <Button 
          variant={filterType === 'JADWAL_KULIAH' ? 'primary' : 'secondary'} 
          size="sm" 
          onClick={() => setFilterType('JADWAL_KULIAH')}
        >
          Jadwal Kuliah
        </Button>
        <Button 
          variant={filterType === 'BATAS_TUGAS' ? 'primary' : 'secondary'} 
          size="sm" 
          onClick={() => setFilterType('BATAS_TUGAS')}
        >
          Batas Tugas
        </Button>
        <Button 
          variant={filterType === 'KUIS_DARING' ? 'primary' : 'secondary'} 
          size="sm" 
          onClick={() => setFilterType('KUIS_DARING')}
        >
          Kuis Daring
        </Button>
        <Button 
          variant={filterType === 'AGENDA_AKADEMIK' ? 'primary' : 'secondary'} 
          size="sm" 
          onClick={() => setFilterType('AGENDA_AKADEMIK')}
        >
          Agenda Akademik
        </Button>
      </div>

      {/* Agenda Timeline List */}
      <Card>
        <CardHeader>
          <CardTitle>Timeline Agenda & Batas Waktu Terdekat</CardTitle>
          <CardSubtitle>Daftar aktivitas tersinkronisasi otomatis tanpa duplikasi data</CardSubtitle>
        </CardHeader>
        <CardBody className="flex flex-col gap-4">
          {filteredEvents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
              <p className="text-muted">{KAMUS_UI.TIDAK_ADA_DATA}</p>
            </div>
          ) : (
            filteredEvents.map((evt) => (
              <div 
                key={evt.id}
                style={{
                  padding: 'var(--space-4)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: evt.isUrgent ? 'var(--color-slate-50)' : 'var(--bg-surface)',
                  border: `1px solid ${evt.isUrgent ? 'var(--color-primary-200)' : 'var(--border-default)'}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-2)'
                }}
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                  <div className="flex items-center gap-3">
                    <div style={{ padding: 'var(--space-2)', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                      {getEventIcon(evt.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={getBadgeVariant(evt.type)}>
                          {evt.type.replace('_', ' ')}
                        </Badge>
                        {evt.courseName && (
                          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                            {evt.courseName}
                          </span>
                        )}
                      </div>
                      <h4 style={{ fontSize: 'var(--text-sm)', marginTop: '2px' }}>{evt.title}</h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-3" style={{ fontSize: 'var(--text-xs)' }}>
                    <div className="flex items-center gap-1 text-muted">
                      <CalendarIcon size={14} />
                      <span>{new Date(evt.date).toLocaleDateString('id-ID', { dateStyle: 'full' })}</span>
                    </div>

                    {evt.startTime && (
                      <div className="flex items-center gap-1 text-muted">
                        <Clock size={14} />
                        <span>{evt.startTime} {evt.endTime ? `- ${evt.endTime}` : 'WIB'}</span>
                      </div>
                    )}
                  </div>
                </div>

                {evt.description && (
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', margin: 0, paddingLeft: '44px' }}>
                    {evt.description}
                  </p>
                )}

                {evt.location && (
                  <div style={{ paddingLeft: '44px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                    <MapPin size={12} />
                    <span>{evt.location}</span>
                  </div>
                )}

                {evt.deepLinkPath && (
                  <div style={{ paddingLeft: '44px', marginTop: 'var(--space-1)' }}>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      icon={ArrowRight} 
                      iconPosition="right"
                      onClick={() => onNavigate(evt.deepLinkPath!)}
                    >
                      Buka Halaman Terkait
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </CardBody>
      </Card>
    </div>
  );
};
