import { useEffect, useState } from 'react'
import { Layout, Menu, message, Grid, Dropdown, Button } from 'antd'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  ShoppingCartOutlined,
  UserOutlined,
  LogoutOutlined,
  AppstoreAddOutlined,
  MenuOutlined
} from '@ant-design/icons'
const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const { Header: AntHeader } = Layout
const { useBreakpoint } = Grid

const Header = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const screens = useBreakpoint()
  const token = localStorage.getItem('token')
  const [selectedKeys, setSelectedKeys] = useState<string[]>([])

  useEffect(() => {
    const pathToKey: Record<string, string> = {
      '/products': 'products',
      '/cart': 'cart',
      '/orders': 'orders'
    }
    setSelectedKeys([pathToKey[location.pathname] || ''])
  }, [location.pathname])

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

  const menuItems = [
    {
      key: 'products',
      label: 'Товары',
      icon: <AppstoreAddOutlined />,
      onClick: () => navigate('/products')
    },
    ...(token
      ? [
          {
            key: 'cart',
            label: 'Корзина',
            icon: <ShoppingCartOutlined />,
            onClick: () => navigate('/cart')
          },
          {
            key: 'orders',
            label: 'Заказы',
            icon: <UserOutlined />,
            onClick: () => navigate('/orders')
          },
          {
            key: 'logout',
            label: 'Выйти',
            icon: <LogoutOutlined />,
            onClick: handleLogout
          }
        ]
      : [
          {
            key: 'login',
            label: 'Войти',
            onClick: () => navigate('/login')
          },
          {
            key: 'register',
            label: 'Регистрация',
            onClick: () => navigate('/register')
          }
        ])
  ]

  const menu = (
    <Menu
      selectedKeys={selectedKeys}
      items={menuItems.map(item => ({
        key: item.key,
        label: item.label,
        icon: screens.md ? item.icon : null,
        onClick: item.onClick
      }))}
    />
  )

  return (
    <AntHeader style={{
      background: '#fff',
      padding: screens.xs ? '0 10px' : '0 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      <Link
        to="/"
        style={{
          fontSize: screens.xs ? '16px' : '20px',
          fontWeight: 'bold',
          whiteSpace: 'nowrap'
        }}>
        MusicShop
      </Link>

      {screens.md ? (
        <Menu
          mode="horizontal"
          selectedKeys={selectedKeys}
          items={menuItems.map(item => ({
            key: item.key,
            label: item.label,
            icon: item.icon,
            onClick: item.onClick
          }))}
          style={{
            flex: 1,
            minWidth: 0,
            justifyContent: 'flex-end',
            borderBottom: 'none'
          }}
        />
      ) : (
        <Dropdown overlay={menu} trigger={['click']}>
          <Button
            type="text"
            icon={<MenuOutlined />}
            style={{ fontSize: '16px' }}
          />
        </Dropdown>
      )}
    </AntHeader>
  )
}

export default Header