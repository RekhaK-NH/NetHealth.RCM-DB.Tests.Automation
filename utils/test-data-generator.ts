import { faker } from '@faker-js/faker';

export class TestDataGenerator {
  /**
   * Generate random patient data
   */
  static generatePatient() {
    return {
      mrn: `MRN-${faker.string.numeric(6)}`,
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      dob: faker.date.birthdate({ min: 18, max: 90, mode: 'age' }).toISOString().split('T')[0],
      gender: faker.helpers.arrayElement(['Male', 'Female', 'Other']),
      ssn: faker.string.numeric(9),
      phone: faker.phone.number(),
      email: faker.internet.email(),
      address: {
        street: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state({ abbreviated: true }),
        zip: faker.location.zipCode('#####'),
      },
    };
  }

  /**
   * Generate billing data
   */
  static generateBillingData() {
    return {
      invoiceNumber: `INV-${faker.string.numeric(8)}`,
      amount: faker.number.float({ min: 100, max: 5000, fractionDigits: 2 }),
      date: faker.date.recent().toISOString().split('T')[0],
      paymentMethod: faker.helpers.arrayElement(['Credit Card', 'Insurance', 'Cash', 'Check']),
      status: faker.helpers.arrayElement(['Pending', 'Paid', 'Overdue', 'Cancelled']),
    };
  }

  /**
   * Generate claim data
   */
  static generateClaim() {
    return {
      claimId: `CLM-${faker.string.numeric(10)}`,
      patientId: faker.string.numeric(6),
      serviceDate: faker.date.recent({ days: 30 }).toISOString().split('T')[0],
      diagnosisCode: faker.helpers.arrayElement(['M54.5', 'E11.9', 'I10', 'J44.9']),
      procedureCode: faker.helpers.arrayElement(['99213', '99214', '99215', '99203']),
      amount: faker.number.float({ min: 200, max: 2000, fractionDigits: 2 }),
      status: faker.helpers.arrayElement(['Submitted', 'In Review', 'Approved', 'Denied']),
    };
  }

  /**
   * Generate appointment data
   */
  static generateAppointment() {
    return {
      type: faker.helpers.arrayElement(['Follow-up', 'New Patient', 'Consultation', 'Procedure']),
      date: faker.date.future().toISOString().split('T')[0],
      time: faker.date.future().toTimeString().substring(0, 5),
      duration: faker.helpers.arrayElement([15, 30, 45, 60]),
      location: faker.helpers.arrayElement(['Main Clinic', 'Outpatient Center', 'Specialty Clinic']),
      provider: `Dr. ${faker.person.fullName()}`,
    };
  }

  /**
   * Generate unique identifier
   */
  static generateUniqueId(prefix: string = 'TEST'): string {
    return `${prefix}-${Date.now()}-${faker.string.alphanumeric(6).toUpperCase()}`;
  }

  /**
   * Generate insurance data
   */
  static generateInsurance() {
    return {
      provider: faker.helpers.arrayElement(['Blue Cross', 'Aetna', 'United Healthcare', 'Cigna', 'Medicare']),
      policyNumber: faker.string.alphanumeric(12).toUpperCase(),
      groupNumber: faker.string.alphanumeric(8).toUpperCase(),
      subscriberId: faker.string.numeric(9),
      effectiveDate: faker.date.past().toISOString().split('T')[0],
    };
  }
}
