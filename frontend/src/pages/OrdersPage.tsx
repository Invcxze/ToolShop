import React, { useState, useEffect } from 'react'
import { Button, Card, Row, Col, Typography, message, Collapse, Divider, List, Tag } from 'antd'
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'

const { Title, Paragraph } = Typography
const { Panel } = Collapse

interface Product {
  id: number
  name: string
  description: string
  price: string
}

interface Order {
  id: number
  order_price: string
  products: Product[]
  status: string // Добавим статус заказа, например, "paid", "unpaid"
}

const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const token = localStorage.getItem('token')

  const fetchOrders = async () => {
    if (!token) {
      message.error('Для получения заказов нужно авторизоваться!')
      return
    }

    try {
      const response = await fetch('http://localhost:8000/api/shop/order', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Ошибка при загрузке заказов')
      }

      const data = await response.json()
      console.log(data)

      setOrders(data.data)
    } catch (error) {
      console.error('Ошибка при загрузке заказов:', error)
      message.error('Не удалось загрузить заказы')
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  return (
    <div style={{ maxWidth: '1200px', margin: 'auto', padding: '20px' }}>
      <Title level={1}>Мои заказы</Title>
      <Row gutter={[16, 16]}>
        {orders.length === 0 ? (
          <Col span={24}>
            <Title level={3}>У вас нет заказов</Title>
          </Col>
        ) : (
          <Col span={24}>
            <Collapse accordion>
              {orders.map((order) => (
                <Panel
                  header={`Заказ №${order.id} - ${order.status === 'paid' ? 'Оплачен' : 'Не оплачен'}`}
                  key={order.id}
                  extra={<span>Общая цена: ${order.order_price}</span>}
                  showArrow={false}
                  style={{ marginBottom: '16px' }}
                >
                  <Card
                    style={{ backgroundColor: '#f9f9f9', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}
                    bordered={false}
                  >
                    <Paragraph>
                      <strong>Статус заказа: </strong>
                      {order.status === 'paid' ? (
                        <Tag color="green" icon={<CheckCircleOutlined />}>
                          Оплачен
                        </Tag>
                      ) : (
                        <Tag color="red" icon={<CloseCircleOutlined />}>
                          Не оплачен
                        </Tag>
                      )}
                    </Paragraph>
                    <Paragraph>
                      <strong>Общая цена: </strong> ${order.order_price}
                    </Paragraph>
                    <Divider />
                    <Title level={4}>Товары в заказе:</Title>
                    <List
                      dataSource={order.products}
                      renderItem={(product) => (
                        <List.Item>
                          <Card
                            style={{
                              padding: '10px',
                              borderRadius: '8px',
                              backgroundColor: '#fff',
                              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                              width: '100%',
                            }}
                          >
                            <Title level={5}>{product.name}</Title>
                            <Paragraph>{product.description}</Paragraph>
                            <Paragraph>
                              <strong>Цена: </strong> ${product.price}
                            </Paragraph>
                          </Card>
                        </List.Item>
                      )}
                    />
                  </Card>
                </Panel>
              ))}
            </Collapse>
          </Col>
        )}
      </Row>
      <Button type="primary" onClick={fetchOrders}>Загрузить заказы</Button>
    </div>
  )
}

export default OrdersPage