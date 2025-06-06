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
import { ShoppingCartOutlined } from "@ant-design/icons";

const { Title, Paragraph, Text } = Typography;
const { useBreakpoint } = Grid;
const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const S3_BASE_URL = "http://172.19.0.2:9001/local-bucket-shop/media";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
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

        const categories = [...new Set(normalized.map((p) => p.category).filter(Boolean))] as string[];
        const manufacturers = [...new Set(normalized.map((p) => p.manufacturer).filter(Boolean))] as string[];

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
      navigate("/login");
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
        padding: screens.xs ? "0 12px" : "0 24px",
      }}
    >
      <Title
        level={screens.xs ? 3 : 1}
        style={{ marginBottom: screens.xs ? 16 : 24, paddingTop: screens.xs ? 16 : 24 }}
      >
        Каталог товаров
      </Title>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={6}>
          <Card bordered={false} style={{ borderRadius: 8 }}>
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

            <Row gutter={8} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <Input
                  addonBefore="От"
                  type="number"
                  value={price[0]}
                  onChange={(e) => setPrice([Number(e.target.value) || 0, price[1]])}
                  onBlur={() => applyFilters()}
                />
              </Col>
              <Col span={12}>
                <Input
                  addonBefore="До"
                  type="number"
                  value={price[1]}
                  onChange={(e) => setPrice([price[0], Number(e.target.value) || 1_000_000])}
                  onBlur={() => applyFilters()}
                />
              </Col>
            </Row>

            <Select
              allowClear
              placeholder="Категория"
              value={catFilter}
              onChange={(v) => {
                setCatFilter(v);
                applyFilters(search, price, sort, v, manFilter);
              }}
              options={categoryOptions.map((c) => ({ value: c, label: c }))}
              style={{ width: "100%", marginBottom: 16 }}
            />

            <Select
              allowClear
              placeholder="Производитель"
              value={manFilter}
              onChange={(v) => {
                setManFilter(v);
                applyFilters(search, price, sort, catFilter, v);
              }}
              options={manufacturerOptions.map((m) => ({ value: m, label: m }))}
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
                <Paragraph type="secondary">Попробуйте изменить параметры фильтров</Paragraph>
              </Col>
            ) : (
              filtered.map((p) => (
                <Col key={p.id} xs={24} sm={12} md={8} lg={6}>
                  <Card
                    hoverable
                    onClick={() => navigate(`/products/${p.id}`)}
                    actions={[
                      <Button
                        type="primary"
                        icon={<ShoppingCartOutlined />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(p.id);
                        }}
                      >
                        В корзину
                      </Button>,
                    ]}
                    style={{
                      borderRadius: 8,
                      height: 360,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                    cover={
                      <div
                        style={{
                          height: 180,
                          backgroundColor: "#fff",
                          borderBottom: "1px solid #f0f0f0",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          overflow: "hidden",
                        }}
                      >
                        <img
                          src={getProductImage(p)}
                          alt={p.name}
                          style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "cover" }}
                        />
                      </div>
                    }
                  >
                    <div>
                      <Title level={5} ellipsis={{ rows: 2 }}>{p.name}</Title>
                      <Text strong>{p.price.toLocaleString()} ₽</Text>
                    </div>
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