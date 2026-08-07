import React from 'react';
import { useRouter } from '@tanstack/react-router';
import { HomeIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const NotFoundPage: React.FC = () => {
  const router = useRouter();
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4 text-center"
      style={{ background: 'var(--bg-app)' }}
    >
      <p className="text-7xl font-bold text-primary-600">404</p>
      <h1 className="mt-4 text-2xl font-bold" style={{ color: 'var(--text-heading)' }}>
        Halaman tidak ditemukan
      </h1>
      <p className="mt-2 text-sm max-w-xs" style={{ color: 'var(--text-muted)' }}>
        Halaman yang Anda cari tidak ada atau sudah dipindahkan.
      </p>
      <Button
        variant="primary"
        size="md"
        className="mt-8"
        leftIcon={<HomeIcon className="h-4 w-4" />}
        onClick={() => void router.navigate({ to: '/attendance' })}
      >
        Kembali ke Beranda
      </Button>
    </div>
  );
};

export default NotFoundPage;
