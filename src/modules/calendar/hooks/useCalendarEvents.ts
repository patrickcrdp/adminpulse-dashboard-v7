import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { calendarService } from '../services/calendar.service';
import { CalendarEvent, CalendarViewType } from '../types/calendar.types';
import { calendarUtils } from '../utils/calendar.utils';

export const useCalendarEvents = () => {
  const { user, organization } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarViewType>('month');

  const fetchEvents = useCallback(async () => {
    if (!organization?.id) return;

    setLoading(true);
    setError(null);
    try {
      let range;
      if (view === 'month') {
        range = calendarUtils.getMonthRange(currentDate);
      } else if (view === 'week') {
        range = calendarUtils.getWeekRange(currentDate);
      } else {
        range = calendarUtils.getDayRange(currentDate);
      }
      
      const data = await calendarService.fetchEvents(organization.id, new Date(range.start), new Date(range.end));
      setEvents(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao buscar eventos');
    } finally {
      setLoading(false);
    }
  }, [organization?.id, currentDate, view]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const addEvent = async (event: Partial<CalendarEvent>) => {
    if (!organization?.id) throw new Error('Organização não encontrada');
    
    setLoading(true);
    try {
      const newEvent = await calendarService.createEvent({
        ...event,
        organization_id: organization.id,
      });
      setEvents(prev => [...prev, newEvent]);
      return newEvent;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateEvent = async (id: string, updates: Partial<CalendarEvent>) => {
    setLoading(true);
    try {
      const updatedEvent = await calendarService.updateEvent(id, updates);
      setEvents(prev => prev.map(e => (e.id === id ? updatedEvent : e)));
      return updatedEvent;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeEvent = async (id: string) => {
    setLoading(true);
    try {
      await calendarService.deleteEvent(id);
      setEvents(prev => prev.filter(e => e.id !== id));
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    events,
    loading,
    error,
    currentDate,
    setCurrentDate,
    view,
    setView,
    addEvent,
    updateEvent,
    removeEvent,
    refreshEvents: fetchEvents,
  };
};
