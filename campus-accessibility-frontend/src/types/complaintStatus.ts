//Οι καταστάσεις των παραπόνων
export type ComplaintStatus =
    | "New"
    | "UnderReview"
    | "InProgress"
    | "Pending"
    | "Resolved"
    | "Rejected"

export const COMPLAINT_STATUS_LABELS: Record<ComplaintStatus, string> = {
    New: "Νέα",
    UnderReview: "Υπό εξέταση",
    InProgress: "Σε εξέλιξη",
    Pending: "Εκκρεμεί",
    Resolved: "Επιλύθηκε",
    Rejected: "Απορρίφθηκε",
}
