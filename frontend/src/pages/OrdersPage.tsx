import React, { useEffect, useState } from 'react'
import {
  Button,
  Card,
  Typography,
  message,
  Collapse,
  Tag,
  Grid
} from 'antd'
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ReloadOutlined
} from '@ant-design/icons'
import default_product_photo from '../assets/guitar.jpeg'

const { Title, Paragraph } = Typography
const { Panel } = Collapse
const { useBreakpoint } = Grid

const BASE_URL = import.meta.env.VITE_API_BASE_URL
const S3_BASE_URL = "http://172.19.0.2:9001/local-bucket-shop/media"

interface Product {
  id: number
  name: string
  description: string
  price: string
  photo?: string | null
  category?: string | null
  manufacturer?: string | null
}

interface Order {
  id: number
  order_price: string
  products: Product[]
  status: 'paid' | 'unpaid'
}

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const screens = useBreakpoint()
  const token = localStorage.getItem('token')

  const fetchOrders = async () => {
    if (!token) {
      message.error('Авторизуйтесь!')
      return
    }
    try {
      setLoading(true)
      const res = await fetch(`${BASE_URL}/shop/order`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error()
      const json = await res.json()
      setOrders(json.data)
    } catch {
      message.error('Не удалось загрузить заказы')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

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
        level={screens.xs ? 3 : 1}
        style={{ marginBottom: screens.xs ? 16 : 24, textAlign: 'center' }}
      >
        История заказов
      </Title>

      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <Paragraph style={{ fontSize: screens.xs ? 16 : 18 }}>
            У вас пока нет заказов
          </Paragraph>
          <Button
            type="primary"
            onClick={() => window.location.href = '/products'}
            size={screens.xs ? 'middle' : 'large'}
          >
            Перейти к товарам
          </Button>
        </div>
      ) : (
        <Collapse accordion bordered={false} style={{ background: 'transparent' }}>
          {orders.map(order => (
            <Panel
              key={order.id}
              header={
                <div style={{ display: 'flex', flexDirection: screens.xs ? 'column' : 'row' }}>
                  <span style={{ marginRight: screens.xs ? 0 : 16 }}>
                    Заказ №{order.id}
                  </span>
                  <span style={{ color: '#666' }}>
                    Сумма: ${parseFloat(order.order_price).toFixed(2)}
                  </span>
                </div>
              }
              extra={
                <Tag
                  color={order.status === 'paid' ? 'green' : 'red'}
                  icon={order.status === 'paid' ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                  style={{ margin: screens.xs ? '8px 0' : 0, borderRadius: 4 }}
                >
                  {order.status === 'paid' ? 'Оплачен' : 'Не оплачен'}
                </Tag>
              }
              style={{
                marginBottom: 16,
                background: '#fff',
                borderRadius: 8,
                border: '1px solid #f0f0f0'
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: screens.xs ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: 16
                }}
              >
                {order.products.map(product => (
                  <Card
                    key={product.id}
                    style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                    bodyStyle={{ padding: 16, display: 'flex', flexDirection: 'column', flexGrow: 1 }}
                  >
                    <img
                      src={getProductImage(product)}
                      alt={product.name}
                      style={{
                        width: '100%',
                        height: 160,
                        objectFit: 'cover',
                        borderRadius: 8,
                        marginBottom: 16
                      }}
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement
                        target.src = default_product_photo
                        target.style.objectFit = 'contain'
                      }}
                    />

                    <Title
                      level={5}
                      style={{
                        marginBottom: 8,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                      title={product.name}
                    >
                      {product.name}
                    </Title>

                    <div style={{ marginBottom: 8 }}>
                      {product.category && <Tag color="blue">{product.category}</Tag>}
                      {product.manufacturer && <Tag color="volcano">{product.manufacturer}</Tag>}
                    </div>

                    <Paragraph
                      style={{ color: '#666', marginBottom: 8 }}
                      ellipsis={{ rows: 2 }}
                    >
                      {product.description}
                    </Paragraph>

                    <Paragraph strong style={{ fontSize: 16, marginTop: 'auto' }}>
                      Цена: ${parseFloat(product.price).toFixed(2)}
                    </Paragraph>
                  </Card>
                ))}
              </div>
            </Panel>
          ))}
        </Collapse>
      )}

      {orders.length > 0 && (
        <div style={{ marginTop: screens.xs ? 24 : 32, textAlign: 'center' }}>
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchOrders}
            loading={loading}
            size={screens.xs ? 'middle' : 'large'}
          >
            Обновить список
          </Button>
        </div>
      )}
    </div>
  )
}

export default OrdersPage