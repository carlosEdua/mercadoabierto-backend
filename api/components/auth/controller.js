const err = require("../../../utils/error");
const auth = require("../../../auth");
const { AUTH_TABLE } = require("../../../store/constants");

function authController(injectedStore) {
    
    // set store
    let store;
    if(injectedStore) store = injectedStore;
    else store = require("../../../store/dummyDB");


    async function createUserCredentials(userData, password){
        const { id_user, username, email } = userData;

        const encryptPassword = await auth.encrypt(password);

        return await store.insert(AUTH_TABLE, { 
            id_user, 
            username, 
            email, 
            password: encryptPassword 
        });
    }


    async function login({username_or_email, password}){
        const usernameExist = await store.query(AUTH_TABLE, { username: username_or_email });
        const emailExist = await store.query(AUTH_TABLE, { email: username_or_email });
        const user = usernameExist || emailExist;
        const searchedBy = /\w+@\w{2,8}\.\w{2,5}\b/.test(username_or_email) ? 'email' : 'username';

        if(user){
            const correctPassword = await auth.compareCrypt(password, user.password);

            if(correctPassword){
                // create token payload without the password and money
                delete user.password;
                delete user.money;

                const token = auth.jwtSing({ ...user });

                return token;
            }

            throw err(`${searchedBy} or password are incorret`, 401);
        }

        throw err(`${searchedBy} is not registered`, 401);
    }


    return {
        createUserCredentials,
        login
    }
    
}

module.exports = authController;