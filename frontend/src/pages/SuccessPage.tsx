import React, { useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { message, Spin } from 'antd'

const SuccessPage: React.FC = () => {
  const [params]   = useSearchParams();
  const navigate   = useNavigate();
  const token      = localStorage.getItem('token');

  useEffect(() => {
    const controller = new AbortController();
    const confirm = async () => {
      const id = params.get('session_id');
      if (!id) return navigate('/orders', { replace: true });

      try {
        const res = await fetch(
          `/api/shop/payment-status/${id}`,
          { headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal }
        );
        if (!res.ok) throw new Error(await res.text());

        const { status } = await res.json();
        if (status === 'paid') message.success('Платёж подтверждён');
        else                   message.info   ('Платёж обрабатывается…');
      } catch (e) {
        message.error('Не удалось подтвердить платёж');
      } finally {
        navigate('/orders');
      }
    };

    confirm();
    return () => controller.abort();
  }, []);

  return <Spin tip="Проверяем платёж…" fullscreen />;
};
export default SuccessPage