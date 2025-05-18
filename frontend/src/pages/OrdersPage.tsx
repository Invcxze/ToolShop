import React, { useEffect, useState } from 'react'
import { Button, Card, Row, Col, Typography, message, Collapse, Divider, List, Tag } from 'antd'
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'
import employee from '../assets/istockphoto-1167872833-612x612.jpg'   // дефолтное фото

const { Title, Paragraph } = Typography
const { Panel } = Collapse

interface Product {
  id: number
  name: string
  description: string
  price: string
  photo?: string | null
}

interface Order {
  id: number
  order_price: string
  products: Product[]
  status: 'paid' | 'unpaid'
}

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const token = localStorage.getItem('token')

  const fetchOrders = async () => {
    if (!token) {
      message.error('Авторизуйтесь!')
      return
    }
    try {
      const res = await fetch('http://localhost:8000/api/shop/order', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error()
      const json = await res.json()
      setOrders(json.data)
    } catch {
      message.error('Не удалось загрузить заказы')
    }
  }

  useEffect(() => { fetchOrders() }, [])

  const S3_BASE_URL = 'http://localhost:9000/local-bucket-shop/media'

  const getProductImage = (product: Product) => {
    if (!product.photo) return employee
    try {
      new URL(product.photo) // абсолютный?
      return product.photo
    } catch {
      return `${S3_BASE_URL}/${product.photo.replace(/^\/+/, '')}`
    }
  }

  return (
    <div style={{ maxWidth: 1200, margin: 'auto', padding: 20 }}>
      <Title level={1}>Мои заказы</Title>

      <Row>
        <Col span={24}>
          {orders.length === 0 ? (
            <Title level={3}>У вас нет заказов</Title>
          ) : (
            <Collapse accordion>
              {orders.map(order => (
                <Panel
                  key={order.id}
                  header={`Заказ №${order.id}`}
                  extra={<span>Общая цена: ${order.order_price}</span>}
                >
                  <Paragraph>
                    <strong>Статус: </strong>
                    {order.status === 'paid' ? (
                      <Tag color="green" icon={<CheckCircleOutlined />}>Оплачен</Tag>
                    ) : (
                      <Tag color="red" icon={<CloseCircleOutlined />}>Не оплачен</Tag>
                    )}
                  </Paragraph>

                  <Divider />
                  <Title level={4}>Товары:</Title>

                  <List
                    dataSource={order.products}
                    renderItem={p => (
                      <List.Item>
                        <Card style={{ width: '100%', display: 'flex', gap: 16 }}>
                          <img
                            src={getProductImage(p)}
                            alt={p.name}
                            style={{ width: 150, height: 150, objectFit: 'cover', borderRadius: 8 }}
                            onError={e => {
                              (e.currentTarget as HTMLImageElement).src = employee
                              e.currentTarget.style.objectFit = 'contain'
                            }}
                          />
                          <div>
                            <Title level={5}>{p.name}</Title>
                            <Paragraph>{p.description}</Paragraph>
                            <Paragraph>Цена: ${p.price}</Paragraph>
                          </div>
                        </Card>
                      </List.Item>
                    )}
                  />
                </Panel>
              ))}
            </Collapse>
          )}
        </Col>
      </Row>

      <Button type="primary" onClick={fetchOrders} style={{ marginTop: 20 }}>
        Обновить
      </Button>
    </div>
  )
}

export default OrdersPage