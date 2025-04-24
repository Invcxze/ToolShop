import { useState } from 'react'
import { Form, Input, Button, Typography, message, Space } from 'antd'
import { login } from '../api/auth'
import { useNavigate } from 'react-router-dom'

const { Title } = Typography

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (values: any) => {
    try {
      const data = await login(values.email, values.password)
      localStorage.setItem('token', data.token)
      navigate('/')
    } catch (error) {
      message.error('Ошибка входа')
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: 'auto', marginTop: 50 }}>
      <Title level={3}>Вход</Title>
      <Form
        onFinish={handleSubmit}
        initialValues={{ email, password }}
        layout="vertical"
        style={{ width: '100%' }}
      >
        <Form.Item
          label="Email"
          name="email"
          rules={[{ required: true, message: 'Пожалуйста, введите ваш email!' }]}
        >
          <Input value={email} onChange={e => setEmail(e.target.value)} />
        </Form.Item>

        <Form.Item
          label="Пароль"
          name="password"
          rules={[{ required: true, message: 'Пожалуйста, введите ваш пароль!' }]}
        >
          <Input.Password value={password} onChange={e => setPassword(e.target.value)} />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Войти
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}