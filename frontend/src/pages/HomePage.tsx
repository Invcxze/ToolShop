import { Button, Typography, Row, Col, Image, Divider } from 'antd'
import { useNavigate } from 'react-router-dom'
import { ShoppingCartOutlined, LoginOutlined, UserAddOutlined } from '@ant-design/icons'

const { Title, Paragraph } = Typography
import welcomeImage from '../assets/stroitelnye-magaziny-1-min.jpg'

const HomePage = () => {
  const navigate = useNavigate()

  return (
    <div style={{ maxWidth: '1200px', margin: 'auto', padding: '20px', textAlign: 'center' }}>
      <Title level={1} style={{ fontWeight: 'bold', color: '#1890ff' }}>
        Добро пожаловать в ToolShop!
      </Title>
      <Paragraph style={{ fontSize: '16px', color: '#555' }}>
        Откройте для себя лучший выбор товаров для дома, офиса и бизнеса. Мы предлагаем широкий ассортимент высококачественных инструментов и товаров по привлекательным ценам. Начните покупки прямо сейчас и убедитесь в этом сами!
      </Paragraph>

      {/* Изображение магазина или товаров */}
      <Image 
        src={welcomeImage}
        alt="Добро пожаловать в магазин"
        width="100%"
        style={{ borderRadius: '8px', marginTop: '20px' }}
        preview={false}
      />

      <Divider />

      <Title level={2} style={{ marginTop: '40px' }}>
        Что вас ждет в нашем магазине?
      </Title>
      <Row gutter={[16, 16]} justify="center" style={{ marginTop: '20px' }}>
        <Col span={6}>
          <Button 
            type="primary" 
            icon={<ShoppingCartOutlined />} 
            size="large" 
            block
            onClick={() => navigate('/products')}
          >
            Перейти к товарам
          </Button>
        </Col>
        <Col span={6}>
          <Button 
            type="default" 
            icon={<LoginOutlined />} 
            size="large" 
            block
            onClick={() => navigate('/login')}
          >
            Войти в личный кабинет
          </Button>
        </Col>
        <Col span={6}>
          <Button 
            type="default" 
            icon={<UserAddOutlined />} 
            size="large" 
            block
            onClick={() => navigate('/register')}
          >
            Регистрация
          </Button>
        </Col>
      </Row>

      <Divider />

      <Paragraph style={{ fontSize: '14px', color: '#888' }}>
        Мы всегда на связи! Если у вас возникнут вопросы, не стесняйтесь обращаться в нашу службу поддержки.
      </Paragraph>
    </div>
  )
}

export default HomePage