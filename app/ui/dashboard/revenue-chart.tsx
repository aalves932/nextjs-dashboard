// import { generateYAxis } from "@/app/lib/utils";
import { CalendarIcon } from "@heroicons/react/24/outline";
import { lusitana } from "@/app/ui/fonts";
import { fetchRevenueByYear } from "@/app/lib/revenue-nfs";

// This component is representational only.
// For data visualization UI, check out:
// https://www.tremor.so/
// https://www.chartjs.org/
// https://airbnb.io/visx/

export default async function RevenueChart() {
  const revenue = await fetchRevenueByYear();
  const chartHeight = 350;
  const highestRecord = Math.max(...revenue.map((year) => year.faturamento));
  const topLabel = Math.ceil(highestRecord / 10000) * 10000;
  const yAxisLabels = [];
  for (let i = topLabel; i >= 0; i -= 10000) {
    yAxisLabels.push(i.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
  }
  if (!revenue || revenue.length === 0) {
    return <p className="mt-4 text-gray-400">Sem dados disponíveis.</p>;
  }

  return (
    <div className="w-full md:col-span-4">
      <h2 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Faturamento por Ano
      </h2>
      {/* NOTE: Uncomment this code in Chapter 7 */}

      <div className="rounded-xl bg-gray-50 p-4">
        <div
          className="mt-0 grid items-end gap-8 rounded-md bg-white p-4 md:gap-12"
          style={{ gridTemplateColumns: `repeat(${revenue.length}, minmax(32px, 1fr))` }}
        >
          {/* Removido o eixo Y e os labels dos valores */}
          {revenue.map((year) => (
            <div key={year.ano} className="flex flex-col items-center gap-2">
              <div
                className="w-full rounded-md bg-blue-300"
                style={{
                  height: `${(chartHeight / topLabel) * year.faturamento}px`,
                  minWidth: '32px',
                  maxWidth: '40px',
                }}
              ></div>
              <p className="text-sm text-gray-400">
                {year.ano}
              </p>
            </div>
          ))}
        </div>
        <div className="flex items-center pb-2 pt-6">
          <CalendarIcon className="h-5 w-5 text-gray-500" />
          <h3 className="ml-2 text-sm text-gray-500 ">Faturamento anual</h3>
        </div>
      </div>
    </div>
  );
}
