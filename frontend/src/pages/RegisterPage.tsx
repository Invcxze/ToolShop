import { useState } from 'react'
import { Form, Input, Button, Typography, message } from 'antd'
import { register } from '../api/auth'
import { useNavigate } from 'react-router-dom'

const { Title } = Typography

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (values: any) => {
    try {
      await register(values.name, values.email, values.password)
      message.success('Успешно зарегистрировано')
      navigate('/login')
    } catch (error) {
      message.error('Ошибка регистрации')
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: 'auto', marginTop: 50 }}>
      <Title level={3}>Регистрация</Title>
      <Form
        onFinish={handleSubmit}
        initialValues={{ name, email, password }}
        layout="vertical"
        style={{ width: '100%' }}
      >
        <Form.Item
          label="Имя"
          name="name"
          rules={[{ required: true, message: 'Пожалуйста, введите ваше имя!' }]}
        >
          <Input value={name} onChange={e => setName(e.target.value)} />
        </Form.Item>

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
            Зарегистрироваться
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}