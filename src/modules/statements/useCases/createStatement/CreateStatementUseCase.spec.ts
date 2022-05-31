import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { CreateStatementError } from "./CreateStatementError";

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createStatementUseCase: CreateStatementUseCase;

describe("Create Statement", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
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
})