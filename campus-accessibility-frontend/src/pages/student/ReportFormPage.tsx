import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import Layout from "@/components/Layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldLabel, FieldError, FieldDescription } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Camera, X, CheckCircle2 } from "lucide-react"
import { createComplaint } from "@/api/complaints"
import { complaintFormSchema, type ComplaintFormFields } from "@/schemas/complaint"
import { SCHOOLS, DEPARTMENTS } from "@/data/departments"
import { CATEGORIES } from "@/data/categories"

const MAX_IMAGES = 5
const MAX_FILE_MB = 5


//Β οηθητικές συναρτήσεις για τις ημερομηνίες
// Μορφοποιεί την πληκτρολόγηση σε ΗΗ/ΜΜ/ΕΕΕΕ καθώς γράφει ο χρήστης
function formatDateInput(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8)
  if (digits.length >= 5) return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
  if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`
  return digits
}

// Μετατρέπει ΗΗ/ΜΜ/ΕΕΕΕ σε YYYY-MM-DD (για να επιστραφεί στο backend)
function toIsoDate(ddmmyyyy: string): string {
  const [dd, mm, yyyy] = ddmmyyyy.split("/")
  return `${yyyy}-${mm}-${dd}`
}

export default function ReportFormPage() {
  const navigate = useNavigate()
  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [submitted, setSubmitted] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const successRef = useRef<HTMLDivElement>(null)

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ComplaintFormFields>({
    resolver: zodResolver(complaintFormSchema),
  })

  const selectedSchoolLabel = watch("school")
  const selectedSchoolKey = SCHOOLS.find((s) => s.label === selectedSchoolLabel)?.value
  const departmentOptions = selectedSchoolKey ? DEPARTMENTS[selectedSchoolKey] ?? [] : []

  const description = watch("description") ?? ""
  const title = watch("title") ?? ""

  useEffect(() => {
    if (submitted) {
      successRef.current?.focus()
    }
  }, [submitted])

// Εικόνες
  const handleFiles = (files: FileList | null) => {
    // FileList: https://developer.mozilla.org/en-US/docs/Web/API/FileList
    if (!files) return
    const remaining = MAX_IMAGES - images.length //πόσα αρχεία επιτρέπεται να ανεβασει ακόμη o χρήστης
    const newFiles: File[] = []      //πίνακας πραγματικων αρχείων
    const newPreviews: string[] = []   //πίνακας  previews (προσωρινή αποθήκευση στον browser πριν αποθηκευετεί στο backend)
    let rejectedCount = 0

    Array.from(files)                  //μετατροπή σε Javascript array
        .slice(0, remaining)       //κόβουμε μέχρι τα remaining αρχεία, τα υπόλοιπα αγνοούνται
        .forEach((file) => {
          if (!file.type.startsWith("image/")) {
            rejectedCount++
            return
          }     // ελέγχει αν είναι εικόνα
          if (file.size > MAX_FILE_MB * 1024 * 1024) {
            rejectedCount++
            return
          }             //έλεγχος μεγέθους αρχείου
          newFiles.push(file)                                           //προσθήκη στα newFiles
          newPreviews.push(URL.createObjectURL(file))                   //τοπική διεύθυνση URL που δείχνει κατευθείαν στο αρχείο που είναι ήδη στη μνήμη του browser
        })
    //μήνυμα λάθους για αποτυχία στο ανέβασμα αρχείου
    if (rejectedCount > 0) {
      toast.error(
          rejectedCount === 1
              ? "Ένα αρχείο δεν προστέθηκε — επιτρέπονται μόνο εικόνες έως 5MB."
              : `${rejectedCount} αρχεία δεν προστέθηκαν — επιτρέπονται μόνο εικόνες έως 5MB.`
      )
    }

    setImages((prev) => [...prev, ...newFiles])
    setPreviews((prev) => [...prev, ...newPreviews])
  }
// αφαίρεση εικόνας
  const removeImage = (idx: number) => {
    URL.revokeObjectURL(previews[idx])
    setImages((prev) => prev.filter((_, i) => i !== idx))
    setPreviews((prev) => prev.filter((_, i) => i !== idx))
  }
// για χειροκίνητο ανοιγμα του παραθύρου επιλογής αρχείων με tab + enter (προσβασιμότητα)
  const handleUploadKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {     //" " = space
      e.preventDefault()
      fileInputRef.current?.click()
    }
  }

  // Submit
  const onSubmit = async (data: ComplaintFormFields) => {
    try {
      const body = new FormData()
      body.append("title", data.title)
      body.append("school", data.school)
      body.append("department", data.department)
      body.append("category", data.category)
      body.append("incidentDate", toIsoDate(data.incidentDate))
      if (data.location) body.append("location", data.location)
      body.append("description", data.description)
      images.forEach((img) => body.append("images", img))

      await createComplaint(body)
      setSubmitted(true)
    } catch (error) {
      toast.error(
          error instanceof Error ? error.message : "Η υποβολή απέτυχε. Δοκιμάστε ξανά."
      )
    }
  }

  const resetForm = () => {
    reset()
    previews.forEach((p) => URL.revokeObjectURL(p))         //καθάρισμα της revokeObjectURL από προηγούμενες χρήσεις
    setImages([])
    setPreviews([])
    setSubmitted(false)
  }

// Success
  if (submitted) {
    return (
        <Layout pageTitle="Αναφορά υποβλήθηκε">
          <div className="min-h-[60vh] flex items-center justify-center p-8">
            <div
                ref={successRef}
                tabIndex={-1}
                role="status"
                aria-live="polite"
                className="bg-card border border-border rounded-xl p-12 text-center max-w-md outline-none"
            >
              <CheckCircle2
                  className="h-12 w-12 text-green-600 mx-auto mb-4"
                  aria-hidden="true"
              />
              <h1 className="text-xl font-medium text-foreground mb-2">
                Η αναφορά υποβλήθηκε
              </h1>
              <p className="text-sm text-muted-foreground mb-6">
                Θα ενημερωθείτε για την εξέλιξή της μέσω της σελίδας «Οι αναφορές μου».
              </p>
              <Button onClick={resetForm}>Νέα αναφορά</Button>
            </div>
          </div>
        </Layout>
    )
  }

// Φόρμα
  return (
      <Layout pageTitle="Αναφορά προβλήματος">
        <div className="max-w-2xl mx-auto py-8">
          <h1 className="text-2xl font-medium text-foreground mb-1">Αναφορά προβλήματος</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Συμπληρώστε τα παρακάτω πεδία για να υποβάλετε νέα αναφορά.
          </p>

          <div className="bg-card border border-border rounded-xl p-7">
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">

              {/* Τίτλος */}
              <Field data-invalid={!!errors.title}>
                <FieldLabel htmlFor="title">
                  Τίτλος αναφοράς
                  <span className="text-destructive ml-1" aria-hidden="true">*</span>
                </FieldLabel>
                <Input
                    id="title"
                    type="text"
                    maxLength={120}
                    placeholder="π.χ. Ανελκυστήρας εκτός λειτουργίας"
                    aria-required="true"                     //προσβασιμότητα
                    aria-invalid={!!errors.title}            //προσβασιμότητα
                    aria-describedby={errors.title ? "title-error" : undefined}        //προσβασιμότητα
                    {...register("title")}
                />
                <div
                    className="text-xs text-muted-foreground text-right"

                >
                  {title.length} / 120
                </div>
                <FieldError id="title-error" errors={errors.title ? [errors.title] : undefined} />
              </Field>

              {/* Σχολή / Τμήμα */}
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
                            <SelectTrigger       //το ορατό κουμπί για να ενεργοποιηθεί η select
                                id="school"
                                aria-required="true"
                                aria-invalid={!!errors.school}
                                aria-describedby={errors.school ? "school-error" : undefined}
                            >
                              <SelectValue placeholder="Επιλέξτε σχολή…" />
                              {/* Select Value = η τρέχουσα επιλεγμένη τιμή (στην αρχή ο placeholder) */}
                            </SelectTrigger>
                            <SelectContent>
                              {/* το dropdown μενού και κάθε select item μία επιλογή του */}
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

              {/* Κατηγορία / Ημερομηνία */}
              <div className="grid grid-cols-2 gap-4">
                <Field data-invalid={!!errors.category}>
                  <FieldLabel htmlFor="category">
                    Κατηγορία
                    <span className="text-destructive ml-1" aria-hidden="true">*</span>
                  </FieldLabel>
                  <Controller
                      name="category"
                      control={control}
                      render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger
                                id="category"
                                aria-required="true"
                                aria-invalid={!!errors.category}
                                aria-describedby={errors.category ? "category-error" : undefined}
                            >
                              <SelectValue placeholder="Επιλέξτε κατηγορία…" />
                            </SelectTrigger>
                            <SelectContent>
                              {CATEGORIES.map((c) => (
                                  <SelectItem key={c} value={c}>
                                    {c}
                                  </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                      )}
                  />
                  <FieldError id="category-error" errors={errors.category ? [errors.category] : undefined} />
                </Field>

                <Field data-invalid={!!errors.incidentDate}>
                  <FieldLabel htmlFor="incident-date">
                    Ημερομηνία συμβάντος
                    <span className="text-destructive ml-1" aria-hidden="true">*</span>
                  </FieldLabel>
                  <Controller
                      name="incidentDate"
                      control={control}
                      render={({ field }) => (
                          <Input
                              id="incident-date"
                              type="text"
                              value={field.value ?? ""}
                              onChange={(e) => field.onChange(formatDateInput(e.target.value))}
                              placeholder="ΗΗ/ΜΜ/ΕΕΕΕ"
                              maxLength={10}
                              aria-required="true"
                              aria-invalid={!!errors.incidentDate}
                              aria-describedby={
                                errors.incidentDate
                                    ? "incident-date-hint incident-date-error"
                                    : "incident-date-hint"
                              }
                          />
                      )}
                  />
                  <FieldDescription id="incident-date-hint">Μορφή: ΗΗ/ΜΜ/ΕΕΕΕ</FieldDescription>
                  <FieldError
                      id="incident-date-error"
                      errors={errors.incidentDate ? [errors.incidentDate] : undefined}
                  />
                </Field>
              </div>

              {/* Τοποθεσία */}
              <Field data-invalid={!!errors.location}>
                <FieldLabel htmlFor="location">
                  Ακριβής τοποθεσία{" "}
                  <span className="font-normal text-muted-foreground">(προαιρετικό)</span>
                </FieldLabel>
                <Input
                    id="location"
                    type="text"
                    placeholder="π.χ. 2ος όροφος, δίπλα στην αίθουσα 201"
                    aria-describedby="location-hint"
                    {...register("location")}
                />
                <FieldDescription id="location-hint">
                  Βοηθά στον εντοπισμό του προβλήματος.
                </FieldDescription>
                <FieldError id="location-error" errors={errors.location ? [errors.location] : undefined} />
              </Field>

              {/* Περιγραφή */}
              <Field data-invalid={!!errors.description}>
                <FieldLabel htmlFor="description">
                  Περιγραφή προβλήματος
                  <span className="text-destructive ml-1" aria-hidden="true">*</span>
                </FieldLabel>
                <Textarea
                    id="description"
                    maxLength={1000}
                    placeholder="Περιγράψτε το πρόβλημα με όσο περισσότερες λεπτομέρειες μπορείτε…"
                    aria-required="true"
                    aria-invalid={!!errors.description}
                    aria-describedby={
                      errors.description
                          ? "description-hint description-error"
                          : "description-hint"
                    }
                    className="min-h-[110px] resize-y"
                    {...register("description")}
                />
                <div className="flex items-center justify-between">
                  <FieldDescription id="description-hint">Τουλάχιστον 20 χαρακτήρες.</FieldDescription>
                  <div className="text-xs text-muted-foreground" >
                    {description.length} / 1000
                  </div>
                </div>
                <FieldError
                    id="description-error"
                    errors={errors.description ? [errors.description] : undefined}
                />
              </Field>

              {/* Upload φωτογραφιών */}
              <div className="space-y-2">
                <FieldLabel htmlFor="upload-zone">Φωτογραφίες</FieldLabel>
                <div
                    id="upload-zone"
                    role="button"
                    tabIndex={0}         // focus με Tab (προσβασιμότητα)
                    aria-label="Ανέβασμα φωτογραφιών — κάντε κλικ ή σύρετε αρχεία εδώ"      //νόημα του στοιχείο για τον αναγνώστη οθόνης (προσβασιμότητα)
                    aria-describedby="upload-hint"
                    className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring hover:border-ring transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                    onKeyDown={handleUploadKeyDown}
                    // drag & drop
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault()
                      handleFiles(e.dataTransfer.files)
                    }}
                >
                  <Camera className="h-7 w-7 mx-auto mb-1.5 text-muted-foreground" aria-hidden="true" />
                  {/* Camera = lucide */}
                  <div className="text-sm text-foreground">
                    Σύρετε φωτογραφίες εδώ ή{" "}
                    <span className="text-primary underline">επιλέξτε αρχεία</span>
                  </div>
                  <div id="upload-hint" className="text-xs text-muted-foreground mt-1">
                    JPG, PNG, WEBP — έως {MAX_FILE_MB}MB ανά αρχείο, μέχρι {MAX_IMAGES} εικόνες
                  </div>
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    aria-label="Επιλογή φωτογραφιών"
                    onChange={(e) => handleFiles(e.target.files)}
                />
                {/* preview grid */}

                {previews.length > 0 && (
                    <div
                        className="grid gap-2 grid-cols-[repeat(auto-fill,minmax(72px,1fr))]"
                        role="list"
                        aria-label="Επιλεγμένες φωτογραφίες"
                    >
                      {previews.map((src, i) => (
                          <div
                              key={src}
                              className="relative aspect-square rounded-md overflow-hidden border border-border"
                              role="listitem"
                          >
                            <img
                                src={src}
                                alt={`Προεπισκόπηση φωτογραφίας ${i + 1}`}
                                className="w-full h-full object-cover"
                            />
                            <button
                                type="button"
                                onClick={() => removeImage(i)}
                                aria-label={`Αφαίρεση φωτογραφίας ${i + 1}`}
                                className="absolute top-1 right-1 w-5.5 h-5.5 rounded-full bg-black/60 text-white flex items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
                            >
                              <X className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>
                          </div>
                      ))}
                    </div>
                )}
              </div>

              {/* Ενέργειες */}
              <div className="flex gap-3 justify-end pt-2">
                <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                  {/* navigate(-1)  παει στην προηγούμενη σελίδα*/}
                  Ακύρωση
                </Button>
                <Button type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
                  {isSubmitting ? "Υποβολή…" : "Υποβολή αναφοράς"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </Layout>
  )
}
