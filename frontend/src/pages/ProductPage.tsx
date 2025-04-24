import React, { useEffect, useState } from 'react'
import { Button, Card, Row, Col, Typography, message } from 'antd'
import { useNavigate } from 'react-router-dom'
import employee from '../assets/istockphoto-1167872833-612x612.jpg'

const { Title, Paragraph } = Typography

interface Product {
  id: number
  name: string
  description: string
  price: string
  image: string
}

const ProductPage = () => {
  const [products, setProducts] = useState<Product[]>([]) // Состояние для хранения товаров
  const navigate = useNavigate()
  const token = localStorage.getItem('token') // Проверяем, авторизован ли пользователь

  // Имитация загрузки данных о товарах
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/shop/products')
        if (!response.ok) {
          throw new Error('Ошибка при загрузке данных о товарах')
        }

        const data = await response.json()
        console.log(data)  // Логирование данных, чтобы проверить, что приходит от API

        // Теперь извлекаем товары из data
        setProducts(data.data)
      } catch (error) {
        console.error('Ошибка при загрузке товаров:', error)
        message.error('Не удалось загрузить товары')
      }
    }

    fetchProducts()
  }, [])

  // Функция для добавления товара в корзину
  const handleAddToCart = (productId: number) => {
    if (!token) {
      message.error('Для добавления товара в корзину нужно авторизоваться!')
      return
    }
    message.success(`Товар с ID ${productId} добавлен в корзину`)
  }

  return (
    <div style={{ maxWidth: '1200px', margin: 'auto', padding: '20px' }}>
      <Title level={1}>Товары</Title>
      <Row gutter={[16, 16]}>
        {products.length === 0 ? (
          <Col span={24}>
            <Title level={3}>Нет доступных товаров</Title>
          </Col>
        ) : (
          products.map((product) => (
            <Col span={8} key={product.id}>
              <Card
                hoverable
                cover={<img alt={product.name} src={employee} />}
                actions={[
                  token ? (
                    <Button type="primary" onClick={() => handleAddToCart(product.id)}>
                      Добавить в корзину
                    </Button>
                  ) : (
                    <Button type="default" onClick={() => navigate('/login')}>
                      Войти для добавления в корзину
                    </Button>
                  ),
                ]}
              >
                <Title level={4}>{product.name}</Title>
                <Paragraph>{product.description}</Paragraph>
                <Paragraph>Цена: ${product.price}</Paragraph>
              </Card>
            </Col>
          ))
        )}
      </Row>
    </div>
  )
}

export default ProductPage