import "dotenv/config";
import { db, client } from "./index";
import { users } from "./schema";
import { UserDBInsert } from "../lib/types";

export async function seed() {
  // This will run the seed file
  console.log("Seeding database...");
  const existingUsers = await db.select().from(users);
  const userInserts = [];

  if (existingUsers.find((u) => u.id === "Telnyx")) {
    console.log("Database already seeded.");
    return;
  }

  const user: UserDBInsert = {
    id: "Telnyx",
    fullName: "Telnyx Events",
    imgURL:
      "data:image/svg+xml;charset=UTF-8,%3csvg viewBox='0 0 90 90' xmlns='http://www.w3.org/2000/svg'%3e%3cg fill='%2300E3AA'%3e%3cpath d='M88.447 78.75a12.19 12.19 0 0 0 1.203-8.852 13.174 13.174 0 0 0-.868-2.407 6.718 6.718 0 0 0-.395-.738L76.431 44.527H64.198l12.51 23.294a4.43 4.43 0 0 1 0 4.445 4.291 4.291 0 0 1-1.577 1.52 4.373 4.373 0 0 1-2.133.557H58.732a13.436 13.436 0 0 1-1.995 6.123A13.706 13.706 0 0 1 52.103 85h26.222a12.161 12.161 0 0 0 4.992-1.437 11.758 11.758 0 0 0 5.13-4.814ZM21.383 29.988h12.233l6.096-11.162a6.023 6.023 0 0 1 2.237-2.332 6.154 6.154 0 0 1 3.14-.86 6.15 6.15 0 0 1 3.14.86 6.018 6.018 0 0 1 2.236 2.332l5.92 11.162h12.232l-8.68-16.15a16.756 16.756 0 0 0-6.223-6.459A17.118 17.118 0 0 0 45 5c-3.07 0-6.083.823-8.714 2.38a16.754 16.754 0 0 0-6.222 6.457l-8.681 16.15Zm9.865 12.598a13.25 13.25 0 0 1 1.916-6.113 13.522 13.522 0 0 1 4.575-4.544H14.063v10.657h17.185Z'/%3e%3cpath d='M33.2 43.362V72.48h5.564a5.361 5.361 0 0 0 3.2-1.1 5.218 5.218 0 0 0 1.871-2.782c.12-.423.18-.86.178-1.3v-17.47a7.144 7.144 0 0 1 2.13-5.06 7.379 7.379 0 0 1 5.13-2.123h24.763V31.929H44.802a11.718 11.718 0 0 0-8.205 3.355 11.34 11.34 0 0 0-3.396 8.078Z'/%3e%3cpath d='M1.218 67.49a13.17 13.17 0 0 0-.869 2.408 12.246 12.246 0 0 0 1.204 8.87 11.757 11.757 0 0 0 5.13 4.795A12.16 12.16 0 0 0 11.675 85H45c3.14 0 6.15-1.227 8.37-3.411a11.553 11.553 0 0 0 3.468-8.236V44.507h-5.643a5.388 5.388 0 0 0-3.678 1.574 5.216 5.216 0 0 0-1.53 3.648V67.2a7.105 7.105 0 0 1-2.14 5.053 7.342 7.342 0 0 1-5.141 2.09H17.1a4.374 4.374 0 0 1-2.134-.556 4.288 4.288 0 0 1-1.576-1.52 4.467 4.467 0 0 1 0-4.465L25.9 44.508H13.568L1.612 66.734c-.138.271-.276.504-.394.757Z'/%3e%3c/g%3e%3c/svg%3e",
    isSelf: false,
  };

  userInserts.push(db.insert(users).values(user));

  await Promise.all(userInserts);

  await client.end();
}

seed()
  .then(() => {
    console.log("Seeding done.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("An error occurred:", error);
    process.exit(1);
  });
