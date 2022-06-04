import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { CreateStatementError } from "./CreateStatementError";
import { CreateUserUseCase } from "@modules/users/useCases/createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "@modules/users/useCases/authenticateUser/AuthenticateUserUseCase";

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
  TRANSFER = 'transfer',
}

let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createStatementUseCase: CreateStatementUseCase;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;

describe("Create Statement", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository);
  });

  it("should be able to create a new statement", async () => {
    const user = {
      email: "user@example.com",
      name: "user test",
      password: "1234",
    };

    const userCreated = await inMemoryUsersRepository.create(user);

    const userId = userCreated.id as string;

    const statement = await createStatementUseCase.execute({
      user_id: userId,
      type: OperationType.DEPOSIT,
      amount: 300,
      description: "Test",
    });

    expect(statement).toHaveProperty("id");
  });

  it("should not be able to create a new statement if user does not exists", () => {
    expect(async () => {
      const statement = await createStatementUseCase.execute({
        user_id: "undefined_id",
        type: OperationType.DEPOSIT,
        amount: 300,
        description: "Test",
      });
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it("should not be able to create a withdraw statement if the amount is greater than the balance", () => {
    expect(async () => {
      const user = {
        email: "user@example.com",
        name: "user test",
        password: "1234",
      };

      const userCreated = await inMemoryUsersRepository.create(user);

      const userId = userCreated.id as string;

      await createStatementUseCase.execute({
        user_id: userId,
        type: OperationType.WITHDRAW,
        amount: 300,
        description: "Test",
      });
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });

  it("should be able to create a transfer", async () => {
    const user01 = await createUserUseCase.execute({
      name: "User 01",
      email: "user01@test.com",
      password: "1234"
    })

    const user02 = await createUserUseCase.execute({
      name: "User 02",
      email: "user02@test.com",
      password: "1234"
    })

    await createStatementUseCase.execute({
      user_id: user01.id as string,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: "Depositing $100",
    });

    const statement = await createStatementUseCase.execute({
      user_id: user02.id as string,
      sender_id: user01.id as string,
      type: OperationType.TRANSFER,
      amount: 50,
      description: "Transfer $50 to User 02",
    });

    expect(statement).toHaveProperty("id");
    expect(statement.amount).toEqual(50);
  });
})