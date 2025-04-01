import { useEffect, useState } from "react"
import Header from "./header"
import { useNavigate } from "react-router-dom"

export default function Cart({token, setToken}) {
    const navigate = useNavigate()

    const [products, setProducts] = useState([])
    const [result, setResult] = useState()
    const [price, setPrice] = useState(0)

    function sort(data) {
        let list = []
        data.forEach(product => {
            if (!list.find(item => item.product_id === product.product_id)) {
                list.push({...product, "count": 1})
            } else list.find(item => item.product_id === product.product_id).count += 1
        });
        return list
    }

    async function get() {
        let api = await fetch("http://localhost:8000/api/shop/cart", {headers: {"Authorization": `Bearer ${token}`}})
        let data = await api.json()
        setProducts(sort(data.data))
        let full = 0
        for (let item of data.data) {
            full += item.price
        }
        setPrice(full)
    }

    useEffect(() => {get()}, [])

    function plus(id) {
        setProducts(products.map(product => {
            if (product.id === id) {
                product.count += 1
            }
            return product
        }))
    }

    function minus(id) {
        setProducts(products.map(product => {
            if (product.id === id) {
                product.count -= 1
            }
            return product
        }))
    }

    useEffect(() => {setResult(products.map(product => {
        return <div class="col">
        <div class="card mb-4 rounded-3 shadow-sm">
            <div class="card-header py-3">
                <h4 class="my-0 fw-normal">{product.name}</h4>
            </div>
            <div class="card-body">
                <h1 class="card-title pricing-card-title">{product.price}р.<small class="text-muted fw-light"> &times; {product.count}
                    шт.</small></h1>
                <p>{product.description}</p>

                <button type="button" class="btn btn-lg btn-info mb-3" onClick={() => plus(product.id)}>+</button>
                <button type="button" class="btn btn-lg btn-warning mb-3" onClick={() => minus(product.id)}>&minus;</button>
                <button type="button" class="btn btn-lg btn-outline-danger mb-3" onClick={() => del(product.id)}>Удалить из корзины</button>
            </div>
        </div>
    </div>

    }))}, [products])

    async function del(id) {
        let api = await fetch(`http://localhost:8000/api/shop/cart/${id}`, {method: "DELETE", headers: {"Authorization": `Bearer ${token}`}})
        if (api.ok) {
            get()
        }
    }

    async function add_order() {
        let api = await fetch(`http://localhost:8000/api/shop/order`, {method: "POST", headers: {"Authorization": `Bearer ${token}`}})
        if (api.ok) {
            navigate("../order")
        }
    }

    return <><header><Header token={token} setToken={setToken}></Header> <div class="pricing-header p-3 pb-md-4 mx-auto text-center">
    <h1 class="display-4 fw-normal">Корзина</h1>
</div></header><main><div class="row row-cols-1 row-cols-md-3 mb-3 text-center">{result}</div><div class="row justify-content-center gap-1">
            <h2 class="mb-5">Итоговая стоимость: {price}р.</h2>
            <button class="col-6 btn btn-lg btn-outline-secondary mb-3" type="button" onClick={() => navigate('../')}>Назад</button>
            {products.length === 0 ? '' : <button type="button" class="col-6 btn btn-lg btn-success mb-3" onClick={() => add_order()}>Оформить заказ</button>}

        </div></main></>
}