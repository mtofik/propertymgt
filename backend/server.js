const myexpress = require('express');
const connection = require('./db');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const xlsx = require('xlsx');
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('colors');

const app = myexpress();

app.use(myexpress.json());
app.use(cors());
app.use(myexpress.static(path.join(__dirname, 'public')));

const port = 4000 ||process.env.PORT;
const upload = multer({ dest: "uploads/" });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"), // folder
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const uploadImage = multer({ storage });
app.use("/uploads", myexpress.static("uploads"));

const tableSchemas = {
    block: ["id", "name", "owner", "size", "block", "floor_height"],
    status: ["status_id", "current_status", "contractor", "description_of_work_done", "non_active_reason", "last_work_done", "is_active", "image_url", "block_id"],
    lease: ["leaseYear", "blockId", "invoiceNo", "customerName", "leasePricePerm2", "penality", "interest", "roofnwall", "total", "note", "phone", "paid", "remaining"],
    customer: ["custId", "customerName", "blockId", "phone", "city", "subcity", "woreda", "houseNo", "repName", "repPhone", "repCity", "repSubcity", "repWoreda", "repHouseNo"]
};

app.get("/select/:table", (req, res) => {
    const { table } = req.params;
    const filters = req.query; // e.g. { id: 5 }
    
    if (!tableSchemas[table])
        return res.status(400).json({ error: "Invalid table name" });

    let sql = `SELECT * FROM ${table}`;
    let values = [];
    const likeFields = ["name", "block_id", "customerName"]; // fields you want to match partially
    if (Object.keys(filters).length > 0) {
        const whereClauses = Object.keys(filters)
            .filter(k => tableSchemas[table].includes(k))
            .map(k => likeFields.includes(k) ? `${k} LIKE ?` : `${k} = ?`)
            .join(" AND ");
        sql += ` WHERE ${whereClauses}`;
        values = Object.keys(filters).map(k => likeFields.includes(k) ? `%${filters[k]}%` : filters[k]);
    }
    connection.query(sql, values, (err, rows) => {
        if (err) return res.status(500).json(err);
        res.json(rows);
    });
});

app.get("/selectLease/:table", (req, res) => {
    const { table } = req.params;
    const filters = req.query; // e.g. { id: 5 }
    
    if (!tableSchemas[table])
        return res.status(400).json({ error: "Invalid table name" });

    let sql = `SELECT ${table}.*,block.size FROM ${table} join block on ${table}.blockId = block.name`;
    let values = [];
    const likeFields = ["name", "block_id", "customerName", "blockId"]; // fields you want to match partially

    if (Object.keys(filters).length > 0) {
        const whereClauses = Object.keys(filters)
            .filter(k => tableSchemas[table].includes(k))
            .map(k => likeFields.includes(k) ? `${k} LIKE ?` : `${k} = ?`)
            .join(" AND ");
        sql += ` WHERE ${whereClauses}`;
        values = Object.keys(filters).map(k => likeFields.includes(k) ? `%${filters[k]}%` : filters[k]);
    }
    connection.query(sql, values, (err, rows) => {
        if (err) return res.status(500).json(err);
        res.json(rows);
    });
});

app.post('/upload/:table', upload.single("excel"), (req, res) => {
    const { table } = req.params;
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    if (!tableSchemas[table])
        return res.status(400).json({ error: "Invalid table name" });

    const validColumns = tableSchemas[table];

    data.forEach(element => {
        const cols = Object.keys(element).filter(c => validColumns.includes(c));
        const values = cols.map(c => element[c]);
        const placeholders = cols.map(() => "?").join(", ");
        if (cols.length === 0)
            return res.status(400).json({ error: "No valid columns provided" });
        const sql = `INSERT INTO ${table} (${cols.join(", ")}) VALUES (${placeholders})`;
        connection.query(sql, values, (err, result) => {
            if (err) return res.status(500).json(err);
        });
    })
    console.log("file uploaded successfully")
    res.send("File uploaded successfully");
});

app.post('/uploadLease/:table', upload.single("excel"), (req, res) => {
    const { table } = req.params;
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    if (!tableSchemas[table])
        return res.status(400).json({ error: "Invalid table name" });

    const validColumns = tableSchemas[table];

    data.forEach(element => {
        const cols = Object.keys(element).filter(c => validColumns.includes(c));
        const values = cols.map(c => element[c]);
        const placeholders = cols.map(() => "?").join(", ");
        if (cols.length === 0)
            return res.status(400).json({ error: "No valid columns provided" });
        const sql = `INSERT INTO ${table} (${cols.join(", ")},custName) VALUES (${placeholders}, (SELECT customerName FROM customer WHERE blockId = ?))`;
        const blockId = element.blockId || values[1]; // adjust if needed
        const params = [...values, blockId];
        connection.query(sql, params, (err, result) => {
            if (err) return res.status(500).json(err);
        });
    })
    console.log("file uploaded successfully")
    res.send("File uploaded successfully");
});

app.post("/uploadImage", uploadImage.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  res.json({
    message: "Upload successful!",
    filePath: `../uploads/${req.file.filename}`
  });
});

app.post("/insert/:table", (req, res) => {

    const { table } = req.params;
    const data = req.body;

    if (!tableSchemas[table])
        return res.status(400).json({ error: "Invalid table name" });

    const validColumns = tableSchemas[table];
    const cols = Object.keys(data).filter(c => validColumns.includes(c));
    const values = cols.map(c => data[c]);

    if (cols.length === 0)
        return res.status(400).json({ error: "No valid columns provided" });

    const placeholders = cols.map(() => "?").join(", ");
    const sql = `INSERT INTO ${table} (${cols.join(", ")}) VALUES (${placeholders})`;
    connection.query(sql, values, (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ success: true, id: result.insertId });
    });
});

app.put("/update/:col/:table", (req, res) => {
  const { table, col } = req.params;
  const { id, data } = req.body;
  if (!tableSchemas[table])
    return res.status(400).json({ error: "Invalid table name" });

  const validColumns = tableSchemas[table];
  const validData = Object.keys(data)
    .filter(col => validColumns.includes(col))
    .reduce((acc, col) => ({ ...acc, [col]: data[col] }), {});

  if (Object.keys(validData).length === 0)
    return res.status(400).json({ error: "No valid columns provided" });

  const columns = Object.keys(validData)
    .map(col => `${col} = ?`)
    .join(", ");
  const values = Object.values(validData);
  const sql = `UPDATE ${table} SET ${columns} WHERE ${col} = ?`;
  connection.query(sql, [...values, id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ success: true, affectedRows: result.affectedRows });
  });
});

app.delete("/delete/:id/:col/:table", (req, res) => {
  const { table, id, col } = req.params;

  if (!tableSchemas[table])
    return res.status(400).json({ error: "Invalid table name" });

  const sql = `DELETE FROM ${table} WHERE ${col} = ?`;

  connection.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ success: true, deleted: result.affectedRows });
  });
});

app.listen(port, (err) => {
    if (err) return console.log("server connection error!".red, err.message);
    console.log('Server is listening on port '.blue + port);
})