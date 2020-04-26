interface Start {
    startDate: Date;
    endDate: Date;
    symbols: [string]
}

function seconds(args: Start)
{
    // Get symbols, 
    // Check all symbols market data if exit
    // Emit all that exist
    // 
    console.log('second is ');
}

setInterval(seconds, 1000);