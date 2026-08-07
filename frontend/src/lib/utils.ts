import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatTime(timeStr: string): string {
  if (!timeStr) return "-";
  return timeStr.slice(0, 5); // HH:MM
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Selamat pagi";
  if (hour < 15) return "Selamat siang";
  if (hour < 18) return "Selamat sore";
  return "Selamat malam";
}

const extractMessage = (data: unknown): string | null => {
  if (typeof data === 'string') return data;
  if (Array.isArray(data)) {
    return data
      .map((item) => extractMessage(item))
      .filter(Boolean)
      .join(', ');
  }
  if (typeof data === 'object' && data !== null) {
    const record = data as Record<string, unknown>;

    if (typeof record.message === 'string') return record.message;
    if (Array.isArray(record.message)) return extractMessage(record.message);
    if (typeof record.error === 'string') return record.error;
    if (Array.isArray(record.errors)) return extractMessage(record.errors);
    if (typeof record.meta === 'object' && record.meta !== null) {
      return extractMessage((record.meta as Record<string, unknown>).message);
    }
    if (typeof record.constraints === 'object' && record.constraints !== null) {
      return extractMessage(Object.values(record.constraints));
    }

    return extractMessage(Object.values(record));
  }
  return null;
};

export function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object') {
    const axiosError = error as {
      response?: {
        data?: unknown;
        statusText?: string;
      };
      message?: string;
    };

    const data = axiosError.response?.data;
    const parsed = extractMessage(data);
    if (parsed) return parsed;

    if (typeof axiosError.message === 'string') {
      return axiosError.message;
    }

    if (typeof axiosError.response?.statusText === 'string') {
      return axiosError.response.statusText;
    }
  }

  if (error instanceof Error) return error.message;
  return 'Terjadi kesalahan. Silakan coba lagi.';
}
