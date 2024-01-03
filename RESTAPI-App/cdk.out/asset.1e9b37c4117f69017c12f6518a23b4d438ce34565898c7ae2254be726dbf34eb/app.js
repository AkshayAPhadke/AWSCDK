exports.handler = async(event,context) => {

    const todoDailyTasks = [
        {
            Task:
             "Taking Meal",
             Id: 1
        },
        {
            Task:
            "Preparing Dinner",
            Id:2
        },
        {
            Task:
            "Studying",
            Id:3
        },
        {
            Task:
            "Watching TV",
            Id:4
        },
        {
            Task:
            "Making Bed",
            Id:5
        },
    ];

    var item = todoDailyTasks[Math.floor(Math.random() * todoDailyTasks.length)];
    return {
        statusCode:200,
        header:{"content-Type" : "application/json"},
        body:JSON.stringify(item),
    }
}