import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Boolean, DateTime, Text, ForeignKey, Float
from sqlalchemy.orm import relationship
from app.db.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    role = Column(String, default="user") # 'user' or 'admin'
    created_at = Column(DateTime, default=datetime.utcnow)
    
    documents = relationship("Document", back_populates="owner", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="user")

class Document(Base):
    __tablename__ = "documents"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_size = Column(Integer, nullable=False) # bytes
    page_count = Column(Integer, default=1)
    sha256_hash = Column(String, nullable=False)
    upload_date = Column(DateTime, default=datetime.utcnow)
    
    owner = relationship("User", back_populates="documents")
    validation_reports = relationship("ValidationReport", back_populates="document", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="document", cascade="all, delete-orphan")

class ValidationReport(Base):
    __tablename__ = "validation_reports"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    document_id = Column(String, ForeignKey("documents.id", ondelete="CASCADE"), nullable=False)
    
    overall_status = Column(String, nullable=False) # 'VALID', 'WARNING', 'INVALID'
    signature_found = Column(Boolean, default=False)
    signature_valid = Column(Boolean, default=False)
    document_modified = Column(Boolean, default=True) # True means modified or unknown
    cert_valid = Column(Boolean, default=False)
    
    signed_by = Column(String, nullable=True)
    certificate_issuer = Column(String, nullable=True)
    certificate_serial = Column(String, nullable=True)
    signing_time = Column(String, nullable=True)
    certificate_expiry = Column(String, nullable=True)
    trust_status = Column(String, nullable=True)
    
    validation_time_ms = Column(Float, default=0.0)
    summary_checklist = Column(Text, nullable=True) # JSON format string
    validation_details = Column(Text, nullable=True) # JSON format string
    created_at = Column(DateTime, default=datetime.utcnow)
    
    document = relationship("Document", back_populates="validation_reports")

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    document_id = Column(String, ForeignKey("documents.id", ondelete="CASCADE"), nullable=True)
    action = Column(String, nullable=False) # UPLOAD, VALIDATE, DOWNLOAD_REPORT, DELETE
    ip_address = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    details = Column(String, nullable=True)
    
    user = relationship("User", back_populates="audit_logs")
    document = relationship("Document", back_populates="audit_logs")
