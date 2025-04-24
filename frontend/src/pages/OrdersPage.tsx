// src/pages/OrdersPage.tsx
import React, { useState } from 'react'
import { Button, Card, Row, Col, Typography, message } from 'antd'

const { Title, Paragraph } = Typography

// Примерный тип заказа
interface Order {
  id: number
  status: string
  totalPrice: number
  products: string[]
}

const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]) // Состояние для хранения заказов

  // Имитация загрузки данных о заказах
  const fetchOrders = () => {
    const ordersData: Order[] = [
      { id: 1, status: 'В обработке', totalPrice: 30, products: ['Товар 1', 'Товар 2'] },
      { id: 2, status: 'Доставляется', totalPrice: 25, products: ['Товар 3'] },
    ]
    setOrders(ordersData)
  }

  // Загружаем заказы при монтировании компонента
  React.useEffect(() => {
    fetchOrders()
  }, [])

  return (
    <div style={{ maxWidth: '1200px', margin: 'auto', padding: '20px' }}>
      <Title level={1}>Мои заказы</Title>
      <Row gutter={[16, 16]}>
        {orders.map((order) => (
          <Col span={8} key={order.id}>
            <Card title={`Заказ №${order.id}`} bordered={false}>
              <Paragraph>Статус: {order.status}</Paragraph>
              <Paragraph>Общая цена: ${order.totalPrice}</Paragraph>
              <Paragraph>Товары в заказе:</Paragraph>
              <ul>
                {order.products.map((product, index) => (
                  <li key={index}>{product}</li>
                ))}
              </ul>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  )
}

export default OrdersPage