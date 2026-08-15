import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { Dialog } from "radix-ui"
import Layout from "@/components/Layout"
import { Button } from "@/components/ui/button"
import { ArrowLeft, X } from "lucide-react"
import { STATUS_CONFIG } from "@/components/ReportList"
import { getComplaintById } from "@/api/complaints"
import type { ComplaintDetail } from "@/schemas/complaint"
import { COMPLAINT_STATUS_LABELS } from "@/types/complaintStatus"
import { getImageUrl } from "@/lib/getImageUrl"

const formatDateTime = (iso: string) => {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleString("el-GR", { dateStyle: "short", timeStyle: "short" })
}

export default function StudentReportDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [report, setReport] = useState<ComplaintDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  // index της εικόνας που είναι μεγεθυμένη αυτή τη στιγμή, null = κλειστό lightbox
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  // Απλό fetch του complaint
  useEffect(() => {
    if (!id) return

    async function loadComplaint() {
      try {
        const data = await getComplaintById(Number(id))
        setReport(data)
      } catch {
        toast.error("Αδυναμία φόρτωσης αναφοράς. Δοκιμάστε ξανά.")
      } finally {
        setIsLoading(false)
      }
    }
    loadComplaint()
  }, [id])
//status του complaint
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

  // Βοηθητική: το κείμενο που θα ανακοινώνεται από τον screen reader για μια εικόνα
  // (δεν εμφανίζεται οπτικά — είναι το alt text)
  //
  //  alt=" " (μόνο κενό) γίνεται trim από τον browser κατά τον
  // υπολογισμό του accessible name , καταλήγει ισοδύναμο με alt="" :(
 // Άρα εδώ χρειάζονται 3 ρητές καταστάσεις:
  //   null            → δεν έχει γίνει καθόλου review ακόμα
  //   μόνο whitespace → ο admin το είδε σκόπιμα και αποφάσισε "καμία περιγραφή"
  //   πραγματικό text → η περιγραφή του admin
  const imageAltText = (index: number) => {
    const altText = report.images[index]?.altText
    if (altText == null) return `Φωτογραφία ${index + 1}`
    if (altText.trim().length === 0) return `Φωτογραφία ${index + 1}. Δεν χρειάζεται περιγραφή.`
    return altText
  }

  return (
      <Layout pageTitle={report.title}>
        <div className="max-w-2xl mx-auto py-8">
          {/*για να πάει πίσω σελίδα*/}
          <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1.5 text-sm text-primary px-0 mb-6 hover:bg-transparent hover:underline"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Πίσω
          </Button>

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
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${currentStatus.className}`}
                >
                  {currentStatus.label}
                </span>
              </MetaRow>
              <MetaRow label="Σχολή">
                <span className="text-foreground font-medium">{report.school}</span>
              </MetaRow>
              <MetaRow label="Τμήμα">
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

          {/* Φωτογραφίες — κάθε μία είναι πλέον πραγματικό button που ανοίγει lightbox,
              με το alt text κατευθείαν πάνω στο <img> (όχι πια aria-label στο wrapper) */}
          {report.images.length > 0 && (
              <section
                  className="bg-card border border-border rounded-xl p-6 mb-4"
                  aria-label="Φωτογραφίες αναφοράς"
              >
                <div className="text-sm font-medium text-muted-foreground  tracking-wide mb-4">
                  Φωτογραφίες
                </div>
                <div
                    className="grid gap-2 grid-cols-[repeat(auto-fill,minmax(90px,1fr))]"
                    role="list"
                    aria-label="Φωτογραφίες αναφοράς"
                >
                  {report.images.map((img, i) => (
                      <div key={img.id} role="listitem">
                        <button
                            type="button"
                            onClick={() => setLightboxIndex(i)}
                            className="aspect-square w-full p-0 overflow-hidden rounded-md border border-border bg-muted cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
                        >
                          <img
                              src={getImageUrl(img.filePath)}
                              alt={imageAltText(i)}
                              className="w-full h-full object-cover"
                          />
                        </button>
                      </div>
                  ))}
                </div>
              </section>
          )}

          {/* Ιστορικό με όλα τα σχόλια του admin */}
          <section
              className="bg-card border border-border rounded-xl p-6"
              aria-label="Ιστορικό αναφοράς"
          >
            <div className="text-sm font-medium text-muted-foreground  tracking-wide mb-4">
              Ιστορικό αναφοράς
            </div>
            <ul className="list-none p-0" aria-label="Ιστορικό αλλαγών κατάστασης">
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
                            Κατάσταση{" "}
                            <span aria-hidden="true">→</span>
                            <span className="sr-only">προς</span>{" "}
                            <strong className="font-medium">
                              {COMPLAINT_STATUS_LABELS[entry.status]}
                            </strong>
                          </>
                      )}
                    </div>
                    {entry.adminComment && (
                        <div
                            role="note"
                            aria-label="Σχόλιο διαχειριστή"
                            className="text-sm text-foreground/80 bg-muted border-l-2 border-border-strong px-3 py-2 rounded-r-md mt-1.5 leading-relaxed"
                        >
                          {entry.adminComment}
                        </div>
                    )}
                    <div className="text-xs text-muted-foreground mt-1">{formatDateTime(entry.changedAt)}</div>

                  </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Lightbox — click-to-enlarge. Χτισμένο πάνω σε Radix Dialog ώστε
            focus trap, Escape-to-close, και aria-modal να δουλεύουν σωστά by default. */}
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
              {/* Ο τίτλος του dialog — sr-only, δεν χρειάζεται να φαίνεται οπτικά
                  αφού η ίδια η εικόνα είναι το περιεχόμενο */}
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
// Ορισμός συγκεκριμένης διάταξης
function MetaRow({
                   label,
                   children,
                   isLast,
                 }: {
  label: string
  children: React.ReactNode
  isLast?: boolean //αν έιναι τελευταίο να μην μπει γραμμή μετά από αυτό
}) {
  return (
      <li
          className={`flex justify-between items-center py-2 text-sm ${
              isLast ? "" : "border-b border-border"
              //αν έιναι τελευταίο να μην μπει γραμμή μετά από αυτό
          }`}
      >
        <span className="text-muted-foreground">{label}</span>
        {children}
      </li>
  )
}
