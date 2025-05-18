import React, { useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { message, Spin } from 'antd'

const SuccessPage: React.FC = () => {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  useEffect(() => {
    const confirmPayment = async () => {
      const sessionId = params.get('session_id')
      if (!sessionId) return navigate('/orders')

      try {
        const res = await fetch(`http://localhost:8000/api/shop/payment-status/${sessionId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error()
        message.success('Платёж подтверждён')
      } catch {
        message.error('Не удалось подтвердить платёж')
      } finally {
        navigate('/orders')
      }
    }
    confirmPayment()
  }, [])

  return <Spin tip="Проверяем платёж…" fullscreen />
}

export default SuccessPage