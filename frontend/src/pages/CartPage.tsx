import React, { useEffect, useState } from 'react'
import { Button, Card, Row, Col, Typography, message, Tag, Grid, Space } from 'antd'
import { useNavigate } from 'react-router-dom'
import default_product_photo from '../assets/guitar.jpeg'
const BASE_URL = import.meta.env.VITE_API_BASE_URL
import { DeleteOutlined, ArrowLeftOutlined } from '@ant-design/icons'
const { Title, Paragraph } = Typography
const { useBreakpoint } = Grid

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
  const screens = useBreakpoint()
  const token = localStorage.getItem('token')

  useEffect(() => {
    const fetchCart = async () => {
      if (!token) {
        message.error('Пожалуйста, войдите в систему')
        navigate('/login')
        return
      }
      try {
        const res = await fetch(`${BASE_URL}/shop/cart`, {
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
      const res = await fetch(`${BASE_URL}/shop/cart/${id}`, {
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
      const res = await fetch(`${BASE_URL}/shop/order`, {
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
    if (!product.photo) return default_product_photo
    try {
      new URL(product.photo)
      return product.photo
    } catch {
      return `${S3_BASE_URL}/${product.photo.replace(/^\/+/, '')}`
    }
  }

  // Стили для повторного использования
  const cardImageStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    padding: screens.xs ? 4 : 8
  }

  const priceStyle: React.CSSProperties = {
    fontSize: screens.xs ? 16 : 18,
    color: '#1890ff',
    margin: 0,
    fontWeight: 600
  }

  return (
    <div style={{
      maxWidth: 1200,
      margin: 'auto',
      padding: screens.xs ? '16px 8px' : 24,
      minHeight: 'calc(100vh - 64px)'
    }}>
      <Space style={{ width: '100%', marginBottom: 24 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          type="text"
          size={screens.xs ? 'middle' : 'large'}
        />
        <Title
          level={screens.xs ? 3 : 1}
          style={{
            margin: 0,
            flex: 1,
            textAlign: screens.xs ? 'center' : 'left'
          }}
        >
          🛒 Корзина
        </Title>
      </Space>

      <Row gutter={[screens.xs ? 8 : 16, screens.xs ? 16 : 24]}>
        {cart.length === 0 ? (
          <Col span={24} style={{ textAlign: 'center' }}>
            <div style={{
              padding: '40px 16px',
              borderRadius: 8,
              backgroundColor: '#fafafa',
              marginBottom: 24
            }}>
              <Title level={4} style={{
                color: 'rgba(0,0,0,0.45)',
                marginBottom: 24
              }}>
                Ваша корзина пуста
              </Title>
              <Button
                type="primary"
                onClick={() => navigate('/products')}
                size="large"
                style={{
                  width: screens.xs ? '100%' : 'auto',
                  height: 48,
                  fontSize: 16
                }}
              >
                Перейти к товарам
              </Button>
            </div>
          </Col>
        ) : (
          cart.map(product => (
            <Col
              key={product.id}
              xs={24}
              sm={12}
              md={12}
              lg={8}
              xl={6}
              style={{
                marginBottom: screens.xs ? 8 : 16,
                padding: screens.xs ? '0 4px' : '0 8px'
              }}
            >
              <Card
                hoverable
                cover={
                  <div style={{
                    position: 'relative',
                    paddingTop: '75%',
                    backgroundColor: '#fafafa',
                    borderTopLeftRadius: 8,
                    borderTopRightRadius: 8,
                    overflow: 'hidden'
                  }}>
                    <img
                      alt={product.name}
                      src={getProductImage(product)}
                      style={cardImageStyle}
                      onError={e => {
                        const target = e.currentTarget as HTMLImageElement
                        target.src = default_product_photo
                        target.style.objectFit = 'contain'
                        target.style.padding = '20px'
                      }}
                    />
                  </div>
                }
                actions={[
                  <Button
                    danger
                    onClick={() => handleRemoveFromCart(product.id)}
                    key="delete"
                    size="middle"
                    icon={<DeleteOutlined />}
                    block
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      height: 40,
                      fontSize: screens.xs ? 14 : 16
                    }}
                  >
                    {!screens.xs && 'Удалить'}
                  </Button>
                ]}
                styles={{
                  body: {
                    padding: screens.xs ? 12 : 16,
                    height: screens.xs ? 'auto' : 200,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }
                }}
              >
                <div>
                  <Title
                    level={5}
                    ellipsis={{ rows: 1 }}
                    style={{
                      marginBottom: 8,
                      fontSize: screens.xs ? 16 : 18
                    }}
                  >
                    {product.name}
                  </Title>

                  <Space size={4} wrap style={{ marginBottom: 8 }}>
                    {product.category && (
                      <Tag
                        color="geekblue"
                        style={{
                          margin: 0,
                          fontSize: screens.xs ? 12 : 14,
                          borderRadius: 4
                        }}
                      >
                        {product.category}
                      </Tag>
                    )}
                    {product.manufacturer && (
                      <Tag
                        color="volcano"
                        style={{
                          margin: 0,
                          fontSize: screens.xs ? 12 : 14,
                          borderRadius: 4
                        }}
                      >
                        {product.manufacturer}
                      </Tag>
                    )}
                  </Space>

                  <Paragraph
                    ellipsis={{
                      rows: screens.xs ? 2 : 3,
                      expandable: true,
                      symbol: 'Подробнее'
                    }}
                    style={{
                      fontSize: screens.xs ? 14 : 16,
                      color: 'rgba(0,0,0,0.65)',
                      marginBottom: 8
                    }}
                  >
                    {product.description}
                  </Paragraph>
                </div>

                <Paragraph
                  style={priceStyle}
                >
                  ${parseFloat(product.price).toFixed(2)}
                </Paragraph>
              </Card>
            </Col>
          ))
        )}
      </Row>

      {cart.length > 0 && (
        <div style={{
          position: 'sticky',
          bottom: 0,
          backgroundColor: '#fff',
          padding: '16px 0',
          boxShadow: '0 -2px 8px rgba(0,0,0,0.05)',
          marginTop: 24
        }}>
          <div style={{
            maxWidth: 1200,
            margin: '0 auto',
            textAlign: 'center'
          }}>
            <Button
              type="primary"
              onClick={handleCheckout}
              size="large"
              style={{
                width: screens.xs ? '100%' : 'auto',
                padding: '0 40px',
                height: 48,
                fontSize: 16,
                fontWeight: 600
              }}
            >
              🚀 Оформить заказ ({cart.length})
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default CartPage