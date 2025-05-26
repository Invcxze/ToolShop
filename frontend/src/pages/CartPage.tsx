import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Row,
  Col,
  Typography,
  message,
  Grid,
  Space,
} from "antd";
import { useNavigate } from "react-router-dom";
import default_product_photo from "../assets/guitar.jpeg";
import { DeleteOutlined, ArrowLeftOutlined } from "@ant-design/icons";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const { Title, Paragraph, Text } = Typography;
const { useBreakpoint } = Grid;
const S3_BASE_URL = "http://localhost:9000/local-bucket-shop/media";

interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  photo: string | null;
  category?: string | null;
  manufacturer?: string | null;
}

const getProductImage = (p: Product) => {
  if (!p.photo) return default_product_photo;
  try {
    new URL(p.photo);
    return p.photo;
  } catch {
    return `${S3_BASE_URL}/${p.photo.replace(/^\/+/, "")}`;
  }
};

const CartPage: React.FC = () => {
  const [cart, setCart] = useState<Product[]>([]);
  const screens = useBreakpoint();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const fetchCart = async () => {
    if (!token) return;

    try {
      const res = await fetch(`${BASE_URL}/shop/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCart(data.data);
    } catch {
      message.error("Не удалось загрузить корзину");
    }
  };

  const handleRemove = async (id: number) => {
    if (!token) return;

    try {
      const res = await fetch(`${BASE_URL}/shop/cart/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      message.success("Товар удалён");
      fetchCart();
    } catch {
      message.error("Не удалось удалить товар");
    }
  };

  const handleCheckout = async () => {
    if (!token) {
      message.error("Пожалуйста, войдите в систему");
      navigate("/login");
      return;
    }

    if (cart.length === 0) {
      message.warning("Корзина пуста!");
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/shop/order`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const { data } = await res.json();
      window.location.href = data.checkout_url;
    } catch {
      message.error("Ошибка при оформлении заказа");
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "auto",
        padding: screens.xs ? "0 12px" : "0 24px",
      }}
    >
      <Title
        level={screens.xs ? 3 : 1}
        style={{ marginBottom: screens.xs ? 16 : 24, paddingTop: screens.xs ? 16 : 24 }}
      >
        Корзина
      </Title>

      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate("/products")}
        style={{ marginBottom: 24 }}
      >
        Назад к товарам
      </Button>

      {cart.length === 0 ? (
        <Paragraph type="secondary" style={{ textAlign: "center", marginTop: 40 }}>
          Ваша корзина пуста
        </Paragraph>
      ) : (
        <>
          <Row gutter={[16, 16]}>
            {cart.map((p) => (
              <Col key={p.id} xs={24} sm={12} md={8} lg={6}>
                <Card
                  hoverable
                  cover={
                    <div
                      style={{
                        position: "relative",
                        paddingTop: "100%",
                        backgroundColor: "#fff",
                        border: "1px solid #f0f0f0",
                        borderRadius: 8,
                        overflow: "hidden",
                        boxShadow: "0 1px 6px rgba(0, 0, 0, 0.1)",
                      }}
                    >
                      <img
                        src={getProductImage(p)}
                        alt={p.name}
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                  }
                  actions={[
                    <Button
                      type="primary"
                      icon={<DeleteOutlined />}
                      danger
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(p.id);
                      }}
                    >
                      Удалить
                    </Button>,
                  ]}
                  style={{ borderRadius: 8 }}
                >
                  <Title level={5}>{p.name}</Title>
                  <Text strong>{Number(p.price).toLocaleString()} ₽</Text>
                </Card>
              </Col>
            ))}
          </Row>

          <div
            style={{
              marginTop: 32,
              display: "flex",
              justifyContent: "center",
              width: "100%",
            }}
          >
            <Button
              type="primary"
              size="large"
              onClick={handleCheckout}
              style={{ width: screens.xs ? "100%" : 300, height: 48, fontSize: 16 }}
            >
              Оформить заказ
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default CartPage;