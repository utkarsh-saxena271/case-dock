import app from './src/app.js'
import dotenv from 'dotenv'
dotenv.config()

const Port = process.env.PORT || 3000;


app.listen(Port,()=>{
    console.log("Server is running on port: "+Port)
})