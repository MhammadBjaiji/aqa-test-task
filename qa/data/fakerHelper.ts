import { faker } from "@faker-js/faker";

/**
 * Centralized Faker helper for generating test data
 * Use this throughout your tests for consistent, reusable data generation
 */
export const fakerHelper = {
  /**
   * Generate a random valid user with email and password
   */
  generateUser: (overrides?: Partial<{ email: string; password: string }>) => ({
    email: faker.internet.email(),
    password: faker.internet.password({ length: 12, memorable: false }),
    ...overrides,
  }),

  /**
   * Generate a random email with good data (no special characters)
   */
  generateEmail: () => {
    const username = faker.internet.username().replace(/[^a-z0-9]/gi, "");
    const domain = faker.internet.domainName();
    return `${username}@${domain}`;
  },

  /**
   * Generate a malformed email with special characters and invalid format
   */
  generateMalformedEmail: () => {
    const specialChars = ["!", "#", "$", "%", "&", "*", "+", "=", "@@@", ".."];
    const randomSpecial =
      specialChars[Math.floor(Math.random() * specialChars.length)];
    return `invalid${randomSpecial}user@domain${randomSpecial}com`;
  },

  /**
   * Generate a random strong password
   */
  generatePassword: (length: number = 12) =>
    faker.internet.password({ length, memorable: false }),

  /**
   * Generate a random username with good data (alphanumeric only, no special characters)
   */
  generateUsername: () => {
    const username = faker.internet.username();
    // Remove all special characters, keep only alphanumeric
    return username.replace(/[^a-z0-9]/gi, "").toLowerCase();
  },

  /**
   * Generate a malformed username with dots
   */
  generateMalformedUsername: () => {
    return `user.name.test`;
  },

  /**
   * Generate a random first name
   */
  generateFirstName: () => faker.person.firstName(),

  /**
   * Generate a random last name
   */
  generateLastName: () => faker.person.lastName(),

  /**
   * Generate a random full name
   */
  generateFullName: () => faker.person.fullName(),

  /**
   * Generate a random phone number
   */
  generatePhoneNumber: () => faker.phone.number(),

  /**
   * Generate a random address
   */
  generateAddress: () => ({
    street: faker.location.streetAddress(),
    city: faker.location.city(),
    state: faker.location.state(),
    zipCode: faker.location.zipCode(),
    country: faker.location.country(),
  }),

  /**
   * Generate a random number in range
   */
  generateNumber: (min: number = 0, max: number = 100) =>
    faker.number.int({ min, max }),

  /**
   * Generate a random UUID
   */
  generateUUID: () => faker.string.uuid(),

  /**
   * Generate a random date
   */
  generateDate: (years: number = 1) => faker.date.past({ years }),

  /**
   * Generate a random task title
   */
  generateTaskTitle: () => faker.hacker.phrase(),

  /**
   * Generate a random task description
   */
  generateTaskDescription: () => faker.lorem.paragraphs(1),

  /**
   * Generate a random priority level (Low, Medium, High)
   */
  generatePriority: () => {
    const priorities = ["Low", "Medium", "High"];
    return priorities[Math.floor(Math.random() * priorities.length)];
  },

  /**
   * Generate a random task status
   */
  generateTaskStatus: () => {
    const statuses = ["Pending", "In Progress", "Completed", "On Hold"];
    return statuses[Math.floor(Math.random() * statuses.length)];
  },

  /**
   * Generate a random due date (future date)
   */
  generateDueDate: () => faker.date.future(),

  /**
   * Generate complete task data
   */
  generateTaskData: (
    overrides?: Partial<{
      title: string;
      description: string;
      priority: string;
      status: string;
      dueDate: Date;
    }>,
  ) => ({
    title: fakerHelper.generateTaskTitle(),
    description: fakerHelper.generateTaskDescription(),
    priority: fakerHelper.generatePriority(),
    status: fakerHelper.generateTaskStatus(),
    dueDate: fakerHelper.generateDueDate(),
    ...overrides,
  }),

  /**
   * Generate a random note or comment
   */
  generateNote: () => faker.lorem.sentence(),

  /**
   * Generate a random comment
   */
  generateComment: () => faker.lorem.sentence(),

  /**
   * Generate a random tag/label
   */
  generateTag: () => faker.word.noun(),

  /**
   * Generate multiple random tags
   */
  generateTags: (count: number = 3) =>
    Array.from({ length: count }, () => fakerHelper.generateTag()),

  /**
   * Generate registration data (email, username, password, language)
   * Uses clean generators to ensure good data (no special characters)
   */
  generateRegistrationData: (
    overrides?: Partial<{
      email: string;
      username: string;
      password: string;
      language: string;
    }>,
  ) => ({
    email: fakerHelper.generateEmail(),
    username: fakerHelper.generateUsername(),
    password: fakerHelper.generatePassword(),
    language: "en",
    ...overrides,
  }),

  /**
   * Reset Faker seed for reproducible data (useful for debugging)
   */
  setSeed: (seed: number) => {
    faker.seed(seed);
  },
};
