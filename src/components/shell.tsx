'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { ArrowUpRight, X, Plus } from 'lucide-react';
import { Mark } from './logo';
const links = [
  ['/', 'Home'],
  ['/earth', 'Earth'],
  ['/lab', 'Laboratory'],
  ['/compare', 'Compare'],
  ['/optimize', 'Optimize'],
  ['/case-study', 'Harvey'],
  ['/methodology', 'Method'],
];
export function Header() {
  const path = usePathname(),
    [open, setOpen] = useState(false),
    dialog = useRef<HTMLDialogElement>(null),
    toggle = useRef<HTMLButtonElement>(null);
  function close() {
    dialog.current?.close();
    setOpen(false);
    toggle.current?.focus();
  }
  useEffect(() => {
    if (open) dialog.current?.showModal();
  }, [open]);
  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <header className={`floating-header ${path === '/' ? 'over-ocean' : ''}`}>
        <Link className="brand" href="/" aria-label="BASIN home">
          <Mark size={33} />
          {path !== '/' && <span>BASIN</span>}
        </Link>
        <div className="nav-actions">
          {path !== '/lab' && (
            <Link className="lab-shortcut" href="/lab">
              Enter laboratory <ArrowUpRight size={14} />
            </Link>
          )}
          <button
            ref={toggle}
            className="nav-toggle"
            aria-label="Open navigation"
            aria-expanded={open}
            onClick={() => setOpen(true)}
          >
            <Plus size={22} />
          </button>
        </div>
      </header>
      <dialog
        ref={dialog}
        className="navigation-dialog"
        onCancel={(e) => {
          e.preventDefault();
          close();
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
      >
        <div className="nav-overlay">
          <div className="overlay-top">
            <Mark size={40} />
            <button className="nav-toggle" aria-label="Close navigation" onClick={close}>
              <X />
            </button>
          </div>
          <nav aria-label="Main navigation">
            {links.map(([href, label], i) => (
              <Link
                key={href}
                href={href}
                aria-current={path === href ? 'page' : undefined}
                onClick={close}
              >
                <span aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                {label}
                <ArrowUpRight />
              </Link>
            ))}
          </nav>
          <div className="overlay-bottom">
            <span>Stormwater modeling · v0.2</span>
            <Link href="/experiments" onClick={close}>
              Experiment records ↗
            </Link>
          </div>
        </div>
      </dialog>
    </>
  );
}
export const disclaimer =
  'Experimental runoff model. Not validated for flood forecasting, emergency decisions, or engineering design.';
export function Footer() {
  return (
    <footer>
      <Link className="footer-brand" href="/">
        <Mark size={26} />
        BASIN
      </Link>
      <Link href="/methodology">Methods & limitations ↗</Link>
      <Link href="/experiments">Experiments ↗</Link>
      <a href="https://github.com/projectsingularity11/basin" target="_blank" rel="noreferrer">
        Source code ↗
      </a>
      <span>v0.2</span>
    </footer>
  );
}
