import React, { useState } from 'react';
import { Sparkles, Tag, ChevronDown, HelpCircle, Copy, Check } from 'lucide-react';
import { KTM_FAQS, STUDENT_PROMOS } from '../data/trains';
import { useAuth } from '../context/AuthContext';

export function PromoSection() {
  const { pushToast } = useAuth();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const handleCopyCode = (code: string) => {
    try {
      navigator.clipboard.writeText(code);
    } catch {
      // ignore clipboard errors
    }
    setCopiedCode(code);
    pushToast({
      type: 'success',
      title: `Kode Promo ${code} Disalin!`,
      description: 'Diskon mahasiswa otomatis teraplikasi saat opsi KTM aktif.',
    });
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <>
      {/* Promo Section */}
      <section
        id="promo-mahasiswa"
        className="bg-slate-900 py-14 text-white"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-300 mb-2">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Program Kesejahteraan &amp; Mobilitas Kampus</span>
              </div>
              <h2 className="text-2xl font-extrabold sm:text-3xl">
                Promo &amp; Benefit Eksklusif Mahasiswa
              </h2>
            </div>
            <p className="text-sm text-slate-300 max-w-md">
              Dirancang khusus untuk mendukung kegiatan akademik, lomba nasional, maupun perjalanan mudik libur semester.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {STUDENT_PROMOS.map((promo) => (
              <div
                key={promo.id}
                className={`relative flex flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br ${promo.color} p-6 shadow-xl`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold text-white backdrop-blur-sm">
                      {promo.badge}
                    </span>
                    <span className="text-xs font-bold text-amber-300">
                      {promo.discount}
                    </span>
                  </div>

                  <h3 className="text-lg font-extrabold leading-snug">
                    {promo.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-white/85">
                    {promo.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/15 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-white/70 block">
                      Kode Voucher KTM
                    </span>
                    <span className="font-mono text-sm font-extrabold text-amber-300 flex items-center gap-1">
                      <Tag className="h-3.5 w-3.5" />
                      {promo.code}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopyCode(promo.code)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-2 text-xs font-bold text-slate-900 hover:bg-slate-100 transition"
                  >
                    {copiedCode === promo.code ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Tersalin</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Salin Kode</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq-ktm" className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 mb-2">
            <HelpCircle className="h-3.5 w-3.5" />
            <span>Pusat Bantuan &amp; Informasi KTM</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">
            Pertanyaan yang Sering Diajukan Mahasiswa
          </h2>
        </div>

        <div className="space-y-3">
          {KTM_FAQS.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={faq.question}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-bold text-slate-900 hover:bg-slate-50"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${
                      isOpen ? 'rotate-180 text-blue-700' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-4 text-xs leading-relaxed text-slate-600">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
