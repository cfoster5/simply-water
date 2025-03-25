import { faker } from "@faker-js/faker";

export const dummyEntries = Array.from({ length: 10 }, () => {
  const fullDate = faker.date.between({
    from: faker.date.recent({ days: 7 }),
    to: new Date(),
  }); // Random date between today and one week ago
  const hours = faker.number.int({ min: 7, max: 22 }); // Random hour between 7 AM and 10 PM
  const minutes = faker.number.int({ min: 0, max: 59 }); // Random minute
  const time = new Date(
    fullDate.setHours(hours, minutes, 0)
  ).toLocaleTimeString();
  return {
    fullDate, // Keep the full Date object for sorting
    date: fullDate.toLocaleDateString(),
    time: time,
    amount: faker.number.int({ min: 1, max: 24, multipleOf: 8 }),
  };
})
  .sort((a, b) => {
    return a.fullDate.getTime() - b.fullDate.getTime(); // Sort by fullDate ascending
  })
  .map(({ fullDate, ...entry }) => entry); // Remove fullDate from the final output
