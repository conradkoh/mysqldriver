import { ALLOWED_OPERATORS } from '../constants';
import { DatabaseConnection } from '../classes/DatabaseConnection';
const INVALID_COLUMN_NAME_CHARS = '!#%&’()*+,-./:;<=>?@[]^~ "`\\';
const INVALID_COLUMN_NAME_CHARS_INDEX = INVALID_COLUMN_NAME_CHARS.split(
  ''
).reduce((state: any, char: string) => {
  state[char] = 1;
  return state;
}, {});
/**
 * Query a connection with data
 * @param connection
 * @param query
 * @param values
 */
export async function query(
  connection: DatabaseConnection,
  query: string,
  values: Array<any> = []
): Promise<any> {
  let { isValid, errors } = checkValues(values);
  if (!isValid) {
    throw new Error(`Query error:\n${query}\n\nErrors:\n${errors.join('\n')}`);
  }
  let data = await new Promise((resolve, reject) => {
    connection.query(query, values, (err, resRaw) => {
      if (err) {
        reject(err);
      } else {
        let data = JSON.parse(JSON.stringify(resRaw));
        resolve(data);
      }
    });
  });
  return data;
}

/**
 * Checks an array of values and ensures that it is not undefined
 * @param values
 */
function checkValues(values: Array<string>) {
  let isValid = false;
  let errors = [];
  for (let idx in values) {
    let value = values[idx];
    if (value === undefined) {
      errors.push(`Prepared value at index ${idx} is undefined`);
    }
  }
  return { isValid: errors.length === 0, errors };
}

export function containsSpecialChars(str_val: string) {
  let found = false;
  for (let i = 0; i < str_val.length; i++) {
    let c = str_val[i];
    if (INVALID_COLUMN_NAME_CHARS_INDEX[c]) {
      found = true;
      break;
    }
  }
  return found;
}

export type QueryOptions = {
  limit?: QueryLimitOptions;
  where?: QueryWhereOptions;
};
export type QueryLimitOptions = {
  offset?: number;
  page_size: number;
};
export type QueryWhereOptions = {
  operator?: 'AND' | 'OR';
  wildcard?: boolean;
  wildcardBefore?: boolean;
  wildcardAfter?: boolean;
};
