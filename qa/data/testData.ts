import { fakerHelper } from "./fakerHelper";

// Define your test data here

export const TEST_USERS = {
  validUser: {
    email: "m7d.2022.1@gmail.com",
    password: "mhd112233",
  },
  invalidUser: {
    email: "invalid@example.com",
    password: "WrongPassword",
  },
};

// Generate dynamic test data using Faker
export const TEST_DATA = {
  /**
   * Generate a random invalid user for testing login failures
   */
  randomInvalidUser: () => fakerHelper.generateUser(),

  /**
   * Generate multiple random users
   */
  randomUsers: (count: number = 5) =>
    Array.from({ length: count }, () => fakerHelper.generateUser()),

  /**
   * Generate random credentials
   */
  randomCredentials: () => ({
    email: fakerHelper.generateEmail(),
    password: fakerHelper.generatePassword(),
  }),
};
