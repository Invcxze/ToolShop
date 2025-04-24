// src/pages/CartPage.tsx
import React, { useState, useEffect } from 'react'
import { Button, Card, Row, Col, Typography, message } from 'antd'
import { useNavigate } from 'react-router-dom'

const { Title, Paragraph } = Typography

// Примерный тип товара
interface Product {
  id: number
  name: string
  description: string
  price: number
  image: string
}

const CartPage = () => {
  const [cart, setCart] = useState<Product[]>([]) // Состояние для хранения товаров в корзине
  const navigate = useNavigate()

  const fetchCart = async () => {
    const token = localStorage.getItem('token');
  
    if (!token) {
      message.error('Пожалуйста, войдите в систему');
      navigate('/login');
      return;
    }
  
    try {
      const response = await fetch('http://localhost:8000/api/shop/cart', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Убедитесь, что передаете токен в формате "Bearer <token>"
        },
      });
  
      if (!response.ok) {
        throw new Error('Не удалось загрузить данные корзины');
      }
  
      const data = await response.json();
      setCart(data);
    } catch (error) {
      message.error('Ошибка при загрузке корзины');
    }
  };
  const handleRemoveFromCart = async (productId: number) => {
    try {
      const response = await fetch(`http://localhost:8000/api/shop/cart/${productId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`, // Добавляем токен в заголовок
        },
      })

      if (!response.ok) {
        throw new Error('Не удалось удалить товар из корзины')
      }

      message.success('Товар удалён из корзины')
      setCart(cart.filter((product) => product.id !== productId)) // Убираем товар из состояния
    } catch (error) {
      message.error('Ошибка при удалении товара')
    }
  }

  // Функция для оформления заказа
  const handleCheckout = async () => {
    if (cart.length === 0) {
      message.warning('Корзина пуста! Добавьте товары для оформления заказа.')
      return
    }

    try {
      const response = await fetch('http://localhost:8000/api/shop/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ cart }), // Отправляем корзину на сервер
      })

      if (!response.ok) {
        throw new Error('Ошибка при оформлении заказа')
      }

      message.success('Заказ оформлен!')
      setCart([]) // Очищаем корзину после оформления заказа
      navigate('/orders') // Перенаправляем на страницу заказов
    } catch (error) {
      message.error('Ошибка при оформлении заказа')
    }
  }

  // Загружаем корзину при монтировании компонента
  useEffect(() => {
    fetchCart()
  }, [])

  return (
    <div style={{ maxWidth: '1200px', margin: 'auto', padding: '20px' }}>
      <Title level={1}>Корзина</Title>
      <Row gutter={[16, 16]}>
        {cart.map((product) => (
          <Col span={8} key={product.id}>
            <Card
              hoverable
              cover={<img alt={product.name} src={product.image} />}
              actions={[
                <Button type="primary" danger onClick={() => handleRemoveFromCart(product.id)}>
                  Удалить из корзины
                </Button>,
              ]}
            >
              <Title level={4}>{product.name}</Title>
              <Paragraph>{product.description}</Paragraph>
              <Paragraph>Цена: ${product.price}</Paragraph>
            </Card>
          </Col> 
        ))}
      </Row>
      <Button type="primary" onClick={handleCheckout} style={{ marginTop: '20px' }}>
        Оформить заказ
      </Button>
    </div>
  )
}

export default CartPage