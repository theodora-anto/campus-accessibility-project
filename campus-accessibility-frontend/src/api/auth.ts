import type { LoginFields, RegisterFields, LoginResponse } from "../schemas/auth.ts"

const API_URL = import.meta.env.VITE_API_URL
console.log("API_URL is:", API_URL)
// Login
export async function login({ email, password }: LoginFields): Promise<LoginResponse> {
    const res = await fetch(API_URL + "/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    })

    if (!res.ok) {
        let detail = "Login Failed"
        try {
            const data = await res.json()
            if (typeof data?.message === "string") detail = data.message
        } catch (error) {
            console.error("Error parsing login response", error)
        }
        throw new Error(detail)
    }

    return await res.json()
}

//Register
export async function register(data: RegisterFields): Promise<void> {
    const res = await fetch(API_URL + "/auth/register/student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),   //το backend επιστρέφει 201 Created ΧΩΡΙΣ κανένα JSON body
                                       // res.json() — θα έσκαγε πάνω σε κενό body ("Unexpected end of JSON input")
    })

    if (!res.ok) {
        let detail = "Registration failed"
        try {
            const data = await res.json()
            if (typeof data?.message === "string") detail = data.message
        } catch (error) {
            console.error("Error parsing register response", error)
        }
        throw new Error(detail)
    }
}
