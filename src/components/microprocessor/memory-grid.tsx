'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Database, Search, Edit2 } from 'lucide-react';

interface MemoryGridProps {
  memory: Uint8Array;
  currentPC: number;
  hlAddress: number;
  onMemoryChange: (address: number, value: number) => void;
}

export function MemoryGrid({ memory, currentPC, hlAddress, onMemoryChange }: MemoryGridProps) {
  const [startAddr, setStartAddr] = useState(0x0800);
  const [searchHex, setSearchHex] = useState('0800');

  const rows = 16; // 16 rows * 8 bytes = 128 bytes visible
  const bytesPerRow = 8;

  const handleJump = () => {
    const parsed = parseInt(searchHex, 16);
    if (!isNaN(parsed) && parsed >= 0 && parsed <= 0xFFFF) {
      setStartAddr(Math.floor(parsed / 8) * 8);
    }
  };

  const toHex4 = (n: number) => (n & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
  const toHex2 = (n: number) => (n & 0xFF).toString(16).toUpperCase().padStart(2, '0');

  return (
    <Card className="bg-slate-950/80 border-slate-800 text-white backdrop-blur-md shadow-2xl">
      <CardHeader className="py-2.5 px-4 border-b border-slate-800 flex flex-row items-center justify-between bg-slate-900/50">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-emerald-400" />
          <CardTitle className="text-xs font-bold font-mono tracking-wider text-emerald-300">
            64KB MEMORY HEX MAP (RAM / ROM)
          </CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <Input
            value={searchHex}
            onChange={(e) => setSearchHex(e.target.value)}
            placeholder="Addr (e.g. 0800)"
            className="w-24 h-7 text-xs font-mono bg-slate-900 border-slate-700 text-emerald-400"
          />
          <Button onClick={handleJump} size="sm" variant="secondary" className="h-7 text-xs px-2">
            <Search className="h-3 w-3 mr-1" /> Jump
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-3 font-mono text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] text-slate-400 border-b border-slate-800 pb-1">
                <th className="py-1 px-2">Address</th>
                {Array.from({ length: bytesPerRow }).map((_, i) => (
                  <th key={i} className="py-1 px-1.5 text-center font-bold text-slate-300">
                    +{toHex2(i)}
                  </th>
                ))}
                <th className="py-1 px-2 text-center">ASCII</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: rows }).map((_, rowIndex) => {
                const rowBase = startAddr + rowIndex * bytesPerRow;
                if (rowBase > 0xFFFF) return null;

                const rowBytes = Array.from({ length: bytesPerRow }).map((_, colIndex) => {
                  const addr = rowBase + colIndex;
                  return { addr, val: addr <= 0xFFFF ? memory[addr] : 0 };
                });

                return (
                  <tr key={rowIndex} className="border-b border-slate-900/60 hover:bg-slate-900/40">
                    <td className="py-1 px-2 font-bold text-cyan-400">{toHex4(rowBase)}H</td>
                    {rowBytes.map(({ addr, val }) => {
                      const isPC = addr === currentPC;
                      const isHL = addr === hlAddress;
                      const isNonZero = val !== 0;

                      return (
                        <td
                          key={addr}
                          className="py-1 px-1.5 text-center cursor-pointer select-none"
                          onClick={() => {
                            const input = prompt(`Enter hex byte for address ${toHex4(addr)}H (current: ${toHex2(val)}):`, toHex2(val));
                            if (input !== null) {
                              const parsed = parseInt(input, 16);
                              if (!isNaN(parsed)) {
                                onMemoryChange(addr, parsed & 0xFF);
                              }
                            }
                          }}
                          title={`Address: ${toHex4(addr)}H | Click to edit byte`}
                        >
                          <span
                            className={`px-1.5 py-0.5 rounded text-[11px] font-mono inline-block ${
                              isPC
                                ? 'bg-cyan-500 text-black font-black shadow-[0_0_8px_#06B6D4]'
                                : isHL
                                ? 'bg-amber-500 text-black font-black'
                                : isNonZero
                                ? 'text-emerald-400 font-bold bg-emerald-950/40'
                                : 'text-slate-500'
                            }`}
                          >
                            {toHex2(val)}
                          </span>
                        </td>
                      );
                    })}
                    <td className="py-1 px-2 text-center text-slate-400 text-[10px]">
                      {rowBytes.map(({ val }) => (val >= 32 && val <= 126 ? String.fromCharCode(val) : '.')).join('')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
