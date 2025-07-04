import {
  BanknotesIcon,
  ClockIcon,
  UserGroupIcon,
  InboxIcon,
} from '@heroicons/react/24/outline';
import { lusitana } from '@/app/ui/fonts';
import { fetchCardData, getSigmaDataStats } from '@/app/lib/data';
import { formatCurrency } from "@/app/lib/utils";


const iconMap = {
  collected: BanknotesIcon,
  customers: UserGroupIcon,
  pending: ClockIcon,
  invoices: InboxIcon,
};

export default async function CardWrapper() {
  
  const {
    numberOfInvoices,
    numberOfCustomers,
    // totalPaidInvoices,
    totalPendingInvoices,
  } = await fetchCardData();

  const { total_amount } = await getSigmaDataStats();

  return (
    <>
      {/* <Card title="Collected" value={totalPaidInvoices} type="collected" /> */}
      <Card title="Faturamento Total" value={formatCurrency(total_amount*100)} type="collected"/>
      <Card title="Faturamento Pendente" value={totalPendingInvoices} type="pending" />
      <Card title="Total Invoices" value={numberOfInvoices} type="invoices" />
      <Card title="Total Customers" value={numberOfCustomers} type="customers"/>
    </>
  );
}

export function Card({
  title,
  value,
  type,
}: {
  title: string;
  value: number | string;
  type: 'invoices' | 'customers' | 'pending' | 'collected';
}) {
  const Icon = iconMap[type];

  return (
    // font-medium border-2 border-black rounded-xl px-3 py-2 bg-brand hover:bg-yellow-300 hard-shadow-sm
    <div className="rounded-xl bg-yellow-400 border-2 border-black p-2 shadow-sm shadow-black">
      <div className="flex p-2 items-center">
        {Icon ? <Icon className="h-6 w-6 text-gray-700" /> : null}
        <h3 className="ml-2 text-sm font-medium">{title}</h3>
      </div>
      <p className={`${lusitana.className} truncate rounded-xl px-4 py-4 text-center text-2xl`}>
        {value}
      </p>
    </div>
  );
}
