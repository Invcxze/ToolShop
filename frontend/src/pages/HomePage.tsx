import { Button, Typography, Row, Col, Image, Divider } from 'antd'
import { useNavigate } from 'react-router-dom'

const { Title, Paragraph } = Typography
import employee from '../assets/istockphoto-1167872833-612x612.jpg'

const HomePage = () => {
  const navigate = useNavigate()

  return (
    <div style={{ maxWidth: '1200px', margin: 'auto', padding: '20px' }}>
      <Title level={1}>Добро пожаловать в наш магазин</Title>
      <Paragraph>
        Мы рады приветствовать вас в нашем магазине. Здесь вы найдете все необходимые товары для вашего дома и офиса. Наша команда всегда готова помочь вам с выбором и предоставит лучшие предложения.
      </Paragraph>

      <Divider />

      <Title level={2}>Наша команда</Title>
      <Row gutter={[16, 16]}>
        {/* Фото сотрудников */}
        <Col span={8}>
          <Image
            width="100%"
            src={employee}
            alt="Сотрудник 1"
            preview={false}
          />
          <Title level={4}>Сотрудник 1</Title>
        </Col>
        <Col span={8}>
          <Image
            width="100%"
            src={employee}
            alt="Сотрудник 2"
            preview={false}
          />
          <Title level={4}>Сотрудник 2</Title>
        </Col>
        <Col span={8}>
          <Image
            width="100%"
            src={employee}
            alt="Сотрудник 3"
            preview={false}
          />
          <Title level={4}>Сотрудник 3</Title>
        </Col>
      </Row>

      <Divider />

      <Button
        type="primary"
        onClick={() => navigate('/login')}
        style={{ marginTop: '20px' }}
      >
        Войти в личный кабинет
      </Button>
    </div>
  )
}

export default HomePage