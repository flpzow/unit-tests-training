import request from "supertest";
import { Connection, createConnection } from "typeorm";
import { app } from "../../../../app";
import { hash } from "bcryptjs";


let connection: Connection;

describe("Create User Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const password = await hash("admin", 8);

    await connection.query(
      `INSERT INTO USERS(name, email, password)
        'admin', 'admin@fcars.com.br', '${password}')
      `
    )
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to create a new user", async () => {
    const response = await request(app).post("/api/v1/users")
    .send({
      email: "user@example.com",
      name: "user test",
      password: "1234",
    });

    expect(response.status).toBe(201);
  });

  it("should not be able to create a new user if email already exists", async () => {
    const response = await request(app).post("/api/v1/users")
    .send({
      email: "user@example.com",
      name: "user test",
      password: "1234",
    });

    expect(response.status).toBe(400);
  })
})