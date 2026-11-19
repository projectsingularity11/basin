'use client';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { useBasin } from './provider';
import { DEFAULT } from '@/engine/model';
import type { GeographicTerrain } from '@/lib/geo/contracts';

export function LibraryStudy({ geographic }: { geographic: GeographicTerrain }) {
  const { setScenario, setRun } = useBasin();
  return (
    <Link
      className="button primary"
      href="/study"
      onClick={() => {
        setScenario({
          ...DEFAULT,
          name: 'Barbara Bush Branch Library',
          size: geographic.size,
          cellSize: geographic.cellSize,
          geographic,
        });
        setRun(null);
      }}
    >
      Reproduce the library study <ArrowUpRight size={15} />
    </Link>
  );
}
