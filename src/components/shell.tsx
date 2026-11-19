'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { ArrowUpRight, X, Plus } from 'lucide-react';
import { Mark } from './logo';
const links = [
  ['/', 'Home'],
  ['/classic#expeditions', 'Flood expeditions'],
  ['/earth', 'Earth'],
  ['/lab', 'Laboratory'],
  ['/compare', 'Compare'],
  ['/optimize', 'Optimize'],
  ['/study', 'Watershed study'],
  ['/case-study', 'Harvey'],
  ['/methodology', 'Methods'],
  ['/about', 'About'],
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
            {links.map(([href, label]) => (
              <Link
                key={href}
                href={href}
                aria-current={path === href ? 'page' : undefined}
                onClick={close}
              >
                {label}
                <ArrowUpRight />
              </Link>
            ))}
          </nav>
          <div className="overlay-bottom">
            <span>Flood mitigation studies</span>
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
