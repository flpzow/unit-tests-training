import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let showUserProfileUseCase: ShowUserProfileUseCase;

describe("Show User Profile", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(inMemoryUsersRepository);
  });

  it("should be able to show user profile", async () => {
    const user = {
      email: "user@example.com",
      name: "user test",
      password: "1234",
    };

    const userCreated = await inMemoryUsersRepository.create(user);

    const userId = userCreated.id as string;

    const userProfile = await showUserProfileUseCase.execute(userId);

    expect(userProfile).toHaveProperty("id");
  });

  it("should not be able to show user profile if the user dont exists", () => {
    expect(async () => {
      await showUserProfileUseCase.execute("undefined_id");
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  });
})