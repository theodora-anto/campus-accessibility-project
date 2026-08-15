import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { toast } from "sonner"
import { Dialog } from "radix-ui"
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
import { ArrowLeft, X } from "lucide-react"
import { STATUS_CONFIG } from "@/components/ReportList"
import {
  getComplaintById,
  reviewComplaint,
  updateImageAltText,
} from "@/api/complaints"
import type { ComplaintDetail } from "@/schemas/complaint"
import { COMPLAINT_STATUS_LABELS, type ComplaintStatus } from "@/types/complaintStatus"
import { getImageUrl } from "@/lib/getImageUrl"

const formatDateTime = (iso: string) => {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleString("el-GR", { dateStyle: "short", timeStyle: "short" })
}

export default function AdminReportDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [report, setReport] = useState<ComplaintDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [newStatus, setNewStatus] = useState<ComplaintStatus>("New")
  const [comment, setComment] = useState("")
  const [altTexts, setAltTexts] = useState<Record<number, string>>({})

  const [isSavingAlt, setIsSavingAlt] = useState(false)
  const [isSavingStatus, setIsSavingStatus] = useState(false)
  const [statusError, setStatusError] = useState("")
  const [altErrors, setAltErrors] = useState<Record<number, string>>({})

  // index της εικόνας που είναι μεγεθυμένη αυτή τη στιγμή, null = κλειστό lightbox
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  useEffect(() => {
    if (!id) return

    async function loadComplaint() {
      try {
        const data = await getComplaintById(Number(id))
        setReport(data)
        setNewStatus(data.status)
        const initial: Record<number, string> = {}
        data.images.forEach((img) => {
          initial[img.id] = img.altText ?? ""
        })
        setAltTexts(initial)
      } catch {
        toast.error("Αδυναμία φόρτωσης αναφοράς. Δοκιμάστε ξανά.")
      } finally {
        setIsLoading(false)
      }
    }


    loadComplaint()
  }, [id])

  // Αποθήκευση περιγραφών εικόνων, ανεξάρτητο από status

  const handleSaveAltTexts = async () => {
    if (!report) return
    setIsSavingAlt(true)
    try {
      await Promise.all(
          report.images.map((img) =>
              updateImageAltText(report.id, img.id, (altTexts[img.id] ?? "")) //σχόλιο: δεν trimρουμε γιατί θεωρούμε αποδεκτό ο admin να βάλει απλώς ένα κενό(space) ως alt text
          )
      )
      toast.success("Οι περιγραφές αποθηκεύτηκαν.")
      setAltErrors({})
    } catch {
      toast.error("Αδυναμία αποθήκευσης περιγραφών. Συμπληρώστε περιγραφή ή πατήστε κενό (space) για κάθε εικόνα.")
    } finally {
      setIsSavingAlt(false)
    }
  }
  //Αποθήκευση status + σχόλιου
  const handleSaveStatus = async () => {
    if (!report || !id) return
    setStatusError("")

    // Το backend ελέγχει πάντα ότι καμία εικόνα δεν
    // έχει altText === null, ώστε ο admin να δει σαφές μήνυμα
    // πριν το submit, αντί για γενικό server error.
    const missing = report.images.filter((img) => (altTexts[img.id] ?? "").length === 0)
    if (missing.length > 0) {
      const missingErrors: Record<number, string> = {}
      missing.forEach((img) => {
        missingErrors[img.id] = "Απαιτείται περιγραφή πριν αλλάξετε την κατάσταση."
      })
      setAltErrors(missingErrors)
      setStatusError(
          "Συμπληρώστε περιγραφή για όλες τις εικόνες πριν αλλάξετε την κατάσταση."
      )
      return
    }

    setIsSavingStatus(true)
    try {
      await reviewComplaint(Number(id), newStatus, comment || undefined)
      const refreshed = await getComplaintById(Number(id))
      setReport(refreshed)
      setNewStatus(refreshed.status)
      setComment("")
      toast.success("Η κατάσταση ενημερώθηκε.")
    } catch {
      setStatusError("Αδυναμία αποθήκευσης. Δοκιμάστε ξανά.")
    } finally {
      setIsSavingStatus(false)
    }
  }
  // για loading
  if (!report) {
    return (
        <Layout pageTitle="Φόρτωση αναφοράς">
          <div className="max-w-2xl mx-auto py-8">
            <p role="status" aria-live="polite" className="text-center py-12 text-sm text-muted-foreground">
              {isLoading ? "Φόρτωση αναφοράς…" : "Δεν ήταν δυνατή η φόρτωση της αναφοράς."}
            </p>
          </div>
        </Layout>
    )
  }
  const currentStatus = STATUS_CONFIG[report.status]

  // Βοηθητική: το κείμενο που θα ανακοινώνεται από τον screen reader για μια εικόνα στο lightbox
  // alt=" " (μόνο κενό) τελικά γίνεται trim από τον browser τελικά οπότε είναι ισοδύναμο με alt = "" :'(.
  const imageAltText = (index: number) => {
    const altText = report.images[index]?.altText
    if (altText == null) return `Φωτογραφία ${index + 1}, εκκρεμεί περιγραφή`
    if (altText.trim().length === 0) return `Φωτογραφία ${index + 1}. Δεν χρειάζεται περιγραφή.`
    return altText
  }

  return (
      <Layout pageTitle={report.title}>
        <div className="max-w-2xl mx-auto py-8">
          <Link
              to="/admin/reports"
              className="inline-flex items-center gap-1.5 text-sm text-primary no-underline mb-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring rounded"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Επιστροφή στη λίστα
          </Link>

          <h1 className="text-2xl font-medium text-foreground mb-6">{report.title}</h1>

          {/* Στοιχεία αναφοράς */}
          <section
              className="bg-card border border-border rounded-xl p-6 mb-4"
              aria-label="Στοιχεία αναφοράς"
          >
            <div className="text-sm font-medium text-muted-foreground  tracking-wide mb-4">
              Στοιχεία αναφοράς
            </div>
            <ul role="list" aria-label="Στοιχεία αναφοράς" className="list-none p-0 m-0">
              <MetaRow label="Κατάσταση">
              <span
                  role="status"
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${currentStatus.className}`}
              >
                {currentStatus.label}
              </span>
              </MetaRow>
              <MetaRow label="Σχολή">
                <span className="text-foreground font-medium">{report.school}</span>
              </MetaRow>
              <MetaRow label="Τμήμα αναφοράς">
                <span className="text-foreground font-medium">{report.department}</span>
              </MetaRow>
              <MetaRow label="Κατηγορία">
                <span className="text-foreground font-medium">{report.category}</span>
              </MetaRow>
              <MetaRow label="Ημερομηνία συμβάντος">
                <span className="text-foreground font-medium">{report.incidentDate}</span>
              </MetaRow>
              {report.location && (
                  <MetaRow label="Ακριβής τοποθεσία">
                    <span className="text-foreground font-medium">{report.location}</span>
                  </MetaRow>
              )}
              <MetaRow label="Ημερομηνία υποβολής" isLast>
                <span className="text-foreground font-medium">{formatDateTime(report.submittedAt)}</span>
              </MetaRow>
            </ul>
          </section>

          {/* Υποβλήθηκε από */}
          {report.submittedByFullName && (
              <section
                  className="bg-card border border-border rounded-xl p-6 mb-4"
                  aria-label="Στοιχεία υποβολής"
              >
                <div className="text-sm font-medium text-muted-foreground  tracking-wide mb-4">
                  Υποβλήθηκε από
                </div>
                <div className="bg-muted rounded-lg px-3.5 py-2.5 flex flex-col gap-1">
              <span className="text-sm font-medium text-foreground">
                {report.submittedByFullName}
              </span>
                  <span className="text-xs text-muted-foreground">
                {report.submittedByDepartment} · {report.submittedBySchool}
              </span>
                </div>
              </section>
          )}
          {/* Περιγραφή */}
          <section
              className="bg-card border border-border rounded-xl p-6 mb-4"
              aria-label="Περιγραφή προβλήματος"
          >
            <div className="text-sm font-medium text-muted-foreground  tracking-wide mb-4">
              Περιγραφή προβλήματος
            </div>
            <p className="text-sm text-foreground leading-relaxed">{report.description}</p>
          </section>

          {/* Φωτογραφίες — κάθε εικόνα είναι πλέον πραγματικό button που ανοίγει
              μεγεθυμένη προβολή (lightbox), ίδιο pattern με το StudentReportDetailPage */}
          {report.images.length > 0 && (
              <section
                  className="bg-card border border-border rounded-xl p-6 mb-4"
                  aria-label="Φωτογραφίες αναφοράς"
              >
                <div className="text-sm font-medium text-muted-foreground  tracking-wide mb-4">
                  Φωτογραφίες
                </div>

                <div className="grid gap-3 grid-cols-[repeat(auto-fill,minmax(140px,1fr))]" role="list">
                  {report.images.map((img, i) => (
                      <div key={img.id} className="flex flex-col gap-1.5" role="listitem">
                        <button
                            type="button"
                            onClick={() => setLightboxIndex(i)}
                            aria-label={`Μεγέθυνση φωτογραφίας ${i + 1}`}
                            className="aspect-square w-full p-0 overflow-hidden rounded-md border border-border bg-muted cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
                        >
                          <img
                              src={getImageUrl(img.filePath)}
                              alt={imageAltText(i)}
                              className="w-full h-full object-cover"
                          />
                        </button>
                        <Field data-invalid={!!altErrors[img.id]}>
                          <FieldLabel htmlFor={`alt-${img.id}`} className="text-xs">
                            Περιγραφή εικόνας {i + 1}
                          </FieldLabel>
                          <Input
                              id={`alt-${img.id}`}
                              type="text"
                              value={altTexts[img.id] ?? ""}
                              onChange={(e) => {
                                setAltTexts((prev) => ({ ...prev, [img.id]: e.target.value }))
                                setAltErrors((prev) => ({ ...prev, [img.id]: "" }))
                              }}
                              placeholder="π.χ. Σπασμένη ράμπα στην είσοδο"
                              aria-invalid={!!altErrors[img.id]}
                              aria-describedby={`alt-hint-${img.id}${altErrors[img.id] ? ` alt-error-${img.id}` : ""}`}
                              className="h-9 text-xs"
                          />
                          <FieldDescription id={`alt-hint-${img.id}`} className="text-[11px]">
                            Περιγράψτε την εικόνα για χρήστη αναγνώστη οθόνης. Αν η εικόνα δεν χρειάζεται
                            περιγραφή, πατήστε κενό (space).
                          </FieldDescription>
                          {altErrors[img.id] && (
                              <FieldError id={`alt-error-${img.id}`} className="text-[11px]">
                                {altErrors[img.id]}
                              </FieldError>
                          )}
                        </Field>
                      </div>
                  ))}
                </div>

                <Button
                    onClick={handleSaveAltTexts}
                    disabled={isSavingAlt}
                    aria-busy={isSavingAlt}
                    className="mt-4"
                >
                  {isSavingAlt ? "Αποθήκευση…" : "Αποθήκευση περιγραφών"}
                </Button>
              </section>
          )}

          {/* Διαχείριση status */}
          <section
              className="bg-card border border-border rounded-xl p-6 mb-4"
              aria-label="Διαχείριση αναφοράς"
          >
            <div className="text-sm font-medium text-muted-foreground  tracking-wide mb-4">
              Διαχείριση αναφοράς
            </div>

            {statusError && (
                <div
                    role="alert"
                    aria-live="assertive"
                    className="bg-destructive/10 border border-destructive/30 rounded-md px-3.5 py-2.5 text-sm text-destructive mb-4"
                >
                  {statusError}
                </div>
            )}

            <Field className="mb-4">
              <FieldLabel htmlFor="new-status">Νέα κατάσταση</FieldLabel>
              <Select
                  value={newStatus}
                  onValueChange={(value) => setNewStatus(value as ComplaintStatus)}
              >
                <SelectTrigger id="new-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(COMPLAINT_STATUS_LABELS) as ComplaintStatus[]).map((s) => (
                      <SelectItem key={s} value={s}>
                        {COMPLAINT_STATUS_LABELS[s]}
                      </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field className="mb-4">
              <FieldLabel htmlFor="comment">
                Σχόλιο{" "}
                <span className="font-normal text-muted-foreground">(προαιρετικό)</span>
              </FieldLabel>
              <Textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="π.χ. Ειδοποιήθηκε η τεχνική υπηρεσία…"
                  aria-describedby="comment-hint"
                  className="min-h-[90px] resize-y"
              />
              <FieldDescription id="comment-hint">
                Το σχόλιο θα εμφανίζεται στον φοιτητή.
              </FieldDescription>
            </Field>

            <div className="flex gap-3 mt-2">
              <Button variant="outline" onClick={() => navigate(-1)}>
                Πίσω
              </Button>
              <Button
                  onClick={handleSaveStatus}
                  disabled={isSavingStatus}
                  aria-busy={isSavingStatus}
                  className="flex-1"
              >
                {isSavingStatus ? "Αποθήκευση…" : "Αποθήκευση αλλαγών"}
              </Button>
            </div>
          </section>

          {/* Ιστορικό */}
          <section
              className="bg-card border border-border rounded-xl p-6"
              aria-label="Ιστορικό αλλαγών"
          >
            <div className="text-sm font-medium text-muted-foreground  tracking-wide mb-4">
              Ιστορικό αλλαγών
            </div>
            <ul className="list-none p-0">
              {report.history.map((entry, i) => (
                  <li
                      key={`${entry.status}-${entry.changedAt}-${i}`}
                      className="py-2.5 border-b border-border last:border-b-0"
                  >
                    <div className="text-sm text-foreground/90">
                      {i === report.history.length - 1 ? (
                          "Αναφορά υποβλήθηκε"
                      ) : (
                          <>
                            Κατάσταση →{" "}
                            <strong className="font-medium">
                              {COMPLAINT_STATUS_LABELS[entry.status]}
                            </strong>
                            {entry.adminComment && (
                                <>
                                  {" "}
                                  <span aria-hidden="true">·</span> "{entry.adminComment}"
                                </>
                            )}
                          </>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">{formatDateTime(entry.changedAt)}</div>
                  </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Lightbox — click-to-enlarge, ίδιο pattern με το StudentReportDetailPage */}
        <Dialog.Root
            open={lightboxIndex !== null}
            onOpenChange={(open) => {
              if (!open) setLightboxIndex(null)
            }}
        >
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/80 z-50" />
            <Dialog.Content
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 max-w-[90vw] max-h-[90vh] focus:outline-none"
            >
              <Dialog.Title className="sr-only">
                {lightboxIndex !== null ? imageAltText(lightboxIndex) : "Μεγέθυνση φωτογραφίας"}
              </Dialog.Title>
              <Dialog.Description className="sr-only">
                Πατήστε Escape ή το κουμπί κλεισίματος για έξοδο.
              </Dialog.Description>

              {lightboxIndex !== null && (
                  <img
                      src={getImageUrl(report.images[lightboxIndex].filePath)}
                      alt={imageAltText(lightboxIndex)}
                      className="max-w-[90vw] max-h-[90vh] object-contain rounded-md"
                  />
              )}

              <Dialog.Close
                  aria-label="Κλείσιμο μεγέθυνσης"
                  className="absolute -top-3 -right-3 bg-card border border-border rounded-full w-8 h-8 flex items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </Dialog.Close>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </Layout>
  )
}

function MetaRow({
                   label,
                   children,
                   isLast,
                 }: {
  label: string
  children: React.ReactNode
  isLast?: boolean
}) {
  return (
      <li
          className={`flex justify-between items-center py-2 text-sm ${
              isLast ? "" : "border-b border-border"
          }`}
      >
        <span className="text-muted-foreground">{label}</span>
        {children}
      </li>
  )
}
