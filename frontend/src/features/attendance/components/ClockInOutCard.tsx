import React, { useState, useEffect, useRef } from 'react';
import { Clock, CheckCircle, LogIn, LogOut, Upload, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AttendanceStatusBadge } from '@/components/ui/Badge';
import { useClockIn } from '../hooks/useClockIn';
import { useClockOut } from '../hooks/useClockOut';
import { useMyAttendances } from '../hooks/useAttendances';
import { cn, getErrorMessage, formatTime } from '@/lib/utils';
import type { Attendance } from '@/types/attendance.types';

const getTodayStr = () => new Date().toISOString().slice(0, 10);

function useLiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

export const ClockInOutCard: React.FC = () => {
  const now    = useLiveClock();
  const today  = getTodayStr();
  const fileRef = useRef<HTMLInputElement>(null);

  const [photo,      setPhoto]      = useState<File | null>(null);
  const [preview,    setPreview]    = useState<string | null>(null);
  const [notes,      setNotes]      = useState<string>("");
  const [actionType, setActionType] = useState<'clock-in' | 'clock-out' | null>(null);

  const clockInMutation  = useClockIn();
  const clockOutMutation = useClockOut();

  const { data } = useMyAttendances({ page: 1, limit: 2, date: today });
  const records      = data?.data ?? [];
  const clockInRec   = records.find((r) => r.type === 'CLOCK_IN');
  const clockOutRec  = records.find((r) => r.type === 'CLOCK_OUT');
  const isComplete   = !!(clockInRec && clockOutRec);

  const clearPhoto = () => {
    setPhoto(null);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleAction = (type: 'clock-in' | 'clock-out') => {
    setActionType(type);
    const mut = type === 'clock-in' ? clockInMutation : clockOutMutation;
    mut.mutate(
      {
        photo: photo ?? undefined,
        notes: notes.trim() || undefined,
      },
      {
        onSettled: () => {
          clearPhoto();
          setNotes("");
        },
      },
    );
  };

  const isLoading = clockInMutation.isPending || clockOutMutation.isPending;
  const error =
    (clockInMutation.isError  && getErrorMessage(clockInMutation.error)) ||
    (clockOutMutation.isError && getErrorMessage(clockOutMutation.error));

  return (
    <div
      className="rounded-lg bg-white dark:bg-[var(--bg-surface)] overflow-hidden transition-colors"
      style={{ border: '1px solid var(--border)' }}
    >
      {/* Header — date & live clock */}
      <div className="bg-primary-600 px-6 py-5">
        <p className="text-sm text-primary-200">
          {now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
        <p className="mt-1 font-mono text-4xl font-bold tabular text-white tracking-tight">
          {now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </p>
      </div>

      <div className="p-5 space-y-5">
        {/* Status row */}
        <div className="grid grid-cols-2 gap-3">
          <TimeStatusCard label="Clock In"  record={clockInRec}  type="in"  />
          <TimeStatusCard label="Clock Out" record={clockOutRec} type="out" />
        </div>

        {/* Photo upload + notes — only if not complete */}
        {!isComplete && (
          <div className="space-y-4">
            <div>
              <p className="mb-2 text-[13px] font-medium" style={{ color: 'var(--text-body)' }}>
                Foto Bukti <span className="font-normal" style={{ color: 'var(--text-muted)' }}>(opsional)</span>
              </p>
              {preview ? (
                <div className="relative inline-block">
                  <img
                    src={preview}
                    alt="Preview"
                    className="h-24 w-40 rounded-md object-cover"
                    style={{ border: '1px solid var(--border)' }}
                  />
                  <button
                    type="button"
                    onClick={clearPhoto}
                    className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm"
                    style={{ border: '1px solid var(--border)' }}
                    aria-label="Hapus foto"
                  >
                    <X className="h-3 w-3 text-slate-500" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-2 rounded-md border border-dashed px-4 py-2.5 text-sm transition-colors hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/10"
                  style={{ borderColor: 'var(--border-muted)', color: 'var(--text-muted)' }}
                >
                  <Upload className="h-4 w-4" />
                  Pilih atau ambil foto
                </button>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                capture="environment"
                onChange={handleFile}
                className="hidden"
                aria-label="Upload foto absensi"
              />
            </div>

            <div>
              <label
                htmlFor="attendance-notes"
                className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                Catatan (opsional)
              </label>
              <textarea
                id="attendance-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition-colors duration-150 focus:border-primary-500 focus:ring-2 focus:ring-primary-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-primary-400 dark:focus:ring-primary-900/30"
                placeholder="Misal: Terlambat karena macet, atau selesai meeting"
              />
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            className="flex items-center gap-2 rounded-md px-4 py-3 text-sm"
            style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#B91C1C' }}
            role="alert"
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Action button */}
        {!clockInRec && (
          <Button
            variant="primary"
            size="md"
            className="w-full"
            loading={isLoading && actionType === 'clock-in'}
            disabled={isLoading}
            onClick={() => handleAction('clock-in')}
            leftIcon={<LogIn className="h-4 w-4" />}
          >
            Clock In Sekarang
          </Button>
        )}

        {clockInRec && !clockOutRec && (
          <Button
            variant="secondary"
            size="md"
            className="w-full"
            loading={isLoading && actionType === 'clock-out'}
            disabled={isLoading}
            onClick={() => handleAction('clock-out')}
            leftIcon={<LogOut className="h-4 w-4" />}
          >
            Clock Out Sekarang
          </Button>
        )}

        {isComplete && (
          <div
            className="flex items-center justify-center gap-2 rounded-md py-3 text-sm font-medium"
            style={{ background: '#DCFCE7', color: '#15803D' }}
          >
            <CheckCircle className="h-4 w-4" />
            Absensi hari ini sudah lengkap
          </div>
        )}
      </div>
    </div>
  );
};

interface TimeStatusCardProps {
  label:   string;
  record?: Attendance;
  type:    'in' | 'out';
}

const TimeStatusCard: React.FC<TimeStatusCardProps> = ({ label, record, type }) => {
  const hasRecord = !!record;

  return (
    <div
      className={cn(
        'rounded-md p-4 transition-colors',
        hasRecord
          ? type === 'in'
            ? 'bg-primary-50 dark:bg-primary-900/15'
            : 'bg-slate-100 dark:bg-[var(--bg-secondary)]'
          : '',
      )}
      style={!hasRecord ? { background: 'var(--bg-app)', border: '1px solid var(--border)' } : undefined}
    >
      <p
        className="text-xs font-medium"
        style={{ color: hasRecord && type === 'in' ? '#4F46E5' : 'var(--text-muted)' }}
      >
        {label}
      </p>
      {record ? (
        <>
          <p className="mt-1 font-mono text-xl font-bold tabular" style={{ color: 'var(--text-heading)' }}>
            {formatTime(record.clockTime)}
          </p>
          <div className="mt-2">
            <AttendanceStatusBadge status={record.status} />
          </div>
        </>
      ) : (
        <div className="flex items-center gap-1.5 mt-1">
          <Clock className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Belum tercatat</p>
        </div>
      )}
    </div>
  );
};
