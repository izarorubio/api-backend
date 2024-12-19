const bcrypt = require('bcrypt');

(async () => {
    const password = 'testpassword';
    const saltRounds = 10;

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log('Hashed Password:', hashedPassword);
})();
