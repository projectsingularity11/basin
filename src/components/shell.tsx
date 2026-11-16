'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Waves, ArrowUpRight, Menu, X } from 'lucide-react';
import { useState } from 'react';
const links = [
  ['/lab', 'Laboratory'],
  ['/compare', 'Compare'],
  ['/optimize', 'Optimize'],
  ['/case-study', 'Case study'],
  ['/methodology', 'Methodology'],
];
export function Header() {
  const path = usePathname(),
    [open, setOpen] = useState(false);
  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <header className="header">
        <Link className="brand" href="/" aria-label="BASIN home">
          <Waves size={29} />
          <span>
            BASIN<span className="brand-dot">.</span>
          </span>
          <small>
            STORMWATER
            <br />
            INTELLIGENCE LABORATORY
          </small>
        </Link>
        <nav aria-label="Main navigation" className={open ? 'nav open' : 'nav'}>
          {links.map(([href, label]) => (
            <Link
              aria-current={path === href ? 'page' : undefined}
              onClick={() => setOpen(false)}
              key={href}
              href={href}
            >
              {label}
              {path === href && <span className="nav-dot" />}
            </Link>
          ))}
          <Link href="/about">
            About <ArrowUpRight size={12} />
          </Link>
        </nav>
        <span className="version">
          <i /> RESEARCH PROTOTYPE <b>v0.1</b>
        </span>
        <button
          className="icon-button menu"
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Close navigation' : 'Open navigation'}
          aria-expanded={open}
        >
          {open ? <X /> : <Menu />}
        </button>
      </header>
    </>
  );
}
export const disclaimer =
  'This prototype uses simplified hydrological models for education and exploratory scenario analysis. It is not validated for flood forecasting, emergency decisions, or engineering design.';
export function Footer() {
  return (
    <footer>
      <Link className="footer-brand" href="/">
        BASIN.
      </Link>
      <p>Understand the water. Question the model.</p>
      <Link href="/methodology">
        Methods & limitations <ArrowUpRight size={13} />
      </Link>
      <Link href="/experiments">
        Experiment validation <ArrowUpRight size={13} />
      </Link>
      <span>EXPERIMENTAL · SYNTHETIC TERRAIN</span>
    </footer>
  );
}
