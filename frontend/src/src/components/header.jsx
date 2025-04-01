import { Link, useNavigate } from "react-router-dom";

export default function Header({token, setToken}) {

    let navigate = useNavigate()

    async function logout() {
        let api = await fetch('http://localhost:8000/api/users/logout/', {headers: {"Authorization": `Bearer ${token}`}})
        if (api.ok) {
            navigate('../')
            setToken('')
        }
    }

    return <div class="d-flex flex-column flex-md-row align-items-center pb-3 mb-4 border-bottom">
    <Link to="/" class="d-flex align-items-center text-dark text-decoration-none">
        <span class="fs-4">«MyShop»</span>
    </Link>

    <nav class="d-inline-flex mt-2 mt-md-0 ms-md-auto">
        {!token ?<Link class="me-3 py-2 text-dark text-decoration-none" to="../signup">Регистрация</Link> : ''}
        {!token ?<Link class="me-3 py-2 text-dark text-decoration-none" to="../login">Авторизация</Link> : <a class="me-3 py-2 text-dark text-decoration-none" href="" onClick={() => logout()}>Выйти</a>}
        {token ?<Link class="me-3 py-2 text-dark text-decoration-none" to="../order">Мои заказы</Link> : ''}
        {token ?<Link class="me-3 py-2 text-dark text-decoration-none" to="../cart">Корзина</Link> : ''}
    </nav>
</div>
}