import { z } from "zod"
import type { ComplaintStatus } from "@/types/complaintStatus.ts"
import { SCHOOLS, DEPARTMENTS } from "@/data/departments"
import { CATEGORIES } from "@/data/categories"

//interfaces κι όχι zod schema (το backend μου ήδη έχει κάνει validation, άρα zod schema μόνο στη φόρμα)
export interface ComplaintListItem {
    id: number
    title: string
    category: string
    department: string
    status: ComplaintStatus
    submittedAt: string
}

export interface ComplaintImage {
    id: number
    filePath: string
    altText?: string
}

export interface ComplaintHistory {
    status: ComplaintStatus
    adminComment?: string
    changedAt: string
}

export interface ComplaintDetail {
    id: number
    title: string
    school: string
    department: string
    category: string
    status: ComplaintStatus
    incidentDate: string
    location?: string
    description: string
    submittedAt: string
    // Μόνο για admin, null για student
    submittedByFullName?: string
    submittedByDepartment?: string
    submittedBySchool?: string
    images: ComplaintImage[]
    history: ComplaintHistory[]
}

export interface DashboardStats {
    newCount: number
    underReviewCount: number,
    inProgressCount: number,
    pendingCount: number,
    resolvedCount: number,
    rejectedCount: number,
}

//Zod schema για τη φόρμα υποβολής αναφοράς
// (ComplaintInsertDTO ) του backend



export const complaintFormSchema = z
    .object({
        title: z
            .string()
            .min(3, { message: "Ο τίτλος πρέπει να έχει τουλάχιστον 3 χαρακτήρες." })
            .max(120, { message: "Ο τίτλος δεν μπορεί να υπερβαίνει τους 120 χαρακτήρες." }),
        category: z
            .enum(CATEGORIES, { message: "Επιλέξτε έγκυρη κατηγορία." }),
        school: z
            .string()
            .min(1, { message: "Επιλέξτε σχολή." })
            .refine(val => SCHOOLS.map(s => s.label).includes(val), {
                message: "Μη έγκυρη σχολή.",
            }),
        department: z
            .string()
            .min(1, { message: "Επιλέξτε τμήμα." }),
        incidentDate: z
            .string()
            .regex(/^\d{2}\/\d{2}\/\d{4}$/, { message: "Μορφή ημερομηνίας: ΗΗ/ΜΜ/ΕΕΕΕ" })
            .refine(val => {
                const [dd, mm, yyyy] = val.split("/").map(Number)
                const date = new Date(yyyy, mm - 1, dd)
                return !isNaN(date.getTime()) && date <= new Date()
            }, { message: "Μη έγκυρη ημερομηνία ή ημερομηνία στο μέλλον." }),
        location: z
            .string()
            .max(200, { message: "Η τοποθεσία δεν μπορεί να υπερβαίνει τους 200 χαρακτήρες." })
            .optional(),
        description: z
            .string()
            .min(20, { message: "Η περιγραφή πρέπει να έχει τουλάχιστον 20 χαρακτήρες." })
            .max(1000, { message: "Η περιγραφή δεν μπορεί να υπερβαίνει τους 1000 χαρακτήρες." }),
    })
    // Έλεγχος ότι το τμήμα ανήκει στη σχολή — αντιστοιχεί με [ValidDepartment]
    .refine(data => {
        if (!data.school || !data.department) return true
        const schoolKey = SCHOOLS.find(s => s.label === data.school)?.value
        if (!schoolKey) return false
        return DEPARTMENTS[schoolKey]?.includes(data.department) ?? false
    }, {
        message: "Το τμήμα δεν ανήκει στη σχολή που επιλέξατε.",
        path: ["department"],
    })

export type ComplaintFormFields = z.infer<typeof complaintFormSchema>
