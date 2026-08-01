const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export interface ValidationReportType {
  id?: string;
  report_id?: string;
  document_id: string;
  filename: string;
  file_size: number;
  page_count: number;
  sha256_hash: string;
  overall_status: "VALID" | "WARNING" | "INVALID";
  signature_found: boolean;
  signature_valid: boolean;
  document_modified: boolean;
  signed_by?: string;
  certificate_issuer?: string;
  certificate_serial?: string;
  signing_time?: string;
  certificate_expiry?: string;
  trust_status?: string;
  validation_time_ms: number;
  summary_checklist: Array<{ status: "PASS" | "FAIL"; label: string }>;
  validation_details: any;
  created_at: string;
}

export interface HistoryItem {
  document_id: string;
  filename: string;
  file_size: number;
  upload_date: string;
  sha256_hash: string;
  report_id?: string;
  overall_status: string;
  signed_by?: string;
  trust_status?: string;
}

export async function uploadAndValidatePdf(file: File, token?: string): Promise<ValidationReportType> {
  const formData = new FormData();
  formData.append("file", file);

  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}/validate`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to validate document signature");
  }

  return response.json();
}

export async function getReportById(reportId: string): Promise<ValidationReportType> {
  const response = await fetch(`${API_BASE}/report/${reportId}`);
  if (!response.ok) {
    throw new Error("Report not found");
  }
  return response.json();
}

export async function getHistory(token?: string): Promise<HistoryItem[]> {
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const response = await fetch(`${API_BASE}/history`, { headers });
  if (!response.ok) {
    return [];
  }
  return response.json();
}

export async function deleteDocument(docId: string, token?: string): Promise<boolean> {
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const response = await fetch(`${API_BASE}/document/${docId}`, {
    method: "DELETE",
    headers,
  });
  return response.ok;
}

export async function getAdminAnalytics(token: string) {
  const response = await fetch(`${API_BASE}/admin/analytics`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Unauthorized or server error");
  return response.json();
}

export async function getAdminDocuments(token: string, statusFilter?: string, search?: string) {
  let url = `${API_BASE}/admin/documents?`;
  if (statusFilter) url += `status_filter=${encodeURIComponent(statusFilter)}&`;
  if (search) url += `search=${encodeURIComponent(search)}`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Failed to load admin documents");
  return response.json();
}

export async function getAdminLogs(token: string) {
  const response = await fetch(`${API_BASE}/admin/logs`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Failed to load audit logs");
  return response.json();
}

export async function loginUser(email: string, password: string) {
  const body = new URLSearchParams();
  body.append("username", email);
  body.append("password", password);

  const response = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || "Invalid login credentials");
  }

  return response.json();
}

export function getDownloadUrl(reportId: string, format: "pdf" | "json" | "csv") {
  return `${API_BASE}/report/${reportId}/download?format=${format}`;
}
