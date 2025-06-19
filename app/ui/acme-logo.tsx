import { GlobeAltIcon, CpuChipIcon, WrenchScrewdriverIcon } from '@heroicons/react/24/outline';
// Update the import path below to the correct location of your fonts file
import { lusitana } from "@/app/ui/fonts";

export default function AcmeLogo() {
  return (
    <div className={`${lusitana.className} flex flex-row justify-between leading-none text-white`}>
      <GlobeAltIcon className="h-12 w-12 rotate-[15deg]" />
      <p className="text-4xl pt-2 sm:ml-3">Sigma</p>
    </div>
  );
}
