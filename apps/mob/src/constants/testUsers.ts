export interface TestUser {
  email: string;
  password: string;
  displayName: string;
}

export const testUsers: TestUser[] = [
  {
    email: 'testuser1@example.com',
    password: 'Test1234!',
    displayName: 'テストユーザー1',
  },
  {
    email: 'admin@example.com',
    password: 'Admin1234!',
    displayName: '管理者',
  },
  {
    email: 'demo@example.com',
    password: 'Demo1234!',
    displayName: 'デモユーザー',
  },
];