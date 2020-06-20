<template>
  <div class="ModuleSettings">
    <section class="hero is-warning is-bold">
      <div class="hero-body">
        <div class="container">
          <h1 class="title">Module Settings: {{ moduleName }} </h1>
          <h2 class="subtitle">To do Module Settings</h2>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <b-field grouped>
          <!-- Namespace -->
          <b-field label="Namespace" expanded>
            <b-input
              v-model="settings.namespace"
              placeholder="Enter Routes Namespace"
              type="is-small"
            ></b-input>
          </b-field>

          <!-- Route Type -->
          <b-field label="Route Type" expanded>
            <b-select v-model="settings.routeType" placeholder="Select a character" expanded>
              <option value="simple">Simple</option>
              <option value="grouping">Grouping</option>
            </b-select>
          </b-field>
        </b-field>

        <!-- API Content -->
        <div class="field">
          <b-switch v-model="settings.apiContent">API Content</b-switch>
        </div>

        <!-- Simple Routes -->
        <b-collapse class="card" animation="slide" aria-id="simpleRoutes">
          <div slot="trigger" class="card-header has-background-dark" role="button" aria-controls="simpleRoutes">
            <p class="card-header-title has-text-white">Simple Routes</p>
          </div>
          <div class="card-content">
            <div class="content">
              <table class="table is-bordered is-narrow is-fullwidth">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Route Path</th>
                    <th>Controller</th>
                    <th>Method</th>
                    <th>Route Type</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(data, index) in settings.simpleRoutes" :key="index">
                    <td>{{ index + 1 }}</td>
                    <td>
                      <b-input v-model="data.path" size="is-small"></b-input>
                    </td>
                    <td>
                      <b-input v-model="data.controller" size="is-small"></b-input>
                    </td>
                    <td>
                      <b-input v-model="data.method" size="is-small"></b-input>
                    </td>
                    <td>
                      <b-select placeholder="Select a character" size="is-small" v-model="data.requestMethod" expanded>
                        <option v-for="(item, index) in requestType" :key="index" :value="item">{{ item }}</option>
                      </b-select>
                    </td>
                    <td>
                      <b-button icon-right="plus" size="is-small" type="is-primary" @click="insertNewObj('simpleRoutes')"></b-button>&nbsp;
                      <b-button icon-right="delete" size="is-small" type="is-danger" @click="deleteObj('simpleRoutes', index)"></b-button>&nbsp;
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </b-collapse>

        <br />

        <!-- API Routes -->
        <b-collapse class="card" animation="slide" aria-id="apiRoutes" v-show="settings.apiContent">
          <div slot="trigger" class="card-header has-background-dark" role="button" aria-controls="apiRoutes">
            <p class="card-header-title has-text-white">API Routes</p>
          </div>
          <div class="card-content">
            <div class="content">
              <table class="table is-bordered is-narrow is-fullwidth">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Route Path</th>
                    <th>Controller</th>
                    <th>Method</th>
                    <th>Route Type</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(data, index) in settings.apiRoutes" :key="index">
                    <td>{{ index + 1 }}</td>
                    <td>
                      <b-input v-model="data.path" size="is-small"></b-input>
                    </td>
                    <td>
                      <b-input v-model="data.controller" size="is-small"></b-input>
                    </td>
                    <td>
                      <b-input v-model="data.method" size="is-small"></b-input>
                    </td>
                    <td>
                      <b-select placeholder="Select a character" size="is-small" v-model="data.requestMethod" expanded>
                        <option v-for="(item, index) in requestType" :key="index" :value="item">{{ item }}</option>
                      </b-select>
                    </td>
                    <td>
                      <b-button icon-right="plus" size="is-small" type="is-primary" @click="insertNewObj('apiRoutes')"></b-button>&nbsp;
                      <b-button icon-right="delete" size="is-small" type="is-danger" @click="deleteObj('apiRoutes', index)"></b-button>&nbsp;
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </b-collapse>

        <!-- Save Settings Button -->
        <br />
        <b-button icon-left="content-save" type="is-primary" @click="saveSettings()">Save Settings</b-button>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: "ModuleSettings",
  data() {
    return {
      // Module Name
      moduleName: this.$route.params.module,
      // Module Settings: Local Key [ModuleSettings.vue, Modules.vue]
      settingsLocalKey: "c4-mg_ModuleSettings-{$_module}",
      requestType: ["get", "post"],
      // Module Settings
      settings: {
        namespace: "App\\Controllers",
        routeType: "simple", // grouping
        apiContent: false,
        // Simple Routes
        simpleRoutes: [],
        // API Routes
        apiRoutes: [],
      }
    };
  },

  methods: {
    /**
     * Save Module Settings
     */
    saveSettings() {
      localStorage.setItem(this.settingsLocalKey.replace("{$_module}", this.moduleName.toLocaleLowerCase()), JSON.stringify(this.settings));

      this.$buefy.toast.open({
        duration: 5000,
        message: `Module Settings has been Saved.`,
        position: "is-bottom",
        type: "is-success"
      });
    },

    /**
     * Fetch Saved Module Settings
     */
    fetchSavedSettings() {
      var isSettings = localStorage.getItem(this.settingsLocalKey.replace("{$_module}", this.moduleName.toLocaleLowerCase()));
      if (isSettings) {
        var settings = JSON.parse(isSettings);
        // Marge Two Objects
        this.settings = Object.assign(this.settings, settings);
      }
    },

    /** ______________________________________ LIST: Simple, API Routes ________________________________________ */

    /**
     * Insert new object
     */
    insertNewObj(whichObj) {
      if (!whichObj) {
        return false
      }

      if (whichObj === "simpleRoutes") {
        // Simple Routes
        this.settings.simpleRoutes.push({path: "", controller: this.moduleName, method: "", requestMethod: "get" },);
      } else if (whichObj === "apiRoutes") {
        // API Routes
        this.settings.apiRoutes.push({path: "", controller: this.moduleName + "_api", method: "", requestMethod: "post" },);
      }
    },

    /**
     * Delete object
     */
    deleteObj(whichObj, index) {
      if (!whichObj || index === undefined) {
        return false
      }

      if (whichObj === "simpleRoutes") {
        // Simple Routes
        if (this.settings.simpleRoutes.length !== 1) {
          this.settings.simpleRoutes.splice(index, 1);
        }
      } else if (whichObj === "apiRoutes") {
        // API Routes
        if (this.settings.apiRoutes.length !== 1) {
          this.settings.apiRoutes.splice(index, 1);
        }
      }
    }
  },

  created() {
    
    // Default Simple Routes
    this.settings.simpleRoutes = [
      { path: "", controller: this.moduleName, method: "index", requestMethod: "get" },
      { path: "/insert", controller: this.moduleName, method: "insert", requestMethod: "get" },
      { path: "/update", controller: this.moduleName, method: "update", requestMethod: "get" },
      { path: "/delete", controller: this.moduleName, method: "delete", requestMethod: "get" },
    ];

    // Default API Routes
    this.settings.apiRoutes = [
      { path: "", controller: this.moduleName + "_api", method: "index", requestMethod: "post" },
      { path: "/insert", controller: this.moduleName + "_api", method: "insert", requestMethod: "post" },
      { path: "/update", controller: this.moduleName + "_api", method: "update", requestMethod: "post" },
      { path: "/delete", controller: this.moduleName + "_api", method: "delete", requestMethod: "post" },
    ];

    this.fetchSavedSettings();
  }
};
</script>