// Κλήσεις προς το backend για τις αναφορές

import type {
    ComplaintListItem,
    ComplaintDetail,
    DashboardStats,
} from "../schemas/complaint"

import type {
    ComplaintFilters,
    PaginatedResult,
} from "../types/complaintFilters"

const API_URL = import.meta.env.VITE_API_URL

// Helper
const authHeader = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token") ?? ""}`,
})

// Endpoints

// Λίστα με φίλτρα (για admin & student)
export async function getComplaints(
    pageNumber = 1,
    pageSize = 20,
    filters?: ComplaintFilters
): Promise<PaginatedResult<ComplaintListItem>> {
    const params = new URLSearchParams({
        pageNumber: String(pageNumber),
        pageSize: String(pageSize),
        ...(filters?.keyword && { keyword: filters.keyword }),
        ...(filters?.department && { department: filters.department }),
        ...(filters?.category && { category: filters.category }),
        ...(filters?.status && { status: filters.status }),
        ...(filters?.sortOrder && { sortOrder: filters.sortOrder }),
    })

    const res = await fetch(`${API_URL}/complaints?${params}`, {
        headers: authHeader(),
    })
    if (!res.ok) throw new Error("Failed to fetch complaints")
    return await res.json()
}

// Λεπτομέρεια αναφοράς
export async function getComplaintById(id: number): Promise<ComplaintDetail> {
    const res = await fetch(`${API_URL}/complaints/${id}`, {
        headers: authHeader(),
    })
    if (!res.ok) throw new Error("Failed to fetch complaint")
    return await res.json()
}

// Οι αναφορές του συνδεδεμένου student
export async function getMyComplaints(
    pageNumber = 1,
    pageSize = 20
): Promise<PaginatedResult<ComplaintListItem>> {
    const res = await fetch(
        `${API_URL}/complaints/my-complaints?pageNumber=${pageNumber}&pageSize=${pageSize}`,
        { headers: authHeader() }
    )
    if (!res.ok) throw new Error("Failed to fetch my complaints")
    return await res.json()
}

// Stats για admin dashboard
export async function getComplaintStats(): Promise<DashboardStats> {
    const res = await fetch(`${API_URL}/complaints/stats`, {
        headers: authHeader(),
    })
    if (!res.ok) throw new Error("Failed to fetch stats")
    return await res.json()
}

// Νέα αναφορά
export async function createComplaint(formData: FormData): Promise<ComplaintDetail> {
    const res = await fetch(`${API_URL}/complaints`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token") ?? ""}`,
        //λόγω της εικόνας, γιατί αυτό που στέλνω είναι multi-part form data κι δεν πρέπει να βάλω εγώ boundary (πού σταματάει η εικόνα)
        },
        body: formData, //λόγω της εικόνας.
    })
    if (!res.ok) throw new Error("Failed to create complaint")
    return await res.json()
}

// Review από admin (status + σχόλιο)
export async function reviewComplaint(
    id: number,
    status: string,
    adminComment?: string
): Promise<void> {
    const res = await fetch(`${API_URL}/complaints/${id}/review`, {
        method: "PUT",
        headers: authHeader(),
        body: JSON.stringify({ status, adminComment }),
    })
    if (!res.ok) throw new Error("Failed to review complaint")
}

// Alt text εικόνας από admin
export async function updateImageAltText(
    complaintId: number,
    imageId: number,
    altText: string
): Promise<void> {
    const res = await fetch(
        `${API_URL}/complaints/${complaintId}/images/${imageId}/alttext`,
        {
            method: "PUT",
            headers: authHeader(),
            body: JSON.stringify({ altText }),
        }
    )
    if (!res.ok) throw new Error("Failed to update alt text")
}