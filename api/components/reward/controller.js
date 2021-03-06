const err = require("../../../utils/error");
const { 
    REWARD_TABLE, 
    USER_TABLE 
} = require("../../../store/constants");
const REWARD = 200;

function moneyController(injectedStore) {
    
    // set store
    let store;
    if(injectedStore) store = injectedStore;
    else store = require("../../../store/dummyDB");

    async function checkReward(id_user) {
        const [ lastReward ] = await store.queryWithOrder(REWARD_TABLE, { id_user }, { orderBy: 'order_number' });

        if(lastReward){
            const lastRewardDate = parseInt(lastReward.date_miliseconds),
            oneDay = 60 * 60 * 24 * 1000,
            rightNow = +new Date(),
            tomorrow = lastRewardDate + oneDay;
    
            const isOneDayOld = ( rightNow - lastRewardDate ) > oneDay;
    
            const timeLeft = tomorrow - rightNow;
    
            return {
                isOneDayOld,
                howMuchLeft: {
                    hours: Math.floor(timeLeft / 1000 / 60 / 60),
                    minutes: Math.floor((timeLeft / 1000 / 60) % 60)
                }
            };
        }

        // if no rewards yet
        return {
            isOneDayOld: true,
            howMuchLeft: {
                hours: 23,
                minutes: 59
            },
            isFirstTime: true
        }
    }

    async function giveReward(id_user) {
        const { isOneDayOld, howMuchLeft } = await checkReward(id_user);
        
        if(isOneDayOld){
            const user = await store.query(USER_TABLE, { id_user });
            
            const money = parseInt(user.money) + REWARD;

            await store.update(USER_TABLE, id_user, { money });

            // save reward register
            await store.insert(REWARD_TABLE, { 
                id_user,
                date_miliseconds: +new Date(),
                reward_ammount: REWARD  
            })

            return {
                isOneDayOld: false, // always set to false, because reward was given right now
                howMuchLeft
            };
        }
        else{
            throw err(`Sorry, you need to wait ${howMuchLeft.hours}:${howMuchLeft.minutes}`)
        }
    }
 
    return {
        checkReward,
        giveReward
    }
    
}

module.exports = moneyController;