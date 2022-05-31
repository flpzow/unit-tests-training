import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("Create User", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("should be able to create a new user", async () => {
    const user = {
      email: "user@example.com",
      name: "user test",
      password: "1234",
    };

    const userCreated = await createUserUseCase.execute(user);

    expect(userCreated).toHaveProperty("id");
  });

  it("should not be able to create a user with an existent email", () => {
    expect(async () => {
      const user = {
        email: "user@example.com",
        name: "user test",
        password: "1234",
      };

      await createUserUseCase.execute(user);

      const userExistent = {
        email: "user@example.com",
        name: "user existent",
        password: "12345",
      };

      await createUserUseCase.execute(userExistent);
    }).rejects.toBeInstanceOf(CreateUserError);
  });
})