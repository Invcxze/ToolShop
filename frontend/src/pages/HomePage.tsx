import { Button, Typography, Row, Col, Image, Divider, Grid } from 'antd'
import { useNavigate } from 'react-router-dom'
import { ShoppingCartOutlined, LoginOutlined, UserAddOutlined } from '@ant-design/icons'

const { Title, Paragraph } = Typography
const { useBreakpoint } = Grid
import welcomeImage from '../assets/IMG_7817.jpeg'

const HomePage = () => {
  const navigate = useNavigate()
  const screens = useBreakpoint()

  return (
    <div style={{
      maxWidth: '1200px',
      margin: 'auto',
      padding: screens.xs ? '10px' : '20px',
      textAlign: 'center'
    }}>
      <Title
        level={screens.xs ? 2 : 1}
        style={{
          fontWeight: 'bold',
          color: '#1890ff',
          fontSize: screens.xs ? '24px' : '38px',
          margin: screens.xs ? '12px 0' : '20px 0'
        }}
      >
        Добро пожаловать в MusicShop!
      </Title>

      <Paragraph style={{
        fontSize: screens.xs ? '14px' : '16px',
        color: '#555',
        lineHeight: screens.xs ? 1.5 : 1.7
      }}>
        Откройте для себя лучший выбор товаров. Мы предлагаем широкий ассортимент высококачественных музыкальных инструментов и товаров по привлекательным ценам. Начните покупки прямо сейчас и убедитесь в этом сами!
      </Paragraph>

      <div style={{
        maxHeight: screens.xs ? '250px' : 'none',
        overflow: 'hidden',
        borderRadius: '8px',
        marginTop: screens.xs ? '12px' : '20px'
      }}>
        <Image
          src={welcomeImage}
          alt="Добро пожаловать в магазин"
          style={{
            width: '100%',
            height: 'auto',
            objectFit: 'cover'
          }}
          preview={false}
        />
      </div>

      <Divider style={{ margin: screens.xs ? '16px 0' : '24px 0' }} />

      <Title
        level={screens.xs ? 3 : 2}
        style={{
          marginTop: screens.xs ? '24px' : '40px',
          fontSize: screens.xs ? '20px' : '30px'
        }}
      >
        Что вас ждет в нашем магазине?
      </Title>

      <Row
        gutter={[16, 16]}
        justify="center"
        style={{ marginTop: screens.xs ? '12px' : '20px' }}
      >
        <Col xs={24} md={8} style={{ padding: screens.xs ? '4px' : '8px' }}>
          <Button
            type="primary"
            icon={<ShoppingCartOutlined />}
            size={screens.xs ? 'middle' : 'large'}
            block
            onClick={() => navigate('/products')}
          >
            Перейти к товарам
          </Button>
        </Col>
        <Col xs={24} md={8} style={{ padding: screens.xs ? '4px' : '8px' }}>
          <Button
            type="default"
            icon={<LoginOutlined />}
            size={screens.xs ? 'middle' : 'large'}
            block
            onClick={() => navigate('/login')}
          >
            Войти в личный кабинет
          </Button>
        </Col>
        <Col xs={24} md={8} style={{ padding: screens.xs ? '4px' : '8px' }}>
          <Button
            type="default"
            icon={<UserAddOutlined />}
            size={screens.xs ? 'middle' : 'large'}
            block
            onClick={() => navigate('/register')}
          >
            Регистрация
          </Button>
        </Col>
      </Row>

      <Divider style={{ margin: screens.xs ? '16px 0' : '24px 0' }} />

      <Paragraph style={{
        fontSize: screens.xs ? '12px' : '14px',
        color: '#888',
        marginBottom: screens.xs ? 8 : 16
      }}>
        Мы всегда на связи! Если у вас возникнут вопросы, не стесняйтесь обращаться в нашу службу поддержки.
      </Paragraph>
    </div>
  )
}

export default HomePage