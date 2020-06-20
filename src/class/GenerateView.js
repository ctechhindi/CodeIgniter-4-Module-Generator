class GenerateView {

  constructor(obj) {
    if (!obj || Object.keys(obj).length <= 0) {
      throw Error("Model Data Not Found.")
    }

    if (!obj.module) {
      throw Error("Please Define Module Name.")
    }

    // Module Name
    this.module = obj.module
  }

  /**
   * Get Mange Page Content
   */
  getManageView() {

    // Empty Controller File Content
    var viewContent = "";

    viewContent += "<h1>MANAGE " + this.overrideControllerName(this.module) + "</h1>";

    return viewContent
  }

  /**
   * Get Insert Page Content
   */
  getInsertView() {

    // Empty Controller File Content
    var viewContent = "";

    viewContent += "<h1>INSERT " + this.overrideControllerName(this.module) + "</h1>";

    return viewContent
  }

  /**
   * Get Update Page Content
   */
  getUpdateView() {

    // Empty Controller File Content
    var viewContent = "";

    viewContent += "<h1>UPDATE " + this.overrideControllerName(this.module) + "</h1>";

    return viewContent
  }

  /**
   * Override Controller Name
   * @param {*} name 
   * --------------------------
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

export default GenerateView
