te<template>
  <div class="moduleFiles">
    <section class="hero is-primary is-bold">
      <div class="hero-body">
        <div class="container">
          <h1 class="title"><code>{{ moduleName }}</code></h1>
        </div>
      </div>
    </section>
    <section>
      <b-tabs>

        <!-- Module SQL Query -->
        <b-tab-item label="SQL" icon="database-plus">
          <b-tooltip label="Create MySQL File">
            <b-button
              icon-left="database-plus"
              type="is-success"
              @click="createMysqlDatabaseTable()"
            >Create MySQL</b-button>
          </b-tooltip>
          <br />
          <br />
          <codemirror v-model="files.moduleSQLQuery" :options="editor.sqlOption" />
        </b-tab-item>

        <!-- Module Routes -->
        <b-tab-item label="Routes" icon="routes">
          <b-field expanded>
            <b-tooltip label="Create Route File">
              <b-button
                icon-left="routes"
                type="is-info"
                @click="createRoutesContent()"
              >Create Routes</b-button>
            </b-tooltip>
          </b-field>
          <codemirror v-model="files.moduleRoutes" :options="editor.phpOption" />
        </b-tab-item>

        <!-- Module Controller -->
        <b-tab-item label="Controller" icon="language-php">
          <section>
            <b-field expanded>
              <b-tooltip label="Create Controller Files">
                <b-button
                  icon-left="language-php"
                  type="is-primary"
                  @click="createControllerContent()"
                >Create Controller</b-button>
              </b-tooltip>
            </b-field>
            <codemirror v-model="files.moduleController" :options="editor.phpOption" />
          </section>
          <section v-if="moduleSettings.apiContent">
            <h3 class="title is-5" style="margin-top: 15px;">API Controller: <code>app\Controllers\API\XXXX_api.php</code></h3>
            <codemirror v-model="files.moduleAPIController" :options="editor.phpOption" />
          </section>
        </b-tab-item>

        <!-- TODO: Module Model -->
        <b-tab-item label="Model" icon="database">
          <b-field expanded>
            <b-tooltip label="Create Model Files">
              <b-button
                icon-left="language-php"
                type="is-primary"
                @click="createModelContent()"
              >Create Model</b-button>
            </b-tooltip>
          </b-field>
          <section>
            <codemirror v-model="files.moduleModel" :options="editor.phpOption" />
          </section>
          <h3 class="title is-5" style="margin-top: 15px;">Model Entities: <code>app\Entities\XXXX.php</code></h3>
          <section>
            <codemirror v-model="files.moduleModelEntities" :options="editor.phpOption" />
          </section>
        </b-tab-item>

        <!-- TODO: Module Views -->
        <b-tab-item label="View" icon="video">
          <b-field expanded>
            <b-tooltip label="Create Views Files">
              <b-button
                icon-left="language-php"
                type="is-primary"
                @click="createViewContent()"
              >Create View</b-button>
            </b-tooltip>
          </b-field>

          <!-- Index/Manage View File -->
          <h3 class="title is-5" style="margin-top: 15px;">Index View: <code>app\Views\xxxx\manage_xxxx.php</code></h3>
          <section>
            <codemirror v-model="files.moduleViewManage" :options="editor.phpOption" />
          </section>

          <!-- Insert View File -->
          <h3 class="title is-5" style="margin-top: 15px;">Insert View: <code>app\Views\xxxx\insert_xxxx.php</code></h3>
          <section>
            <codemirror v-model="files.moduleViewInsert" :options="editor.phpOption" />
          </section>

          <!-- Update View File -->
          <h3 class="title is-5" style="margin-top: 15px;">Update View: <code>app\Views\xxxx\update_xxxx.php</code></h3>
          <section>
            <codemirror v-model="files.moduleViewUpdate" :options="editor.phpOption" />
          </section>
        </b-tab-item>
      </b-tabs>
    </section>
  </div>
</template>

<script>
import { codemirror } from 'vue-codemirror'

// language package
import 'codemirror/mode/sql/sql.js'
import 'codemirror/mode/php/php.js'

// import base style
import 'codemirror/lib/codemirror.css'
// theme css
import 'codemirror/theme/base16-dark.css'

import Dexie from "dexie";

// Import My Class
import GenerateMySQLQuery from "../class/GenerateMySQLQuery.js"
import GenerateRoutes from "../class/GenerateRoutes.js"
import GenerateController from "../class/GenerateController.js"
import GenerateModel from "../class/GenerateModel.js"
import GenerateView from "../class/GenerateView.js"

export default {
  name: "moduleFiels",
  components: {
    codemirror
  },
  data() {
    return {
      moduleName: this.$route.params.module, // Module Name
      // Module Settings: Local Key
      settingsLocalKey: "c4-mg_ModuleSettings-{$_module}",
      // Module Settings
      moduleSettings: {},
      // IndexedDB
      db: false,
      module: {
        tableName: false,
        tableField: false
      },
      // CodeIgniter File Content
      files: {
        moduleSQLQuery: "",
        moduleRoutes: "",
        moduleController: "",
        moduleAPIController: "",
        moduleModel: "",
        moduleModelEntities: "",
        // Module View
        moduleViewManage: "",
        moduleViewInsert: "",
        moduleViewUpdate: "",
      },
      // Editor Codemirror Options
      editor: {
        sqlOption: {
          tabSize: 2,
          styleActiveLine: true,
          lineNumbers: true,
          line: true,
          mode: 'text/x-mysql',
          theme: "base16-dark"
        },
        phpOption: {
          tabSize: 2,
          styleActiveLine: true,
          lineNumbers: true,
          line: true,
          mode: 'application/x-httpd-php',
          theme: "base16-dark"
        }
      }
    };
  },
  methods: {
    /**
     * Open IndexedDB Database
     */
    dbOpenModule() {
      if (
        this.$route.params.module !== undefined &&
        this.$route.params.module !== null
      ) {
        this.db = new Dexie(this.$route.params.module);
        this.db.version(1).stores({
          fields: "++id,name,sort,tableName",
          mTables: "++id,name"
        });
        this.db.open().catch(error => {
          console.error("dbOpenModule -> error", error);
        });
      }
    },

    dbFetchModuleTable() {
      var that = this;
      this.db.mTables
        .where({ id: 0 })
        .first(function(res) {
          if (res === undefined) {
            // Set Module Table Name
            that.module.tableName = that.$route.params.module.toLowerCase();
          } else {
            that.module.tableName = res.name;
          }
        })
        .catch(function(e) {
          console.error(e.stack || e);
        });
    },

    dbFetchModuleField() {
      var that = this;
      if (this.db !== false) {
        this.db.fields
          .orderBy("sort")
          .toArray()
          .then(function(res) {
            that.module.tableField = res;
          })
          .catch(function(e) {
            console.error(e.stack || e);
          });
      }
    },

    /** ______________________________________ Module Settings ________________________________ */

    /**
     * Fetch Module Settings
     */
    fetchModuleSettings() {
      var isSettings = localStorage.getItem(this.settingsLocalKey.replace("{$_module}", this.moduleName.toLocaleLowerCase()));
      if (isSettings) {
        this.moduleSettings = JSON.parse(isSettings);
      }
    },

    /** ______________________________________ Module MySQL Query ________________________________ */

    /**
     * Create MySQL Table Query with Column
     */
    createMysqlDatabaseTable() {
      // var that = this;
      if (
        this.module.tableField !== false &&
        this.module.tableField.length > 0
      ) {

        var run = new GenerateMySQLQuery(this.module.tableField);
        // console.log("createMysqlDatabaseTable -> run", run)

        this.files.moduleSQLQuery = run.generateQuery();

        /**
          CREATE TABLE `visitors` (
            `id` BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
            `platform` ENUM('w','l','m') NOT NULL,
            `date` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            UNIQUE KEY `err` (`err`),
            UNIQUE KEY `person` (`ip`,`date`)
          ) ENGINE=INNODB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;

          CREATE TABLE `yy` (
            `id` int(11) NOT NULL AUTO_INCREMENT,
            `user` int(11) NOT NULL,
            `err` int(11) NOT NULL,
            `eeert` int(11) NOT NULL,
            PRIMARY KEY (`id`),
            UNIQUE KEY `user` (`user`),
            UNIQUE KEY `eeert` (`eeert`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
         */
      }
    },

    /** ______________________________________ Module Routes _____________________________________ */

    /**
     * Create Routes Content
     */
    createRoutesContent() {

      // {@call}: Generate Routes
      var output = new GenerateRoutes({
        "module": this.moduleName,
        "type": (!this.moduleSettings.routeType)? "simple" : this.moduleSettings.routeType, // simple, grouping
        "apiContent": (!this.moduleSettings.apiContent)? false : this.moduleSettings.apiContent,
        "routes": (!this.moduleSettings.simpleRoutes)? false : this.moduleSettings.simpleRoutes,
        "apiRoutes": (!this.moduleSettings.apiRoutes)? false : this.moduleSettings.apiRoutes,
      });

      // Route File: Content
      this.files.moduleRoutes = output.getRoutes();
    },

    /** ______________________________________ Module Controllers _____________________________________ */

    /**
     * Create Controllers Content
     */
    createControllerContent() {
      // this.files.moduleController
      // this.files.moduleAPIController
      // this.moduleSettings.apiContent

      // {@call}: Generate Controller
      var controller = new GenerateController({
        "module": this.moduleName,
        "apiContent": (!this.moduleSettings.apiContent)? false : this.moduleSettings.apiContent,
        "routes": (!this.moduleSettings.simpleRoutes)? false : this.moduleSettings.simpleRoutes,
        "apiRoutes": (!this.moduleSettings.apiRoutes)? false : this.moduleSettings.apiRoutes,
        // Database Data
        "dbTableName": this.module.tableName,
        "dbTableColumn": this.module.tableField,
      });

      // Controller File: Content
      this.files.moduleController = controller.getController()

      // API Controller File: Content
      this.files.moduleAPIController = controller.getAPIController()
    },

    /** ______________________________________ Module Model/Entities _____________________________________ */

    /**
     * Create Model Content
     */
    createModelContent() {

      // Module Database Column Names
      var moduleDBcolumnName = [];

      // Module Table Fields
      this.module.tableField.forEach(column => {
        if (["id", "deleted_at", "password"].indexOf(column.name) === -1) {
          moduleDBcolumnName.push(column.name)
        }
      });

      // {@call}: Generate Model
      var model = new GenerateModel({
        "module": this.moduleName,
        "table": this.module.tableName,
        "tableColumn": moduleDBcolumnName
      });

      // Model File: Content
      this.files.moduleModel = model.getModel()

      // Model Entities File: Content
      this.files.moduleModelEntities = model.getModelEntities()
    },

    /** ______________________________________ Module View _____________________________________ */
    
    /**
     * Create View Content
     */
    createViewContent() {

      // {@call}: Generate View
      var view = new GenerateView({
        "module": this.moduleName,
      });

      // View File: Content
      this.files.moduleViewManage = view.getManageView()
      this.files.moduleViewInsert = view.getInsertView()
      this.files.moduleViewUpdate = view.getUpdateView()
    }

  },
  created() {
    this.dbOpenModule();
    this.fetchModuleSettings();
  },
  mounted() {
    this.dbFetchModuleTable();
    this.dbFetchModuleField();
  }
};
</script>
