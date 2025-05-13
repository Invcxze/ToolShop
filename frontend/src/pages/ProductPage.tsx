import React, { useEffect, useState } from 'react'
import { Button, Card, Row, Col, Typography, message, Input, Select, Space } from 'antd'
import { useNavigate } from 'react-router-dom'
import employee from '../assets/istockphoto-1167872833-612x612.jpg'

const { Title, Paragraph } = Typography

interface Product {
  id: number
  name: string
  description: string
  price: string
  photo: string | null
}

const ProductPage = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000])
  const [sortOrder, setSortOrder] = useState<string>('name_asc')
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/shop/products')
        if (!response.ok) {
          throw new Error('Ошибка при загрузке данных о товарах')
        }
        const data = await response.json()
        const normalizedProducts: Product[] = data.data.map((p: any) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          price: p.price,
          photo: p.photo,
        }))
        setProducts(normalizedProducts)
        setFilteredProducts(normalizedProducts)
      } catch (error) {
        console.error('Ошибка при загрузке товаров:', error)
        message.error('Не удалось загрузить товары')
      }
    }

    fetchProducts()
  }, [])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchTerm(query)
    filterProducts(query, priceRange, sortOrder)
  }

  const handlePriceChange = (value: [number, number]) => {
    setPriceRange(value)
    filterProducts(searchTerm, value, sortOrder)
  }

  const handleSortChange = (value: string) => {
    setSortOrder(value)
    filterProducts(searchTerm, priceRange, value)
  }

  const filterProducts = (search: string, price: [number, number], sort: string) => {
    let filtered = products.filter(product =>
      product.name.toLowerCase().includes(search.toLowerCase()) &&
      parseFloat(product.price) >= price[0] &&
      parseFloat(product.price) <= price[1]
    )

    switch (sort) {
      case 'price_asc':
        filtered = filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price))
        break
      case 'price_desc':
        filtered = filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price))
        break
      case 'name_desc':
        filtered = filtered.sort((a, b) => b.name.localeCompare(a.name))
        break
      default:
        filtered = filtered.sort((a, b) => a.name.localeCompare(b.name))
    }

    setFilteredProducts(filtered)
  }

  const handleAddToCart = async (productId: number) => {
    if (!token) {
      message.error('Для добавления товара в корзину нужно авторизоваться!')
      return
    }

    try {
      const response = await fetch(`http://localhost:8000/api/shop/cart/${productId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result?.data?.message || 'Не удалось добавить товар в корзину')
      }

      const msg = result?.data?.message || `Товар с ID ${productId} добавлен в корзину`
      message.success(msg)
    } catch (error: any) {
      console.error('Ошибка при добавлении товара в корзину:', error)
      message.error(error.message || 'Ошибка при добавлении товара в корзину')
    }
  }

  const S3_BASE_URL = 'http://localhost:9000/local-bucket-shop/media'

  const getProductImage = (product: Product) => {
    if (!product.photo) return employee
    try {
      const url = new URL(product.photo)
      return product.photo
    } catch {
      return `${S3_BASE_URL}/${product.photo.replace(/^\/+/, '')}`
    }
  }

  return (
    <div style={{ maxWidth: '1200px', margin: 'auto', padding: '20px' }}>
      <Title level={1}>Товары</Title>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Input
            placeholder="Поиск по названию"
            value={searchTerm}
            onChange={handleSearchChange}
            style={{ width: '100%', marginBottom: '20px' }}
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={6}>
          <div style={{ padding: '20px', border: '1px solid #e8e8e8', borderRadius: '8px' }}>
            <Title level={4}>Фильтры</Title>

            <div style={{ marginBottom: '10px' }}>
              <Title level={5}>Диапазон цен</Title>
              <Space.Compact style={{ marginBottom: '20px' }}>
                <Input
                  style={{ width: '50%' }}
                  type="number"
                  placeholder="От"
                  value={priceRange[0]}
                  onChange={(e) => {
                    const valueNum = parseFloat(e.target.value)
                    setPriceRange([isNaN(valueNum) ? 0 : valueNum, priceRange[1]])
                  }}
                  onBlur={() => filterProducts(searchTerm, priceRange, sortOrder)}
                />
                <Input
                  style={{ width: '50%' }}
                  type="number"
                  placeholder="До"
                  value={priceRange[1]}
                  onChange={(e) => {
                    const valueNum = parseFloat(e.target.value)
                    setPriceRange([priceRange[0], isNaN(valueNum) ? 1000 : valueNum])
                  }}
                  onBlur={() => filterProducts(searchTerm, priceRange, sortOrder)}
                />
              </Space.Compact>
            </div>

            <div style={{ marginBottom: '10px' }}>
              <Title level={5}>Сортировка</Title>
              <Select
                value={sortOrder}
                style={{ width: '100%' }}
                onChange={handleSortChange}
                options={[
                  { value: 'name_asc', label: 'Название (A-Z)' },
                  { value: 'name_desc', label: 'Название (Z-A)' },
                  { value: 'price_asc', label: 'Цена (возрастание)' },
                  { value: 'price_desc', label: 'Цена (убывание)' },
                ]}
              />
            </div>
          </div>
        </Col>

        <Col span={18}>
          <Row gutter={[16, 16]}>
            {filteredProducts.length === 0 ? (
              <Col span={24}>
                <Title level={3}>Нет доступных товаров</Title>
              </Col>
            ) : (
              filteredProducts.map((product) => (
                <Col span={8} key={product.id}>
                  <Card
                    hoverable
                    cover={
                      <img
                        alt={product.name}
                        src={getProductImage(product)}
                        style={{ height: '300px', objectFit: 'cover', width: '100%' }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = employee
                          e.currentTarget.style.objectFit = 'contain'
                        }}
                      />
                    }
                    actions={[
                      token ? (
                        <Button type="primary" onClick={() => handleAddToCart(product.id)}>
                          Добавить в корзину
                        </Button>
                      ) : (
                        <Button type="default" onClick={() => navigate('/login')}>
                          Войти для добавления
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
        </Col>
      </Row>
    </div>
  )
}

export default ProductPage

