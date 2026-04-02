import React, { useState, useEffect } from 'react';
import { 
  format, addMonths, subMonths, startOfMonth, endOfMonth, 
  startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays 
} from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import '../App.css';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date('2026-04-02'));
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadEvents();
  }, [currentDate]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.calendar.getAll();
      setEvents(data);
    } catch (err) {
      setError('Failed to load calendar events.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date('2026-04-02')); // Mocking today

  // Generate Calendar Data
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const renderCells = () => {
    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = "";

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, "d");
        const cloneDay = day;
        
        // Find events specific exactly to this ISO date
        const dateKey = format(cloneDay, 'yyyy-MM-dd');
        const dayEvents = events.filter(e => e.date === dateKey);
        
        const isCurrentMonth = isSameMonth(day, monthStart);
        const isToday = isSameDay(day, new Date('2026-04-02'));

        days.push(
          <div 
            key={day}
            style={{ 
              backgroundColor: isCurrentMonth ? 'white' : '#f8fafc',
              padding: '8px',
              minHeight: '120px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              borderRight: '1px solid #e2e8f0',
              borderBottom: '1px solid #e2e8f0'
            }}
          >
            {/* Day Number */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '4px' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: '28px', height: '28px', borderRadius: '50%',
                backgroundColor: isToday ? 'var(--primary)' : 'transparent',
                color: isToday ? 'white' : (isCurrentMonth ? 'var(--text-main)' : '#94a3b8'),
                fontWeight: isToday ? 'bold' : '500', fontSize: '0.875rem'
              }}>
                {formattedDate}
              </span>
            </div>

            {/* Events Stack */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto', flex: 1 }}>
               {dayEvents.map(ev => {
                  let bgColor = '#f1f5f9'; let textColor = '#475569'; let borderColor = '#cbd5e1';

                  if (ev.type === 'vaccination') {
                    bgColor = '#fee2e2'; textColor = '#b91c1c'; borderColor = '#fca5a5';
                  } else if (ev.type === 'hatchery') {
                    bgColor = '#dbeafe'; textColor = '#1d4ed8'; borderColor = '#93c5fd';
                  } else {
                    bgColor = '#fef9c3'; textColor = '#a16207'; borderColor = '#fde047';
                  }

                  return (
                    <div 
                      key={ev.id} 
                      title={ev.title}
                      style={{
                        backgroundColor: bgColor, color: textColor,
                        borderLeft: `3px solid ${borderColor}`,
                        padding: '4px 6px', fontSize: '0.75rem', fontWeight: '500',
                        borderRadius: '0 4px 4px 0', whiteSpace: 'nowrap',
                        overflow: 'hidden', textOverflow: 'ellipsis', cursor: 'pointer'
                      }}
                    >
                      {ev.title}
                    </div>
                  );
               })}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(<div key={day} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>{days}</div>);
      days = [];
    }
    return rows;
  };

  return (
    <div className="page-container">
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <h2>Calendar</h2>
        <button className="btn-primary" onClick={() => {/* Future Add Handler */}}>
          <Plus size={18} /> Add Event
        </button>
      </div>

      {error && (
        <div style={{ padding: '16px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '8px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={20} /> {error}
        </div>
      )}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Calendar Header Control Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <CalendarIcon size={24} color="var(--primary)" />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-main)', margin: 0 }}>
              {format(currentDate, 'MMMM yyyy')}
            </h3>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {loading && <Loader2 size={18} className="spin" style={{ color: 'var(--text-muted)', marginRight: '12px' }} />}
            <button onClick={goToToday} className="btn-secondary" style={{ padding: '6px 16px', fontSize: '0.875rem', marginRight: '8px' }}>Today</button>
            <button onClick={prevMonth} className="btn-secondary" style={{ padding: '6px' }} title="Previous Month"><ChevronLeft size={20} /></button>
            <button onClick={nextMonth} className="btn-secondary" style={{ padding: '6px' }} title="Next Month"><ChevronRight size={20} /></button>
          </div>
        </div>

        {/* Responsive Grid Container */}
        <div style={{ overflowX: 'auto', backgroundColor: '#f8fafc', position: 'relative' }}>
          {loading && events.length === 0 && (
            <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(255,255,255,0.7)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Loader2 size={32} className="spin" color="var(--primary)" />
            </div>
          )}
          
          <div style={{ minWidth: '800px' }}>
            {/* Days of Week Header */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid var(--border-color)' }}>
              {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                <div key={day} style={{ padding: '12px 8px', textAlign: 'center', fontWeight: '600', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  {day}
                </div>
              ))}
            </div>

            {/* Monthly Grid */}
            <div style={{ borderLeft: '1px solid #e2e8f0', borderTop: '1px solid #e2e8f0' }}>
              {renderCells()}
            </div>
            
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default Calendar;
