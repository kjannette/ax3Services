const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

//Main Type IDs
const antiTrustId = "4ec2ef5b-8f0f-4e8a-ad03-5d5cd14effb2";
const classActionId = "142a83b4-354e-4b64-b512-dc3cc6434c30";
const contractId = "cca3094f-a191-4fbb-bbcd-46bfea3ce594";
const defemationId = "c94b2e40-9b26-4c36-b09a-84234be7e4f8";
const employmentId = "8eba99c8-fc01-41e6-bad4-667957b8477f";
const familyLawId = "8e591ed5-ca8e-4569-b1a8-c664dcd678c8";
const landlordTenantId = "9e21a41f-3878-4300-8618-a964aeff0d84";
const legalMalpracticeId = "99501ae9-7045-4843-b2e9-926bf866abd9";
const medicalMalpracticeId = "a282768e-ae02-4baf-b0bb-5cb321ff8834";
const personalInjuryId = "77e0a0bc-2062-432b-9b58-578bbe24dc32";
const productLiabilityId = "99c5e042-e67a-44e9-ab7b-47d152378bd3";
const propertyId = "731d719d-53a1-4995-b210-48cb3d1aaeb3";
const securitiesId = "f5abebeb-b82f-4ce7-a1bd-a993a6563f5e";
const tortId = "e88b3028-8e9e-480e-9bbe-b875d8d8be6a";
const workersCompensationId = "f1b20367-fe5e-40e2-8405-3ad607cf6b25";

const mainTypeArray = [
  { name: "antitrust", id: antiTrustId },
  { name: "class action", id: classActionId },
  { name: "contract", id: contractId },
  { name: "defemation", id: defemationId },
  { name: "employment", id: employmentId },
  { name: "family law", id: familyLawId },
  { name: "landlord tenant", id: landlordTenantId },
  { name: "legal malpractice", id: legalMalpracticeId },
  { name: "medical malpractice", id: medicalMalpracticeId },
  { name: "personal injury", id: personalInjuryId },
  { name: "product liability", id: productLiabilityId },
  { name: "property", id: propertyId },
  { name: "securities", id: securitiesId },
  { name: "tort", id: tortId },
  { name: "workers' compensation", id: workersCompensationId },
];
const tagStrings = [
  "antitrust",
  "antitrust - bid rigging",
  "antitrust - price fixing",
  "antitrust  - tying arrang",
  "antitrust  - exclusionary conduct",
  "antitrust  - mergers",
  "antitrust  - monopoly",
  "antitrust  - monopoly leverage",
  "antitrust  - market allocation",
  "antitrust  - group boycott",
  "antitrust  - unfair compet",
  "antitrust  - price discrim",
  "antitrust  - customer alloc",
  "class action",
  "class action - defect product",
  "class action - consumer",
  "class action - consumer fraud",
  "class action - environment",
  "class action - employment",
  "class action - dangerous drugs",
  "class action - roundup",
  "class action - civil rights",
  "class action - decept bus prac",
  "class action - securities fraud",
  "contract",
  "contract -  actual breach ",
  "contract - anticipatory breach",
  "contract - duress",
  "contract - real estate",
  "contract - equitable claims",
  "comtract - material breach",
  "contract - implied contract",
  "contract - mistake",
  "contract - rescission",
  "contract - specific performance",
  "contract - fraud",
  "contract - ucc",
  "contract - unconscionability",
  "contract - unit price",
  "defemation",
  "employment",
  "employment - fail grant reas accommd",
  "employment - ableism",
  "employment - age discrimination",
  "employment - fam/med leave act",
  "employment - gender discrimination",
  "employment - harassment",
  "employment - payment mistake",
  "employment - racial discrimination",
  "employment - religious discrimination",
  "employment - retaliation",
  "employment - unpaid wages",
  "employment - sexual orient discrim",
  "employment -   wage/hour violation",
  "employment - wrongfule termination",
  "family law",
  "family law - alimony",
  "family law - child support",
  "family law - general",
  "family law - divorce",
  "family law - custoday",
  "family law - paternity",
  "family law - property division",
  "family law - termin parental rights",
  "family law - juvenile matter",
  "family law - legal separation",
  "family law - marriage dissolution",
  "family law - spousal support",
  "landlord tenant",
  "landlord tenant - breach quiet enjoy",
  "landlord tenant - fail pay rent",
  "landlord tenant - holdover",
  "landlord tenant - breach of lease",
  "landlord tenant - damages after term lease",
  "landlord tenant - rent escrow",
  "landlord tenant - retaliatory eviction",
  "landlord tenant - security deposit",
  "landlord tenant" - "wrongful detainer",
  "legal malpractice",
  "legal malpractice - conflict of interest",
  "legal malpractice - missed deadlines",
  "legal malpractice - inadequate discovery",
  "legal malpractice - failure to comm",
  "legal malpractice - fail to file docs",
  "legal malpractice - statute of limits",
  "legal malpractice - negligence",
  "legal malpractice - fraud",
  "legal malpractice - lack of consent",
  "legal malpractice - confidentiality",
  "legal malpractice - mishandling funds",
  "legal malpractice - incorrect claim/def",
  "legal malpractice - ethical violat",
  "legal malpractice - excessive fees",
  "legal malpractice - fail introd evid",
  "legal malpractice - planning error",
  "medical malpractice",
  "medical malpractice - anesthesia",
  "medical malpractice - birth injury",
  "medical malpractice - failure to treat",
  "medical malpractice - surg instrument",
  "medical malpractice - fail to diagnose",
  "medical malpractice - inadequate",
  "medical malpractice - bedsores",
  "medical malpractice - misdiagnosis",
  "medical malpractice - hospital",
  "medical malpractice - early discharge",
  "medical malpractice - unneeded surgery",
  "medical malpractice - impproper treatment",
  "medical malpractice - incorrect procedure",
  "medical malpractice - amputation error",
  "personal injury",
  "personal injury - tort",
  "personal injury - premises liability",
  "personal injury - auto accident",
  "personal injury - truck accident",
  "personal injury - construction",
  "personal injury - wrongful death",
  "personal injury - boating",
  "personal injury - public transportation",
  "personal injury - catastrophic injury",
  "personal injury - aviation",
  "personal injury - negligence",
  "personal injury - dog bite",
  "personal injury - product liab",
  "personal injury - brain injury",
  "personal injury - fall - trip",
  "personal injury - fall - other",
  "personal injury - fall - slip",
  "personal injury - nursing home",
  "personal injury - burn injury",
  "personal injury - rideshare",
  "personal injury - lost wages",
  "personal injury - loss consortium",
  "product liability",
  "product liability - design defec",
  "product liability - manufac def",
  "product liability - defect marketing",
  "product liability - strict liab",
  "product liability - fail to warn",
  "product liability - breach warranty",
  "product liability - negligence",
  "product liability - dangerous drug",
  "product liability - medical device",
  "product liability - misrepresentation",
  "product liability - hidden defect",
  "product liability - household product",
  "property",
  "property - boundary dispute",
  "property - zoning",
  "property - breach contract",
  "property - adverse possession",
  "property - partition",
  "property - title",
  "property - chattels",
  "securities",
  "securities - breach fiduciary duty",
  "securities - churning",
  "securities - conflict of interest",
  "securities - fail to diversify",
  "securities - fail to supervise",
  "securities - fraudulent misrep",
  "securities - malpractice",
  "securities - margin call",
  "securities - market manipulation",
  "securities - negligence",
  "securities - risk management",
  "securities - switching",
  "securities - outside activity",
  "securities - unauthorized trading",
  "securities - unsuitability",
  "tort",
  "tort - assault",
  "tort - battery",
  "tort - conversion",
  "tort - animal",
  "tort - false imprisonment",
  "tort - intentional",
  "tort - intent inflict emot dist",
  "tort - invasion of privacy",
  "tort - negligence",
  "tort - damage to chattels (intentional)",
  "tort - trespass",
  "workers' compensation",
  "workers' compensation - repetitive trauma",
  "workers' compensation - stress related inj",
  "workers' compensation - occupational disease",
  "workers' compensation - medical care benefits",
  "workers' compensation - partial disability",
  "workers' compensation - total disability",
  "workers' compensation - death benifits",
  "workers' compensation - vocational rehab ben",
  "workers' compensation - traumatic",
  "workers' compensation - recurrence",
  "workers' compensation - consequential",
  "workers' compensation - intervening",
];

let caseTagArray = [];

tagStrings.forEach((string) => {
  const tagId = uuidv4();
  const subId = uuidv4();
  const tagName = string;
  let subType;
  if (typeof string === "string") {
    const temp = string.split("-");
    const mainType = temp[0].trim();
    let mainTypeId;
    const temprz = mainTypeArray.filter((type) => {
      if (mainType == type.name) {
        mainTypeId = type.id;
      }
    });
    const subTemp = temp[1];
    if (typeof subTemp === "string") {
      subType = subTemp.trim();
    }
    let obj = {};
    obj["tagId"] = tagId;
    obj["tagName"] = tagName;
    obj["mainType"] = { name: mainType, id: mainTypeId };
    if (subType) {
      obj["subType"] = { name: subType, subTypeId: subId };
    }
    caseTagArray.push(obj);
  }
});

console.log(caseTagArray);
const data = JSON.stringify(caseTagArray);
fs.writeFile(`caseTags.json`, data, function (err) {
  if (err) {
    return console.log("Error writing caseTagArray", err);
  }
});
