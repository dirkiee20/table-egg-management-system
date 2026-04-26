import React, { useState, useEffect } from 'react';
import { 
  format, addMonths, subMonths, startOfMonth, endOfMonth, 
  startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays 
} from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Loader2, AlertCircle, X, Edit2 } from 'lucide-react';
import { api } from '../services/api';
import '../App.css';

const normalizeEventStatus = (status) => status === 'In Progress' ? 'Pending' : (status || 'Pending');
const getStatusSelectStyle = (status) => ({
  color: status === 'Completed' ? '#166534' : 'var(--text-main)',
  fontWeight: status === 'Completed' ? 700 : 500
});

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date('2026-04-02'));
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    date: new Date('2026-04-02').toISOString().split('T')[0],
    type: 'general',
    time: '',
    description: '',
    status: 'Pending'
  });

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

  const handleOpenEdit = (ev, e) => {
    e.stopPropagation();
    setEditingId(ev.id);
    setFormData({
      title: ev.title || '',
      date: ev.date || '',
      type: ev.type || 'general',
      time: ev.time || '',
      description: ev.description || '',
      status: normalizeEventStatus(ev.status)
    });
    setIsModalOpen(true);
    setSuccessMsg(null);
    setError(null);
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      if (editingId) {
        await api.calendar.update(editingId, formData);
        setSuccessMsg("Event updated successfully!");
      } else {
        await api.calendar.create(formData);
        setSuccessMsg("Event created successfully!");
      }
      await loadEvents();
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccessMsg(null);
        setEditingId(null);
      }, 1500);
    } catch (err) {
      setError(`Failed to ${editingId ? 'update' : 'create'} calendar event.`);
    } finally {
      setIsSubmitting(false);
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

                  if (ev.status === 'Completed') {
                    bgColor = '#dcfce7';
                    textColor = '#166534';
                    borderColor = '#22c55e';
                  }

                  return (
                    <div 
                      key={ev.id} 
                      title={ev.title}
                      onClick={(e) => handleOpenEdit(ev, e)}
                      style={{
                        backgroundColor: bgColor, color: textColor,
                        borderLeft: `3px solid ${borderColor}`,
                        padding: '4px 6px', fontSize: '0.75rem', fontWeight: '500',
                        borderRadius: '0 4px 4px 0', whiteSpace: 'nowrap',
                        overflow: 'hidden', textOverflow: 'ellipsis', cursor: 'pointer',
                        opacity: ev.status === 'Completed' ? 0.6 : 1,
                        textDecoration: ev.status === 'Completed' ? 'line-through' : 'none'
                      }}
                    >
                      {ev.time && <span style={{ marginRight: '4px', opacity: 0.8 }}>{ev.time}</span>}
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
        <button className="btn-primary" onClick={() => {
          setEditingId(null);
          setFormData({
            title: '',
            date: new Date('2026-04-02').toISOString().split('T')[0],
            type: 'general',
            time: '',
            description: '',
            status: 'Pending'
          });
          setSuccessMsg(null);
          setError(null);
          setIsModalOpen(true);
        }}>
          <Plus size={18} /> Add Event
        </button>
      </div>

      {error && !isModalOpen && (
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
      
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => !isSubmitting && setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3>{editingId ? 'Edit Calendar Event' : 'Add Calendar Event'}</h3>
              <button className="close-btn" onClick={() => !isSubmitting && setIsModalOpen(false)}><X size={20} /></button>
            </div>

            {successMsg && (
              <div style={{ padding: '12px', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '6px', marginBottom: '16px', fontSize: '0.875rem' }}>
                {successMsg}
              </div>
            )}
            {error && (
              <div style={{ padding: '12px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '6px', marginBottom: '16px', fontSize: '0.875rem' }}>
                {error}
              </div>
            )}
            
            <form onSubmit={handleCreateEvent} className="standard-form">
              <div className="form-group">
                <label>Event Title</label>
                <input type="text" required placeholder="e.g. Vet Visit" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} disabled={isSubmitting} />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Event Date</label>
                  <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} disabled={isSubmitting} />
                </div>
                <div className="form-group">
                  <label>Time (Optional)</label>
                  <input type="time" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} disabled={isSubmitting} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Event Category</label>
                  <select required value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} disabled={isSubmitting}>
                    <option value="general">General / Routine</option>
                    <option value="vaccination">Vaccination</option>
                    <option value="hatchery">Hatchery / Incubator</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    required
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value})}
                    disabled={isSubmitting}
                    style={getStatusSelectStyle(formData.status)}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Completed" style={{ color: '#166534', fontWeight: 700 }}>Completed</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Description / Notes</label>
                <textarea rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} disabled={isSubmitting} placeholder="Additional details..."></textarea>
              </div>

              <div className="modal-actions" style={{ marginTop: '24px' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={isSubmitting || successMsg}>
                  {isSubmitting ? <Loader2 className="spin" size={18} /> : (editingId ? 'Update Event' : 'Save Event')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
