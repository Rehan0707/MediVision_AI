
// Force dynamic rendering to fix Vercel build error with useSearchParams
export const dynamic = "force-dynamic";

import AdminApprovalClient from "./AdminApprovalClient";

export default function AdminApprovalPage() {
    return <AdminApprovalClient />;
}
