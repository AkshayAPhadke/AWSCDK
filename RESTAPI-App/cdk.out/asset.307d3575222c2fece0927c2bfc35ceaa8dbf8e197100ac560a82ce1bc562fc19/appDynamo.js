const AWS = require('aws-sdk');
let dynamo = new AWS.DynamoDB.DocumentClient();

const MY_TABLE = process.env.MY_TABLE;  // env settings for the dynnamoDB Table 

 exports.handler = async(event,context) =>{
    console.log("Event is Triggered :" , event);
    let path = event.resource;
    let httpMethod = event.httpMethod;
    let route = httpMethod.concat(" ").concat(path);

    let data = JSON.parse(event.body);
    let body;
    let statusCode = 200;
    try{
        switch(route) {
            case "GET /todo":
            body = await listTodo();
            break;
            case  "POST /todo":
                body = await saveDailytasks(data);
                break;
            case "DELETE /todo/{id}":
            body = await deleteDailyTasks(event.pathParameters.id);
            break;
                default :
                 throw new Error(`Unspported Route :"${route}"`)
                }
    }
    catch(error)
    {
        console.log(error);
        statusCode = 400 ;
        body = error.messages;
    }
    finally{
        console.log(body);
        body = JSON.stringify(body);
    }


    return sendResponse(200,body);

 };


 async function deleteDailyTasks(id)
 {
    const params = {
        TableName : MY_TABLE,
        Key:{
            id: id
        }
    }
    return dynamo.delete(params)
                    .promise()
                    .then(()=>{
                    return id;
                    })
 }
async function listTodo()
{
    const params ={
        TableName : MY_TABLE
    }

    return dynamo.scan(params)
                .promise()
                .then((data)=>{
                    return data.Items;
                })
}


    async function saveDailytasks(data)
    {
        const date = new Date();
        const time = date.getTime();

        const dailyTasks = {
            id : time.toString(),  //34545678
            tasks: data.tasks, // having dinner
            by : data.by //Akshay
        }

        const param = {
            TableName : MY_TABLE,
            Item: dailyTasks
        }

        return dynamo.put(param)
                    .promise()
                    .then(()=> {
                        return dailyTasks;
                    })
    }


    const sendResponse = (status,body) => {
        var response = {
            statusCode: status,
            headers: {
                "Content-Type": "application/json"
            },
            body
        }
        return response; 
    }
