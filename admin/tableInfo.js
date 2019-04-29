const { Observable } = require("rxjs/Observable")


function getInfosObservable(con, table_name){
    const getColumnsQuery = "SELECT column_name, data_type, IS_NULLABLE FROM " +
                            "INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = \"" + table_name+"\""
    console.log(getColumnsQuery)
    return Observable.create(subscriber => {
        con.query(getColumnsQuery, (err, results, fields) => {
            if(err){
                subscriber.error(err)
            }else{
                subscriber.next(results);
            }
            subscriber.complete();
        })
    })
}

module.exports.getInfosObservable = getInfosObservable