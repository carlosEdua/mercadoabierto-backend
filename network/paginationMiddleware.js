const err = require("../utils/error");

// express pagination middleware
function paginationMiddleware({store, table, where = null, haveRegex = false}) {
    return async (req, res, next) => {
        try {
            
            const page = parseInt(req.query.page || 1) - 1,
            limit = parseInt(req.query.limit || 10),
            orderBy = req.query.orderBy || 'date',
            order = req.query.order || 'DESC';

            const offset = page > 0 ? page * limit : 0;
            
            const sqlWhere = getSqlWhere(where, req);
            
            const totalItems = await store.getCount(table, sqlWhere, haveRegex);
            const totalPages = Math.ceil( totalItems / limit);

            const paginationItems = await store.getWithPagination({
                table,
                limit,
                offset,
                orderBy,
                order,
                haveRegex,
                where: sqlWhere,
            });
            // save to request object
            req.paginationResults = {
                totalItems,
                totalPages,
                currentPage: page + 1,
                view: req.query.view,
                filter: req.query.filter,
                order,
                orderBy,
                search: haveRegex ? Object.values(where)[0] : '',
                results: paginationItems
            };

            next()

        } catch (error) {
            console.error("[Error in pagination middleware]", error);
            throw err(error.message, 500);
        }
    }
}

/**
 * 
 * @param {any} where object or string
 * @param {object} req
 * @returns {object} a plain object
 */
function getSqlWhere(where, req) {
    if(where){
        // it's like { category: something }
        if(typeof where === 'object') return where;

        // it's like "category=params.category"
        const splited = where.split("="),
        key = splited[0],
        props = splited[1],
        values = props.split('.');
        // req.params.something || req.body.somethig || req.query.something
        const value = req[values[0]][values[1]];

        if(value){
            return { [key]: value }
        }else{
            throw err("error parsing sql where", 500);
        }
    }
    return null;
}

module.exports = paginationMiddleware;