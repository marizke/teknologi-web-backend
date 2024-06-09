const express = require("express")
const mysql = require("mysql2")
const cors = require('cors');
const bodyParser = require("body-parser")
require('dotenv').config()

const app = express()
const port = 3000

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    port: 20000,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
})

db.connect()

app.use(cors());
app.use(bodyParser.json())

app.get("/buku", (req, res) => {
    const page = parseInt(req.query.page, 10) || 1
    const contentSize = 6
    const skip = (page - 1) * contentSize

    db.query("SELECT COUNT(*) as banyak_buku FROM buku", (error, results) => {
        if (error) {
            res.status(500).json({
                error: true,
                message: "Terjadi kesalahan"
            })

            throw error
        }

        const jumlahBuku = results[0].banyak_buku
        const jumlahPage = Math.ceil(jumlahBuku / contentSize)

        if (page > jumlahPage) res.status(500).json({ error: true, message: "Jumlah page melebihi batas" })

        db.query(`SELECT * FROM buku LIMIT ${contentSize} OFFSET ${skip}`, (error, results) => {
            if (error) {
                res.status(500).json({
                    error: true,
                    message: "Terjadi kesalahan"
                })

                throw error
            }

            res.status(200).json({
                error: false,
                page,
                jumlahPage,
                data: results,
            })
        })
    })
})

app.get("/pilihan-buku", (req, res) => {
    db.query("SELECT id_buku, nama_buku FROM buku", (error, results) => {
        if (error) {
            res.status(500).json({
                error: true,
                message: "Terjadi kesalahan"
            })

            throw error
        }

        res.status(200).json({
            error: false,
            data: results
        })
    })
})

app.post("/peminjaman", (req, res) => {
    const { nama, idBuku, email, noTelp, tglPeminjaman, tglPengembalian } = req.body

    db.query("INSERT INTO peminjaman (nama_peminjam, id_buku, email, no_telp, tgl_peminjaman, tgl_pengembalian) VALUES (?, ?, ?, ?, ?, ?)", [nama, idBuku, email, noTelp, tglPeminjaman, tglPengembalian], (error, results) => {
        if (error) {
            res.status(500).json({
                error: true,
                message: "Terjadi kesalahan"
            })

            throw error
        }

        res.status(201).json({
            error: false,
            message: "Data berhasil ditambahkan"
        })
    })
})

app.get("/peminjaman", (req, res) => {
    db.query("SELECT peminjaman.id_peminjaman, peminjaman.nama_peminjam, buku.nama_buku, peminjaman.email, peminjaman.no_telp, peminjaman.tgl_peminjaman, peminjaman.tgl_pengembalian FROM peminjaman INNER JOIN buku ON peminjaman.id_buku = buku.id_buku", (error, results) => {
        if (error) {
            res.status(500).json({
                error: true,
                message: "Terjadi kesalahan"
            })

            throw error
        }

        res.status(200).json({
            error: false,
            data: results
        })
    })
})

app.get("/peminjaman/(:id)", (req, res) => {
    const id = req.params.id

    db.query(`SELECT * FROM peminjaman WHERE id_peminjaman = ${id}`, (error, results) => {
        if (error) {
            res.status(500).json({
                error: true,
                message: "Terjadi kesalahan"
            })

            throw error
        }

        res.status(200).json({
            error: false,
            data: results[0]
        })
    })
})

app.patch("/peminjaman/(:id)", (req, res) => {
    const idPeminjaman = req.params.id
    const { nama, idBuku, email, noTelp, tglPeminjaman, tglPengembalian } = req.body
    db.query("UPDATE peminjaman SET nama_peminjam = ?, id_buku = ?, email = ?, no_telp = ?, tgl_peminjaman = ?, tgl_pengembalian = ? WHERE id_peminjaman = ?", [nama, idBuku, email, noTelp, tglPeminjaman, tglPengembalian, idPeminjaman], (error, results) => {
        if (error) {
            res.status(500).json({
                error: true,
                message: "Terjadi kesalahan"
            })

            throw error
        }

        res.status(200).json({
            error: false,
            message: "Data berhasil diupdate"
        })
    })
})

app.delete("/peminjaman/(:id)", (req, res) => {
    const id = req.params.id

    db.query(`DELETE FROM peminjaman WHERE id_peminjaman = ${id}`, (error, results) => {
        if (error) {
            res.status(500).json({
                error: true,
                message: "Terjadi kesalahan"
            })

            throw error
        }

        res.status(200).json({
            error: false,
            message: "Data berhasil dihapus"
        })
    })
})

app.listen(port, () => {
    console.log(`Port ${port}`)
})