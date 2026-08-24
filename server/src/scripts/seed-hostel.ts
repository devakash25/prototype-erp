import { PrismaClient, Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting hostel seeding...\n');

  const institution = await prisma.institution.findFirst();
  if (!institution) {
    throw new Error('No institution found. Please seed institutions first.');
  }
  console.log(`Using institution: ${institution.name} (${institution.id})`);

  // ========================================
  // 1. Hostel Warden User
  // ========================================
  console.log('1. Seeding hostel warden user...');
  const hashedPassword = await bcrypt.hash('Warden@123', 10);

  const wardenUser = await prisma.user.upsert({
    where: { email: 'warden@dev-erp.com' },
    update: {},
    create: {
      email: 'warden@dev-erp.com',
      password: hashedPassword,
      role: 'HOSTEL_WARDEN',
      firstName: 'Mohan',
      lastName: 'Singh',
      fullName: 'Mohan Singh',
      phone: '9876543400',
      institutionId: institution.id,
      isActive: true,
      isEmailVerified: true,
    },
  });
  console.log(`   Warden user: ${wardenUser.id}`);

  // ========================================
  // 2. Employee Record for Warden
  // ========================================
  console.log('\n2. Seeding warden employee record...');

  const hostelDept = await prisma.department.findFirst({
    where: { institutionId: institution.id, name: 'Hostel' },
  });

  let departmentId = hostelDept?.id;
  if (!departmentId) {
    const dept = await prisma.department.create({
      data: {
        institutionId: institution.id,
        name: 'Hostel',
        code: 'HSTL',
        description: 'Hostel Management and Student Housing',
        isActive: true,
      },
    });
    departmentId = dept.id;
    console.log('   Created Hostel department');
  }

  const existingEmployee = await prisma.employee.findFirst({
    where: { userId: wardenUser.id },
  });

  let wardenEmployee;
  if (existingEmployee) {
    wardenEmployee = existingEmployee;
    console.log(`   Employee record already exists: ${wardenEmployee.id}`);
  } else {
    wardenEmployee = await prisma.employee.create({
      data: {
        institutionId: institution.id,
        departmentId,
        userId: wardenUser.id,
        employeeCode: 'EMP-HSTL-001',
        designation: 'Hostel Warden',
        department: 'HOSTEL',
        qualification: 'MBA, Bachelor of Arts',
        experience: 10,
        dateOfJoining: new Date('2016-03-15'),
        employmentType: 'full_time',
        salary: new Prisma.Decimal(60000),
        isActive: true,
      },
    });
    console.log(`   Warden employee: ${wardenEmployee.id}`);
  }

  // ========================================
  // 3. Hostels (3)
  // ========================================
  console.log('\n3. Seeding hostels...');

  const hostelsData = [
    {
      name: 'Boys Hostel A',
      type: 'BOYS' as const,
      capacity: 100,
      wardenId: wardenEmployee.id,
      address: 'Block A, North Campus',
      phone: '0120-2560101',
    },
    {
      name: 'Girls Hostel B',
      type: 'GIRLS' as const,
      capacity: 80,
      wardenId: null,
      address: 'Block B, South Campus',
      phone: '0120-2560102',
    },
    {
      name: 'Mixed Hostel C',
      type: 'MIXED' as const,
      capacity: 60,
      wardenId: null,
      address: 'Block C, East Campus',
      phone: '0120-2560103',
    },
  ];

  const createdHostels: any[] = [];

  for (const hd of hostelsData) {
    try {
      const existing = await prisma.hostel.findFirst({
        where: { institutionId: institution.id, name: hd.name },
      });

      if (existing) {
        console.log(`   Hostel "${hd.name}" already exists, skipping`);
        createdHostels.push(existing);
        continue;
      }

      const hostel = await prisma.hostel.create({
        data: {
          institutionId: institution.id,
          name: hd.name,
          type: hd.type,
          capacity: hd.capacity,
          wardenId: hd.wardenId,
          address: hd.address,
          phone: hd.phone,
          isActive: true,
        },
      });
      createdHostels.push(hostel);
      console.log(`   Hostel: ${hostel.name} (${hostel.type}) - Capacity: ${hostel.capacity}`);
    } catch (e: any) {
      console.log(`   Error creating hostel "${hd.name}": ${e.message}`);
    }
  }

  // Ensure we have 3 hostels
  if (createdHostels.length < 3) {
    console.log('   Warning: Not all hostels were created');
  }

  const boysHostel = createdHostels[0];
  const girlsHostel = createdHostels[1];
  const mixedHostel = createdHostels[2];

  // ========================================
  // 4. Hostel Rooms (20 rooms)
  // ========================================
  console.log('\n4. Seeding hostel rooms...');

  // 8 rooms in Boys Hostel A (floors 1-2, mix of single/double/triple)
  const boysRooms = [
    { roomNumber: '101', floor: 1, capacity: 1, type: 'single', occupied: 1 },
    { roomNumber: '102', floor: 1, capacity: 2, type: 'double', occupied: 2 },
    { roomNumber: '103', floor: 1, capacity: 2, type: 'double', occupied: 1 },
    { roomNumber: '104', floor: 1, capacity: 3, type: 'triple', occupied: 3 },
    { roomNumber: '201', floor: 2, capacity: 1, type: 'single', occupied: 0 },
    { roomNumber: '202', floor: 2, capacity: 2, type: 'double', occupied: 2 },
    { roomNumber: '203', floor: 2, capacity: 2, type: 'double', occupied: 0 },
    { roomNumber: '204', floor: 2, capacity: 3, type: 'triple', occupied: 2 },
  ];

  // 7 rooms in Girls Hostel B
  const girlsRooms = [
    { roomNumber: '101', floor: 1, capacity: 1, type: 'single', occupied: 1 },
    { roomNumber: '102', floor: 1, capacity: 2, type: 'double', occupied: 2 },
    { roomNumber: '103', floor: 1, capacity: 2, type: 'double', occupied: 1 },
    { roomNumber: '201', floor: 2, capacity: 1, type: 'single', occupied: 1 },
    { roomNumber: '202', floor: 2, capacity: 2, type: 'double', occupied: 0 },
    { roomNumber: '203', floor: 2, capacity: 2, type: 'double', occupied: 2 },
    { roomNumber: '301', floor: 3, capacity: 3, type: 'triple', occupied: 1 },
  ];

  // 5 rooms in Mixed Hostel C
  const mixedRooms = [
    { roomNumber: '101', floor: 1, capacity: 2, type: 'double', occupied: 2 },
    { roomNumber: '102', floor: 1, capacity: 2, type: 'double', occupied: 1 },
    { roomNumber: '201', floor: 2, capacity: 1, type: 'single', occupied: 0 },
    { roomNumber: '202', floor: 2, capacity: 3, type: 'triple', occupied: 3 },
    { roomNumber: '301', floor: 3, capacity: 2, type: 'double', occupied: 0 },
  ];

  const allRoomsData = [
    { hostel: boysHostel, rooms: boysRooms },
    { hostel: girlsHostel, rooms: girlsRooms },
    { hostel: mixedHostel, rooms: mixedRooms },
  ];

  let roomsCreated = 0;
  const createdRooms: any[] = [];

  for (const { hostel, rooms } of allRoomsData) {
    if (!hostel) continue;

    for (const rd of rooms) {
      try {
        const existing = await prisma.hostelRoom.findFirst({
          where: { hostelId: hostel.id, roomNumber: rd.roomNumber },
        });

        if (existing) {
          console.log(`   Room ${rd.roomNumber} in ${hostel.name} already exists, skipping`);
          createdRooms.push(existing);
          continue;
        }

        const room = await prisma.hostelRoom.create({
          data: {
            hostelId: hostel.id,
            roomNumber: rd.roomNumber,
            floor: rd.floor,
            capacity: rd.capacity,
            occupied: rd.occupied,
            type: rd.type,
            amenities: rd.type === 'single'
              ? { bed: 1, table: 1, chair: 1, wardrobe: 1, fan: 1, ac: false }
              : rd.type === 'double'
                ? { bed: 2, table: 1, chair: 2, wardrobe: 2, fan: 1, ac: false }
                : { bed: 3, table: 1, chair: 3, wardrobe: 3, fan: 2, ac: false },
            isActive: true,
          },
        });
        createdRooms.push(room);
        roomsCreated++;
        console.log(`   Room: ${hostel.name} ${rd.roomNumber} (${rd.type}, cap: ${rd.capacity}, occ: ${rd.occupied})`);
      } catch (e: any) {
        console.log(`   Error creating room ${rd.roomNumber}: ${e.message}`);
      }
    }
  }
  console.log(`   Total rooms created: ${roomsCreated}`);

  // ========================================
  // 5. Allocate Students to Rooms
  // ========================================
  console.log('\n5. Allocating students to rooms...');

  const students = await prisma.student.findMany({
    where: { institutionId: institution.id },
    take: 12,
    include: { user: true },
  });

  if (students.length === 0) {
    console.log('   No students found. Skipping student allocations.');
  } else {
    console.log(`   Found ${students.length} students`);

    // Boys hostel rooms (first 4 rooms)
    const boysAllocations = createdRooms.filter(r => {
      const hostel = allRoomsData.find(h => h.rooms.some(room => room.roomNumber === r.roomNumber));
      return hostel?.hostel?.id === boysHostel?.id;
    }).slice(0, 4);

    // Girls hostel rooms (first 3 rooms)
    const girlsAllocations = createdRooms.filter(r => {
      const hostel = allRoomsData.find(h => h.rooms.some(room => room.roomNumber === r.roomNumber));
      return hostel?.hostel?.id === girlsHostel?.id;
    }).slice(0, 3);

    // Mixed hostel rooms (first 2 rooms)
    const mixedAllocations = createdRooms.filter(r => {
      const hostel = allRoomsData.find(h => h.rooms.some(room => room.roomNumber === r.roomNumber));
      return hostel?.hostel?.id === mixedHostel?.id;
    }).slice(0, 2);

    let allocationsCreated = 0;
    let studentIdx = 0;

    // Allocate to boys hostel
    for (const room of boysAllocations) {
      if (studentIdx >= students.length) break;
      const student = students[studentIdx];

      try {
        await prisma.student.update({
          where: { id: student.id },
          data: {
            hostelId: boysHostel.id,
            isHostelStudent: true,
          },
        });
        allocationsCreated++;
        console.log(`   Allocated ${student.user.firstName} ${student.user.lastName} -> Boys Hostel A Room ${room.roomNumber}`);
        studentIdx++;
      } catch (e: any) {
        console.log(`   Error allocating student: ${e.message}`);
      }
    }

    // Allocate to girls hostel
    for (const room of girlsAllocations) {
      if (studentIdx >= students.length) break;
      const student = students[studentIdx];

      try {
        await prisma.student.update({
          where: { id: student.id },
          data: {
            hostelId: girlsHostel.id,
            isHostelStudent: true,
          },
        });
        allocationsCreated++;
        console.log(`   Allocated ${student.user.firstName} ${student.user.lastName} -> Girls Hostel B Room ${room.roomNumber}`);
        studentIdx++;
      } catch (e: any) {
        console.log(`   Error allocating student: ${e.message}`);
      }
    }

    // Allocate to mixed hostel
    for (const room of mixedAllocations) {
      if (studentIdx >= students.length) break;
      const student = students[studentIdx];

      try {
        await prisma.student.update({
          where: { id: student.id },
          data: {
            hostelId: mixedHostel.id,
            isHostelStudent: true,
          },
        });
        allocationsCreated++;
        console.log(`   Allocated ${student.user.firstName} ${student.user.lastName} -> Mixed Hostel C Room ${room.roomNumber}`);
        studentIdx++;
      } catch (e: any) {
        console.log(`   Error allocating student: ${e.message}`);
      }
    }

    console.log(`   Total allocations: ${allocationsCreated}`);
  }

  // ========================================
  // 6. Complaints (5)
  // ========================================
  console.log('\n6. Seeding complaints...');

  const hostelStudents = students.filter(s => s.isHostelStudent || s.hostelId);

  if (hostelStudents.length === 0 && students.length > 0) {
    console.log('   No hostel students found, using first available students');
  }

  const complaintsData = [
    {
      title: 'Leaking tap in bathroom',
      description: 'The tap in the shared bathroom on floor 1 has been leaking continuously for 2 days. Water is being wasted and the floor is slippery.',
      category: 'plumbing',
      status: 'OPEN',
      ticketStatus: 'OPEN',
      studentIdx: 0,
    },
    {
      title: 'Power outage in Room 102',
      description: 'There is no electricity in Room 102 since yesterday evening. Lights and fans are not working. The switchboard seems to have a fault.',
      category: 'electricity',
      status: 'IN_PROGRESS',
      ticketStatus: 'IN_PROGRESS',
      studentIdx: 1,
    },
    {
      title: 'Broken chair in common room',
      description: 'One of the chairs in the common room is broken. The leg has come off and it is unsafe to sit on. Needs repair or replacement.',
      category: 'furniture',
      status: 'RESOLVED',
      ticketStatus: 'RESOLVED',
      studentIdx: 2,
    },
    {
      title: 'Room cleaning not done',
      description: 'The room cleaning staff has not visited for the past 3 days. The room is dirty and needs immediate attention.',
      category: 'cleaning',
      status: 'OPEN',
      ticketStatus: 'OPEN',
      studentIdx: 0,
    },
    {
      title: 'WiFi not working in hostel wing',
      description: 'WiFi connectivity is very poor in the east wing of the hostel. Unable to attend online classes or submit assignments.',
      category: 'electricity',
      status: 'IN_PROGRESS',
      ticketStatus: 'IN_PROGRESS',
      studentIdx: 1,
    },
  ];

  let complaintsCreated = 0;

  for (const cd of complaintsData) {
    const targetStudent = students[cd.studentIdx] || students[0];
    if (!targetStudent) continue;

    // Check for duplicate complaint
    const existingComplaint = await prisma.complaint.findFirst({
      where: {
        studentId: targetStudent.id,
        title: cd.title,
      },
    });

    if (existingComplaint) {
      console.log(`   Complaint "${cd.title}" already exists, skipping`);
      continue;
    }

    try {
      const creator = targetStudent.user;

      // Create HelpdeskTicket
      const ticket = await prisma.helpdeskTicket.create({
        data: {
          institutionId: institution.id,
          creatorId: creator.id,
          assigneeId: wardenUser.id,
          title: cd.title,
          description: cd.description,
          category: 'hostel',
          priority: cd.status === 'OPEN' ? 'HIGH' : cd.status === 'IN_PROGRESS' ? 'NORMAL' : 'LOW',
          status: cd.ticketStatus as any,
          resolvedAt: cd.ticketStatus === 'RESOLVED' ? new Date() : null,
        },
      });

      // Create Complaint linked to the ticket
      await prisma.complaint.create({
        data: {
          studentId: targetStudent.id,
          ticketId: ticket.id,
          title: cd.title,
          description: cd.description,
          category: cd.category,
          status: cd.status.toLowerCase(),
          resolvedAt: cd.status === 'RESOLVED' ? new Date() : null,
        },
      });

      complaintsCreated++;
      console.log(`   Complaint: "${cd.title}" (${cd.category}) [${cd.status}] by ${targetStudent.user.firstName}`);
    } catch (e: any) {
      console.log(`   Error creating complaint "${cd.title}": ${e.message}`);
    }
  }
  console.log(`   Total complaints created: ${complaintsCreated}`);

  console.log('\n========================================');
  console.log('Hostel seeding completed!');
  console.log('========================================');
  console.log(`Login: warden@dev-erp.com / Warden@123`);
  console.log(`Hostels created: ${createdHostels.length}`);
  console.log(`Rooms created: ${roomsCreated}`);
  console.log(`Complaints created: ${complaintsCreated}`);
}

main()
  .catch((e) => {
    console.error('Error during hostel seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
