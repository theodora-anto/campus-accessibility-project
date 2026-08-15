import { useEffect, useState } from "react"
import Layout from "@/components/Layout"
import ReportList from "@/components/ReportList"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { getMyComplaints } from "@/api/complaints"
import { toast } from "sonner"
import type { ComplaintListItem } from "@/schemas/complaint"

export default function MyReportsPage() {
  const [complaints, setComplaints] = useState<ComplaintListItem[]>([])
  const [query, setQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  // Απλό fetch χωρίς pagination UI (μικρό πλήθος παραπόνων),
  useEffect(() => {
    async function loadMyComplaints() {
      try {
        const result = await getMyComplaints()
        setComplaints(result.data)
      } catch {
        toast.error("Αδυναμία φόρτωσης αναφορών. Δοκιμάστε ξανά.")
      } finally {
        setIsLoading(false)
      }
    }

    loadMyComplaints()
  }, [])

  const filtered = complaints.filter((c) => {
    const q = query.toLowerCase()
    return c.title.toLowerCase().includes(q) || c.category.toLowerCase().includes(q)
  }) //φιλτράρει μόνο τις αναζητήσεις που είτε ο τίτλος ή η κατηγορία περιέχουν αυτό που αναζητάμε

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
  }
  return (
      <Layout pageTitle="Οι αναφορές μου">
        <div className="max-w-3xl mx-auto py-8">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
            <h1 className="text-2xl font-medium text-foreground">Οι αναφορές μου</h1>

            <div className="relative flex-1 max-w-[340px]">
              {/* search εικονίδιο lucide */}
              <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                  aria-hidden="true"
              />
              {/*search bar*/}
              <Input
                  type="search"
                  id="search-reports"
                  value={query}
                  onChange={handleChange}                  placeholder="Αναζήτηση αναφοράς…"
                  aria-label="Αναζήτηση στις αναφορές μου"   //προσβασιμότητα
                  className="pl-9"
              />
            </div>
          </div>
          {isLoading ? (
              <p role="status" aria-live="polite" className="text-center py-12 text-sm text-muted-foreground">
                Φόρτωση αναφορών…
              </p>
          ) : (
              <ReportList items={filtered} linkTo={(id) => `/student/complaints/${id}`} />
              )}
        </div>
      </Layout>
  )
}
