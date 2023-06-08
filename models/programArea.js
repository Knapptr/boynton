const pool = require("../db");

class ProgramArea {
    constructor({ id, name }) {
        this.id = id;
        this.name = name;
    }

    /** Add program areas to db
        * @params areas {Object[]} Array of program areas. {name:string}
        * @returns Instantiated program areas
    */
    static async create(areas) {
        const client = await pool.connect();
        try {
            await client.query("BEGIN");
            const allReqs = areas.map(area => {
                const query = `INSERT INTO program_areas (name) VALUES ($1) RETURNING *`;
                const values = [area.name];
                return client.query(query, values);
            })
            console.log({ allReqs });
            const results = await Promise.all(allReqs);
            console.log({
                results: results.map(r => ({ rows: r.rows }))
            })
            await client.query("COMMIT");
            const pas = results.map(res => new ProgramArea(res.rows[0]));
            return pas;
        } catch (e) {
            client.query("ROLLBACK");
            throw e
        } finally {
            client.release()
        }
    }

    static async getAll() {
        const query = `SELECT * from program_areas`;
        const result = await pool.query(query);
        //TODO error handling
        return result.rows.map(pa => new ProgramArea(pa));
    }
    static async getOne(id) {
        const query = `SELECT * from program_areas WHERE id = $1`;
        const values = [id]
        const result = await pool.query(query, values);
        console.log({ id, res: result.rows });
        if (result.rows.length === 0) { return false }
        //TODO error handling
        return result.rows.map(pa => new ProgramArea(pa));
    }
}

module.exports = ProgramArea;
