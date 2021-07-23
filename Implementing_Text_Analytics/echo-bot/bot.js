// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityHandler, MessageFactory } = require('botbuilder');
const { TextAnalyticsClient, AzureKeyCredential } = require("@azure/ai-text-analytics");

class EchoBot extends ActivityHandler {
    constructor() {
        super();

        // Create key, endpoint, and textAnalyticsClient
        const key = 'Your text analytics key';
        const endpoint = 'Your text analytics endpoint';
        const textAnalyticsClient = new TextAnalyticsClient(endpoint,  new AzureKeyCredential(key));

        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        this.onMessage(async (context, next) => {
            const replyText = `Echo: ${ context.activity.text }`;
            await context.sendActivity(MessageFactory.text(replyText, replyText));

            // Call the sentimentAnalysis function on the context text
            await sentimentAnalysis(textAnalyticsClient,context.activity.text );

            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });

        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            const welcomeText = 'Hello and welcome!';
            for (let cnt = 0; cnt < membersAdded.length; ++cnt) {
                if (membersAdded[cnt].id !== context.activity.recipient.id) {
                    await context.sendActivity(MessageFactory.text(welcomeText, welcomeText));
                }
            }
            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });

        // Create a function to call the text analytics analyzeSentiment method
         async function sentimentAnalysis(client,userText){
                console.log("Running sentiment analysis on: " + userText);
                // Make userText into an array
                const sentimentInput = [ userText ];
                // call analyzeSentiment and get results
                const sentimentResult = await client.analyzeSentiment(sentimentInput);
                console.log("Got sentiment result");

                // This is where you send the sentimentInput and sentimentResults to a database or storage instead of the console

                sentimentResult.forEach(document => {
                    console.log(`ID: ${document.id}`);
                    console.log(`\tDocument Sentiment: ${document.sentiment}`);
                    console.log(`\tDocument Scores:`);
                    console.log(`\t\tPositive: ${document.confidenceScores.positive.toFixed(2)} \tNegative: ${document.confidenceScores.negative.toFixed(2)} \tNeutral: ${document.confidenceScores.neutral.toFixed(2)}`);
                    console.log(`\tSentences Sentiment(${document.sentences.length}):`);
                    document.sentences.forEach(sentence => {
                        console.log(`\t\tSentence sentiment: ${sentence.sentiment}`)
                        console.log(`\t\tSentences Scores:`);
                        console.log(`\t\tPositive: ${sentence.confidenceScores.positive.toFixed(2)} \tNegative: ${sentence.confidenceScores.negative.toFixed(2)} \tNeutral: ${sentence.confidenceScores.neutral.toFixed(2)}`);
                    });
                });
            }

    }
}

module.exports.EchoBot = EchoBot;
