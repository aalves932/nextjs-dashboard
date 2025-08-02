import { CheckIcon, ClockIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

export default function UserStatus({ status }: { status: 'active' | 'inactive' }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2 py-1 text-xs',
        {
          'bg-gray-100 text-gray-500': status === 'inactive',
          'bg-green-500 text-white': status === 'active',
        },
      )}
    >
      {status === 'inactive' ? (
        <>
          Inativo
          <ClockIcon className="ml-1 w-4 text-gray-500" />
        </>
      ) : null}
      {status === 'active' ? (
        <>
          Ativo
          <CheckIcon className="ml-1 w-4 text-white" />
        </>
      ) : null}
    </span>
  );
}
