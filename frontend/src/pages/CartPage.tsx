import React, { useEffect, useState } from 'react'
import { Button, Card, Row, Col, Typography, message, Tag, Grid } from 'antd'
import { useNavigate } from 'react-router-dom'
import default_product_photo from '../assets/guitar.jpeg'
const BASE_URL = import.meta.env.VITE_API_BASE_URL
import { DeleteOutlined } from '@ant-design/icons'
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

  return (
    <div style={{
      maxWidth: 1200,
      margin: 'auto',
      padding: screens.xs ? 16 : 24,
      minHeight: 'calc(100vh - 64px)'
    }}>
      <Title
        level={screens.xs ? 2 : 1}
        style={{
          marginBottom: screens.xs ? 16 : 24,
          textAlign: 'center'
        }}
      >
        🛒 Корзина
      </Title>

      <Row gutter={[screens.xs ? 8 : 16, screens.xs ? 16 : 24]}>
        {cart.length === 0 ? (
          <Col span={24} style={{ textAlign: 'center' }}>
            <Title level={4} style={{ color: 'rgba(0,0,0,0.45)', marginBottom: 16 }}>
              Ваша корзина пуста
            </Title>
            <Button
              type="primary"
              onClick={() => navigate('/products')}
              size={screens.xs ? 'middle' : 'large'}
              style={{ width: screens.xs ? '100%' : 'auto' }}
            >
              Перейти к товарам
            </Button>
          </Col>
        ) : (
          cart.map(product => (
            <Col
              key={product.id}
              xs={24}
              sm={12}
              md={8}
              lg={8}
              xl={6}
              style={{ marginBottom: screens.xs ? 8 : 16 }}
            >
              <Card
                hoverable
                cover={
                  <div style={{
                    position: 'relative',
                    paddingTop: '56.25%',
                    backgroundColor: '#fafafa',
                    borderTopLeftRadius: 8,
                    borderTopRightRadius: 8,
                    overflow: 'hidden'
                  }}>
                    <img
                      alt={product.name}
                      src={getProductImage(product)}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        padding: screens.xs ? 4 : 8
                      }}
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
                      size={screens.xs ? "small" : "middle"}
                      icon={<DeleteOutlined />}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: screens.xs ? "center" : "flex-start",
                        gap: 8,
                        padding: screens.xs ? "0 8px" : "0 16px",
                        height: screens.xs ? 32 : 40,
                      }}
                    >
                      {!screens.xs && "Удалить"}
                   </Button>
                ]}
                bodyStyle={{
                  padding: screens.xs ? 12 : 16,
                  height: screens.xs ? 'auto' : 240,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <Title
                    level={screens.xs ? 5 : 4}
                    style={{
                      marginBottom: 8,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {product.name}
                  </Title>

                  <div style={{
                    marginBottom: 8,
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 4
                  }}>
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
                  </div>

                  <Paragraph
                    ellipsis={{
                      rows: screens.xs ? 2 : 3,
                      expandable: true,
                      symbol: 'Подробнее'
                    }}
                    style={{
                      fontSize: screens.xs ? 14 : 16,
                      color: 'rgba(0,0,0,0.65)',
                      flexGrow: 1,
                      marginBottom: 8
                    }}
                  >
                    {product.description}
                  </Paragraph>
                </div>

                <Paragraph
                  strong
                  style={{
                    fontSize: screens.xs ? 16 : 18,
                    margin: 0,
                    color: '#1890ff'
                  }}
                >
                  Цена: ${parseFloat(product.price).toFixed(2)}
                </Paragraph>
              </Card>
            </Col>
          ))
        )}
      </Row>

      {cart.length > 0 && (
        <div style={{
          marginTop: screens.xs ? 24 : 32,
          textAlign: 'center'
        }}>
          <Button
            type="primary"
            onClick={handleCheckout}
            size={screens.xs ? 'large' : 'middle'}
            style={{
              width: screens.xs ? '100%' : 'auto',
              paddingLeft: 40,
              paddingRight: 40,
              height: screens.xs ? 48 : 40
            }}
          >
            🚀 Оформить заказ
          </Button>
        </div>
      )}
    </div>
  )
}

export default CartPage