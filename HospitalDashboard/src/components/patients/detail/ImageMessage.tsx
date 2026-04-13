/**
 * HIPAA-compliant image display for coordinator dashboard.
 *
 * - Images loaded via short-lived signed URLs (5-min TTL)
 * - No download capability (right-click, drag disabled)
 * - Copy prevention on image
 * - Risk badge + AI classification summary displayed inline
 */

import { useState, useEffect } from 'react';
import { Camera, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import type { ImageClassification, RiskLevel } from '../../../types';

interface Props {
  storagePath: string;
  classification: ImageClassification | null;
}

const riskConfig: Record<string, { bg: string; border: string; text: string; label: string; Icon: typeof CheckCircle }> = {
  green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', label: 'Stable', Icon: CheckCircle },
  yellow: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', label: 'Needs Review', Icon: AlertCircle },
  red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', label: 'Urgent', Icon: AlertTriangle },
  not_started: { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700', label: 'Pending', Icon: AlertCircle },
};

export default function ImageMessage({ storagePath, classification }: Props) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!supabase || !storagePath) return;

    async function loadSignedUrl() {
      setLoading(true);
      setError(false);

      const { data, error: urlErr } = await supabase!.storage
        .from('patient-images')
        .createSignedUrl(storagePath, 300); // 5-min TTL

      if (urlErr || !data?.signedUrl) {
        console.warn('[ImageMessage] signed URL error', urlErr);
        setError(true);
      } else {
        setImageUrl(data.signedUrl);
      }
      setLoading(false);
    }

    loadSignedUrl();
  }, [storagePath]);

  const risk = classification?.risk_level ?? 'yellow';
  const config = riskConfig[risk];
  const RiskIcon = config.Icon;

  return (
    <div className="ml-9 space-y-2">
      {/* Image */}
      <div className="max-w-[300px] rounded-lg overflow-hidden border border-slate-200 bg-white">
        {loading ? (
          <div className="w-[200px] h-[200px] flex items-center justify-center bg-slate-50">
            <div className="animate-spin w-5 h-5 border-2 border-forest border-t-transparent rounded-full" />
          </div>
        ) : error ? (
          <div className="w-[200px] h-[150px] flex flex-col items-center justify-center bg-slate-50 gap-2">
            <Camera size={24} className="text-slate-300" />
            <span className="text-xs text-slate-400 font-sans">Image unavailable</span>
          </div>
        ) : (
          <img
            src={imageUrl!}
            alt="Patient-submitted photo"
            className="max-w-[300px] max-h-[300px] object-contain"
            style={{
              pointerEvents: 'none',
              userSelect: 'none',
              WebkitUserDrag: 'none',
            } as React.CSSProperties}
            onContextMenu={(e) => e.preventDefault()}
            draggable={false}
          />
        )}
      </div>

      {/* AI Classification Summary */}
      {classification && (
        <div className={`max-w-[340px] rounded-lg border ${config.border} ${config.bg} px-3.5 py-3 space-y-2`}>
          <div className="flex items-center gap-2">
            <RiskIcon size={14} className={config.text} />
            <span className={`text-xs font-semibold font-sans ${config.text}`}>
              AI Triage: {config.label}
            </span>
            {classification.confidence && (
              <span className="text-xs text-slate-400 font-sans ml-auto">
                {classification.confidence} confidence
              </span>
            )}
          </div>

          <p className="text-xs text-slate-700 font-sans leading-relaxed">
            {classification.description}
          </p>

          {classification.recommendations && (
            <p className="text-xs text-slate-500 font-sans italic">
              Recommendation: {classification.recommendations}
            </p>
          )}

          <div className="flex items-center gap-1.5 pt-1">
            <span className="text-[10px] text-slate-400 font-sans uppercase tracking-wide">
              Type: {classification.injury_type}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
