import { BanknotesIcon, CircleStackIcon, ClockIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { lusitana } from '@/app/ui/fonts';
import { getSigmaDataStats } from '@/app/lib/data';
import { formatCurrency } from "@/app/lib/utils";

const iconMap = {
  bankNotes: BanknotesIcon,
  coins: CircleStackIcon,
  ytdIcon: ClockIcon,
  currency: CurrencyDollarIcon,
};

export default async function CardWrapper() {

  const { total_amount, total_last_12_months, total_ytd, total_current_month } = await getSigmaDataStats();

  return (
    <>
      <Card title="Faturamento Total" value={formatCurrency(total_amount*100)} type="bankNotes"/>
      <Card title="Faturamento 12 Meses" value={formatCurrency(total_last_12_months*100)} type="coins" />
      <Card title="Faturamento YTD" value={formatCurrency(total_ytd*100)} type="ytdIcon" />
      <Card title="Faturamento do Mês" value={formatCurrency(total_current_month*100)} type="currency"/>
    </>
  );
}

export function Card({ title, value, type,}: {  title: string; value: number | string; type: 'ytdIcon' | 'currency' | 'coins' | 'bankNotes';}) {

  const Icon = iconMap[type];

  return (
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
