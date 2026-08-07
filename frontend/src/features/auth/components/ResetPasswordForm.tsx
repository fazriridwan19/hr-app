import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Lock, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useResetPassword } from '../hooks/useResetPassword';
import { getErrorMessage } from '@/lib/utils';

const schema = z
  .object({
    newPassword: z.string().min(6, 'Kata sandi minimal 6 karakter'),
    confirmPassword: z.string().min(1, 'Konfirmasi kata sandi wajib diisi'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Kata sandi tidak cocok',
  });

type FormData = z.infer<typeof schema>;

export interface ResetPasswordFormProps {
  token: string;
  onSuccess: () => void;
}

export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ token, onSuccess }) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const mutation = useResetPassword();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate(
      { token, data: { newPassword: data.newPassword } },
      {
        onSuccess: () => {
          onSuccess();
        },
      },
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {mutation.isError && (
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
          <span>{getErrorMessage(mutation.error)}</span>
        </div>
      )}

      {mutation.isSuccess && (
        <div
          className="rounded-md border border-primary-200 bg-primary-50 px-4 py-3 text-sm text-primary-700"
          role="status"
        >
          {mutation.data?.message ?? 'Password berhasil diubah.'}
        </div>
      )}

      <Input
        label="Kata Sandi Baru"
        type={showPassword ? 'text' : 'password'}
        placeholder="Minimal 6 karakter"
        required
        autoComplete="new-password"
        leftElement={<Lock className="h-4 w-4" />}
        rightElement={
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="p-0.5 transition-colors hover:text-slate-700"
            style={{ color: 'var(--text-placeholder)' }}
            aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        }
        error={errors.newPassword?.message}
        disabled={mutation.isPending || mutation.isSuccess}
        {...register('newPassword')}
      />

      <Input
        label="Konfirmasi Kata Sandi"
        type={showPassword ? 'text' : 'password'}
        placeholder="Ketik ulang kata sandi baru"
        required
        autoComplete="new-password"
        leftElement={<Lock className="h-4 w-4" />}
        error={errors.confirmPassword?.message}
        disabled={mutation.isPending || mutation.isSuccess}
        {...register('confirmPassword')}
      />

      <Button type="submit" variant="primary" className="w-full" size="md" loading={mutation.isPending} disabled={mutation.isSuccess}>
        {mutation.isPending ? 'Menyimpan...' : 'Atur ulang kata sandi'}
      </Button>
    </form>
  );
};
