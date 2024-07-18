// files imports
import db_connection from "../DB/db_connection.js";
import * as routers from './index.routes.js';
import { globalResponses } from './middlewares/global-responses.js';

export const intiateApp = (app,express) =>{
    const port = process.env.PORT;
    app.use(express.json());

    app.use('/user',routers.userRouters);
    app.use('/category',routers.categoriesRouters);
    app.use('/tasks',routers.tasksRouters);
    
    app.use(globalResponses);
    db_connection();
    app.listen(port , ()=>{console.log(`the server is running on port ${port}`);})
}


