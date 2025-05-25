import { useState } from 'react'
import { Form, Input, Button, Typography, message, Grid } from 'antd'
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons'
import { register } from '../api/auth'
import { useNavigate } from 'react-router-dom'

const { Title, Link } = Typography
const { useBreakpoint } = Grid

export default function RegisterPage() {
  const [loading, setLoading] = useState(false)
  const screens = useBreakpoint()
  const navigate = useNavigate()

  const handleSubmit = async (values: { name: string; email: string; password: string }) => {
    try {
      setLoading(true)
      await register(values.name, values.email, values.password)
      message.success('Регистрация прошла успешно!')
      navigate('/login')
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Ошибка регистрации')
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
        Создать аккаунт
      </Title>

      <Form
        onFinish={handleSubmit}
        layout="vertical"
        size={screens.xs ? 'middle' : 'large'}
        style={{ width: '100%' }}
      >
        <Form.Item
          name="name"
          rules={[
            { required: true, message: 'Введите ваше имя' },
            { min: 2, message: 'Минимум 2 символа' }
          ]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="Имя"
            autoComplete="name"
          />
        </Form.Item>

        <Form.Item
          name="email"
          rules={[
            { required: true, message: 'Введите email' },
            { type: 'email', message: 'Неверный формат email' }
          ]}
        >
          <Input
            prefix={<MailOutlined />}
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
            autoComplete="new-password"
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
            Зарегистрироваться
          </Button>
        </Form.Item>
      </Form>

      <div style={{
        marginTop: screens.xs ? 24 : 32,
        textAlign: 'center',
        fontSize: screens.xs ? 14 : 16
      }}>
        <Typography.Text>
          Уже есть аккаунт?{' '}
          <Link
            href="/login"
            strong
            style={{ color: '#1890ff' }}
          >
            Войти
          </Link>
        </Typography.Text>
      </div>
    </div>
  )
}