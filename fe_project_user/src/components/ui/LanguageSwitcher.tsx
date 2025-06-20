'use client';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

const languages = [
  {
    code: 'vi',
    label: 'VIE',
    flag: 'https://flagcdn.com/w40/vn.png',
  },
  {
    code: 'en',
    label: 'ENG',
    flag: 'https://flagcdn.com/w40/gb.png',
  },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(languages[0]);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const changeLanguage = (lang: typeof selected) => {
    i18n.changeLanguage(lang.code);
    localStorage.setItem('i18nextLng', lang.code);
    setSelected(lang);
    setOpen(false);
  };

  useEffect(() => {
    const savedLang = localStorage.getItem('i18nextLng');
    const matched = languages.find((l) => l.code === savedLang);
    if (matched) setSelected(matched);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Nút chính */}
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-2 rounded-md px-2 py-1 bg-white hover:bg-gray-100"
      >
        <img src={selected.flag} alt={selected.code} className="w-5 h-5 rounded-sm" />
        <span className="font-medium text-sm">{selected.label}</span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 z-10 mt-2 w-24 rounded-md shadow-lg bg-white border border-gray-200">
          <ul className="py-1">
            {languages.map((lang) => (
              <li
                key={lang.code}
                onClick={() => changeLanguage(lang)}
                className={`flex items-center gap-2 px-2 py-1.5 cursor-pointer text-sm
                ${lang.code === selected.code ? 'bg-orange-200 font-semibold' : 'hover:bg-gray-100'}`}
              >
                <img src={lang.flag} alt={lang.code} className="w-5 h-5 rounded-sm" />
                {lang.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
