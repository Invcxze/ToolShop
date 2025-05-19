import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { message, Layout, Typography } from 'antd'  // Добавляем import message

import 'antd/dist/reset.css'

import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import CartPage from './pages/CartPage'
import OrdersPage from './pages/OrdersPage'
import ProductPage from './pages/ProductPage'
import Header from './components/header'
import ProductDetailPage from './pages/ProductDetailPage'

message.config({
  top: 100,
  duration: 200,
  maxCount: 3
})

const { Text } = Typography
const { Footer, Content } = Layout

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Layout style={{ minHeight: '100vh' }}>
        <Header />
        <Content style={{ padding: '20px' }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/products" element={<ProductPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/orders" element={<OrdersPage />} />
          </Routes>
        </Content>
        <Footer style={{ textAlign: 'center', padding: '20px 0', backgroundColor: '#f0f2f5', position: 'relative', bottom: 0, width: '100%' }}>
          <Text>© 2025 Магазин инструментов - Все права защищены</Text>
          <br />
          <Text type="secondary">Мы продаем качественные инструменты для любых нужд.</Text>
        </Footer>
      </Layout>
    </BrowserRouter>
  </React.StrictMode>
)