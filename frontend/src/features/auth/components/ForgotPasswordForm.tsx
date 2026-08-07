import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useRequestPasswordReset } from '../hooks/useRequestPasswordReset';
import { getErrorMessage } from '@/lib/utils';

const schema = z.object({
  email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
});

type FormData = z.infer<typeof schema>;

export const ForgotPasswordForm: React.FC = () => {
  const mutation = useRequestPasswordReset();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => mutation.mutate(data);

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
          {mutation.data?.message ?? 'Permintaan reset password telah dikirimkan.'}
        </div>
      )}

      <Input
        label="Alamat Email"
        type="email"
        placeholder="nama@perusahaan.com"
        required
        autoComplete="email"
        leftElement={<Mail className="h-4 w-4" />}
        error={errors.email?.message}
        disabled={mutation.isPending}
        {...register('email')}
      />

      <Button type="submit" variant="primary" className="w-full" size="md" loading={mutation.isPending}>
        {mutation.isPending ? 'Mengirim...' : 'Kirim link reset'}
      </Button>
    </form>
  );
};
