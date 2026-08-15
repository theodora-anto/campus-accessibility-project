import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel, FieldError, FieldDescription } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"
import { registerSchema, type RegisterFields } from "@/schemas/auth"
import { SCHOOLS, DEPARTMENTS } from "@/data/departments"
import { register as registerStudent } from "@/api/auth"

export default function SignupPage ()  {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFields>({
    resolver: zodResolver(registerSchema),
  })

  const selectedSchoolLabel = watch("school")
  const selectedSchoolKey = SCHOOLS.find((s) => s.label === selectedSchoolLabel)?.value
  const departmentOptions = selectedSchoolKey ? DEPARTMENTS[selectedSchoolKey] ?? [] : []
//label που επέλεξε → βρες το αντίστοιχο εσωτερικό key → χρησιμοποίησε το key για να τραβήξεις τη σωστή λίστα τμημάτων από το DEPARTMENTS object → αν κάτι λείπει σε οποιοδήποτε βήμα, γύρνα κενό array

  const onSubmit = async (data: RegisterFields) => {
    try {
      await registerStudent(data)
      toast.success("Ο λογαριασμός δημιουργήθηκε! Συνδεθείτε για να συνεχίσετε.")
      navigate("/login")
    } catch (error) {
      toast.error(
          error instanceof Error ? error.message : "Η εγγραφή απέτυχε. Δοκιμάστε ξανά."
      )
    }
  }

  return (
      <>
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="w-full max-w-md bg-card border border-border rounded-xl p-8 shadow-sm">

            {/* Header */}
            <div className="mb-6">
              <h1 className="text-xl font-medium text-foreground">Δημιουργία λογαριασμού</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Συμπληρώστε τα στοιχεία σας για να εγγραφείτε
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
              {/*noValidate για να μην τρέξει πρωτα έλεγχος browser*/}

              {/* Firstname / Lastname */}
              <div className="grid grid-cols-2 gap-4">
                <Field data-invalid={!!errors.firstname}>
                  {/* data-invalid={!!errors.school} κόκκινο styling στα errors */}
                  <FieldLabel htmlFor="firstname">
                    Όνομα
                    <span className="text-destructive ml-1" aria-hidden="true">*</span>
                  {/*aria-hidden="true" μην διαβάσεις στον αναγνώστη οθόνης = διακοσμητικό στοιχείο */}
                  </FieldLabel>
                  <Input
                      id="firstname"
                      type="text"
                      placeholder="Μαρία"
                      autoComplete="given-name"  //xρήσιμο για κινητική αναπηρία
                      aria-required="true"
                      aria-invalid={!!errors.firstname}  //Λέει στον screen reader: "αυτό το πεδίο αυτή τη στιγμή έχει άκυρη/λανθασμένη τιμή
                      aria-describedby={errors.firstname ? "firstname-error" : undefined}
                      {...register("firstname")}
                  />
                  <FieldError id="firstname-error" errors={errors.firstname ? [errors.firstname] : undefined} />
                </Field>

                <Field data-invalid={!!errors.lastname}>
                  <FieldLabel htmlFor="lastname">
                    Επώνυμο
                    <span className="text-destructive ml-1" aria-hidden="true">*</span>
                  </FieldLabel>
                  <Input
                      id="lastname"
                      type="text"
                      placeholder="Παπαδοπούλου"
                      autoComplete="family-name"
                      aria-required="true"
                      aria-invalid={!!errors.lastname}
                      aria-describedby={errors.lastname ? "lastname-error" : undefined}
                      {...register("lastname")}
                  />
                  <FieldError id="lastname-error" errors={errors.lastname ? [errors.lastname] : undefined} />
                </Field>
              </div>

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
                    aria-required="true"
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-error" : undefined}
                    {...register("email")}
                />
                <FieldError id="email-error" errors={errors.email ? [errors.email] : undefined} />
              </Field>

              {/* School / Department */}
              <div className="grid grid-cols-2 gap-4">
                <Field data-invalid={!!errors.school}>
                  <FieldLabel htmlFor="school">
                    Σχολή
                    <span className="text-destructive ml-1" aria-hidden="true">*</span>
                  </FieldLabel>
                  <Controller
                      name="school"
                      control={control}
                      render={({ field }) => (
                          <Select
                              value={field.value}
                              onValueChange={(value) => {
                                field.onChange(value)
                                setValue("department", "")
                              }}
                          >
                            {/*ορατό κουμπί που βλέπει ο χρήστης (πριν ανοίξει το dropdown). Εδώ μπαίνουν όλα τα accessibility attributes*/}
                            <SelectTrigger
                                id="school"
                                aria-required="true"
                                aria-invalid={!!errors.school}
                                aria-describedby={errors.school ? "school-error" : undefined}
                            >
                              <SelectValue placeholder="Επιλέξτε…" />
                            </SelectTrigger>
                            <SelectContent>
                              {SCHOOLS.map((s) => (
                                  <SelectItem key={s.value} value={s.label}>
                                    {s.label}
                                  </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                      )}
                  />
                  <FieldError id="school-error" errors={errors.school ? [errors.school] : undefined} />
                </Field>

                <Field data-invalid={!!errors.department}>
                  <FieldLabel htmlFor="department">
                    Τμήμα
                    <span className="text-destructive ml-1" aria-hidden="true">*</span>
                  </FieldLabel>
                  <Controller
                      name="department"
                      control={control}
                      render={({ field }) => (
                          <Select
                              value={field.value}
                              onValueChange={field.onChange}
                              disabled={!selectedSchoolKey}
                          >
                            <SelectTrigger
                                id="department"
                                aria-required="true"
                                aria-invalid={!!errors.department}
                                aria-describedby={errors.department ? "department-error" : undefined}
                            >
                              <SelectValue
                                  placeholder={selectedSchoolKey ? "Επιλέξτε τμήμα…" : "Επιλέξτε πρώτα σχολή…"}
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {departmentOptions.map((d) => (
                                  <SelectItem key={d} value={d}>
                                    {d}
                                  </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                      )}
                  />
                  <FieldError id="department-error" errors={errors.department ? [errors.department] : undefined} />
                </Field>
              </div>

              {/* Password */}
              <Field data-invalid={!!errors.password}>
                <FieldLabel htmlFor="password">
                  Κωδικός
                  <span className="text-destructive ml-1" aria-hidden="true">*</span>
                </FieldLabel>
                <div className="relative">
                  <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      aria-required="true"
                      aria-invalid={!!errors.password}
                      aria-describedby={
                        errors.password ? "password-hint password-error" : "password-hint"
                      }
                      className="pr-12"
                      {...register("password")}
                  />
                  <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? "Απόκρυψη κωδικού" : "Εμφάνιση κωδικού"}
                      aria-pressed={showPassword} //Λέει στον screen reader ποια από τις δύο καταστάσεις είναι ενεργή αυτή τη στιγμή
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
                  >
                    {showPassword ? (
                        <EyeOff className="h-4 w-4" aria-hidden="true" />
                    ) : (
                        <Eye className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
                <FieldDescription id="password-hint">
                  Τουλάχιστον 8 χαρακτήρες, με κεφαλαίο, πεζό, αριθμό και ειδικό χαρακτήρα.
                </FieldDescription>
                <FieldError id="password-error" errors={errors.password ? [errors.password] : undefined} />
              </Field>

              {/* Confirm Password */}
              <Field data-invalid={!!errors.confirmPassword}>
                <FieldLabel htmlFor="confirmPassword">
                  Επιβεβαίωση κωδικού
                  <span className="text-destructive ml-1" aria-hidden="true">*</span>
                </FieldLabel>
                <div className="relative">
                  <Input
                      id="confirmPassword"
                      type={showConfirm ? "text" : "password"}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      aria-required="true"
                      aria-invalid={!!errors.confirmPassword}
                      aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
                      className="pr-12"
                      {...register("confirmPassword")}
                  />
                  <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      aria-label={showConfirm ? "Απόκρυψη κωδικού" : "Εμφάνιση κωδικού"}
                      aria-pressed={showConfirm}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
                  >
                    {showConfirm ? (
                        <EyeOff className="h-4 w-4" aria-hidden="true" />
                    ) : (
                        <Eye className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
                <FieldError id="confirmPassword-error" errors={errors.confirmPassword ? [errors.confirmPassword] : undefined} />
              </Field>

              {/* Submit */}
              <Button
                  type="submit"
                  disabled={isSubmitting}
                  aria-busy={isSubmitting}   //λέει στον αναγνώστη ότι το στοιχείο είναι σε κατάσταση isSubmitting (ανενεργό κουμπί)
                  className="w-full"
              >
                {isSubmitting ? "Δημιουργία…" : "Δημιουργία λογαριασμού"}
              </Button>

            </form>

            {/* Login link */}
            <p className="text-sm text-muted-foreground text-center mt-5">
              Έχετε ήδη λογαριασμό;{" "}
              <Link to="/login" className="font-medium text-primary hover:underline">
                Σύνδεση
              </Link>
            </p>

          </div>
        </div>
      </>
  )
}

