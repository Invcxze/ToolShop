import React from 'react'
import { Button, Layout, Menu } from 'antd'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCartOutlined, UserOutlined, LogoutOutlined, AppstoreAddOutlined } from '@ant-design/icons'

const { Header: AntHeader } = Layout

const Header = () => {
  const navigate = useNavigate()
  const token = localStorage.getItem('token') // Проверяем, авторизован ли пользователь

  // Функция для выхода из аккаунта
  const handleLogout = () => {
    localStorage.removeItem('token') // Удаляем токен
    navigate('/login') // Перенаправляем на страницу входа
  }

  return (
    <AntHeader style={{ background: '#fff', padding: 0 }}>
      <div className="logo" style={{ float: 'left', marginLeft: '20px' }}>
        <Link to="/">Магазин</Link>
      </div>
      <Menu mode="horizontal" style={{ float: 'right' }}>
        {/* Кнопка для просмотра продуктов */}
        <Menu.Item key="products" icon={<AppstoreAddOutlined />} onClick={() => navigate('/products')}>
          Продукты
        </Menu.Item>

        {token ? (
          <>
            <Menu.Item key="cart" icon={<ShoppingCartOutlined />} onClick={() => navigate('/products')}>
              Корзина
            </Menu.Item>
            <Menu.Item key="orders" icon={<UserOutlined />} onClick={() => navigate('/orders')}>
              Заказы
            </Menu.Item>
            <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
              Выйти
            </Menu.Item>
          </>
        ) : (
          <>
            <Menu.Item key="login" onClick={() => navigate('/login')}>
              Войти
            </Menu.Item>
            <Menu.Item key="register" onClick={() => navigate('/register')}>
              Регистрация
            </Menu.Item>
          </>
        )}
      </Menu>
    </AntHeader>
  )
}

export default Header