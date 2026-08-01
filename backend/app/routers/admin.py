from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import func

from app.db.database import get_db
from app.db.models import Document, ValidationReport, User, AuditLog
from app.routers.auth import require_admin

router = APIRouter(prefix="/admin", tags=["Admin Dashboard"])


@router.get("/analytics")
async def get_analytics(
    db: AsyncSession = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    # Total documents
    total_docs_res = await db.execute(select(func.count(Document.id)))
    total_documents = total_docs_res.scalar() or 0

    # Total validations
    total_val_res = await db.execute(select(func.count(ValidationReport.id)))
    total_validations = total_val_res.scalar() or 0

    # Status breakdown
    valid_res = await db.execute(select(func.count(ValidationReport.id)).where(ValidationReport.overall_status == "VALID"))
    valid_count = valid_res.scalar() or 0

    warning_res = await db.execute(select(func.count(ValidationReport.id)).where(ValidationReport.overall_status == "WARNING"))
    warning_count = warning_res.scalar() or 0

    invalid_res = await db.execute(select(func.count(ValidationReport.id)).where(ValidationReport.overall_status == "INVALID"))
    invalid_count = invalid_res.scalar() or 0

    # User count
    user_res = await db.execute(select(func.count(User.id)))
    total_users = user_res.scalar() or 0

    return {
        "total_documents": total_documents,
        "total_validations": total_validations,
        "valid_count": valid_count,
        "warning_count": warning_count,
        "invalid_count": invalid_count,
        "total_users": total_users,
        "success_rate_percent": round((valid_count / total_validations * 100), 1) if total_validations > 0 else 0
    }


@router.get("/documents")
async def get_all_documents(
    status_filter: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    query = select(Document).options(selectinload(Document.validation_reports), selectinload(Document.owner)).order_by(Document.upload_date.desc())
    
    result = await db.execute(query)
    docs = result.scalars().all()
    
    out_docs = []
    for d in docs:
        latest_report = d.validation_reports[-1] if d.validation_reports else None
        overall_st = latest_report.overall_status if latest_report else "UNVALIDATED"
        
        if status_filter and status_filter.upper() != "ALL" and overall_st != status_filter.upper():
            continue
            
        if search:
            search_lower = search.lower()
            match_filename = search_lower in d.filename.lower()
            match_sha = search_lower in d.sha256_hash.lower()
            match_signer = latest_report and latest_report.signed_by and search_lower in latest_report.signed_by.lower()
            if not (match_filename or match_sha or match_signer):
                continue
                
        out_docs.append({
            "id": d.id,
            "filename": d.filename,
            "file_size": d.file_size,
            "page_count": d.page_count,
            "sha256_hash": d.sha256_hash,
            "upload_date": d.upload_date.isoformat(),
            "owner_email": d.owner.email if d.owner else "Guest",
            "report_id": latest_report.id if latest_report else None,
            "overall_status": overall_st,
            "signed_by": latest_report.signed_by if latest_report else None,
            "certificate_issuer": latest_report.certificate_issuer if latest_report else None,
            "trust_status": latest_report.trust_status if latest_report else None
        })
        
    return out_docs


@router.get("/logs")
async def get_audit_logs(
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    query = select(AuditLog).options(selectinload(AuditLog.user), selectinload(AuditLog.document)).order_by(AuditLog.timestamp.desc()).limit(limit)
    result = await db.execute(query)
    logs = result.scalars().all()
    
    return [
        {
            "id": log.id,
            "user_email": log.user.email if log.user else "Anonymous",
            "action": log.action,
            "document_filename": log.document.filename if log.document else "N/A",
            "ip_address": log.ip_address or "127.0.0.1",
            "timestamp": log.timestamp.isoformat(),
            "details": log.details
        }
        for log in logs
    ]
