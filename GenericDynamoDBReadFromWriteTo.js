/*
This AWS Lambda is intended to read the following items:

from the passed in dynamoDBReadFromTableName and MCPSKUID's passed in value of dynamoDBReadFromPrimaryKeyValue.
It will then write the resulting read items to the passed in table name dynamoDBWriteToTableName to the MCPOrderItemID passed in value of MCPOrderItemID.

Example of passed in values:
{
"dynamoDBReadFromTableName":"MCPSKU-CustomsPartKey-Dev",
"dynamoDBReadFromTablePrimaryKeyName":"MCPSKUID",
"dynamoDBReadFromTabkePrimaryKeyValue":"MCP1487899048896",
"dynamoDBColumnsItemsToRead":"[CustomsPartKey,EffectiveDateCountryOfOrigin,ItemWeightLbs]",
"dynamoDBWriteToTableName":"MCPOrderItemData-Dev",
"dynamoDBWriteToTablePrimaryKeyName":"MCPOrderItemID",
"dynamoDBWriteToTablePrimaryKeyValue":"MCP1487898819681"
}
*/


'use strict';

const AWS = require('aws-sdk');
const DOC = require('dynamodb-doc');
const docClient = new AWS.DynamoDB.DocumentClient({ region: 'eu-west-1' });

exports.handler = function(event, context, callback) {

    // Set local variables to passed in variables 
    var dynamoDBReadFromTableName = event.dynamoDBReadFromTableName;
    var dynamoDBReadFromTablePrimaryKeyName = event.dynamoDBReadFromTablePrimaryKeyName;
    var dynamoDBReadFromTabkePrimaryKeyValue = event.dynamoDBReadFromTabkePrimaryKeyValue;
    var dynamoDBColumnsItemsToRead = event.dynamoDBColumnsItemsToRead;
    var dynamoDBWriteToTableName = event.dynamoDBWriteToTableName;
    var dynamoDBWriteToTablePrimaryKeyName = event.dynamoDBWriteToTablePrimaryKeyName;
    var dynamoDBWriteToTablePrimaryKeyValue = event.dynamoDBWriteToTablePrimaryKeyValue;


    // Write out to the log the passed in variable
    console.log('dynamoDBReadFromTableName = ' + dynamoDBReadFromTableName);
    console.log('dynamoDBReadFromTablePrimaryKeyName = ' + dynamoDBReadFromTablePrimaryKeyName);
    console.log('dynamoDBReadFromTabkePrimaryKeyValue = ' + dynamoDBReadFromTabkePrimaryKeyValue);
    console.log('dynamoDBColumnsItemsToRead = ' + dynamoDBColumnsItemsToRead);
    console.log('dynamoDBWriteToTableName = ' + dynamoDBWriteToTableName);
    console.log('dynamoDBWriteToTablePrimaryKeyName = ' + dynamoDBWriteToTablePrimaryKeyName);
    console.log('dynamoDBWriteToTablePrimaryKeyValue = ' + dynamoDBWriteToTablePrimaryKeyValue);

    // Read MCP SKU data from MCPSKU-CustomsPartKey
    //      Create the Parameters that are used by the GET call
    //      Create an object and set it using the object[property] notation so that the property name and value can be used in the params
    console.log('reached here');
    var keyRead = {};
    keyRead[dynamoDBReadFromTablePrimaryKeyName] = dynamoDBReadFromTabkePrimaryKeyValue;
    var dynamoDBTableReadFromParameters = {
        TableName: dynamoDBReadFromTableName,
        Key: keyRead,
        AttributesToGet: [
            'CustomsPartKey',
            'EffectiveDateCountryOfOrigin',
            'ItemWeightLbs'
        ],

    };
    //      Use the GET call  to read the MCP SKU data
    docClient.get(dynamoDBTableReadFromParameters, function(err, dataReadFromDynamoDbtable) {
        if (err) {
            console.log(err, err.stack);
        } else {
            console.log(dataReadFromDynamoDbtable)
        }

        // Write the MCP SKU data to the MCPOrderItemData table
        //      Create the Parameters that are used by the GET call
        //      Create an object and set it using the object[property] notation so that the property name and value can be used in the params
        var keyWrite = {};
        keyWrite[dynamoDBWriteToTablePrimaryKeyName] = dynamoDBWriteToTablePrimaryKeyValue;
        var dynamoDBtableUpdateToParameters = {
            TableName: dynamoDBWriteToTableName,
            Key: keyWrite,
            UpdateExpression: 'set CustomsPartKey = :A, EffectiveDateCountryOfOrigin = :B,ItemWeightLbs =:C',
            ExpressionAttributeValues: {
                ':A': dataReadFromDynamoDbtable.Item.CustomsPartKey,
                ':B': dataReadFromDynamoDbtable.Item.EffectiveDateCountryOfOrigin,
                ':C': dataReadFromDynamoDbtable.Item.ItemWeightLbs
            }
        };

        // Update the MCPOrderItemData with the data
        docClient.update(dynamoDBtableUpdateToParameters, function(err, dataReadFromDynamoDbtable) {
            if (err)
                console.log(err, err.stack);
            else {
                let dataWrittenToDynamoDBTable = JSON.stringify(dataReadFromDynamoDbtable, null, 4);
                console.log(dataWrittenToDynamoDBTable);
            }
        });
    });
};