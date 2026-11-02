'use client';

import { useEffect, useMemo, useState } from 'react';
import { BookOpen, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { COMPONENT_CATEGORIES } from '@/lib/circuit-components';
import { getComponentReference, getComponentReferenceCatalog } from '@/lib/component-reference';
import { getComponentSimulationSupport } from '@/lib/spice-netlist-generator';

interface ComponentReferenceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialType?: string;
}

const catalog = getComponentReferenceCatalog();

export function ComponentReferenceDialog({ open, onOpenChange, initialType }: ComponentReferenceDialogProps) {
  const [selectedType, setSelectedType] = useState(initialType || catalog[0]?.type || '');
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (open && initialType) setSelectedType(initialType);
  }, [open, initialType]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return catalog;
    return catalog.filter(item => [item.label, item.description, ...item.tags].some(value => value.toLowerCase().includes(normalized)));
  }, [query]);

  const selected = catalog.find(item => item.type === selectedType) ?? filtered[0] ?? catalog[0];
  const reference = selected ? getComponentReference(selected.type) : undefined;
  const support = selected ? getComponentSimulationSupport(selected.type) : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-1rem)] max-w-6xl h-[88vh] p-0 overflow-hidden bg-slate-950 border-slate-700 text-white">
        <div className="grid h-full min-h-0 grid-cols-1 grid-rows-[minmax(230px,38vh)_minmax(0,1fr)] md:grid-rows-1 md:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="min-h-0 border-b md:border-b-0 md:border-r border-slate-800 bg-slate-900/80">
            <DialogHeader className="p-5 pb-3 text-left">
              <DialogTitle className="flex items-center gap-2 text-lg"><BookOpen className="h-5 w-5 text-cyan-300" /> Component Reference</DialogTitle>
              <DialogDescription className="text-slate-400">Pin functions, internal structure, behavior, and model limits for the full catalog.</DialogDescription>
            </DialogHeader>
            <div className="px-4 pb-3 relative">
              <Search className="absolute left-7 top-2.5 h-4 w-4 text-slate-500" />
              <Input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search components…" className="pl-9 bg-slate-950 border-slate-700" />
            </div>
            <ScrollArea className="h-[calc(38vh-150px)] min-h-[80px] px-3 pb-4 md:h-[calc(88vh-150px)]">
              <div className="space-y-4">
                {Object.entries(COMPONENT_CATEGORIES).map(([category, categoryInfo]) => {
                  const entries = filtered.filter(item => item.category === category);
                  if (!entries.length) return null;
                  return (
                    <section key={category}>
                      <h3 className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">{categoryInfo.icon} {categoryInfo.name}</h3>
                      <div className="space-y-1">
                        {entries.map(item => {
                          const active = item.type === selected?.type;
                          const itemSupport = getComponentSimulationSupport(item.type);
                          return (
                            <button key={item.type} onClick={() => setSelectedType(item.type)} className={`w-full rounded-md px-2.5 py-2 text-left transition-colors ${active ? 'bg-cyan-500/15 border border-cyan-400/40' : 'border border-transparent hover:bg-slate-800'}`}>
                              <span className="flex items-center gap-2">
                                <span aria-hidden="true">{item.icon}</span>
                                <span className="min-w-0 flex-1 truncate text-xs font-medium">{item.label}</span>
                                <span className={`rounded px-1 py-0.5 text-[8px] font-bold ${itemSupport.kind === 'spice' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-amber-500/15 text-amber-300'}`}>
                                  {itemSupport.kind === 'design-only' ? 'DESIGN' : itemSupport.accuracy === 'approximate' ? 'APPROX' : itemSupport.accuracy === 'marker' ? 'MARKER' : 'SPICE'}
                                </span>
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </section>
                  );
                })}
              </div>
            </ScrollArea>
          </aside>

          <main className="min-h-0 overflow-y-auto p-5 md:p-7">
            {selected && reference && support ? (
              <div className="mx-auto max-w-4xl space-y-5">
                <header className="border-b border-slate-800 pb-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-cyan-300">{selected.category.replace(/_/g, ' ')} · {selected.pins} reference pins</p>
                      <h2 className="mt-1 text-2xl font-bold">{selected.icon} {selected.label}</h2>
                      <p className="mt-2 max-w-2xl text-sm text-slate-400">{selected.description}</p>
                    </div>
                    <span className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wide ${support.kind === 'spice' ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200' : 'border-amber-500/40 bg-amber-500/10 text-amber-200'}`}>
                      {support.kind === 'design-only' ? 'Design symbol · no model' : `${support.accuracy} simulation model`}
                    </span>
                  </div>
                  <p className="mt-3 rounded-md bg-slate-900 px-3 py-2 text-xs leading-relaxed text-slate-300">{support.detail}</p>
                </header>

                <section className="grid gap-3 sm:grid-cols-2">
                  <article className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
                    <h3 className="text-sm font-semibold text-cyan-200">Internal structure</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-300">{reference.structure}</p>
                  </article>
                  <article className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
                    <h3 className="text-sm font-semibold text-cyan-200">How it works</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-300">{reference.workingPrinciple}</p>
                  </article>
                </section>

                <section className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
                  <h3 className="mb-3 text-sm font-semibold text-cyan-200">Pin reference</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[560px] text-left text-xs">
                      <thead><tr className="border-b border-slate-700 text-slate-500"><th className="pb-2 pr-3">Pin</th><th className="pb-2 pr-3">Direction</th><th className="pb-2">Function</th></tr></thead>
                      <tbody>
                        {reference.pins.map(item => (
                          <tr key={`${item.terminal}-${item.name}`} className="border-b border-slate-800/70 last:border-0 align-top">
                            <td className="py-2 pr-3 font-mono font-bold text-white">{item.name}</td>
                            <td className="py-2 pr-3 capitalize text-cyan-200">{item.direction}</td>
                            <td className="py-2 leading-relaxed text-slate-300">{item.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section className="grid gap-3 sm:grid-cols-2">
                  <article className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
                    <h3 className="text-sm font-semibold text-cyan-200">Characteristics</h3>
                    <ul className="mt-2 space-y-2 text-xs leading-relaxed text-slate-300">{reference.characteristics.map(item => <li key={item} className="flex gap-2"><span className="text-cyan-400">•</span><span>{item}</span></li>)}</ul>
                  </article>
                  <article className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
                    <h3 className="text-sm font-semibold text-cyan-200">Use and design notes</h3>
                    <p className="mt-2 text-xs leading-relaxed text-slate-300"><strong className="text-slate-100">Common uses:</strong> {reference.commonUses}</p>
                    <p className="mt-3 text-xs leading-relaxed text-slate-400"><strong className="text-slate-200">Design notes:</strong> {reference.designNotes}</p>
                  </article>
                </section>
              </div>
            ) : <p className="text-sm text-slate-400">No component guide is available for this entry yet.</p>}
          </main>
        </div>
      </DialogContent>
    </Dialog>
  );
}

