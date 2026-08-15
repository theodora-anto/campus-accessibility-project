import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import Layout from "@/components/Layout"
import ReportList from "@/components/ReportList"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Search } from "lucide-react"
import { getComplaints } from "@/api/complaints"
import type { ComplaintListItem } from "@/schemas/complaint"
import type { ComplaintFilters, PaginatedResult } from "@/types/complaintFilters"
import { COMPLAINT_STATUS_LABELS, type ComplaintStatus } from "@/types/complaintStatus"
import { DEPARTMENTS } from "@/data/departments"
import { CATEGORIES } from "@/data/categories"

const PAGE_SIZE = 20

//Λίστα όλων των τμημάτων (ανεξαρτήτως σχολής) για το φίλτρο
const ALL_DEPARTMENTS = Object.values(DEPARTMENTS).flat()


const STATUS_PAGE_TITLES: Record<ComplaintStatus, string> = {
  New: "Νέες αναφορές",
  UnderReview: "Υπό εξέταση",
  InProgress: "Σε εξέλιξη",
  Pending: "Εκκρεμούν",
  Resolved: "Επιλύθηκαν",
  Rejected: "Απορρίφθηκαν",
}

function getPageTitle(status: string | undefined): string {
  if (status && status in STATUS_PAGE_TITLES) {
    return STATUS_PAGE_TITLES[status as ComplaintStatus]
  }
  return "Αναφορές προσβασιμότητας"
}
export default function AdminReportsPage() {
  const [searchParams] = useSearchParams()
  const statusFromUrl = searchParams.get("status")

  const [result, setResult] = useState<PaginatedResult<ComplaintListItem> | null>(null)
  const [pageNumber, setPageNumber] = useState(1)
  // Αριθμός του πιο πρόσφατου request που ξεκινήσαμε — χρησιμοποιείται
  // για να ξέρουμε αν ακόμα περιμένουμε response (isLoading) και για να
  // αγνοούμε απαντήσεις από παλιότερα, ξεπερασμένα requests
  const [latestRequestId, setLatestRequestId] = useState(0)
  const [loadedRequestId, setLoadedRequestId] = useState(0)
  const isLoading = latestRequestId !== loadedRequestId

  //το φίλτρο
  const [filters, setFilters] = useState<ComplaintFilters>({
    status: statusFromUrl ?? undefined,
    sortOrder: "newest",
  })
  const [keywordInput, setKeywordInput] = useState("")

  // Αν αλλάξει το ?status= στο URL (π.χ. ξανά-κλικ σε άλλη κάρτα του Dashboard),
  // ενημερώνουμε το φίλτρο και γυρνάμε στη σελίδα 1
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFilters((prev) => ({ ...prev, status: statusFromUrl ?? undefined }))
    setPageNumber(1)
  }, [statusFromUrl])

  // Debounce του keyword ώστε να μη γίνεται ένα API call ανά πληκτρολόγημα. Το keyword ενημερώνεται πργματικά μετά από 400ms
  useEffect(() => {
    const timeout = setTimeout(() => {
      setFilters((prev) => ({ ...prev, keyword: keywordInput || undefined }))
      setPageNumber(1)
    }, 400)
    return () => clearTimeout(timeout)
  }, [keywordInput])

  //fetch
  useEffect(() => {
    const requestId = latestRequestId + 1
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLatestRequestId(requestId)

    getComplaints(pageNumber, PAGE_SIZE, filters)
        .then((data) => {
          setResult(data)
          setLoadedRequestId(requestId)
        })
        .catch(() => {
          toast.error("Αδυναμία φόρτωσης αναφορών. Δοκιμάστε ξανά.")
          setLoadedRequestId(requestId)
        })
  }, [pageNumber, filters])


  const updateFilter = (key: keyof ComplaintFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value === "all" ? undefined : value }))
    setPageNumber(1)
  }

  const handleFilterChange = (key: keyof ComplaintFilters) => (value: string) => {
    updateFilter(key, value)
  }

  return (
      <Layout pageTitle={getPageTitle(filters.status)}>
        <div className="max-w-4xl mx-auto py-8">
          <h1 className="text-2xl font-medium text-foreground mb-1">
            {getPageTitle(filters.status)}

          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            Αναζητήστε και διαχειριστείτε τις αναφορές προσβασιμότητας
          </p>

          {/* Φίλτρα */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-4">
            <Field className="lg:col-span-3">
              <FieldLabel htmlFor="keyword">Λέξη-κλειδί</FieldLabel>
              <div className="relative">
                <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                    aria-hidden="true"
                />
                <Input
                    id="keyword"
                    type="search"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    placeholder="Αναζήτηση τίτλου ή κατηγορίας…"
                    className="pl-9"
                />
              </div>
            </Field>

            <Field>
              <FieldLabel htmlFor="filter-dept">Τμήμα</FieldLabel>
              <Select
                  value={filters.department ?? "all"}
                  onValueChange={handleFilterChange("department")}
              >
                <SelectTrigger id="filter-dept">
                  <SelectValue placeholder="Όλα τα τμήματα" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Όλα τα τμήματα</SelectItem>
                  {ALL_DEPARTMENTS.map((d) => (
                      // Δημιουργείται item για κάθε department (πάνω: λίστα Object.values(DEPARTMENTS).flat())
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel htmlFor="filter-category">Κατηγορία</FieldLabel>
              <Select
                  value={filters.category ?? "all"}
                  onValueChange={handleFilterChange("category")}
              >
                <SelectTrigger id="filter-category">
                  <SelectValue placeholder="Όλες οι κατηγορίες" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Όλες οι κατηγορίες</SelectItem>
                  {/*ένα item για κάθε κατηγορία */}
                  {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel htmlFor="filter-status">Κατάσταση</FieldLabel>
              <Select
                  value={filters.status ?? "all"}
                  onValueChange={handleFilterChange("status")}
              >
                <SelectTrigger id="filter-status">
                  <SelectValue placeholder="Όλες οι καταστάσεις" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Όλες οι καταστάσεις</SelectItem>
                  {/*ένα item για κάθε status */}
                  {(Object.keys(COMPLAINT_STATUS_LABELS) as ComplaintStatus[]).map((s) => (
                      <SelectItem key={s} value={s}>
                        {COMPLAINT_STATUS_LABELS[s]}
                      </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel htmlFor="filter-sort">Ταξινόμηση</FieldLabel>
              <Select
                  value={filters.sortOrder ?? "newest"}
                  onValueChange={handleFilterChange("sortOrder")}
              >
                <SelectTrigger id="filter-sort">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Νεότερη πρώτα</SelectItem>
                  <SelectItem value="oldest">Παλαιότερη πρώτα</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>

          {/* Λίστα */}
          {isLoading ? (
              <p role="status" aria-live="polite" className="text-center py-12 text-sm text-muted-foreground">
                Φόρτωση αναφορών…
              </p>
          ) : (
              <ReportList items={result?.data ?? []} linkTo={(id) => `/admin/reports/${id}`} />
          )}
          {/*αν isLoading τότε βάλε "φόρτωση αναφορών" αν όχι φέρε τα στοιχεία της λίστας*/}

          {/* Αν έχουμε αποτέλεσμα, Pagination */}
          {result && result.totalPages > 1 && (
              <Pagination className="mt-6">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                        href="#"
                        aria-disabled={pageNumber <= 1}  //λέει στον αναγνώστη ότι είναι απενργοποοημενο το κουμπί όταν pN<=1
                        tabIndex={pageNumber <= 1 ? -1 : undefined}    //όταν ένας χρήστης προσπαθεί να πάει με tab σε απενεργοποιημένο δεν μπροεί
                        className={pageNumber <= 1 ? "pointer-events-none opacity-50" : ""}
                        //αν είναι pN>1 πήγαινε στη προηγούμενη
                        onClick={(e) => {
                          e.preventDefault()
                          if (pageNumber > 1) setPageNumber((p) => p - 1)
                        }}
                    />
                  </PaginationItem>

                  {Array.from({ length: result.totalPages }, (_, i) => i + 1).map((p) => (
                      <PaginationItem key={p}>
                        <PaginationLink
                            href="#"
                            isActive={p === pageNumber}
                            aria-current={p === pageNumber ? "page" : undefined}   //ενημερώνει τον αναγνώστη ότι συτή είναι η σελίδα στην οποία βρίσκεται τώρα
                            onClick={(e) => {
                              e.preventDefault()
                              setPageNumber(p)
                            }}
                        >
                          {p}
                        </PaginationLink>
                      </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                        href="#"
                        aria-disabled={pageNumber >= result.totalPages}    //αντίστοιχα με το prev αλλά για το τέλος των σελίδων
                        tabIndex={pageNumber >= result.totalPages ? -1 : undefined}
                        className={pageNumber >= result.totalPages ? "pointer-events-none opacity-50" : ""}
                        onClick={(e) => {
                          e.preventDefault()
                          if (pageNumber < result.totalPages) setPageNumber((p) => p + 1)
                        }}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
          )}
        </div>
      </Layout>
  )
}
