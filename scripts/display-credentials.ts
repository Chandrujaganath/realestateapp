// This script displays the credentials for all users created by the seed script

const _credentials = [
  // Guest users
  {
    email: 'guest1@realestate-app.com',
    password: 'guest1Pass123!',
    role: 'guest',
  },
  {
    email: 'guest2@realestate-app.com',
    password: 'guest2Pass123!',
    role: 'guest',
  },
  {
    email: 'guest3@realestate-app.com',
    password: 'guest3Pass123!',
    role: 'guest',
  },
  {
    email: 'guest4@realestate-app.com',
    password: 'guest4Pass123!',
    role: 'guest',
  },
  {
    email: 'guest5@realestate-app.com',
    password: 'guest5Pass123!',
    role: 'guest',
  },

  // Client users
  {
    email: 'client1@realestate-app.com',
    password: 'client1Pass123!',
    role: 'client',
  },
  {
    email: 'client2@realestate-app.com',
    password: 'client2Pass123!',
    role: 'client',
  },
  {
    email: 'client3@realestate-app.com',
    password: 'client3Pass123!',
    role: 'client',
  },
  {
    email: 'client4@realestate-app.com',
    password: 'client4Pass123!',
    role: 'client',
  },
  {
    email: 'client5@realestate-app.com',
    password: 'client5Pass123!',
    role: 'client',
  },

  // Manager users
  {
    email: 'manager1@realestate-app.com',
    password: 'manager1Pass123!',
    role: 'manager',
  },
  {
    email: 'manager2@realestate-app.com',
    password: 'manager2Pass123!',
    role: 'manager',
  },
  {
    email: 'manager3@realestate-app.com',
    password: 'manager3Pass123!',
    role: 'manager',
  },
  {
    email: 'manager4@realestate-app.com',
    password: 'manager4Pass123!',
    role: 'manager',
  },
  {
    email: 'manager5@realestate-app.com',
    password: 'manager5Pass123!',
    role: 'manager',
  },

  // Admin users
  {
    email: 'admin1@realestate-app.com',
    password: 'admin1Pass123!',
    role: 'admin',
  },
  {
    email: 'admin2@realestate-app.com',
    password: 'admin2Pass123!',
    role: 'admin',
  },
  {
    email: 'admin3@realestate-app.com',
    password: 'admin3Pass123!',
    role: 'admin',
  },
  {
    email: 'admin4@realestate-app.com',
    password: 'admin4Pass123!',
    role: 'admin',
  },
  {
    email: 'admin5@realestate-app.com',
    password: 'admin5Pass123!',
    role: 'admin',
  },

  // Super Admin users
  {
    email: 'superadmin1@realestate-app.com',
    password: 'superadmin1Pass123!',
    role: 'superadmin',
  },
  {
    email: 'superadmin2@realestate-app.com',
    password: 'superadmin2Pass123!',
    role: 'superadmin',
  },
  {
    email: 'superadmin3@realestate-app.com',
    password: 'superadmin3Pass123!',
    role: 'superadmin',
  },
  {
    email: 'superadmin4@realestate-app.com',
    password: 'superadmin4Pass123!',
    role: 'superadmin',
  },
  {
    email: 'superadmin5@realestate-app.com',
    password: 'superadmin5Pass123!',
    role: 'superadmin',
  },
];

console.log('User Credentials:');
console.table(_credentials);

console.log('\nRecommended users for testing:');
console.log('Guest: guest1@realestate-app.com / guest1Pass123!');
console.log('Client: client1@realestate-app.com / client1Pass123!');
console.log('Manager: manager1@realestate-app.com / manager1Pass123!');
console.log('Admin: admin1@realestate-app.com / admin1Pass123!');
console.log('Super Admin: superadmin1@realestate-app.com / superadmin1Pass123!');
