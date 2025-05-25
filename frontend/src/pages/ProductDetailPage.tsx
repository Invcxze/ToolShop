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
  Grid
} from 'antd'
import {
  ShoppingCartOutlined,
  ArrowLeftOutlined,
  DollarOutlined,
  TagOutlined,
  HomeOutlined
} from '@ant-design/icons'
import default_product_photo from '../assets/guitar.jpeg'

const { Title, Paragraph, Text } = Typography
const { useBreakpoint } = Grid
const BASE_URL = import.meta.env.VITE_API_BASE_URL

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

const getProductImage = (photo: string | null): string => {
  if (!photo) return default_product_photo
  try {
    new URL(photo)
    return photo
  } catch {
    return `${S3_BASE_URL}/${photo.replace(/^\/+/, '')}`
  }
}

const renderBadges = (p: Product) => (
  <>
    {p.category && (
      <Tag icon={<TagOutlined />} color="blue" style={{ margin: 0 }}>
        {p.category}
      </Tag>
    )}
    {p.manufacturer && (
      <Tag icon={<HomeOutlined />} color="volcano" style={{ margin: 0 }}>
        {p.manufacturer}
      </Tag>
    )}
  </>
)

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const screens = useBreakpoint()
  const [product, setProduct] = useState<Product | null>(null)
  const [recent, setRecent] = useState<RecentEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const token = localStorage.getItem('token')
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : undefined as unknown as HeadersInit

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

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        padding: screens.xs ? '40px 16px' : '100px 24px'
      }}>
        <Spin size="large" />
      </div>
    )
  }

  if (!product) return null

  return (
    <div style={{
      maxWidth: 1200,
      margin: 'auto',
      padding: screens.xs ? '0 16px' : '0 24px'
    }}>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(-1)}
        type="text"
        style={{
          margin: screens.xs ? '16px 0' : '24px 0',
          paddingLeft: 0
        }}
      >
        {screens.xs ? null : 'Назад'}
      </Button>

      <Card
        bodyStyle={{
          padding: screens.xs ? 16 : 32,
          borderRadius: screens.xs ? 8 : 16
        }}
        style={{
          boxShadow: '0 4px 12px rgba(0,0,0,.1)',
          marginBottom: screens.xs ? 24 : 32
        }}
      >
        <Row gutter={[screens.xs ? 0 : 32, 32]}>
          <Col xs={24} md={10}>
            <img
              src={getProductImage(product.photo)}
              alt={product.name}
              style={{
                width: '100%',
                aspectRatio: '1/1',
                objectFit: 'contain',
                borderRadius: screens.xs ? 8 : 16,
                backgroundColor: '#fafafa'
              }}
              onError={e => ((e.currentTarget as HTMLImageElement).src = default_product_photo)}
            />
          </Col>

          <Col xs={24} md={14}>
            <Title
              level={screens.xs ? 3 : 2}
              style={{
                marginBottom: 8,
                fontSize: screens.xs ? '1.5rem' : '2rem'
              }}
            >
              {product.name}
            </Title>

            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 8,
              marginBottom: screens.xs ? 12 : 16
            }}>
              {renderBadges(product)}
            </div>

            {product.avg_grade !== undefined && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: screens.xs ? 12 : 16
              }}>
                <Rate
                  allowHalf
                  disabled
                  value={product.avg_grade}
                  style={{ fontSize: screens.xs ? 16 : 20 }}
                />
                <Text style={{
                  marginLeft: 8,
                  fontSize: screens.xs ? 14 : 16
                }}>
                  {product.avg_grade.toFixed(1)} / 5
                </Text>
              </div>
            )}

            <Paragraph style={{
              fontSize: screens.xs ? 14 : 16,
              lineHeight: 1.6,
              color: '#666'
            }}>
              {product.description}
            </Paragraph>

            <Paragraph
              strong
              style={{
                fontSize: screens.xs ? 24 : 28,
                margin: screens.xs ? '16px 0' : '24px 0',
                color: '#1890ff'
              }}
            >
              <DollarOutlined /> {product.price}
            </Paragraph>

            <Button
              type="primary"
              icon={<ShoppingCartOutlined />}
              size={screens.xs ? 'middle' : 'large'}
              block={screens.xs}
              onClick={handleAddToCart}
              style={{ height: screens.xs ? 40 : 48 }}
            >
              Добавить в корзину
            </Button>
          </Col>
        </Row>
      </Card>

      <Card
        title={<span style={{ fontSize: screens.xs ? 18 : 20 }}>Отзывы</span>}
        style={{
          borderRadius: screens.xs ? 8 : 16,
          marginBottom: screens.xs ? 24 : 32
        }}
      >
        <Form
          layout="vertical"
          onFinish={onFinishReview}
          disabled={submitting}
        >
          <Form.Item
            name="grade"
            label="Оценка"
            rules={[{ required: true }]}
          >
            <Rate allowHalf style={{ fontSize: screens.xs ? 16 : 20 }} />
          </Form.Item>
          <Form.Item
            name="text"
            label="Комментарий"
            rules={[{ required: true, message: 'Введите текст отзыва' }]}
          >
            <Input.TextArea
              rows={screens.xs ? 3 : 4}
              maxLength={500}
              style={{ fontSize: screens.xs ? 14 : 16 }}
              showCount
            />
          </Form.Item>
          <Button
            htmlType="submit"
            type="primary"
            loading={submitting}
            size={screens.xs ? 'middle' : 'large'}
          >
            Отправить отзыв
          </Button>
        </Form>

        <List
          locale={{ emptyText: 'Пока нет отзывов' }}
          itemLayout="vertical"
          dataSource={product.reviews}
          renderItem={item => (
            <List.Item key={item.id}>
              <List.Item.Meta
                title={<Text strong style={{ fontSize: screens.xs ? 14 : 16 }}>{item.user.fio}</Text>}
                description={
                  <Rate
                    allowHalf
                    disabled
                    value={Number(item.grade)}
                    style={{ fontSize: screens.xs ? 14 : 16 }}
                  />
                }
              />
              <Paragraph style={{
                fontSize: screens.xs ? 14 : 16,
                marginTop: 8
              }}>
                {item.text}
              </Paragraph>
            </List.Item>
          )}
        />
      </Card>

      {recent.length > 0 && (
        <Card
          title={<span style={{ fontSize: screens.xs ? 18 : 20 }}>Недавно просмотренные</span>}
          style={{
            borderRadius: screens.xs ? 8 : 16,
            marginBottom: screens.xs ? 24 : 32
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: screens.xs ? 8 : 16,
              overflowX: 'auto',
              paddingBottom: 8,
              scrollbarWidth: 'thin'
            }}
          >
            {recent.map(({ product: recProd }, idx) => (
              <Card
                key={idx}
                hoverable
                style={{
                  width: screens.xs ? 140 : 180,
                  flex: '0 0 auto',
                  borderRadius: 8
                }}
                bodyStyle={{ padding: screens.xs ? 8 : 12 }}
                onClick={() => navigate(`/product/${recProd.id}`)}
              >
                <img
                  alt={recProd.name}
                  src={getProductImage(recProd.photo)}
                  style={{
                    width: '100%',
                    aspectRatio: '1/1',
                    objectFit: 'cover',
                    borderRadius: 8,
                    marginBottom: 8
                  }}
                  onError={e => ((e.currentTarget as HTMLImageElement).src = default_product_photo)}
                />
                <Paragraph
                  ellipsis={{ rows: 2 }}
                  style={{
                    marginBottom: 4,
                    fontSize: screens.xs ? 12 : 14,
                    fontWeight: 500
                  }}
                >
                  {recProd.name}
                </Paragraph>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {renderBadges(recProd)}
                </div>
              </Card>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

export default ProductDetailPage