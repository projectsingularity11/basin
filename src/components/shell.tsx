'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { ArrowUpRight, X, Menu } from 'lucide-react';
import { Mark } from './logo';
const primary = [
  ['/journeys', 'Expeditions'],
  ['/earth', 'Terrain'],
  ['/lab', 'Experiment runner'],
];
const links = [
  ...primary,
  ['/study', 'Watershed study'],
  ['/compare', 'Compare'],
  ['/optimize', 'Optimize'],
  ['/experiments', 'Experiment records'],
  ['/methodology', 'Methods'],
  ['/about', 'About BASIN'],
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
          <span>BASIN</span>
        </Link>
        <div className="nav-actions">
          <nav className="primary-nav" aria-label="BASIN tools">
            {primary.map(([href, label]) => (
              <Link key={href} href={href} aria-current={path === href ? 'page' : undefined}>
                {label}
              </Link>
            ))}
          </nav>
          <button
            ref={toggle}
            className="nav-toggle"
            aria-label="Open navigation"
            aria-expanded={open}
            onClick={() => setOpen(true)}
          >
            <Menu size={19} />
          </button>
        </div>
      </header>
      <dialog
        ref={dialog}
        className="navigation-dialog"
        aria-label="BASIN navigation"
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
        </div>
      </dialog>
    </>
  );
}
export const disclaimer =
  'Experimental runoff model. Not validated for flood forecasting, emergency decisions, or engineering design.';
