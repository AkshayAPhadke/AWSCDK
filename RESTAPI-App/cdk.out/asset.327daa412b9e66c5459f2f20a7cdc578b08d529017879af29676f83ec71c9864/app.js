exports.handler = async(event,context) => {

    const todoDailyTasks = [
        {
            Task:
             "Taking Meal",
             Id: "1",
        },
        {
            Task:
            "Preparing Dinner",
            Id:"2",
        },
        
    ];

    var item = todoDailyTasks[Math.floor(Math.random() * todoDailyTasks.length)];
    return {
        statusCode: 200,
        header: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
    };
}