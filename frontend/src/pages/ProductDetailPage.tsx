import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Card,
  Typography,
  Row,
  Col,
  Button,
  message,
  Tag,
  Rate,
  Spin,
  Form,
  Input,
  List,
} from 'antd'
import {
  ShoppingCartOutlined,
  ArrowLeftOutlined,
  DollarOutlined,
  TagOutlined,
  HomeOutlined,
} from '@ant-design/icons'
import default_product_photo from '../assets/tools.jpg'
const { Title, Paragraph, Text } = Typography
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface UserBrief {
  fio: string
}

interface Review {
  id: number
  text: string
  grade: number | string
  user: UserBrief
}

interface Product {
  id: number
  name: string
  description: string
  price: string
  photo: string | null
  category?: string | null
  manufacturer?: string | null
  avg_grade?: number
  reviews: Review[]
}

interface RecentEntry {
  user: { fio: string }
  product: Product
}

const S3_BASE_URL = 'http://localhost:9000/local-bucket-shop/media'

const getProductImage = (photo: string | null): string =>
  !photo
    ? default_product_photo
    : (() => {
        try {
          new URL(photo)
          return photo
        } catch {
          return `${S3_BASE_URL}/${photo.replace(/^\/+/, '')}`
        }
      })()

const renderBadges = (p: Product) => (
  <>
    {p.category && (
      <Tag icon={<TagOutlined />} color="blue">
        {p.category}
      </Tag>
    )}
    {p.manufacturer && (
      <Tag icon={<HomeOutlined />} color="volcano">
        {p.manufacturer}
      </Tag>
    )}
  </>
)

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [product, setProduct] = useState<Product | null>(null)
  const [recent, setRecent] = useState<RecentEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const token = localStorage.getItem('token')
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : undefined as unknown as HeadersInit;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const prodRes = await fetch(`${BASE_URL}/shop/product/${id}`, {
          headers: authHeaders,
        })
        if (!prodRes.ok) throw new Error()
        const { data } = await prodRes.json()
        setProduct(data)

        if (token) {
          const recRes = await fetch(`${BASE_URL}/shop/recent`, {
            headers: authHeaders,
          })
          if (recRes.ok) setRecent(await recRes.json())
        }
      } catch {
        message.error('Не удалось загрузить товар')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  const handleAddToCart = async () => {
    if (!token) return message.error('Нужно войти, чтобы добавить в корзину')
    try {
      const res = await fetch(`${BASE_URL}/shop/cart/${id}`, {
        method: 'POST',
        headers: authHeaders,
      })
      if (!res.ok) throw new Error()
      message.success('Товар добавлен в корзину')
    } catch {
      message.error('Ошибка при добавлении в корзину')
    }
  }

  const onFinishReview = async (values: { text: string; grade: number }) => {
    if (!token) return message.error('Нужно войти, чтобы оставить отзыв')
    setSubmitting(true)
    try {
      const res = await fetch(`${BASE_URL}/shop/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ ...values, product: id }),
      })
      if (!res.ok) throw new Error()
      const newReview: Review = await res.json()
      setProduct(prev => (prev ? { ...prev, reviews: [...prev.reviews, newReview] } : prev))
      message.success('Отзыв добавлен')
    } catch {
      message.error('Ошибка при добавлении отзыва')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading)
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 100 }}>
        <Spin size="large" />
      </div>
    )
  if (!product) return null

  return (
    <div className="container">
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ marginBottom: 24 }} type="text">
        Назад
      </Button>

      <Card bodyStyle={{ padding: 32 }} style={{ boxShadow: '0 8px 24px rgba(0,0,0,.08)', borderRadius: 16 }}>
        <Row gutter={[32, 32]}>
          {/* фото */}
          <Col xs={24} md={10}>
            <img
              src={getProductImage(product.photo)}
              alt={product.name}
              style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', borderRadius: 16 }}
              onError={e => ((e.currentTarget as HTMLImageElement).src = default_product_photo)}
            />
          </Col>

          {/* инфо */}
          <Col xs={24} md={14}>
            <Title level={2} style={{ marginBottom: 8 }}>
              {product.name}
            </Title>

            <div style={{ marginBottom: 8 }}>{renderBadges(product)}</div>

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

            <Button type="primary" icon={<ShoppingCartOutlined />} size="large" onClick={handleAddToCart}>
              Добавить в корзину
            </Button>
          </Col>
        </Row>
      </Card>

      <Card style={{ marginTop: 32 }} title="Отзывы">
        <Form layout="vertical" onFinish={onFinishReview} disabled={submitting}>
          <Form.Item name="grade" label="Оценка" rules={[{ required: true }]}>
            <Rate allowHalf />
          </Form.Item>
          <Form.Item name="text" label="Комментарий" rules={[{ required: true }]}>
            <Input.TextArea rows={4} maxLength={500} />
          </Form.Item>
          <Button htmlType="submit" type="primary" loading={submitting}>
            Отправить отзыв
          </Button>
        </Form>

        <List
          locale={{ emptyText: 'Отзывов пока нет' }}
          itemLayout="vertical"
          dataSource={product.reviews}
          renderItem={item => (
            <List.Item key={item.id}>
              <List.Item.Meta title={item.user.fio} description={<Rate allowHalf disabled value={Number(item.grade)} />} />
              {item.text}
            </List.Item>
          )}
        />
      </Card>

      {recent.length > 0 && (
        <Card style={{ marginTop: 32 }} title="Вы недавно смотрели">
          <div
            style={{
              display: 'flex',
              gap: 16,
              overflowX: 'auto',
              paddingBottom: 8,
            }}
          >
            {recent.map(({ product: recProd }, idx) => (
              <Card
                key={idx}
                hoverable
                style={{ width: 160, flex: '0 0 auto' }}
                cover={
                  <img
                    alt={recProd.name}
                    src={getProductImage(recProd.photo)}
                    style={{
                      width: '100%',
                      aspectRatio: '1/1',
                      objectFit: 'cover',
                      borderRadius: 16,
                    }}
                    onError={e => ((e.currentTarget as HTMLImageElement).src = default_product_photo)}
                    onClick={() => navigate(`/product/${recProd.id}`)}
                  />
                }
                onClick={() => navigate(`/product/${recProd.id}`)}
              >
                <Card.Meta
                  title={
                    <>
                      <Typography.Paragraph
                        ellipsis={{ rows: 2 }}
                        style={{ marginBottom: 4, textAlign: 'center' }}
                      >
                        {recProd.name}
                      </Typography.Paragraph>
                      <div style={{ textAlign: 'center' }}>{renderBadges(recProd)}</div>
                    </>
                  }
                />
              </Card>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

export default ProductDetailPage