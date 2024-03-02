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

const createVerboseResponseFromOneQuestionPrompt = (request) => {
  const verbosePrompt = [
    {
      role: "user",
      content: `You are a paralegal assisting trial attorneys in drafting discovery responses, including interrogatories, requests for production and requests for admissions. Draft a response to the following request.  In responding, first state applicable objections.  Be sure to thoroughly include all possible, non-frivolous, objections.  Refer to our client, who is responding here, as 'Respondent'.  Begin each response with "RESPONDENT OBJECTS TO THE REQUEST" (or, where appropriate, "RESPONDENT FURTHER OBJECTS"  (which should always be uppercase and always start on a new line). Once you have stated the objections, then continue with 'SUBJECT TO AND WITHOUT WAIVING these objections, Respondent states as follows:' and state your substantive response. Do not preface or suffix your response with observations, notes, analysis or comments. Do not add any signature block, such as 'Executed on this __ day of _______, 20__.'.  Do not preface any response with numbering, such as 'RESPONSE NO. 1'. This is the request: ${request}`,
    },
  ];
  return verbosePrompt;
};

// create an array of the questions for a combined numbered type
const createArrayFromSingleDocPrompt = (request) => {
  console.log(">>9980989cteArrayFromSingleDocPrompt FIRED~~~~~~~~~~~~~~~~~~~");
  const parseRequestsPrompt = [
    {
      role: "user",
      content: `You are an AI paralegal assisting attorneys in drafting discovery requests.  Your firm represents the defendant in a lawsuit against it for an injury 
      allegedly sustained by the plaintiff.  To prevail, the plaintiff must prove that 1. your client owed him/her a duty of care, 2. breached that duty, and 
      3. the breach was the proximate (direct) cause of his/her 4. actual damages (actual damages must be proven).  It is the plaintiff’s duty to prove each of those elements.  
      It is not the defendant's duty to disprove them.  I will provide you with the complaint filed in court, then some technical instructions.  
      Review the complaint carefully. Asd you do,  think about the facts the plaintiff will need to prove to satisfy each of those four elements.  
      Then, draft 20 interrogatories. They should seek all evidence the plaintiff has in his/her possession to prove the claim. The technical instructions: return the 
      interrogatories in JSON format. The JSON should be in the form of an array of objects.  There should be one object for each interrogatory  The object should contain 
      two key/value pairs: first, “requestId":  this key's value will be a randomly generated version 4 UUID   The second key is ”text":  its value will be the substantive 
      content of the individual interrogatory.  This is an example sequence of three interrogatories:  [{ "requestId": "73a855af-4fdc-4b8b-9e7f-34d57a2c084a", 
      "text": "example - Please identify the person or persons responding to these Interrogatories, and identify each person who has provided information in connection 
      with these Interrogatories.”}, { "requestId": "36fe8375-240d-4a08-8a71-9b2ba5bda348", "text": "example - Identify the owner of the premises described in complaint."}, 
      { "requestId": "cfaf4a36-20de-44ff-8673-5a725bddca03", "text": "example - Identify any person not already named as a party to this lawsuit whom you contend caused 
      or contributed to the occurrence which you contend proximately caused your injuries and/or other damages .“}]. Lastly, please do not add introductory comments, analysis, 
      or observations.  Return only the interrogatories in the manner previously described.  This is the complaint: ${complaint}`,
    },
  ];
  return parseRequestsPrompt;
};

const createArrayOfInterrogatoriesPlaintiffPrompt = (complaint) => {
  const parseRequestsPrompt = [
    {
      role: "user",
      content: `You are an AI paralegal assisting attorneys in drafting discovery requests.  You represent the plaintiff in a negligence lawsuit.  To prevail, the plaintiff must satisfy these legal elements: 1) the defendant owed it a duty of care, 2) the defendant breached that duty; 3) which was the proximate cause of 4) plaintiff’s damages (typically physical injuries, may include losses stemming from injuries,  i.e. lost wages).  
      Your task is to draft interrogatories to the defendant.  I will provide technical instructions and the Complaint (for background).  Review the complaint carefully, thinking about the above legal elements stated, and what facts would satisfy them. Then, think about the information the defendant might possess that would satisfy them.  That is the information you seek.  
      The technical instructions: return interrogatories in JSON format. The JSON should be an array of objects, with one object for each interrogatory. An object will contain two key/value pairs: First key: “requestId", value: a random version 4 UUID   Second key is ”text",  its value is the individual interrogatory.  I will give you examples of the form.  They are hypothetical in substance,  (not necessarily similar to this case’s facts). 
      Use them to think about the legal writing style you’ll employ.  (Reference to paragraphs of a complaint in the examples are hypothetical and for illustration.  They do not refer to the facts in this case. However, if they are similar, you may reuse/paraphrase them.)  Accurately cite the complaint where appropriate.  Do not include foundational questions in your interrogatories, such as asking the respondent’s name, address, age, etc. These will be supplied elsewhere.  
      Do not add introductory comments, analysis, or observations, such as "Based on  your request, I have parsed the complaint and..,"  etc.  This will be problematic for later data processing. Here are the examples:
      [{ "requestId": "73a855af-4fdc-4b8b-9e7f-34d57a2c084a", "text": "Give a detailed statement of how you contend the occurrence took place, including where you were traveling from and traveling to, any stops made along the way, the date, time, location of the accident.”}, { "requestId": "36fe8375-240d-4a08-8a71-9b2ba5bda348", "text": "State whether you were the driver and/or owner of the vehicle involved in the occurrence on the date, 
      time and location as outlined in the Complaint. If you were not the driver, then state who you claim was driving the vehicle.”}, { "requestId": "cfaf4a36-20de-44ff-8673-5a725bddca03",
      "text": "If you were employed at the time of the occurrence, as indicated in the Complaint, and working within the scope of that employment when the occurrence took place, identify your employer and the nature of the work you were performing.“}].     This is the complaint: ${complaint}`,
    },
  ];
  return parseRequestsPrompt;
};

const createArrayOfInterrogatoriesDefendantPrompt = (complaint) => {
  const parseRequestsPrompt = [
    {
      role: "user",
      content: `You are an AI assistant and paralegal assisting trial attorneys in drafting discovery requests.  Your firm represents the defendant in a lawsuit against it for an injury sustained by the plaintiff.  To win, the plaintiff must show that the client owed it a duty of care, breached that duty, and the breach caused the plaintiff damages.  You draft interrogatories to be served on the plaintiff.  I will provide you with the complaint filed in court, then some technical instructions.  Review the complaint carefully and determine any potential defenses that would be available to the client. Then think about the information you would like to obtain during the discovery process in order to prove those defenses, or, alternatively, to refute the plaintiff’s complaint.  The technical instructions: review the complaint and return interrogatories in JSON format. The JSON should be in the form of an array of objects. There should be one object for each interrogatory  The object should contain two key/value pairs: first, “requestId" this key's value will be a randomly generated, version 4 UUID   The second key is ”text",  its value will be the substantive content of the individual interrogatory.  This is an example response to a hypothetical sequence of three requests:  [{ "requestId": "73a855af-4fdc-4b8b-9e7f-34d57a2c084a",
      "text": "example - request text would be set forth here.”}, { "requestId": "36fe8375-240d-4a08-8a71-9b2ba5bda348",
      "text": "example - request text would be set forth here."}, { "requestId": "cfaf4a36-20de-44ff-8673-5a725bddca03",
      "text": "example - request text would be set forth here.“}]. Some documents may contain sections preceding the requests. such as “Definitions”, “Instructions,” do not include definitions or instructions.  Return the questions only, do not respond to or answer the questions. Please note the following, as it is important:  some documents may have two kinds of requests - requests for production of documents, and interrogatories.  Sometimes the requests for production of documents may come first, then the interrogatories, or vice versa.  Please, be sure to include both the requests for produciton of documents and the interrogatory questions, regardless of which type comes first. Please, do not add introductory comments, analysis, or observations, such as "Based on  your request, I have parsed the document and..,"  etc.  Such comments will be problematic for later  processing of the data.
      This is the complaint: ${complaint}`,
    },
  ];
  return parseRequestsPrompt;
};

module.exports = {
  createArrayFromSingleDocPrompt,
  createResponseFromOneQuestionPrompt,
  createArrayOfInterrogatoriesPrompt,
  createVerboseResponseFromOneQuestionPrompt,
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
