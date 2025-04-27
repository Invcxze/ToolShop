import React, { useState, useEffect } from 'react'
import { Button, Card, Row, Col, Typography, message } from 'antd'
import { useNavigate } from 'react-router-dom'

const { Title, Paragraph } = Typography

interface Product {
  id: number
  name: string
  description: string
  price: number
  image: string
}

const CartPage = () => {
  const [cart, setCart] = useState<Product[]>([])
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
          'Authorization': `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        throw new Error('Не удалось загрузить данные корзины');
      }
  
      const data = await response.json();
      setCart(data.data);
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
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })

      if (!response.ok) {
        throw new Error('Не удалось удалить товар из корзины')
      }

      message.success('Товар удалён из корзины')
      setCart(cart.filter((product) => product.id !== productId))
    } catch (error) {
      message.error('Ошибка при удалении товара')
    }
  }

  const handleCheckout = async () => {
    if (cart.length === 0) {
      message.warning('Корзина пуста! Добавьте товары для оформления заказа.')
      return
    }

    try {
      const response = await fetch('http://localhost:8000/api/shop/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ cart }),
      })

      if (!response.ok) {
        throw new Error('Ошибка при оформлении заказа')
      }

      message.success('Заказ оформлен!')
      setCart([])
      navigate('/orders')
    } catch (error) {
      message.error('Ошибка при оформлении заказа')
    }
  }

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

      {/* Если корзина пуста, показываем кнопку "Перейти к выбору товаров" */}
      {cart.length === 0 ? (
        <Button type="primary" onClick={() => navigate('/products')} style={{ marginTop: '20px' }}>
          Перейти к выбору товаров
        </Button>
      ) : (
        <>
          {/* Если в корзине есть товары, показываем кнопку "Оформить заказ" */}
          <Button type="primary" onClick={handleCheckout} style={{ marginTop: '20px' }}>
            Оформить заказ
          </Button>
        </>
      )}
    </div>
  )
}

export default CartPage