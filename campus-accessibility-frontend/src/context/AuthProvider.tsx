import { createContext, useContext, useState } from "react"
import { login } from "@/api/auth"
import type { LoginFields, LoginResponse } from "@/schemas/auth"


type AuthContextProps = {
    isAuthenticated: boolean
    token: string | null
    role: "Admin" | "Student" | null
    fullName: string | null
    loginUser: (fields: LoginFields) => Promise<LoginResponse>  // ← επιστρέφει response
    logoutUser: () => void
}


const AuthContext = createContext<AuthContextProps | undefined>(undefined)

function getFromStorage(key: string): string | null {
    return localStorage.getItem(key)
}

// Provider

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {

    const [token, setToken] = useState<string | null>(
        () => getFromStorage("token")
    )
    const [role, setRole] = useState<"Admin" | "Student" | null>(
        () => getFromStorage("role") as "Admin" | "Student" | null
    )
    const [fullName, setFullName] = useState<string | null>(
        () => getFromStorage("userName")
    )


    const loginUser = async (fields: LoginFields): Promise<LoginResponse> => {
        const res = await login(fields)

        // Αποθήκευση στο localStorage
        localStorage.setItem("token", res.token)
        localStorage.setItem("role", res.role)
        localStorage.setItem("userName", res.fullName)

        // Ενημέρωση state
        setToken(res.token)
        setRole(res.role)
        setFullName(res.fullName)

        return res  //επιστρέφει το response για το redirect
    }

    const logoutUser = () => {
        localStorage.removeItem("token")
        localStorage.removeItem("role")
        localStorage.removeItem("userName")


        setToken(null)
        setRole(null)
        setFullName(null)

    }

    return (
        <AuthContext.Provider value={{
            isAuthenticated: !!token,
            token,
            role,
            fullName,
            loginUser,
            logoutUser,
        }}>
            {children}
        </AuthContext.Provider>
    )
}

//hook
export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error("useAuth must be used within an AuthProvider")
    return ctx
}
