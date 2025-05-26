import React, { useEffect, useState } from 'react'
import {
  Button,
  Card,
  Typography,
  message,
  Collapse,
  List,
  Tag,
  Grid
} from 'antd'
import { CheckCircleOutlined, CloseCircleOutlined, ReloadOutlined } from '@ant-design/icons'
import default_product_photo from '../assets/guitar.jpeg'

const { Title, Paragraph } = Typography
const { Panel } = Collapse
const { useBreakpoint } = Grid
const BASE_URL = import.meta.env.VITE_API_BASE_URL

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
        headers: { Authorization: `Bearer ${token}` },
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

const S3_BASE_URL = "http://minio:9000/local-bucket-shop/media";

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
        style={{
          marginBottom: screens.xs ? 16 : 24,
          textAlign: 'center'
        }}
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
        <Collapse
          accordion
          bordered={false}
          style={{ background: 'transparent' }}
        >
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
                  icon={order.status === 'paid' ?
                    <CheckCircleOutlined /> :
                    <CloseCircleOutlined />}
                  style={{
                    margin: screens.xs ? '8px 0' : 0,
                    borderRadius: 4
                  }}
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
              <List
                dataSource={order.products}
                renderItem={p => (
                  <List.Item style={{ padding: screens.xs ? '8px 0' : '12px 0' }}>
                    <Card
                      style={{ width: '100%' }}
                      bodyStyle={{ padding: screens.xs ? 12 : 16 }}
                    >
                      <div style={{
                        display: 'flex',
                        flexDirection: screens.xs ? 'column' : 'row',
                        gap: screens.xs ? 12 : 24,
                        alignItems: 'center'
                      }}>
                        <img
                          src={getProductImage(p)}
                          alt={p.name}
                          style={{
                            width: screens.xs ? '100%' : 120,
                            height: screens.xs ? 160 : 120,
                            objectFit: 'cover',
                            borderRadius: 8
                          }}
                          onError={e => {
                            const target = e.currentTarget as HTMLImageElement
                            target.src = default_product_photo
                            target.style.objectFit = 'contain'
                          }}
                        />

                        <div style={{ flex: 1 }}>
                          <Title
                            level={screens.xs ? 5 : 4}
                            style={{ marginBottom: 8 }}
                          >
                            {p.name}
                          </Title>

                          <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 4,
                            marginBottom: 8
                          }}>
                            {p.category && (
                              <Tag
                                color="blue"
                                style={{
                                  fontSize: screens.xs ? 12 : 14,
                                  margin: 0
                                }}
                              >
                                {p.category}
                              </Tag>
                            )}
                            {p.manufacturer && (
                              <Tag
                                color="volcano"
                                style={{
                                  fontSize: screens.xs ? 12 : 14,
                                  margin: 0
                                }}
                              >
                                {p.manufacturer}
                              </Tag>
                            )}
                          </div>

                          <Paragraph
                            ellipsis={{
                              rows: screens.xs ? 2 : 3,
                              expandable: true
                            }}
                            style={{
                              fontSize: screens.xs ? 14 : 16,
                              color: '#666',
                              marginBottom: 8
                            }}
                          >
                            {p.description}
                          </Paragraph>

                          <Paragraph
                            strong
                            style={{
                              fontSize: screens.xs ? 16 : 18,
                              color: '#1890ff',
                              margin: 0
                            }}
                          >
                            Цена: ${parseFloat(p.price).toFixed(2)}
                          </Paragraph>
                        </div>
                      </div>
                    </Card>
                  </List.Item>
                )}
              />
            </Panel>
          ))}
        </Collapse>
      )}

      {orders.length > 0 && (
        <div style={{
          marginTop: screens.xs ? 24 : 32,
          textAlign: 'center'
        }}>
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