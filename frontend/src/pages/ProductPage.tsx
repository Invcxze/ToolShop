import React, { useEffect, useState } from 'react'
import { Button, Card, Row, Col, Typography, message, Input, Select } from 'antd'
import { useNavigate } from 'react-router-dom'
import employee from '../assets/istockphoto-1167872833-612x612.jpg'

const { Title, Paragraph } = Typography
const { Option } = Select

interface Product {
  id: number
  name: string
  description: string
  price: string
  image: string
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
        setProducts(data.data)
        setFilteredProducts(data.data)
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

  const filterProducts = async (search: string, price: [number, number], sort: string) => {
    let filtered = products.filter(product => 
      product.name.toLowerCase().includes(search.toLowerCase()) &&
      parseFloat(product.price) >= price[0] &&
      parseFloat(product.price) <= price[1]
    )

    if (sort === 'price_asc') {
      filtered = filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price))
    } else if (sort === 'price_desc') {
      filtered = filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price))
    } else if (sort === 'name_asc') {
      filtered = filtered.sort((a, b) => a.name.localeCompare(b.name))
    } else if (sort === 'name_desc') {
      filtered = filtered.sort((a, b) => b.name.localeCompare(a.name))
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
      console.log('Ответ от API:', result)
  
      if (!response.ok) {
        throw new Error(result?.data?.message || 'Не удалось добавить товар в корзину')
      }
  
      // Проверяем, если в ответе есть сообщение, выводим его
      const msg = result?.data?.message || `Товар с ID ${productId} добавлен в корзину`
      console.log('Уведомление:', msg)
      message.success(msg)
    } catch (error) {
      console.error('Ошибка при добавлении товара в корзину:', error)
      message.error(error.message || 'Ошибка при добавлении товара в корзину')
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
              <Input.Group compact style={{ marginBottom: '20px' }}>
                <Input 
                  style={{ width: '50%' }} 
                  type="number" 
                  placeholder="От" 
                  value={priceRange[0]}
                  onBlur={() => filterProducts(searchTerm, priceRange, sortOrder)}
                  onChange={(e) => setPriceRange([parseFloat(e.target.value), priceRange[1]])}
                />
                <Input 
                  style={{ width: '50%' }} 
                  type="number" 
                  placeholder="До" 
                  value={priceRange[1]}
                  onBlur={() => filterProducts(searchTerm, priceRange, sortOrder)}
                  onChange={(e) => setPriceRange([priceRange[0], parseFloat(e.target.value)])}
                />
              </Input.Group>
            </div>

            <div style={{ marginBottom: '10px' }}>
              <Title level={5}>Сортировка</Title>
              <Select
                defaultValue="name_asc"
                style={{ width: '100%' }}
                onChange={handleSortChange}
              >
                <Option value="name_asc">Сортировать по названию (A-Z)</Option>
                <Option value="name_desc">Сортировать по названию (Z-A)</Option>
                <Option value="price_asc">Сортировать по цене (по возрастанию)</Option>
                <Option value="price_desc">Сортировать по цене (по убыванию)</Option>
              </Select>
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
        </Col>
      </Row>
    </div>
  )
}

export default ProductPage