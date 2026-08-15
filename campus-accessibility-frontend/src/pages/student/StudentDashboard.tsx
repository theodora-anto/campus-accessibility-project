import { Link } from "react-router-dom"
import Layout from "@/components/Layout"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Search, FileText, ClipboardList, ArrowRight } from "lucide-react"

interface DashboardCard {
  icon: typeof Search
  title: string
  description: string
  path: string
}

const cards: DashboardCard[] = [
  {
    icon: Search,  //lucide
    title: "Αναζήτηση προβλημάτων",
    description: "Αναζητήστε αναφορές προσβασιμότητας ανά τμήμα, κατηγορία ή κατάσταση",
    path: "/student/search",
  },
  {
    icon: FileText,
    title: "Αναφορά προβλήματος",
    description: "Υποβάλετε νέα αναφορά με φωτογραφία και περιγραφή του προβλήματος",
    path: "/student/report",
  },
  {
    icon: ClipboardList,
    title: "Οι αναφορές μου",
    description: "Παρακολουθήστε την κατάσταση των αναφορών που έχετε υποβάλει",
    path: "/student/my-complaints",
  },
]

export default function StudentDashboard() {
  return (
      <Layout pageTitle="Πίνακας ελέγχου">
        <div className="max-w-4xl mx-auto py-8">
          <h1 className="text-2xl font-medium text-foreground mb-1">Πίνακας ελέγχου</h1>
          <p className="text-sm text-muted-foreground mb-8">Τι θέλετε να κάνετε σήμερα;</p>

          <nav aria-label="Κύριες ενέργειες">
            <ul role="list" className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(220px,1fr))]">
              {/*role="list" για να αντιλαμβάνεται σίγουρα ο αναγνώστης το στοιχείο ως στοιχείο λίστας (παρά το li καμιά φορά αντιμετντωπίζεται ως div)*/}
              {cards.map((card) => {
                const Icon = card.icon
                return (
                    <li key={card.path}>
                      <Link
                          to={card.path}
                          className="block h-full no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring rounded-xl"
                      >
                        <Card className="h-full transition-colors hover:border-ring">
                          <CardHeader>
                            <div
                                className="w-11 h-11 bg-accent rounded-[10px] flex items-center justify-center"
                                aria-hidden="true"
                            >
                              <Icon className="h-5 w-5 text-accent-foreground" />
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
