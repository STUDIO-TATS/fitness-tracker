export interface TestUser {
  email: string;
  password: string;
  displayName: string;
}

export const testUsers: TestUser[] = [
  {
    email: 'user1@example.com',
    password: 'testpass123',
    displayName: '田中太郎',
  },
  {
    email: 'user2@example.com',
    password: 'testpass123',
    displayName: '鈴木花子',
  },
  {
    email: 'user3@example.com',
    password: 'testpass123',
    displayName: '佐藤次郎',
  },
  {
    email: 'staff@fittracker.com',
    password: 'testpass123',
    displayName: 'スタッフ太郎',
  },
  {
    email: 'admin@fittracker.com',
    password: 'testpass123',
    displayName: 'システム管理者',
  },
];