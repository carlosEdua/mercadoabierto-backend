const router = require("express").Router();
const response = require("../../../network/response");
const controller = require('./index');
const { userSchema } = require("./schemas");
// middlewares
const checkBodySchema = require("../../../network/schemaValidator");
const secureAction = require("./secure");

// routes
router.get('/', getAllUsers);
router.get('/logged-info', secureAction('get-info'), getUserLoggedInfo);
router.get('/money/:id', secureAction('get-money'), getUserMoney);
router.get('/check-avaliable/', checkAvaliable);
router.get('/:username', getUserByUsername);
// router.get('/:id', getUserById);

router.post('/', checkBodySchema(userSchema), createUser);

// routes handlers
function getAllUsers(req, res, next) {
    controller.getAllUsers()
        .then( data => response.success(res, 200, data) )
        .catch(next);
}

function getUserLoggedInfo(req, res, next) {
    controller.getUserById(req.user.id_user, true)
        .then( data => response.success(res, 200, data) )
        .catch(next);
}

function getUserByUsername(req, res, next) {
    controller.getUserByUsername(req.params.username)
        .then( data => response.success(res, 200, data) )
        .catch(next);
}

function getUserMoney(req, res, next) {
    controller.getUserMoney(req.user.id_user)
        .then( data => response.success(res, 200, data) )
        .catch(next);
}

// function getUserById(req, res, next) {
//     controller.getUserById(req.params.id)
//         .then( data => response.success(res, 200, data) )
//         .catch(next);
// }

function createUser(req, res, next) {
    controller.createUser(req.body)
        .then( data => response.success(res, 200, data) )
        .catch(next);
}

function checkAvaliable(req, res, next) {
    const { searchBy, valueToSearch } = req.query;
    controller.isAvaliable(searchBy, valueToSearch)
        .then( data => response.success(res, 200, data) )
        .catch(next);
}

module.exports = router;
