// src/pages/ProductDetailPage.tsx
import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Typography, Row, Col, Button, message, Tag, Rate, Spin } from 'antd'
import {
  ShoppingCartOutlined,
  ArrowLeftOutlined,
  DollarOutlined,
  TagOutlined,
  HomeOutlined,
} from '@ant-design/icons'
import employee from '../assets/istockphoto-1167872833-612x612.jpg'

const { Title, Paragraph, Text } = Typography

interface Product {
  id: number
  name: string
  description: string
  price: string
  photo: string | null
  category?: { name: string }
  manufacturer?: { name: string }
  avg_grade?: number
}

const S3_BASE_URL = 'http://localhost:9000/local-bucket-shop/media'

const getProductImage = (photo: string | null): string => {
  if (!photo) return employee
  try {
    new URL(photo)
    return photo
  } catch {
    return `${S3_BASE_URL}/${photo.replace(/^\/+/, '')}`
  }
}

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const token = localStorage.getItem('token')

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/shop/product/${id}`)
        if (!res.ok) throw new Error()
        const json = await res.json()
        setProduct(json.data)
      } catch {
        message.error('Не удалось загрузить товар')
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [id])

  const handleAddToCart = async () => {
    if (!token) {
      message.error('Нужно войти, чтобы добавить в корзину')
      return
    }
    try {
      const res = await fetch(`http://localhost:8000/api/shop/cart/${id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error()
      message.success('Товар добавлен в корзину')
    } catch {
      message.error('Ошибка при добавлении в корзину')
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 100 }}>
        <Spin size="large" />
      </div>
    )
  }
  if (!product) return null

  return (
    <div className="container">
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(-1)}
        style={{ marginBottom: 24 }}
        type="text"
      >
        Назад
      </Button>

      <Card
        bodyStyle={{ padding: 32 }}
        style={{
          boxShadow: '0 8px 24px rgba(0,0,0,.08)',
          borderRadius: 16,
        }}
      >
        <Row gutter={[32, 32]}>
          {/* Фото */}
          <Col xs={24} md={10}>
            <img
              src={getProductImage(product.photo)}
              alt={product.name}
              style={{
                width: '100%',
                aspectRatio: '1 / 1',
                objectFit: 'cover',
                borderRadius: 16,
              }}
              onError={e => {
                ;(e.currentTarget as HTMLImageElement).src = employee
              }}
            />
          </Col>

          {/* Инфо */}
          <Col xs={24} md={14}>
            <Title level={2} style={{ marginBottom: 8 }}>
              {product.name}
            </Title>

            {/* Категория / Производитель */}
            <div style={{ marginBottom: 8 }}>
              {product.category && (
                <Tag icon={<TagOutlined />} color="blue">
                  {product.category.name}
                </Tag>
              )}
              {product.manufacturer && (
                <Tag icon={<HomeOutlined />} color="volcano">
                  {product.manufacturer.name}
                </Tag>
              )}
            </div>

            {/* Рейтинг */}
            {product.avg_grade !== undefined && (
              <div style={{ marginBottom: 16 }}>
                <Rate allowHalf disabled value={product.avg_grade} />
                <Text style={{ marginLeft: 8 }}>{product.avg_grade.toFixed(1)} / 5</Text>
              </div>
            )}

            <Paragraph style={{ fontSize: 16, lineHeight: 1.6 }}>{product.description}</Paragraph>

            <Paragraph strong style={{ fontSize: 28, margin: '24px 0' }}>
              <DollarOutlined /> {product.price}
            </Paragraph>

            <Button
              type="primary"
              icon={<ShoppingCartOutlined />}
              size="large"
              onClick={handleAddToCart}
            >
              Добавить в корзину
            </Button>
          </Col>
        </Row>
      </Card>
    </div>
  )
}

export default ProductDetailPage