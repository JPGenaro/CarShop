import { useState } from 'react'
import { motion } from 'framer-motion'
import { Lock, Mail, User } from 'lucide-react'
import { useRouter } from 'next/router'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { register } from '../lib/auth'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [dni, setDni] = useState('')
  const [phone, setPhone] = useState('')
  const [address1, setAddress1] = useState('')
  const [address2, setAddress2] = useState('')
  const [city, setCity] = useState('')
  const [province, setProvince] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [error, setError] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})
  const router = useRouter()
  const { login } = useAuth()

  const provinces = [
    'Buenos Aires', 'CABA', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba',
    'Corrientes', 'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja',
    'Mendoza', 'Misiones', 'Neuquén', 'Río Negro', 'Salta', 'San Juan',
    'San Luis', 'Santa Cruz', 'Santa Fe', 'Santiago del Estero',
    'Tierra del Fuego', 'Tucumán'
  ]

  const citiesByProvince = {
    'Buenos Aires': ['La Plata', 'Mar del Plata', 'Bahía Blanca', 'Tandil', 'Pergamino'],
    'CABA': ['CABA'],
    'Catamarca': ['San Fernando del Valle de Catamarca', 'Belén', 'Andalgalá'],
    'Chaco': ['Resistencia', 'Presidencia Roque Sáenz Peña', 'Villa Ángela'],
    'Chubut': ['Rawson', 'Comodoro Rivadavia', 'Trelew', 'Puerto Madryn'],
    'Córdoba': ['Córdoba', 'Villa Carlos Paz', 'Río Cuarto', 'Villa María'],
    'Corrientes': ['Corrientes', 'Goya', 'Mercedes'],
    'Entre Ríos': ['Paraná', 'Concordia', 'Gualeguaychú'],
    'Formosa': ['Formosa', 'Clorinda', 'Pirané'],
    'Jujuy': ['San Salvador de Jujuy', 'Palpalá', 'Perico'],
    'La Pampa': ['Santa Rosa', 'General Pico', 'Toay'],
    'La Rioja': ['La Rioja', 'Chilecito', 'Aimogasta'],
    'Mendoza': ['Mendoza', 'San Rafael', 'Godoy Cruz', 'Luján de Cuyo'],
    'Misiones': ['Posadas', 'Oberá', 'Eldorado'],
    'Neuquén': ['Neuquén', 'Cutral Có', 'Zapala'],
    'Río Negro': ['Viedma', 'Bariloche', 'General Roca'],
    'Salta': ['Salta', 'Orán', 'Tartagal'],
    'San Juan': ['San Juan', 'Rawson', 'Chimbas'],
    'San Luis': ['San Luis', 'Villa Mercedes', 'Merlo'],
    'Santa Cruz': ['Río Gallegos', 'Caleta Olivia', 'El Calafate'],
    'Santa Fe': ['Santa Fe', 'Rosario', 'Rafaela', 'Venado Tuerto'],
    'Santiago del Estero': ['Santiago del Estero', 'La Banda', 'Termas de Río Hondo'],
    'Tierra del Fuego': ['Ushuaia', 'Río Grande', 'Tolhuin'],
    'Tucumán': ['San Miguel de Tucumán', 'Tafí Viejo', 'Concepción'],
  }

  function onlyDigits(value) {
    return value.replace(/\D/g, '')
  }

  function validate() {
    const errors = {}
    if (!username || username.length < 3) errors.username = 'Usuario mínimo 3 caracteres.'
    if (!firstName || firstName.length < 2) errors.firstName = 'Nombre mínimo 2 caracteres.'
    if (!lastName || lastName.length < 2) errors.lastName = 'Apellido mínimo 2 caracteres.'
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Email inválido.'
    if (!password || password.length < 8) errors.password = 'Contraseña mínimo 8 caracteres.'
    if (!dni || dni.length < 7) errors.dni = 'DNI entre 7 y 12 dígitos.'
    if (!phone || phone.length < 7) errors.phone = 'Teléfono entre 7 y 15 dígitos.'
    if (!address1) errors.address1 = 'Dirección requerida.'
    if (!province) errors.province = 'Provincia requerida.'
    if (!city) errors.city = 'Ciudad requerida.'
    if (!postalCode || postalCode.length < 3) errors.postalCode = 'Código postal inválido.'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    if (!validate()) return
    try {
      await register({
        username,
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        dni,
        phone,
        address_line1: address1,
        address_line2: address2,
        city,
        province,
        postal_code: postalCode,
        country: 'Argentina',
      })
      // auto-login using auth context
      await login(username, password)
      router.push('/')
    } catch (err) {
      console.error(err)
      setError(err.detail || 'Error registrando usuario')
      if (err) {
        const mapped = {}
        if (err.username) mapped.username = err.username?.[0]
        if (err.email) mapped.email = err.email?.[0]
        if (err.password) mapped.password = err.password?.[0]
        if (err.dni) mapped.dni = err.dni?.[0]
        if (err.phone) mapped.phone = err.phone?.[0]
        if (err.address_line1) mapped.address1 = err.address_line1?.[0]
        if (err.city) mapped.city = err.city?.[0]
        if (err.province) mapped.province = err.province?.[0]
        if (err.postal_code) mapped.postalCode = err.postal_code?.[0]
        setFieldErrors(prev => ({ ...prev, ...mapped }))
      }
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#121212]">
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-14 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="max-w-md w-full rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-2xl shadow-black/50"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-gray-400 text-center">Nueva cuenta</p>
          <h1 className="text-2xl font-bold mb-6 text-center text-gray-100">Crear cuenta</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className={`rounded-xl border ${fieldErrors.username ? 'border-red-500/60' : 'border-white/10'} bg-black/40 px-4 py-3 flex items-center gap-3`}>
              <User size={18} className="text-orange-400" />
              <input
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="bg-transparent outline-none text-gray-100 placeholder:text-gray-500 w-full"
                placeholder="Usuario"
                maxLength={30}
              />
            </div>
            {fieldErrors.username && <p className="text-sm text-red-400">{fieldErrors.username}</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className={`rounded-xl border ${fieldErrors.firstName ? 'border-red-500/60' : 'border-white/10'} bg-black/40 px-4 py-3 flex items-center gap-3`}>
                <input
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  className="bg-transparent outline-none text-gray-100 placeholder:text-gray-500 w-full"
                  placeholder="Nombre"
                  maxLength={60}
                />
              </div>
              <div className={`rounded-xl border ${fieldErrors.lastName ? 'border-red-500/60' : 'border-white/10'} bg-black/40 px-4 py-3 flex items-center gap-3`}>
                <input
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  className="bg-transparent outline-none text-gray-100 placeholder:text-gray-500 w-full"
                  placeholder="Apellido"
                  maxLength={60}
                />
              </div>
            </div>
            {(fieldErrors.firstName || fieldErrors.lastName) && (
              <p className="text-sm text-red-400">{fieldErrors.firstName || fieldErrors.lastName}</p>
            )}
            <div className={`rounded-xl border ${fieldErrors.email ? 'border-red-500/60' : 'border-white/10'} bg-black/40 px-4 py-3 flex items-center gap-3`}>
              <Mail size={18} className="text-orange-400" />
              <input
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="bg-transparent outline-none text-gray-100 placeholder:text-gray-500 w-full"
                placeholder="Email"
                maxLength={120}
              />
            </div>
            {fieldErrors.email && <p className="text-sm text-red-400">{fieldErrors.email}</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className={`rounded-xl border ${fieldErrors.dni ? 'border-red-500/60' : 'border-white/10'} bg-black/40 px-4 py-3 flex items-center gap-3`}>
                <input
                  value={dni}
                  onChange={e => setDni(onlyDigits(e.target.value))}
                  className="bg-transparent outline-none text-gray-100 placeholder:text-gray-500 w-full"
                  placeholder="DNI"
                  inputMode="numeric"
                  pattern="\d*"
                  maxLength={12}
                />
              </div>
              <div className={`rounded-xl border ${fieldErrors.phone ? 'border-red-500/60' : 'border-white/10'} bg-black/40 px-4 py-3 flex items-center gap-3`}>
                <input
                  value={phone}
                  onChange={e => setPhone(onlyDigits(e.target.value))}
                  className="bg-transparent outline-none text-gray-100 placeholder:text-gray-500 w-full"
                  placeholder="Teléfono"
                  inputMode="numeric"
                  pattern="\d*"
                  maxLength={15}
                />
              </div>
            </div>
            {(fieldErrors.dni || fieldErrors.phone) && (
              <p className="text-sm text-red-400">{fieldErrors.dni || fieldErrors.phone}</p>
            )}
            <div className={`rounded-xl border ${fieldErrors.password ? 'border-red-500/60' : 'border-white/10'} bg-black/40 px-4 py-3 flex items-center gap-3`}>
              <Lock size={18} className="text-orange-400" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="bg-transparent outline-none text-gray-100 placeholder:text-gray-500 w-full"
                placeholder="Contraseña"
                maxLength={128}
              />
            </div>
            {fieldErrors.password && <p className="text-sm text-red-400">{fieldErrors.password}</p>}
            <div className={`rounded-xl border ${fieldErrors.address1 ? 'border-red-500/60' : 'border-white/10'} bg-black/40 px-4 py-3 flex items-center gap-3`}>
              <input
                value={address1}
                onChange={e => setAddress1(e.target.value)}
                className="bg-transparent outline-none text-gray-100 placeholder:text-gray-500 w-full"
                placeholder="Calle y número"
                maxLength={200}
              />
            </div>
            {fieldErrors.address1 && <p className="text-sm text-red-400">{fieldErrors.address1}</p>}
            <div className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 flex items-center gap-3">
              <input
                value={address2}
                onChange={e => setAddress2(e.target.value)}
                className="bg-transparent outline-none text-gray-100 placeholder:text-gray-500 w-full"
                placeholder="Piso / Depto (opcional)"
                maxLength={200}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className={`rounded-xl border ${fieldErrors.province ? 'border-red-500/60' : 'border-white/10'} bg-black/40 px-4 py-3 flex items-center gap-3`}>
                <select
                  value={province}
                  onChange={e => { setProvince(e.target.value); setCity('') }}
                  className="bg-black/40 outline-none text-gray-100 w-full"
                >
                  <option value="">Provincia</option>
                  {provinces.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div className={`rounded-xl border ${fieldErrors.city ? 'border-red-500/60' : 'border-white/10'} bg-black/40 px-4 py-3 flex items-center gap-3`}>
                <select
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="bg-black/40 outline-none text-gray-100 w-full"
                  disabled={!province}
                >
                  <option value="">Ciudad</option>
                  {(citiesByProvince[province] || []).map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className={`rounded-xl border ${fieldErrors.postalCode ? 'border-red-500/60' : 'border-white/10'} bg-black/40 px-4 py-3 flex items-center gap-3`}>
                <input
                  value={postalCode}
                  onChange={e => setPostalCode(onlyDigits(e.target.value))}
                  className="bg-transparent outline-none text-gray-100 placeholder:text-gray-500 w-full"
                  placeholder="Código Postal"
                  inputMode="numeric"
                  pattern="\d*"
                  maxLength={10}
                />
              </div>
            </div>
            {(fieldErrors.city || fieldErrors.province || fieldErrors.postalCode) && (
              <p className="text-sm text-red-400">{fieldErrors.city || fieldErrors.province || fieldErrors.postalCode}</p>
            )}
            <div className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 flex items-center gap-3">
              <input
                value="Argentina"
                disabled
                className="bg-transparent outline-none text-gray-400 w-full"
                placeholder="País"
              />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button className="w-full bg-gradient-to-r from-red-600 to-orange-500 text-white px-4 py-2 rounded-md shadow-lg shadow-red-500/20 hover:opacity-95">
              Registrar
            </button>
          </form>
        </motion.div>
      </main>
      <Footer />
    </div>
  )
}
