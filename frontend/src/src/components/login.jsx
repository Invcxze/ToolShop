import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Header from "./header"

export default function Login({token, setToken}) {

    const navigate = useNavigate()
    const [email, setEmail] = useState()
    const [pass, setPass] = useState()
    const [error, setError] = useState({"code": '', "message": "", "errors": {"password": '', "email": ""}})

    async function log(event) {
        event.preventDefault()
        let api = await fetch("http://localhost:8000/api/users/login/", {method: "POST", headers: {'Content-Type': "application/json"}, body: JSON.stringify({"email": email, "password": pass})})
        let data = await api.json()
        if (api.ok) {
            setToken(data.data.user_token)
            navigate("../")
        } else setError(data.error)
    }

    return  <><header>
    <Header></Header>
    <div class="pricing-header p-3 pb-md-4 mx-auto text-center">
        <h1 class="display-4 fw-normal">Авторизация</h1>
    </div>
</header><main>
    <div class="row row-cols-1 row-cols-md-3 mb-3 text-center justify-content-center">
        <div class="col">
            <div class="row">
                <form onSubmit={(event) => log(event)}>
                    <div class="form-floating mb-3">
                        <input type="email" style={error.code === 422 && error.errors.email ? {borderColor: "red"} : {}} value={email} onChange={(event) => setEmail(event.target.value)} class="form-control" id="floatingInput" placeholder="name@example.com" />
                        <label for="floatingInput">Email</label>
                        {error.code === 422 ? error.errors.email : ''}
                    </div>
                    <div class="form-floating mb-3">
                        <input type="password" style={error.code === 422 && error.errors.password ? {borderColor: "red"} : {}} value={[pass]} onChange={(event) => setPass(event.target.value)} class="form-control" id="floatingPassword" placeholder="Password" />
                        <label for="floatingPassword">Password</label>
                        {error.code === 422 ? error.errors.password : ''}
                    </div>

                    <button class="w-100 btn btn-lg btn-success mb-3" type="submit">Войти</button>
                    {error.message}
                    <button class="w-100 btn btn-lg btn-outline-secondary" type="submit" onClick={() => navigate("../")}>Назад</button>
                </form>
            </div>

        </div>
    </div>
</main>
    </>
}