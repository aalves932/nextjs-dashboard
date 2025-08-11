import { ArrowPathIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
// import Image from 'next/image';
import { lusitana } from '@/app/ui/fonts';
// import { LatestInvoice } from '@/app/lib/definitions';
import { fetchLatestNFS } from '@/app/lib/fetch-nfs';
import { EyeIcon } from '@heroicons/react/24/outline';


export default async function LatestInvoices() {
  const latestNFS = await fetchLatestNFS();
  return (
    <div className="flex w-full flex-col md:col-span-4">
      <h2 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Últimas Notas Fiscais Emitidas
      </h2>
      <div className="flex grow flex-col justify-between rounded-xl bg-gray-50 p-4">
        <div className="bg-white px-6">
          {latestNFS.map((nfs, i) => (
            <div
              key={`${nfs.numero}`}
              className={clsx(
                'flex flex-row items-center justify-between py-4',
                {
                  'border-t': i !== 0,
                },
              )}
            >
              <div className="flex flex-col min-w-0">
                <p className="truncate text-sm font-semibold md:text-base">
                  {nfs.numero} - {nfs.nome_reduzido}
                </p>
                <p className="text-xs text-gray-500">Emissão: {nfs.data_emissao ? new Date(nfs.data_emissao).toLocaleDateString('pt-BR') : '-'}</p>
                <p className="text-xs text-gray-500">Competência: {nfs.competencia}</p>
              </div>
              <div className="flex items-center gap-4">
                <p className={`${lusitana.className} truncate text-sm font-medium md:text-base`}>
                  {nfs.valor ? nfs.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '-'}
                </p>
                {nfs.link_nfse && (
                  <a href={nfs.link_nfse} target="_blank" rel="noopener noreferrer" title="Ver nota na prefeitura">
                    <EyeIcon className="h-5 w-5 text-blue-600 hover:text-blue-800" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center pb-2 pt-6">
          <ArrowPathIcon className="h-5 w-5 text-gray-500" />
          <h3 className="ml-2 text-sm text-gray-500 ">Atualizado agora</h3>
        </div>
      </div>
    </div>
  );
}
