# Doc

## Personal Class

1. `/src/class/GenerateMySQLQuery.js`

```js
var run = new GenerateMySQLQuery(this.module.tableField);
run.generateQuery();
```

## MySQL Validation

### `Primary Column`

* `AUTO_INCREMENT` Column must be `Primary` Column
* May Primary Column Query
    ```sql
    ....
    PRIMARY KEY (`id`,`user`,`other`)
    ```

### `CURRENT_TIMESTAMP`

```sql
....
`date` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
```

### `UNIQUE KEY`

```sql
UNIQUE KEY `err` (`err`),
UNIQUE KEY `person` (`ip`,`date`)
```