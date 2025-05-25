import { useState } from 'react'
import { Form, Input, Button, Typography, message, Grid } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { login } from '../api/auth'
import { useNavigate } from 'react-router-dom'

const { Title, Link } = Typography
const { useBreakpoint } = Grid

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const screens = useBreakpoint()
  const navigate = useNavigate()

  const handleSubmit = async (values: { email: string; password: string }) => {
    try {
      setLoading(true)
      const data = await login(values.email, values.password)
      localStorage.setItem('token', data.data.user_token)
      message.success('Добро пожаловать!')
      navigate('/')
    } catch (error) {
      message.error('Неверный email или пароль')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      maxWidth: screens.xs ? '90%' : 400,
      margin: 'auto',
      padding: screens.xs ? '24px 0' : '40px 0',
      minHeight: 'calc(100vh - 64px)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center'
    }}>
      <Title
        level={screens.xs ? 3 : 1}
        style={{
          textAlign: 'center',
          marginBottom: screens.xs ? 24 : 32,
          fontSize: screens.xs ? 24 : 32
        }}
      >
        Вход в аккаунт
      </Title>

      <Form
        onFinish={handleSubmit}
        layout="vertical"
        size={screens.xs ? 'middle' : 'large'}
        style={{ width: '100%' }}
      >
        <Form.Item
          name="email"
          rules={[
            { required: true, message: 'Введите email' },
            { type: 'email', message: 'Неверный формат email' }
          ]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="Email"
            autoComplete="email"
          />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[
            { required: true, message: 'Введите пароль' },
            { min: 6, message: 'Минимум 6 символов' }
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Пароль"
            autoComplete="current-password"
          />
        </Form.Item>

        <Form.Item style={{ marginTop: 32 }}>
          <Button
            type="primary"
            htmlType="submit"
            block
            loading={loading}
            style={{ height: screens.xs ? 44 : 40 }}
          >
            Войти
          </Button>
        </Form.Item>
      </Form>

      <div style={{
        marginTop: screens.xs ? 24 : 32,
        textAlign: 'center',
        fontSize: screens.xs ? 14 : 16
      }}>
        <Typography.Text>
          Нет аккаунта?{' '}
          <Link
            href="/register"
            strong
            style={{ color: '#1890ff' }}
          >
            Создать аккаунт
          </Link>
        </Typography.Text>
      </div>
    </div>
  )
}