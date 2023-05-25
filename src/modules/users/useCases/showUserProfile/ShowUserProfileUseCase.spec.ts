import { hash } from 'bcryptjs'
import { InMemoryUsersRepository } from '../../repositories/in-memory/InMemoryUsersRepository'
import { ShowUserProfileError } from './ShowUserProfileError'
import { ShowUserProfileUseCase } from './ShowUserProfileUseCase'

describe('Show User Profile Use Case', () => {
  let inMemoryUsersRepository: InMemoryUsersRepository
  let showUserProfileUseCase: ShowUserProfileUseCase

  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    showUserProfileUseCase = new ShowUserProfileUseCase(inMemoryUsersRepository)
  })

  it(' should be able to show user profile by id', async () => {
    const passwordHash = await hash('1234', 8)

    const user = await inMemoryUsersRepository.create({
      email: 'test@gmail.com',
      password: passwordHash,
      name: 'User Test'
    })

    const userProfile = await showUserProfileUseCase.execute(user.id!)

    expect(userProfile).toHaveProperty('id')
    expect(userProfile).toHaveProperty('email')
    expect(userProfile).toHaveProperty('name')
    expect(userProfile.name).toBe(user.name)
    expect(userProfile.email).toBe(user.email)
  })

  it(' should not be able to show user profile for a inexistent user', async () => {
    expect(async () => {
      await showUserProfileUseCase.execute('123')
    }).rejects.toBeInstanceOf(ShowUserProfileError)
  })
})
