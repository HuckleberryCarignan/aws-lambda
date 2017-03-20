/*
This AWS Lambda is intended to read the following items:
            'CustomsPartKey',
            'EffectiveDateCountryOfOrigin',
            'ItemWeightLbs'
from the passed in dynamoDBReadFromTableName and MCPSKUID's passed in value of dynamoDBReadFromPrimaryKeyValue.
It will then write the resulting read items to the passed in table name dynamoDBWriteToTableName to the MCPOrderItemID passed in value of MCPOrderItemID.

Example of passed in values:
{
"dynamoDBReadFromTableName":"MCPSKU-CustomsPartKey-Dev",
"dynamoDBReadFromPrimaryKeyValue":"MCP1487899048896",
"dynamoDBWriteToTableName":"MCPOrderItemData-Dev",
"dynamoDBWriteToPrimaryKeyValue":"MCP1487898819681"
}

*/

'use strict';

const AWS = require('aws-sdk');
const DOC = require('dynamodb-doc');
const docClient = new AWS.DynamoDB.DocumentClient({ region: 'eu-west-1' });

exports.handler = function(event, context, callback) {

    // Set local variables to passed in variables 
    var dynamoDBReadFromTableName = event.dynamoDBReadFromTableName;
    var dynamoDBReadFromPrimaryKeyValue = event.dynamoDBReadFromPrimaryKeyValue;
    var dynamoDBWriteToTableName = event.dynamoDBWriteToTableName;
    var dynamoDBWriteToPrimaryKeyValue = event.dynamoDBWriteToTableName;

    // Read MCP SKU data from MCPSKU-CustomsPartKey
    //      Create the Parameters that are used by the GET call
    let dynamoDBTableReadFromParameters = {
        TableName: dynamoDBReadFromTableName,
        Key: {
            'MCPSKUID': dynamoDBReadFromPrimaryKeyValue
        },
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

            // Write the MCP SKU data to the MCPOrderItemData table
            //      Create the Parameters that are used by the GET call
            let dynamoDBtableUpdateToParameters = {
                TableName: dynamoDBWriteToTableName,
                Key: {
                    'MCPOrderItemID': dynamoDBWriteToPrimaryKeyValue
                },
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

        }
    });
};