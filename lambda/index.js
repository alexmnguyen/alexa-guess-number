/* eslint-disable  func-names */
/* eslint-disable  no-console */
/* eslint-disable  no-restricted-syntax */

const Alexa = require("ask-sdk");

const LaunchRequest = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.session.new ||
      handlerInput.requestEnvelope.request.type === "LaunchRequest"
    );
  },
  async handle(handlerInput) {
    const { attributesManager, responseBuilder } = handlerInput;

    return responseBuilder
      .speak(`Welcome to the big money guessing game. Say start to begin.`)
      .reprompt(
        "Say start once you've thought of a number and are ready for me to guess or no to quit."
      )
      .getResponse();
  }
};

const ExitHandler = {
  canHandle(handlerInput) {
    const { request } = handlerInput.requestEnvelope;

    return (
      request.type === "IntentRequest" &&
      (request.intent.name === "AMAZON.CancelIntent" ||
        request.intent.name === "AMAZON.StopIntent")
    );
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder.speak("Goodbye!").getResponse();
  }
};

const SessionEndedRequest = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === "SessionEndedRequest";
  },
  handle(handlerInput) {
    console.log(
      `Session ended with reason: ${
        handlerInput.requestEnvelope.request.reason
      }`
    );
    return handlerInput.responseBuilder.getResponse();
  }
};

const HelpIntent = {
  canHandle(handlerInput) {
    const { request } = handlerInput.requestEnvelope;

    return (
      request.type === "IntentRequest" &&
      request.intent.name === "AMAZON.HelpIntent"
    );
  },
  handle(handlerInput) {
    const speechOutput =
      "I am thinking of a number between zero and one hundred, try to guess and I will tell you" +
      " if it is higher or lower.";
    const reprompt = "Try saying a number.";

    return handlerInput.responseBuilder
      .speak(speechOutput)
      .reprompt(reprompt)
      .getResponse();
  }
};

/**
 * When we begin the game
 */
const StartIntent = {
  canHandle(handlerInput) {
    const { request } = handlerInput.requestEnvelope;

    return (
      request.type === "IntentRequest" && request.intent.name === "StartIntent"
    );
  },
  handle(handlerInput) {
    const { attributesManager, responseBuilder } = handlerInput;

    const sessionAttributes = attributesManager.getSessionAttributes();
    sessionAttributes.upperBound = 100;
    sessionAttributes.guess = 50;
    sessionAttributes.lowerBound = 0;

    return responseBuilder
      .speak("Is your number higher or lower than 50?")
      .reprompt("Try saying higher or lower.")
      .getResponse();
  }
};

/**
 * When a user indicates their number is higher
 */
const HigherIntent = {
  canHandle(handlerInput) {
    const { request } = handlerInput.requestEnvelope;

    return (
      request.type === "IntentRequest" && request.intent.name === "HigherIntent"
    );
  },
  handle(handlerInput) {
    const { attributesManager, responseBuilder } = handlerInput;

    //adjust the lower bound so that equals the last guess
    const sessionAttributes = attributesManager.getSessionAttributes();
    sessionAttributes.lowerBound = sessionAttributes.guess;

    //our guessed number becomes the midpoint of the upper and lower bound
    sessionAttributes.guess = Math.ceil(
      (sessionAttributes.upperBound + sessionAttributes.lowerBound) / 2
    );

    return responseBuilder
      .speak(
        `Is your number ${sessionAttributes.guess} or is it higher or lower?`
      )
      .reprompt(
        "Try saying yes if I guessed your number or higher or lower otherwise."
      )
      .getResponse();
  }
};

/**
 * When the user indicates that their number is lower
 */
const LowerIntent = {
  canHandle(handlerInput) {
    const { request } = handlerInput.requestEnvelope;

    return (
      request.type === "IntentRequest" && request.intent.name === "LowerIntent"
    );
  },
  handle(handlerInput) {
    const { attributesManager, responseBuilder } = handlerInput;

    //adjust the lower bound so that equals the last guess
    const sessionAttributes = attributesManager.getSessionAttributes();

    console.log(sessionAttributes);

    sessionAttributes.upperBound = sessionAttributes.guess;

    //our guessed number becomes the midpoint of the upper and lower bound
    sessionAttributes.guess = Math.ceil(
      (sessionAttributes.upperBound + sessionAttributes.lowerBound) / 2
    );

    return responseBuilder
      .speak(
        `Is your number ${sessionAttributes.guess} or is it higher or lower?`
      )
      .reprompt(
        "Try saying yes if I guessed your number or higher or lower otherwise."
      )
      .getResponse();
  }
};

const YesIntent = {
  canHandle(handlerInput) {
    const { request } = handlerInput.requestEnvelope;

    return (
      request.type === "IntentRequest" &&
      request.intent.name === "AMAZON.YesIntent"
    );
  },
  handle(handlerInput) {
    const { responseBuilder } = handlerInput;

    return responseBuilder.speak("Great! I found the big money.").getResponse();
  }
};

const NoIntent = {
  canHandle(handlerInput) {
    const { request } = handlerInput.requestEnvelope;

    return (
      request.type === "IntentRequest" &&
      request.intent.name === "AMAZON.NoIntent"
    );
  },
  async handle(handlerInput) {
    const { responseBuilder } = handlerInput;

    return responseBuilder.speak("Ok, see you next time!").getResponse();
  }
};

const UnhandledIntent = {
  canHandle() {
    return true;
  },
  handle(handlerInput) {
    const outputSpeech = "Say yes to continue, or no to end the game.";
    return handlerInput.responseBuilder
      .speak(outputSpeech)
      .reprompt(outputSpeech)
      .getResponse();
  }
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak("Sorry, I can't understand the command. Please say again.")
      .reprompt("Sorry, I can't understand the command. Please say again.")
      .getResponse();
  }
};

const skillBuilder = Alexa.SkillBuilders.standard();

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequest,
    ExitHandler,
    SessionEndedRequest,
    HelpIntent,
    YesIntent,
    NoIntent,
    StartIntent,
    HigherIntent,
    LowerIntent,
    UnhandledIntent
  )
  .addErrorHandlers(ErrorHandler)
  .withTableName("Guess-Number-Game")
  .withAutoCreateTable(true)
  .lambda();
