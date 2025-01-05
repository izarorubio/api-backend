const express = require('express');
const {
    createUser,
    getAllUsers,
    updateUser,
    deleteUser,
} = require('../controllers/usersController');

const router = express.Router();

router.get('/', getAllUsers);
router.post('/', createUser);
router.post('/signup', createUser);
router.post('/login', loginUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);


module.exports = router;
