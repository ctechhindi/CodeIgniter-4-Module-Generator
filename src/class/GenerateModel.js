class GenerateModel {

  constructor(obj) {
    if (!obj || Object.keys(obj).length <= 0) {
      throw Error("Model Data Not Found.")
    }

    if (!obj.module) {
      throw Error("Please Define Module Name.")
    }

    if (!obj.table) {
      throw Error("Please Define Module Table Name.")
    }

    // Module Name
    this.module = obj.module

    // Module Table Name
    this.table = obj.table

    // Module Table Column Names
    this.tableColumn = obj.tableColumn
  }

  /**
   * Get Model Content
   */
  getModel() {

    // Empty Model File Content
    var moduleModel = "";

    // Default First Lines
    moduleModel += "<?php namespace App\\Models;\n\n";
    moduleModel += "use CodeIgniter\\Database\\ConnectionInterface;\n";
    moduleModel += "use CodeIgniter\\Model;\n\n";
    moduleModel += "class "+ this.module +"Model extends Model\n";
    moduleModel += "{\n";

    moduleModel += "  protected $table = '" + this.table + "';\n";
    moduleModel += "  protected $primaryKey = 'id';\n";
    moduleModel += "  protected $allowedFields = " + JSON.stringify(this.tableColumn) + ";\n";

    moduleModel += "  protected $useTimestamps = true;\n";
    moduleModel += "  protected $createdField  = 'created_at';\n";
    moduleModel += "  protected $updatedField  = 'updated_at';\n\n";

    moduleModel += "  // protected $useSoftDeletes = true;\n";
    moduleModel += "  // protected $deletedField  = 'deleted_at';\n";

    moduleModel += "  // protected $skipValidation  = false;\n\n";

    moduleModel += "  protected $returnType = 'App\\Entities\\" + this.module + "';\n";

    moduleModel += "}\n";

    return moduleModel
  }

  /**
   * Get Model Entities Content
   */
  getModelEntities() {

    // Empty Model Entities File Content
    var moduleModelEntities = "";

    // Default First Lines
    moduleModelEntities += "<?php namespace App\\Entities;\n\n";
    moduleModelEntities += "use CodeIgniter\\Entity;\n";
    moduleModelEntities += "\n";
    moduleModelEntities += "class "+ this.module +" extends Entity\n";
    moduleModelEntities += "{\n";

    moduleModelEntities += "  protected $table = '" + this.table + "';\n";
    
    moduleModelEntities += "}\n";

    return moduleModelEntities
  }
}

export default GenerateModel