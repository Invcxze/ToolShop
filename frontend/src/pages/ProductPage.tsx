import React, { useEffect, useState } from "react";
import {
  Button, Card, Row, Col, Typography, message,
  Input, Select, Space, Tag
} from "antd";
import { useNavigate } from "react-router-dom";
import default_product_photo from '../assets/tools.jpg'
const { Title, Paragraph } = Typography;

interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  photo: string | null;
  category?: string | null;
  manufacturer?: string | null;
}

/* ---------- utils ---------- */
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

/* ---------- страница ---------- */
const ProductPage: React.FC = () => {
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

  /* --- загрузка товаров --- */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("http://localhost:8000/api/shop/products");
        if (!res.ok) throw new Error();
        const data = await res.json();

        const normalized: Product[] = data.data.map((p: any) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          price: p.price,
          photo: p.photo,
          category: p.category ?? null,
          manufacturer: p.manufacturer ?? null,
        }));
        setProducts(normalized);
        setFiltered(normalized);

        // наполняем выпадающие списки уникальными значениями
        setCategoryOptions(
          Array.from(new Set(normalized.map(p => p.category).filter(Boolean)))
            .sort()
        );
        setManufacturerOptions(
          Array.from(new Set(normalized.map(p => p.manufacturer).filter(Boolean)))
            .sort()
        );
      } catch {
        message.error("Не удалось загрузить товары");
      }
    })();
  }, []);

  /* --- фильтрация + сортировка --- */
  const applyFilters = (
    searchText = search,
    priceRange = price,
    sortOrder = sort,
    cat = catFilter,
    man = manFilter
  ) => {
    let res = products
      .filter(
        p =>
          p.name.toLowerCase().includes(searchText.toLowerCase()) &&
          parseFloat(p.price) >= priceRange[0] &&
          parseFloat(p.price) <= priceRange[1] &&
          (!cat || p.category === cat) &&
          (!man || p.manufacturer === man)
      );

    switch (sortOrder) {
      case "price_asc":
        res.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case "price_desc":
        res.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;
      case "name_desc":
        res.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        res.sort((a, b) => a.name.localeCompare(b.name));
    }
    setFiltered(res);
  };

  /* --- добавить в корзину --- */
  const handleAddToCart = async (id: number) => {
    if (!token) return message.error("Авторизуйтесь!");
    try {
      const res = await fetch(`http://localhost:8000/api/shop/cart/${id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      message.success("Товар добавлен в корзину");
    } catch {
      message.error("Не удалось добавить товар");
    }
  };

  /* ---------- render ---------- */
  return (
    <div style={{ maxWidth: 1200, margin: "auto", padding: 20 }}>
      <Title level={1}>Товары</Title>

      {/* поиск */}
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Input
            placeholder="Поиск по названию"
            value={search}
            onChange={e => {
              const q = e.target.value;
              setSearch(q);
              applyFilters(q);
            }}
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {/* ------------------ ФИЛЬТРЫ ------------------ */}
        <Col span={6}>
          <div style={{ border: "1px solid #e8e8e8", borderRadius: 8, padding: 20 }}>
            <Title level={4}>Фильтры</Title>

            {/* ЦЕНА */}
            <Title level={5}>Цена</Title>
            <Space.Compact style={{ marginBottom: 16 }}>
              <Input
                type="number"
                placeholder="От"
                value={price[0]}
                onChange={e =>
                  setPrice([Number(e.target.value) || 0, price[1]])
                }
                onBlur={() => applyFilters()}
              />
              <Input
                type="number"
                placeholder="До"
                value={price[1]}
                onChange={e =>
                  setPrice([price[0], Number(e.target.value) || 1_000_000])
                }
                onBlur={() => applyFilters()}
              />
            </Space.Compact>

            {/* КАТЕГОРИЯ */}
            <Title level={5}>Категория</Title>
            <Select
              allowClear
              placeholder="Все"
              value={catFilter}
              style={{ width: "100%", marginBottom: 16 }}
              options={categoryOptions.map(c => ({ value: c, label: c }))}
              onChange={v => {
                setCatFilter(v);
                applyFilters(search, price, sort, v, manFilter);
              }}
            />

            {/* ПРОИЗВОДИТЕЛЬ */}
            <Title level={5}>Производитель</Title>
            <Select
              allowClear
              placeholder="Все"
              value={manFilter}
              style={{ width: "100%", marginBottom: 16 }}
              options={manufacturerOptions.map(m => ({ value: m, label: m }))}
              onChange={v => {
                setManFilter(v);
                applyFilters(search, price, sort, catFilter, v);
              }}
            />

            {/* СОРТИРОВКА */}
            <Title level={5}>Сортировать</Title>
            <Select
              value={sort}
              style={{ width: "100%" }}
              onChange={v => {
                setSort(v);
                applyFilters(search, price, v);
              }}
              options={[
                { value: "name_asc", label: "Название (A‑Z)" },
                { value: "name_desc", label: "Название (Z‑A)" },
                { value: "price_asc", label: "Цена (↑)" },
                { value: "price_desc", label: "Цена (↓)" },
              ]}
            />
          </div>
        </Col>

        {/* ------------------ ТОВАРЫ ------------------ */}
        <Col span={18}>
          <Row gutter={[16, 16]}>
            {filtered.length === 0 ? (
              <Col span={24}>
                <Title level={3}>Нет товаров</Title>
              </Col>
            ) : (
              filtered.map(p => (
                <Col span={8} key={p.id}>
                  <Card
                    hoverable
                    onClick={() => navigate(`/products/${p.id}`)}
                    cover={
                      <img
                        src={getProductImage(p)}
                        alt={p.name}
                        style={{ width: "100%", height: 260, objectFit: "cover" }}
                        onError={e => {
                          (e.currentTarget as HTMLImageElement).src = default_product_photo;
                          e.currentTarget.style.objectFit = "contain";
                        }}
                      />
                    }
                    actions={[
                      <Button
                        type="primary"
                        onClick={e => {
                          e.stopPropagation();
                          handleAddToCart(p.id);
                        }}
                      >
                        В корзину
                      </Button>,
                    ]}
                  >
                    <Title level={4}>{p.name}</Title>

                    <Paragraph ellipsis={{ rows: 2 }} style={{ minHeight: 48 }}>
                      {p.description}
                    </Paragraph>

                    {/* выводим категорию и производителя, если есть */}
                    <Space size="small" wrap>
                      {p.category && <Tag color="blue">{p.category}</Tag>}
                      {p.manufacturer && <Tag color="green">{p.manufacturer}</Tag>}
                    </Space>

                    <Paragraph strong style={{ marginTop: 8 }}>
                      Цена: ${p.price}
                    </Paragraph>
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