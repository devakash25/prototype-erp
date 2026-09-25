import { prisma } from '../../config/database';

interface ReportSection {
  title: string;
  rows: Record<string, any>[];
}

interface ReportResult {
  title: string;
  generatedAt: Date;
  sections: ReportSection[];
}

interface Source {
  model: string;
  label: string;
  scope: 'direct' | 'student' | 'audit';
  supportsDepartment?: boolean;
  match: RegExp;
  exclude?: RegExp;
}

const NOT_STAFF = /faculty|employee|staff|teacher|\bhr\b/;

const SOURCES: Source[] = [
  { model: 'attendance', label: 'Attendance', scope: 'student', match: /attend/, exclude: NOT_STAFF },
  { model: 'examResult', label: 'Exam Results', scope: 'student', match: /exam|result|grade|merit|cgpa|pass-?fail|top-performer|low-performer|performance|distinction|division/, exclude: NOT_STAFF },
  { model: 'employee', label: 'Employees', scope: 'direct', supportsDepartment: true, match: /faculty|employee|\bhr\b|staff|hiring|attrition|onboarding|workload|leave|appraisal|contract|salary|department-wise-strength/ },
  { model: 'scholarship', label: 'Scholarships', scope: 'direct', match: /scholarship|stipend|disbursement/ },
  { model: 'feePayment', label: 'Fee Payments', scope: 'student', match: /fee|payment|collect|revenue|financial|outstanding|refund|expense|profit|budget|tax|income|defaulter|invoice|charge|pricing|subscription|expense|p-?l/ },
  { model: 'admission', label: 'Admissions', scope: 'direct', supportsDepartment: true, match: /admission|enrollment|waiting|follow-?up|withdrawn|graduated/ },
  { model: 'libraryBook', label: 'Library Books', scope: 'direct', match: /librar|book|reading|issue/ },
  { model: 'hostel', label: 'Hostel', scope: 'direct', match: /hostel|accommodation|mess|warden/ },
  { model: 'vehicle', label: 'Transport', scope: 'direct', match: /transport|vehicle|route|driver|fuel|fleet/ },
  { model: 'helpdeskTicket', label: 'Helpdesk Tickets', scope: 'direct', match: /helpdesk|ticket|complaint|support|resolution/ },
  { model: 'workflow', label: 'Workflows', scope: 'direct', match: /workflow|approval/ },
  { model: 'document', label: 'Documents', scope: 'direct', match: /document|certificate|id-?card|file/ },
  { model: 'announcement', label: 'Announcements', scope: 'direct', match: /notice|announcement|notification/ },
  { model: 'studentRequest', label: 'Student Requests', scope: 'direct', match: /request|application/ },
  { model: 'meeting', label: 'Meetings', scope: 'direct', match: /meeting/ },
  { model: 'auditLog', label: 'Audit Log', scope: 'audit', match: /audit|log|system|backup|template|permission|role|activity|history|user-list/ },
  { model: 'timetable', label: 'Timetable', scope: 'direct', supportsDepartment: true, match: /timetable|schedule|class|period|calendar/ },
  { model: 'course', label: 'Courses', scope: 'direct', match: /course|subject|department|curriculum/ },
  { model: 'examination', label: 'Examinations', scope: 'direct', match: /invigil|exam-schedule/ },
  { model: 'student', label: 'Students', scope: 'direct', supportsDepartment: true, match: /student|parent|gender|category|directory|mapping|list|cgp|contact/ },
];

const DEFAULT_SOURCE: Source = { model: 'student', label: 'Students', scope: 'direct', supportsDepartment: true, match: /.*/ };

export class ReportsService {
  async generateReport(institutionId: string, slug: string, params: any = {}): Promise<ReportResult> {
    const filters = {
      from: params.from ? new Date(params.from) : undefined,
      to: params.to ? new Date(params.to) : undefined,
      departmentId: params.departmentId,
    };

    if (slug === 'bulk-export' && Array.isArray(params.reports) && params.reports.length > 0) {
      const sections: ReportSection[] = [];
      for (const reportSlug of params.reports.slice(0, 25)) {
        const source = this.resolveSource(reportSlug, params.category);
        sections.push({ title: source.label, rows: await this.fetchRows(institutionId, source, filters) });
      }
      return { title: 'All Reports', generatedAt: new Date(), sections };
    }

    const source = this.resolveSource(slug, params.category);
    return {
      title: source.label,
      generatedAt: new Date(),
      sections: [{ title: source.label, rows: await this.fetchRows(institutionId, source, filters) }],
    };
  }

  private resolveSource(slug: string, category?: string): Source {
    const haystack = `${slug || ''} ${category || ''}`.toLowerCase();
    const source = SOURCES.find((item) => item.match.test(haystack) && !(item.exclude && item.exclude.test(haystack)));
    return source || DEFAULT_SOURCE;
  }

  private async fetchRows(
    institutionId: string,
    source: Source,
    filters: { from?: Date; to?: Date; departmentId?: string },
  ): Promise<Record<string, any>[]> {
    const model = (prisma as any)[source.model];
    if (!model) return [];

    const where: any = {};
    if (source.scope === 'direct' || source.scope === 'audit') where.institutionId = institutionId;
    if (source.scope === 'student') where.student = { institutionId };

    if (source.supportsDepartment && filters.departmentId) where.departmentId = filters.departmentId;

    if (filters.from || filters.to) {
      where.createdAt = {};
      if (filters.from) where.createdAt.gte = filters.from;
      if (filters.to) {
        const end = new Date(filters.to);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    try {
      const rows: any[] = await model.findMany({ where, take: 1000, orderBy: { createdAt: 'desc' } });
      return rows.map((row) => this.flatten(row));
    } catch {
      return [];
    }
  }

  private flatten(row: any): Record<string, any> {
    const flat: Record<string, any> = {};
    for (const [key, value] of Object.entries(row || {})) {
      if (value === null || value === undefined) {
        flat[key] = '';
      } else if (value instanceof Date) {
        flat[key] = value.toISOString();
      } else if (typeof value === 'object') {
        flat[key] = JSON.stringify(value);
      } else {
        flat[key] = value;
      }
    }
    return flat;
  }

  toCsv(result: ReportResult): string {
    const lines: string[] = [`${result.title},${result.generatedAt.toISOString()}`];

    for (const section of result.sections) {
      lines.push('');
      lines.push(`# ${section.title}`);

      const columns = this.columnsOf(section.rows);
      if (columns.length === 0) {
        lines.push('No records found');
        continue;
      }
      lines.push(columns.map((column) => this.escape(column)).join(','));
      for (const row of section.rows) {
        lines.push(columns.map((column) => this.escape(row[column])).join(','));
      }
    }

    return lines.join('\n');
  }

  private columnsOf(rows: Record<string, any>[]): string[] {
    const columns: string[] = [];
    const seen = new Set<string>();
    for (const row of rows.slice(0, 50)) {
      for (const key of Object.keys(row)) {
        if (!seen.has(key)) {
          seen.add(key);
          columns.push(key);
        }
      }
    }
    return columns;
  }

  private escape(value: any): string {
    const text = value === null || value === undefined ? '' : String(value);
    if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
    return text;
  }
}

export const reportsService = new ReportsService();
