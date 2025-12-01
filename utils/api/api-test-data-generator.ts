import { faker } from '@faker-js/faker';

/**
 * Test Data Generator for TherapyO-COM (Unity) API Tests
 * 
 * @description Generates realistic test data for healthcare-related entities
 * with support for parallel test execution through unique identifiers.
 * 
 * @module TestDataGenerator
 */

export interface PatientData {
    firstName: string;
    lastName: string;
    middleName?: string;
    dateOfBirth: string;
    gender: string;
    ssn?: string;
    mrn?: string;
    admissionDate: string;
    bedId?: number;
    primaryPhysicianId?: number;
}

export interface ContactData {
    firstName: string;
    lastName: string;
    companyName?: string;
    phone?: string;
    email?: string;
    address?: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
    };
}

export interface MessageData {
    subject: string;
    body: string;
    expiresOn: string;
    isActive: boolean;
    recipients: Array<{
        recipientId: number;
        recipientType: string;
    }>;
    facilityId: number;
}

export interface AppointmentData {
    appointmentDate: string;
    startTime: string;
    endTime: string;
    discipline: string;
    therapistId: number;
    facilityId: number;
    roomId?: number;
    notes?: string;
}

/**
 * Generate unique patient data
 */
export function generatePatientData(options?: {
    includeOptional?: boolean;
    validFormat?: boolean;
    gender?: 'M' | 'F' | 'O';
}): PatientData {
    const uniqueId = generateUniqueId();
    const gender = options?.gender || faker.helpers.arrayElement(['M', 'F']);

    const baseData: PatientData = {
        firstName: faker.person.firstName(gender === 'F' ? 'female' : 'male'),
        lastName: faker.person.lastName(),
        dateOfBirth: faker.date.birthdate({ min: 18, max: 90, mode: 'age' }).toISOString().split('T')[0],
        gender: gender,
        admissionDate: faker.date.recent({ days: 30 }).toISOString().split('T')[0],
    };

    if (options?.includeOptional) {
        baseData.middleName = faker.person.middleName();
        baseData.mrn = `MRN${uniqueId}`;

        if (options?.validFormat) {
            baseData.ssn = faker.string.numeric({ length: 9, allowLeadingZeros: true }).replace(/(\d{3})(\d{2})(\d{4})/, '$1-$2-$3');
            baseData.bedId = faker.number.int({ min: 100, max: 500 });
            baseData.primaryPhysicianId = faker.number.int({ min: 1, max: 100 });
        } else {
            baseData.ssn = '123-45-6789'; // Test SSN
        }
    }

    return baseData;
}

/**
 * Generate invalid patient data for negative testing
 */
export function generateInvalidPatientData(invalidField: string): Partial<PatientData> {
    const baseData = generatePatientData({ includeOptional: false });

    switch (invalidField) {
        case 'firstName':
            return { ...baseData, firstName: '' };
        case 'lastName':
            return { ...baseData, lastName: '' };
        case 'dateOfBirth':
            return { ...baseData, dateOfBirth: 'invalid-date' };
        case 'gender':
            return { ...baseData, gender: 'X' as any };
        case 'admissionDate':
            return { ...baseData, admissionDate: 'not-a-date' };
        case 'missingRequired':
            return { firstName: baseData.firstName }; // Missing other required fields
        default:
            throw new Error(`Invalid field type: ${invalidField}`);
    }
}

/**
 * Generate contact data
 */
export function generateContactData(options?: {
    includeCompany?: boolean;
    includeAddress?: boolean;
}): ContactData {
    const uniqueId = generateUniqueId();

    const data: ContactData = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        phone: faker.phone.number(),
        email: `test-${uniqueId}@example.com`,
    };

    if (options?.includeCompany) {
        data.companyName = faker.company.name();
    }

    if (options?.includeAddress) {
        data.address = {
            street: faker.location.streetAddress(),
            city: faker.location.city(),
            state: faker.location.state({ abbreviated: true }),
            zipCode: faker.location.zipCode('#####'),
        };
    }

    return data;
}

/**
 * Generate message data
 */
export function generateMessageData(
    facilityId: number,
    recipientIds: number[]
): MessageData {
    const futureDate = faker.date.future({ years: 1 });

    return {
        subject: `Test Message - ${generateUniqueId('msg')}`,
        body: faker.lorem.paragraph(),
        expiresOn: futureDate.toISOString(),
        isActive: true,
        recipients: recipientIds.map(id => ({
            recipientId: id,
            recipientType: 'User',
        })),
        facilityId,
    };
}

/**
 * Generate appointment data
 */
export function generateAppointmentData(
    facilityId: number,
    therapistId: number,
    discipline: string
): AppointmentData {
    const appointmentDate = faker.date.soon({ days: 7 });
    const hour = faker.number.int({ min: 8, max: 16 });

    return {
        appointmentDate: appointmentDate.toISOString().split('T')[0],
        startTime: `${hour.toString().padStart(2, '0')}:00`,
        endTime: `${(hour + 1).toString().padStart(2, '0')}:00`,
        discipline,
        therapistId,
        facilityId,
        notes: faker.lorem.sentence(),
    };
}

/**
 * Generate diagnosis data
 */
export function generateDiagnosisData() {
    return {
        diagnoses: [
            {
                diagnosisCode: `M${faker.string.numeric({ length: 4, allowLeadingZeros: true })}`,
                diagnosisType: 'ICD-10',
                onsetDate: faker.date.past({ years: 1 }).toISOString().split('T')[0],
                isPrimary: true,
            },
        ],
    };
}

/**
 * Generate discharge data
 */
export function generateDischargeData() {
    return {
        dischargeDate: faker.date.soon({ days: 30 }).toISOString().split('T')[0],
        dischargeReasonId: faker.number.int({ min: 1, max: 10 }),
        dischargeNotes: faker.lorem.sentence(),
    };
}

/**
 * Generate unique identifier
 */
export function generateUniqueId(prefix = 'test'): string {
    const timestamp = Date.now();
    const random = faker.string.alphanumeric(6);
    return `${prefix}-${timestamp}-${random}`;
}

/**
 * Generate realistic MRN (Medical Record Number)
 */
export function generateMRN(): string {
    return `MRN${faker.string.numeric({ length: 8, allowLeadingZeros: false })}`;
}

/**
 * Generate realistic SSN for testing (not real SSNs)
 */
export function generateTestSSN(): string {
    // Use test range SSNs (not assigned to real people)
    const area = faker.helpers.arrayElement(['900', '901', '902']); // Test area numbers
    const group = faker.string.numeric({ length: 2, allowLeadingZeros: true });
    const serial = faker.string.numeric({ length: 4, allowLeadingZeros: true });
    return `${area}-${group}-${serial}`;
}

/**
 * Generate date range for queries
 */
export function generateDateRange(daysBack = 30, daysForward = 7) {
    const fromDate = faker.date.recent({ days: daysBack });
    const toDate = faker.date.soon({ days: daysForward });

    return {
        fromDate: fromDate.toISOString().split('T')[0],
        toDate: toDate.toISOString().split('T')[0],
    };
}

/**
 * Generate time slot
 */
export function generateTimeSlot() {
    const hour = faker.number.int({ min: 8, max: 16 });
    const duration = faker.helpers.arrayElement([30, 45, 60]); // minutes

    const startMinutes = hour * 60;
    const endMinutes = startMinutes + duration;

    return {
        startTime: formatTime(startMinutes),
        endTime: formatTime(endMinutes),
    };
}

/**
 * Format minutes to HH:MM
 */
function formatTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Generate healthcare disciplines
 */
export function generateDiscipline(): string {
    return faker.helpers.arrayElement([
        'PT', // Physical Therapy
        'OT', // Occupational Therapy
        'ST', // Speech Therapy
        'RT', // Respiratory Therapy
    ]);
}

/**
 * Generate credentials
 */
export function generateCredentials(): string {
    return faker.helpers.arrayElement([
        'PT, DPT',
        'OTR/L',
        'SLP, CCC',
        'RRT',
        'MD',
        'RN',
        'LPN',
    ]);
}

/**
 * Generate organization code
 */
export function generateOrganizationCode(): string {
    return faker.string.alpha({ length: 6, casing: 'upper' });
}

/**
 * Generate facility data
 */
export function generateFacilityData() {
    return {
        facilityName: `${faker.location.city()} Healthcare Center`,
        address: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state({ abbreviated: true }),
        zipCode: faker.location.zipCode('#####'),
        phone: faker.phone.number(),
        isActive: true,
    };
}

/**
 * Generate username
 */
export function generateUsername(domain = 'nethealth.com'): string {
    const firstName = faker.person.firstName().toLowerCase();
    const lastName = faker.person.lastName().toLowerCase();
    const uniqueId = faker.string.numeric(3);
    return `${firstName}.${lastName}${uniqueId}@${domain}`;
}

/**
 * Generate authentication request
 */
export function generateAuthRequest(organizationCode = 'TESTORG') {
    return {
        username: generateUsername(),
        password: 'TestPassword123!',
        organizationCode,
    };
}
