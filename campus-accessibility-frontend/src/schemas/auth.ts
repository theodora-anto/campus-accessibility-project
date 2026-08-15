import { z } from "zod"
import { SCHOOLS, DEPARTMENTS } from "../data/departments"

//Password regex
const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*\W).{8,}$/

//Login (User Login DTO στο backend)
export const loginSchema = z.object({
    email: z
        .email({ message: "Μη έγκυρη μορφή email." })
        .min(1, { message: "Το email είναι υποχρεωτικό." }),

    password: z
        .string()
        .min(1, { message: "Ο κωδικός είναι υποχρεωτικός." })

})

export type LoginFields = z.infer<typeof loginSchema>

// Registration (Student Signup DTO στο backend)
export const registerSchema = z
    .object({
        firstname: z
            .string()
            .min(2, { message: "Το όνομα πρέπει να έχει τουλάχιστον 2 χαρακτήρες." })
            .max(50, { message: "Το όνομα δεν μπορεί να υπερβαίνει τους 50 χαρακτήρες." }),
        lastname: z
            .string()
            .min(2, { message: "Το επώνυμο πρέπει να έχει τουλάχιστον 2 χαρακτήρες." })
            .max(50, { message: "Το επώνυμο δεν μπορεί να υπερβαίνει τους 50 χαρακτήρες." }),
        email: z
            .email({ message: "Μη έγκυρη διεύθυνση email." })
            .min(1, { message: "Το email είναι υποχρεωτικό." })
            .max(100, { message: "Το email δεν μπορεί να υπερβαίνει τους 100 χαρακτήρες." }),
        school: z
            .string()
            .min(1, { message: "Επιλέξτε σχολή." })
            .refine(val => SCHOOLS.map(s => s.label).includes(val), {
                message: "Μη έγκυρη σχολή.",
            }),
        department: z
            .string()
            .min(1, { message: "Επιλέξτε τμήμα." }),
        password: z
            .string()
            .min(1, { message: "Ο κωδικός είναι υποχρεωτικός." })
            .regex(passwordRegex, {
                message: "Ο κωδικός πρέπει να περιέχει τουλάχιστον ένα κεφαλαίο, ένα πεζό, έναν αριθμό και έναν ειδικό χαρακτήρα.",
            }),
        confirmPassword: z
            .string()
            .min(1, { message: "Η επιβεβαίωση κωδικού είναι υποχρεωτική." }),
    })
    // Έλεγχος ότι οι κωδικοί ταιριάζουν [Compare("Password")]
    .refine(data => data.password === data.confirmPassword, {
        message: "Οι κωδικοί δεν ταιριάζουν.",
        path: ["confirmPassword"],
    })
    // Έλεγχος ότι το τμήμα ανήκει στη σχολή [ValidDepartment στο backend]
    .refine(data => {
        if (!data.school || !data.department) return true
        const schoolKey = SCHOOLS.find(s => s.label === data.school)?.value
        if (!schoolKey) return false
        return DEPARTMENTS[schoolKey]?.includes(data.department) ?? false
    }, {
        message: "Το τμήμα δεν ανήκει στη σχολή που επιλέξατε.",
        path: ["department"],
    })

export type RegisterFields = z.infer<typeof registerSchema>

// Login
export interface LoginResponse {
    token: string
    role: "Admin" | "Student"
    fullName: string
}

