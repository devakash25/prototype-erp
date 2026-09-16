# School ERP - Complete Role Documentation

## Role Hierarchy

```
CEO (Platform Owner)
└── Chief Head (Institution Admin)
    ├── Principal
    │   └── Vice Principal
    ├── Exam Controller
    ├── Teacher
    ├── Accountant
    ├── Admission Counsellor
    ├── Receptionist
    ├── Librarian
    ├── Hostel Warden
    ├── Transport Manager
    ├── Administrative Staff
    ├── Student
    └── Parent
```

---

## 1. CEO (Platform Owner)

**Purpose:** Multi-tenant SaaS platform administrator. Manages all institutions, subscriptions, and platform-wide settings.

### Features
| Module | Description |
|--------|-------------|
| Dashboard | Platform-wide KPIs: total institutions, revenue, user growth |
| User Management | Create/manage institution admins |
| Subscription Plans | Create pricing plans (Free, Pro, Custom) |
| Feature Management | Assign features to plans per role |
| Charges & Payments | Track subscription billing |
| Platform Analytics | Revenue trends, user growth, feature adoption |

### Access Level: Platform-wide (not institution-scoped)

---

## 2. Chief Head (Institution Administrator)

**Purpose:** Highest authority within a single institution. Controls all users, settings, and analytics.

### Features
| Module | Description |
|--------|-------------|
| Dashboard | Institution-wide KPIs: revenue, attendance, admissions, academic performance |
| Authority Management | Create/edit/delete all users (Principal, Teachers, Students, Parents, etc.) |
| Role & Permissions | Configure what each role can view/edit |
| Fee Structure | Create tuition, hostel, transport, admission fee components |
| Fee Analytics | Revenue by type, collection trends, outstanding dues |
| Examination Analytics | Exam performance across departments |
| Faculty Analytics | Teacher performance, workload distribution |
| Hostel Analytics | Occupancy, fee collection, maintenance |
| Transport Analytics | Route efficiency, vehicle utilization |
| Library Analytics | Book issues, overdue, fine collection |
| Helpdesk Analytics | Ticket resolution metrics |
| Workflow Analytics | Approval chain metrics |
| Notification Analytics | Send rates, read rates |
| Calendar Analytics | Event distribution, attendance correlation |
| Report Center | Pre-built institutional reports |
| Custom Report Builder | Build custom reports with filters |
| Global Search | Search across all modules |
| Student Analytics | Enrollment trends, performance distribution |
| Financial Dashboard | Revenue, expenses, projections |
| Template Manager | Email/SMS/notification templates |
| Real-time Notifications | Live notification feed |
| System Settings | Academic year, branding, holidays |
| Permission Manager | Granular role-based access control |
| Bulk Operations | Bulk user creation, data import/export |
| Data Backup & Export | Database backup, data export |
| Audit Log | Track all system actions |
| Appearance | Dark mode, branding customization |

### Access Level: Full institution access

---

## 3. Principal

**Purpose:** Academic head of the institution. Manages departments, faculty, academics, and approvals.

### Features
| Module | Description |
|--------|-------------|
| Dashboard | Academic KPIs: attendance, faculty status, student performance |
| Departments | View/manage academic departments |
| Timetable | Create/view institution timetable |
| Attendance Monitoring | View all class/subject attendance |
| LMS Overview | Monitor learning management activities |
| Faculty Status | View teacher workload, availability |
| Class Coordinators | Assign/remove class coordinators |
| Subject Allocation | Assign teachers to subjects |
| Leave Management | Approve/reject teacher leave requests |
| Performance Reviews | Faculty performance tracking |
| Students | View all students, filter by department/class |
| Admissions | Admission overview and approval |
| Examination Dashboard | Exam schedules, result overview |
| Finance View | Revenue, fee collection overview |
| Discipline | Student behavior records |
| Hostel View | Hostel occupancy, complaints |
| Library View | Book issues, overdue overview |
| Transport View | Routes, vehicle status |
| Approvals | Workflow approval chain |
| Notifications | Send announcements to roles/classes |
| Calendar | Academic calendar management |
| Helpdesk | Support ticket overview |
| Reports | Pre-built academic reports |

### Access Level: Full academic access, limited finance/settings

---

## 4. Vice Principal

**Purpose:** Supports Principal in daily operations. Focuses on discipline, attendance monitoring, and teacher substitution.

### Features
| Module | Description |
|--------|-------------|
| Dashboard | KPIs: attendance %, discipline issues, pending approvals, active substitutions |
| Attendance Overview | Department-wise attendance breakdown |
| Discipline Records | Student behavior/conduct tracking |
| Teacher Substitutions | Manage teacher absence coverage |
| Daily Reports | View daily reports submitted by teachers |
| Classroom Inspections | Inspection records and scores |

### Access Level: Academic operations, discipline management

---

## 5. Teacher

**Purpose:** Core teaching module. Handles attendance, assignments, study materials, MCQ tests, and student interaction.

### Features
| Module | Description |
|--------|-------------|
| Dashboard | Today's classes, pending tasks, student performance |
| Today's Schedule | Daily class schedule with subjects, rooms |
| My Classes | Classes assigned as coordinator |
| Subjects | Subjects taught with student counts |
| Take Attendance | Mark daily attendance (class coordinator) |
| Period Attendance | Mark subject-wise attendance (subject teacher) |
| Student List | View students in assigned classes |
| Student Performance | Analytics on student marks, weak/strong areas |
| Assignments | Create, grade, manage assignments (supports PDF/images) |
| LMS Overview | Upload study materials, notes, worksheets |
| MCQ Tests | Create, publish, archive multiple-choice tests |
| Examinations | View upcoming exams |
| Marks Entry | Enter marks for examinations |
| Leave | Apply for leave |
| Calendar | View academic calendar |
| Notifications | Receive institutional notifications |
| Reports | Class performance reports |
| Doubt Solving | Chat with students on subject doubts |
| Parent Messages | Communicate with parents |
| Class Coordinator | Coordinator-specific dashboard and tools |

### Access Level: Assigned classes and subjects only

---

## 6. Student

**Purpose:** Student academic workspace. View attendance, submit assignments, take tests, access materials.

### Features
| Module | Description |
|--------|-------------|
| Dashboard | Today's classes, attendance %, pending assignments |
| My Subjects | Enrolled subjects with teachers |
| Timetable | Weekly class schedule |
| Attendance | Subject-wise attendance with calendar view |
| Performance | Exam results, subject-wise analysis, GPA trend |
| Assignments | View/submit homework (supports file upload) |
| Study Materials | Download notes, worksheets from teachers |
| MCQ Tests | Attempt online tests (auto-grading) |
| Doubt Section | Ask doubts to subject teachers (chat) |
| Exam Schedule | View upcoming examination dates |
| Results | View report cards, grades, marks |
| Fee Status | View fee structure, payment history, receipts |
| Library | Book issues, due dates, fines |
| Hostel | Room info, warden contact, complaints |
| Transport | Route info, vehicle details, driver contact |
| Calendar | Academic calendar, holidays |
| Notices | School announcements |
| Documents | Download certificates, ID card |
| Requests | Submit leave/document requests |
| Profile | View/edit personal profile |

### Access Level: Own data only

---

## 7. Parent

**Purpose:** Parent/guardian portal to monitor child's academic progress, fees, and communicate with teachers.

### Features
| Module | Description |
|--------|-------------|
| Dashboard | Child's attendance, fees due, CGPA, alerts |
| Children | View all linked children |
| Attendance | Subject-wise attendance tracking |
| Timetable | Child's weekly schedule |
| Performance | Exam results, subject analysis, teacher remarks |
| Assignments | View child's assignments and submission status |
| Exams | Upcoming exams, past results |
| Fees | Fee structure, payment history, due dates |
| Transport | Route, vehicle, driver info |
| Hostel | Room info, warden contact, complaints |
| Library | Book issues, overdue alerts, fines |
| Notices | School announcements |
| PTM | Parent-Teacher Meeting schedule, request PTM |
| Messages | Chat with teachers (coordinators & subject teachers) |
| Leave | Apply for child's leave |
| Complaints | Raise complaints with categories |
| Documents | Download certificates, receipts |
| Activity | Timeline of child's activities |

### Access Level: Linked children's data only

---

## 8. Accountant

**Purpose:** Complete finance management - fee collection, receipts, refunds, and financial reports.

### Features
| Module | Description |
|--------|-------------|
| Dashboard | Revenue KPIs, collection trends, outstanding dues |
| Collect Fees | Process fee payments for students |
| Student Ledger | View complete payment history per student |
| Outstanding Dues | Defaulter list with amounts and due dates |
| Payment Verification | Verify pending online payments |
| Receipts | Generate/download fee receipts |
| Refunds | Process refund requests |
| Daily Reports | Daily collection summaries |
| Analytics | Revenue by category, collection performance |

### Access Level: Finance module only

---

## 9. Admission Counsellor

**Purpose:** Manages the complete admission lifecycle - enquiries, applications, follow-ups, enrollment.

### Features
| Module | Description |
|--------|-------------|
| Dashboard | Admission KPIs: applications, conversion rate, pending reviews |
| All Applications | View/filter/search all applications |
| New Application | Create new admission application |
| Waiting List | Manage waitlisted candidates |
| Follow-ups | Track enquiry follow-ups |
| Reports | Admission statistics and trends |
| Analytics | Funnel analysis, source tracking |

### Access Level: Admission module only

---

## 10. Receptionist

**Purpose:** Front office operations - visitor management, admission enquiries, phone logs, ID cards, certificates.

### Features
| Module | Description |
|--------|-------------|
| Dashboard | Today's visitors, pending enquiries, certificates ready |
| Visitors | Visitor check-in/check-out log |
| Enquiries | Admission enquiry tracking |
| Phone Logs | Phone enquiry logging |
| Certificates | Generate bonafide, transfer, character certificates |
| ID Cards | Generate/print student ID cards |

### Access Level: Front office operations only

---

## 11. Exam Controller

**Purpose:** Manages the complete examination lifecycle - planning, seating, marks entry, result generation, grading.

### Features
| Module | Description |
|--------|-------------|
| Dashboard | Exam KPIs: total exams, upcoming, pending results |
| Exams | Create/manage examination schedules |
| Results | View/publish exam results |
| Seating Plan | Generate seating arrangements |
| Merit List | Rank top performers |
| Grade Calculator | Auto-calculate grades (CBSE pattern) |

### Access Level: Examination module only

---

## 12. Librarian

**Purpose:** Library management - book catalog, issue/return, fines, member management.

### Features
| Module | Description |
|--------|-------------|
| Dashboard | Library KPIs: books issued, overdue, fines |
| Books | Book catalog management (CRUD) |
| Issue Book | Issue books to students/staff |
| Returns & Renewals | Process book returns and renewals |
| Overdue Books | Track overdue books |
| Fines | Manage fine collection |
| Members | Student/staff library members |
| Analytics | Issue trends, popular books |

### Access Level: Library module only

---

## 13. Hostel Warden

**Purpose:** Hostel management - buildings, rooms, student allocation, complaints.

### Features
| Module | Description |
|--------|-------------|
| Dashboard | Occupancy rate, complaints, fee status |
| Buildings | Hostel building management |
| Rooms | Room allocation/deallocation |
| Students | Hostel resident management |
| Complaints | Hostel complaint tracking |
| Analytics | Occupancy trends, maintenance needs |
| Activity | Recent hostel activities |

### Access Level: Hostel module only

---

## 14. Transport Manager

**Purpose:** Transport management - vehicles, drivers, routes, student allocation.

### Features
| Module | Description |
|--------|-------------|
| Dashboard | Transport KPIs: vehicles, routes, complaints |
| Vehicles | Vehicle registry and management |
| Drivers | Driver profiles and management |
| Driver Attendance | Track driver attendance |
| Routes | Route management and assignment |
| Student Allocation | Assign students to routes |
| Daily Schedule | Daily transport schedule |
| Maintenance | Vehicle maintenance tracking |
| Inspections | Vehicle inspection records |
| Complaints | Transport complaint tracking |
| Reports | Transport operation reports |

### Access Level: Transport module only

---

## 15. Administrative Staff

**Purpose:** Administrative operations - student requests, certificates, meetings, documents.

### Features
| Module | Description |
|--------|-------------|
| Dashboard | Pending requests, certificates, meetings |
| Student Requests | Process student requests (leave, documents) |
| Certificates | Generate/manage certificates |
| Notices | Publish administrative notices |
| Meetings | Schedule and manage meetings |
| Approval Tracking | Workflow approval status |
| Documents | Document management |
| Complaints | Administrative complaint tracking |
| Reports | Administrative reports |

### Access Level: Administrative module only

---

## Access Matrix

| Feature | CEO | Chief Head | Principal | Vice Principal | Teacher | Student | Parent | Accountant | Admission | Receptionist | Exam Ctrl | Librarian | Hostel | Transport | Admin |
|---------|-----|-----------|-----------|---------------|---------|---------|--------|-----------|-----------|-------------|-----------|-----------|--------|-----------|-------|
| User Management | Platform | Full | Limited | - | - | - | - | - | - | - | - | - | - | - | - |
| Timetable | View | Full | Full | View | View | View | View | - | - | - | View | - | - | - | - |
| Attendance | View | Full | View | View | Edit | View | View | - | - | - | - | - | - | - | - |
| Assignments | View | View | View | - | Create | Submit | View | - | - | - | - | - | - | - | - |
| Exams | View | Full | View | - | Enter | View | View | - | - | - | Full | - | - | - | - |
| Fees | Full | Full | View | - | - | View | Pay | Manage | - | - | - | - | - | - | - |
| Library | View | View | View | - | - | View | View | - | - | - | - | Full | - | - | - |
| Hostel | View | View | View | - | - | View | View | - | - | - | - | - | Full | - | - |
| Transport | View | View | View | - | - | View | View | - | - | - | - | - | - | Full | - |
| Notifications | All | School | School | Staff | Class | - | - | Fee | Admission | - | Exam | - | - | - | - |
| Discipline | View | Full | View | Full | View | - | View | - | - | - | - | - | - | - | - |
| Certificates | Full | Full | View | - | - | View | View | - | - | Generate | - | - | - | - | Generate |
| Reports | Full | Full | Full | View | Class | Own | Child | Finance | Admission | - | Exam | Library | Hostel | Transport | Admin |

**Legend:** Full = Complete access | View = Read-only | Edit = Can modify | Create = Can add new | Manage = Admin operations | - = No access

---

## Quick Login Credentials (Development)

| Role | Email | Password |
|------|-------|----------|
| CEO | ceo@dev-erp.com | Admin@123 |
| Chief Head | admin@dev-erp.com | Admin@123 |
| Principal | principal@dev-erp.com | Teacher@123 |
| Teacher | teacher1@dev-erp.com | Teacher@123 |
| Student | student1@dev-erp.com | Student@123 |
| Parent | father@dev-erp.com | Parent@123 |
| Accountant | accountant@dev-erp.com | Teacher@123 |
| Admission | admission@dev-erp.com | Teacher@123 |
| Transport | transport@dev-erp.com | Teacher@123 |
| Librarian | librarian@dev-erp.com | Teacher@123 |

---

## Database Schema - UserRole Enum

```prisma
enum UserRole {
  CEO
  CHIEF_HEAD
  PRINCIPAL
  VICE_PRINCIPAL
  TEACHER
  ACCOUNTANT
  ADMISSION_COUNSELLOR
  RECEPTIONIST
  EXAM_CONTROLLER
  LIBRARIAN
  HOSTEL_WARDEN
  TRANSPORT_MANAGER
  ADMINISTRATIVE_STAFF
  STUDENT
  PARENT
}
```

**Total Roles: 15** (12 employee-type + 2 student-type + 1 platform)
