import { useEffect, useState } from 'react'
import { Layout, Menu, message } from 'antd'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  ShoppingCartOutlined,
  UserOutlined,
  LogoutOutlined,
  AppstoreAddOutlined
} from '@ant-design/icons'
const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const { Header: AntHeader } = Layout

const Header = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const token = localStorage.getItem('token')

  const handleLogout = async () => {
    if (!token) {
      message.error('Пользователь не авторизован!')
      return
    }

    try {
      const response = await fetch(`${BASE_URL}/users/logout/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Ошибка при выходе из системы')
      }

      localStorage.removeItem('token')
      message.success('Вы успешно вышли')
      navigate('/login')
    } catch (error) {
      console.error('Ошибка при выходе:', error)

      // Явная проверка типа ошибки
      if (error instanceof Error) {
        message.error(error.message)
      } else {
        message.error('Не удалось выйти из системы')
      }
    }
  }

  const [selectedKeys, setSelectedKeys] = useState<string[]>([])

  useEffect(() => {
    const pathToKey: Record<string, string> = {
      '/products': 'products',
      '/cart': 'cart',
      '/orders': 'orders'
    }
    setSelectedKeys([pathToKey[location.pathname] || ''])
  }, [location.pathname])

  return (
    <AntHeader style={{ background: '#fff', padding: 0 }}>
      <div className="logo" style={{
        float: 'left',
        marginLeft: '20px',
        display: 'flex',
        alignItems: 'center'
      }}>
        <Link to="/" style={{ fontSize: '20px', fontWeight: 'bold' }}>
          ToolShop
        </Link>
      </div>

      <Menu
        mode="horizontal"
        selectedKeys={selectedKeys}
        style={{ float: 'right' }}
      >
        <Menu.Item
          key="products"
          icon={<AppstoreAddOutlined />}
          onClick={() => navigate('/products')}
        >
          Продукты
        </Menu.Item>

        {token ? (
          <>
            <Menu.Item
              key="cart"
              icon={<ShoppingCartOutlined />}
              onClick={() => navigate('/cart')}
            >
              Корзина
            </Menu.Item>
            <Menu.Item
              key="orders"
              icon={<UserOutlined />}
              onClick={() => navigate('/orders')}
            >
              Заказы
            </Menu.Item>
            <Menu.Item
              key="logout"
              icon={<LogoutOutlined />}
              onClick={handleLogout}
            >
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