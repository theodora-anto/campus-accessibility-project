# Campus Accessibility

## 1. Περίληψη
Εφαρμογή αναφοράς προβλημάτων προσβασιμότητας στους χώρους του Πανεπιστημίου (χρησιμοποιήθηκε ο ΕΚΠΑ ως παράδειγμα) για φοιτητές. 

Οι φοιτητές μπορούν:
- να εγγραφούν στο σύστημα
- να υποβάλλουν αναφορές για ζητήματα προσβασιμότητας
- να παρακολουθούν την εξέλιξή τους
- να αναζητούν προβλήματα προσβασιμότητας σε όλο το πανεπιστήμιο

Ο διαχειριστής (admin):
- εξετάζει τις αναφορές που γίνονται από τους φοιτητές
- προσθέτει εναλλακτικό κείμενο στις φωτογραφίες όταν λαμβάνει τη νέα αναφορά
- ενημερώνει την κατάστασή των αναφορών κάθε φορά που αλλάζει κάτι
- προσθέτει σχόλια αν το επιθυμεί
- αναζητά προβλήματα προσβασιμότητας σε όλο το πανεπιστήμιο

Τελικό project για το Coding Factory 10.

### 1.1 Χαρακτηριστικά

- **Δύο ρόλοι**: φοιτητής και διαχειριστής με JWT authentication και role-based πρόσβαση σε δεδομένα και σελίδες
- **Υποβολή αναφορών/παραπόνων**: ο φοιτητής υποβάλει παράπονα με τίτλο, κατηγορία, σχολή/τμήμα, τοποθεσία, περιγραφή και έως 5 φωτογραφίες. Μόνο ο admin ξέρει ποιος φοιτητής έχει υποβάλει την αναφορά και σε ποιο τμήμα ανήκει. 
- **Παρακολούθηση κατάστασης**: κάθε αναφορά έχει πλήρες ιστορικό αλλαγών του διαχειριστή.
- **Alt-text workflow**: ο διαχειριστής περιγράφει κάθε φωτογραφία ή δηλώνει ότι δεν χρειάζεται περιγραφή (βάζοντας space) πριν μπορέσει να αλλάξει την κατάσταση της.
- **Αναζήτηση & φίλτρα**: και οι δύο ρόλοι μπορούν να αναζητούν αναφορές ανά τμήμα, κατηγορία, κατάσταση ή λέξη-κλειδί.
- **Πίνακας διαχείρισης**: ο φοιτητής μπορεί να παρακολουθεί τις δικές του αναφορές. Ο διαχειριστής μπορεί να διαχειρίζεται τις αναφορές ανά κατάσταση και να βλέπει το πλήθος τους .
- **Προσβάσιμος σχεδιασμός**: η εφαρμογή είναι προσβάσιμη με το πληκτρολόγιο και με τον αναγνώστη οθόνης NVDA.

## 2. Τεχνολογίες

**Backend** — ASP.NET Core (.NET 10), Entity Framework Core, SQL Server, JWT authentication, AutoMapper, Swagger/OpenAPI.

**Frontend** — React 19, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Router, React Hook Form + Zod.

**Deployment** — Docker Compose (SQL Server + .NET API + Nginx-served React build).

## 3. Δομή repository

```
campus-accessibility-project/
├── CampusAccessibilityBackend/      # .NET API + docker-compose.yml (backend + db + frontend)
│   ├── CampusAccessibilityBackend/  # .csproj
│   ├── docker-compose.yml
│   ├── Dockerfile
│   ├── init-db.sql
│   ├── .env.example
│   └── .env                         # δημιουργείται τοπικά, δεν είναι στο repo
└── campus-accessibility-frontend/   # React app
    ├── src/
    ├── Dockerfile
    ├── nginx.conf
    └── package.json
```
## 4. Βήματα deployment 
### 4.1 Προαπαιτούμενα

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (με Docker Compose)
- [Git](https://git-scm.com/download/win) (σε Windows)


### 4.2 Λήψη του κώδικα

```
git clone <URL-του-repository>
cd campus-accessibility-project
```


### 4.3 Ρύθμιση μεταβλητών περιβάλλοντος

Εντός του φακέλου `CampusAccessibilityBackend/` (σύμφωνα με τη [Δομή του project](#3-δομή-repository)) , δημιουργήστε ένα αρχείο `.env` που θα περιέχει τις μεταβλητές όπως το template `.env.example`

Για παράδειγμα:

```
SA_PASSWORD=ChangeThisPassword1!
DB_HOST=db
DB_PORT=1433
DB_NAME=CampusAccessibilityDb
DB_USER=appuser
DB_USER_PASSWORD=ChangeThisPassword1!
APP_PORT=8080
ASPNETCORE_ENVIRONMENT=Development
JWT_ISSUER=CampusAccessibilityAPI
JWT_AUDIENCE=CampusAccessibilityAPI
JWT_SECRET=<τουλάχιστον 32 τυχαίοι χαρακτήρες>
VITE_API_URL=http://localhost:8080/api/v1
VITE_API_BASE_URL=http://localhost:8080
```

**Οι παραπάνω τιμές αποτελούν ένα παράδειγμα, μην τις χρησιμοποιείτε. Αλλάξτε τις τιμές έχοντας υπόψιν τα παρακάτω:**:
- **`SA_PASSWORD`/`DB_USER_PASSWORD`** πρέπει να περιέχει τουλάχιστον 8 χαρακτήρες, με κεφαλαίο, πεζό, αριθμό και σύμβολο.
- **`JWT_SECRET`** πρέπει να περιέχει τουλάχιστον 32 χαρακτήρες
- **`DB_HOST`** πρέπει να είναι `db`, όχι `localhost`
- **`ASPNETCORE_ENVIRONMENT` πρέπει να παραμείνει `Development`** αλλιώς το Swagger UI δεν  θα δουλέψει (`Program.cs`, `if (app.Environment.IsDevelopment())`).
- **`APP_PORT` συνδέεται με το `VITE_API_URL`/`VITE_API_BASE_URL`**. Αν αλλάξετε το `APP_PORT`, θα πρέπει να ενημερώσετε και αυτές τις δύο τιμές ώστε να δείχνουν στο νέο port
- ** Το port του frontend (`5173`) δεν είναι μεταβλητή περιβάλλοντος** είναι hardcoded μέσα στο `docker-compose.yml` (`"5173:80"`) **και** στο CORS policy του backend στο `Program.cs` (`.WithOrigins("http://localhost:5173")`). Αν χρειαστεί να αλλάξει, απαιτείται επιπρόσθετα αλλαγή και στα δύο αυτά σημεία.


| Μεταβλητή | Περιγραφή |
|---|---|
| `SA_PASSWORD` | Password του SQL Server `sa` λογαριασμού |
| `DB_HOST`, `DB_PORT`, `DB_NAME` | Στοιχεία σύνδεσης στη βάση |
| `DB_USER`, `DB_USER_PASSWORD` | Λογαριασμός εφαρμογής που δημιουργείται αυτόματα κατά το πρώτο run |
| `APP_PORT` | Port του API στον host (default `8080`) |
| `ASPNETCORE_ENVIRONMENT` | `Development` ενεργοποιεί Swagger UI |
| `JWT_SECRET`, `JWT_ISSUER`, `JWT_AUDIENCE` | Παράμετροι υπογραφής JWT token |
| `VITE_API_URL` | Base URL του API όπως το βλέπει το frontend (π.χ. `http://localhost:8080/api/v1`) |
| `VITE_API_BASE_URL` | Base URL για static αρχεία όπως οι εικόνες (π.χ. `http://localhost:8080`) |





### 4.4 Build & Deploy

Από τον φάκελο `CampusAccessibilityBackend/` (όπου βρίσκεται το `docker-compose.yml`):

```
docker compose up -d --build
```

Αυτή η εντολή κάνει build και ξεκινά **4 containers**:

| Container | Ρόλος |
|---|---|
| `campus-accessibility-db` | SQL Server 2022 |
| `campus-accessibility-api` | Το .NET backend, εφαρμόζει αυτόματα τα migrations κατά την εκκίνηση |
| `campus-accessibility-frontend` | Το React build, σερβίρεται μέσω Nginx |
| `campus-accessibility-db-init` | Δημιουργεί τη βάση, καθώς και τον λογαριασμό εφαρμογής (server login + database user). Τρέχει μία φορά, μετά τερματίζει |


Το πρώτο `up -d --build` παίρνει μερικά λεπτά.

### 4.5 Επιβεβαίωση ότι δουλεύει

Αναμενόμενο αποτέλεσμα: 

`db` **Healthy**,
`api` και `frontend` **Running/Started**,
`db-init` **Exited (0)**

Μετά, ανοίξτε σε έναν browser:

- **Frontend**: http://localhost:5173
- **API / Swagger UI**: http://localhost:8080/swagger


### 4.6 Πρόσβαση στην εφαρμογή - Test Credentials

Ένας λογαριασμός διαχειριστή δημιουργείται αυτόματα κατά το πρώτο migration:

| Ρόλος | Email | Password |
|---|---|---|
| Admin | `admin@campusaccessibility.local` | `Admin1234!` |

Μπορείτε να δημιουργήσετε ένα λογαριασμό φοιτητή μέσω της σελίδας: `/register`.

Μπορείτε να εισέλθετε στην εφαρμογή είτε ως φοιτητής είτε ως διαχειριστής από τη σελίδα: `/login`

### 4.7 Προτεινόμενη ροή
1. Δημιουργήστε έναν φοιτητή μέσω της σελίδας `/register`
2. Κάντε `/login` ως φοιτητής
3. Από το  "Αναφορά Προβλήματος" δημιουργήστε ένα παράνονο/αναφορά ως φοιτητής και αποσυνδεθείτε
4. Εισέλθετε ως admin με τα παραπάνω credentials
5. Από τις "Νέες Αναφορές" δείτε το παράπονο του φοιτητή, επεξεργαστείτε το και αποσυνδεθείτε
6. Εισέλθετε ως φοιτητής και δείτε την νέα κατάσταση και τα σχόλια του admin το δείτε από το "Οι αναφορές μου"

Αν δημιουργήσετε παραπάνω από ένα παράπονα μπορείτε είτε ως admin είτε ως φοιτητής να φιλτράρετε και αναζητήσετε παράπονα/αναφορές στην "Αναζήτηση προβλημάτων"

### 4.8 Σταμάτημα / επανεκκίνηση

```
docker compose down          # σταματά τα containers, δεν σβήνει δεδομένα
docker compose up -d         # ξανασηκώνει χωρίς rebuild
docker compose down -v       # σταματά και διαγράφει όλα τα δεδομένα
```

Αν χρειαστεί rebuild μόνο ενός service μετά από αλλαγή κώδικα:

```
docker compose build --no-cache api        # μετά από αλλαγή στο backend
docker compose build --no-cache frontend   # μετά από αλλαγή στο frontend
```
και έπειτα:
```
docker compose up -d
```

## 5. API Documentation

Πλήρης τεκμηρίωση του REST API με Swagger διαθέσιμη στο http://localhost:8080/swagger. 

Περιλαμβάνει JWT authorization (Στο κουμπί `Authorize` εισάγετε μόνο το token χωρίς το πρόθεμα `Bearer `).


## 6. Περιορισμοί - Μελλοντικές επεκτάσεις

- να υποστηρίζει παραπάνω από έναν admin και το ιστορικό αλλαγών
- να εκθέτει ποιος συγκεκριμένος admin έκανε κάθε αλλαγή.
