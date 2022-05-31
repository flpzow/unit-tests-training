import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { GetStatementOperationError } from "./GetStatementOperationError"
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase"

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let getStatementOperationUseCase: GetStatementOperationUseCase;

describe("Get Statement Operation", () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    getStatementOperationUseCase = new GetStatementOperationUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
  });

  it("should be able to get an statement operation", async () => {
    const user = {
      email: "user@example.com",
      name: "user test",
      password: "1234",
    };

    const userCreated = await inMemoryUsersRepository.create(user);

    const user_id = userCreated.id as string;

    const statement = await inMemoryStatementsRepository.create({
      user_id,
      type: OperationType.DEPOSIT,
      amount: 300,
      description: "Test",
    });

    const statement_id = statement.id as string;

    const statementOperation = await getStatementOperationUseCase.execute({
      user_id,
      statement_id
    })

    expect(statementOperation).toHaveProperty("id")
    expect(statementOperation).toHaveProperty("user_id")
  });

  it("should not be able to get an statement operation if user does not exists", async () => {
    expect(async () => {
      const user = {
        email: "user@example.com",
        name: "user test",
        password: "1234",
      };

      const userCreated = await inMemoryUsersRepository.create(user);

      const user_id = userCreated.id as string;

      const statement = await inMemoryStatementsRepository.create({
        user_id,
        type: OperationType.DEPOSIT,
        amount: 300,
        description: "Test"
      })

      const statement_id = statement.id as string;

      await getStatementOperationUseCase.execute({
        user_id: "wrong_id",
        statement_id
      })
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound)
  });

  it("should not be able to get an statement operation if statement does not exists", async () => {
    expect(async () => {
      const user = {
        email: "user@example.com",
        name: "user test",
        password: "1234",
      };

      const userCreated = await inMemoryUsersRepository.create(user);

      const user_id = userCreated.id as string;

      const statement = await inMemoryStatementsRepository.create({
        user_id,
        type: OperationType.DEPOSIT,
        amount: 300,
        description: "Test"
      })

      const statement_id = statement.id as string;

      await getStatementOperationUseCase.execute({
        user_id,
        statement_id: "wrong_id"
      })
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound)
  });
})
