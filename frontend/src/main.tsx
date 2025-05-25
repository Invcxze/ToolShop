import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { message, Layout, Typography, Grid } from 'antd'

import 'antd/dist/reset.css'

import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import CartPage from './pages/CartPage'
import OrdersPage from './pages/OrdersPage'
import ProductPage from './pages/ProductPage'
import Header from './components/header'
import ProductDetailPage from './pages/ProductDetailPage'
const { useBreakpoint } = Grid
message.config({
  top: 100,
  duration: 200,
  maxCount: 3
})
const AppFooter = () => {
  const screens = useBreakpoint()

  return (
    <Footer style={{
      textAlign: 'center',
      padding: screens.xs ? '16px 12px' : '20px 24px',
      backgroundColor: '#f0f2f5',
      position: 'relative',
      bottom: 0,
      width: '100%'
    }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: screens.xs ? 4 : 8
      }}>
        <Text style={{
          fontSize: screens.xs ? 12 : 14,
          lineHeight: 1.5
        }}>
          © 2025 Магазин музыкальных инструментов - Все права защищены
        </Text>
        <Text type="secondary" style={{
          fontSize: screens.xs ? 10 : 12,
          lineHeight: 1.4
        }}>
          Мы продаем качественные музыкальные инструменты для лучшего звучания и нужд.
        </Text>
        {!screens.xs && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 24,
            marginTop: 8
          }}>
            <Text style={{ fontSize: 12 }}>Пользовательское соглашение</Text>
            <Text style={{ fontSize: 12 }}>Политика конфиденциальности</Text>
          </div>
        )}
      </div>
    </Footer>
  )
}
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
       <AppFooter />
      </Layout>
    </BrowserRouter>
  </React.StrictMode>
)