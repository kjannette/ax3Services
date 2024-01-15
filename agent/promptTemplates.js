/// this is used when you already ahve an array of questions -- plain old answers
const createResponseFromOneQuestionPrompt = (request) => {
  const regularPrompt = [
    {
      role: "user",
      content: `You are a paralegal assisting trial attorneys in drafting discovery responses, including interrogatories, requests for production and requests for admissions. Draft a response to the following request.  Include only objections, but thoroughly include all possible, non-frivolous, objections. Do not assume facts about the case.  Refer to our client, who is responding here, as 'Respondent'.  Begin each response with "RESPONDENT OBJECTS TO THE REQUEST" (or, where appropriate, "RESPONDENT FURTHER OBJECTS" which should always be uppersace and always start on a new line). Do not preface or suffix your response with observations, notes, analysis or comments. Do not add any  signature block, such as 'Executed on this __ day of _______, 20__.'.  Do not preface any response with numbering, such as 'RESPONSE NO. 1'. End each response with 'SUBJECT TO AND WITHOUT WAIVING these objections, Respondent states as follows:' then stop there, write nothing further. This is the request:${request}`,
    },
  ];
  return regularPrompt;
};

// create an array of the quesitons onn a combined numbered
const createArrayFromSingleDocPrompt = (request) => {
  console.log(
    ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>createArrayFromSingleDocPrompt FIRED~~~~~~~~~~~~~~~~~~~"
  );
  const parseRequestsPrompt = [
    {
      role: "user",
      content: `You are an AI assistant and paralegal assisting trial attorneys in drafting discovery responses.  As part of your job, you convert discovery request documents from text to other formats, such as JSON, for further processesing. I will provide you with some instructions, then a discovery request document (or a portion of one), and you will perform a parsing operation.
      The instructions: Review the discovery request document and return the numbered requests, and only the requests, as JSON.  Do not include any of the preamble or earlier sections of the document in your finished result.  This JSON should be in the following form: an array of objects. There should be one object for each numbered request.  The object should contain two key/value pairs: first, “requestId" this key's value will be a randomly generated, version 4 UUID   The second key is ”text",  its value will be the substantive  content of the individual request.  This is an example response to a hypothetical sequence of three requests:  [{ "requestId": "73a855af-4fdc-4b8b-9e7f-34d57a2c084a",
      "text": "example - request text would be set forth here.”}, { "requestId": "36fe8375-240d-4a08-8a71-9b2ba5bda348",
      "text": "example - request text would be set forth here."}, { "requestId": "cfaf4a36-20de-44ff-8673-5a725bddca03",
      "text": "example - request text would be set forth here.“}]. Some documents may contain sections preceding the requests. such as “Definitions”, “Instructions,” do not include definitions or instructions.  Return the questions only, do not respond to or answer the questions. Please note the following, as it is important:  some documents may have two kinds of requests - requests for production of documents, and interrogatories.  Sometimes the requests for production of documents may come first, then the interrogatories, or vice versa.  Please, be sure to include both the requests for produciton of documents and the interrogatory questions, regardless of which type comes first. Please, do not add introductory comments, analysis, or observations, such as "Based on  your request, I have parsed the document and..,"  etc.  Such comments will be problematic for later  processing of the data.
      This is partof a request document: ${request}`,
    },
  ];
  return parseRequestsPrompt;
};

module.exports = {
  createArrayFromSingleDocPrompt,
  createResponseFromOneQuestionPrompt,
};

/*

this is used for combined-numbered  -- skip right to answers no middle of parsing out the quesitons into an array
const singleDocPrompt = [
  {
    role: "user",
    content: `You are a paralegal assisting trial attorneys in drafting discovery, including responses to interrogatories and requests for production of documents. 
      Draft a response to the discovery request I will give you, 
      after some instructions.  The instructions: Respond 
      to each request, wether it is an interrogatory or a request for production.  Include only objections, but thoroughly include all possible, 
      non-frivolous objections. Do not assume facts about the case.  Refer to your client,  the party 
      responding here, as 'Respondent'.  Begin each response with "RESPONDENT OBJECTS TO THE REQUEST (or, where appropriate, 
      "RESPONDENT FURTHER OBJECTS").  End each response with 'SUBJECT TO AND WITHOUT WAIVING these 
      objections, Respondent states as follows:'. Your overall response should be in the form of an array, containing 
      one JSON object for each discrete response.  This JSON object 
      should contain two key/value pairs with the following data: 1.  A “requestId,” the value for this key 
      will be a randomly-generated version 4 UUID, and 2. "text,"  the value for this key will be your 
      substantive response,  This is an example to  
      illustrate form, it exemplifies a hypothetical response sequence : [{ requestId: 73a855af-4fdc-4b8b-9e7f-34d57a2c084a, 
      text: 'example - response text would be stated here'}, { requestId: 16e82593-0b71-4c1a-9c3c-04f54ec4db9a, 
      text: 'example - response text would be stated here'}, { requestId: 0fe87371-bee8-439d-a672-bff256c75d43,
      text: 'example - response text’ would be stated here'}].  That concludes the instructions.
      This is the request: ${request}`,
  },
];
*/
