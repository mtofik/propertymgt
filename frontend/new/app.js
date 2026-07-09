const myexpress = require("express");
const connection = require("./db");
const cors = require("cors");
require("colors");
const path = require("path");

const app  = myexpress();
const port  = process.env.PORT || 3000;

app.use(myexpress.json());
app.use(cors());
app.use(myexpress.static(path.join(__dirname,"public")));

app.get('/student', (req,res)=>{
    let selectAll = 'select * from student';
    connection.query(selectAll, (err, result)=>{
        if(err){
            console.error("database query error:".red, err);
            res.status(500).json({error: 'Database error'});
        }else{
            console.table(result);
            res.json(result);
        }
    });
});

app.get('/student/limit', (req,res)=>{
    let selectSpecific = 'select * from student LIMIT 3';
    connection.query(selectSpecific, (err, result)=>{
        if(err){
            console.error("database query error:".red, err);
            res.status(500).json({error: 'Database error'});
        }else{
            console.table(result);
            res.json(result);
        }
    });
});

app.get('/student/:a', (req,res)=>{
    let selectSpecific = `select * from student where id = ${req.params.a}`;
    connection.query(selectSpecific, (err, result)=>{
        if(err){
            console.error("database query error:".red, err);
            res.status(500).json({error: 'Database error'});
        }else{
            console.table(result);
            res.json(result);
        }
    });
});

app.get('/student/name/:b', (req,res)=>{
    let selectSpecific = `select * from student where name = '${req.params.b}'`;
    connection.query(selectSpecific, (err, result)=>{
        if(err){
            console.error("database query error:".red, err);
            res.status(500).json({error: 'Database error'});
        }else{
            console.table(result);
            res.json(result);
        }
    });
});

app.post('/student/register', (req,res)=>{
    const {name, age} =req.body;

    if(!name || !age){
        return res.status(400).json({error: 'Name and age are required'});
    }
    let insertUser = `insert into student (name, age) values (?, ?)`;
    connection.query(insertUser, [name, age], (err, result)=>{
        if(err){
            console.error("Error inserting student:".red, err);
            // if(err.code === 'ER_DUP_ENTRY'){
            //     return res.status(409).json({error: 'Age already exists'});
            // }
            return res.status(500).json({error: 'Database error'});
        }
        console.log('✔ Student registered successfully'.green, result);
        res.status(201).json({
            success: true,
            message: 'student registered successfully',
            studentId: result.insertId,
            name: name,
            age: age
        });
    });
});

// app.delete('/student/delete/:id', (req,res)=>{
//     const studentId =req.params.id;

//     if(!studentId || isNaN(studentId)){
//         return res.status(400).json({error: 'Valid student ID is required'});
//     }
//     let deleteStudent = 'Delete from student where id = ?';
//     connection.query(deleteStudent, [studentId], (err, result)=>{
//         if(err){
//             console.error("Error deleting student:".red, err);
//             return res.status(500).json({error: 'Database error'});
//         }
//         if(result.affectedRows === 0){
//             return res.status(404).json({error: 'Student not found'});
//         }
//         console.log('Student deleted successfully'.green, result);
//         res.status(200).json({
//             success: true,
//             message: 'student deleted successfully',
//             studentId: studentId,
//             affectedRows: result.affectedRows
//         });
//     });
// });

app.delete('/student/delete', (req,res)=>{
    // const studentId =req.params.id;
    const {id} =req.body;

    if(!id || isNaN(id)){
        return res.status(400).json({error: 'Valid student ID is required'});
    }
    let deleteStudent = 'Delete from student where id = ?';
    connection.query(deleteStudent, [id], (err, result)=>{
        if(err){
            console.error("Error deleting student:".red, err);
            return res.status(500).json({error: 'Database error'});
        }
        if(result.affectedRows === 0){
            return res.status(404).json({error: 'Student not found'});
        }
        console.log('Student deleted successfully'.green, result);
        res.status(200).json({
            success: true,
            message: 'student deleted successfully',
            studentId: id,
            affectedRows: result.affectedRows
        });
    });
});

app.put('/student/update', (req,res)=>{
    //const studentId =req.params.id;
    const {id, name, age} =req.body;

    console.log(id);
    console.log(name);
    console.log(age);

    if(!id || isNaN(id)){
        return res.status(400).json({error: 'Valid student ID is required'});
    }
    if(!name || !age){
        return res.status(400).json({error: 'Name and age are required'});
    }
    let updateStudent = 'Update student set name = ?, age = ? where id = ?';
    connection.query(updateStudent, [name.trim(), age, id], (err, result)=>{
        if(err){
            console.error("Error updating student:".red, err);
            return res.status(500).json({error: 'Database error'});
        }
        if(result.affectedRows === 0){
            return res.status(404).json({error: 'Student not found'});
        }
        console.log('Student updated successfully'.green, result);
        res.status(200).json({
            success: true,
            message: 'student updated successfully',
            studentId: id,
            name: name,
            age: age,
            affectedRows: result.affectedRows
        });
    });
});


app.listen(port, (err)=>{
    console.log(`server running on port ${port}`.green);
})