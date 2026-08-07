import React, { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { EmployeeTable } from '@/features/employee/components/EmployeeTable';
import { EmployeeModal } from '@/features/employee/components/EmployeeModal';
import { useEmployees } from '@/features/employee/hooks/useEmployees';

const EmployeeManagementPage: React.FC = () => {
  const [page, setPage]               = useState(1);
  const [search, setSearch]           = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [showAdd, setShowAdd]         = useState(false);

  const { data, isLoading } = useEmployees({ page, limit: 10, search: search || undefined });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-heading)' }}>
            Data Karyawan
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
            {data ? `${data.meta.totalData} karyawan terdaftar` : 'Memuat data…'}
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => setShowAdd(true)}
        >
          Tambah Karyawan
        </Button>
      </div>

      <Card noPadding>
        {/* Search */}
        <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <form onSubmit={handleSearch} className="flex items-center gap-3">
            <Input
              placeholder="Cari nama atau kode karyawan…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              leftElement={<Search className="h-4 w-4" />}
              className="w-72"
              aria-label="Cari karyawan"
            />
            <Button type="submit" variant="secondary" size="md">Cari</Button>
            {search && (
              <Button
                type="button"
                variant="ghost"
                size="md"
                onClick={() => { setSearch(''); setSearchInput(''); setPage(1); }}
              >
                Reset
              </Button>
            )}
          </form>
        </div>

        <EmployeeTable data={data} loading={isLoading} page={page} onPageChange={setPage} />
      </Card>

      <EmployeeModal isOpen={showAdd} onClose={() => setShowAdd(false)} />
    </div>
  );
};

export default EmployeeManagementPage;
