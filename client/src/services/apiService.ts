import api from './api'

// ==================== DASHBOARD ====================
export const dashboardApi = {
  getSummary: () => api.get('/dashboard/summary'),
  getRevenue: () => api.get('/dashboard/revenue'),
  getAttendance: () => api.get('/dashboard/attendance'),
  getAdmissions: () => api.get('/dashboard/admissions'),
  getAcademic: () => api.get('/dashboard/academic'),
  getHR: () => api.get('/dashboard/hr'),
  getHostel: () => api.get('/dashboard/hostel'),
  getTransport: () => api.get('/dashboard/transport'),
  getLibrary: () => api.get('/dashboard/library'),
  getHelpdesk: () => api.get('/dashboard/helpdesk'),
  getWorkflow: () => api.get('/dashboard/workflow'),
  getNotifications: () => api.get('/dashboard/notifications'),
  getHealthScore: () => api.get('/dashboard/health-score'),
  getActivity: (limit?: number) => api.get('/dashboard/activity', { params: { limit } }),
}

// ==================== USERS / AUTHORITY ====================
export const usersApi = {
  list: (params?: { role?: string; isActive?: boolean; search?: string; page?: number; limit?: number }) =>
    api.get('/users', { params }),
  getById: (id: string) => api.get(`/users/${id}`),
  create: (data: any) => api.post('/users/authority', data),
  update: (id: string, data: any) => api.put(`/users/${id}`, data),
  toggleStatus: (id: string) => api.patch(`/users/${id}/toggle-status`),
  resetPassword: (id: string, newPassword: string) =>
    api.post(`/users/${id}/reset-password`, { newPassword }),
  getStats: () => api.get('/users/stats'),
}

// ==================== NOTIFICATIONS ====================
export const notificationsApi = {
  list: (params?: { page?: number; limit?: number }) =>
    api.get('/notifications', { params }),
  getMy: (unreadOnly?: boolean) =>
    api.get('/notifications/my', { params: { unreadOnly } }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  create: (data: any) => api.post('/notifications', data),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
  delete: (id: string) => api.delete(`/notifications/${id}`),
}

// ==================== ANNOUNCEMENTS ====================
export const announcementsApi = {
  list: (params?: { page?: number; limit?: number }) =>
    api.get('/announcements', { params }),
  getById: (id: string) => api.get(`/announcements/${id}`),
  create: (data: any) => api.post('/announcements', data),
  update: (id: string, data: any) => api.put(`/announcements/${id}`, data),
  delete: (id: string) => api.delete(`/announcements/${id}`),
  getStats: () => api.get('/announcements/stats'),
}

// ==================== EXAMINATION ANALYTICS ====================
export const examinationApi = {
  getStats: () => api.get('/analytics/examinations/stats'),
  getSubjectPerformance: () => api.get('/analytics/examinations/subjects'),
  getSemesterComparison: () => api.get('/analytics/examinations/semesters'),
  getGradeDistribution: () => api.get('/analytics/examinations/grades'),
  getDepartmentRankings: () => api.get('/analytics/examinations/departments'),
  getTopPerformers: (limit?: number) => api.get('/analytics/examinations/top-performers', { params: { limit } }),
}

// ==================== FACULTY ANALYTICS ====================
export const facultyApi = {
  getStats: () => api.get('/analytics/faculty/stats'),
  getDepartmentWise: () => api.get('/analytics/faculty/departments'),
  getLeaveTrend: () => api.get('/analytics/faculty/leave-trend'),
  getWorkload: () => api.get('/analytics/faculty/workload'),
  getFeedbackDistribution: () => api.get('/analytics/faculty/feedback'),
  getHiringTrend: () => api.get('/analytics/faculty/hiring-trend'),
}

// ==================== HOSTEL ANALYTICS ====================
export const hostelApi = {
  getStats: () => api.get('/analytics/hostel/stats'),
  getHostelWise: () => api.get('/analytics/hostel/hostel-wise'),
  getRoomTypes: () => api.get('/analytics/hostel/room-types'),
  getMaintenanceTrend: () => api.get('/analytics/hostel/maintenance-trend'),
}

// ==================== TRANSPORT ANALYTICS ====================
export const transportApi = {
  getStats: () => api.get('/analytics/transport/stats'),
  getRouteOccupancy: () => api.get('/analytics/transport/routes'),
  getVehicleTypes: () => api.get('/analytics/transport/vehicles'),
  getFuelExpenses: () => api.get('/analytics/transport/fuel'),
}

// ==================== LIBRARY ANALYTICS ====================
export const libraryApi = {
  getStats: () => api.get('/analytics/library/stats'),
  getCategoryDistribution: () => api.get('/analytics/library/categories'),
  getIssueReturnTrend: () => api.get('/analytics/library/issue-trend'),
  getMostReadBooks: (limit?: number) => api.get('/analytics/library/most-read', { params: { limit } }),
}

// ==================== HELPDESK ANALYTICS ====================
export const helpdeskApi = {
  getStats: () => api.get('/analytics/helpdesk/stats'),
  getCategoryDistribution: () => api.get('/analytics/helpdesk/categories'),
  getResolutionTrend: () => api.get('/analytics/helpdesk/resolution-trend'),
  getPriorityBreakdown: () => api.get('/analytics/helpdesk/priority'),
  getRecentTickets: (limit?: number) => api.get('/analytics/helpdesk/recent', { params: { limit } }),
}

// ==================== WORKFLOW ANALYTICS ====================
export const workflowApi = {
  getStats: () => api.get('/analytics/workflow/stats'),
  getByType: () => api.get('/analytics/workflow/by-type'),
  getApprovalTrend: () => api.get('/analytics/workflow/approval-trend'),
  getRecent: (limit?: number) => api.get('/analytics/workflow/recent', { params: { limit } }),
}

// ==================== NOTIFICATION ANALYTICS ====================
export const notificationAnalyticsApi = {
  getStats: () => api.get('/analytics/notifications/stats'),
  getByType: () => api.get('/analytics/notifications/by-type'),
  getMonthlyTrend: () => api.get('/analytics/notifications/monthly-trend'),
  getDeliveryChannels: () => api.get('/analytics/notifications/channels'),
}

// ==================== CALENDAR ANALYTICS ====================
export const calendarApi = {
  getStats: () => api.get('/analytics/calendar/stats'),
  getEventsByType: () => api.get('/analytics/calendar/events-by-type'),
  getMonthlyEvents: () => api.get('/analytics/calendar/monthly-events'),
  getUpcoming: (limit?: number) => api.get('/analytics/calendar/upcoming', { params: { limit } }),
}

// ==================== REPORTS ====================
export const reportsApi = {
  generate: (type: string, params: any) => api.post(`/reports/generate/${type}`, params, { responseType: 'blob' }),
  getTypes: () => api.get('/reports/types'),
}

// ==================== FEE STRUCTURES ====================
export const feeStructureApi = {
  list: (params?: { departmentId?: string; isActive?: boolean; search?: string }) =>
    api.get('/fees', { params }),
  getById: (id: string) => api.get(`/fees/${id}`),
  create: (data: any) => api.post('/fees', data),
  update: (id: string, data: any) => api.put(`/fees/${id}`, data),
  delete: (id: string) => api.delete(`/fees/${id}`),
  toggleActive: (id: string) => api.patch(`/fees/${id}/toggle`),
  getSummary: () => api.get('/fees/summary'),
}

// ==================== ATTENDANCE ====================
export const attendanceApi = {
  getCourses: () => api.get('/attendance/courses'),
  getClassStatus: (courseId: string, date: string) =>
    api.get('/attendance/class-status', { params: { courseId, date } }),
  getClassStudents: (courseId: string) =>
    api.get('/attendance/class-students', { params: { courseId } }),
  getDaily: (courseId: string, date: string, session: string) =>
    api.get('/attendance/daily', { params: { courseId, date, session } }),
  enableSubjectMode: (courseId: string, date: string) =>
    api.post('/attendance/enable-subject-mode', { courseId, date }),
  disableSubjectMode: (courseId: string, date: string) =>
    api.post('/attendance/disable-subject-mode', { courseId, date }),
  markDaily: (data: { courseId: string; date: string; session: string; records: any[] }) =>
    api.post('/attendance/mark-daily', data),
  lock: (courseId: string, date: string) =>
    api.post('/attendance/lock', { courseId, date }),
  unlock: (courseId: string, date: string) =>
    api.post('/attendance/unlock', { courseId, date }),
  getTeacherTimetable: () => api.get('/attendance/teacher/timetable'),
  getTeacherStatus: () => api.get('/attendance/teacher/status'),
  getPeriodStudents: (entryId: string, date: string) =>
    api.get('/attendance/teacher/period-students', { params: { entryId, date } }),
  markPeriod: (data: { timetableEntryId: string; date: string; records: any[] }) =>
    api.post('/attendance/teacher/mark-period', data),
}

// ==================== DOUBTS ====================
export const doubtsApi = {
  getStudentSubjects: () => api.get('/doubts/student/subjects'),
  getStudentConversations: () => api.get('/doubts/student/conversations'),
  getStudentChat: (conversationId: string) => api.get(`/doubts/student/chat/${conversationId}`),
  sendStudentMessage: (data: { conversationId: string; message: string; attachmentUrl?: string; attachmentType?: string }) =>
    api.post('/doubts/student/send', data),
  createConversation: (data: { subjectId: string; classId: string; message: string }) =>
    api.post('/doubts/student/create', data),
  resolveDoubt: (conversationId: string) =>
    api.post('/doubts/resolve', { conversationId }),
  getTeacherClasses: () => api.get('/doubts/teacher/classes'),
  getTeacherConversations: (classId?: string) =>
    api.get('/doubts/teacher/conversations', { params: classId ? { classId } : {} }),
  getTeacherChat: (conversationId: string) => api.get(`/doubts/teacher/chat/${conversationId}`),
  sendTeacherMessage: (data: { conversationId: string; message: string; attachmentUrl?: string; attachmentType?: string }) =>
    api.post('/doubts/teacher/send', data),
}
