import { useState } from "react"
import { useNavigate, useLocation, Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/context/AuthProvider"
import { loginSchema, type LoginFields } from "@/schemas/auth"

export default function LoginPage () {
  const navigate = useNavigate()
  const { loginUser } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const location = useLocation()

  // Αν ο χρήστης ήρθε εδώ επειδή προσπάθησε να ανοίξει μια προστατευμένη
  // σελίδα χωρίς να είναι συνδεδεμένος, το StudentRoute/AdminRoute έχει
  // ήδη αποθηκεύσει το αρχικό του location μέσα στο navigation state.
  const from = (location.state as { from?: Location })?.from?.pathname

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFields>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFields) => {
    try {
      const response = await loginUser(data)
      toast.success("Επιτυχής σύνδεση!")

      // Το αποθηκευμένο "from" μπορεί να προέρχεται από διαφορετικό ρόλο από
      // αυτόν που μόλις συνδέθηκε (π.χ. ένας μη συνδεδεμένος χρήστης
      // προσπάθησε να ανοίξει /admin/dashboard, το StudentRoute/AdminRoute
      // τον έστειλε στο login με from="/admin/dashboard", αλλά μετά συνδέεται
      // ως Student). Αν το χρησιμοποιούσαμε τυφλά, το AdminRoute θα τον έστελνε
      // ξανά στο login με το ίδιο "from" — ατέρμονο redirect loop.
      // Άρα το "from" χρησιμοποιείται μόνο αν ταιριάζει με τον ρόλο του χρήστη.
      const roleHome = response.role === "Admin" ? "/admin/dashboard" : "/student/dashboard"
      const rolePrefix = response.role === "Admin" ? "/admin" : "/student"
      const destination = from && from.startsWith(rolePrefix) ? from : roleHome

      navigate(destination, { replace: true })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Αδυναμία σύνδεσης. Δοκιμάστε ξανά.")
    }
  }

  return (
      <>
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="w-full max-w-sm bg-card border border-border rounded-xl p-8 shadow-sm">

            {/* Header */}
            <div className="mb-6">
              <h1 className="text-xl font-medium text-foreground">Σύνδεση</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Χρησιμοποιήστε τα στοιχεία του πανεπιστημιακού σας λογαριασμού
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">

              {/* Email */}
              <Field data-invalid={!!errors.email}>
                <FieldLabel htmlFor="email">
                  Ακαδημαϊκό email
                  <span className="text-destructive ml-1" aria-hidden="true">*</span>
                </FieldLabel>
                <Input
                    id="email"
                    type="email"
                    placeholder="p12345@student.uoa.gr"
                    autoComplete="email"
                    aria-required="true"  //λέει στους screen readers ότι είναι υποχρεωτικό πεδίο
                    aria-invalid={!!errors.email} //για να διαβάσει μήνυμα του error
                    aria-describedby={errors.email ? "email-error" : undefined}
                    {...register("email")}
                />
                <FieldError id="email-error" errors={errors.email ? [errors.email] : undefined} />
              </Field>

              {/* Password */}
              <Field data-invalid={!!errors.password}>
                <FieldLabel htmlFor="password">
                  Κωδικός πρόσβασης
                  <span className="text-destructive ml-1" aria-hidden="true">*</span>
                </FieldLabel>
                <div className="relative">
                  <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      aria-required="true"
                      aria-invalid={!!errors.password}
                      aria-describedby={errors.password ? "password-error" : undefined}
                      className="pr-12"
                      {...register("password")}
                  />
                  <button
                      type="button"
                      onClick={() => setShowPassword(v => !v)}
                      aria-label={showPassword ? "Απόκρυψη κωδικού" : "Εμφάνιση κωδικού"}
                      aria-pressed={showPassword}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
                  >
                    {showPassword ? (
                        <EyeOff className="h-4 w-4" aria-hidden="true" />
                    ) : (
                        <Eye className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
                <FieldError id="password-error" errors={errors.password ? [errors.password] : undefined} />
              </Field>

              {/* Submit */}
              <Button
                  type="submit"
                  disabled={isSubmitting}
                  aria-busy={isSubmitting}
                  className="w-full"
              >
                {isSubmitting ? "Σύνδεση…" : "Σύνδεση"}
              </Button>

            </form>

            {/* Register link */}
            <p className="text-sm text-muted-foreground text-center mt-5">
              Δεν έχετε λογαριασμό;{" "}
              <Link to="/register" className="font-medium text-primary hover:underline">
                Εγγραφή
              </Link>
            </p>

          </div>
        </div>
      </>
  )
}
