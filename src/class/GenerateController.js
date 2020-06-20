class GenerateController {

  constructor(obj) {
    if (!obj || Object.keys(obj).length <= 0) {
      throw Error("Controller Data Not Found.")
    }

    if (!obj.module) {
      throw Error("Please Define Module Name.")
    }

    // Module Name
    this.module = obj.module
    // API Content [API Routes]
    this.apiContent = (!obj.apiContent) ? false : obj.apiContent

    // Route Path Prefix
    this.routePrefix = this.module.toLocaleLowerCase()
    if (obj.routePrefix) {
      this.routePrefix = obj.routePrefix
    }

    // Routes Data
    if (!obj.routes || obj.routes.length <= 0) {
      this.routes = [
        { path: "", controller: obj.module, method: "index", requestMethod: "get" },
        { path: "/insert", controller: obj.module, method: "insert", requestMethod: "get" },
        { path: "/update", controller: obj.module, method: "update", requestMethod: "get" },
        { path: "/delete", controller: obj.module, method: "delete", requestMethod: "get" },
      ]
    } else {
      this.routes = obj.routes
    }

    // API Route Prefix
    this.apiRoutePrefix = "api"
    if (obj.apiRoutePrefix) {
      this.apiRoutePrefix = obj.apiRoutePrefix
    }

    // API Routes Data
    if (!obj.apiRoutes || obj.apiRoutes.length <= 0) {
      this.apiRoutes = [
        { path: "", controller: obj.module + "_api", method: "index", requestMethod: "post" },
        { path: "/insert", controller: obj.module + "_api", method: "insert", requestMethod: "post" },
        { path: "/update", controller: obj.module + "_api", method: "update", requestMethod: "post" },
        { path: "/delete", controller: obj.module + "_api", method: "delete", requestMethod: "post" },
      ]
    } else {
      this.apiRoutes = obj.apiRoutes
    }

    // Database Data
    if (obj.dbTableName)
      this.dbTableName = obj.dbTableName

    if (obj.dbTableColumn)
      this.dbTableColumn = obj.dbTableColumn

    // Is Module Method Content Fill
    this.isModuleMethodContentFill = false
  }

  /**
   * Get Controller
   */
  getController() {

    // Empty Controller File Content
    var moduleController = "";

    // Default First Lines
    moduleController += "<?php namespace App\\Controllers;\n\n";
    moduleController += "class "+ this.module +" extends BaseController\n";
    moduleController += "{\n";

    for (const route of this.routes) {
      if (route.path !== undefined && route.method && route.controller) {
        moduleController += "  /**\n";
        moduleController += "   * " + route.method.toUpperCase() + " " + this.overrideControllerName(route.controller) + "\n";
        moduleController += "   */\n";
        moduleController += "  public function " + route.method + "() {";
        moduleController += "\n";

        if (this.isModuleMethodContentFill) {

          if (route.method === "insert") {
            moduleController += this.insertMethodContent()
          }

        } else {
          moduleController += "    echo '" + route.method.toUpperCase() + " " + this.overrideControllerName(route.controller) + "';";
        }

        moduleController += "\n";
        moduleController += "  }";
        moduleController += "\n\n";
      }
    }

    moduleController += "}\n";

    return moduleController
  }

  /**
   * Get API Controller
   */
  getAPIController() {

    // Empty API Controller File Content
    var moduleController = "";

    // Default First Lines
    moduleController += "<?php namespace App\\Controllers\\API;\n\n";
    moduleController += "class "+ this.module +"_api extends BaseController\n";
    moduleController += "{\n";

    for (const route of this.apiRoutes) {
      if (route.path !== undefined && route.method && route.controller) {
        moduleController += "  /**\n";
        moduleController += "   * API: " + route.method.toUpperCase() + " " + this.overrideControllerName(this.module) + "\n";
        moduleController += "   */\n";
        moduleController += "  public function " + route.method + "() {";
        moduleController += "\n";
        moduleController += "    echo '" + route.method.toUpperCase() + " " + this.overrideControllerName(this.module) + " API';";
        moduleController += "\n";
        moduleController += "  }";
        moduleController += "\n\n";
      }
    }

    moduleController += "}\n";

    return moduleController
  }

  /**
   * [PRIVATE]: Module Insert Method Content
   */
  insertMethodContent() {
    var content = ""

    // Form Validation
    content += this.formValidation()

    content += "\n\n"
    content += "\
    $validation->withRequest($this->request)->run();\n\
    if (!empty($validation->getErrors())) {\n\
      echo view('" + this.module.toLocaleLowerCase() + "/insert_" + this.module.toLocaleLowerCase() + "');\n\
    } else {\n\
    }\n\
    "

    return content
  }

  /**
   * [PRIVATE]: Module Update Method Content
   */
  updateMethodContent() {

  }

  /**
   * [PRIVATE]: Module Delete Method Content
   */
  deleteMethodContent() {

  }

  /**
   * [PRIVATE]: Form Validation Content
   */
  formValidation() {

    /**
      $validation->setRules([
        'full_name' => ['label' => 'full name', 'rules' => 'required|string'],
        'email' => ['rules' => 'required|valid_email|string'],
        // 'mobile' => ['label' => 'mobile', 'rules' => 'if_exist|numeric|min_length[10]|max_length[10]'],
      ]);
    */

    if (!this.dbTableName) {
      throw Error("Database Table Name Required.")
    }

    if (!this.dbTableColumn) {
      throw Error("Database Table Column Name Required.")
    }

    // Check First Validation is Exist
    var checkFirstValidationRule = true

    // Validation Content
    var content = "    "
    content += "/** \n\
     * [LOAD]: Validation Library \n\
     * https://codeigniter.com/user_guide/libraries/validation.html \n\
     */\n"
    content += "    "
    content += "$validation = \\Config\\Services::validation();"
    content += "\n"
    content += "    "
    content += "// Validation Rules"
    content += "\n"

    // Database Column Name
    if (this.dbTableColumn.length > 0) {
      this.dbTableColumn.forEach(col => {
        if (col.validationRules && col.validationRules.length > 0) {

          // First Validation Rule Exist
          if (checkFirstValidationRule) {
            checkFirstValidationRule = false
          content += "    "
          content += "$validation->setRules(["
          }

          content += "\n"

          // Form Validation
          content += "      "
          content += "'" + col.name + "' => ["
          // Form Validation Label
          if (col.label && col.label !== "") {
            content += "'label' => '" + col.label + "', "
          }
          // Form Validation Rules
          content += "'rules' => '"
          col.validationRules.forEach(rule => {
            if (rule.value && rule.value !== "") {
              content += rule.name + "[" + rule.value + "]|"
            } else {
              content += rule.name + "|"
            }
          });
          // Remove Last Character '|'
          content = content.slice(0, -1)
          content += "'],"
        }
      });

      content += "\n"

      if (!checkFirstValidationRule)
        content += "    ]);"
    }

    return content
  }

  /**
   * [PRIVATE]: Override Controller Name
   * @param {*} name 
   * -------------------------------------
   * [Users to USERS]
   * [People_message to PEOPLE MESSAGE]
   */
  overrideControllerName(name) {
    if (!name) {
      return
    }

    if (name.indexOf("_") !== -1) {
      return name.replace(/_/g, " ").toUpperCase()
    }
    return name.toUpperCase()
  }
}

export default GenerateController