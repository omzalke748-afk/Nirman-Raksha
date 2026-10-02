import React, { useState } from 'react';
import { Info, X, ShieldAlert } from 'lucide-react';

export const DisclaimerBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-900 flex items-center justify-between shadow-xs relative z-30">
      <div className="flex items-center space-x-2 max-w-6xl mx-auto">
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
        <p className="leading-relaxed">
          <strong className="text-amber-800 font-bold">Statutory Civic Decision-Support Notice:</strong>{' '}
          NIRMAN-RAKSHA is an AI-assisted decision-support and building information platform for Nagpur Municipal Corporation jurisdiction. Risk indicators do NOT constitute structural safety certification and do NOT predict exact collapse timing. All safety decisions require physical inspection by qualified structural engineers and authorized municipal authorities.
        </p>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="text-amber-600 hover:text-amber-900 p-1 rounded hover:bg-amber-100 shrink-0 ml-3"
        title="Dismiss notice banner"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
