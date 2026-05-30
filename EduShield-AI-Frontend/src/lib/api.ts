import { getLocalStudents, saveLocalStudents, Student } from './data/students';

const API_BASE_URL = 'http://localhost:8000/api';

// Helper to check if backend is running (short 1.2s timeout so the UI never hangs)
async function fetchWithTimeout(resource: string, options: RequestInit = {}): Promise<Response> {
  const { timeout = 1200 } = options as any;
  
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  const response = await fetch(resource, {
    ...options,
    signal: controller.signal
  });
  clearTimeout(id);
  return response;
}

// Map backend student schema to high-fidelity frontend student schema
export function mapBackendStudentToFrontend(backendStudent: any, latestRisk: any = null): Student {
  const riskLevel = latestRisk?.risk_level || backendStudent.latest_risk_assessment?.risk_level || 'stable';
  const riskScore = latestRisk ? Math.round(latestRisk.risk_score * 100) : 
                    backendStudent.latest_risk_assessment?.risk_score ? Math.round(backendStudent.latest_risk_assessment.risk_score * 100) : 15;
  const confidenceScore = latestRisk ? Math.round(latestRisk.confidence_score * 100) : 
                          backendStudent.latest_risk_assessment?.confidence_score ? Math.round(backendStudent.latest_risk_assessment.confidence_score * 100) : 88;
  const gender = backendStudent.gender === 'F' ? 'F' : 'M';
  const classVal = backendStudent.class || backendStudent.class_ || '8';

  return {
    id: backendStudent.student_id,
    dbId: backendStudent.id,
    name: backendStudent.name,
    class: classVal,
    section: backendStudent.section || 'A',
    age: backendStudent.age || 14,
    gender: gender,
    guardianName: backendStudent.guardianName || 'Parent of ' + backendStudent.name,
    guardianPhone: backendStudent.parent_phone || backendStudent.phone || '+91 9876543210',
    riskLevel: riskLevel as any,
    riskScore: riskScore,
    confidenceScore: confidenceScore,
    isHiddenStudent: backendStudent.isHidden || riskLevel === 'moderate' || false,
    attendanceRate: backendStudent.attendanceRate || 85,
    attendanceTrend: backendStudent.attendanceTrend || [85, 84, 83, 85, 84, 82, 85, 83, 82, 85, 84, 85],
    academicScore: backendStudent.academicScore || 72,
    academicTrend: backendStudent.academicTrend || [70, 71, 72, 70, 74, 71, 73, 72, 71, 74, 72, 72],
    participationScore: 65,
    participationTrend: [60, 62, 65, 63, 66, 65, 62, 64, 65, 66, 64, 65],
    homeworkConsistency: 75,
    behaviorScore: 80,
    emotionalWellbeing: 75,
    interactionFrequency: 45,
    riskFactors: backendStudent.riskFactors || [],
    interventions: backendStudent.interventions || [],
    observations: backendStudent.observations || [],
    aiExplanation: latestRisk?.reasoning || backendStudent.aiExplanation || `${backendStudent.name} is classified as ${riskLevel} risk. Early indicators are steady.`,
    enrollmentDate: backendStudent.enrollment_date || new Date().toISOString().split('T')[0],
    photoSeed: Math.floor(Math.random() * 1000)
  };
}

export const api = {
  /**
   * 1. Dynamic Login
   */
  async login(teacherId: string, password: string): Promise<{ success: boolean; token?: string; name?: string }> {
    try {
      // Build standard OAuth2 Form URL Encoded body for FastAPI security
      const params = new URLSearchParams();
      params.append('username', teacherId);
      params.append('password', password);

      const res = await fetchWithTimeout(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString()
      });

      if (!res.ok) {
        throw new Error('Invalid credentials');
      }

      const data = await res.json();
      return { success: true, token: data.access_token, name: data.name };
    } catch (e) {
      console.warn('[EduShield API] FastAPI Login unavailable. Activating localized demo credential checks.');
      // Localized demo fallback
      if (teacherId && password) {
        return { success: true, name: 'Sunita Sharma' };
      }
      return { success: false };
    }
  },

  /**
   * 2. List Students
   */
  async getStudents(): Promise<Student[]> {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/students/`);
      if (!res.ok) throw new Error('API error');
      
      const backendStudents = await res.json();
      
      // Seed fallback students on backend if empty
      if (backendStudents.length === 0) {
        return getLocalStudents();
      }

      // Map backend profiles to rich frontend structures
      return backendStudents.map((s: any) => mapBackendStudentToFrontend(s));
    } catch (e) {
      console.log('[EduShield API] FastAPI Student List offline. Falling back to Localized Storage Database.');
      return getLocalStudents();
    }
  },

  /**
   * 3. Get Single Student Detail (Includes active risk assessments!)
   */
  async getStudentById(studentId: string): Promise<Student | null> {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/students/${studentId}`);
      if (!res.ok) throw new Error('Student not found');
      
      const data = await res.json();
      return mapBackendStudentToFrontend(data.student, data.latest_risk_assessment);
    } catch (e) {
      console.log(`[EduShield API] FastAPI Student ${studentId} detail offline. Fetching from LocalStorage.`);
      const local = getLocalStudents();
      return local.find(s => s.id === studentId || s.id.toLowerCase() === studentId.toLowerCase()) || null;
    }
  },

  /**
   * 4. Add Student (Syncs to backend SQLite & updates LocalStorage!)
   */
  async addStudent(studentData: any): Promise<Student> {
    try {
      const payload = {
        student_id: studentData.id,
        name: studentData.name,
        class: studentData.class,
        section: studentData.section,
        gender: studentData.gender,
        phone: studentData.guardianPhone,
        parent_phone: studentData.guardianPhone,
        roll_number: String(Math.floor(Math.random() * 50) + 1),
        address: 'Jaipur, Rajasthan',
        date_of_birth: '2012-05-15',
        enrollment_date: new Date().toISOString().split('T')[0]
      };

      const res = await fetchWithTimeout(`${API_BASE_URL}/students/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Failed to create student on backend');
      
      const created = await res.json();
      
      // Also request a quick predictive risk assessment on backend!
      try {
        await fetchWithTimeout(`${API_BASE_URL}/students/${created.student_id}/assess-risk`, { method: 'POST' });
      } catch (err) {
        console.warn('Backend risk precheck failed. Student added successfully.');
      }

      const mapped = mapBackendStudentToFrontend(created);
      
      // Sync local storage so frontend stays in perfect alignment
      const local = getLocalStudents();
      local.unshift(mapped);
      saveLocalStudents(local);

      return mapped;
    } catch (e) {
      console.warn('[EduShield API] Backend Student Creation offline. Synced student directly to LocalStorage.');
      // LocalStorage fallback
      const local = getLocalStudents();
      local.unshift(studentData);
      saveLocalStudents(local);
      return studentData;
    }
  },

  /**
   * 5. Data Uploads (Attendance, Assessments, Student Spreadsheet)
   */
  async uploadFile(type: 'attendance' | 'assessments' | 'students', file: File): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${API_BASE_URL}/import/${type}`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Upload failed');
      }

      return await res.json();
    } catch (e: any) {
      console.warn(`[EduShield API] Upload of ${type} offline. Simulating local file parsing.`);
      
      // High fidelity localized simulation for offline demonstration
      await new Promise(resolve => setTimeout(resolve, 1500)); // simulate delay
      const mockSuccess = !file.name.includes('error');
      
      return {
        message: mockSuccess ? `${type.charAt(0).toUpperCase() + type.slice(1)} import completed` : 'Import failed due to layout mismatch',
        success: mockSuccess,
        import_id: 'mock-import-' + Math.random().toString(36).substring(7),
        rows_processed: mockSuccess ? Math.floor(Math.random() * 25) + 5 : 0,
        rows_failed: mockSuccess ? 0 : 4,
        rows_skipped: 0,
        errors: mockSuccess ? [] : ['Column header mismatch at Column 3', 'Row 8: Student ID does not exist']
      };
    }
  },

  async getImportHistory(): Promise<any[]> {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/import/history`);
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      return data.imports || [];
    } catch (e) {
      console.log('[EduShield API] Import history offline. Returning demo history.');
      return [
        {
          id: '1',
          upload_type: 'attendance',
          filename: 'may_attendance_final.csv',
          rows_processed: 30,
          rows_failed: 0,
          rows_skipped: 2,
          status: 'completed',
          created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        },
        {
          id: '2',
          upload_type: 'assessments',
          filename: 'math_unit_test3.xlsx',
          rows_processed: 28,
          rows_failed: 2,
          rows_skipped: 0,
          status: 'completed',
          error_summary: 'Row 14: Obtained marks greater than max marks',
          created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
        }
      ];
    }
  },

  /**
   * 6. Alerts & Notifications
   */
  async getAlerts(severity?: string, isRead?: boolean): Promise<any[]> {
    try {
      let url = `${API_BASE_URL}/alerts/?`;
      if (severity) url += `severity=${severity}&`;
      if (isRead !== undefined) url += `is_read=${isRead}&`;
      
      const res = await fetchWithTimeout(url);
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      return data.alerts || [];
    } catch (e) {
      console.log('[EduShield API] Alerts list offline. Returning high fidelity notification queue.');
      
      // Prepopulated offline notification alerts matching our "critical" and "high" risk students
      const localAlerts = [
        {
          id: 'alert-1',
          alert_type: 'risk_escalation',
          severity: 'critical',
          entity_type: 'student',
          entity_id: 'STU-003',
          title: 'Critical Risk: Rajesh Kumar',
          message: ' Rajesh Kumar has dropped to 52% attendance. High risk of complete dropout.',
          is_read: false,
          is_resolved: false,
          created_at: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hrs ago
        },
        {
          id: 'alert-2',
          alert_type: 'intervention_overdue',
          severity: 'high',
          entity_type: 'student',
          entity_id: 'STU-005',
          title: 'Overdue Intervention: Sunita Meena',
          message: 'Home visit for Sunita Meena is overdue by 5 days. Escalating priority.',
          is_read: false,
          is_resolved: false,
          created_at: new Date(Date.now() - 3600000 * 12).toISOString(), // 12 hrs ago
        },
        {
          id: 'alert-3',
          alert_type: 'performance_drop',
          severity: 'medium',
          entity_type: 'student',
          entity_id: 'STU-012',
          title: 'Academic Drop: Amit Sharma',
          message: 'Amit Sharma score dropped by 18% in Science Term-2 assessment.',
          is_read: true,
          is_resolved: false,
          created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        }
      ];
      return localAlerts.filter(a => {
        if (severity && a.severity !== severity) return false;
        if (isRead !== undefined && a.is_read !== isRead) return false;
        return true;
      });
    }
  },

  async getUnreadAlertsCount(): Promise<{ unread_count: number; critical_count: number }> {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/alerts/unread/count`);
      if (!res.ok) throw new Error('API error');
      return await res.json();
    } catch (e) {
      return { unread_count: 2, critical_count: 1 };
    }
  },

  async markAlertRead(alertId: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/alerts/${alertId}/read`, { method: 'PATCH' });
      return res.ok;
    } catch (e) {
      console.log(`[EduShield API] Mark alert ${alertId} read offline.`);
      return true;
    }
  },

  async resolveAlert(alertId: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/alerts/${alertId}/resolve`, { method: 'PATCH' });
      return res.ok;
    } catch (e) {
      console.log(`[EduShield API] Resolve alert ${alertId} offline.`);
      return true;
    }
  },

  async getEscalations(): Promise<any[]> {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/alerts/escalations`);
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      return data.escalations || [];
    } catch (e) {
      return [
        {
          id: 'alert-2',
          alert_type: 'intervention_overdue',
          severity: 'high',
          title: 'Overdue Intervention: Sunita Meena',
          message: 'Home visit for Sunita Meena is overdue by 5 days. Escalating priority.',
          entity_type: 'student',
          entity_id: 'STU-005',
          created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
        }
      ];
    }
  },

  /**
   * 7. Reports Download URLs
   */
  getMonthlySummaryReportUrl(days: number = 30): string {
    return `${API_BASE_URL}/reports/monthly-summary?format=csv&days=${days}`;
  },

  getStudentRiskReportUrl(): string {
    return `${API_BASE_URL}/reports/student-risk?format=csv`;
  },

  getInterventionLogReportUrl(days: number = 90): string {
    return `${API_BASE_URL}/reports/intervention-log?format=csv&days=${days}`;
  },

  getAttendanceSummaryReportUrl(days: number = 30): string {
    return `${API_BASE_URL}/reports/attendance-summary?format=csv&days=${days}`;
  },

  async getMonthlySummaryJson(days: number = 30): Promise<any> {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/reports/monthly-summary?days=${days}`);
      if (!res.ok) throw new Error('API error');
      return await res.json();
    } catch (e) {
      console.log('[EduShield API] Monthly summary report offline. Simulating metrics.');
      return {
        report_period_days: days,
        generated_at: new Date().toISOString(),
        total_active_students: 32,
        risk_distribution: { critical: 4, high: 5, moderate: 5, low: 18 },
        total_at_risk: 14,
        attendance_rate_percent: 82.4,
        total_interventions_created: 8,
        interventions_completed: 4
      };
    }
  }
};
