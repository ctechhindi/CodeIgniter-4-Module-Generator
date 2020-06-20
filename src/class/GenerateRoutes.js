class GenerateRoutes {

  constructor(obj) {
    if (!obj || Object.keys(obj).length <= 0) {
      throw Error("Routes Data Not Found.")
    }

    if (!obj.module) {
      throw Error("Please Define Module Name.")
    }

    // Module Name
    this.module = obj.module
    // Routes Type (simple, grouping)
    this.type = (!obj.type) ? "simple" : obj.type
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
  }

  /**
   * Get Routes Content
   */
  getRoutes() {

    /**
     * Routes to \Admin\Users::index()
        $routes->add('admin/users', 'Users::index', ['namespace' => 'Admin']);
      * Routes Simple Mode
        // Users Module Routes
        $routes->get('/users', 'Users::index');
        $routes->get('/users/insert', 'Users::insert');
        $routes->get('/users/update', 'Users::update');
        $routes->get('/users/delete', 'Users::delete');
      */
    if (this.type === "simple")
      return this.simpleRoutes();
    else
      return this.groupingRoutes();
  }

  /**
   * Generate Simple Routes Content
   */
  simpleRoutes() {
    if (!this.routes || this.routes.length <= 0) {
      throw Error("Route Names Data Not Found.")
    }

    // Empty Routes File Content
    var moduleRoutes = "";

    // Default First Lines
    moduleRoutes += "<?php \n\n";
    moduleRoutes += "// " + this.module + " Module Routes\n";

    for (const route of this.routes) {
      if (route.path !== undefined && route.method && route.controller) {
        moduleRoutes += "$routes->" + route.requestMethod + "('/" + this.routePrefix + route.path + "', '" + route.controller + "::" + route.method + "');";
        moduleRoutes += "\n";
      }
    }

    // Module API Routes
    if (this.apiContent === true) {
      moduleRoutes += "\n// " + this.module + " Module API Routes\n";
      for (const route of this.apiRoutes) {
        if (route.path !== undefined && route.method && route.controller) {
          moduleRoutes += "$routes->" + route.requestMethod + "('/" + this.apiRoutePrefix + "/" + this.routePrefix + route.path + "', '" + route.controller + "::" + route.method + "');";
          moduleRoutes += "\n";
        }
      }
    }

    return moduleRoutes;
  }

  /**
   * Generate Grouping Routes Content
   * 
   * https://codeigniter.com/user_guide/incoming/routing.html#grouping-routes
   */
  groupingRoutes() {
    if (!this.routes || this.routes.length <= 0) {
      throw Error("Route Names Data Not Found.")
    }

    // Empty Routes File Content
    var moduleRoutes = "";

    moduleRoutes += "<?php \n\n";
    moduleRoutes += "// " + this.module + " Module Routes\n";
    moduleRoutes += "$routes->group('" + this.routePrefix + "', function($routes) {";
    moduleRoutes += "\n";

    for (const route of this.routes) {
      if (route.path !== undefined && route.method && route.controller) {
        moduleRoutes += "  $routes->" + route.requestMethod + "('" + route.path.slice(1) + "', '" + route.controller + "::" + route.method + "');";
        moduleRoutes += "\n";
      }
    }

    moduleRoutes += "});\n";

    // Module API Routes
    if (this.apiContent === true) {
      moduleRoutes += "\n// " + this.module + " Module API Routes\n";
      moduleRoutes += "$routes->group('" + this.apiRoutePrefix + "', function($routes) {\n";
      moduleRoutes += "  $routes->group('" + this.routePrefix + "', function($routes) {\n";
      for (const route of this.apiRoutes) {
        if (route.path !== undefined && route.method && route.controller) {
          moduleRoutes += "    $routes->" + route.requestMethod + "('" + route.path.slice(1) + "', '" + route.controller + "::" + route.method + "');";
          moduleRoutes += "\n";
        }
      }
      moduleRoutes += "  });\n";
      moduleRoutes += "});\n";
    }

    return moduleRoutes;
  }
}

export default GenerateRoutes
