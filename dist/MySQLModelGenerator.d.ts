import { IConfig } from './Interfaces';
import MySQLDriver = require('./MySQLDriver');
declare class MySQLModelGenerator {
    db: MySQLDriver;
    constructor(config: IConfig);
    generate(outfolder: string): Promise<[unknown, unknown, unknown, unknown, unknown, unknown, unknown, unknown, unknown, unknown]>;
    generateModel(table_name: string, outfolder: string): Promise<void>;
}
export = MySQLModelGenerator;
//# sourceMappingURL=MySQLModelGenerator.d.ts.map