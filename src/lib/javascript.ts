import {
  ALIAS_COLUMN_NAME,
  ALIAS_DATA_TYPE,
  ALIAS_COLUMN_KEY,
  ALIAS_CHARACTER_MAXIMUM_LENGTH,
  ALIAS_IS_NULLABLE,
  ALIAS_COLUMN_DEFAULT,
} from './database';
import { DatabaseConnection } from '../interfaces/DatabaseConnection';
import { getTableInfo, getTableNames } from './database';
/**
 * Gets the schema of the database as an array of table schema objects
 */
export async function getJSSchema(
  connection: DatabaseConnection,
  database_name: string
): Promise<JSTableSchema[]> {
  const tables = await getTableNames(connection, database_name);
  const schema = tables.map(async (table_name: string) => {
    let table_schema = await tableGetJSSchema(
      connection,
      database_name,
      table_name
    );
    return table_schema;
  });
  return await Promise.all(schema);
}
/**
 *
 * @param table_name
 */
export async function tableGetJSSchema(
  connection: DatabaseConnection,
  database_name: string,
  table_name: string
): Promise<JSTableSchema> {
  const columns = await getTableInfo(connection, database_name, table_name);
  let schema: JSTableSchema = {
    table_name: table_name,
    fields: [],
  };
  let fields: Array<JSField> = [];
  columns.map((column: any) => {
    let field: JSField = {
      column_name: column[ALIAS_COLUMN_NAME],
      data_type: column[ALIAS_DATA_TYPE],
      key: column[ALIAS_COLUMN_KEY],
      max_length: column[ALIAS_CHARACTER_MAXIMUM_LENGTH],
      is_nullable: column[ALIAS_IS_NULLABLE],
      default_value: column[ALIAS_COLUMN_DEFAULT],
    };
    fields.push(field);
  });
  schema.fields = fields;
  return schema;
}

export interface JSField {
  column_name: string;
  data_type: string;
  key: string;
  max_length: number;
  is_nullable: number;
  default_value?: string;
}
export interface JSTableSchema {
  table_name: string;
  fields: Array<JSField>;
}
