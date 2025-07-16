import type { FacilityWithCompany, Company } from '../types/database';
import type { Json } from '../types/supabase';

// モックデータ用のヘルパー関数
export function createMockFacility(data: {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  facility_type: string;
  opening_hours?: Record<string, string>;
  features?: Record<string, boolean>;
  company_id: string;
  qr_code: string;
  companies?: {
    name: string;
    code: string;
  };
}): FacilityWithCompany {
  const now = new Date().toISOString();
  
  const company: Company = data.companies ? {
    id: data.company_id,
    name: data.companies.name,
    code: data.companies.code,
    logo_url: null,
    description: null,
    is_active: true,
    created_at: now,
    updated_at: now,
  } : {
    id: data.company_id,
    name: 'Unknown Company',
    code: 'UNKNOWN',
    logo_url: null,
    description: null,
    is_active: true,
    created_at: now,
    updated_at: now,
  };

  return {
    id: data.id,
    name: data.name,
    address: data.address || null,
    phone: data.phone || null,
    email: data.email || null,
    facility_type: data.facility_type,
    opening_hours: (data.opening_hours || {}) as Json,
    features: (data.features || {}) as Json,
    company_id: data.company_id,
    branch_id: null,
    code: data.id, // モックではIDをコードとして使用
    qr_code: data.qr_code,
    is_active: true,
    created_at: now,
    updated_at: now,
    companies: company,
  };
}