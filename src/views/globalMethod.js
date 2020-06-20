import Dexie from "dexie";

export default {
  methods: {

    /**___________________ Dexie Function ___________________________*/
    /**
     * Fetch All Modules Data
     */
    fetchModules: function () {
      return new Promise(function (resolve, reject) {
        Dexie.getDatabaseNames()
          .then(function (databases) {
            resolve(databases);
          })
          .catch(Dexie.BulkError, function (e) {
            reject(new Error(e));
          });
      });
    },
    
    /**
     * 
     * @param {String} tableName 
     */
    deleteModuleTable: function(tableName) {
      return new Promise(function(resolve, reject) {
        Dexie.delete(tableName)
          .then(function() {
            resolve("Database successfully deleted");
          })
          .catch(Dexie.BulkError, function(e) {
            reject(new Error(e));
          });
      });
    },

    /**___________________ Private Function ___________________________*/

    /**
     * Show Toast Messages
     * @param {String} msg 
     * @param {String} type 
     */
    toastMsg(msg, type) {
      this.$buefy.toast.open({
        message: msg,
        type: type,
        position: "is-bottom"
      });
    },

    /**
     * [Promise]
     * Catch Function
     * @param {String} error 
     */
    catchFunction(error) {
      this.$buefy.snackbar.open({
        message: error,
        type: "is-danger"
      });
      console.error("createModule -> error", error);
    },

    /**
     * [Promise]
     * Then Function
     * @param {String} res 
     */
    thenFunction(res) {
      this.$buefy.toast.open({
        message: res,
        type: "is-success",
        position: "is-bottom"
      });
    }
  }
}