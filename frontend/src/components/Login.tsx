import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Lock, Building2, User, KeyRound, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import type { Rol } from '@/types/copetran';
import { cn } from '@/utils/cn';

const ROLES: { rol: Rol; etiqueta: string; descripcion: string }[] = [
  { rol: 'CLIENTE', etiqueta: 'Cliente / Pasajero', descripcion: 'Compra tiquetes de pasajeros y consulta envíos (Proceso A)' },
  { rol: 'CAJERO', etiqueta: 'Cajero de Agencia', descripcion: 'Vende tiquetes en taquilla y emite facturas (Proceso A)' },
  { rol: 'OPERARIO', etiqueta: 'Operario de Bodega', descripcion: 'Admite guías y consolida remesas (Proceso C)' },
];

const AGENCIAS = [
  'Bucaramanga — Sede Central / Terminal',
  'Bogotá D.C. — Terminal Salitre',
  'Medellín — Terminal del Norte',
  'Cúcuta — Terminal Central de Transportes',
  'Santa Marta — Agencia Central Costa',
];

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [nombre, setNombre] = useState('');
  const [password, setPassword] = useState('••••••••');
  const [agencia, setAgencia] = useState(AGENCIAS[0]);
  const [rolSeleccionado, setRolSeleccionado] = useState<Rol>('CAJERO');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre.trim()) return;
    login({ nombre: nombre.trim(), rol: rolSeleccionado });
    navigate('/dashboard');
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-900 text-slate-100 font-sans selection:bg-amber-400 selection:text-slate-950">
      {/* ----------------------------------------------------------------- */}
      {/* COLUMNA IZQUIERDA: BRANDING CORPORATIVO SPLIT-SCREEN */}
      {/* ----------------------------------------------------------------- */}
      <div className="relative lg:w-1/2 flex flex-col justify-between p-8 sm:p-14 bg-gradient-to-br from-slate-950 via-copetran-700 to-blue-950 overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-800">
        {/* Luces y patrón de fondo */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#60a5fa_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-500/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-amber-500/15 blur-[120px] rounded-full pointer-events-none" />

        {/* Encabezado superior */}
        <div className="relative z-10 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-amber-400 transition bg-slate-900/60 backdrop-blur px-3.5 py-2 rounded-xl border border-slate-800 shadow-sm"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Volver a la página principal
          </Link>
          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
            Portal Oficial
          </span>
        </div>

        {/* Centro de la columna izquierda */}
        <div className="relative z-10 my-12 lg:my-0 max-w-lg">
          <div className="h-20 w-20 rounded-3xl bg-white p-2 shadow-2xl shadow-blue-500/30 mb-6 flex items-center justify-center overflow-hidden">
            <img
              src="/assets/copetran-square.png"
              alt="Copetran"
              className="h-full w-full object-cover rounded-2xl"
            />
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            Sistema Integrado de{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-300">
              Operaciones
            </span>
          </h1>

          <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed">
            Plataforma corporativa para la gestión de venta de tiquetes intermunicipales (ECU-01), admisión y
            consolidación de mensajería (ECU-02) y control operativo nacional.
          </p>

          <div className="mt-8 space-y-3.5 text-xs text-slate-300">
            <div className="flex items-center gap-3 bg-slate-900/50 backdrop-blur-sm p-3 rounded-xl border border-slate-800">
              <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0" />
              <span>Control de acceso por cargo y perfil de usuario autenticado (RNF01)</span>
            </div>
            <div className="flex items-center gap-3 bg-slate-900/50 backdrop-blur-sm p-3 rounded-xl border border-slate-800">
              <Lock className="h-5 w-5 text-amber-400 shrink-0" />
              <span>Bloqueo temporal de sillas y control de concurrencia en tiempo real (RF03)</span>
            </div>
            <div className="flex items-center gap-3 bg-slate-900/50 backdrop-blur-sm p-3 rounded-xl border border-slate-800">
              <Sparkles className="h-5 w-5 text-blue-400 shrink-0" />
              <span>Trazabilidad de estados paramétricos de tiquetes y guías de envío</span>
            </div>
          </div>
        </div>

        {/* Pie de columna izquierda */}
        <div className="relative z-10 text-[11px] text-slate-400 pt-6 border-t border-slate-800/80 flex items-center justify-between">
          <p>© {new Date().getFullYear()} Copetran — Todos los derechos reservados.</p>
          <span className="font-semibold text-slate-300">Patrones de Diseño de Software</span>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* COLUMNA DERECHA: FORMULARIO DE INGRESO */}
      {/* ----------------------------------------------------------------- */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-slate-950">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-7 sm:p-9 shadow-2xl shadow-black/50">
          <div className="mb-6">
            <div className="h-10 mb-4 flex items-center">
              <img
                src="/assets/copetran-horizontal.png"
                alt="Copetran Logo"
                className="h-9 w-auto object-contain"
              />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">Acceso al Sistema</h2>
            <p className="mt-1 text-xs text-slate-400">
              Ingresa tus credenciales y selecciona el rol operativo con el que deseas ingresar al workspace.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nombre de usuario */}
            <div>
              <label htmlFor="nombre" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-copetran-500" />
                Nombre del Operador o Pasajero
              </label>
              <input
                id="nombre"
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Laura Gómez"
                className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-sm font-semibold text-white placeholder:text-slate-500 focus:border-copetran-500 focus:ring-2 focus:ring-copetran-500/20 focus:outline-none transition"
                required
              />
            </div>

            {/* Contraseña simulada */}
            <div>
              <label htmlFor="pass" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                <KeyRound className="h-3.5 w-3.5 text-amber-400" />
                Contraseña Corporativa (Simulada)
              </label>
              <input
                id="pass"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-sm font-semibold text-white focus:border-copetran-500 focus:ring-2 focus:ring-copetran-500/20 focus:outline-none transition"
                required
              />
            </div>

            {/* Terminal / Agencia */}
            <div>
              <label htmlFor="agencia" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-copetran-500" />
                Agencia / Terminal de Despacho
              </label>
              <select
                id="agencia"
                value={agencia}
                onChange={(e) => setAgencia(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-sm font-semibold text-white focus:border-copetran-500 focus:ring-2 focus:ring-copetran-500/20 focus:outline-none transition"
              >
                {AGENCIAS.map((ag) => (
                  <option key={ag} value={ag} className="bg-slate-900 text-white">
                    {ag}
                  </option>
                ))}
              </select>
            </div>

            {/* Selector de Rol (manteniendo estrictamente los 3 roles existentes) */}
            <div>
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Rol del Sistema (Sección 1 del Parcial)
              </span>
              <div className="space-y-2">
                {ROLES.map(({ rol, etiqueta, descripcion }) => (
                  <button
                    key={rol}
                    type="button"
                    onClick={() => setRolSeleccionado(rol)}
                    className={cn(
                      'w-full rounded-xl border p-3 text-left text-sm transition flex flex-col',
                      rolSeleccionado === rol
                        ? 'border-copetran-500 bg-copetran-600/20 ring-1 ring-copetran-500'
                        : 'border-slate-800 bg-slate-850 hover:border-slate-700 hover:bg-slate-800/60',
                    )}
                  >
                    <span className="font-bold text-white flex items-center justify-between">
                      {etiqueta}
                      {rolSeleccionado === rol && (
                        <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                      )}
                    </span>
                    <span className="mt-0.5 text-xs text-slate-400 leading-snug">{descripcion}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-6 rounded-xl bg-gradient-to-r from-copetran-600 via-blue-600 to-copetran-700 hover:from-copetran-700 hover:to-blue-800 text-white font-bold py-3 text-sm uppercase tracking-wider shadow-lg shadow-blue-600/30 transition transform active:scale-98"
            >
              Ingresar al Workspace
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
