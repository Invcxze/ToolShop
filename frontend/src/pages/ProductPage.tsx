// src/pages/ProductPage.tsx
import React, { useEffect, useState } from 'react'
import { Button, Card, Row, Col, Typography, message, Input, Select, Space } from 'antd'
import { useNavigate } from 'react-router-dom'
import employee from '../assets/istockphoto-1167872833-612x612.jpg'

const { Title, Paragraph } = Typography

/* ---------- типы ---------- */
interface Product {
  id: number
  name: string
  description: string
  price: string
  photo: string | null
}

/* ---------- utils ---------- */
const S3_BASE_URL = 'http://localhost:9000/local-bucket-shop/media'

const getProductImage = (product: Product): string => {
  if (!product.photo) return employee
  try {
    new URL(product.photo)
    return product.photo
  } catch {
    return `${S3_BASE_URL}/${product.photo.replace(/^\/+/, '')}`
  }
}

/* ---------- страница ---------- */
const ProductPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000])
  const [sortOrder, setSortOrder] = useState<string>('name_asc')

  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  /* загрузка товаров */
  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch('http://localhost:8000/api/shop/products')
        if (!res.ok) throw new Error()
        const data = await res.json()
        const normalized: Product[] = data.data.map((p: any) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          price: p.price,
          photo: p.photo,
        }))
        setProducts(normalized)
        setFilteredProducts(normalized)
      } catch {
        message.error('Не удалось загрузить товары')
      }
    })()
  }, [])

  /* фильтрация + сортировка */
  const filterProducts = (search: string, price: [number, number], sort: string) => {
    let result = products.filter(
      p =>
        p.name.toLowerCase().includes(search.toLowerCase()) &&
        parseFloat(p.price) >= price[0] &&
        parseFloat(p.price) <= price[1],
    )

    switch (sort) {
      case 'price_asc':
        result.sort((a, b) => parseFloat(a.price) - parseFloat(b.price))
        break
      case 'price_desc':
        result.sort((a, b) => parseFloat(b.price) - parseFloat(a.price))
        break
      case 'name_desc':
        result.sort((a, b) => b.name.localeCompare(a.name))
        break
      default:
        result.sort((a, b) => a.name.localeCompare(b.name))
    }
    setFilteredProducts(result)
  }

  /* добавить в корзину */
  const handleAddToCart = async (id: number) => {
    if (!token) {
      message.error('Для добавления товара в корзину нужно авторизоваться!')
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
      message.error('Не удалось добавить товар в корзину')
    }
  }

  /* ---------- render ---------- */
  return (
    <div style={{ maxWidth: 1200, margin: 'auto', padding: 20 }}>
      <Title level={1}>Товары</Title>

      {/* поиск */}
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Input
            placeholder="Поиск по названию"
            value={searchTerm}
            onChange={e => {
              const q = e.target.value
              setSearchTerm(q)
              filterProducts(q, priceRange, sortOrder)
            }}
          />
        </Col>
      </Row>

      {/* фильтры и список */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {/* фильтры */}
        <Col span={6}>
          <div style={{ border: '1px solid #e8e8e8', borderRadius: 8, padding: 20 }}>
            <Title level={4}>Фильтры</Title>

            {/* диапазон цен */}
            <Title level={5}>Диапазон цен</Title>
            <Space.Compact style={{ marginBottom: 20 }}>
              <Input
                type="number"
                placeholder="От"
                value={priceRange[0]}
                onChange={e => setPriceRange([Number(e.target.value) || 0, priceRange[1]])}
                onBlur={() => filterProducts(searchTerm, priceRange, sortOrder)}
              />
              <Input
                type="number"
                placeholder="До"
                value={priceRange[1]}
                onChange={e => setPriceRange([priceRange[0], Number(e.target.value) || 1000])}
                onBlur={() => filterProducts(searchTerm, priceRange, sortOrder)}
              />
            </Space.Compact>

            {/* сортировка */}
            <Title level={5}>Сортировка</Title>
            <Select
              value={sortOrder}
              style={{ width: '100%' }}
              onChange={value => {
                setSortOrder(value)
                filterProducts(searchTerm, priceRange, value)
              }}
              options={[
                { value: 'name_asc', label: 'Название (A‑Z)' },
                { value: 'name_desc', label: 'Название (Z‑A)' },
                { value: 'price_asc', label: 'Цена (↑)' },
                { value: 'price_desc', label: 'Цена (↓)' },
              ]}
            />
          </div>
        </Col>

        {/* список товаров */}
        <Col span={18}>
          <Row gutter={[16, 16]}>
            {filteredProducts.length === 0 ? (
              <Col span={24}>
                <Title level={3}>Нет доступных товаров</Title>
              </Col>
            ) : (
              filteredProducts.map(p => (
                <Col span={8} key={p.id}>
                  <Card
                    hoverable
                    onClick={() => navigate(`/products/${p.id}`)}
                    cover={
                      <img
                        src={getProductImage(p)}
                        alt={p.name}
                        style={{ width: '100%', height: 300, objectFit: 'cover' }}
                        onError={e => {
                          ;(e.currentTarget as HTMLImageElement).src = employee
                          e.currentTarget.style.objectFit = 'contain'
                        }}
                      />
                    }
                    actions={[
                      token ? (
                        <Button
                          type="primary"
                          onClick={e => {
                            e.stopPropagation()
                            handleAddToCart(p.id)
                          }}
                        >
                          Добавить в корзину
                        </Button>
                      ) : (
                        <Button
                          onClick={e => {
                            e.stopPropagation()
                            navigate('/login')
                          }}
                        >
                          Войти для добавления
                        </Button>
                      ),
                    ]}
                  >
                    <Title level={4}>{p.name}</Title>

                    <Paragraph
                      ellipsis={{ rows: 2 }}
                      style={{ minHeight: 48 }}
                    >
                      {p.description}
                    </Paragraph>

                    <Paragraph>Цена: ${p.price}</Paragraph>
                  </Card>
                </Col>
              ))
            )}
          </Row>
        </Col>
      </Row>
    </div>
  )
}

export default ProductPage