import React, { useEffect, useState } from 'react'
import { Button, Card, Row, Col, Typography, message, Tag } from 'antd'
import { useNavigate } from 'react-router-dom'
import employee from '../assets/istockphoto-1167872833-612x612.jpg'

const { Title, Paragraph } = Typography

interface Product {
  id: number
  name: string
  description: string
  price: string
  photo: string | null
  category?: string | null
  manufacturer?: string | null
}

const CartPage: React.FC = () => {
  const [cart, setCart] = useState<Product[]>([])
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  useEffect(() => {
    const fetchCart = async () => {
      if (!token) {
        message.error('Пожалуйста, войдите в систему')
        navigate('/login')
        return
      }
      try {
        const res = await fetch('http://localhost:8000/api/shop/cart', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error()
        const json = await res.json()
        setCart(json.data)
      } catch {
        message.error('Ошибка при загрузке корзины')
      }
    }
    fetchCart()
  }, [])

  const handleRemoveFromCart = async (id: number) => {
    if (!token) {
      message.error('Пожалуйста, войдите в систему')
      navigate('/login')
      return
    }
    try {
      const res = await fetch(`http://localhost:8000/api/shop/cart/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error()
      setCart(prev => prev.filter(p => p.id !== id))
      message.success('Товар удалён из корзины')
    } catch {
      message.error('Ошибка при удалении товара')
    }
  }

  const handleCheckout = async () => {
    if (!token) {
      message.error('Пожалуйста, войдите в систему')
      navigate('/login')
      return
    }
    if (cart.length === 0) {
      message.warning('Корзина пуста!')
      return
    }
    try {
      const res = await fetch('http://localhost:8000/api/shop/order', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error()
      const { data } = await res.json()
      window.location.href = data.checkout_url
    } catch {
      message.error('Ошибка при оформлении заказа')
    }
  }

  const S3_BASE_URL = 'http://localhost:9000/local-bucket-shop/media'
  const getProductImage = (product: Product) => {
    if (!product.photo) return employee
    try {
      new URL(product.photo)
      return product.photo
    } catch {
      return `${S3_BASE_URL}/${product.photo.replace(/^\/+/, '')}`
    }
  }

  return (
    <div style={{ maxWidth: 1200, margin: 'auto', padding: 20 }}>
      <Title level={1}>Корзина</Title>

      <Row gutter={[16, 16]}>
        {cart.length === 0 ? (
          <Col span={24}>
            <Title level={3}>Корзина пуста</Title>
            <Button type="primary" onClick={() => navigate('/products')} style={{ marginTop: 20 }}>
              Перейти к товарам
            </Button>
          </Col>
        ) : (
          cart.map(product => (
            <Col span={8} key={product.id}>
              <Card
                hoverable
                cover={
                  <img
                    alt={product.name}
                    src={getProductImage(product)}
                    style={{
                      objectFit: 'cover',
                      height: 200,
                      width: '100%',
                      borderTopLeftRadius: 4,
                      borderTopRightRadius: 4,
                      backgroundColor: '#f0f0f0',
                    }}
                    onError={e => {
                      ;(e.currentTarget as HTMLImageElement).src = employee
                      e.currentTarget.style.objectFit = 'contain'
                    }}
                  />
                }
                actions={[
                  <Button danger onClick={() => handleRemoveFromCart(product.id)} key="delete">
                    Удалить
                  </Button>,
                ]}
              >
                <Title level={4}>{product.name}</Title>

                <div style={{ marginBottom: 8 }}>
                  {product.category && (
                    <Tag color="blue" style={{ marginRight: 4 }}>
                      {product.category}
                    </Tag>
                  )}
                  {product.manufacturer && <Tag color="volcano">{product.manufacturer}</Tag>}
                </div>

                {/* описание */}
                <Paragraph ellipsis={{ rows: 3 }} style={{ marginBottom: 8, minHeight: 66 }}>
                  {product.description}
                </Paragraph>

                <Paragraph strong>Цена: ${parseFloat(product.price).toFixed(2)}</Paragraph>
              </Card>
            </Col>
          ))
        )}
      </Row>

      {cart.length > 0 && (
        <Button type="primary" onClick={handleCheckout} style={{ marginTop: 20 }}>
          Оформить заказ
        </Button>
      )}
    </div>
  )
}

export default CartPage