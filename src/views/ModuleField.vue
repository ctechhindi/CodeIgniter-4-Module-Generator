<template>
  <div class="ModuleField">
    <!-- Loading -->
    <b-loading :is-full-page="true" :active.sync="isFullLoading" :can-cancel="false"></b-loading>

    <section class="hero is-warning is-bold">
      <div class="hero-body">
        <div class="container">
          <h1 class="title">Insert Module Fields</h1>
          <h2
            class="subtitle"
          >First of all, we have to define the name of the Module by which name we want to create the module.</h2>
        </div>
      </div>
    </section>
    
    <section class="section">
      <div class="container is-fullhd">
        <div class="columns">
          <div class="column" v-if="fieldDB.length > 0">
            <!-- table-container -->
            <div class>
              <table class="table is-bordered is-narrow is-hoverable is-fullwidth">
                <thead class="has-background-dark">
                  <tr>
                    <th class="has-text-white">Action</th>
                    <th class="has-text-white">Field Name</th>
                    <th class="has-text-white">Type</th>
                    <th class="has-text-white">Length</th>
                    <th class="has-text-white">Default Value</th>
                    <th class="has-text-white">Validations</th>
                  </tr>
                </thead>
                <draggable
                  tag="tbody"
                  v-model="fieldDB"
                  handle=".handle"
                  @start="drag=true"
                  @end="drag=false"
                >
                  <tr
                    v-for="(data, index) in fieldDB"
                    :key="index.id"
                    @click="activeFieldDBIndex = index"
                  >
                    <td style="width: 100px;">
                      <b-button
                        type="is-warning"
                        size="is-small"
                        icon-right="cursor-move"
                        class="handle"
                        style="cursor: all-scroll;"
                      ></b-button>&nbsp;
                      <b-button
                        type="is-danger"
                        size="is-small"
                        icon-right="delete"
                        @click="deleteModuleField(index)"
                      ></b-button>
                    </td>
                    <td>
                      <b-field class="dbfield">
                        <b-tooltip label="Field Name For Database Table" position="is-right">
                          <b-input
                            size="is-small"
                            v-model="data.name"
                            @input="dbfieldOnChange($event, index)"
                            placeholder="Field Name for DB Table"
                          ></b-input>
                        </b-tooltip>
                      </b-field>
                      <b-field v-if="data.label !== false">
                        <b-tooltip label="Field Label For HTML Form" position="is-right">
                          <b-input size="is-small" v-model="data.label" placeholder="Field Label"></b-input>
                        </b-tooltip>
                      </b-field>
                    </td>
                    <!-- Field Database Table Column Type -->
                    <td>
                      <b-field>
                        <!-- MySQL Data Type -->
                        <b-tooltip label="Field Database Type" position="is-left">
                          <b-autocomplete
                            v-model="data.dbTypeSearch"
                            :data="getDBFieldType"
                            size="is-small"
                            :open-on-focus="true"
                            clearable
                            @select="option => data.dbType = option"
                            placeholder="Database Type"
                          >
                            <template slot="empty">No results found</template>
                          </b-autocomplete>
                        </b-tooltip>
                      </b-field>
                      <!-- Form Type -->
                      <b-field v-show="data.formType">
                        <b-tooltip label="Field Form Type" position="is-left">
                          <b-autocomplete
                            v-model="data.formTypeSearch"
                            :data="getFormFieldType"
                            size="is-small"
                            :open-on-focus="true"
                            clearable
                            @select="option => data.formType = option"
                            placeholder="Form Type"
                          >
                            <template slot="empty">No results found</template>
                          </b-autocomplete>
                        </b-tooltip>
                      </b-field>
                    </td>
                    <!-- Length and Other Options -->
                    <td>
                      <b-field>
                        <b-tooltip label="Field Database Length/Values">
                          <b-input v-model="data.dbLength" size="is-small"></b-input>
                        </b-tooltip>
                      </b-field>
                      <b-field v-if="data.dbOtherOption !== false">
                        <b-checkbox-button
                          v-model="data.dbOtherOption"
                          native-value="AUTO INCREMENT"
                          size="is-small"
                          type="is-danger"
                        >
                          <span>AUTO INCREMENT</span>
                        </b-checkbox-button>
                        <b-checkbox-button
                          v-model="data.dbOtherOption"
                          native-value="Unique"
                          @input="selectedUniqueColumn($event, index)"
                          size="is-small"
                          type="is-success"
                        >
                          <span>Unique</span>
                        </b-checkbox-button>
                        <b-checkbox-button
                          v-model="data.dbOtherOption"
                          size="is-small"
                          native-value="Primary"
                        >Primary</b-checkbox-button>
                      </b-field>
                    </td>
                    <!-- Defatult Value Types -->
                    <td>
                      <b-field>
                        <b-tooltip label="Field Database Default Value" position="is-left">
                          <b-select
                            placeholder="Select a name"
                            v-model="data.dbdefaultValueType"
                            size="is-small"
                            @input="selectedDefaultValueType($event, index)"
                          >
                            <option
                              v-for="(option, index) in dbDefaultValues"
                              :value="option"
                              :key="index"
                            >{{ option }}</option>
                          </b-select>
                        </b-tooltip>
                      </b-field>
                      <!-- Default Value -->
                      <b-field>
                        <b-tooltip label="Enter Default Value" position="is-left">
                          <b-input
                            v-if="data.dbdefaultValueType === 'As Defined'"
                            v-model="data.dbdefaultValue"
                            placeholder="Enter Default Value"
                            size="is-small"
                          ></b-input>
                        </b-tooltip>
                      </b-field>
                    </td>
                    <!-- Validation Rules -->
                    <td style="width: 430px;">
                      <b-tooltip
                        label="Add Form Validation Rule"
                        v-if="data.validationRules !== false"
                      >
                        <b-button
                          style="margin-bottom: 5px;"
                          @click="insertValidationRule(index)"
                          type="is-info"
                          size="is-small"
                          icon-right="plus"
                        ></b-button>
                      </b-tooltip>
                      <b-field v-for="(rule, index2) in data.validationRules" :key="index2">
                        <div @click="activeFieldDBValidationIndex = index2">
                          <b-tooltip label="Choice Validation Rule" position="is-left">
                            <b-autocomplete
                              v-model="rule.nameSearch"
                              :data="getValidationRules"
                              size="is-small"
                              :open-on-focus="true"
                              @select="option => rule.name = option"
                              @input="selectedValidationRule($event, index, index2)"
                              clearable
                              placeholder="Choice Validation Rule"
                              style="width: 225px;"
                            >
                              <template slot="empty">No results found</template>
                            </b-autocomplete>
                          </b-tooltip>
                          <b-tooltip label="Enter Validation Value">
                            <b-input
                              size="is-small"
                              v-model="rule.value"
                              placeholder="Enter Validation Value"
                            ></b-input>
                          </b-tooltip>
                          <b-tooltip label="Delete Rule" type="is-danger">
                            <b-button
                              type="is-danger"
                              size="is-small"
                              icon-right="delete"
                              @click="deleteValidationRule(index, index2)"
                            ></b-button>
                          </b-tooltip>
                        </div>
                      </b-field>
                    </td>
                  </tr>
                </draggable>
              </table>
            </div>
          </div>
          <!-- Module Fields Not Found -->
          <div class="column" v-else>
            <h1
              class="title is-6 has-text-danger"
            >You can add Module's field by clicking on the button below.</h1>
          </div>
        </div>
        <!-- Action -->
        <div class="columns">
          <div class="column">
            <b-field grouped>
              <p class="control">
                <b-tooltip label="Set Module Database Table Name">
                  <b-field>
                    <b-input placeholder="Table Name" v-model="moduleTableName"></b-input>
                    <p class="control">
                      <b-button
                        @click="updateModuleTableName()"
                        type="is-success"
                        icon-right="check"
                      ></b-button>
                    </p>
                  </b-field>
                </b-tooltip>
              </p>
              <p class="control">
                <b-tooltip label="Insert Table Columns">
                  <b-button @click="insertModuleField()" type="is-info" icon-right="plus"></b-button>
                </b-tooltip>
              </p>
              <p class="control">
                <b-dropdown aria-role="list" hoverable position="is-top-right">
                  <button class="button is-primary" slot="trigger">
                    <b-icon icon="playlist-plus"></b-icon>
                  </button>
                  <b-dropdown-item aria-role="listitem" @click="insertSpecialField('id')">id</b-dropdown-item>
                  <b-dropdown-item
                    aria-role="listitem"
                    @click="insertSpecialField('is_public')"
                  >is_public</b-dropdown-item>
                  <b-dropdown-item
                    aria-role="listitem"
                    @click="insertSpecialField('is_delete')"
                  >is_delete</b-dropdown-item>
                  <b-dropdown-item
                    aria-role="listitem"
                    @click="insertSpecialField('created_at')"
                  >created_at</b-dropdown-item>
                  <b-dropdown-item
                    aria-role="listitem"
                    @click="insertSpecialField('updated_at')"
                  >updated_at</b-dropdown-item>
                  <b-dropdown-item
                    aria-role="listitem"
                    @click="insertSpecialField('deleted_at')"
                  >deleted_at</b-dropdown-item>
                </b-dropdown>
              </p>
              <p class="control" v-if="fieldDB.length > 0">
                <b-button
                  @click="saveModuleField()"
                  type="is-success"
                  icon-left="content-save"
                >&nbsp; Save</b-button>
              </p>
              <p class="control" v-if="fieldDB.length > 0">
                <b-button
                  @click="clearModuleField()"
                  type="is-danger"
                  icon-left="delete"
                >&nbsp; Delete</b-button>
              </p>
            </b-field>
          </div>
        </div>
      </div>
    </section>

    <!-- Model: Unique Column -->
    <b-modal :active.sync="isOpenUniqueModel" :width="640" scroll="keep">
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">Add Index</p>
        </header>
        <section class="modal-card-body">
          <b-field label="Index Name">
            <b-input v-model="modelUniqueData.indexName"></b-input>
          </b-field>
          <b-field label="Index Choice">
            <b-select placeholder="Index Choice" v-model="modelUniqueData.indexChoice" expanded>
              <option value="unique">Unique</option>
            </b-select>
          </b-field>
          <table class="table is-bordered is-striped is-narrow is-hoverable is-fullwidth">
            <thead>
              <tr>
                <th>Column</th>
                <th>Size</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(data, index) in modelUniqueData.columns" :key="index">
                <td>
                  <b-select v-model="data.name" size="is-small" expanded>
                    <option :value="data.name">{{ data.name }}</option>
                  </b-select>
                </td>
                <td style="width: 300px;">
                  <b-input type="number" size="is-small" v-model="data.size"></b-input>
                </td>
              </tr>
            </tbody>
          </table>
        </section>
        <footer class="modal-card-foot">
          <button class="button is-primary" @click="saveUniqueColumnData">Go</button>
        </footer>
      </div>
    </b-modal>

    <!-- Model: Choice Single or Composite index -->
    <b-modal :active.sync="isOpenChoiceUniqueModel" :width="640" scroll="keep">
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">Add Index</p>
        </header>
        <section class="modal-card-body">
          <div class="block">
            <b-radio v-model="choiceUniqueType"
              name="choiceUniqueType"
              native-value="single">
              Create single-column index
            </b-radio>
            <b-radio v-model="choiceUniqueType"
              name="choiceUniqueType"
              native-value="composite">
              Create composite index
            </b-radio>
            <section v-if="choiceUniqueType === 'composite'">
              <h3 class="title is-6" style="margin: 17px 0px 17px;">Select Composite Unique Index</h3>
              <div class="field" v-for="(data, index) in totalUniqueColName" :key="index">
                <b-radio name="compositeUniqueCol" v-model="choiceCompositeUniqueColIndex" :native-value="data.index">{{ data.name }}</b-radio>
              </div>
            </section>
          </div>
        </section>
        <footer class="modal-card-foot">
          <button class="button is-primary" @click="openUniqueColumnModel">Go</button>
        </footer>
      </div>
    </b-modal>
  </div>
</template>

<script>
/**
 * Database Table Requried Fields
 * --------------------------
 * Table Name
 * Field Name
 * Type
 * Length
 * Default Value Type
 * Default Value
 * Collation
 * Attributes
 * Comments
 * Unique
 * Primary
 * Auto Increment
 */

/**
 * PHP Form Requried Fields
 * --------------------------
 * Field Label
 * Type
 * Validations
 */

import draggable from "vuedraggable";
import Dexie from "dexie";

export default {
  name: "ModuleField",
  components: {
    draggable
  },
  data() {
    return {
      /**
       * MySQL Settings
       */
      dbColumnType: [
        "int",
        "varchar",
        "text",
        "date",
        "tinyint",
        "smallint",
        "mediumint",
        "int",
        "bigint",
        "decimal",
        "float",
        "double",
        "real",
        "bit",
        "boolean",
        "serial",
        "date",
        "datetime",
        "timestamp",
        "time",
        "year",
        "char",
        "varchar",
        "tinytext",
        "text",
        "mediumtext",
        "longtext",
        "binary",
        "varbinary",
        "tinyblob",
        "blob",
        "mediumblob",
        "longblob",
        "enum",
        "set",
        "geometry",
        "point",
        "linestring",
        "polygon",
        "multipoint",
        "multilinestring",
        "multipolygon",
        "geometrycollection",
        "json"
      ],
      dbColumnCollation: ["utf8_bin"],
      dbDefaultValues: ["None", "NULL", "CURRENT TIMESTAMP", "As Defined"],

      /**
       * CodeIgniter Validation Rules
       */
      validationRules: [
        "required",
        "required_with",
        "required_without",
        "in_list",
        "integer",
        "if_exist",
        "max_length",
        "min_length",
        "numeric",
        "alpha",
        "alpha_space",
        "alpha_dash",
        "alpha_numeric",
        "alpha_numeric_space",
        "alpha_numeric_punct",
        "decimal",
        "differs",
        "exact_length",
        "greater_than",
        "greater_than_equal_to",
        "hex",
        "is_natural",
        "is_natural_no_zero",
        "is_not_unique",
        "is_unique",
        "less_than",
        "less_than_equal_to",
        "matches",
        "regex_match",
        "permit_empty",
        "string",
        "timezone",
        "valid_base64",
        "valid_json",
        "valid_email",
        "valid_emails",
        "valid_ip",
        "valid_url",
        "valid_date",
        "valid_cc_number",
        "uploaded",
        "max_size",
        "max_dims",
        "mime_in",
        "ext_in",
        "is_image"
      ],

      /**
       * Field Input Type
       */
      formType: [
        "text",
        "number",
        "password",
        "radio",
        "checkbox",
        "color",
        "date",
        "email",
        "file",
        "hidden",
        "range",
        "search",
        "tel",
        "time",
        "url",
        "week"
      ],

      /**
       * Module Fields
       * [Set By Default Module Database Fields: id, created_at, updated_at, deleted_at, is_public, is_delete]
       */
      activeFieldDBIndex: 0, // This Variable for Buefy Autocomplete Field
      activeFieldDBValidationIndex: 0, // This Variable for Buefy Autocomplete Field
      moduleTableName: "", // Set Module Table Name
      fieldDB: [],

      // [Dexie] IndexedDB Module Table and Fields
      dbTable: false,
      dbTableField: false,

      // Full Page Loading
      isFullLoading: false,

      // Model: Unique MySQL Column
      isOpenUniqueModel: false,
      activeUniqueColIndex: false,
      modelUniqueData: false,
      // Model: Choice Single or Composite index
      isOpenChoiceUniqueModel: false,
      choiceUniqueType: "single", // [single, composite]
      choiceCompositeUniqueColIndex: "",
      // Total Unique Column Names
      totalUniqueColName: [],
    };
  },

  computed: {
    getDBFieldType() {
      if (
        this.fieldDB[this.activeFieldDBIndex] !== undefined &&
        this.fieldDB[this.activeFieldDBIndex].dbTypeSearch !== undefined
      ) {
        return this.dbColumnType.filter(option => {
          return (
            option
              .toString()
              .toLowerCase()
              .indexOf(
                this.fieldDB[this.activeFieldDBIndex].dbTypeSearch.toLowerCase()
              ) >= 0
          );
        });
      }
      return this.dbColumnType;
    },

    getFormFieldType() {
      if (
        this.fieldDB[this.activeFieldDBIndex] !== undefined &&
        this.fieldDB[this.activeFieldDBIndex].formTypeSearch !== undefined
      ) {
        return this.formType.filter(option => {
          return (
            option
              .toString()
              .toLowerCase()
              .indexOf(
                this.fieldDB[
                  this.activeFieldDBIndex
                ].formTypeSearch.toLowerCase()
              ) >= 0
          );
        });
      }
      return this.formType;
    },

    getValidationRules() {
      if (this.fieldDB[this.activeFieldDBIndex] !== undefined) {
        if (
          this.fieldDB[this.activeFieldDBIndex].validationRules !== undefined
        ) {
          if (
            this.fieldDB[this.activeFieldDBIndex].validationRules[
              this.activeFieldDBValidationIndex
            ] !== undefined
          ) {
            if (
              this.fieldDB[this.activeFieldDBIndex].validationRules[
                this.activeFieldDBValidationIndex
              ].nameSearch !== undefined
            ) {
              return this.validationRules.filter(option => {
                return (
                  option
                    .toString()
                    .toLowerCase()
                    .indexOf(
                      this.fieldDB[this.activeFieldDBIndex].validationRules[
                        this.activeFieldDBValidationIndex
                      ].nameSearch.toLowerCase()
                    ) >= 0
                );
              });
            }
          }
        }
      }
      return this.validationRules;
    }
  },

  methods: {
    /** ______________________________________ IndexedDB _____________________________________ */

    /**
     * OPEN: Module Field Table
     */
    dbOpenModuleField() {
      if (
        this.$route.params.module !== undefined &&
        this.$route.params.module !== null
      ) {
        const moduleName = this.$route.params.module;

        this.dbTableField = new Dexie(moduleName);
        this.dbTableField.version(1).stores({
          fields: "++id,name,sort,tableName",
          mTables: "++id,name"
        });
        this.dbTableField.open().catch(error => {
          console.error("saveModuleField -> error", error);
        });
      }
    },

    /**
     * Update Module Database Table Name
     */
    updateModuleTableName() {
      var that = this;
      this.dbTableField.mTables
        .put({ name: this.moduleTableName, id: 0 })
        .then(function() {
          that.$buefy.toast.open({
            duration: 5000,
            message: `Module Database Table Name has been Updated.`,
            position: "is-bottom",
            type: "is-success"
          });
        })
        .catch(function(e) {
          console.error("updateModuleTableName -> e", e);
        });
    },

    /**
     * Fetch Module Table
     */
    dbFetchModuleTable() {
      var that = this;
      this.dbTableField.mTables
        .where({ id: 0 })
        .first(function(res) {
          if (res === undefined) {
            // Set Module Table Name
            that.moduleTableName = that.$route.params.module.toLowerCase();
          } else {
            that.moduleTableName = res.name;
          }
        })
        .catch(function(e) {
          console.error(e.stack || e);
        });
    },

    /**
     * [Promise]: Fetch Module Field's
     */
    dbFetchModuleField() {
      return new Promise((resolve, reject) => {
        if (this.dbTableField !== false) {
          this.dbTableField.fields
            .orderBy("sort")
            .toArray()
            .then(function(res) {
              resolve({data: res, message: "Module Field Data Found."});
            })
            .catch(function(e) {
              reject(e.stack || e);
              console.error(e.stack || e);
            });
        } else {
          reject("Module Field Data Not Found!");
        }
      });
    },

    /**
     * SAVE: Module Database/Form Fields
     */
    saveModuleField() {
      var that = this;
      if (this.dbTableField !== false) {
        // const moduleName = this.$route.params.module;

        this.dbTableField.fields.clear().then(function() {
          if (that.fieldDB !== undefined && that.fieldDB.length > 0) {
            that.fieldDB.forEach(function(item, index) {
              item.sort = index;
              item.tableName = that.moduleTableName;
              that.dbTableField.fields.add(item).catch(function(e) {
                console.error("saveModuleField -> e", e);
              });
            });

            that.$buefy.toast.open({
              duration: 5000,
              message: `Module Database Field has been Saved.`,
              position: "is-bottom",
              type: "is-success"
            });
          }
        });
      }
    },

    /**
     * Clear Module Database/Form Fields
     */
    clearModuleField() {
      var that = this;
      this.$buefy.dialog.confirm({
        title: "Delete",
        message:
          "Are you sure you want to <b>delete</b> module all fields? This action cannot be undone.",
        confirmText: "Delete",
        type: "is-danger",
        hasIcon: true,
        onConfirm: function() {
          that.dbTableField.fields
            .clear()
            .then(function() {
              that.$buefy.toast.open({
                message: "Module Field has been deleted.",
                type: "is-success",
                position: "is-bottom"
              });

              that.dbFetchModuleField()
              .then(res => {
                that.fieldDB = res.data;
                that.isFullLoading = false;
              })
              .catch(err => {
                console.error(err);
                that.isFullLoading = false;
              });
            })
            .catch(function(e) {
              console.error("saveModuleField -> e", e);
            });
        }
      });
    },

    /** ______________________________________ Module Field _____________________________________ */

    /**
     * Insert Module Field
     */
    insertModuleField() {
      if (this.fieldDB !== undefined) {
        var defaultField = {
          name: "", // Field name small character
          label: "", // Field name Camel Case character
          dbTypeSearch: "", // [TEMP] Search Value
          dbType: "",
          formTypeSearch: "", // [TEMP] Search Value
          formType: "text",
          dbLength: 20,
          // AUTO INCREMENT, Unique, Primary
          dbOtherOption: [],
          // Unique Column: Index [UNIQUE KEY `person` (`ip`,`date`)]
          uniqueColIndex: false,
          dbdefaultValueType: "None",
          dbdefaultValue: "",
          dbCollation: "",
          dbAttributes: "",
          dbComments: "",
          // Validation Rules
          validationRules: [
            {
              nameSearch: "required", // [TEMP] Search Value
              name: "required",
              value: ""
            }
          ]
        };

        this.fieldDB.push(defaultField);
      }
    },

    /**
     * Insert MySQL Special Field/Column
     * ---------------------------------
     * [id, is_public, is_delete, created_at, updated_at, deleted_at]
     */
    insertSpecialField(fieldName) {
      var defaultField = {
        name: "", // Field name small character
        label: "", // Field name Camel Case character
        dbTypeSearch: "", // [TEMP] Search Value
        dbType: "",
        formTypeSearch: "", // [TEMP] Search Value
        formType: "",
        dbLength: 20,
        // AUTO INCREMENT, Unique, Primary
        dbOtherOption: [],
        // Unique Column: Index [UNIQUE KEY `person` (`ip`,`date`)]
        uniqueColIndex: false,
        dbdefaultValueType: "None",
        dbdefaultValue: "",
        dbCollation: "",
        dbComments: "",
        // Validation Rules
        validationRules: [
          {
            nameSearch: "required", // [TEMP] Search Value
            name: "required",
            value: ""
          }
        ]
      };

      // id, is_public, is_delete, created_at, updated_at, deleted_at
      if (fieldName === "id") {
        defaultField.name = "id";
        defaultField.label = false;
        defaultField.dbTypeSearch = "int";
        defaultField.dbType = "int";
        defaultField.formType = false;
        defaultField.dbLength = 20;
        defaultField.dbOtherOption = ["AUTO INCREMENT", "Primary"];
        defaultField.validationRules = false;
      } else if (fieldName === "is_public") {
        defaultField.name = "is_public";
        defaultField.label = false;
        defaultField.dbTypeSearch = "tinyint";
        defaultField.dbType = "tinyint";
        defaultField.formType = false;
        defaultField.dbLength = 4;
        defaultField.dbOtherOption = false;
        defaultField.validationRules = false;
        defaultField.dbdefaultValueType = "As Defined";
        defaultField.dbdefaultValue = 0;
      } else if (fieldName === "is_delete") {
        defaultField.name = "is_delete";
        defaultField.label = false;
        defaultField.dbTypeSearch = "tinyint";
        defaultField.dbType = "tinyint";
        defaultField.formType = false;
        defaultField.dbLength = 4;
        defaultField.dbOtherOption = false;
        defaultField.validationRules = false;
        defaultField.dbdefaultValueType = "As Defined";
        defaultField.dbdefaultValue = 0;
      } else if (fieldName === "created_at") {
        defaultField.name = "created_at";
        defaultField.label = false;
        defaultField.dbTypeSearch = "int";
        defaultField.dbType = "int";
        defaultField.formType = false;
        defaultField.dbLength = 20;
        defaultField.dbOtherOption = false;
        defaultField.validationRules = false;
      } else if (fieldName === "updated_at") {
        defaultField.name = "updated_at";
        defaultField.label = false;
        defaultField.dbTypeSearch = "int";
        defaultField.dbType = "int";
        defaultField.formType = false;
        defaultField.dbLength = 20;
        defaultField.dbOtherOption = false;
        defaultField.validationRules = false;
      } else if (fieldName === "deleted_at") {
        defaultField.name = "deleted_at";
        defaultField.label = false;
        defaultField.dbTypeSearch = "int";
        defaultField.dbType = "int";
        defaultField.formType = false;
        defaultField.dbOtherOption = false;
        defaultField.dbLength = 20;
        defaultField.validationRules = false;
      }

      this.fieldDB.push(defaultField);
    },

    /**
     * Delete Module Field
     */
    deleteModuleField(index) {
      if (this.fieldDB[index] !== undefined && this.fieldDB[index] !== null) {
        this.fieldDB.splice(index, 1);
      }
    },

    /**
     * [Onchange]
     * ---------------------------
     * Field Form Input Label
     */
    dbfieldOnChange(val, index) {
      if (this.fieldDB[index] !== undefined && this.fieldDB[index] !== null) {
        if (this.fieldDB[index].label !== false) {
          this.fieldDB[index].label = val.replace("_", " ").ucwords();
        }
      }
    },

    /**
     * [Onchange]: Field Default Value Type
     */
    selectedDefaultValueType(val, index) {
      if (val === "CURRENT TIMESTAMP") {
        if (
          this.fieldDB[index] !== undefined &&
          this.fieldDB[index].dbType !== undefined
        ) {
          // Change Column Type
          this.fieldDB[index].dbTypeSearch = "timestamp";
          this.fieldDB[index].dbType = "timestamp";
          // Change Column Length
          this.fieldDB[index].dbLength = "";
        }
      }
    },

    /**
     * [Onchange]: Field Unique Column
     */
    selectedUniqueColumn(val, fieldIndex) {
      if (typeof val === "object") {
        if (val.indexOf("Unique") !== -1) {
          // Module Field/Column Index
          if (fieldIndex !== undefined && this.fieldDB[fieldIndex] !== undefined) {
            if (this.fieldDB[fieldIndex].uniqueColIndex !== undefined) {
              var colName = this.fieldDB[fieldIndex].name;

              // Remove Selected Unique Value in this Module Field
              this.removeFieldOtherValue(fieldIndex, "Unique");

              // {@call} Fetch All Unique Column Name's
              var allUniqueCol = this.checkUniqueColNames()

              // Total Unique Column Names
              this.totalUniqueColName = allUniqueCol

              if (allUniqueCol === false || allUniqueCol.length === 0) {
                /** Unique Column NOT FOUND */ 

                // Active Module Column Name
                this.activeUniqueColIndex = fieldIndex
                
                // Set Unique Model Data
                this.modelUniqueData = {
                  indexName: colName,
                  indexChoice: "unique",
                  columns: [
                    {name: colName, size: ""}
                  ]
                }

                // OPEN MODEL
                this.isOpenUniqueModel = true

              } else {
                // Unique Column FOUND

                // Active Module Column Name
                this.activeUniqueColIndex = fieldIndex

                // OPEN MODEL
                this.isOpenChoiceUniqueModel = true
              }

            } else {

              // Remove Selected Unique Value in this Module Field
              this.removeFieldOtherValue(fieldIndex, "Unique");
              console.error("Field `uniqueColIndex` object key not found.");
            }
          } else {
            console.error("Field data not found.");
          }
        } else {
          // TODO: Remove `uniqueColIndex` value
          // this.fieldDB[fieldIndex].uniqueColIndex = false
        }
      }
    },
    
    /**
     * Open Unique Column Model Related Unique Type [single, composite]
     */
    openUniqueColumnModel() {
      if (this.fieldDB[this.activeUniqueColIndex] !== undefined) {
        
        if (this.choiceUniqueType === "single") {
          var colName = this.fieldDB[this.activeUniqueColIndex].name;
  
          // Set Unique Model Data
          this.modelUniqueData = {
            indexName: colName,
            indexChoice: "unique",
            columns: [
              {name: colName, size: ""}
            ]
          }

          // OPEN MODEL
          this.isOpenUniqueModel = true

        } else if (this.choiceUniqueType === "composite") {
          if (this.choiceCompositeUniqueColIndex !== "") {
            if (this.fieldDB[this.choiceCompositeUniqueColIndex]) {

              // Column Name [UNIQUE FIELD NAME]
              var colName2 = this.fieldDB[this.activeUniqueColIndex].name;
  
              // Already Selected Unique Column Names
              var alreadySelectedUniqueCol = this.fieldDB[this.choiceCompositeUniqueColIndex].uniqueColIndex;
    
              // Add Selected Field Name in Selected Composite Column Data
              if (alreadySelectedUniqueCol.columns !== undefined) {
                alreadySelectedUniqueCol.columns.push({name: colName2, size: ""});
              }
      
              // Set Unique Model Data
              this.modelUniqueData = alreadySelectedUniqueCol;

              // OPEN MODEL
              this.isOpenUniqueModel = true
              
            } else {
              console.error("Module Field Data Not Found!");
            }
          }
        }
      }

      // CLOSE: Model 2
      this.isOpenChoiceUniqueModel = false
    },

    /**
     * Save Unique Column Data
     */
    saveUniqueColumnData() {
      if (this.choiceUniqueType === "single") {
        this.fieldDB[this.activeUniqueColIndex].uniqueColIndex = this.modelUniqueData
      } else {
        // this.activeUniqueColIndex: Remove `uniqueColIndex` Object Value
        this.fieldDB[this.activeUniqueColIndex].uniqueColIndex = false
        // Insert `uniqueColIndex` Object Value
        this.fieldDB[this.choiceCompositeUniqueColIndex].uniqueColIndex = this.modelUniqueData
      }

      // Push `Unique` Value in the Array
      this.fieldDB[this.activeUniqueColIndex].dbOtherOption.push("Unique");

      // Close Model
      this.isOpenUniqueModel = false
    },

    /**
     * [PRIVATE]
     * Remove Field Other Value Links ["Unique"]
     */
    removeFieldOtherValue(fieldIndex, value) {
      var isFound = this.fieldDB[fieldIndex].dbOtherOption.indexOf(value);
      if (isFound !== -1) {
        this.fieldDB[fieldIndex].dbOtherOption.splice(isFound, 1);
      }
    },

    /**
     * Check All Unique Column Names
     */
    checkUniqueColNames() {
      if (this.fieldDB && this.fieldDB.length > 0) {
        var uniqueCol = [];
        for (const col of this.fieldDB) {
          if (col.dbOtherOption && col.dbOtherOption.length > 0) {
            var isFound = col.dbOtherOption.indexOf("Unique");
            if (isFound !== -1) {
              uniqueCol.push({index: col.sort, name: col.name});
            }
          }
          continue
        }
        return uniqueCol;
      }
      return false;
    },

    /** ______________________________________ Field: Form Validation _____________________________________ */

    /**
     * Insert Form Validation Rule
     */
    insertValidationRule(index) {
      if (this.fieldDB[index] !== undefined && this.fieldDB[index] !== null) {
        if (this.fieldDB[index].validationRules !== undefined) {
          this.fieldDB[index].validationRules.push({ name: "", value: "" });
        }
      }
    },

    /**
     * Delete Form Validation Rule
     */
    deleteValidationRule(index, index2) {
      if (this.fieldDB[index] !== undefined && this.fieldDB[index] !== null) {
        if (this.fieldDB[index].validationRules !== undefined) {
          if (this.fieldDB[index].validationRules[index2] !== undefined) {
            this.fieldDB[index].validationRules.splice(index2, 1);
          }
        }
      }
    },

    /**
     * Select: MySQL Related Validatoin Rule
     */
    selectedValidationRule(val, index, index2) {
      if (val === "is_unique") {
        if (
          this.fieldDB[index] !== undefined &&
          this.fieldDB[index].validationRules[index2] !== undefined
        ) {
          var fieldName = this.fieldDB[index].name;
          this.fieldDB[index].validationRules[index2].value =
            this.moduleTableName + "." + fieldName;
        }
      }
    }
  },

  created() {
    this.isFullLoading = true;

    /**
     * Camel Case String
     */
    String.prototype.ucwords = function(str) {
      str = this.toLowerCase();
      return str.replace(/(^([a-zA-Z\p{M}]))|([ -][a-zA-Z\p{M}])/g, function(
        s
      ) {
        return s.toUpperCase();
      });
    };

    this.dbOpenModuleField();
  },

  mounted() {
    this.dbFetchModuleTable();
    this.dbFetchModuleField()
      .then(res => {
        this.fieldDB = res.data;
        this.isFullLoading = false;
      })
      .catch(err => {
        console.error(err);
        this.isFullLoading = false;
      });
  }
};
</script>

<style>
.dbfield > span > div > input {
  background-color: silver;
  font-weight: 700;
}
</style>