import { Link } from "react-router-dom"
import { CheckCircle2, Circle, Clock, Eye, Settings2, XCircle } from "lucide-react"
import type { ComplaintListItem } from "@/schemas/complaint"
import { COMPLAINT_STATUS_LABELS, type ComplaintStatus } from "@/types/complaintStatus"
//Template για συνέπεια
export const STATUS_CONFIG: Record<
    ComplaintStatus,
    { label: string; icon: typeof Circle; className: string }
> = {
  New: {
    label: COMPLAINT_STATUS_LABELS.New,
    icon: Circle,
    className: "bg-muted text-muted-foreground border border-border",
  },
  UnderReview: {
    label: COMPLAINT_STATUS_LABELS.UnderReview,
    icon: Eye,
    className: "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-900",
  },
  InProgress: {
    label: COMPLAINT_STATUS_LABELS.InProgress,
    icon: Settings2,
    className: "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-900",
  },
  Pending: {
    label: COMPLAINT_STATUS_LABELS.Pending,
    icon: Clock,
    className: "bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-900",
  },
  Resolved: {
    label: COMPLAINT_STATUS_LABELS.Resolved,
    icon: CheckCircle2,
    className: "bg-green-50 text-green-700 border border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-900",
  },
  Rejected: {
    label: COMPLAINT_STATUS_LABELS.Rejected,
    icon: XCircle,
    className: "bg-red-50 text-red-700 border border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-900",
  },
}

// Props

interface ReportListProps {
  items: ComplaintListItem[]
  /**
   * Αν δοθεί, κάθε γραμμή γίνεται κλικαρισμένο link προς τη διεύθυνση
   * που επιστρέφει η συνάρτηση (π.χ. (id) => `/admin/reports/${id}`).
   * Αν παραλειφθεί, η λίστα είναι μόνο για ανάγνωση.
   */
  linkTo?: (id: number) => string
}
// πώς θα εμφανιστεί ο χρόνος
const formatDate = (iso: string) => {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleDateString("el-GR", { day: "2-digit", month: "2-digit", year: "numeric" })
}

// Εμφανίζει τα στοιχεία της λίστας αν υπάρχουν, οδηγεί στην επόμενη σελίδα μέσω του Link
export default function ReportList({ items, linkTo }: ReportListProps) {
  return (
      <>
        {items.length === 0 ? (
            <p role="status" aria-live="polite" className="text-center py-12 text-sm text-muted-foreground">
              Δεν βρέθηκαν αναφορές για τα επιλεγμένα φίλτρα.
            </p>
        ) : (
            <>
              <p aria-live="polite" role="status" className="text-sm text-muted-foreground mb-3">
                Βρέθηκαν <strong>{items.length}</strong> αναφορές
              </p>

              <ul role="list" aria-label="Λίστα αναφορών" className="border border-border rounded-xl overflow-hidden">
                {items.map((report, index) => {
                  const s = STATUS_CONFIG[report.status]
                  const StatusIcon = s.icon
                  const rowClassName = `grid grid-cols-[1fr_auto_auto] gap-4 items-center px-6 py-4 border-b border-border last:border-b-0 ${
                      index % 2 === 1 ? "bg-muted/40" : "bg-card"
                  }`

                  const content = (
                      <>
                        <div>
                          <div className="text-sm font-medium text-foreground mb-0.5">{report.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {report.department} <span aria-hidden="true">·</span>{" "}
                            {report.category} <span aria-hidden="true">·</span>{" "}
                            {formatDate(report.submittedAt)}
                          </div>
                        </div>
                        <span
                            role="status"
                            aria-label={`Κατάσταση: ${s.label}`}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${s.className}`}
                        >
                    <StatusIcon className="h-3 w-3" aria-hidden="true" />
                          {s.label}
                  </span>
                        {linkTo && (
                            <span className="text-muted-foreground" aria-hidden="true">
                      ›
                    </span>
                        )}
                      </>
                  )

                  return (
                      <li key={report.id} role="listitem">
                        {linkTo ? (
                            <Link
                                to={linkTo(report.id)}
                                className={`${rowClassName} no-underline text-inherit hover:bg-accent/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring focus-visible:-outline-offset-2 transition-colors`}
                            >
                              {content}
                            </Link>
                        ) : (
                            <div className={rowClassName}>{content}</div>
                        )}
                      </li>
                  )
                })}
              </ul>
            </>
        )}
      </>
  )
}
