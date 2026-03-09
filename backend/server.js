const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();

app.use(cors());
app.use(express.json());

const db = new Pool({
  connectionString: "postgresql://postgres.tncqiqnaydaryjobdkrx:Bio_procesos2026@aws-1-us-east-2.pooler.supabase.com:6543/postgres",
  ssl: {
    rejectUnauthorized: false
  }
});

app.post("/login", async (req, res) => {

  try {

    const { usuario, password } = req.body;

    const result = await db.query(
      "SELECT * FROM trabajadores WHERE dni=$1 AND password=$2 LIMIT 1",
      [usuario, password]
    );

    if (result.rows.length > 0) {

      res.json({
        success: true,
        usuario: result.rows[0]
      });

    } else {

      res.json({
        success: false
      });

    }

  } catch (error) {

    console.log(error);
    res.status(500).json({ error: "Error en servidor" });

  }

});

app.listen(4000, () => {
  console.log("Servidor corriendo en puerto 4000");
});