const BASE_URL = import.meta.env.VITE_API_BASE_URL;
export async function login(email: string, password: string) {
  const res = await fetch(`${BASE_URL}/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) throw new Error('Ошибка входа')
  return res.json()
}

export async function register(fio: string, email: string, password: string) {
  const res = await fetch(`${BASE_URL}/sign/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fio, email, password }),
  })
  if (!res.ok) throw new Error('Ошибка регистрации')
  return res.json()
}