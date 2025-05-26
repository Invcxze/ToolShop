import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Row,
  Col,
  Typography,
  message,
  Input,
  Select,
  Grid,
} from "antd";
import { useNavigate } from "react-router-dom";
import default_product_photo from "../assets/guitar.jpeg";
const { Title, Paragraph, Text } = Typography;
const { useBreakpoint } = Grid;
const BASE_URL = import.meta.env.VITE_API_BASE_URL;
import { ShoppingCartOutlined } from '@ant-design/icons';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  photo: string | null;
  category?: string | null;
  manufacturer?: string | null;
}

const S3_BASE_URL = "http://localhost:9000/local-bucket-shop/media";
const getProductImage = (p: Product) => {
  if (!p.photo) return default_product_photo;
  try {
    new URL(p.photo);
    return p.photo;
  } catch {
    return `${S3_BASE_URL}/${p.photo.replace(/^\/+/, "")}`;
  }
};

const ProductPage: React.FC = () => {
  const screens = useBreakpoint();
  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [price, setPrice] = useState<[number, number]>([0, 1_000_000]);
  const [sort, setSort] = useState("name_asc");
  const [categoryOptions, setCategoryOptions] = useState<string[]>([]);
  const [manufacturerOptions, setManufacturerOptions] = useState<string[]>([]);
  const [catFilter, setCatFilter] = useState<string | undefined>();
  const [manFilter, setManFilter] = useState<string | undefined>();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${BASE_URL}/shop/products`);
        if (!res.ok) throw new Error();
        const data = await res.json();

        const normalized: Product[] = data.data.map((p: any) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          price: Number(p.price),
          photo: p.photo,
          category: p.category ?? null,
          manufacturer: p.manufacturer ?? null,
        }));

        setProducts(normalized);
        setFiltered(normalized);

        const categories = [
          ...new Set(normalized.map((p) => p.category).filter((c) => c != null)),
        ] as string[];
        const manufacturers = [
          ...new Set(
            normalized.map((p) => p.manufacturer).filter((m) => m != null)
          ),
        ] as string[];

        setCategoryOptions(categories);
        setManufacturerOptions(manufacturers);
      } catch {
        message.error("Не удалось загрузить товары");
      }
    })();
  }, []);

  const applyFilters = (
    searchText = search,
    priceRange = price,
    sortOrder = sort,
    cat = catFilter,
    man = manFilter
  ) => {
    let res = products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(searchText.toLowerCase()) &&
          p.price >= priceRange[0] &&
          p.price <= priceRange[1] &&
          (!cat || p.category === cat) &&
          (!man || p.manufacturer === man)
      )
      .sort((a, b) => {
        switch (sortOrder) {
          case "price_asc":
            return a.price - b.price;
          case "price_desc":
            return b.price - a.price;
          case "name_desc":
            return b.name.localeCompare(a.name);
          default:
            return a.name.localeCompare(b.name);
        }
      });
    setFiltered(res);
  };

  const handleAddToCart = async (id: number) => {
    if (!token) {
      message.error("Авторизуйтесь!");
      navigate('/login');
      return;
    }
    try {
      const res = await fetch(`${BASE_URL}/shop/cart/${id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      message.success("Товар добавлен в корзину");
    } catch {
      message.error("Не удалось добавить товар");
    }
  };

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "auto",
        padding: screens.xs ? 16 : 24,
      }}
    >
      <Title
        level={screens.xs ? 3 : 1}
        style={{ marginBottom: screens.xs ? 16 : 24 }}
      >
        Каталог товаров
      </Title>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={6}>
          <Card
            bordered={false}
            style={{
              background: "#fff",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              borderRadius: 8,
            }}
          >
            <Title level={5} style={{ marginBottom: 16 }}>
              Фильтры
            </Title>

            <Input
              placeholder="Поиск по названию"
              value={search}
              onChange={(e) => {
                const q = e.target.value;
                setSearch(q);
                applyFilters(q);
              }}
              style={{ marginBottom: 16 }}
            />

            <div style={{ marginBottom: 16 }}>
              <Row gutter={8}>
                <Col xs={24} sm={12} style={{ marginBottom: screens.xs ? 8 : 0 }}>
                  <Input
                    addonBefore="От"
                    type="number"
                    placeholder="0"
                    value={price[0]}
                    onChange={(e) =>
                      setPrice([Number(e.target.value) || 0, price[1]])
                    }
                    onBlur={() => applyFilters()}
                    style={{ width: "100%" }}
                  />
                </Col>
                <Col xs={24} sm={12}>
                  <Input
                    addonBefore="До"
                    type="number"
                    placeholder="1000000"
                    value={price[1]}
                    onChange={(e) =>
                      setPrice([price[0], Number(e.target.value) || 1_000_000])
                    }
                    onBlur={() => applyFilters()}
                    style={{ width: "100%" }}
                  />
                </Col>
              </Row>
            </div>

            <Select
              allowClear
              placeholder="Категория"
              value={catFilter}
              options={categoryOptions.map((c) => ({ value: c, label: c }))}
              onChange={(v) => {
                setCatFilter(v);
                applyFilters(search, price, sort, v, manFilter);
              }}
              style={{ width: "100%", marginBottom: 16 }}
            />

            <Select
              allowClear
              placeholder="Производитель"
              value={manFilter}
              options={manufacturerOptions.map((m) => ({ value: m, label: m }))}
              onChange={(v) => {
                setManFilter(v);
                applyFilters(search, price, sort, catFilter, v);
              }}
              style={{ width: "100%", marginBottom: 16 }}
            />

            <Select
              value={sort}
              onChange={(v) => {
                setSort(v);
                applyFilters(search, price, v);
              }}
              options={[
                { value: "name_asc", label: "Название (А-Я)" },
                { value: "name_desc", label: "Название (Я-А)" },
                { value: "price_asc", label: "Цена по возрастанию" },
                { value: "price_desc", label: "Цена по убыванию" },
              ]}
              style={{ width: "100%" }}
            />
          </Card>
        </Col>

        <Col xs={24} md={18}>
          <Row gutter={[16, 16]}>
            {filtered.length === 0 ? (
              <Col span={24} style={{ textAlign: "center", padding: 40 }}>
                <Title level={4}>Товары не найдены</Title>
                <Paragraph type="secondary">
                  Попробуйте изменить параметры фильтров
                </Paragraph>
              </Col>
            ) : (
              filtered.map((p) => (
                <Col
                  key={p.id}
                  xs={24}
                  sm={12}
                  md={8}
                  lg={6}
                  style={{ marginBottom: 16 }}
                >
                  <Card
                    hoverable
                    onClick={() => navigate(`/products/${p.id}`)}
                    cover={
                      <div
                        style={{
                          position: "relative",
                          paddingTop: "100%",
                          backgroundColor: "#fafafa",
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
                            objectFit: "contain",
                            padding: 8,
                          }}
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src =
                              default_product_photo;
                          }}
                        />
                      </div>
                    }
                    actions={[
                        <Button
                          type="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(p.id);
                          }}
                          size={screens.xs ? "small" : "middle"}
                          icon={<ShoppingCartOutlined />}
                          style={{
                            width: screens.xs ? 'auto' : '100%',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: screens.xs ? 'flex-start' : 'center',
                            gap: 8,
                            padding: screens.xs ? '4px 8px' : '6px 15px',
                          }}
                        >
                          "В корзину"
                        </Button>
                    ]}
                  >
                    <Card.Meta
                      title={p.name}
                      description={
                        <>
                          <Paragraph
                            ellipsis={{ rows: 2 }}
                            style={{ marginBottom: 8, fontSize: 12 }}
                          >
                            {p.description}
                          </Paragraph>
                          <Text strong style={{ fontSize: 16 }}>
                            ${p.price.toFixed(2)}
                          </Text>
                        </>
                      }
                    />
                  </Card>
                </Col>
              ))
            )}
          </Row>
        </Col>
      </Row>
    </div>
  );
};

export default ProductPage;