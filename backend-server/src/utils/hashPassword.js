import bcrypt from 'bcrypt';

const saltRounds = 10; // Number of salt rounds (complexity of hashing)
const defaultPassword = 'admin'; // Default password

// Hash the password
bcrypt.hash(defaultPassword, saltRounds, (err, hashedPassword) => {
  if (err) throw err;
  console.log('Hashed password:', hashedPassword);
});
