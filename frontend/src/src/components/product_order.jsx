import { useEffect, useState } from "react"
import Header from "./header"

export default function ProductOrder({ids}) {
    const [products, setProducts] = useState([])
    const [result, setResult] = useState()

    async function get() {
        let api = await fetch("http://localhost:8000/api/shop/products")
        let data = await api.json()
        let list = []
        for (let product of data.data) {
            if (ids.includes(product.id)) {
                list.push(product)
            }
        }
        setProducts(list)
    }

    useEffect(() => {get()}, [])

    useEffect(() => {setResult(products.map(product => {
        return <div class="col">
        <div class="card mb-4 rounded-3 shadow-sm">
            <div class="card-header py-3">
                <h4 class="my-0 fw-normal">{product.name}</h4>
            </div>
            <div class="card-body">
                <h1 class="card-title pricing-card-title">{product.price}р.<small class="text-muted fw-light"> &times; 2 шт.</small></h1>
                <p>{product.description}</p>
            </div>
        </div>
    </div>

    }))}, [products])

    return result
}