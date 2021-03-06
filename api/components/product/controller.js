const err = require("../../../utils/error");
const { Product, ProductMedia } = require("./models");
const { 
    PRODUCT_TABLE,
    PRODUCT_MEDIA_TABLE,
    USER_TABLE
} = require("../../../store/constants");

function productController(injectedStore) {
    
    // set store
    let store;
    if(injectedStore) store = injectedStore;
    else store = require("../../../store/dummyDB");

    // ========== Read =========

    async function getAllProducts() {
        return await store.list(PRODUCT_TABLE);
    }

    async function getAllUserProducts(username) {
        const { id_user } = await store.query(USER_TABLE, { username });
        const userProducts = await store.query(PRODUCT_TABLE, { id_user }, null, true);

        return userProducts;
    }

    async function getProductById(id) {
        const product = await store.query(PRODUCT_TABLE, { id_product: id });
        // if(!product) throw err("the product with id " + id + " does not exist", 404);
        if(!product){
            return {
                productData: null,
                photos: null
            };
        }

        const photos = await store.query(
            PRODUCT_MEDIA_TABLE, 
            { id_album: product.id_album }, 
            null, 
            true
        );

        const sellerData = await store.getValuesFrom(
            USER_TABLE,
            {id_user: product.id_user},
            ['id_user', 'username', 'photo_url']    
        )

        return {
            productData: product,
            photos,
            sellerData
        };
    }

    async function getProductsByCategory(category, sortBy = null) {
        const products = await store.query(PRODUCT_TABLE, { category }, null, true);
        return products;
    }
 
    
    async function getProductMedia(id_album) {
        const media = await store.query(PRODUCT_MEDIA_TABLE, { id_album }, null, true);
        return media;
    }

    // ========== Create ==========

    async function saveProductMedia(body, id_user) {
        const media = ProductMedia(body, id_user);

        await store.insert(PRODUCT_MEDIA_TABLE, media);
        return 'product media saved';
    }

    async function saveProduct(body, id_user) {
        const product = Product(body, id_user);
        await store.insert(PRODUCT_TABLE, product);
        return product;
    }

    // ================ update ==============
    async function updateProduct(id_product, propsObj) {
        await store.update(PRODUCT_TABLE, id_product, propsObj);
        return await store.query(PRODUCT_TABLE, { id_product });
    }

    // ========= delete ==========

    async function removeProductMedia(photo_fullname) {
        await store.removeBy(PRODUCT_MEDIA_TABLE, { photo_fullname });
        return 'product media removed';
    }

    return {
        // GET
        getAllProducts,
        getAllUserProducts,
        getProductById,
        getProductsByCategory,
        getProductMedia,
        // POST
        saveProductMedia,
        saveProduct,
        // PUT
        updateProduct,
        // DELETE
        removeProductMedia,
        // misc
        store,
        TABLE: PRODUCT_TABLE
    }
    
}

module.exports = productController;