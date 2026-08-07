import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useLogin } from '../hooks/useLogin';
import { getErrorMessage } from '@/lib/utils';

const schema = z.object({
  email:    z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
  password: z.string().min(1, 'Kata sandi wajib diisi'),
});

type FormData = z.infer<typeof schema>;

export const LoginForm: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useLogin();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => loginMutation.mutate(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <Input
        label="Alamat Email"
        type="email"
        placeholder="nama@perusahaan.com"
        required
        autoComplete="email"
        leftElement={<Mail className="h-4 w-4" />}
        error={errors.email?.message}
        {...register('email')}
      />

      <Input
        label="Kata Sandi"
        type={showPassword ? 'text' : 'password'}
        placeholder="Masukkan kata sandi"
        required
        autoComplete="current-password"
        leftElement={<Lock className="h-4 w-4" />}
        rightElement={
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="p-0.5 transition-colors hover:text-slate-700"
            style={{ color: 'var(--text-placeholder)' }}
            aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        }
        error={errors.password?.message}
        {...register('password')}
      />

      {loginMutation.isError && (
        <div
          className="flex items-start gap-3 rounded-md px-4 py-3 text-sm"
          style={{
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            color: '#B91C1C',
          }}
          role="alert"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" style={{ color: '#DC2626' }} />
          <span>{getErrorMessage(loginMutation.error)}</span>
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        className="w-full"
        size="md"
        loading={loginMutation.isPending}
      >
        {loginMutation.isPending ? 'Sedang masuk…' : 'Masuk'}
      </Button>
    </form>
  );
};
