class GenerateMySQLQuery {

  constructor(column) {
    // Column Object Data
    this.column = column

    // Generate MySQL Query String
    this.queryString = ""
    // Table Primary Column Name
    this.primaryColumn = []
    // Table Unique Column's Name
    this.uniqueColumn = {}
  }

  generateQuery() {
    if (this.column === undefined || this.column === null || typeof (this.column) !== "object") {
      throw new Error('MySQL Query Column Data Not Found.')
    }

    for (const index in this.column) {
      const col = this.column[index];
      if (index == 0) {

        /**
         * First Column
         */
        this.queryString += "CREATE TABLE `" + col.tableName + "` ( \n";

        // {@call}
        var colString1 = this.singleColumnString(col);
        if (colString1 === false) {
          // TODO
          console.error("createMysqlDatabaseTable -> colString1", colString1)
          break
        } else {
          this.queryString += "  " + colString1;
        }

      } else if (this.column.length == (parseInt(index) + 1)) {

        /**
         * Last Column
         */

        // {@call}
        var colString3 = this.singleColumnString(col);
        if (colString3 === false) {
          // TODO
          console.error("createMysqlDatabaseTable -> colString3", colString3)
          break
        } else {
          if (this.primaryColumn.length > 0) {
            this.queryString += "  " + colString3; // Last Char With (,)
          } else {
            this.queryString = this.queryString.slice(0, -1);
          }
        }

        /**
         * Add Primary Columns and AUTO INCREMENT
         */
        if (this.primaryColumn.length > 0) {
          this.queryString += "  PRIMARY KEY (";
          for (const pColIndex in this.primaryColumn) {
            if (this.primaryColumn.length == (parseInt(pColIndex) + 1)) {
              // Last Primary Column Index
              this.queryString += "`"+ this.primaryColumn[pColIndex] + "`";
            } else {
              this.queryString += "`"+ this.primaryColumn[pColIndex] + "`, ";
            }
          }
          this.queryString += "),";
        }

        // {@call}: Make MySQL Unique Column
        var uniqueString = this.makeUniqueString(this.uniqueColumn);
        if (uniqueString) {
          this.queryString += "\n"+ uniqueString
          // Remove Last Entry
          this.queryString = this.queryString.slice(0, -2);
        } else {
          // Remove Last Comma
          this.queryString = this.queryString.slice(0, -1);
        }

        this.queryString += "\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;";

      } else {

        /**
         * Middle Column
         */

        // {@call}
        var colString2 = this.singleColumnString(col);
        if (colString2 === false) {
          // TODO
          console.error("createMysqlDatabaseTable -> colString2", colString2)
          break
        } else {
          this.queryString += "  " + colString2;
        }
      }

      /**
       * Check Other Options
       * ------------------------------------
       * col.dbOtherOption.indexOf("AUTO INCREMENT")
       * col.dbOtherOption.indexOf("Unique")
       * col.dbOtherOption.indexOf("Primary")
       */
      if (typeof (col.dbOtherOption) === "object") {
        if (col.dbOtherOption.indexOf("Primary") !== -1) {
          if (this.primaryColumn[col.name] === undefined)
            this.primaryColumn.push(col.name)
        } else if (col.dbOtherOption.indexOf("AUTO INCREMENT") !== -1) {
          if (this.primaryColumn[col.name] === undefined)
            this.primaryColumn.push(col.name)
        }

        // UNIQUE KEY
        if (col.dbOtherOption.indexOf("Unique") !== -1) {
          this.uniqueColumn[col.name] = col.sort
        }
      }
    }

    return this.queryString;
  }

  /**
   * [PRIVATE]
   * ---------------------------------------
   * Make MySQL Column
   */
  singleColumnString(col) {
    // console.log("GenerateMySQLQuery -> singleColumnString -> col", col)

    var colString = "";

    /**
     * Column: Name
     */
    if (col.name !== undefined && col.name !== "" && col.name !== null && col.name !== false) {
      colString += " `" + col.name + "` ";
    } else { return false }

    /**
     * Column: DataType
     */
    if (col.dbType !== undefined && col.dbType !== "" && col.dbType !== null && col.dbType !== false) {
      colString += col.dbType + " ";
    } else { return false }

    /**
     * Column: Length
     */
    if (col.dbType !== "text") {
      if (col.dbLength !== undefined && col.dbLength !== "" && col.dbLength !== null && col.dbLength !== false) {
        colString += "(" + col.dbLength + ") ";
      }
    }

    /**
     * Default Value
     */
    if (col.dbdefaultValueType !== undefined && col.dbdefaultValueType !== "" && col.dbdefaultValueType !== null && col.dbdefaultValueType !== false) {
      if (col.dbdefaultValueType == "None") {
        // None
        colString += "NOT NULL ";
      } else if (col.dbdefaultValueType == "NULL") {
        // NULL
        colString += "NULL ";
      } else if (col.dbdefaultValueType == "CURRENT TIMESTAMP") {
        // CURRENT TIMESTAMP
        colString += "NOT NULL DEFAULT CURRENT_TIMESTAMP ";
      } else if (col.dbdefaultValueType == "As Defined") {
        // As Defined
        colString += "NOT NULL DEFAULT '" + col.dbdefaultValue + "' ";
      }
    }

    /**
     * Check: AUTO INCREMENT
     */
    if (col.dbOtherOption !== undefined && col.dbOtherOption.length > 0) {
      if (col.dbOtherOption.indexOf("AUTO INCREMENT") !== -1) {
        colString += "AUTO_INCREMENT ";
      }
    }

    // Return String
    return colString.trim() + ",\n";
  }

  /**
   * [PRIVATE]
   * ------------------------------------
   * Make MySQL Unique Content
   * @param {*} uniqueCol 
   */
  makeUniqueString(uniqueCol) {
    if (uniqueCol && Object.keys(uniqueCol).length > 0) {

      // Return Unique Column String
      var returnString = "";

      for (const index in uniqueCol) {
        // Check Column Exists and Column Name is Same
        if (this.column[uniqueCol[index]] !== undefined && this.column[uniqueCol[index]].name === index) {
          if (this.column[uniqueCol[index]].uniqueColIndex !== undefined) {
            var uniqueColIndex = this.column[uniqueCol[index]].uniqueColIndex;
            if (uniqueColIndex.columns !== undefined) {
              
              // UNIQUE KEY `user` (`user`),
              returnString += "  UNIQUE KEY `"+ uniqueColIndex.indexName + "` (";

              var columnName = []; // For Check Key Already Exists
              for (const key of uniqueColIndex.columns) {
                // Check Column Key Already Exists
                if (columnName.indexOf(key.name) === -1) {
                  columnName.push(key.name);

                  // Check Unique Key Name in the All Unique Column Names 
                  if (uniqueCol[key.name] !== undefined) {
                    returnString += "`" + key.name + "`,"
                  }
                }
              }
              // Remove Last Comma
              returnString = returnString.slice(0, -1);
              returnString += "),\n";

            } else { continue }
          } else { continue }
        } else { continue }
      }

      return returnString;
    }
    return false
  }
}

export default GenerateMySQLQuery