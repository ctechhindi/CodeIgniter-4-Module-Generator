<template>
  <div class="modules">
    <section class="hero is-info is-bold">
      <div class="hero-body">
        <div class="container">
          <h1 class="title">Generate Module</h1>
          <h2
            class="subtitle"
          >First of all, we have to define the name of the Module by which name we want to create the module.</h2>
        </div>
      </div>
    </section>
    <section class="section">
      <!-- Create Module -->
      <div class="container">
        <div class="columns">
          <div class="column">
            <article class="media">
              <div class="media-left is-hidden-mobile">
                <p class="subtitle">
                  <b-icon icon="playlist-plus"></b-icon>&nbsp;
                  <strong>Modules List</strong>
                </p>
              </div>
              <div class="media-content"></div>
              <div class="media-right">
                <b-field>
                  <b-input placeholder="Enter Module Name" type="text" v-model="moduleName"></b-input>
                  <p class="control">
                    <button
                      class="button is-success"
                      @click="createModule"
                      title="Insert New Module"
                    >
                      <b-icon icon="playlist-plus"></b-icon>&nbsp;
                      <span>Insert</span>
                    </button>
                  </p>
                </b-field>
              </div>
            </article>
          </div>
        </div>
      </div>
      <!-- Create Module /END -->

      <!-- Module List -->
      <div class="container" v-if="db.allTables.length > 0">
        <div class="columns">
          <div class="column">
            <table class="table is-bordered is-narrow is-fullwidth">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Module Name</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(data, index) in db.allTables" :key="index">
                  <td>{{ index + 1 }}</td>
                  <td>{{ data }}</td>
                  <td style="width: 250px;">
                    <b-tooltip label="Open Module">
                      <b-button
                        icon-right="pencil"
                        type="is-info"
                        tag="router-link"
                        :to="{ name: 'ModuleField', params: { module:data }}"
                      ></b-button>
                    </b-tooltip>&nbsp;
                    <!-- Module Fields -->
                    <b-tooltip label="Module Files" type="is-primary">
                      <b-button icon-right="file" type="is-primary" tag="router-link" :to="{ name: 'ModuleFiles', params: { module:data }}"></b-button>
                    </b-tooltip>&nbsp;
                    <!-- Module Settings -->
                    <b-tooltip label="Module Settings" type="is-warning">
                      <b-button icon-right="settings" type="is-warning" tag="router-link" :to="{ name: 'ModuleSettings', params: { module:data }}"></b-button>
                    </b-tooltip>&nbsp;
                    <!-- Module File Export in the Zip File -->
                    <b-tooltip label="Module File Export in the Zip File" type="is-info">
                      <b-button icon-right="zip-box" type="is-info" @click="exportZipFile(data)"></b-button>
                    </b-tooltip>&nbsp;
                    <!-- Module Delete -->
                    <b-tooltip label="Delete Module" type="is-danger">
                      <b-button icon-right="delete" type="is-danger" @click="deleteModule(data)"></b-button>
                    </b-tooltip>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div class="container" v-else>
        <div class="hero-body has-text-centered">
          <h1 class="title has-text-danger">No Module exists.</h1>
          <h2 class="subtitle">First we have to create the Module.</h2>
        </div>
      </div>
      <!-- Module List /END -->
    </section>
  </div>
</template>

<script>
import Dexie from "dexie";
// var _ = require('lodash');

// https://stuk.github.io/jszip/
var JSZip = require("jszip");

import globalMethod from "./globalMethod.js";

// Import My Class
import GenerateMySQLQuery from "../class/GenerateMySQLQuery.js"
import GenerateRoutes from "../class/GenerateRoutes.js"
import GenerateController from "../class/GenerateController.js"
import GenerateModel from "../class/GenerateModel.js"
import GenerateView from "../class/GenerateView.js"

export default {
  name: "modules",
  mixins: [globalMethod],
  data() {
    return {
      // New Module Name
      moduleName: "",
      // IndexedDB Object
      db: {
        module: false,
        allTables: []
      },
      // Module Settings: Local Key [ModuleSettings.vue, Modules.vue]
      settingsLocalKey: "c4-mg_ModuleSettings-{$_module}",
    };
  },
  methods: {
    /**
     * Create New Module
     */
    createModule() {
      // var that = this;
      if (this.moduleName === "") return false;

      // Check Space in the module Name
      if (/\s/g.test(this.moduleName)) {
        return this.toastMsg("Do not allow space in module name.", "is-danger");
      }

      // Check module already exists
      if (this.db.allTables.indexOf(this.moduleName) !== -1) {
        return this.toastMsg("This module name already exists.", "is-danger");
      }

      // {@call}
      this.createModulesTable().then(
        res => {
          this.thenFunction(res);
          this.fetchAllModules();
        },
        error => {
          this.catchFunction(error);
        }
      );
    },

    /**
     * Delete Module Database in the IndexedDB
     */
    deleteModule(tableName) {
      var that = this;
      this.$buefy.dialog.confirm({
        title: "Delete",
        message:
          "Are you sure you want to <b>delete</b> this module? This action cannot be undone.",
        confirmText: "Delete",
        type: "is-danger",
        hasIcon: true,
        onConfirm: function() {
          that.deleteModuleTable(tableName).then(
            res => {
              // Remove Global Module Settings in the LocalStorage
              localStorage.removeItem(that.settingsLocalKey.replace("{$_module}", tableName.toLocaleLowerCase()));
              that.thenFunction(res);
              that.fetchAllModules();
            },
            error => {
              that.catchFunction(error);
            }
          );
        }
      });
    },

    /**
     * Fetch All Module
     */
    fetchAllModules() {
      this.fetchModules().then(
        res => {
          this.db.allTables = res;
        },
        error => {
          this.catchFunction(error);
        }
      );
    },

    /**___________________ Dexie Function ___________________________*/

    /**
     * Create IndexedDB `modules` Table
     */
    createModulesTable: function() {
      var that = this;
      return new Promise(function(resolve, reject) {
        if (that.moduleName === "") {
          reject(new Error("Please Enter Module Name"));
        }

        that.db.module = new Dexie(that.moduleName);
        that.db.module.version(1).stores({
          fields: "++id,name,sort,tableName",
          mTables: "++id,name"
        });

        that.db.module
          .open()
          .then(function() {
            resolve(that.moduleName + " module successful created.");
          })
          .catch(function(err) {
            reject(new Error("Failed to open db: " + (err.stack || err)));
          });
      });
    },

    /**___________________ Module File Export in the Zip File ___________________________*/

    /**
     * Fetch Module Settings
     */
    fetchModuleSettings(module) {
      var isSettings = localStorage.getItem(this.settingsLocalKey.replace("{$_module}", module.toLocaleLowerCase()));
      if (isSettings) {
        return JSON.parse(isSettings);
      }
      return false
    },
    
    /**
     * Module File Export in the Zip File
     */
    exportZipFile(module) {

      var moduleData = {
        dbTableName: module.toLocaleLowerCase(),
        dbTableField: null,
        // File Content
        mysqlContent: null,
        routeContent: null,
        controllerContent: null,
        controllerAPIContent: null,
        modelContent: null,
        modelEntitiesContent: null,
        viewManageContent: null,
        viewInsertContent: null,
        viewUpdateContent: null,
      }

      /**
       * Fetch Module Settings
       */
      var moduleSettings = this.fetchModuleSettings(module)

      // Dexie
      var db = new Dexie(module);
      db.version(1).stores({
        fields: "++id,name,sort,tableName",
        mTables: "++id,name"
      });
      
      db.open().catch(error => {
        console.error("dbOpenModule -> error", error);
      });

      // Fetch Custom Module Database Table Name
      db.mTables.where({ id: 0 }).first(function(res) {
        if (res) {
          moduleData.dbTableName = res.name;
        }

        // Module Field Names
        db.fields.orderBy("sort").toArray().then(function(res) {
          moduleData.dbTableField = res

          /**
           * MySQL Content
           */
          var mysql = new GenerateMySQLQuery(moduleData.dbTableField);
          moduleData.mysqlContent = mysql.generateQuery();

          /**
           * Routes Content
           */
          var route = new GenerateRoutes({
            "module": module,
            "type": (!moduleSettings.routeType)? "simple" : moduleSettings.routeType, // simple, grouping
            "apiContent": (!moduleSettings.apiContent)? false : moduleSettings.apiContent,
            "routes": (!moduleSettings.simpleRoutes)? false : moduleSettings.simpleRoutes,
            "apiRoutes": (!moduleSettings.apiRoutes)? false : moduleSettings.apiRoutes,
          });
          moduleData.routeContent = route.getRoutes();

          /**
           * Controller Content
           */
          var controller = new GenerateController({
            "module": module,
            "apiContent": (!moduleSettings.apiContent)? false : moduleSettings.apiContent,
            "routes": (!moduleSettings.simpleRoutes)? false : moduleSettings.simpleRoutes,
            "apiRoutes": (!moduleSettings.apiRoutes)? false : moduleSettings.apiRoutes,
            // Database Data
            "dbTableName": moduleData.dbTableName,
            "dbTableColumn": moduleData.dbTableField,
          });
          moduleData.controllerContent = controller.getController()
          moduleData.controllerAPIContent = controller.getAPIController()

          /**
           * Model Content
           */
          var moduleDBcolumnName = []; // Module Database Column Names
          moduleData.dbTableField.forEach(column => {
            if (["id", "deleted_at", "password"].indexOf(column.name) === -1) {
              moduleDBcolumnName.push(column.name)
            }
          });
          var model = new GenerateModel({
            "module": module,
            "table": moduleData.dbTableName,
            "tableColumn": moduleDBcolumnName
          });
          moduleData.modelContent = model.getModel()
          moduleData.modelEntitiesContent = model.getModelEntities()

          /**
           * View Content
           */
          var view = new GenerateView({
            "module": module,
          });
          moduleData.viewManageContent = view.getManageView()
          moduleData.viewInsertContent = view.getInsertView()
          moduleData.viewUpdateContent = view.getUpdateView()

          // console.log(moduleData);

          /**
           * Create Zip File
           */
          var zip = new JSZip();
          zip.file("module_sql.sql", moduleData.mysqlContent);
          zip.file("Routes.php", moduleData.routeContent);
          zip.file("Controllers/" + module + ".php", moduleData.controllerContent);
          zip.file("Controllers/API/" + module + "_api.php", moduleData.controllerAPIContent);
          zip.file("Models/" + module.toLocaleLowerCase() + "Model.php", moduleData.modelContent);
          zip.file("Entities/" + module + ".php", moduleData.modelEntitiesContent);
          zip.file("Views/" + module.toLocaleLowerCase() + "/manage_" + module.toLocaleLowerCase() + ".php", moduleData.viewManageContent);
          zip.file("Views/" + module.toLocaleLowerCase() + "/insert_" + module.toLocaleLowerCase() + ".php", moduleData.viewInsertContent);
          zip.file("Views/" + module.toLocaleLowerCase() + "/update_" + module.toLocaleLowerCase() + ".php", moduleData.viewUpdateContent);

          zip.generateAsync({ type:"base64" }).then(function (base64) {
            location.href="data:application/zip;base64," + base64;
          });

        }).catch(function(e) {
          console.error(e.stack || e);
        });
      }).catch(function(e) {
        console.error(e.stack || e);
      });
    }
  },

  watch: {
    moduleName: function(newVal) {
      if (newVal.length === 1) {
        this.moduleName = newVal.toUpperCase();
      }
    }
  },

  created() {
    this.fetchAllModules();
  }
};
</script>
