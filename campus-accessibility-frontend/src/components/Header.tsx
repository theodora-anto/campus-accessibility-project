import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthProvider"
import { Button } from "@/components/ui/button"

const Header = ()=>{
    const { isAuthenticated, fullName, role, logoutUser } = useAuth()
    const navigate = useNavigate()

    const homePath = role === "Admin" ? "/admin/dashboard" : "/student/dashboard"

    const handleLogout = () => {
        logoutUser()
        navigate("/login")
    }

    return (
            <>
        <header
            role="banner"
            className="h-15 border-b border-border bg-card px-6 flex items-center justify-between"
        >
            {/* Logo */}
            <Link
                to={isAuthenticated ? homePath : "/login"}
                aria-label="AccessReport — αρχική"
                className="flex items-center gap-2.5 text-foreground no-underline"
            >
        <span
            className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground text-base"
            aria-hidden="true"
        >
          ♿
        </span>
                <span className="text-sm font-medium">AccessReport</span>
            </Link>

            {/* Nav */}
            <nav aria-label="Κύρια πλοήγηση" className="flex items-center gap-3">
                {isAuthenticated && fullName && (
                    <span className="text-sm text-muted-foreground" aria-live="polite">
            Καλωσήρθες, <strong className="text-foreground">{fullName}</strong>
          </span>
                )}

                {isAuthenticated && (
                    <Button variant="outline" size="sm" onClick={handleLogout}>
                        Αποσύνδεση
                    </Button>
                )}
            </nav>
        </header>
    </>
    )
}
export default Header;
