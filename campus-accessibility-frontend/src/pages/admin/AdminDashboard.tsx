import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import Layout from "@/components/Layout"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Inbox, Eye, Settings2, Clock, Search, ArrowRight, Loader2 } from "lucide-react"
import { getComplaintStats } from "@/api/complaints"
import type { DashboardStats } from "@/schemas/complaint"

//όμοια με το Dashboard του student με τη διαφορά ότι έρχονται και τα νούμερα από το be
interface ActionCard {
  icon: typeof Inbox
  title: string
  description: string
  path: string
  count?: number
}

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true)

  const [stats, setStats] = useState<DashboardStats>({
    newCount: 0,
    underReviewCount: 0,
    inProgressCount: 0,
    pendingCount: 0,
    resolvedCount: 0,
    rejectedCount: 0,
  })
//φέρνουμε τα στατιστικά
  useEffect(() => {
    getComplaintStats()
        .then(setStats)
        .catch(() => {
          // Αν αποτύχει το request, fallback σε μηδενικά stats
          setStats({
            newCount: 0,
            underReviewCount: 0,
            inProgressCount: 0,
            pendingCount: 0,
            resolvedCount: 0,
            rejectedCount: 0,
          })
        })
        .finally(() => setIsLoading(false))
  }, [])

  const cards: ActionCard[] = [
    {
      icon: Inbox,
      title: "Νέες αναφορές",
      description: "Αναφορές που δεν έχουν εξεταστεί ακόμα",
      path: "/admin/reports?status=New",
      count: stats.newCount,
    },
    {
      icon: Eye,
      title: "Υπό εξέταση",
      description: "Αναφορές που βρίσκονται σε αρχικό έλεγχο",
      path: "/admin/reports?status=UnderReview",
      count: stats.underReviewCount,
    },
    {
      icon: Settings2,
      title: "Σε εξέλιξη",
      description: "Αναφορές που βρίσκονται σε διαδικασία επίλυσης",
      path: "/admin/reports?status=InProgress",
      count: stats.inProgressCount,
    },
    {
      icon: Clock,
      title: "Εκκρεμούν",
      description: "Αναφορές που αναμένουν ενέργεια από τρίτο",
      path: "/admin/reports?status=Pending",
      count: stats.pendingCount,
    },
    {
      icon: Search,
      title: "Αναζήτηση αναφορών",
      description: "Αναζητήστε ανά τμήμα, κατηγορία, κατάσταση ή λέξη-κλειδί",
      path: "/admin/reports",
    },
  ]

  // Χτίζεται δυναμικά από τα ίδια τα title/description/count — πάντα ξεκινάει
  // με το ακριβές ορατό κείμενο (WCAG 2.5.3 Label in Name), και προσθέτει
  // στο τέλος τον αριθμό, που αλλιώς θα ήταν αόρατος στον screen reader
  // αφού το badge είναι aria-hidden.
  const cardAriaLabel = (card: ActionCard) => {
    const base = `${card.title}. ${card.description}.`
    if (card.count === undefined) return base
    if (isLoading) return `${base} Φόρτωση αριθμού…`
    return `${base} ${card.count} αναφορές.`
  }

  return (
      <Layout pageTitle="Πίνακας διαχείρισης">
        <div className="max-w-4xl mx-auto py-8">
          <h1 className="text-2xl font-medium text-foreground mb-1">Πίνακας διαχείρισης</h1>
          <p className="text-sm text-muted-foreground mb-8">Τι θέλετε να κάνετε σήμερα;</p>
          {isLoading && (
              <p role="status" aria-live="polite" className="sr-only">
                Φόρτωση στατιστικών…
              </p>
          )}
          <nav aria-label="Κύριες ενέργειες">
            <ul role="list" className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(220px,1fr))]">
              {cards.map((card) => {
                const Icon = card.icon
                return (
                    <li key={card.path}>
                      <Link
                          to={card.path}
                          aria-label={cardAriaLabel(card)}
                          className="block h-full no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring rounded-xl"
                      >
                        <Card className="h-full transition-colors hover:border-ring">
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div
                                  className="w-11 h-11 bg-accent rounded-[10px] flex items-center justify-center"
                                  aria-hidden="true"
                              >
                                <Icon className="h-5 w-5 text-accent-foreground" />
                              </div>
                              {card.count !== undefined && (
                                  <span
                                      aria-hidden="true"
                                      className="min-w-5 h-5 flex items-center justify-center text-xs font-medium px-2 rounded-full text-white bg-primary"
                                  >
                                        {isLoading ? (
                                            <Loader2 className="h-3 w-3 animate-spin" />
                                        ) : (
                                            card.count
                                        )}
                                         </span>
                              )}
                            </div>
                            <CardTitle>{card.title}</CardTitle>
                            <CardDescription>{card.description}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <ArrowRight
                                className="h-4 w-4 text-primary ml-auto"
                                aria-hidden="true"
                            />
                          </CardContent>
                        </Card>
                      </Link>
                    </li>
                )
              })}
            </ul>
          </nav>
        </div>
      </Layout>
  )
}
